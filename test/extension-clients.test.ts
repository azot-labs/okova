import { generateKeyPairSync } from 'node:crypto';
import { beforeEach, afterEach, expect, test, vi } from 'vitest';
import { browser } from 'wxt/browser';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { appStorage, defaultSettings, fromClientToInfo } from '../src/extension/utils/storage';
import { RemoteClient } from '../src/extension/utils/remote-client';
import { WidevineDeviceCredentials } from '../src/lib/widevine/device-credentials';
import {
  ClientIdentification,
  DrmCertificate,
  SignedDrmCertificate,
} from '../src/lib/widevine/proto';
import { parseClientFiles } from '../src/extension/entrypoints/popup/utils/client-import';

beforeEach(() => fakeBrowser.reset());
afterEach(() => vi.restoreAllMocks());

const remote = (device = 'one') =>
  RemoteClient.from({
    keySystem: 'com.widevine.alpha',
    baseUrl: 'https://cdm.test',
    secret: 'test-secret',
    client: device,
    label: 'Same label',
  });

const widevine = async (serial: number) => {
  const { privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
    publicKeyEncoding: { type: 'spki', format: 'pem' },
  });
  const client = new WidevineDeviceCredentials(
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
  await client.importKey(privateKey);
  return client;
};

test('same-model provisions retain distinct IDs across selection, export, reload and removal', async () => {
  const first = await widevine(1);
  const second = await widevine(2);
  expect(first.filename).toBe(second.filename);
  await appStorage.clients.import(first);
  const imported = await appStorage.clients.import(second);
  const [one, two] = imported.clients;
  expect(one!.id).not.toBe(two!.id);
  await appStorage.clients.select(two!.id);
  const restored = await appStorage.clients.getSnapshot();
  expect(restored.activeClientId).toBe(two!.id);
  expect(await restored.clients[1]!.client.pack()).toEqual(await second.pack());
  const remaining = await appStorage.clients.remove(two!.id);
  expect(remaining.clients.map((entry) => entry.id)).toEqual([one!.id]);
  expect(remaining.activeClientId).toBe(one!.id);
  expect(await (await appStorage.clients.active.getValue())!.pack()).toEqual(await first.pack());
  await appStorage.clients.remove(one!.id);
  expect(await appStorage.clients.getSnapshot()).toEqual({ clients: [], activeClientId: null });
  expect(await appStorage.clients.active.getValue()).toBeNull();
});

test('migrates mixed legacy formats and matches the active provision by content', async () => {
  const first = await widevine(1);
  const second = await widevine(2);
  const firstInfo = await fromClientToInfo(first);
  const secondInfo = await fromClientToInfo(second);
  if (firstInfo.type !== 'wvd') throw new Error('Expected Widevine');
  const legacy = JSON.stringify([firstInfo.data, secondInfo, secondInfo]);
  await browser.storage.local.set({ clients: legacy, 'active-client': secondInfo });
  const migrated = await appStorage.clients.getSnapshot();
  expect(migrated.clients).toHaveLength(2);
  expect(migrated.activeClientId).toBe(migrated.clients[1]!.id);
  expect((await appStorage.clients.getSnapshot()).clients.map((entry) => entry.id)).toEqual(
    migrated.clients.map((entry) => entry.id),
  );
  expect((await browser.storage.local.get('clients')).clients).toBe(legacy);
  await appStorage.clients.remove(migrated.clients[0]!.id);
  expect((await appStorage.clients.getSnapshot()).activeClientId).toBe(migrated.activeClientId);
});

test('preserves a legacy active client missing from the list', async () => {
  await browser.storage.local.set({ 'active-client': await fromClientToInfo(await remote()) });
  const snapshot = await appStorage.clients.getSnapshot();
  expect(snapshot.clients).toHaveLength(1);
  expect(snapshot.activeClientId).toBe(snapshot.clients[0]!.id);
});

