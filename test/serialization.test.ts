import { readFile } from 'node:fs/promises';
import { expect, test, describe } from 'vitest';
import { fromBase64 } from '../src/lib';
import { requestMediaKeySystemAccess } from '../src/lib/api';
import { WidevineCdm } from '../src/lib/widevine/cdm';
import { Session as WidevineSession } from '../src/lib/widevine/session';
import { PlayReadyCdm } from '../src/lib/playready/cdm';
import { Session as PlayReadySession } from '../src/lib/playready/session';

describe('Widevine Session Serialization', () => {
  test('should serialize and deserialize widevine session via CDM methods', async () => {
    const pssh =
      'AAAAW3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAADsIARIQ62dqu8s0Xpa7z2FmMPGj2hoNd2lkZXZpbmVfdGVzdCIQZmtqM2xqYVNkZmFsa3IzaioCSEQyAA==';
    const initData = fromBase64(pssh).toBuffer();
    const initDataType = 'cenc';

    const clientPath = process.env.VITEST_WIDEVINE_CLIENT_PATH;
    if (!clientPath)
      return console.warn('Widevine client not found. Skipping test');

    const clientData = await readFile(clientPath);
    const client = await WidevineCdm.Client.from({ wvd: clientData });
    const cdm = new WidevineCdm({ client });

    // Create and setup session
    const keySystemAccess = requestMediaKeySystemAccess(cdm.keySystem, []);
    const mediaKeys = await keySystemAccess.createMediaKeys({ cdm });
    const session = mediaKeys.createSession();
    session.generateRequest(initDataType, initData);
    const licenseRequest = await session.waitForLicenseRequest();

    // Get original session properties
    const originalSessionId = session.sessionId;
    const originalSessionType = session.sessionType;

    // Serialize session
    const serialized = session.toString();
    expect(serialized).toBeDefined();
    expect(typeof serialized).toBe('string');
    expect(serialized.length).toBeGreaterThan(0);

    // Deserialize session using CDM methods
    const parsed = cdm.parseSession(serialized);
    expect(parsed).toBeDefined();
    expect(parsed.sessionId).toBe(originalSessionId);
    expect(parsed.sessionType).toBe(originalSessionType);

    // Verify the session was added to CDM sessions map
    const restoredSession = cdm.sessions.get(parsed.sessionId);
    expect(restoredSession).toBeDefined();
    expect(restoredSession!.sessionId).toBe(originalSessionId);
    expect(restoredSession!.sessionType).toBe(originalSessionType);
  });

  test('should serialize and deserialize widevine session via Session static methods', async () => {
    const clientPath = process.env.VITEST_WIDEVINE_CLIENT_PATH;
    if (!clientPath)
      return console.warn('Widevine client not found. Skipping test');

    const clientData = await readFile(clientPath);
    const client = await WidevineCdm.Client.from({ wvd: clientData });

    // Create a session directly
    const originalSession = new WidevineSession('temporary', client);
    const originalSessionId = originalSession.sessionId;

    // Serialize
    const serialized = originalSession.toString();
    expect(serialized).toBeDefined();
    expect(typeof serialized).toBe('string');

    // Deserialize using static method
    const restoredSession = WidevineSession.from(serialized, client);
    expect(restoredSession).toBeDefined();
    expect(restoredSession.sessionId).toBe(originalSessionId);
    expect(restoredSession.sessionType).toBe('temporary');
  });

  test('should preserve session state during serialization roundtrip', async () => {
    const pssh =
      'AAAAW3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAADsIARIQ62dqu8s0Xpa7z2FmMPGj2hoNd2lkZXZpbmVfdGVzdCIQZmtqM2xqYVNkZmFsa3IzaioCSEQyAA==';
    const initData = fromBase64(pssh).toBuffer();
    const initDataType = 'cenc';

    const clientPath = process.env.VITEST_WIDEVINE_CLIENT_PATH;
    if (!clientPath)
      return console.warn('Widevine client not found. Skipping test');

    const clientData = await readFile(clientPath);
    const client = await WidevineCdm.Client.from({ wvd: clientData });

    // Create session and generate request
    const originalSession = new WidevineSession('temporary', client);
    await originalSession.generateRequest(initDataType, initData);

    const originalSessionId = originalSession.sessionId;
    const originalSessionType = originalSession.sessionType;

    // Serialize and deserialize
    const serialized = originalSession.toString();
    const restoredSession = WidevineSession.from(serialized, client);

    // Verify state preservation
    expect(restoredSession.sessionId).toBe(originalSessionId);
    expect(restoredSession.sessionType).toBe(originalSessionType);

    // Verify context was preserved (contexts are created during generateRequest)
    expect(restoredSession.contexts.size).toBeGreaterThan(0);
    expect(restoredSession.contexts.size).toBe(originalSession.contexts.size);
  });

  test('should handle persistent-license session type', async () => {
    const clientPath = process.env.VITEST_WIDEVINE_CLIENT_PATH;
    if (!clientPath)
      return console.warn('Widevine client not found. Skipping test');

    const clientData = await readFile(clientPath);
    const client = await WidevineCdm.Client.from({ wvd: clientData });
    const cdm = new WidevineCdm({ client });

    // Create persistent session
    const keySystemAccess = requestMediaKeySystemAccess(cdm.keySystem, []);
    const mediaKeys = await keySystemAccess.createMediaKeys({ cdm });
    const session = mediaKeys.createSession('persistent-license');

    // Serialize
    const serialized = session.toString();

    // Deserialize
    const parsed = cdm.parseSession(serialized);
    expect(parsed.sessionType).toBe('persistent-license');

    const restoredSession = cdm.sessions.get(parsed.sessionId);
    expect(restoredSession!.sessionType).toBe('persistent-license');
  });
});

