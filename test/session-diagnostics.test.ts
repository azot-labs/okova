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
    Array.from({ length: 25 }, (_, index) =>
      saveCaptureDiagnostic(1, capture(index), () => true, true),
    ),
  );
  await saveCaptureDiagnostic(2, capture(0), () => true, true);
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
  await saveCaptureDiagnostic(1, capture(0), () => isCurrent, true);
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

test('closed records reject late saves even when their tab generation is unchanged', async () => {
  const stale = capture(0);
  await saveCaptureDiagnostic(1, stale, () => true, true);
  await closeCaptureDiagnostics(1, stale.owner);
  await saveCaptureDiagnostic(1, { ...stale, outcome: 'pending' }, () => true);
  expect((await getCaptureDiagnosticsStorage(1).getValue())?.[0]).toMatchObject({
    outcome: 'closed',
    events: [{ status: 'interrupted' }],
  });
});

test('cleanup closes unfinished observation stages but preserves completed observations', async () => {
  await saveCaptureDiagnostic(1, { ...capture(0), outcome: 'observed' }, () => true, true);
  await saveCaptureDiagnostic(
    1,
    { ...capture(1), outcome: 'observed', events: [{ stage: 'eme', status: 'succeeded', at: 1 }] },
    () => true,
    true,
  );
  await closeCaptureDiagnostics(1);
  expect(
    (await getCaptureDiagnosticsStorage(1).getValue())?.map((record) => record.outcome),
  ).toEqual(['closed', 'observed']);
});

test('late saves cannot recreate a retention-evicted record', async () => {
  for (let index = 0; index < 21; index++)
    await saveCaptureDiagnostic(1, capture(index), () => true, true);
  const before = await getCaptureDiagnosticsStorage(1).getValue();
  await saveCaptureDiagnostic(
    1,
    { ...capture(0), outcome: 'keys-returned', keyCount: 1 },
    () => true,
  );
  expect(await getCaptureDiagnosticsStorage(1).getValue()).toEqual(before);
});
