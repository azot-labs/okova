import { compare } from 'semver';
import { formatRelativeTime } from './date';

const [updateInfo, setUpdateInfo] = createSignal<{
  version: string;
  url: string;
  timeSinceRelease: string;
} | null>(null);
const hasUpdate = createMemo(() => updateInfo() !== null);

export const useUpdateInfo = () => {
  return { updateInfo, setUpdateInfo, hasUpdate };
};

export const useUpdater = () => {
  const { updateInfo, setUpdateInfo, hasUpdate } = useUpdateInfo();

  const checkForUpdates = async () => {
    try {
      const owner = 'azot-labs';
      const repo = 'okova';
      const link = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
      const isFirefox = browser.runtime.getURL('').startsWith('moz-extension://');
      const response = await fetch(link);
      if (!response.ok) throw new Error('Release not found or API limit reached');
      const data = await response.json();
      const manifest = browser.runtime.getManifest();
      const currentVersion = manifest.version;
      const latestVersion = data.tag_name?.replace('v', '');
      const isCurrentVersionOutdated = compare(latestVersion, currentVersion) > 0;
      if (isCurrentVersionOutdated) {
        const asset = data.assets?.find((asset: any) =>
          asset.name.includes(isFirefox ? 'firefox' : 'chrome'),
        );
        const url = asset?.browser_download_url;
        const publishedAt = new Date(data.published_at).toLocaleString();
        const timeSinceRelease = Temporal ? formatRelativeTime(data.published_at) : publishedAt;
        setUpdateInfo({ version: latestVersion, url, timeSinceRelease });
      }
    } catch (error) {
      console.error('Error fetching release:', error);
    }
  };

  return { hasUpdate, updateInfo, checkForUpdates };
};
