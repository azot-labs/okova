import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { browser } from 'wxt/browser';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { syncInterceptionScripts } from '../src/extension/utils/interception-scripts';
import { settingsStorage, defaultSettings } from '../src/extension/utils/storage/settings';

beforeEach(() => fakeBrowser.reset());
afterEach(() => vi.restoreAllMocks());

test.each([
  [true, false, ['eme-bootstrap.js']],
  [true, true, ['eme-bootstrap.js', 'network.js']],
  [false, true, ['network.js']],
  [false, false, []],
] as const)(
  'registers only enabled startup scripts: EME %s, network %s',
  async (emeInterception, requestInterception, js) => {
    await settingsStorage.setValue({ ...defaultSettings, emeInterception, requestInterception });
    vi.spyOn(browser.scripting, 'getRegisteredContentScripts').mockImplementation(async () => []);
    const register = vi.spyOn(browser.scripting, 'registerContentScripts').mockResolvedValue();
    await syncInterceptionScripts();
    if (!js.length) expect(register).not.toHaveBeenCalled();
    else
      expect(register).toHaveBeenCalledExactlyOnceWith([
        expect.objectContaining({
          id: 'okova-interception',
          js,
          world: 'MAIN',
          runAt: 'document_start',
          allFrames: true,
          matchOriginAsFallback: true,
          persistAcrossSessions: true,
        }),
      ]);
  },
);

test('updates existing registrations for settings changes and removes them when disabled', async () => {
  vi.spyOn(browser.scripting, 'getRegisteredContentScripts').mockImplementation(async () => [
    { id: 'okova-interception', js: ['network.js'] },
  ]);
  const update = vi.spyOn(browser.scripting, 'updateContentScripts').mockResolvedValue();
  const remove = vi.spyOn(browser.scripting, 'unregisterContentScripts').mockResolvedValue();
  await syncInterceptionScripts();
  expect(update).toHaveBeenCalledExactlyOnceWith([
    expect.objectContaining({ js: ['eme-bootstrap.js'] }),
  ]);
  await settingsStorage.setValue({ ...defaultSettings, emeInterception: false });
  await syncInterceptionScripts();
  expect(remove).toHaveBeenCalledExactlyOnceWith({ ids: ['okova-interception'] });
});
