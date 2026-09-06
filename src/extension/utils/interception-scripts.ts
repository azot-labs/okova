import { browser, type Browser } from 'wxt/browser';
import { defaultSettings, settingsStorage } from './storage/settings';

// The browser selects document-start code before page scripts can run. Settings
// never travel through MAIN-world globals or page-controlled message responses.
export const syncInterceptionScripts = async () => {
  const settings = (await settingsStorage.getValue()) ?? defaultSettings;
  const id = 'okova-interception';
  const js = [
    ...(settings.emeInterception ? ['eme-bootstrap.js'] : []),
    ...(settings.requestInterception ? ['network.js'] : []),
  ];
  const [registered] = await browser.scripting.getRegisteredContentScripts({ ids: [id] });
  if (!js.length) {
    if (registered) await browser.scripting.unregisterContentScripts({ ids: [id] });
    return;
  }
  const script = {
    id,
    js,
    matches: ['https://*/*', 'http://*/*'],
    allFrames: true,
    matchOriginAsFallback: true,
    runAt: 'document_start',
    world: 'MAIN',
    persistAcrossSessions: true,
  } satisfies Browser.scripting.RegisteredContentScript;
  if (registered) await browser.scripting.updateContentScripts([script]);
  else await browser.scripting.registerContentScripts([script]);
};
