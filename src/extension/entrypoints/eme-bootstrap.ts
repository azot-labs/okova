import type { EmeMethodResolver } from '@/utils/eme-runtime';

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
  let loading: Promise<void> | undefined;

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
    try {
      await new Promise<void>((resolve, reject) => {
        const token = crypto.randomUUID();
        const timer = setTimeout(() => {
          window.__okovaStartEme = undefined;
          reject(new Error('EME installation timed out'));
        }, 3_000);
        window.__okovaStartEme = (requestToken, installer, playback) => {
          if (requestToken !== token || !installer) return false;
          clearTimeout(timer);
          window.__okovaStartEme = undefined;
          restore();
          try {
            const resolveOverride = installer(playback);
            requestAccess = navigator.requestMediaKeySystemAccess;
            for (const method of methods) method.select(resolveOverride);
            resolve();
            return true;
          } catch (error) {
            reject(error);
            return false;
          } finally {
            navigator.requestMediaKeySystemAccess = request;
          }
        };
        try {
          window.postMessage({ type: 'drm-startup', action: 'load-eme', token }, '*');
        } catch (error) {
          clearTimeout(timer);
          window.__okovaStartEme = undefined;
          reject(error);
        }
      });
      navigator.requestMediaKeySystemAccess = requestAccess;
      console.info('[okova] Interception ready');
    } catch (error) {
      restore();
      console.warn(
        '[okova] Interception startup failed; using native playback. Reload to retry.',
        error,
      );
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
};

export default defineUnlistedScript(installBootstrap);
