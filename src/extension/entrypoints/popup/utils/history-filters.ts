import type { KeyInfo } from '@/utils/storage';

export type HistoryFilters = {
  search: string;
  drm: 'all' | 'unknown' | NonNullable<KeyInfo['drmSystem']>;
  order: 'newest' | 'oldest';
};

export const filterHistory = (records: readonly KeyInfo[], filters: HistoryFilters): KeyInfo[] => {
  const query = filters.search.trim().toLowerCase();
  const kidQuery = query.replaceAll('-', '');

  return records
    .filter((key) => {
      const matchesDrm =
        filters.drm === 'all' ||
        (filters.drm === 'unknown' ? !key.drmSystem : key.drmSystem === filters.drm);
      const matchesSearch =
        !query ||
        (kidQuery.length > 0 && key.id.toLowerCase().replaceAll('-', '').includes(kidQuery)) ||
        key.url.toLowerCase().includes(query) ||
        key.mpd?.toLowerCase().includes(query);
      return matchesDrm && matchesSearch;
    })
    .sort((left, right) =>
      filters.order === 'newest'
        ? right.createdAt - left.createdAt
        : left.createdAt - right.createdAt,
    );
};
