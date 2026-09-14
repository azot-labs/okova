import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { browser } from 'wxt/browser';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { appStorage, defaultSettings } from '../src/extension/utils/storage';

beforeEach(() => fakeBrowser.reset());
afterEach(() => vi.restoreAllMocks());

const preferences = {
  spoofing: true,
  emeInterception: true,
  requestInterception: false,
  theme: 'dark',
};

test.for([
  { saved: { clientPlayback: true }, expected: true },
  { saved: { clientPlayback: false }, expected: false },
  { saved: {}, expected: false },
])(
  'reads playback preferences without losing existing choices: $saved',
  async ({ saved, expected }) => {
    await browser.storage.local.set({ settings: JSON.stringify({ ...preferences, ...saved }) });
    const settings = await appStorage.settings.getValue();
    expect(settings).toEqual({ ...preferences, clientPlayback: expected });
    if (!settings) throw new Error('Expected saved settings');
    await appStorage.settings.patch(settings);
    const stored = await browser.storage.local.get('settings');
    if (typeof stored.settings !== 'string') throw new Error('Expected serialized settings');
    expect(JSON.parse(stored.settings)).toEqual({ ...preferences, clientPlayback: expected });
  },
);

test('returns null when settings have never been saved', async () => {
  await expect(appStorage.settings.getValue()).resolves.toBeNull();
});

test('normalizes playback defaults in watched settings too', async () => {
  const changes: unknown[] = [];
  const unwatch = appStorage.settings.watch((value, previous) => changes.push({ value, previous }));
  try {
    await browser.storage.local.set({ settings: JSON.stringify(preferences) });
    await browser.storage.local.set({
      settings: JSON.stringify({ ...preferences, clientPlayback: true }),
    });
    expect(changes).toEqual([
      { value: { ...preferences, clientPlayback: false }, previous: null },
      {
        value: { ...preferences, clientPlayback: true },
        previous: { ...preferences, clientPlayback: false },
      },
    ]);
  } finally {
    unwatch();
  }
});

test('concurrent patches preserve different fields and serialize changes to the same field', async () => {
  await Promise.all([
    appStorage.settings.patch({ theme: 'dark' }),
    appStorage.settings.patch({ requestInterception: false }),
    appStorage.settings.patch({ spoofing: true }),
    appStorage.settings.patch({ theme: 'light' }),
  ]);
  expect(await appStorage.settings.getValue()).toEqual({
    ...defaultSettings,
    theme: 'light',
    requestInterception: false,
    spoofing: true,
  });
});

test('initialization and migration preserve concurrent preference changes', async () => {
  await browser.storage.local.set({
    settings: JSON.stringify({ ...preferences, theme: undefined }),
  });
  await Promise.all([
    appStorage.settings.patch({}),
    appStorage.settings.patch({ theme: 'light', clientPlayback: true }),
    appStorage.settings.patch({}),
  ]);
  expect(await appStorage.settings.getValue()).toEqual({
    ...preferences,
    theme: 'light',
    clientPlayback: true,
  });
});

test('a rejected save leaves persisted settings and watchers unchanged and releases the lock', async () => {
  await appStorage.settings.patch({});
  const changed = vi.fn();
  const unwatch = appStorage.settings.watch(changed);
  try {
    vi.spyOn(browser.storage.local, 'set').mockRejectedValueOnce(new Error('Storage unavailable'));
    await expect(appStorage.settings.patch({ spoofing: true })).rejects.toThrow(
      'Storage unavailable',
    );
    expect(await appStorage.settings.getValue()).toEqual(defaultSettings);
    expect(changed).not.toHaveBeenCalled();
    await appStorage.settings.patch({ theme: 'dark' });
    expect(await appStorage.settings.getValue()).toEqual({ ...defaultSettings, theme: 'dark' });
    expect(changed).toHaveBeenCalledTimes(1);
  } finally {
    unwatch();
  }
});
