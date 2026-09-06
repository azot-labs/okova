import { TbOutlineDownload, TbOutlineTrash as TbTrash } from 'solid-icons/tb';
import { Layout } from '../components/layout';
import { Header } from '../components/header';
import { Cell } from '../components/cell';
import { appStorage, KeyInfo } from '@/utils/storage';
import { KeysList } from '../components/keys-list';
import { NoKeys } from '../components/no-keys';
import { Section } from '../components/section';

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
        <Section header="Actions">
          {/* TODO: Implement */}
          <Cell before={<TbOutlineDownload />} variant="primary" disabled>
            Export All
          </Cell>
          <Cell before={<TbTrash />} variant="danger" onClick={clearKeys}>
            Delete All
          </Cell>
        </Section>
        <div class="flex flex-col gap-1.5">
          <label for="key-search" class="px-2 text-[13px] font-medium">
            Search by KID or site
          </label>
          <input
            id="key-search"
            type="search"
            placeholder="KID, page URL, or manifest URL"
            value={search()}
            onInput={(event) => setSearch(event.currentTarget.value)}
            class="w-full rounded-lg bg-white px-3 py-2 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-neutral-800"
          />
          <p role="status" class="px-2 text-[11px] text-neutral-500 dark:text-neutral-400">
            {filteredKeys().length} / {keys().length} keys
          </p>
        </div>
        <KeysList keys={filteredKeys} header="All Keys" />
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
