import type { KeyInfo } from '@/utils/storage';

export type HistoryRow = { identity: number; key: KeyInfo; visible: boolean };

// Storage has no record IDs. Match complete identities first, then unambiguous
// KIDs so a status becoming a captured key keeps its row and open details.
export const reconcileHistoryRows = (
  previous: HistoryRow[],
  records: KeyInfo[],
  visible: KeyInfo[],
  nextIdentity: () => number,
): HistoryRow[] => {
  const remaining = new Set(previous);
  const matches = records.map((key) => {
    const match = [...remaining].find(
      (row) =>
        row.key.id === key.id &&
        row.key.value === key.value &&
        row.key.url === key.url &&
        row.key.pssh === key.pssh,
    );
    if (match) remaining.delete(match);
    return match;
  });
  return records.map((key, index) => {
    let match = matches[index];
    if (!match) {
      const candidates = [...remaining].filter((row) => row.key.id === key.id);
      const unmatched = records.filter((record, index) => !matches[index] && record.id === key.id);
      if (candidates.length === 1 && unmatched.length === 1) {
        match = candidates[0];
        if (match) remaining.delete(match);
      }
    }
    return { identity: match?.identity ?? nextIdentity(), key, visible: visible.includes(key) };
  });
};

// Save several candidates so removing the first visible row can anchor its neighbor.
export const captureHistoryScroll = (list: HTMLElement | undefined) => {
  const root = document.getElementById('root');
  if (!root || !list) return () => {};
  const scrollTop = root.scrollTop;
  const bounds = root.getBoundingClientRect();
  const anchors = [...list.querySelectorAll<HTMLElement>('[data-history-row]')]
    .map((element) => ({ element, top: element.getBoundingClientRect().top }))
    .filter(
      ({ element, top }) =>
        top < bounds.bottom && element.getBoundingClientRect().bottom > bounds.top,
    );
  return () => {
    if (!root.isConnected) return;
    const anchor = anchors.find(
      ({ element }) => element.isConnected && element.getClientRects().length,
    );
    root.scrollTop = anchor
      ? root.scrollTop + anchor.element.getBoundingClientRect().top - anchor.top
      : scrollTop;
  };
};
