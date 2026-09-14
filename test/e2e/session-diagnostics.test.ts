import { remoteCredentialsSchema } from '../../src/lib/remote/credentials';
import { createHmac } from 'node:crypto';
import { z } from 'zod';
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { expect, test } from 'vitest';
import type { CaptureDiagnostic } from '../../src/extension/utils/session-diagnostics';

test('popup displays session progress and copies a trace without bridge tokens', async () => {
  const profile = await mkdtemp(join(tmpdir(), 'okova-diagnostics-'));
  const extension = resolve('.output/chrome-mv3');
  try {
    const context = await chromium.launchPersistentContext(profile, {
      channel: 'chromium',
      headless: true,
      viewport: { width: 500, height: 600 },
      args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
    });
    try {
      const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
      const popup = await context.newPage();
      const popupUrl = `chrome-extension://${new URL(worker.url()).hostname}/popup.html`;
      await popup.goto(popupUrl);
      await popup.locator('input[type=file]').setInputFiles({
        name: 'remote.json',
        mimeType: 'application/json',
        buffer: Buffer.from(
          JSON.stringify({
            protocol: 'okova',
            label: 'Test device',
            keySystem: 'com.widevine.alpha',
            baseUrl: 'https://cdm.example.com',
            secret: 'test-secret',
          }),
        ),
      });
      await popup.getByText('Widevine: Test device', { exact: true }).waitFor();
      const registry = z
        .object({
          credentials: z
            .array(
              z.object({
                info: z.object({ type: z.literal('remote'), config: remoteCredentialsSchema }),
              }),
            )
            .min(1),
        })
        .parse(
          await worker.evaluate(
            async () =>
              (await browser.storage.local.get('credentials-registry'))['credentials-registry'],
          ),
        );
      const fingerprintKey = Buffer.alloc(32, 7);
      await worker.evaluate(
        async (key) => browser.storage.local.set({ 'diagnostic-fingerprint-key': key }),
        fingerprintKey.toString('base64'),
      );
      const fingerprint = `v2:${createHmac('sha256', fingerprintKey)
        .update(JSON.stringify(registry.credentials[0]!.info))
        .digest('hex')}`;
      const record: CaptureDiagnostic = {
        captureId: 'b1d8ef94-4203-43d2-9299-c5bec9873261',
        owner: 'private-bridge-token',
        createdAt: 1000,
        origin: 'https://example.com',
        frameOrigin: 'https://example.com',
        frameId: 0,
        documentId: 'player-document',
        keySystem: 'com.widevine.alpha',
        credential: {
          type: 'remote',
          fingerprint,
          name: 'Test device',
          keySystem: 'com.widevine.alpha',
        },
        sessionId: 'ABC123',
        outcome: 'no-content-keys',
        keyCount: 0,
        events: [
          { stage: 'eme', status: 'succeeded', at: 1000 },
          { stage: 'setup', status: 'succeeded', at: 1001 },
          { stage: 'storage', status: 'succeeded', at: 1002 },
          { stage: 'challenge', status: 'succeeded', at: 1020, completedAt: 1050 },
          { stage: 'license', status: 'succeeded', at: 1100, completedAt: 1200 },
          { stage: 'keys', status: 'failed', at: 1200, completedAt: 1200 },
        ],
      };
      const seed = async (records: CaptureDiagnostic[]) =>
        worker.evaluate(async (records) => {
          await navigator.locks.request('okova:key-history', async () => {
            const raw = (await browser.storage.local.get('capture-history'))['capture-history'];
            if (typeof raw !== 'string') throw new Error('Capture history missing');
            const history = JSON.parse(raw);
            history.captures = records.map((record) => {
              const diagnostic = { ...record };
              Reflect.deleteProperty(diagnostic, 'owner');
              return {
                id: diagnostic.captureId,
                aliases: [],
                source: { url: 'https://example.com/watch' },
                playlists: [],
                createdAt: diagnostic.createdAt,
                updatedAt: diagnostic.createdAt,
                sessions: [
                  {
                    id: diagnostic.captureId,
                    pssh: [],
                    records: [],
                    createdAt: diagnostic.createdAt,
                    updatedAt: diagnostic.createdAt,
                    diagnostic,
                  },
                ],
              };
            });
            await browser.storage.local.set({ 'capture-history': JSON.stringify(history) });
          });
        }, records);
      const queued: CaptureDiagnostic = {
        ...record,
        captureId: 'queued-capture',
        sessionId: null,
        keySystem: 'com.microsoft.playready.recommendation',
        outcome: 'pending',
        createdAt: 999,
      };
      await seed([queued, record]);
      await popup.getByRole('link', { name: 'Captures', exact: true }).click();
      const capture = popup
        .locator('[data-capture-row]')
        .filter({ hasText: 'example.com/watch' })
        .first();
      await capture.locator(':scope > summary').click({ position: { x: 8, y: 8 } });
      const session = popup.locator(`[data-capture-session="${record.captureId}"]`);
      await expect.poll(() => session.textContent()).toContain('No content keys');
      expect(await session.textContent()).toContain('Widevine');
      expect(await session.textContent()).toContain('Test device');
      const captureRow = session.locator(`[data-capture-id="${record.captureId}"]`);
      const disclosure = captureRow.locator('summary');
      await disclosure.click();
      expect(await captureRow.textContent()).toContain('Document ID: player-document');
      const timeline = captureRow.locator('ol');
      expect(await timeline.textContent()).not.toContain('Request setup');
      expect(await timeline.textContent()).toContain('Key extraction · failed');
      const copyButton = captureRow.getByRole('button', { name: 'Copy diagnostic trace' });
      await copyButton.focus();
      await copyButton.press('Enter');
      await expect.poll(() => captureRow.getByRole('status').textContent()).toBe('Trace copied');
      await context.grantPermissions(['clipboard-read']);
      const copied = await popup.evaluate(() => navigator.clipboard.readText());
      expect(JSON.parse(copied).captureId).toBe(record.captureId);
      expect(copied).not.toContain(record.owner);
      expect(copied).not.toContain('test-secret');
      expect(JSON.parse(copied).events).toEqual(record.events);
      await popup.evaluate(() =>
        Object.defineProperty(window, 'showSaveFilePicker', { value: undefined }),
      );
      const downloaded = popup.waitForEvent('download');
      await captureRow.getByRole('button', { name: 'Download diagnostic trace' }).click();
      const download = await downloaded;
      expect(download.suggestedFilename()).toBe(`okova-trace-${record.captureId}.json`);
      expect(await readFile((await download.path())!, 'utf8')).toBe(copied);
      await seed([
        queued,
        { ...record, events: [{ stage: 'license', status: 'interrupted', at: 1002 }] },
      ]);
      await expect.poll(() => timeline.textContent()).toContain('License processing · interrupted');
      expect(await captureRow.getAttribute('open')).not.toBeNull();
      await popup.evaluate(() => {
        navigator.clipboard.writeText = async () => {
          throw new Error('Clipboard unavailable');
        };
      });
      await copyButton.click();
      await expect
        .poll(() => captureRow.getByRole('status').textContent())
        .toBe('Could not copy trace. Try again');
      await mkdir(resolve('output/playwright/session-diagnostics'), { recursive: true });
      await popup.screenshot({
        animations: 'disabled',
        path: resolve('output/playwright/session-diagnostics/popup.png'),
      });
      await popup.goto(`chrome-extension://${new URL(worker.url()).hostname}/popup.html`);
      await popup.getByRole('link', { name: 'Credentials', exact: true }).click();
      await popup.getByText('Test device', { exact: true }).hover();
      await popup.getByTitle('Credentials Settings').click();
      await expect
        .poll(() => popup.getByText(fingerprint.slice(0, 12), { exact: true }).count())
        .toBe(1);
    } finally {
      await context.close();
    }
  } finally {
    await rm(profile, { recursive: true, force: true });
  }
});
