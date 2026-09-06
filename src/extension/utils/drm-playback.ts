import { findManifest } from '@/utils/manifest';
import { z } from 'zod';
import { CLIENT_KEY_SYSTEMS, type ClientKeySystem } from '@okova/lib/key-system';
import { toBytes, bytesToBase64, fromHex, fromBase64 } from '@okova/lib/utils';
import { playbackSessions } from './playback-sessions';
import { sendDrmMessage } from './drm-bridge';
import type { EmeMethodResolver } from './eme-runtime';

const playbackMethods = new WeakMap<object, object>();
export const resolvePlaybackMethod: EmeMethodResolver = (receiver, method) => {
  const overrides = playbackMethods.get(receiver);
  return overrides ? Reflect.get(overrides, method) : undefined;
};

const { widevine: WIDEVINE, playready: PLAYREADY } = CLIENT_KEY_SYSTEMS;
type PlaybackKeySystem = ClientKeySystem | 'com.microsoft.playready';
type SessionRequest =
  | { action: 'generateRequest' | 'license-request' | 'close' }
  | { action: 'update'; message: Uint8Array; messageBase64: string };
const INSTALLED = Symbol.for('okova.drm-playback.installed');
const CLEARKEY = 'org.w3.clearkey';
const hexKey = z.string().regex(/^[a-f\d]{32}$/i);
const licenseKeys = z.object({ keys: z.array(z.object({ id: hexKey, value: hexKey })).min(1) });
const playbackKeyIds = z.array(hexKey).min(1);
const licenseChallenge = z.object({ challenge: z.string().min(1) });
const hexToBase64Url = (hex: string) =>
  fromHex(hex).toBase64().replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
const encodeJsonUtf8 = (value: unknown) => new TextEncoder().encode(JSON.stringify(value));
// Windows PlayReady EME messages wrap the SOAP challenge and headers in UTF-16LE XML.
const encodePlayReadyMessage = (challenge: string) => {
  const xml = `<PlayReadyKeyMessage type="LicenseAcquisition"><LicenseAcquisition version="1.0"><Challenge encoding="base64encoded">${challenge}</Challenge><HttpHeaders><HttpHeader><name>Content-Type</name><value>text/xml; charset=utf-8</value></HttpHeader><HttpHeader><name>SOAPAction</name><value>http://schemas.microsoft.com/DRM/2007/03/protocols/AcquireLicense</value></HttpHeader></HttpHeaders></LicenseAcquisition></PlayReadyKeyMessage>`;
  const message = new ArrayBuffer(xml.length * 2);
  const view = new DataView(message);
  for (let index = 0; index < xml.length; index++)
    view.setUint16(index * 2, xml.charCodeAt(index), true);
  return message;
};
const unsupported = (message: string) => new DOMException(message, 'NotSupportedError');

