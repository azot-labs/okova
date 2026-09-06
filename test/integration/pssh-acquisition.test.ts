import { readFile } from 'node:fs/promises';
import { assert, expect, test } from 'vitest';
import {
  PlayReady,
  PlayReadyDeviceCredentials,
  Widevine,
  WidevineDeviceCredentials,
} from '../../src/lib';
import { LicenseRequest, SignedMessage } from '../../src/lib/widevine/proto';
import { widevineInputs, playreadyInputs, payload, xml } from '../helpers/pssh-acquisition';

const wvdPath = process.env.VITEST_WVD_PATH;
const prdPath = process.env.VITEST_PRD_PATH;

test.skipIf(!wvdPath).each(widevineInputs)(
  'Widevine challenge preserves payload from $name',
  async ({ bytes }) => {
    assert(wvdPath, 'Set VITEST_WVD_PATH to enable offline challenge tests');
    const engine = new Widevine({
      deviceCredentials: await WidevineDeviceCredentials.from({ wvd: await readFile(wvdPath) }),
    });
    const session = engine.createSession();
    const messages: Uint8Array[] = [];
    session.onmessage = (event) => {
      messages.push(event.detail.message);
    };
    try {
      await session.generateRequest(bytes);
      expect(messages).toHaveLength(1);
      const message = messages[0];
      assert(message);
      const request = LicenseRequest.decode(SignedMessage.decode(message).msg);
      expect(request.contentId?.widevinePsshData?.psshData).toEqual([payload]);
    } finally {
      await session.close();
    }
  },
);

test.skipIf(!prdPath).each(playreadyInputs)(
  'PlayReady challenge preserves Unicode header from $name',
  async ({ bytes }) => {
    assert(prdPath, 'Set VITEST_PRD_PATH to enable offline challenge tests');
    const engine = new PlayReady({
      deviceCredentials: await PlayReadyDeviceCredentials.from({ prd: await readFile(prdPath) }),
    });
    const session = engine.createSession();
    const messages: Uint8Array[] = [];
    session.onmessage = (event) => {
      messages.push(event.detail.message);
    };
    try {
      await session.generateRequest(bytes);
      expect(messages).toHaveLength(1);
      expect(new TextDecoder().decode(messages[0])).toContain(xml);
    } finally {
      await session.close();
    }
  },
);
