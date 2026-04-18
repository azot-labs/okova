import { render } from 'solid-js/web';
import { Route, Router } from '@solidjs/router';
import { createEffect, createSignal, onCleanup, onMount } from 'solid-js';

import './styles.css';
import { Dashboard } from './routes/dashboard';
import { Clients } from './routes/clients';
import { Keys } from './routes/keys';
import { Settings } from './routes/settings';
import { useSettings, useSyncStateWithStorage } from './utils/state';

const Popup = () => {
  const [settings] = useSettings();
  const [prefersDark, setPrefersDark] = createSignal(false);

  useSyncStateWithStorage();

  onMount(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const syncPreference = () => setPrefersDark(media.matches);

    syncPreference();
    media.addEventListener('change', syncPreference);
    onCleanup(() => media.removeEventListener('change', syncPreference));
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
