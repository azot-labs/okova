import { sendDrmMessage } from '@/utils/drm-bridge';

declare global {
  interface MediaKeySession {
    initData?: string;
    initDataType?: string;
    messages?: Map<MediaKeyMessageType, string>;
  }
}

export default defineUnlistedScript(() => {
  const base64 = {
    parse: (s: any) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0)),
    stringify: (buffer: BufferSource) => {
      const bytes = ArrayBuffer.isView(buffer)
        ? new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
        : new Uint8Array(buffer);
      return btoa(String.fromCharCode(...bytes));
    },
  };

  const send = async (data: Record<string, unknown>): Promise<any> => {
    try {
      return await sendDrmMessage(data);
    } catch (error) {
      console.warn('[okova] DRM bridge request failed', error);
      return undefined;
    }
  };

  const mediaKeysCertificates = new WeakMap<MediaKeys, string>();
  const sessionMediaKeys = new WeakMap<MediaKeySession, MediaKeys>();
  const getServerCertificate = (session: MediaKeySession) => {
    const mediaKeys = sessionMediaKeys.get(session);
    return mediaKeys ? mediaKeysCertificates.get(mediaKeys) : undefined;
  };

  const sessionRequests = new WeakMap<
    MediaKeySession,
    { token: string; ready: Promise<unknown> }
  >();

  const patchEncryptedMediaExtensions = async () => {
    const onGenerateRequest = async (
      initDataType: string,
      initData: BufferSource,
      session: MediaKeySession,
    ) => {
      session.initDataType = initDataType;
      session.initData = base64.stringify(initData);
      session.messages = new Map();
      const token = crypto.randomUUID();
      const ready = send({
        sessionToken: token,
        action: 'generateRequest',
        serverCertificate: getServerCertificate(session),
        sessionId: session.sessionId,
        initDataType,
        initData: session.initData,
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
      console.log(`Initialization Data (PSSH): ${session.initData}`);
      console.groupEnd();
    };

    const onKeyStatusesChange = async (session: MediaKeySession) => {
      console.groupCollapsed(`[okova] [${session.sessionId}] Key statuses changed`);
      console.log(`Initialization data type: ${session.initDataType}`);
      console.log(`Initialization data (PSSH): ${session.initData}`);
      console.log(`Keys count: ${session.keyStatuses.size}`);
      console.groupEnd();

      const keyStatuses: Record<string, string> = {};
      for (const [id, status] of session.keyStatuses.entries()) {
        keyStatuses[base64.stringify(id)] = status;
      }

      await send({
        sessionToken: sessionRequests.get(session)?.token,
        sessionId: session.sessionId,
        action: 'keystatuseschange',
        initData: session.initData,
        initDataType: session.initDataType,
        mpd: window.MPD_LIST.get(session.initData!),
        keyStatuses,
      });
      return;
    };

    const onMessage = async (event: MediaKeyMessageEvent) => {
      const { message, messageType } = event;
      const session = event.target as MediaKeySession;
      session.messages?.set(messageType, base64.stringify(message));

      console.groupCollapsed(
        `[okova] [${session.sessionId}] New message from browser CDM: ${messageType}`,
      );
      console.log(`Initialization data type: ${session.initDataType}`);
      console.log(`Initialization data (PSSH): ${session.initData}`);
      console.log(`Message type: ${messageType}`);
      console.log(`Message: ${session.messages?.get(messageType)}`);
      console.groupEnd();

      if (['license-release', 'license-renewal'].includes(messageType)) {
        return;
      }

      // Widevine's service-certificate request must reach the license server unchanged.
      if (messageType === 'license-request' && base64.stringify(message) === 'CAQ=') return;

      const request = sessionRequests.get(session);
      await request?.ready;
      const response = await send({
        serverCertificate: getServerCertificate(session),
        sessionToken: request?.token,
        action: messageType,
        initData: session.initData,
        initDataType: session.initDataType,
        message: session.messages?.get(messageType),
      });
      if (!response) {
        return;
      }

      const challenge = base64.parse(response);

      console.groupCollapsed(
        `[okova] [${session.sessionId}] Swapping a message from CDM with ours`,
      );
      console.log(`Initialization data type: ${session.initDataType}`);
      console.log(`Initialization data (PSSH): ${session.initData}`);
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
      const message = ArrayBuffer.isView(response)
        ? new Uint8Array(response.buffer, response.byteOffset, response.byteLength)
        : new Uint8Array(response);
      const messageBase64 = base64.stringify(message);

      console.groupCollapsed(`[okova] [${session.sessionId}] Update session with response`);
      console.log(`Initialization data type: ${session.initDataType}`);
      console.log(`Initialization data (PSSH): ${session.initData}`);
      console.log(`Response: ${messageBase64}`);
      console.groupEnd();

      const request = sessionRequests.get(session);
      await request?.ready;
      const result = await send({
        sessionToken: request?.token,
        sessionId,
        action: 'update',
        initData: session.initData,
        initDataType: session.initDataType,
        message,
        messageBase64,
        mpd: window.MPD_LIST.get(session.initData!),
      });

      if (result) {
        const { keys } = result;
        console.groupCollapsed(`[okova] [${session.sessionId}] Received keys from our CDM`);
        for (const { id, value } of keys) console.log(`${id}:${value}`);
        console.groupEnd();
      } else {
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
      if (interceptedSessions.has(session)) return;
      interceptedSessions.add(session);
      // Stop native delivery before any application listener runs. After the bridge
      // responds, let the browser dispatch the replacement to the original listeners.
      nativeAddEventListener.call(
        session,
        'message',
        (event) => {
          if (forwardedEvents.has(event) || !(event instanceof MediaKeyMessageEvent)) return;
          if (
            event.messageType === 'license-release' ||
            event.messageType === 'license-renewal' ||
            (event.messageType === 'license-request' && base64.stringify(event.message) === 'CAQ=')
          ) {
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

    interceptMethod(
      MediaKeys.prototype,
      'setServerCertificate',
      async (setServerCertificate, mediaKeys, [certificate]) => {
        const encodedCertificate = base64.stringify(certificate);
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
});
