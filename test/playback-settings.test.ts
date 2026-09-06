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
  { saved: { clientPlayback: true, clientPlayback: false }, expected: false },
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