test('commits first import, activation and playback settings in one write', async () => {
  await appStorage.settings.setValue({ ...defaultSettings, theme: 'dark' });
  const write = vi.spyOn(browser.storage.local, 'set');
  const snapshot = await appStorage.clients.import(await remote());
  expect(write).toHaveBeenCalledTimes(1);
  expect(snapshot.activeClientId).toBe(snapshot.clients[0]!.id);
  expect(await appStorage.settings.getValue()).toMatchObject({
    theme: 'dark',
    spoofing: true,
    clientPlayback: true,
    emeInterception: true,
  });
  expect(await appStorage.clients.active.getInfo()).toMatchObject({ type: 'remote' });
});

test('failed imports leave both settings and selection unchanged and can be retried', async () => {
  await appStorage.settings.setValue(defaultSettings);
  const before = await appStorage.clients.getSnapshot();
  vi.spyOn(browser.storage.local, 'set').mockRejectedValueOnce(new Error('Quota exceeded'));
  const client = await remote();
  await expect(appStorage.clients.import(client)).rejects.toThrow('Quota exceeded');
  expect(await appStorage.clients.getSnapshot()).toEqual(before);
  expect(await appStorage.settings.getValue()).toEqual(defaultSettings);
  await appStorage.clients.import(client);
  await expect(appStorage.clients.import(await remote())).rejects.toThrow('already imported');
  expect((await appStorage.clients.getSnapshot()).clients).toHaveLength(1);
});

test('serializes concurrent imports and active-client removal without losing devices', async () => {
  const [one, two, three] = await Promise.all([remote('one'), remote('two'), remote('three')]);
  await Promise.all([appStorage.clients.import(one), appStorage.clients.import(two)]);
  const initial = await appStorage.clients.getSnapshot();
  await Promise.all([
    appStorage.clients.remove(initial.activeClientId!),
    appStorage.clients.import(three),
  ]);
  const snapshot = await appStorage.clients.getSnapshot();
  expect(snapshot.clients).toHaveLength(2);
  expect(snapshot.clients.some((entry) => entry.id === snapshot.activeClientId)).toBe(true);
  await expect(appStorage.clients.select(initial.activeClientId!)).rejects.toThrow(
    'no longer available',
  );
});

test('failed selection and deletion preserve the saved client list and active ID', async () => {
  await appStorage.clients.import(await remote('one'));
  await appStorage.clients.import(await remote('two'));
  const initial = await appStorage.clients.getSnapshot();
  const write = vi.spyOn(browser.storage.local, 'set');
  write.mockRejectedValueOnce(new Error('Storage unavailable'));
  await expect(appStorage.clients.select(initial.clients[1]!.id)).rejects.toThrow(
    'Storage unavailable',
  );
  write.mockRejectedValueOnce(new Error('Storage unavailable'));
  await expect(appStorage.clients.remove(initial.activeClientId!)).rejects.toThrow(
    'Storage unavailable',
  );
  expect((await appStorage.clients.getSnapshot()).activeClientId).toBe(initial.activeClientId);
  expect((await appStorage.clients.getSnapshot()).clients.map((entry) => entry.id)).toEqual(
    initial.clients.map((entry) => entry.id),
  );
});

test('recognizes uppercase packed extensions and exact raw Widevine pairs', async () => {
  const client = await widevine(1);
  const bytes = Uint8Array.from(await client.pack());
  const packed = await parseClientFiles([new File([bytes], 'DEVICE.WVD')]);
  const raw = await client.unpack();
  const unpacked = await parseClientFiles(
    Object.entries(raw).map(
      ([name, bytes]) => new File([Uint8Array.from(bytes)], name.toUpperCase()),
    ),
  );
  expect(await packed.client.pack()).toEqual(bytes);
  expect(await unpacked.client.pack()).toEqual(bytes);
});

test.each([
  ['first.wvd', 'second.wvd'],
  ['client.wvd.backup'],
  ['device_client_id_blob'],
  ['device_client_id_blob', 'device_private_key', 'extra.txt'],
  ['one.json', 'two.json'],
])('rejects ambiguous or incomplete file selections: %j', async (...names) => {
  await expect(parseClientFiles(names.map((name) => new File([], name)))).rejects.toThrow(
    'Select one WVD',
  );
});

test('malformed device files reject before touching storage', async () => {
  await expect(parseClientFiles([new File(['invalid'], 'client.wvd')])).rejects.toThrow();
  expect(await browser.storage.local.get(null)).toEqual({});
});
