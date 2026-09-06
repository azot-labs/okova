import { TbOutlineDownload } from 'solid-icons/tb';
import { DeleteKeys } from '../components/delete-keys';
import { Layout } from '../components/layout';
import { Header } from '../components/header';
import { Cell } from '../components/cell';
import { appStorage, KeyInfo } from '@/utils/storage';
import { KeysList } from '../components/keys-list';
import { NoKeys } from '../components/no-keys';
import { Section } from '../components/section';
import { serializeHistory, type HistoryExportFormat } from '../utils/history-export';
import { saveFile } from '../utils/file';

export const Keys = () => {
  const [keys, setKeys] = createSignal<KeyInfo[]>([]);
  const [search, setSearch] = createSignal('');
  const filteredKeys = createMemo(() => {
    const query = search().trim().toLowerCase();
    if (!query) return keys();

    const kidQuery = query.replaceAll('-', '');
    return keys().filter(
      (key) =>
        (kidQuery.length > 0 && key.id.toLowerCase().replaceAll('-', '').includes(kidQuery)) ||
        key.url.toLowerCase().includes(query) ||
        key.mpd?.toLowerCase().includes(query),
    );
  });
  const [isExporting, setIsExporting] = createSignal(false);
  const [exportError, setExportError] = createSignal<string>();

  const exportKeys = async (format: HistoryExportFormat) => {
    if (isExporting()) return;
    setIsExporting(true);
    setExportError(undefined);
    try {
      const records = (await appStorage.allKeys.getValue()) ?? [];
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
  const unwatch = appStorage.allKeys.raw.watch((records) => {
    hasUpdate = true;
    setKeys(records ?? []);
  });
  onCleanup(() => {
    isDisposed = true;
    unwatch();
  });
  onMount(async () => {
    const records = await appStorage.allKeys.getValue();
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
            subtitle="All records, including statuses and metadata"
            disabled={isExporting()}
            onClick={() => exportKeys('json')}
          >
            Export All as JSON
          </Cell>
          <Cell
            component="button"
            before={<TbOutlineDownload />}
            variant="primary"
            subtitle="Unique KID:KEY pairs, one per line"
            disabled={isExporting()}
            onClick={() => exportKeys('txt')}
          >
            Export All as TXT
          </Cell>
          <DeleteKeys label="Delete All" scope={{ kind: 'all' }} />
        </Section>
        <KeysList
          keys={filteredKeys}
          allKeys={keys}
          header="All Keys"
          search={{ value: search(), onChange: setSearch }}
          selectable
        />
        <Show when={!filteredKeys().length}>
          <Show when={keys().length} fallback={<NoKeys />}>
            <div class="flex flex-col items-center gap-1 py-4 text-center">
              <h1 class="text-[16px] font-semibold">No matching keys</h1>
              <p class="text-[13px] text-neutral-800 dark:text-neutral-300">
                Try another KID, page URL, or manifest URL.
              </p>
              <button
                type="button"
                onClick={() => setSearch('')}
                class="rounded px-3 py-2 text-[13px] text-blue-600 hover:underline focus-visible:outline-2 dark:text-blue-400"
              >
                Clear search
              </button>
            </div>
          </Show>
        </Show>
      </div>
    </Layout>
  );
};
