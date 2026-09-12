import { render } from 'solid-js/web';
import { Route, Router } from '@solidjs/router';
import { createEffect, createSignal, onCleanup, onMount } from 'solid-js';

import './styles.css';
import { initializePopupHistory } from './utils/history';
import { Dashboard } from './routes/dashboard';
import { CredentialsPage } from './routes/credentials';
import { Captures } from './routes/captures';
import { Settings } from './routes/settings';
import { useSettings, useSyncStateWithStorage } from './utils/state';
import { CAPTURES_PATH } from './utils/captures';

const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');

const Popup = () => {
  const [settings] = useSettings();
  const [prefersDark, setPrefersDark] = createSignal(colorSchemeQuery.matches);

  useSyncStateWithStorage();

  onMount(() => {
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
      <Route path="/credentials" component={CredentialsPage} />
      <Route path={CAPTURES_PATH} component={Captures} />
      <Route path="/settings" component={Settings} />
    </Router>
  );
};

initializePopupHistory()
  .then(() => render(() => <Popup />, document.getElementById('root')!))
  .catch((error: unknown) => {
    console.error('[okova] Unable to initialize popup history', error);
    document.getElementById('root')!.textContent =
      'Unable to open history. Please reopen the popup.';
  });
