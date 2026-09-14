import { storage } from '#imports';
import { asJson } from './json';

export type Settings = {
  spoofing: boolean;
  clientPlayback: boolean;
  emeInterception: boolean;
  requestInterception: boolean;
  theme: ThemeMode;
};

export type ThemeMode = 'light' | 'dark' | 'auto';

const storedSettings = asJson(
  storage.defineItem<Omit<Settings, 'clientPlayback'> & { clientPlayback?: boolean }>(
    'local:settings',
  ),
);

const normalizeSettings = (
  settings: Awaited<ReturnType<typeof storedSettings.getValue>>,
): Settings | null =>
  settings
    ? { ...defaultSettings, ...settings, clientPlayback: settings.clientPlayback ?? false }
    : null;

export const defaultSettings: Settings = {
  emeInterception: true,
  spoofing: false,
  clientPlayback: false,
  requestInterception: true,
  theme: 'auto',
};

// Credential import acquires okova:credentials first, then this lock. Never reverse that order.
// Extra items let first import commit credentials and playback preferences in one storage write.
const patchSettings = (
  patch: Partial<Settings>,
  additionalItems: Parameters<typeof storage.setItems>[0] = [],
) =>
  navigator.locks.request('okova:settings', async () => {
    const previous = await storedSettings.getValue();
    const settings = { ...defaultSettings, ...normalizeSettings(previous), ...patch };
    if (additionalItems.length || JSON.stringify(previous) !== JSON.stringify(settings)) {
      await storage.setItems([
        ...additionalItems,
        { key: storedSettings.key, value: JSON.stringify(settings) },
      ]);
    }
    return settings;
  });

export const settingsStorage = {
  patch: patchSettings,
  getValue: async () => normalizeSettings(await storedSettings.getValue()),
  watch: (callback: (newValue: Settings | null, oldValue: Settings | null) => void) =>
    storedSettings.watch((newValue, oldValue) =>
      callback(normalizeSettings(newValue), normalizeSettings(oldValue)),
    ),
};
