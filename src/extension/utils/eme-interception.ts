import { findManifest } from '@/utils/manifest';
import { toBytes, bytesToBase64, fromBase64 } from '@okova/lib/utils';
import { sendDrmMessage } from '@/utils/drm-bridge';
import { playbackSessions } from '@/utils/playback-sessions';
import { isClearKeyRequest } from '@/utils/clearkey';

declare global {
  interface MediaKeySession {
    _initData?: string;
    initDataType?: string;
    messages?: Map<MediaKeyMessageType, string>;
  }
}

// Service-certificate requests, renewals, releases, and ClearKey stay with the browser.
const isPassthroughMessage = (keySystem: string | undefined, event: MediaKeyMessageEvent) =>
  keySystem === 'org.w3.clearkey' ||
  event.messageType === 'license-release' ||
  event.messageType === 'license-renewal' ||
  (event.messageType === 'license-request' && bytesToBase64(event.message) === 'CAQ=');

export const installEmeInterception = () => {
  const send = async (data: Record<string, unknown>): Promise<any> => {
    try {
      return await sendDrmMessage(data);
    } catch (error) {
      console.warn('[okova] DRM bridge request failed', error);
      return undefined;
    }
  };

  const mediaKeysCertificates = new WeakMap<MediaKeys, string>();
  const mediaKeysSystems = new WeakMap<MediaKeys, string>();
  const sessionMediaKeys = new WeakMap<MediaKeySession, MediaKeys>();
  const getKeySystem = (session: MediaKeySession) => {
    const mediaKeys = sessionMediaKeys.get(session);
    return mediaKeys ? mediaKeysSystems.get(mediaKeys) : undefined;
  };
  const getServerCertificate = (session: MediaKeySession) => {
    const mediaKeys = sessionMediaKeys.get(session);
    return mediaKeys ? mediaKeysCertificates.get(mediaKeys) : undefined;
  };

  const sessionRequests = new WeakMap<
    MediaKeySession,
    { token: string; ready: Promise<unknown> }
  >();

  const patchEncryptedMediaExtensions = () => {
    const onGenerateRequest = async (
      initDataType: string,
      initData: BufferSource,
      session: MediaKeySession,
    ) => {
      session.initDataType = initDataType;
      session._initData = bytesToBase64(initData);
      session.messages = new Map();
      const token = crypto.randomUUID();
      const ready = send({
        sessionToken: token,
        action: 'generateRequest',
        keySystem: getKeySystem(session),
        serverCertificate: getServerCertificate(session),
        sessionId: session.sessionId,
        initDataType,
        initData: session._initData,
      });

      sessionRequests.set(session, { token, ready });
      void session.closed.then(async () => {
        await ready;
        await send({ action: 'close', sessionToken: token });
        sessionRequests.delete(session);
      });
      await ready;

      console.groupCollapsed(`[okova] [${session.sessionId}] Generated request`);
      console.log(`Initialization Data Type: ${session.initDataType}`);
      console.log(`Initialization Data (PSSH): ${session._initData}`);
      console.groupEnd();
    };

    const onKeyStatusesChange = async (session: MediaKeySession) => {
      console.groupCollapsed(`[okova] [${session.sessionId}] Key statuses changed`);
      console.log(`Initialization data type: ${session.initDataType}`);
      console.log(`Initialization data (PSSH): ${session._initData}`);
      console.log(`Keys count: ${session.keyStatuses.size}`);
      console.groupEnd();

      const keyStatuses: Record<string, string> = {};
      for (const [id, status] of session.keyStatuses.entries()) {
        keyStatuses[bytesToBase64(id)] = status;
      }

      await send({
        sessionToken: sessionRequests.get(session)?.token,
        sessionId: session.sessionId,
        action: 'keystatuseschange',
        keySystem: getKeySystem(session),
        initData: session._initData,
        initDataType: session.initDataType,
        mpd: findManifest(session._initData),
        keyStatuses,
      });
      return;
    };

    const onMessage = async (event: MediaKeyMessageEvent) => {
      const { message, messageType } = event;
      const session = event.target as MediaKeySession;
      session.messages?.set(messageType, bytesToBase64(message));

      console.groupCollapsed(
        `[okova] [${session.sessionId}] New message from browser CDM: ${messageType}`,
      );
      console.log(`Initialization data type: ${session.initDataType}`);
      console.log(`Initialization data (PSSH): ${session._initData}`);
      console.log(`Message type: ${messageType}`);
      console.log(`Message: ${session.messages?.get(messageType)}`);
      console.groupEnd();

      if (isPassthroughMessage(getKeySystem(session), event)) return;

      const request = sessionRequests.get(session);
      await request?.ready;
      const response = await send({
        keySystem: getKeySystem(session),
        serverCertificate: getServerCertificate(session),
        sessionToken: request?.token,
        action: messageType,
        initData: session._initData,
        initDataType: session.initDataType,
        message: session.messages?.get(messageType),
      });
      if (!response) {
        return;
      }

      const challenge = fromBase64(response).toBuffer();

      console.groupCollapsed(
        `[okova] [${session.sessionId}] Swapping a message from CDM with ours`,
      );
      console.log(`Initialization data type: ${session.initDataType}`);
      console.log(`Initialization data (PSSH): ${session._initData}`);
      console.log(`Message type: ${messageType}`);
      console.log(`Message from browser CDM: ${session.messages?.get(messageType)}`);
      console.log(`Message from our CDM: ${response}`);
      console.groupEnd();

      return challenge.buffer;
    };

    const onUpdate = async (
      response: BufferSource,
      session: MediaKeySession,
    ): Promise<BufferSource | undefined> => {
      const sessionId = session.sessionId;
      const message = toBytes(response);
      const messageBase64 = bytesToBase64(message);

      console.groupCollapsed(`[okova] [${session.sessionId}] Update session with response`);
      console.log(`Initialization data type: ${session.initDataType}`);
      console.log(`Initialization data (PSSH): ${session._initData}`);
      console.log(`Response: ${messageBase64}`);
      console.groupEnd();

      const request = sessionRequests.get(session);
      await request?.ready;
      const result = await send({
        sessionToken: request?.token,
        sessionId,
        action: 'update',
        keySystem: getKeySystem(session),
        initData: session._initData,
        initDataType: session.initDataType,
        message,
        messageBase64,
        mpd: findManifest(session._initData),
      });

      if (result?.keys) {
        const { keys } = result;
        console.groupCollapsed(`[okova] [${session.sessionId}] Received keys from our CDM`);
        for (const { id, value } of keys) console.log(`${id}:${value}`);
        console.groupEnd();
      } else if (!result) {
        setTimeout(() => {
          if (session.keyStatuses.size === 0) return;
          onKeyStatusesChange(session);
        }, 1000);
      }
      return;
    };

    const nativeAddEventListener = MediaKeySession.prototype.addEventListener;
    const interceptedSessions = new WeakSet<MediaKeySession>();
    const forwardedEvents = new WeakSet<Event>();

    const forwardMessage = async (session: MediaKeySession, event: MediaKeyMessageEvent) => {
      let message = event.message;
      try {
        message = (await onMessage(event)) ?? message;
      } catch (error) {
        console.warn('[okova] Failed to replace CDM message', error);
      }
      const replacement = new MediaKeyMessageEvent(event.type, {
        message,
        messageType: event.messageType,
        bubbles: event.bubbles,
        cancelable: event.cancelable,
        composed: event.composed,
      });
      forwardedEvents.add(replacement);
      session.dispatchEvent(replacement);
    };

    const interceptSessionEvents = (session: MediaKeySession) => {
      if (playbackSessions.has(session) || interceptedSessions.has(session)) return;
      interceptedSessions.add(session);
      // Stop native delivery before any application listener runs. After the bridge
      // responds, let the browser dispatch the replacement to the original listeners.
      nativeAddEventListener.call(
        session,
        'message',
        (event) => {
          if (forwardedEvents.has(event) || !(event instanceof MediaKeyMessageEvent)) return;
          // MediaKeys may have been created before this script was injected.
          if (
            getKeySystem(session) === undefined &&
            event.messageType === 'license-request' &&
            isClearKeyRequest(event.message)
          ) {
            const mediaKeys = sessionMediaKeys.get(session);
            if (mediaKeys) mediaKeysSystems.set(mediaKeys, 'org.w3.clearkey');
          }
          if (isPassthroughMessage(getKeySystem(session), event)) {
            void onMessage(event);
            return;
          }
          event.stopImmediatePropagation();
          void forwardMessage(session, event);
        },
        true,
      );
      nativeAddEventListener.call(
        session,
        'keystatuseschange',
        () => {
          void onKeyStatusesChange(session);
        },
        true,
      );
    };

    // Install interception before native event-handler registration, preserving
    // the browser's getter, callback receiver, and listener ordering.
    for (const property of ['onmessage', 'onkeystatuseschange']) {
      const descriptor = Object.getOwnPropertyDescriptor(MediaKeySession.prototype, property);
      const nativeSet = descriptor?.set;
      if (!nativeSet) continue;
      Object.defineProperty(MediaKeySession.prototype, property, {
        ...descriptor,
        set(this: MediaKeySession, value: unknown) {
          interceptSessionEvents(this);
          nativeSet.call(this, value);
        },
      });
    }

    function interceptMethod<T extends Record<string, any>, K extends keyof T>(
      object: T,
      method: K,
      call: (target: T[K], thisArg: T, argArray: Parameters<T[K]>) => ReturnType<T[K]>,
    ) {
      return Object.defineProperty(object, method, {
        value: new Proxy(object[method], { apply: call }),
      });
    }

    if (typeof MediaKeySystemAccess !== 'undefined') {
      interceptMethod(
        MediaKeySystemAccess.prototype,
        'createMediaKeys',
        async (createMediaKeys, access, args) => {
          const mediaKeys = await createMediaKeys.apply(access, args);
          mediaKeysSystems.set(mediaKeys, access.keySystem);
          return mediaKeys;
        },
      );
    }

    interceptMethod(
      MediaKeys.prototype,
      'setServerCertificate',
      async (setServerCertificate, mediaKeys, [certificate]) => {
        const encodedCertificate = bytesToBase64(certificate);
        const result = await setServerCertificate.call(mediaKeys, certificate);
        if (result) mediaKeysCertificates.set(mediaKeys, encodedCertificate);
        return result;
      },
    );

    interceptMethod(MediaKeys.prototype, 'createSession', (createSession, mediaKeys, args) => {
      const session = createSession.apply(mediaKeys, args);
      sessionMediaKeys.set(session, mediaKeys);
      interceptSessionEvents(session);
      return session;
    });

    interceptMethod(
      MediaKeySession.prototype,
      'generateRequest',
      async (generateRequest, session, [initDataType, initData]) => {
        await generateRequest.apply(session, [initDataType, initData]);
        await onGenerateRequest(initDataType, initData, session);
      },
    );

    interceptMethod(MediaKeySession.prototype, 'addEventListener', (target, session, args) => {
      interceptSessionEvents(session);
      return target.apply(session, args);
    });

    interceptMethod(MediaKeySession.prototype, 'update', async (_target, _this, [response]) => {
      const modifiedResponse = await onUpdate(response, _this);
      return _target.apply(_this, [modifiedResponse || response]);
    });
  };

  patchEncryptedMediaExtensions();

  console.log('[okova] EME interception added');
};
