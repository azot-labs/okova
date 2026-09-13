import { type Accessor, batch } from 'solid-js';
import { type KeyInfo } from '@/utils/storage';
import { filterHistory, getHistorySites, type HistoryFilters } from './history-filters';

/** Owns filtering state independently of the list and where its controls are rendered. */
export const createCaptureFilters = (records: Accessor<KeyInfo[]>) => {
  const [search, setSearch] = createSignal('');
  const [site, setSite] = createSignal('');
  const [drm, setDrm] = createSignal<HistoryFilters['drm']>('all');
  const [order, setOrder] = createSignal<HistoryFilters['order']>('newest');
  const sites = createMemo(() => getHistorySites(records()));
  createEffect(() => {
    if (site() && !sites().includes(site())) setSite('');
  });

  return {
    keys: createMemo(() =>
      filterHistory(records(), { search: search(), site: site(), drm: drm(), order: order() }),
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
