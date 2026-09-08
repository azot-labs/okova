import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { expect, test } from 'vitest';
import type { KeyInfo } from '../../src/extension/utils/storage';

test('history updates preserve search, visible rows, and live details', async () => {
  const profile = await mkdtemp(join(tmpdir(), 'okova-live-history-'));
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
      let records: KeyInfo[] = Array.from({ length: 60 }, (_, index) => ({
        id: index.toString(16).padStart(32, '0'),
        value: 'usable',
        url: `https://history.example/watch/${index}`,
        pssh: '',
        createdAt: Date.now() + index,
      }));
      const save = () =>
        worker.evaluate(async (records) => {
          await browser.storage.local.set({ 'all-keys': JSON.stringify(records) });
        }, records);
      await save();
      const popup = await context.newPage();
      await popup.goto(`chrome-extension://${new URL(worker.url()).hostname}/popup.html`);
      await popup.getByRole('link', { name: 'Keys', exact: true }).click();
      const search = popup.getByRole('searchbox', { includeHidden: true });
      await popup.getByRole('button', { name: 'Search', exact: true }).click();
      await search.fill('history.example');
      const count = popup.getByRole('status');
      await expect.poll(() => count.textContent()).toBe('(60)');
      const root = popup.locator('#root');
      await root.evaluate((element) => {
        element.scrollTop = 1100;
      });
      const anchor = popup.locator('[data-history-row]').nth(20);
      const anchorIdentity = await anchor.getAttribute('data-history-row');
      const stableAnchor = popup.locator(`[data-history-row="${anchorIdentity}"]`);
      const anchorKid = await stableAnchor.locator('code span').first().textContent();
      const before = await stableAnchor.evaluate((element) => element.getBoundingClientRect().top);
      records = [{ ...records[0]!, id: 'new-record' }, ...records];
      await save();
      await expect.poll(() => count.textContent()).toBe('(61)');
      await expect
        .poll(async () =>
          Math.abs(
            (await stableAnchor.evaluate((element) => element.getBoundingClientRect().top)) -
              before,
          ),
        )
        .toBeLessThanOrEqual(1);
      records = records.slice(6);
      await save();
      await expect.poll(() => count.textContent()).toBe('(55)');
      await expect
        .poll(async () =>
          Math.abs(
            (await stableAnchor.evaluate((element) => element.getBoundingClientRect().top)) -
              before,
          ),
        )
        .toBeLessThanOrEqual(1);
      expect(await search.inputValue()).toBe('history.example');

      await stableAnchor.locator('code').click();
      const details = popup.locator('main').last();
      const command = details.getByRole('textbox', { name: 'Download command' });
      const manifestUrl = details.getByRole('textbox', { name: 'Manifest URL' });
      const copyCommand = details.getByRole('button', { name: 'Copy command', exact: true });
      expect(await command.inputValue()).toBe('');
      expect(await command.isDisabled()).toBe(true);
      expect(await copyCommand.isDisabled()).toBe(true);
      const selected = records.find((record) => record.id === anchorKid)!;
      const captured = { ...selected, value: 'a'.repeat(32), mpd: 'https://cdn.example/live.mpd' };
      records = records.map((record) => (record === selected ? captured : record));
      await save();
      await expect.poll(() => command.inputValue()).toContain(captured.value);
      expect(await manifestUrl.inputValue()).toBe(captured.mpd);
      expect(await command.inputValue()).toContain(captured.mpd);
      expect(await command.isEnabled()).toBe(true);
      expect(await copyCommand.isEnabled()).toBe(true);
      expect(await details.getByText(captured.value, { exact: true }).isVisible()).toBe(true);
      await command.fill('my custom command');
      await details.evaluate((element) => {
        element.scrollTop = 100;
      });
      const detailsScroll = await details.evaluate((element) => element.scrollTop);
      records = records.map((record) =>
        record === captured ? { ...captured, pssh: 'updated-pssh' } : record,
      );
      await save();
      await expect.poll(() => details.getByText('updated-pssh', { exact: true }).count()).toBe(1);
      expect(await command.inputValue()).toBe('my custom command');
      expect(await details.evaluate((element) => element.scrollTop)).toBe(detailsScroll);
      await details.locator('svg').first().click();
      await expect.poll(() => popup.getByText('Key Details', { exact: true }).count()).toBe(0);
      expect(await popup.getByRole('button', { name: 'Search', exact: true }).isVisible()).toBe(
        true,
      );
      expect(
        Math.abs(
          (await stableAnchor.evaluate((element) => element.getBoundingClientRect().top)) - before,
        ),
      ).toBeLessThanOrEqual(1);
      await stableAnchor.locator('code').click();
      records = records.map((record) =>
        record.id === selected.id ? { ...record, url: 'https://outside.example' } : record,
      );
      await save();
      await expect
        .poll(() => details.getByText('https://outside.example', { exact: true }).count())
        .toBe(1);
      expect(await popup.getByText('Key Details', { exact: true }).isVisible()).toBe(true);
      records = records.filter((record) => record.id !== selected.id);
      await save();
      await expect.poll(() => popup.getByText('Key Details', { exact: true }).count()).toBe(0);
      expect(await popup.getByRole('button', { name: 'Search', exact: true }).isVisible()).toBe(
        true,
      );
      expect(await search.inputValue()).toBe('history.example');
      await worker.evaluate(async () => {
        await browser.storage.local.remove('all-keys');
      });
      await expect.poll(() => count.textContent()).toBe('(0)');
      records = [captured];
      await save();
      await expect.poll(() => count.textContent()).toBe('(1)');
    } finally {
      await context.close();
    }
  } finally {
    await rm(profile, { recursive: true, force: true });
  }
});
