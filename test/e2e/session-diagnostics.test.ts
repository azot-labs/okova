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
      await popup.getByText('Test device', { exact: true }).waitFor();
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
      await worker.evaluate(
        async ({ popupUrl, record }) => {
          const tabs = await browser.tabs.query({});
          const tab = tabs.find((tab) => tab.url === popupUrl)!;
          await browser.storage.session.set({
            [`capture-diagnostics:${tab.id}`]: [
              {
                ...record,
                captureId: 'clear-key-capture',
                sessionId: 'CLEAR123',
                keySystem: 'org.w3.clearkey',
                outcome: 'keys-returned',
                keyCount: 1,
                createdAt: 998,
              },
              {
                ...record,
                captureId: 'queued-capture',
                sessionId: null,
                keySystem: 'com.microsoft.playready.recommendation',
                outcome: 'pending',
                createdAt: 999,
              },
              record,
            ],
          });
        },
        { popupUrl, record },
      );
      await expect.poll(() => popup.getByText('Sessions', { exact: true }).count()).toBe(1);
      expect(await popup.getByText('Session diagnostics', { exact: true }).count()).toBe(0);
      expect(await popup.getByText('Widevine · No content keys', { exact: true }).count()).toBe(1);
      expect(await popup.getByText('PlayReady · In progress', { exact: true }).count()).toBe(1);
      expect(await popup.getByText('ClearKey · 1 key', { exact: true }).count()).toBe(1);
      expect(await popup.getByText('Capture queued-capture', { exact: true }).count()).toBe(1);
      const captureRow = popup.locator(`[data-capture-id="${record.captureId}"]`);
      const disclosure = popup.getByRole('button', { name: /^ABC123/ });
      await disclosure.focus();
      await disclosure.press('Enter');
      expect(await popup.getByText('Session: ABC123', { exact: true }).isVisible()).toBe(true);
      expect(await popup.getByText('Source: Main page', { exact: true }).isVisible()).toBe(true);
      expect(
        await popup.getByText('Credentials: Test device · Widevine', { exact: false }).count(),
      ).toBe(1);
      const timeline = popup.locator('ol');
      expect(await timeline.textContent()).not.toContain('succeeded');
      expect(await timeline.textContent()).not.toContain('Request setup');
      expect(await timeline.textContent()).not.toContain('Session storage');
      expect(await timeline.textContent()).toMatch(/\d{2}:\d{2}:\d{2}\.100 · License processing/);
      expect(await timeline.textContent()).toContain('Key extraction · failed');
      await popup.mouse.move(0, 0);
      await disclosure.focus();
      await popup.keyboard.press('Tab');
      const copyButton = captureRow.getByRole('button', { name: 'Copy diagnostic trace' });
      expect(await copyButton.evaluate((button) => button === document.activeElement)).toBe(true);
      await expect
        .poll(() =>
          copyButton.evaluate((button) => getComputedStyle(button.parentElement!).opacity),
        )
        .toBe('1');
      await copyButton.press('Enter');
      await expect
        .poll(() => captureRow.getByRole('status').textContent())
        .toContain('Trace copied');
      expect(await popup.getByRole('status').filter({ hasText: 'Trace copied' }).count()).toBe(1);
      expect(await popup.locator('[data-capture-id="queued-capture"]').textContent()).not.toContain(
        'Trace copied',
      );
      await context.grantPermissions(['clipboard-read']);
      const copied = await popup.evaluate(() => navigator.clipboard.readText());
      expect(JSON.parse(copied).captureId).toBe(record.captureId);
      expect(copied).not.toContain(record.owner);
      expect(JSON.parse(copied).events).toEqual(record.events);
      expect(copied).not.toContain('test-secret');
      await popup.evaluate(() =>
        Object.defineProperty(window, 'showSaveFilePicker', { value: undefined }),
      );
      const downloaded = popup.waitForEvent('download');
      await popup.getByRole('button', { name: 'Download diagnostic trace' }).first().click();
      const download = await downloaded;
      expect(download.suggestedFilename()).toBe(`okova-trace-${record.captureId}.json`);
      const downloadPath = await download.path();
      expect(downloadPath).not.toBeNull();
      expect(await readFile(downloadPath!, 'utf8')).toBe(copied);
      await expect
        .poll(() => captureRow.getByRole('status').textContent())
        .toContain('Trace saved');
      expect(await popup.getByRole('status').filter({ hasText: 'Trace saved' }).count()).toBe(1);
      expect(await disclosure.getAttribute('aria-expanded')).toBe('true');
      expect(
        await popup
          .locator('#root')
          .evaluate((element) => element.scrollWidth > element.clientWidth),
      ).toBe(false);
      await mkdir(resolve('output/playwright/session-diagnostics'), { recursive: true });
      await popup.screenshot({ path: resolve('output/playwright/session-diagnostics/popup.png') });
      await worker.evaluate(async (record) => {
        const records = await browser.storage.session.get(null);
        const entry = Object.entries(records).find(([key]) =>
          key.startsWith('capture-diagnostics:'),
        )!;
        await browser.storage.session.set({
          [entry[0]]: [
            {
              ...record,
              frameId: 2,
              frameOrigin: 'https://player.example.com',
              events: [
                { stage: 'setup', status: 'failed', at: 1000 },
                { stage: 'storage', status: 'started', at: 1001 },
                { stage: 'license', status: 'interrupted', at: 1002 },
              ],
            },
          ],
        });
      }, record);
      await expect
        .poll(() =>
          popup.getByText('Source: Iframe 2 · https://player.example.com', { exact: true }).count(),
        )
        .toBe(1);
      expect(await timeline.textContent()).toContain('Request setup · failed');
      expect(await timeline.textContent()).toContain('Session storage · in progress');
      expect(await timeline.textContent()).toContain('License processing · interrupted');
      expect(await disclosure.getAttribute('aria-expanded')).toBe('true');
      await popup.evaluate(() => {
        navigator.clipboard.writeText = async () => {
          throw new Error('Clipboard unavailable');
        };
      });
      await popup.getByRole('button', { name: 'Copy diagnostic trace' }).first().click();
      await expect
        .poll(() => captureRow.getByRole('status').textContent())
        .toContain('Could not copy trace. Try again');
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
