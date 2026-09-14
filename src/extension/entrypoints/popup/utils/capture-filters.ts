import { captureRecords, type StoredCapture } from '@/utils/storage/capture-history';
import { getBadgeDrmSystem } from '@/utils/badge';
import { type Accessor, batch } from 'solid-js';
import { getWebsiteDomain } from '@/utils/storage';
import { storedCaptureGroups } from '@/utils/capture-groups';
import { filterHistory, type HistoryFilters } from './history-filters';

/** Owns filtering state independently of the list and where its controls are rendered. */
export const createCaptureFilters = (stored: Accessor<StoredCapture[]>) => {
  const records = createMemo(() => captureRecords(stored()));
  const [search, setSearch] = createSignal('');
  const [site, setSite] = createSignal('');
  const [drm, setDrm] = createSignal<HistoryFilters['drm']>('all');
  const [order, setOrder] = createSignal<HistoryFilters['order']>('newest');
  const sites = createMemo(() =>
    [
      ...new Set(
        stored().flatMap((capture) => {
          const domain = getWebsiteDomain(capture.source.url);
          return domain ? [domain] : [];
        }),
      ),
    ].sort(),
  );
  const allCaptures = createMemo(() => storedCaptureGroups(stored()));
  const captures = createMemo(() => {
    const matching = new Set(
      filterHistory(records(), { search: search(), site: site(), drm: drm(), order: order() }),
    );
    const query = search().trim().toLowerCase();
    return allCaptures()
      .filter((capture) => {
        if (capture.recordIndexes.some((index) => matching.has(records()[index]!))) return true;
        const matchesSite = !site() || getWebsiteDomain(capture.url) === site();
        const matchesDrm =
          drm() === 'all' ||
          (drm() === 'unknown' && !capture.recordIndexes.length && !capture.diagnostics?.length) ||
          capture.diagnostics?.some(
            (record) => (getBadgeDrmSystem(record.keySystem) ?? 'unknown') === drm(),
          ) ||
          capture.recordIndexes.some(
            (index) => (records()[index]?.drmSystem ?? 'unknown') === drm(),
          );
        const matchesSearch =
          !query ||
          [
            capture.url,
            capture.manifestUrl ?? '',
            ...capture.sessionIds,
            ...(capture.diagnostics?.flatMap((record) => [
              record.sessionId ?? '',
              record.outcome,
              record.keySystem,
            ]) ?? []),
            ...(capture.stream?.playlists.map((playlist) => playlist.url) ?? []),
          ].some((value) => value.toLowerCase().includes(query));
        return matchesSite && matchesDrm && matchesSearch;
      })
      .sort((left, right) => {
        return order() === 'newest'
          ? right.createdAt - left.createdAt
          : left.createdAt - right.createdAt;
      });
  });
  createEffect(() => {
    if (site() && !sites().includes(site())) setSite('');
  });

  return {
    records,
    allCaptures,
    captures,
    keys: createMemo(() =>
      captures().flatMap((capture) =>
        capture.recordIndexes.flatMap((index) => {
          const record = records()[index];
          return record ? [record] : [];
        }),
      ),
    ),
    search: {
      get value() {
        return search();
      },
      onChange: setSearch,
    },
    site: {
      get value() {
        return site();
      },
      get options() {
        return sites();
      },
      onChange: setSite,
    },
    drm: {
      get value() {
        return drm();
      },
      onChange: setDrm,
    },
    order: {
      get value() {
        return order();
      },
      onChange: setOrder,
    },
    clear: () =>
      batch(() => {
        setSearch('');
        setSite('');
        setDrm('all');
      }),
  };
};
