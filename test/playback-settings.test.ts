import { beforeEach, expect, test } from 'vitest';
import { browser } from 'wxt/browser';
import { fakeBrowser } from 'wxt/testing';
import { appStorage } from '../src/extension/utils/storage';

beforeEach(() => fakeBrowser.reset());

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
    await appStorage.settings.setValue(settings);
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
