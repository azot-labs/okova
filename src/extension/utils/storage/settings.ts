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

export const storedSettings = asJson(
  storage.defineItem<Omit<Settings, 'clientPlayback'> & { clientPlayback?: boolean }>(
    'local:settings',
  ),
);

const normalizeSettings = (
  settings: Awaited<ReturnType<typeof storedSettings.getValue>>,
): Settings | null =>
  settings ? { ...settings, clientPlayback: settings.clientPlayback ?? false } : null;

export const defaultSettings: Settings = {
  emeInterception: true,
  spoofing: false,
  clientPlayback: false,
  requestInterception: false,
  theme: 'auto',
};

export const settingsStorage = {
  ...storedSettings,
  getValue: async () => normalizeSettings(await storedSettings.getValue()),
  watch: (callback: (newValue: Settings | null, oldValue: Settings | null) => void) =>
    storedSettings.watch((newValue, oldValue) =>
      callback(normalizeSettings(newValue), normalizeSettings(oldValue)),
    ),
};