/** Temporary-session adapter. Native ClearKey owns attachment and decryption. */
export const installDrmPlayback = () => {
  if (Reflect.get(navigator, INSTALLED)) return;
  const requestAccess = navigator.requestMediaKeySystemAccess.bind(navigator);
  const nativeCreateKeys = MediaKeySystemAccess.prototype.createMediaKeys;
  const nativeCreateSession = MediaKeys.prototype.createSession;
  const nativeGenerate = MediaKeySession.prototype.generateRequest;
  const nativeUpdate = MediaKeySession.prototype.update;
  const nativeClose = MediaKeySession.prototype.close;

  const nativeListen = MediaKeySession.prototype.addEventListener;

  const adaptMediaKeys = (mediaKeys: MediaKeys, keySystem: PlaybackKeySystem) => {
    let serverCertificate: string | undefined;
    mediaKeys.setServerCertificate = async (certificate) => {
      if (!toBytes(certificate).length) throw new TypeError('Empty server certificate');
      if (keySystem !== WIDEVINE) return false;
      // The background Widevine client validates and uses this certificate.
      serverCertificate = bytesToBase64(certificate);
      return true;
    };
    mediaKeys.createSession = (sessionType = 'temporary') => {
      if (sessionType !== 'temporary')
        throw unsupported('Playback supports temporary sessions only');
      const session = nativeCreateSession.call(mediaKeys, sessionType);
      playbackSessions.add(session);
      const sessionToken = crypto.randomUUID();
      const forwardedMessages = new WeakSet<Event>();
      let closed = false;
      let initData: string | undefined;
      let initialized = false;
      let isCallable = false;
      const sendSessionRequest = (request: SessionRequest) =>
        sendDrmMessage({
          ...request,
          sessionToken,
          sessionId: session.sessionId,
          keySystem,
          initDataType: 'cenc',
          initData,
          serverCertificate,
          mpd: findManifest(initData),
        });
      const dispatchChallenge = (challenge: ArrayBuffer) => {
        // Deliver as a task, after generateRequest or update has resolved.
        setTimeout(() => {
          if (closed) return;
          const event = new MediaKeyMessageEvent('message', {
            messageType: 'license-request',
            message: challenge,
          });
          forwardedMessages.add(event);
          session.dispatchEvent(event);
        }, 0);
      };
      // Keep ClearKey requests local. The player only receives challenges from the active client.
      nativeListen.call(session, 'message', (event) => {
        if (!forwardedMessages.has(event)) event.stopImmediatePropagation();
      });
      session.generateRequest = (initDataType, data) => {
        if (initialized || closed)
          return Promise.reject(
            new DOMException('Session already initialized or closed', 'InvalidStateError'),
          );
        initialized = true;
        const ready = (async () => {
          if (initDataType !== 'cenc')
            throw unsupported('Playback requires cenc initialization data');
          const source = toBytes(data);
          initData = bytesToBase64(source);
          const parsed = playbackKeyIds.safeParse(
            await sendDrmMessage({
              action: 'playback-keyids',
              keySystem,
              initData,
            }),
          );
          if (!parsed.success)
            throw unsupported('Playback requires key IDs in the DRM initialization data');
          const kids = parsed.data;
          if (closed) throw new DOMException('Session is closed', 'InvalidStateError');
          await nativeGenerate.call(
            session,
            'keyids',
            encodeJsonUtf8({ kids: kids.map(hexToBase64Url) }),
          );
          if (closed) throw new DOMException('Session is closed', 'InvalidStateError');
          await sendSessionRequest({ action: 'generateRequest' });
          if (closed) throw new DOMException('Session is closed', 'InvalidStateError');
          const challenge = await sendSessionRequest({ action: 'license-request' });
          if (typeof challenge !== 'string' || !challenge.length) {
            throw new DOMException(
              'The active client could not create a license request. Check Okova for details.',
              'OperationError',
            );
          }
          if (keySystem !== WIDEVINE) return encodePlayReadyMessage(challenge);
          return fromBase64(challenge).toBuffer().buffer;
        })();
        return ready.then((challenge) => {
          if (closed) throw new DOMException('Session is closed', 'InvalidStateError');
          isCallable = true;
          dispatchChallenge(challenge);
        });
      };
      session.update = async (response) => {
        if (!isCallable || closed)
          throw new DOMException('Session is not active', 'InvalidStateError');
        const message = new Uint8Array(toBytes(response));
        const result = await sendSessionRequest({
          action: 'update',
          message,
          messageBase64: bytesToBase64(message),
        });
        const nextChallenge = licenseChallenge.safeParse(result);
        if (keySystem === WIDEVINE && nextChallenge.success) {
          if (closed) throw new DOMException('Session is closed', 'InvalidStateError');
          dispatchChallenge(fromBase64(nextChallenge.data.challenge).toBuffer().buffer);
          return;
        }
        const parsed = licenseKeys.safeParse(result);
        if (!parsed.success)
          throw new DOMException(
            'The active client could not retrieve content keys. Check Okova for details.',
            'OperationError',
          );
        const { keys } = parsed.data;
        await nativeUpdate.call(
          session,
          encodeJsonUtf8({
            keys: keys.map(({ id, value }) => ({
              kty: 'oct',
              kid: hexToBase64Url(id),
              k: hexToBase64Url(value),
            })),
            type: 'temporary',
          }),
        );
      };
      session.close = async () => {
        closed = true;
        await nativeClose.call(session);
      };
      void session.closed.then(() => {
        closed = true;
        void sendSessionRequest({ action: 'close' }).catch(() => {});
      });
      playbackMethods.set(session, {
        generateRequest: session.generateRequest,
        update: session.update,
      });
      return session;
    };
    playbackMethods.set(mediaKeys, {
      createSession: mediaKeys.createSession,
      setServerCertificate: mediaKeys.setServerCertificate,
    });
    return mediaKeys;
  };

  navigator.requestMediaKeySystemAccess = async (keySystem, configurations) => {
    const isPlayReady = keySystem === PLAYREADY || keySystem === 'com.microsoft.playready';
    const isHardwarePlayReady =
      keySystem === 'com.microsoft.playready.recommendation.3000' ||
      keySystem === 'com.microsoft.playready.hardware';
    if (keySystem !== WIDEVINE && !isPlayReady && !isHardwarePlayReady)
      return requestAccess(keySystem, configurations);
    const activeSystem = await sendDrmMessage({ action: 'playback-config' });
    if (activeSystem === null) return requestAccess(keySystem, configurations);
    if (isHardwarePlayReady)
      throw unsupported('Hardware DRM is unavailable during client playback');
    if (activeSystem !== (isPlayReady ? PLAYREADY : WIDEVINE)) {
      throw unsupported('Select a matching DRM client in Okova');
    }
    const supportsCapability = (capability: MediaKeySystemMediaCapability) =>
      (!capability.encryptionScheme || capability.encryptionScheme === 'cenc') &&
      (!capability.robustness ||
        (isPlayReady
          ? ['150', '2000'].includes(capability.robustness)
          : ['SW_SECURE_CRYPTO', 'SW_SECURE_DECODE'].includes(capability.robustness)));

    for (const configuration of configurations) {
      if (
        configuration.persistentState === 'required' ||
        configuration.distinctiveIdentifier === 'required' ||
        configuration.sessionTypes?.some((type) => type !== 'temporary') ||
        (configuration.initDataTypes && !configuration.initDataTypes.includes('cenc'))
      )
        continue;
      const translate = (capabilities: MediaKeySystemMediaCapability[] | undefined) =>
        capabilities
          ?.filter(supportsCapability)
          .map((capability) => ({ ...capability, robustness: '', encryptionScheme: 'cenc' }));
      const audioCapabilities = translate(configuration.audioCapabilities);
      const videoCapabilities = translate(configuration.videoCapabilities);
      if (
        (configuration.audioCapabilities?.length && !audioCapabilities?.length) ||
        (configuration.videoCapabilities?.length && !videoCapabilities?.length)
      )
        continue;
      try {
        const nativeAccess = await requestAccess(CLEARKEY, [
          {
            ...configuration,
            initDataTypes: ['keyids'],
            audioCapabilities,
            videoCapabilities,
            distinctiveIdentifier: 'not-allowed',
            persistentState: 'not-allowed',
            sessionTypes: ['temporary'],
          },
        ]);
        const supported = nativeAccess.getConfiguration();
        const restore = (
          capabilities: MediaKeySystemMediaCapability[] | undefined,
          requested: MediaKeySystemMediaCapability[] | undefined,
        ) =>
          capabilities?.map((capability) => ({
            ...capability,
            robustness:
              requested?.find(
                (candidate) =>
                  candidate.contentType === capability.contentType && supportsCapability(candidate),
              )?.robustness ?? '',
          }));
        const overrides = {
          createMediaKeys: async () =>
            adaptMediaKeys(await nativeCreateKeys.call(nativeAccess), keySystem),
        };
        const access = new Proxy(nativeAccess, {
          get(target, property) {
            if (property === 'keySystem') return keySystem;
            if (property === 'getConfiguration')
              return () => ({
                ...supported,
                initDataTypes: ['cenc'],
                audioCapabilities: restore(
                  supported.audioCapabilities,
                  configuration.audioCapabilities,
                ),
                videoCapabilities: restore(
                  supported.videoCapabilities,
                  configuration.videoCapabilities,
                ),
              });
            if (property === 'createMediaKeys') return overrides.createMediaKeys;
            return Reflect.get(target, property, target);
          },
        });
        playbackMethods.set(access, overrides);
        return access;
      } catch (error) {
        if (!(error instanceof DOMException) || error.name !== 'NotSupportedError') throw error;
      }
    }
    throw unsupported('No compatible ClearKey configuration for client playback');
  };
  Object.defineProperty(navigator, INSTALLED, { value: true });
};
