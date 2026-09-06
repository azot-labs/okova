import { TbOutlineDownload, TbOutlineTrash as TbTrash } from 'solid-icons/tb';
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

  onMount(async () => {
    const keys = await appStorage.allKeys.getValue();
    if (keys) setKeys(keys);
  });

  const clearKeys = async () => {
    await appStorage.allKeys.clear();
    setKeys([]);
  };

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
          <Cell before={<TbTrash />} variant="danger" onClick={clearKeys}>
            Delete All
          </Cell>
        </Section>
        <KeysList keys={keys} header="All Keys" />
        <Show when={!keys().length}>
          <NoKeys />
        </Show>
      </div>
    </Layout>
  );
};
