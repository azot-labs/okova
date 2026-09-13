import { useCaptureDiagnostics } from '../utils/state';
import { popupHistory } from '../utils/history';
import { TbOutlineFileDownload, TbOutlineRefresh } from 'solid-icons/tb';
import { DeleteKeys } from '../components/delete-keys';
import { Layout } from '../components/layout';
import { Header } from '../components/header';
import { Cell } from '../components/cell';
import { KeyInfo } from '@/utils/storage';
import { CaptureList } from '../components/capture-list';
import { createPageStreams } from '../utils/page-streams';
import { CaptureObservationStatus } from '../components/capture-observation-status';
import { CaptureSiteFilter, CaptureDrmFilter, CaptureOrder } from '../components/capture-filters';
import { CaptureSearch } from '../components/capture-search';
import { NoMatchingCaptures } from '../components/no-matching-captures';
import {
  serializeCaptures,
  serializeHistory,
  type HistoryExportFormat,
} from '../utils/history-export';
import { saveFile } from '../utils/file';
import { createCaptureFilters } from '../utils/capture-filters';
import { CAPTURES_LABEL } from '../utils/captures';

export const Captures = () => {
  const [keys, setKeys] = createSignal<KeyInfo[]>([]);
  const pageStreams = createPageStreams();
  const [diagnostics] = useCaptureDiagnostics();
  const filters = createCaptureFilters(keys, pageStreams.records, diagnostics);
  const filteredKeys = filters.keys;
  const [selected, setSelected] = createSignal<string[]>([]);
  const selectedCaptures = createMemo(() =>
    filters.captures().filter((capture) => selected().includes(capture.id)),
  );
  const isAllSelected = createMemo(
    () => filters.captures().length > 0 && selectedCaptures().length === filters.captures().length,
  );
  createEffect(() => {
    const visible = new Set(filters.captures().map((capture) => capture.id));
    setSelected((ids) => ids.filter((id) => visible.has(id)));
  });
  const [isExporting, setIsExporting] = createSignal(false);
  const [exportError, setExportError] = createSignal<string>();

  const exportKeys = async (format: HistoryExportFormat) => {
    if (isExporting()) return;
    setIsExporting(true);
    setExportError(undefined);
    try {
      const records = filteredKeys();
      const content =
        format === 'json'
          ? serializeCaptures(filters.captures(), keys())
          : serializeHistory(records, format);
      const filename = format === 'json' ? 'okova-captures.json' : 'okova-keys.txt';
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
                selectedCaptures().length
                  ? `Delete Selected (${selectedCaptures().length})`
                  : 'Delete All'
              }
              scope={
                selectedCaptures().length
                  ? { kind: 'selected', captures: selectedCaptures() }
                  : { kind: 'all' }
              }
              disabled={!filters.allCaptures().length}
              onDeleted={() => setSelected([])}
            />
            <Cell
              component="button"
              variant="primary"
              size="sm"
              class="w-auto shrink-0"
              disabled={!filters.captures().length}
              onClick={() =>
                setSelected(isAllSelected() ? [] : filters.captures().map((capture) => capture.id))
              }
            >
              {isAllSelected() ? 'Deselect All' : 'Select All'}
            </Cell>
          </>
        }
      >
        {CAPTURES_LABEL}
      </Header>
      <div class="flex flex-col gap-3">
        <CaptureObservationStatus observation={pageStreams} />
        <CaptureList
          captures={filters.captures}
          total={filters.allCaptures().length}
          records={keys}
          header="All"
          headerActions={
            <span class="ml-1 capitalize flex items-center gap-1">
              <Cell
                component="button"
                disabled={isExporting() || !filters.captures().length}
                onClick={() => exportKeys('json')}
                title="Matching captures with manifests, sessions, records, and diagnostics"
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
          controls={
            <CaptureSearch search={filters.search}>
              <Cell
                title="Refresh"
                class="w-fit"
                component="button"
                size="xs"
                disabled={pageStreams.isLoading()}
                onClick={() => void pageStreams.refresh()}
              >
                <TbOutlineRefresh aria-hidden="true" class="size-3 opacity-50" />
              </Cell>
              <CaptureSiteFilter {...filters.site} />
              <CaptureDrmFilter {...filters.drm} />
              <CaptureOrder {...filters.order} />
            </CaptureSearch>
          }
          selection={{ ids: selected(), onChange: setSelected }}
        />
        <Show when={!filters.captures().length}>
          <Show
            when={filters.allCaptures().length}
            fallback={
              <p class="py-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
                No captures yet. Start playback to get it.
              </p>
            }
          >
            <NoMatchingCaptures onClear={filters.clear} />
          </Show>
        </Show>
      </div>
    </Layout>
  );
};
