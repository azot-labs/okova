import { z } from 'zod/mini';
import { installManifestInspection } from '@/utils/manifest-inspection';
import { installNetworkInterception } from '@/utils/network-interception';
import type { EmeMethodResolver } from '@/utils/eme-runtime';
import { sendDrmMessage } from '@/utils/drm-bridge';

const startupSettings = z.object({
  emeInterception: z.boolean(),
  requestInterception: z.boolean(),
  spoofing: z.boolean(),
  clientPlayback: z.boolean(),
});

// Players may cache prototype methods as well as requestMediaKeySystemAccess.
const forwardMethod = <T extends object>(object: T, key: keyof T) => {
  const native = object[key];
  if (typeof native !== 'function') throw new Error(`Missing EME method: ${String(key)}`);
  let selected = native;
  let resolveOverride: EmeMethodResolver | undefined;
  Reflect.set(
    object,
    key,
    new Proxy(native, {
      apply: (_target, receiver, args) => {
        const override = resolveOverride?.(receiver, key);
        return Reflect.apply(typeof override === 'function' ? override : selected, receiver, args);
      },
    }),
  );
  return {
    restore: () => {
      Reflect.set(object, key, native);
      selected = native;
      resolveOverride = undefined;
    },
    select: (resolver: EmeMethodResolver) => {
      resolveOverride = resolver;
      const method = object[key];
      if (typeof method === 'function') selected = method;
    },
  };
};

export const installBootstrap = () => {
  installManifestInspection();
  const nativeRequest = navigator.requestMediaKeySystemAccess;
  let requestAccess = nativeRequest;
  const methods =
    typeof MediaKeySession === 'undefined'
      ? []
      : [
          forwardMethod(MediaKeySystemAccess.prototype, 'createMediaKeys'),
          forwardMethod(MediaKeys.prototype, 'createSession'),
          forwardMethod(MediaKeys.prototype, 'setServerCertificate'),
          forwardMethod(MediaKeySession.prototype, 'generateRequest'),
          forwardMethod(MediaKeySession.prototype, 'update'),
          forwardMethod(MediaKeySession.prototype, 'addEventListener'),
        ];
  const eventHandlers =
    typeof MediaKeySession === 'undefined'
      ? []
      : ['onmessage', 'onkeystatuseschange'].map((property) => ({
          property,
          descriptor: Object.getOwnPropertyDescriptor(MediaKeySession.prototype, property),
        }));
  const settings = sendDrmMessage({ action: 'startup-settings' }, 3_000)
    .then((value) => startupSettings.parse(value))
    .catch((error) => {
      console.warn('[okova] Settings unavailable; using native playback. Reload to retry.', error);
      return null;
    });
  let loading: Promise<void> | undefined;
  let canInstall = false;
  let hasInstalled = false;

  const restore = () => {
    for (const method of methods) method.restore();
    for (const { property, descriptor } of eventHandlers) {
      if (descriptor) Object.defineProperty(MediaKeySession.prototype, property, descriptor);
      else Reflect.deleteProperty(MediaKeySession.prototype, property);
    }
    requestAccess = nativeRequest;
    if (typeof nativeRequest === 'function') navigator.requestMediaKeySystemAccess = nativeRequest;
  };

  const load = async () => {
    const configuration = await settings;
    if (!configuration?.emeInterception) {
      restore();
      return;
    }
    const token = crypto.randomUUID();
    canInstall = true;
    window.__okovaStartEme = (requestToken, installer) => {
      if (requestToken !== token || !canInstall || hasInstalled || !installer) return false;
      restore();
      try {
        const resolveOverride = installer(configuration.spoofing && configuration.clientPlayback);
        requestAccess = navigator.requestMediaKeySystemAccess;
        for (const method of methods) method.select(resolveOverride);
        hasInstalled = true;
        return true;
      } finally {
        // Requests stay queued until the background acknowledges installation.
        navigator.requestMediaKeySystemAccess = request;
      }
    };
    try {
      const installed = await sendDrmMessage({ action: 'load-eme', token }, 3_000);
      if (installed !== true || !hasInstalled) throw new Error('EME installation did not complete');
      navigator.requestMediaKeySystemAccess = requestAccess;
      console.info('[okova] Interception ready');
    } catch (error) {
      restore();
      console.warn(
        '[okova] Interception startup failed; using native playback. Reload to retry.',
        error,
      );
    } finally {
      canInstall = false;
    }
  };
  const request: typeof navigator.requestMediaKeySystemAccess = async function (
    this: Navigator,
    ...args
  ) {
    loading ??= load();
    await loading;
    return requestAccess.apply(this, args);
  };
  if (typeof nativeRequest === 'function') navigator.requestMediaKeySystemAccess = request;
  // Disabled pages restore their native methods without ever loading the runtime.
  void settings.then((configuration) => {
    if (!configuration?.emeInterception) restore();
  });
  installNetworkInterception(settings.then((settings) => settings?.requestInterception ?? false));
  return settings;
};

export default defineContentScript({
  matches: ['https://*/*', 'http://*/*'],
  runAt: 'document_start',
  allFrames: true,
  matchOriginAsFallback: true,
  matchAboutBlank: true,
  world: 'MAIN',
  main: installBootstrap,
});
