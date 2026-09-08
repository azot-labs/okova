import { beforeEach, expect, test } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import {
  clearCaptureDiagnostics,
  closeCaptureDiagnostics,
  getCaptureDiagnosticsStorage,
  saveCaptureDiagnostic,
  type CaptureDiagnostic,
} from '../src/extension/utils/session-diagnostics';

beforeEach(() => fakeBrowser.reset());

const capture = (index: number): CaptureDiagnostic => ({
  captureId: `capture-${index}`,
  owner: `owner-${index}`,
  createdAt: index,
  origin: 'https://example.com',
  frameOrigin: 'https://frame.example.com',
  frameId: 2,
  documentId: 'document',
  keySystem: 'com.widevine.alpha',
  credential: null,
  sessionId: null,
  outcome: 'pending',
  keyCount: 0,
  events: [{ stage: 'license', status: 'started', at: index }],
});

test('concurrent captures retain the latest 20 and remain isolated by tab', async () => {
  await Promise.all(
    Array.from({ length: 25 }, (_, index) => saveCaptureDiagnostic(1, capture(index), () => true)),
  );
  await saveCaptureDiagnostic(2, capture(0), () => true);
  const records = (await getCaptureDiagnosticsStorage(1).getValue())!;
  expect(records.map((record) => record.createdAt)).toEqual(
    Array.from({ length: 20 }, (_, index) => index + 5),
  );
  await clearCaptureDiagnostics(1);
  expect(await getCaptureDiagnosticsStorage(1).getValue()).toBeNull();
  expect(await getCaptureDiagnosticsStorage(2).getValue()).toHaveLength(1);
});

test('cleanup rejects late writes and interruption preserves the last stage', async () => {
  let isCurrent = true;
  await saveCaptureDiagnostic(1, capture(0), () => isCurrent);
  await closeCaptureDiagnostics(1);
  expect((await getCaptureDiagnosticsStorage(1).getValue())?.[0]).toMatchObject({
    outcome: 'closed',
    events: [{ stage: 'license', status: 'interrupted' }],
  });
  isCurrent = false;
  await Promise.all([
    clearCaptureDiagnostics(1),
    saveCaptureDiagnostic(1, capture(0), () => isCurrent),
  ]);
  await closeCaptureDiagnostics(1);
  expect(await getCaptureDiagnosticsStorage(1).getValue()).toBeNull();
});
