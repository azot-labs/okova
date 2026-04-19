import { BsCheckLg } from 'solid-icons/bs';
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

  const { allowUpdateCheck, checkForUpdates, isCheckingForUpdates } = useUpdater();
  const { hasUpdate, updateInfo } = useUpdateInfo();

  return (
    <Layout>
      <Header backHref="/">Settings</Header>
      <List>
        <Section
          header="General"
          footer="When enabled, it will not be possible to play protected media."
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
                  if (!checked) switchSpoofing(false);
                  switchEmeInterception(checked);
                }}
              />
            }
          >
            EME interception
          </Cell>
          <Cell
            subtitle="Inject our own license request"
            component="label"
            disabled={!settings.emeInterception}
            after={
              <Switch
                checked={settings.spoofing}
                onChange={(e) => switchSpoofing(e.target.checked)}
              />
            }
          >
            Spoofing
          </Cell>
        </Section>
        <Section header="Network" footer="Experimental feature.">
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
              onClick={() => setTheme(option.value)}
              after={
                <div class="w-5 h-5 flex items-center justify-center">
                  <Show when={settings.theme === option.value}>
                    <BsCheckLg class="text-blue-500 dark:text-blue-400 w-5 h-5" />
                  </Show>
                </div>
              }
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
                  disabled={isCheckingForUpdates()}
                  onClick={() => checkForUpdates()}
                >
                  Check for Updates
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
