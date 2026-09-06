import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { formatRelativeTime } from '../src/extension/entrypoints/popup/utils/date';

vi.mock('wxt/browser', () => ({
  browser: {
    runtime: {
      getManifest: () => ({ version: '0.13.0' }),
      getURL: () => 'chrome-extension://test/',
    },
  },
}));

beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers();
  vi.stubGlobal('Temporal', undefined);
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const release = {
  tag_name: 'v0.14.0',
  published_at: '2026-09-01T00:00:00Z',
  assets: [{ name: 'okova-chrome.zip', browser_download_url: 'https://example.com/chrome.zip' }],
};

test('formats dates without Temporal and respects the requested locale and time zone', () => {
  const options = { locale: 'en-GB', timeZone: 'Asia/Tokyo' };
  expect(formatRelativeTime(release.published_at, options)).toBe(
    new Date(release.published_at).toLocaleString(options.locale, { timeZone: options.timeZone }),
  );
});

test('loads a release without Temporal and prevents overlapping checks', async () => {
  const fetchMock = vi.fn(async () => Response.json(release));
  vi.stubGlobal('fetch', fetchMock);
  const { useUpdater } = await import('../src/extension/entrypoints/popup/utils/updater');
  const updater = useUpdater();
  const checking = updater.checkForUpdates();
  expect(updater.isCheckingForUpdates()).toBe(true);
  await updater.checkForUpdates();
  await checking;
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(updater.isCheckingForUpdates()).toBe(false);
  expect(updater.updateCheckError()).toBeNull();
  expect(updater.updateInfo()).toMatchObject({
    version: '0.14.0',
    url: release.assets[0].browser_download_url,
  });
  expect(updater.allowUpdateCheck()).toBe(false);
  vi.advanceTimersByTime(30_000);
  expect(updater.allowUpdateCheck()).toBe(true);
});

test.each(['http', 'network', 'invalid', 'missing asset'])(
  'allows retry after %s failure and clears the error on success',
  async (failure) => {
    const fetchMock = vi.fn(async () => {
      if (failure === 'network') throw new Error('Offline');
      if (failure === 'http') return new Response(null, { status: 503 });
      return Response.json(failure === 'invalid' ? {} : { ...release, assets: [] });
    });
    vi.stubGlobal('fetch', fetchMock);
    const { useUpdater } = await import('../src/extension/entrypoints/popup/utils/updater');
    const updater = useUpdater();
    await updater.checkForUpdates();
    expect(updater.updateCheckError()).toContain('Update check failed');
    expect(updater.allowUpdateCheck()).toBe(true);
    expect(updater.isCheckingForUpdates()).toBe(false);
    expect(updater.updateInfo()).toBeNull();
    fetchMock.mockResolvedValueOnce(Response.json({ ...release, tag_name: 'v0.13.0' }));
    await updater.checkForUpdates();
    expect(updater.updateCheckError()).toBeNull();
    expect(updater.allowUpdateCheck()).toBe(false);
    expect(updater.updateInfo()).toBeNull();
  },
);
