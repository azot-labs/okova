import { Layout } from '../components/layout';
import { Header } from '../components/header';
import { List } from '../components/list';
import { Section } from '../components/section';
import { Cell } from '../components/cell';
import { Switch } from '../components/switch';
import { useSettings } from '../utils/state';
import { appStorage, ThemeMode, Settings as AppSettings } from '@/utils/storage';
import { useUpdateInfo, useUpdater } from '../utils/updater';
import { CellLink } from '../components/cell-link';
import { CellCheckmark } from '../components/cell-checkmark';

export const Settings = () => {
  const [settings, setSettings] = useSettings();

  const updateSettings = (nextSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...settings, ...nextSettings };
    setSettings(nextSettings);
    appStorage.settings.setValue(updatedSettings);
  };

  const switchEmeInterception = (checked: boolean) => {
    updateSettings({
      emeInterception: checked,
      ...(!checked && { spoofing: false }),
    });
  };

  const switchSpoofing = (checked: boolean) => {
    updateSettings({ spoofing: checked });
  };

  const switchRequestInterception = (checked: boolean) => {
    updateSettings({ requestInterception: checked });
  };

  const setTheme = (theme: ThemeMode) => {
    updateSettings({ theme });
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
        <Section
          header="General"
          footer="Spoofing can interrupt playback. Enable Playback to play supported videos with your active client. Reload the video page after changing these settings."
        >
          <Cell
            title="You can view logs from an Encrypted Media Extensions (EME) session in Developer Tools under the Console tab"
            subtitle="Logging EME events and calls"
            component="label"
            after={
              <Switch
                checked={settings.emeInterception}
                onChange={(e) => {
                  const checked = e.target.checked;
                  switchEmeInterception(checked);
                }}
              />
            }
          >
            EME interception
          </Cell>
          <Cell
            subtitle="Use the active client to obtain content keys"
            component="label"
            disabled={!settings.emeInterception}
            after={
              <Switch
                disabled={!settings.emeInterception}
                checked={settings.spoofing}
                onChange={(e) => switchSpoofing(e.target.checked)}
              />
            }
          >
            Spoofing
          </Cell>
          <Cell
            subtitle="Use the active client to play protected content"
            component="label"
            disabled={!settings.emeInterception || !settings.spoofing}
            after={
              <Switch
                disabled={!settings.emeInterception || !settings.spoofing}
                checked={settings.clientPlayback}
                onChange={(event) => updateSettings({ clientPlayback: event.target.checked })}
              />
            }
          >
            Playback
          </Cell>
        </Section>
        <Section
          header="Network"
          footer="Experimental feature. Requests inside workers are not inspected."
        >
          {[
            <Cell
              subtitle="Streaming manifest URL detection"
              component="label"
              after={
                <Switch
                  checked={settings.requestInterception}
                  onChange={(e) => switchRequestInterception(e.target.checked)}
                />
              }
            >
              Request interception
            </Cell>,
          ]}
        </Section>
        <Section header="Appearance">
          {themeOptions.map((option) => (
            <Cell
              component="button"
              subtitle={option.subtitle}
              after={<CellCheckmark checked={settings.theme === option.value} />}
              onClick={() => setTheme(option.value)}
            >
              {option.label}
            </Cell>
          ))}
        </Section>
        <Section header="About">
          <Cell subtitle="Current version of the extension.">
            Version {browser.runtime.getManifest().version}
          </Cell>
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
      </List>
    </Layout>
  );
};
