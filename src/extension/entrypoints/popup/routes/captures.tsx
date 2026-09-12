import { popupHistory } from '../utils/history';
import { TbOutlineFileDownload } from 'solid-icons/tb';
import { DeleteKeys } from '../components/delete-keys';
import { Layout } from '../components/layout';
import { Header } from '../components/header';
import { Cell } from '../components/cell';
import { KeyInfo, keyRecordToken } from '@/utils/storage';
import { KeysList } from '../components/keys-list';
import { NoKeys } from '../components/no-keys';
import { Select } from '../components/select';
import { serializeHistory, type HistoryExportFormat } from '../utils/history-export';
import { saveFile } from '../utils/file';
import { filterHistory, getHistorySites, type HistoryFilters } from '../utils/history-filters';
import { CAPTURES_LABEL } from '../utils/captures';

export const Captures = () => {
  const [keys, setKeys] = createSignal<KeyInfo[]>([]);
  const [search, setSearch] = createSignal('');
  const [site, setSite] = createSignal('');
  const sites = createMemo(() => getHistorySites(keys()));
  createEffect(() => {
    if (site() && !sites().includes(site())) setSite('');
  });
  const [drm, setDrm] = createSignal<HistoryFilters['drm']>('all');
  const [order, setOrder] = createSignal<HistoryFilters['order']>('newest');
  const filteredKeys = createMemo(() =>
    filterHistory(keys(), { search: search(), site: site(), drm: drm(), order: order() }),
  );
  const [selected, setSelected] = createSignal<string[]>([]);
  const selectedRecords = createMemo(() =>
    filteredKeys().filter((key) => selected().includes(keyRecordToken(key))),
  );
  const isAllSelected = createMemo(
    () => filteredKeys().length > 0 && selectedRecords().length === filteredKeys().length,
  );
  createEffect(() => {
    const visible = new Set(filteredKeys().map(keyRecordToken));
    setSelected((tokens) => tokens.filter((token) => visible.has(token)));
  });
  const clearFilters = () => {
    setSearch('');
    setSite('');
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
      <Header
        backHref="/"
        actions={
          <>
            <DeleteKeys
              size="sm"
              class="w-auto shrink-0"
              label={
                selectedRecords().length
                  ? `Delete Selected (${selectedRecords().length})`
                  : 'Delete All'
              }
              scope={
                selectedRecords().length
                  ? { kind: 'selected', records: selectedRecords() }
                  : { kind: 'all' }
              }
              disabled={!keys().length}
              onDeleted={() => setSelected([])}
            />
            <Cell
              component="button"
              variant="primary"
              size="sm"
              class="w-auto shrink-0"
              disabled={!filteredKeys().length}
              onClick={() => setSelected(isAllSelected() ? [] : filteredKeys().map(keyRecordToken))}
            >
              {isAllSelected() ? 'Deselect All' : 'Select All'}
            </Cell>
          </>
        }
      >
        {CAPTURES_LABEL}
      </Header>
      <div class="flex flex-col gap-3">
        <KeysList
          keys={filteredKeys}
          allKeys={keys}
          header="All"
          headerActions={
            <span class="ml-1 capitalize flex items-center gap-1">
              <Cell
                component="button"
                disabled={isExporting() || !filteredKeys().length}
                onClick={() => exportKeys('json')}
                title="Matching records, including statuses and metadata"
                class="text-neutral-500 dark:text-neutral-400"
                size="xs"
                before={<TbOutlineFileDownload aria-hidden="true" class="size-3!" />}
              >
                JSON
              </Cell>
              <Cell
                component="button"
                disabled={isExporting() || !filteredKeys().length}
                onClick={() => exportKeys('txt')}
                title="Unique KID:KEY pairs, one per line"
                class="text-neutral-500 dark:text-neutral-400"
                size="xs"
                before={<TbOutlineFileDownload aria-hidden="true" class="size-3!" />}
              >
                TXT
              </Cell>
            </span>
          }
          footer={
            <Show when={exportError()}>
              <span role="alert">{exportError()}</span>
            </Show>
          }
          search={{ value: search(), onChange: setSearch }}
          controls={
            <>
              <Select
                aria-label="Site"
                class="max-w-[90px] truncate"
                title={site() || 'All sites'}
                value={site()}
                onChange={(event) => setSite(event.currentTarget.value)}
              >
                <option value="">All sites</option>
                <For each={sites()}>{(site) => <option value={site}>{site}</option>}</For>
              </Select>
              <Select
                aria-label="DRM"
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
              </Select>
              <Select
                aria-label="Order"
                value={order()}
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  if (value === 'newest' || value === 'oldest') setOrder(value);
                }}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </Select>
            </>
          }
          selection={{ tokens: selectedRecords().map(keyRecordToken), onChange: setSelected }}
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
