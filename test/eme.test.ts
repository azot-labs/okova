import { expect, test } from 'vitest';
import { fromBase64, fromBuffer, parseBufferSource, toBufferSource } from '../src/lib';
import { PSSH, LICENSE_URL, createClient } from './utils';

// https://www.w3.org/TR/encrypted-media-2/#example-8

test('encrypted media extensions', async () => {
  let resolveMessageHandled: (() => void) | undefined;
  let rejectMessageHandled: ((error: unknown) => void) | undefined;
  const messageHandled = new Promise<void>((resolve, reject) => {
    resolveMessageHandled = resolve;
    rejectMessageHandled = reject;
  });
  let resolveKeysChecked: (() => void) | undefined;
  let rejectKeysChecked: ((error: unknown) => void) | undefined;
  const keysChecked = new Promise<void>((resolve, reject) => {
    resolveKeysChecked = resolve;
    rejectKeysChecked = reject;
  });

  const handleMessageResponse = async (keySession: MediaKeySession, response: Uint8Array) => {
    return keySession.update(toBufferSource(response));
  };

  const sendMessage = async (
    type: MediaKeyMessageType,
    message: Uint8Array,
    keySession: MediaKeySession,
  ) => {
    const response = await fetch(LICENSE_URL, {
      body: toBufferSource(message),
      method: 'POST',
    });
    const data = await response.arrayBuffer().then((buffer) => new Uint8Array(buffer));
    return handleMessageResponse(keySession, data);
  };

  const handleMessage = async (event: Event) => {
    const messageEvent = event as MediaKeyMessageEvent;
    try {
      await sendMessage(
        messageEvent.messageType,
        messageEvent.message as unknown as Uint8Array,
        messageEvent.target as MediaKeySession,
      );
      resolveMessageHandled?.();
    } catch (error) {
      rejectMessageHandled?.(error);
    }
  };

  const handleKeyStatusesChange = async (event: Event) => {
    try {
      const keySession = event.target as MediaKeySession & { keys: Map<string, string> };
      const keyStatuses = Array.from(keySession.keyStatuses.entries());
      expect(keyStatuses.length).toBe(5);

      const [firstKeyId, firstStatus] = keyStatuses[0]!;
      expect(fromBuffer(parseBufferSource(firstKeyId)).toHex()).toBe(
        'ccbf5fb4c2965be7aa130ffb3ba9fd73',
      );
      expect(firstStatus).toBe('usable');
      expect(keySession.keys.get('ccbf5fb4c2965be7aa130ffb3ba9fd73')).toBe(
        '9cc0c92044cb1d69433f5f5839a159df',
      );
      resolveKeysChecked?.();
    } catch (error) {
      rejectKeysChecked?.(error);
    }
  };

  const client = await createClient();
  const initDataType = 'cenc';
  const initData = fromBase64(PSSH).toBuffer();

  const keySystemAccess = client.requestMediaKeySystemAccess('com.widevine.alpha', []);
  const mediaKeys = await keySystemAccess.createMediaKeys();
  const keySession = mediaKeys.createSession();
  keySession.addEventListener('message', handleMessage, false);
  keySession.addEventListener('keystatuseschange', handleKeyStatusesChange, false);
  try {
    await keySession.generateRequest(initDataType, initData);
    await Promise.all([messageHandled, keysChecked]);
  } finally {
    keySession.removeEventListener('message', handleMessage, false);
    keySession.removeEventListener('keystatuseschange', handleKeyStatusesChange, false);
  }
});
