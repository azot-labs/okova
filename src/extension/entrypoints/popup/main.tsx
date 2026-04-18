import { render } from 'solid-js/web';
import { Route, Router } from '@solidjs/router';
import { createEffect, createSignal, onCleanup, onMount } from 'solid-js';

import './styles.css';
import { Dashboard } from './routes/dashboard';
import { Clients } from './routes/clients';
import { Keys } from './routes/keys';
import { Settings } from './routes/settings';
import { useSettings, useSyncStateWithStorage } from './utils/state';
import { useUpdater } from './utils/updater';

const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');

const Popup = () => {
  const [settings] = useSettings();
  const [prefersDark, setPrefersDark] = createSignal(colorSchemeQuery.matches);
  const { checkForUpdates } = useUpdater();

  useSyncStateWithStorage();

  onMount(() => {
    checkForUpdates();

    const syncPreference = () => setPrefersDark(colorSchemeQuery.matches);

    syncPreference();
    colorSchemeQuery.addEventListener('change', syncPreference);
    onCleanup(() => colorSchemeQuery.removeEventListener('change', syncPreference));
  });

  createEffect(() => {
    const useDarkTheme = settings.theme === 'dark' || (settings.theme === 'auto' && prefersDark());

    document.documentElement.classList.toggle('dark', useDarkTheme);
    document.documentElement.style.colorScheme = useDarkTheme ? 'dark' : 'light';
  });

  return (
    <Router base="/popup.html">
      <Route path="/" component={Dashboard} />
      <Route path="/clients" component={Clients} />
      <Route path="/keys" component={Keys} />
      <Route path="/settings" component={Settings} />
    </Router>
  );
};

render(() => <Popup />, document.getElementById('root')!);
