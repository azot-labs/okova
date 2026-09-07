import { popupHistory } from '../utils/history';
import { TbOutlineDownload } from 'solid-icons/tb';
import { DeleteKeys } from '../components/delete-keys';
import { Layout } from '../components/layout';
import { Header } from '../components/header';
import { Cell } from '../components/cell';
import { KeyInfo } from '@/utils/storage';
import { KeysList } from '../components/keys-list';
import { NoKeys } from '../components/no-keys';
import { Section } from '../components/section';
import { serializeHistory, type HistoryExportFormat } from '../utils/history-export';
import { saveFile } from '../utils/file';
import { filterHistory, type HistoryFilters } from '../utils/history-filters';

export const Keys = () => {
  const [keys, setKeys] = createSignal<KeyInfo[]>([]);
  const [search, setSearch] = createSignal('');
  const [drm, setDrm] = createSignal<HistoryFilters['drm']>('all');
  const [order, setOrder] = createSignal<HistoryFilters['order']>('newest');
  const filteredKeys = createMemo(() =>
    filterHistory(keys(), { search: search(), drm: drm(), order: order() }),
  );
  const clearFilters = () => {
    setSearch('');
    setDrm('all');
  };
  const [isExporting, setIsExporting] = createSignal(false);
  const [exportError, setExportError] = createSignal<string>();

  const exportKeys = async (format: HistoryExportFormat) => {
    if (isExporting()) return;
    setIsExporting(true);
    setExportError(undefined);
    try {
      const records = filteredKeys();
      const content = serializeHistory(records, format);
      const filename = format === 'json' ? 'okova-history.json' : 'okova-keys.txt';
      await saveFile(new TextEncoder().encode(content), filename);
    } catch (error) {
      if (!(error instanceof Error && error.name === 'AbortError')) {
        setExportError('Export failed. Please try again.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  let isDisposed = false;
  let hasUpdate = false;
  const unwatch = popupHistory.allKeys.raw.watch((records) => {
    hasUpdate = true;
    setKeys(records ?? []);
  });
  onCleanup(() => {
    isDisposed = true;
    unwatch();
  });
  onMount(async () => {
    const records = await popupHistory.allKeys.getValue();
    // A storage event may arrive before the initial read resolves.
    if (!isDisposed && !hasUpdate) setKeys(records ?? []);
  });

  return (
    <Layout>
      <Header backHref="/">Keys</Header>
      <div class="flex flex-col gap-3">
        <Section
          header="Actions"
          footer={
            <Show when={exportError()}>
              <span role="alert">{exportError()}</span>
            </Show>
          }
        >
          <Cell
            component="button"
            before={<TbOutlineDownload />}
            variant="primary"
            subtitle="Matching records, including statuses and metadata"
            disabled={isExporting() || !filteredKeys().length}
            onClick={() => exportKeys('json')}
          >
            Export Results as JSON
          </Cell>
          <Cell
            component="button"
            before={<TbOutlineDownload />}
            variant="primary"
            subtitle="Unique KID:KEY pairs, one per line"
            disabled={isExporting() || !filteredKeys().length}
            onClick={() => exportKeys('txt')}
          >
            Export Results as TXT
          </Cell>
          <DeleteKeys label="Delete All" scope={{ kind: 'all' }} />
        </Section>
        <KeysList
          keys={filteredKeys}
          allKeys={keys}
          header="All Keys"
          search={{ value: search(), onChange: setSearch }}
          controls={
            <>
              <select
                aria-label="DRM"
                class="min-w-[105px] min-h-4 px-0.5 outline-none font-normal rounded-md bg-transparent hover:bg-neutral-100 hover:dark:bg-neutral-800 hover:cursor-pointer dark:[color-scheme:dark]"
                value={drm()}
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  if (
                    value === 'all' ||
                    value === 'W' ||
                    value === 'P' ||
                    value === 'C' ||
                    value === 'unknown'
                  )
                    setDrm(value);
                }}
              >
                <option value="all">All DRM systems</option>
                <option value="W">Widevine</option>
                <option value="P">PlayReady</option>
                <option value="C">ClearKey</option>
                <option value="unknown">Unknown</option>
              </select>
              <select
                aria-label="Order"
                class="min-w-[82px] min-h-4 px-0.5 outline-none font-normal rounded-md bg-transparent hover:bg-neutral-100 hover:dark:bg-neutral-800 hover:cursor-pointer dark:[color-scheme:dark]"
                value={order()}
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  if (value === 'newest' || value === 'oldest') setOrder(value);
                }}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </>
          }
          selectable
        />
        <Show when={!filteredKeys().length}>
          <Show when={keys().length} fallback={<NoKeys />}>
            <div class="flex flex-col items-center gap-1 py-4 text-center">
              <h1 class="text-[16px] font-semibold">No matching keys</h1>
              <p class="text-[13px] text-neutral-800 dark:text-neutral-300">
                Try another search or adjust filters.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                class="rounded px-3 py-2 text-[13px] text-blue-600 hover:underline focus-visible:outline-2 dark:text-blue-400"
              >
                Clear filters
              </button>
            </div>
          </Show>
        </Show>
      </div>
    </Layout>
  );
};
