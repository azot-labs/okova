import { expect, test, vi } from 'vitest';
import { storage } from '#imports';
import { browser } from 'wxt/browser';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { asJson } from '../src/extension/utils/storage/json';

test('JSON storage watchers report creation and removal and stop after cleanup', async () => {
  fakeBrowser.reset();
  const item = asJson(storage.defineItem<string[]>('local:json-watch-test'));
  const callback = vi.fn();
  const unwatch = item.watch(callback);
  try {
    await item.setValue(['record']);
    await vi.waitFor(() => expect(callback).toHaveBeenLastCalledWith(['record'], null));
    await browser.storage.local.remove('json-watch-test');
    await vi.waitFor(() => expect(callback).toHaveBeenLastCalledWith(null, ['record']));
  } finally {
    unwatch();
  }
  callback.mockClear();
  await item.setValue(['after cleanup']);
  expect(callback).not.toHaveBeenCalled();
});
