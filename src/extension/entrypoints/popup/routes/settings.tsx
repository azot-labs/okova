import { createSignal, type JSX } from 'solid-js';
import { Layout } from '../components/layout';
import { Header } from '../components/header';
import { List } from '../components/list';
import { Section, SectionFooter } from '../components/section';
import { Cell } from '../components/cell';
import { Switch } from '../components/switch';
import { useSettings, useSettingsError } from '../utils/state';
import { appStorage, ThemeMode, Settings as AppSettings } from '@/utils/storage';
import { useUpdateInfo, useUpdater } from '../utils/updater';
import { CellLink } from '../components/cell-link';
import { CellCheckmark } from '../components/cell-checkmark';

export const Settings = () => {
  const [settings] = useSettings();
  const [saveError, setSaveError] = useSettingsError();
  const [isSaving, setIsSaving] = createSignal(false);

  const updateSettings = async (patch: Partial<AppSettings>) => {
    if (isSaving()) return;
    setIsSaving(true);
    setSaveError(undefined);
    try {
      await appStorage.settings.patch(patch);
    } catch {
      setSaveError('Unable to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const changeToggle = (
    event: Parameters<JSX.EventHandler<HTMLInputElement, Event>>[0],
    key: Exclude<keyof AppSettings, 'theme'>,
  ) => {
    const checked = event.currentTarget.checked;
    // A checkbox changes its DOM state before onChange. Keep it at the persisted value.
    event.currentTarget.checked = settings[key];
    void updateSettings({
      [key]: checked,
      ...(key === 'emeInterception' && !checked && { spoofing: false }),
    });
  };

  const themeOptions: { value: ThemeMode; label: string; subtitle?: string }[] = [
    { value: 'auto', label: 'Auto' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ];

  const { allowUpdateCheck, checkForUpdates, isCheckingForUpdates, updateCheckError } =
    useUpdater();
  const { hasUpdate, updateInfo } = useUpdateInfo();

  return (
    <Layout>
      <Header backHref="/">Settings</Header>
      <List>
        <Show when={saveError()}>
          <SectionFooter>
            <span role="alert" class="text-red-500">
              {saveError()}
            </span>
          </SectionFooter>
        </Show>
        <Section
          header="Encrypted Media Extensions"
          footer="Spoofing can interrupt playback: enable Playback to play protected videos with your active client credentials."
        >
          <Cell
            title="You can view logs from an Encrypted Media Extensions (EME) session in Developer Tools under the Console tab"
            subtitle="Logging EME events and calls"
            component="label"
            after={
              <Switch
                checked={settings.emeInterception}
                disabled={isSaving()}
                onChange={(event) => changeToggle(event, 'emeInterception')}
              />
            }
          >
            EME interception
          </Cell>
          <Cell
            subtitle="Use the active credentials to obtain content keys"
            component="label"
            disabled={isSaving() || !settings.emeInterception}
            after={
              <Switch
                disabled={isSaving() || !settings.emeInterception}
                checked={settings.spoofing}
                onChange={(event) => changeToggle(event, 'spoofing')}
              />
            }
          >
            Spoofing
          </Cell>
          <Cell
            subtitle="Use the active credentials to play protected content"
            component="label"
            disabled={isSaving() || !settings.emeInterception || !settings.spoofing}
            after={
              <Switch
                disabled={isSaving() || !settings.emeInterception || !settings.spoofing}
                checked={settings.clientPlayback}
                onChange={(event) => changeToggle(event, 'clientPlayback')}
              />
            }
          >
            Playback
          </Cell>
        </Section>
        <Section
          header="Manifests"
          footer="Supported formats: DASH, HLS, MSS. It may not work on some websites."
        >
          {[
            <Cell
              subtitle="Intercept network requests to detect links to streaming manifests"
              component="label"
              after={
                <Switch
                  checked={settings.requestInterception}
                  disabled={isSaving()}
                  onChange={(event) => changeToggle(event, 'requestInterception')}
                />
              }
            >
              Manifest URL detection
            </Cell>,
          ]}
        </Section>
        <div class="w-full flex gap-3">
          <Section header="Appearance">
            {themeOptions.map((option) => (
              <Cell
                component="button"
                subtitle={option.subtitle}
                after={<CellCheckmark checked={settings.theme === option.value} />}
                disabled={isSaving()}
                onClick={() => updateSettings({ theme: option.value })}
              >
                {option.label}
              </Cell>
            ))}
          </Section>
          <Section header="About">
            <Cell>Version {browser.runtime.getManifest().version}</Cell>
            <Show
              when={hasUpdate()}
              fallback={
                allowUpdateCheck() ? (
                  <Cell
                    component="button"
                    variant="primary"
                    subtitle={updateCheckError() ?? undefined}
                    disabled={isCheckingForUpdates()}
                    onClick={() => checkForUpdates()}
                  >
                    {isCheckingForUpdates()
                      ? 'Checking for Updates…'
                      : updateCheckError()
                        ? 'Retry Update Check'
                        : 'Check for Updates'}
                  </Cell>
                ) : (
                  <Cell disabled>Up to Date</Cell>
                )
              }
            >
              <Cell
                title="Click to download"
                component="label"
                variant="primary"
                subtitle={`Version ${updateInfo()?.version} (published ${updateInfo()?.timeSinceRelease})`}
                onClick={() => window.open(updateInfo()?.url, '_blank')}
              >
                {`Update available`}
              </Cell>
            </Show>
            <CellLink href="https://github.com/azot-labs/okova">GitHub</CellLink>
          </Section>
        </div>
      </List>
    </Layout>
  );
};