describe('PlayReady Session Serialization', () => {
  test('should serialize and deserialize playready session via CDM methods', async () => {
    const clientPath = process.env.VITEST_PLAYREADY_CLIENT_PATH;
    if (!clientPath)
      return console.warn('PlayReady client not found. Skipping test');

    const clientData = await readFile(clientPath);
    const client = await PlayReadyCdm.Client.from({ prd: clientData });
    const cdm = new PlayReadyCdm({ client });

    // Create session
    const keySystemAccess = requestMediaKeySystemAccess(cdm.keySystem, []);
    const mediaKeys = await keySystemAccess.createMediaKeys({ cdm });
    const session = mediaKeys.createSession();

    // Get original session properties
    const originalSessionId = session.sessionId;
    const originalSessionType = session.sessionType;

    // Serialize session
    const serialized = session.toString();
    expect(serialized).toBeDefined();
    expect(typeof serialized).toBe('string');
    expect(serialized.length).toBeGreaterThan(0);

    // Deserialize session using CDM methods
    const parsed = cdm.parseSession(serialized);
    expect(parsed).toBeDefined();
    expect(parsed.sessionId).toBe(originalSessionId);
    expect(parsed.sessionType).toBe(originalSessionType);

    // Verify the session was added to CDM sessions map
    const restoredSession = cdm.sessions.get(parsed.sessionId);
    expect(restoredSession).toBeDefined();
    expect(restoredSession!.sessionId).toBe(originalSessionId);
    expect(restoredSession!.type).toBe(originalSessionType);
  });

  test('should serialize and deserialize playready session via Session static methods', async () => {
    const clientPath = process.env.VITEST_PLAYREADY_CLIENT_PATH;
    if (!clientPath)
      return console.warn('PlayReady client not found. Skipping test');

    const clientData = await readFile(clientPath);
    const client = await PlayReadyCdm.Client.from({ prd: clientData });

    // Create a session directly
    const originalSession = new PlayReadySession('temporary', client);
    const originalSessionId = originalSession.sessionId;

    // Serialize
    const serialized = originalSession.toString();
    expect(serialized).toBeDefined();
    expect(typeof serialized).toBe('string');

    // Parse the serialized data to verify structure
    const parsed = JSON.parse(serialized);
    expect(parsed.sessionId).toBe(originalSessionId);
    expect(parsed.sessionType).toBe('temporary');
    expect(parsed.certificateChain).toBeDefined();
    expect(parsed.encryptionKey).toBeDefined();
    expect(parsed.signingKey).toBeDefined();
    expect(parsed.clientVersion).toBeDefined();

    // Deserialize using static method
    const restoredSession = PlayReadySession.from(serialized, client);
    expect(restoredSession).toBeDefined();
    expect(restoredSession.sessionId).toBe(originalSessionId);
    expect(restoredSession.type).toBe('temporary');
  });

  test('should preserve session cryptographic state during serialization', async () => {
    const clientPath = process.env.VITEST_PLAYREADY_CLIENT_PATH;
    if (!clientPath)
      return console.warn('PlayReady client not found. Skipping test');

    const clientData = await readFile(clientPath);
    const client = await PlayReadyCdm.Client.from({ prd: clientData });

    // Create session
    const originalSession = new PlayReadySession('temporary', client);

    // Serialize and deserialize
    const serialized = originalSession.toString();
    const restoredSession = PlayReadySession.from(serialized, client);

    // Verify cryptographic properties are preserved
    expect(restoredSession.certificateChain).toBeDefined();
    expect(restoredSession.certificateChain.length).toBeGreaterThan(0);
    expect(restoredSession.encryptionKey).toBeDefined();
    expect(restoredSession.signingKey).toBeDefined();
    expect(restoredSession.rgbMagicConstantZero).toBeDefined();
    expect(restoredSession.wmrmServerKey).toBeDefined();
    expect(restoredSession.wmrmServerKey.x).toBeDefined();
    expect(restoredSession.wmrmServerKey.y).toBeDefined();
    expect(restoredSession.clientVersion).toBe(originalSession.clientVersion);
  });

  test('should handle persistent-license session type for playready', async () => {
    const clientPath = process.env.VITEST_PLAYREADY_CLIENT_PATH;
    if (!clientPath)
      return console.warn('PlayReady client not found. Skipping test');

    const clientData = await readFile(clientPath);
    const client = await PlayReadyCdm.Client.from({ prd: clientData });
    const cdm = new PlayReadyCdm({ client });

    // Create persistent session
    const keySystemAccess = requestMediaKeySystemAccess(cdm.keySystem, []);
    const mediaKeys = await keySystemAccess.createMediaKeys({ cdm });
    const session = mediaKeys.createSession('persistent-license');

    // Serialize
    const serialized = session.toString();

    // Deserialize
    const parsed = cdm.parseSession(serialized);
    expect(parsed.sessionType).toBe('persistent-license');

    const restoredSession = cdm.sessions.get(parsed.sessionId);
    expect(restoredSession!.type).toBe('persistent-license');
  });
});

