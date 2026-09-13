import { generateKeyPairSync } from 'node:crypto';
import { beforeEach, afterEach, expect, test, vi } from 'vitest';
import { browser } from 'wxt/browser';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { appStorage, defaultSettings, serializeCredentials } from '../src/extension/utils/storage';
import { RemoteCredentials } from '../src/lib/remote/credentials';
import { WidevineClientCredentials } from '../src/lib/widevine/client-credentials';
import {
  ClientIdentification,
  DrmCertificate,
  SignedDrmCertificate,
} from '../src/lib/widevine/proto';
import { parseCredentialsFiles } from '../src/extension/entrypoints/popup/utils/credential-import';

beforeEach(() => fakeBrowser.reset());
afterEach(() => vi.restoreAllMocks());

const remote = (device = 'one') =>
  RemoteCredentials.from({
    keySystem: 'com.widevine.alpha',
    baseUrl: 'https://cdm.test',
    secret: 'test-secret',
    credentials: device,
    label: 'Same label',
  });

const widevine = async (serial: number) => {
  const { privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
    publicKeyEncoding: { type: 'spki', format: 'pem' },
  });
  const credentials = new WidevineClientCredentials(
    ClientIdentification.create({
      token: SignedDrmCertificate.encode(
        SignedDrmCertificate.create({
          drmCertificate: DrmCertificate.encode(
            DrmCertificate.create({
              systemId: 1,
              serialNumber: new Uint8Array([serial]),
            }),
          ).finish(),
        }),
      ).finish(),
      clientInfo: [
        { name: 'company_name', value: 'Test' },
        { name: 'model_name', value: 'Device' },
      ],
    }),
  );
  await credentials.importKey(privateKey);
  return credentials;
};

test('same-model provisions retain distinct IDs across selection, export, reload and removal', async () => {
  const first = await widevine(1);
  const second = await widevine(2);
  expect(first.filename).toBe(second.filename);
  await appStorage.credentials.import(first);
  const imported = await appStorage.credentials.import(second);
  const [one, two] = imported.credentials;
  expect(one!.id).not.toBe(two!.id);
  await appStorage.credentials.select(two!.id);
  const restored = await appStorage.credentials.getSnapshot();
  expect(restored.activeCredentialsId).toBe(two!.id);
  expect(await restored.credentials[1]!.credentials.pack()).toEqual(await second.pack());
  const remaining = await appStorage.credentials.remove(two!.id);
  expect(remaining.credentials.map((entry) => entry.id)).toEqual([one!.id]);
  expect(remaining.activeCredentialsId).toBe(one!.id);
  expect(await (await appStorage.credentials.active.getValue())!.pack()).toEqual(
    await first.pack(),
  );
  await appStorage.credentials.remove(one!.id);
  expect(await appStorage.credentials.getSnapshot()).toEqual({
    credentials: [],
    failedCredentials: [],
    activeCredentialsId: null,
  });
  expect(await appStorage.credentials.active.getValue()).toBeNull();
});

test('migrates mixed legacy formats and matches the active provision by content', async () => {
  const first = await widevine(1);
  const second = await widevine(2);
  const firstInfo = await serializeCredentials(first);
  const secondInfo = await serializeCredentials(second);
  if (firstInfo.type !== 'wvd') throw new Error('Expected Widevine');
  const legacy = JSON.stringify([firstInfo.data, secondInfo, secondInfo]);
  await browser.storage.local.set({ clients: legacy, 'active-client': secondInfo });
  const migrated = await appStorage.credentials.getSnapshot();
  expect(migrated.credentials).toHaveLength(2);
  expect(migrated.activeCredentialsId).toBe(migrated.credentials[1]!.id);
  expect((await appStorage.credentials.getSnapshot()).credentials.map((entry) => entry.id)).toEqual(
    migrated.credentials.map((entry) => entry.id),
  );
  expect((await browser.storage.local.get('clients')).clients).toBe(legacy);
  await appStorage.credentials.remove(migrated.credentials[0]!.id);
  expect((await appStorage.credentials.getSnapshot()).activeCredentialsId).toBe(
    migrated.activeCredentialsId,
  );
});

