import { expect, test } from 'vitest';
import { fromBase64, fromBuffer } from '../src/lib';
import { PSSH, LICENSE_URL, createClient } from './utils';

// https://www.w3.org/TR/encrypted-media-2/#example-8

test('encrypted media extensions', async () => {
  const handleMessageResponse = async (
    keySession: MediaKeySession,
    response: Uint8Array,
  ) => {
    return keySession.update(response);
  };

  const sendMessage = async (
    type: MediaKeyMessageType,
    message: Uint8Array,
    keySession: MediaKeySession,
  ) => {
    const response = await fetch(LICENSE_URL, {
      body: message,
      method: 'POST',
    });
    const data = await response
      .arrayBuffer()
      .then((buffer) => new Uint8Array(buffer));
    return handleMessageResponse(keySession, data);
  };

  const handleMessage = async (event: MediaKeyMessageEvent) => {
    sendMessage(
      event.messageType,
      event.message as unknown as Uint8Array,
      event.target as MediaKeySession,
    );
  };

  const handleKeyStatusesChange = async (event: Event) => {
    const keySession = event.target as MediaKeySession;
    const keys = Array.from(keySession.keyStatuses.keys());
    expect(keys.length).toBe(5);
    const firstKey = fromBuffer(keys[0] as Uint8Array).toText();
    expect(firstKey).toBeDefined();
    expect(firstKey).toBe(
      'ccbf5fb4c2965be7aa130ffb3ba9fd73:9cc0c92044cb1d69433f5f5839a159df',
    );
  };

  const client = await createClient();
  const initDataType = 'cenc';
  const initData = fromBase64(PSSH).toBuffer();

  const keySystemAccess = client.requestMediaKeySystemAccess(
    'com.widevine.alpha',
    [],
  );
  const mediaKeys = await keySystemAccess.createMediaKeys();
  const keySession = mediaKeys.createSession();
  keySession.addEventListener('message', handleMessage, false);
  keySession.addEventListener(
    'keystatuseschange',
    handleKeyStatusesChange,
    false,
  );
  await keySession.generateRequest(initDataType, initData);
});