describe('Cross-system Serialization', () => {
  test('should properly distinguish between widevine and playready serialized data', async () => {
    const widevinePath = process.env.VITEST_WIDEVINE_CLIENT_PATH;
    const playreadyPath = process.env.VITEST_PLAYREADY_CLIENT_PATH;

    if (!widevinePath || !playreadyPath)
      return console.warn('Client not found. Skipping test');

    // Create Widevine session
    const widevineData = await readFile(widevinePath);
    const widevineClient = await WidevineCdm.Client.from({ wvd: widevineData });
    const widevineSession = new WidevineSession('temporary', widevineClient);
    const widevineSerialized = widevineSession.toString();

    // Create PlayReady session
    const playreadyData = await readFile(playreadyPath);
    const playreadyClient = await PlayReadyCdm.Client.from({
      prd: playreadyData,
    });
    const playreadySession = new PlayReadySession('temporary', playreadyClient);
    const playreadySerialized = playreadySession.toString();

    // Verify they are different
    expect(widevineSerialized).not.toBe(playreadySerialized);

    // Verify each can only be deserialized by its own type
    const widevineRestored = WidevineSession.from(
      widevineSerialized,
      widevineClient,
    );
    const playreadyRestored = PlayReadySession.from(
      playreadySerialized,
      playreadyClient,
    );

    expect(widevineRestored.sessionId).toBe(widevineSession.sessionId);
    expect(playreadyRestored.sessionId).toBe(playreadySession.sessionId);
  });
});