test('preserves legacy active credentials missing from the list', async () => {
  await browser.storage.local.set({ 'active-client': await serializeCredentials(await remote()) });
  const snapshot = await appStorage.credentials.getSnapshot();
  expect(snapshot.credentials).toHaveLength(1);
  expect(snapshot.activeCredentialsId).toBe(snapshot.credentials[0]!.id);
});

test('migrates the client registry and remote selector without losing selection or settings', async () => {
  const info = {
    type: 'remote',
    config: {
      protocol: 'okova',
      keySystem: 'com.widevine.alpha',
      baseUrl: 'https://cdm.test',
      secret: 'test-secret',
      client: 'legacy.wvd',
    },
  };
  const legacy = { clients: [{ id: 'existing-id', info }], activeClientId: 'existing-id' };
  const settings = { ...defaultSettings, spoofing: false, clientPlayback: false };
  await browser.storage.local.set({
    'client-registry': legacy,
    settings: JSON.stringify(settings),
  });

  const migrated = await appStorage.credentials.getSnapshot();
  expect(migrated.activeCredentialsId).toBe('existing-id');
  const credentials = migrated.credentials[0]!.credentials;
  if (!(credentials instanceof RemoteCredentials)) throw new Error('Expected remote credentials');
  expect(credentials.config).toMatchObject({ credentials: 'legacy.wvd', secret: 'test-secret' });
  expect(credentials.config).not.toHaveProperty('client');
  expect(await appStorage.settings.getValue()).toEqual(settings);
  expect((await browser.storage.local.get('client-registry'))['client-registry']).toEqual(legacy);
  expect((await appStorage.credentials.getSnapshot()).activeCredentialsId).toBe('existing-id');
});

test('commits first import, activation and playback settings in one write', async () => {
  await appStorage.settings.setValue({ ...defaultSettings, theme: 'dark' });
  const write = vi.spyOn(browser.storage.local, 'set');
  const snapshot = await appStorage.credentials.import(await remote());
  expect(write).toHaveBeenCalledTimes(1);
  expect(snapshot.activeCredentialsId).toBe(snapshot.credentials[0]!.id);
  expect(await appStorage.settings.getValue()).toMatchObject({
    theme: 'dark',
    spoofing: true,
    clientPlayback: true,
    emeInterception: true,
  });
  expect(await appStorage.credentials.active.getInfo()).toMatchObject({ type: 'remote' });
});

test('failed imports leave both settings and selection unchanged and can be retried', async () => {
  await appStorage.settings.setValue(defaultSettings);
  const before = await appStorage.credentials.getSnapshot();
  vi.spyOn(browser.storage.local, 'set').mockRejectedValueOnce(new Error('Quota exceeded'));
  const credentials = await remote();
  await expect(appStorage.credentials.import(credentials)).rejects.toThrow('Quota exceeded');
  expect(await appStorage.credentials.getSnapshot()).toEqual(before);
  expect(await appStorage.settings.getValue()).toEqual(defaultSettings);
  await appStorage.credentials.import(credentials);
  await expect(appStorage.credentials.import(await remote())).rejects.toThrow('already imported');
  expect((await appStorage.credentials.getSnapshot()).credentials).toHaveLength(1);
});

test('serializes concurrent imports and active-credentials removal without losing devices', async () => {
  const [one, two, three] = await Promise.all([remote('one'), remote('two'), remote('three')]);
  await Promise.all([appStorage.credentials.import(one), appStorage.credentials.import(two)]);
  const initial = await appStorage.credentials.getSnapshot();
  await Promise.all([
    appStorage.credentials.remove(initial.activeCredentialsId!),
    appStorage.credentials.import(three),
  ]);
  const snapshot = await appStorage.credentials.getSnapshot();
  expect(snapshot.credentials).toHaveLength(2);
  expect(snapshot.credentials.some((entry) => entry.id === snapshot.activeCredentialsId)).toBe(
    true,
  );
  await expect(appStorage.credentials.select(initial.activeCredentialsId!)).rejects.toThrow(
    'no longer available',
  );
});

