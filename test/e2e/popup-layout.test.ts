import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { expect, test } from 'vitest';

test.for([300, 450, 600])(
  'popup controls remain reachable at %ipx viewport height',
  async (height) => {
    const profile = await mkdtemp(join(tmpdir(), 'okova-popup-short-'));
    const extension = resolve('.output/chrome-mv3');
    try {
      const context = await chromium.launchPersistentContext(profile, {
        channel: 'chromium',
        headless: true,
        viewport: { width: 500, height },
        args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
      });
      try {
        const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
        const popup = await context.newPage();
        await popup.goto(`chrome-extension://${new URL(worker.url()).hostname}/popup.html`);
        await popup.getByRole('link', { name: 'Settings', exact: true }).click();
        const root = popup.locator('#root');
        expect(
          await root.evaluate((element) => element.getBoundingClientRect().bottom),
        ).toBeLessThanOrEqual(height);
        // Appearance and About sit side by side, so the page fits without
        // scrolling at 600px but still scrolls at shorter heights.
        expect(
          await root.evaluate((element) => ({
            width: element.clientWidth,
            scrollable: element.scrollHeight > element.clientHeight,
            horizontalOverflow: element.scrollWidth > element.clientWidth,
          })),
        ).toEqual({ width: 484, scrollable: height < 600, horizontalOverflow: false });
        await root.hover();
        await popup.mouse.wheel(0, 2000);
        const github = popup.getByRole('button', { name: 'GitHub', exact: true });
        // GitHub lives in the right column: 16px page padding + 228px
        // Appearance column + 12px flex gap from the left edge,
        // 16px scrollbar gutter at the right edge.
        await expect
          .poll(() =>
            github.evaluate((element) => {
              const bounds = element.getBoundingClientRect();
              return {
                visible: bounds.top >= 0 && bounds.bottom <= innerHeight,
                leftSpacing: bounds.left,
                rightSpacing: innerWidth - bounds.right,
              };
            }),
          )
          .toEqual({ visible: true, leftSpacing: 256, rightSpacing: 16 });
        await mkdir(resolve('output/playwright/popup-layout'), { recursive: true });
        await popup.screenshot({
          path: resolve(`output/playwright/popup-layout/settings-${height}px.png`),
        });
      } finally {
        await context.close();
      }
    } finally {
      await rm(profile, { recursive: true, force: true });
    }
  },
);
