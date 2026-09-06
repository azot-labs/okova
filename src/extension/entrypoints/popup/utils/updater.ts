import { createMemo, createSignal } from 'solid-js';
import { z } from 'zod';
import { compare } from 'semver';
import { formatRelativeTime } from './date';

const releaseSchema = z.object({
  tag_name: z.string(),
  published_at: z.iso.datetime(),
  assets: z.array(z.object({ name: z.string(), browser_download_url: z.url() })),
});

const [updateInfo, setUpdateInfo] = createSignal<{
  version: string;
  url: string;
  timeSinceRelease: string;
} | null>(null);
const hasUpdate = createMemo(
  () => updateInfo() !== null && updateInfo()?.version !== browser.runtime.getManifest().version,
);
const [allowUpdateCheck, setAllowUpdateCheck] = createSignal(true);
const [updateCheckError, setUpdateCheckError] = createSignal<string | null>(null);
const [isCheckingForUpdates, setIsCheckingForUpdates] = createSignal(false);

export const useUpdateInfo = () => {
  return { updateInfo, setUpdateInfo, hasUpdate };
};

export const useUpdater = () => {
  const { updateInfo, setUpdateInfo, hasUpdate } = useUpdateInfo();

  const checkForUpdates = async () => {
    if (!allowUpdateCheck() || isCheckingForUpdates()) return;
    setIsCheckingForUpdates(true);
    setUpdateCheckError(null);
    try {
      const owner = 'azot-labs';
      const repo = 'okova';
      const link = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
      const isFirefox = browser.runtime.getURL('').startsWith('moz-extension://');
      const response = await fetch(link);
      if (!response.ok) throw new Error('Release not found or API limit reached');
      const data = releaseSchema.parse(await response.json());
      const manifest = browser.runtime.getManifest();
      const currentVersion = manifest.version;
      const latestVersion = data.tag_name.replace(/^v/, '');
      const isCurrentVersionOutdated = compare(latestVersion, currentVersion) > 0;
      if (isCurrentVersionOutdated) {
        const asset = data.assets.find((asset) =>
          asset.name.includes(isFirefox ? 'firefox' : 'chrome'),
        );
        if (!asset) throw new Error('Release has no download for this browser');
        const url = asset.browser_download_url;
        const timeSinceRelease = formatRelativeTime(data.published_at);
        setUpdateInfo({ version: latestVersion, url, timeSinceRelease });
      } else {
        setUpdateInfo(null);
      }
      setAllowUpdateCheck(false);
      setTimeout(() => setAllowUpdateCheck(true), 30_000);
    } catch (error) {
      console.error('Error fetching release:', error);
      setUpdateCheckError('Update check failed. Please try again.');
    } finally {
      setIsCheckingForUpdates(false);
    }
  };

  return {
    hasUpdate,
    updateInfo,
    checkForUpdates,
    allowUpdateCheck,
    isCheckingForUpdates,
    updateCheckError,
  };
};