test('failed selection and deletion preserve the saved credentials list and active ID', async () => {
  await appStorage.credentials.import(await remote('one'));
  await appStorage.credentials.import(await remote('two'));
  const initial = await appStorage.credentials.getSnapshot();
  const write = vi.spyOn(browser.storage.local, 'set');
  write.mockRejectedValueOnce(new Error('Storage unavailable'));
  await expect(appStorage.credentials.select(initial.credentials[1]!.id)).rejects.toThrow(
    'Storage unavailable',
  );
  write.mockRejectedValueOnce(new Error('Storage unavailable'));
  await expect(appStorage.credentials.remove(initial.activeCredentialsId!)).rejects.toThrow(
    'Storage unavailable',
  );
  expect((await appStorage.credentials.getSnapshot()).activeCredentialsId).toBe(
    initial.activeCredentialsId,
  );
  expect((await appStorage.credentials.getSnapshot()).credentials.map((entry) => entry.id)).toEqual(
    initial.credentials.map((entry) => entry.id),
  );
});

test('recognizes uppercase packed extensions and exact raw Widevine pairs', async () => {
  const credentials = await widevine(1);
  const bytes = Uint8Array.from(await credentials.pack());
  const packed = await parseCredentialsFiles([new File([bytes], 'DEVICE.WVD')]);
  const raw = await credentials.unpack();
  const unpacked = await parseCredentialsFiles(
    Object.entries(raw).map(
      ([name, bytes]) => new File([Uint8Array.from(bytes)], name.toUpperCase()),
    ),
  );
  expect(await packed.credentials.pack()).toEqual(bytes);
  expect(await unpacked.credentials.pack()).toEqual(bytes);
});

test.each([
  ['first.wvd', 'second.wvd'],
  ['credentials.wvd.backup'],
  ['device_client_id_blob'],
  ['device_client_id_blob', 'device_private_key', 'extra.txt'],
  ['one.json', 'two.json'],
])('rejects ambiguous or incomplete file selections: %j', async (...names) => {
  await expect(parseCredentialsFiles(names.map((name) => new File([], name)))).rejects.toThrow(
    'Select one WVD',
  );
});

test('malformed credential files reject before touching storage', async () => {
  await expect(parseCredentialsFiles([new File(['invalid'], 'credentials.wvd')])).rejects.toThrow();
  expect(await browser.storage.local.get(null)).toEqual({});
});

test.each([
  { type: 'wvd', data: 'AAAA' },
  { type: 'prd', data: 'AAAA' },
  { type: 'remote', config: { secret: 'do-not-display' } },
  { type: 'wvd', data: 42 },
  null,
])(
  'isolates corrupt credential payloads without writing or recovering backups: %j',
  async (info) => {
    const good = await serializeCredentials(await remote());
    const registry = {
      credentials: [
        { id: 'broken', info },
        { id: 'good', info: good },
      ],
      activeCredentialsId: 'good',
    };
    await browser.storage.local.set({
      'credentials-registry': registry,
      'active-client': await serializeCredentials(await remote('stale')),
    });
    const write = vi.spyOn(browser.storage.local, 'set');
    const snapshot = await appStorage.credentials.getSnapshot();
    expect(snapshot.credentials.map((entry) => entry.id)).toEqual(['good']);
    expect(snapshot.failedCredentials).toEqual([
      { id: 'broken', error: 'Unable to read credentials' },
    ]);
    expect(snapshot.activeCredentialsId).toBe('good');
    expect(await appStorage.credentials.active.getInfo()).toEqual(good);
    expect(write).not.toHaveBeenCalled();
    await expect(appStorage.credentials.select('broken')).rejects.toThrow('no longer available');
    await appStorage.credentials.select('good');
    expect(
      (await browser.storage.local.get('credentials-registry'))['credentials-registry'],
    ).toEqual(registry);
    await appStorage.credentials.import(await remote('another'));
    const removed = await appStorage.credentials.remove('broken');
    expect(removed.failedCredentials).toEqual([]);
    expect(removed.credentials).toHaveLength(2);
    expect(removed.activeCredentialsId).toBe('good');
  },
);

