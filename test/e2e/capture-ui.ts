import type { Locator, Page } from 'playwright';

// Expand the capture summaries without disturbing the search field's focus.
export const visibleKeyIds = async (page: Page) => {
  const captures = page.locator('[data-capture-row]');
  await captures.evaluateAll((elements) => {
    for (const element of elements) if (element instanceof HTMLDetailsElement) element.open = true;
  });
  return page
    .locator('[data-key-record]')
    .evaluateAll((elements) => elements.map((element) => element.getAttribute('data-key-record')));
};

export const openRecordDetails = async (capture: Locator) => {
  await capture.locator(':scope > summary').click({ position: { x: 8, y: 8 } });
  return capture;
};
