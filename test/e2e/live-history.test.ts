import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { expect, test } from 'vitest';
import type { KeyInfo } from '../../src/extension/utils/storage';
import { openRecordDetails } from './capture-ui';

test('history updates preserve search, scroll, and expanded record details', async () => {
  const profile = await mkdtemp(join(tmpdir(), 'okova-live-history-'));
  const extension = resolve('.output/chrome-mv3');
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
    const selected = records[39]!;
    const save = () =>
      worker.evaluate(async (records) => {
        await browser.storage.local.set({ 'all-keys': JSON.stringify(records) });
      }, records);
    await save();
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${new URL(worker.url()).hostname}/popup.html`);
    await popup.getByRole('link', { name: 'Captures', exact: true }).click();
    const search = popup.getByRole('searchbox', { includeHidden: true });
    await popup.getByRole('button', { name: 'Search', exact: true }).click();
    await search.fill('history.example');
    const count = popup.getByRole('status', { name: /total captures$/ });
    await expect.poll(() => count.textContent()).toBe('(60)');
    const anchor = popup
      .locator('[data-capture-row]')
      .filter({ hasText: selected.url.replace('https://', '') });
    await anchor.evaluate((element) => element.scrollIntoView({ block: 'center' }));
    const identity = await anchor.getAttribute('data-history-row');
    const stable = popup.locator(`[data-history-row="${identity}"]`);
    const before = await stable.evaluate((element) => element.getBoundingClientRect().top);
    records = [{ ...records[0]!, id: 'new-record' }, ...records];
    await save();
    await expect.poll(() => count.textContent()).toBe('(61)');
    await expect
      .poll(async () =>
        Math.abs(
          (await stable.evaluate((element) => element.getBoundingClientRect().top)) - before,
        ),
      )
      .toBeLessThanOrEqual(1);
    records = records.slice(6);
    await save();
    await expect.poll(() => count.textContent()).toBe('(55)');
    await expect
      .poll(async () =>
        Math.abs(
          (await stable.evaluate((element) => element.getBoundingClientRect().top)) - before,
        ),
      )
      .toBeLessThanOrEqual(1);
    expect(await search.inputValue()).toBe('history.example');
    const details = await openRecordDetails(stable);
    const command = details.getByRole('textbox', { name: 'Download command' });
    const updated = { ...selected, mpd: 'https://cdn.example/live.mpd' };
    records = records.map((record) => (record.id === selected.id ? updated : record));
    await save();
    await expect.poll(() => command.inputValue(), { timeout: 5000 }).toContain(updated.mpd);
    expect(await stable.getAttribute('open')).not.toBeNull();
    await command.fill('my custom command');
    records = records.map((record) =>
      record.id === selected.id ? { ...updated, pssh: 'updated-pssh' } : record,
    );
    await save();
    await expect.poll(() => details.getByText('updated-pssh', { exact: true }).count()).toBe(1);
    expect(await command.inputValue()).toBe('my custom command');
    expect(await popup.locator('#root > main').isVisible()).toBe(true);
    // Inline details leave the list when their capture no longer matches its search.
    records = records.map((record) =>
      record.id === selected.id ? { ...record, url: 'https://outside.example' } : record,
    );
    await save();
    await expect.poll(() => stable.count()).toBe(0);
    expect(await search.inputValue()).toBe('history.example');
    await worker.evaluate(async () => {
      await browser.storage.local.remove('all-keys');
    });
    await expect.poll(() => popup.locator('[data-capture-row]').count()).toBe(0);
    expect(await count.textContent()).toBe('(0)');
    records = [updated];
    await save();
    await expect.poll(() => count.textContent()).toBe('(1)');
  } finally {
    await context.close();
    await rm(profile, { recursive: true, force: true });
  }
});