test('re-import replaces only the failed entry at the limit and preserves its selection', async () => {
  const info = { type: 'wvd', data: 'AAAA' };
  const registry = {
    credentials: Array.from({ length: 10 }, (_, index) => ({ id: `broken-${index}`, info })),
    activeCredentialsId: 'broken-0',
  };
  await browser.storage.local.set({ 'credentials-registry': registry });
  const credentials = await remote();
  vi.spyOn(browser.storage.local, 'set').mockRejectedValueOnce(new Error('Quota exceeded'));
  await expect(appStorage.credentials.replace('broken-0', credentials)).rejects.toThrow(
    'Quota exceeded',
  );
  expect((await browser.storage.local.get('credentials-registry'))['credentials-registry']).toEqual(
    registry,
  );
  const snapshot = await appStorage.credentials.replace('broken-0', credentials);
  expect(snapshot.credentials.map((entry) => entry.id)).toEqual(['broken-0']);
  expect(snapshot.failedCredentials).toHaveLength(9);
  expect(snapshot.activeCredentialsId).toBe('broken-0');
  await expect(appStorage.credentials.replace('broken-1', credentials)).rejects.toThrow(
    'already imported',
  );
  await expect(appStorage.credentials.replace('broken-0', await remote('other'))).rejects.toThrow(
    'no longer need',
  );
  await expect(appStorage.credentials.replace('missing', credentials)).rejects.toThrow(
    'no longer available',
  );
  const removed = await appStorage.credentials.remove('broken-0');
  expect(removed.activeCredentialsId).toBeNull();
  expect(removed.failedCredentials).toHaveLength(9);
});

test('deleting corrupt active credentials selects a readable entry, skipping other failures', async () => {
  await browser.storage.local.set({
    'credentials-registry': {
      credentials: [
        { id: 'active', info: null },
        { id: 'broken', info: null },
        { id: 'good', info: await serializeCredentials(await remote()) },
      ],
      activeCredentialsId: 'active',
    },
  });
  expect((await appStorage.credentials.getSnapshot()).activeCredentialsId).toBe('active');
  expect((await appStorage.credentials.remove('active')).activeCredentialsId).toBe('good');
});

test('legacy migration retains corrupt entries alongside readable credentials', async () => {
  const good = await serializeCredentials(await remote());
  await browser.storage.local.set({
    clients: JSON.stringify(['AAAA', good]),
    'active-client': 'AAAA',
  });
  const snapshot = await appStorage.credentials.getSnapshot();
  expect(snapshot.credentials).toHaveLength(1);
  expect(snapshot.failedCredentials).toHaveLength(1);
  expect(snapshot.activeCredentialsId).toBe(snapshot.failedCredentials[0]!.id);
  expect(await appStorage.credentials.getSnapshot()).toEqual(snapshot);
});

test('duplicate detection normalizes remote fields after storage reorders them', async () => {
  const credentials = await remote();
  const info = await serializeCredentials(credentials);
  if (info.type !== 'remote') throw new Error('Expected remote credentials');
  await browser.storage.local.set({
    'credentials-registry': {
      credentials: [
        {
          id: 'good',
          info: {
            type: 'remote',
            config: Object.fromEntries(Object.entries(info.config).reverse()),
          },
        },
      ],
      activeCredentialsId: 'good',
    },
  });
  await expect(appStorage.credentials.import(credentials)).rejects.toThrow('already imported');
});
