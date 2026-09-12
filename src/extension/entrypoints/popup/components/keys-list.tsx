import { isManifestUrl } from '@/utils/manifest';
import { Accessor, Component, JSX, batch, createComputed, untrack } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';
import { Cell } from './cell';
import { keyRecordToken, KeyInfo } from '@/utils/storage';
import { List } from './list';
import { Section } from './section';
import { KeySettings } from '../routes/key-settings';
import { formatRelativeTime } from '../utils/date';
import { captureHistoryScroll, reconcileHistoryRows, type HistoryRow } from '../utils/history-rows';
import { TbOutlineSearch } from 'solid-icons/tb';
import { cn } from '../utils/cn';

type KeysListProps = {
  keys: Accessor<KeyInfo[]>;
  allKeys?: Accessor<KeyInfo[]>;
  selection?: { tokens: string[]; onChange: (tokens: string[]) => void };
  search?: { value: string; onChange: (value: string) => void };
  controls?: JSX.Element;
  header?: JSX.Element;
  headerActions?: JSX.Element;
  footer?: JSX.Element;
};

const shorten = (url?: string) => url?.replace('https://', '').replace('www.', '');

export const KeysList: Component<KeysListProps> = (props) => {
  const [rows, setRows] = createStore<HistoryRow[]>([]);
  const [openedIdentity, setOpenedIdentity] = createSignal<number | null>(null);
  const openedKey = createMemo(() => rows.find((row) => row.identity === openedIdentity())?.key);
  const [isSearchExpanded, setIsSearchExpanded] = createSignal(false);
  let searchInput: HTMLInputElement | undefined;
  let searchButton: HTMLButtonElement | undefined;
  let nextIdentity = 0;
  let list: HTMLDivElement | undefined;

  createComputed(() => {
    const visible = props.keys();
    const records = props.allKeys
      ? [...visible, ...props.allKeys().filter((key) => !visible.includes(key))]
      : visible;
    untrack(() => {
      const restoreScroll = captureHistoryScroll(list);
      const next = reconcileHistoryRows(rows, records, visible, () => nextIdentity++);
      batch(() => {
        setRows(reconcile(next, { key: 'identity' }));
        if (!next.some((row) => row.identity === openedIdentity())) setOpenedIdentity(null);
      });
      queueMicrotask(restoreScroll);
    });
  });

  return (
    <>
      <div ref={list}>
        <Show when={props.keys().length > 0 || props.search}>
          <List>
            <Section
              header={
                <>
                  {props.header}{' '}
                  <span
                    role="status"
                    aria-label={`${props.selection?.tokens.length ?? 0} selected / ${(props.allKeys ?? props.keys)().length} total`}
                  >
                    ({props.selection?.tokens.length ? `${props.selection.tokens.length}/` : ''}
                    {(props.allKeys ?? props.keys)().length})
                  </span>
                  {props.headerActions}
                </>
              }
              headerControls={
                <>
                  <div class={isSearchExpanded() ? 'hidden' : 'flex items-center gap-0.5'}>
                    {props.controls}
                  </div>
                  <Show when={props.search}>
                    {(search) => (
                      <>
                        <button
                          ref={searchButton}
                          type="button"
                          aria-label="Search"
                          aria-expanded={isSearchExpanded()}
                          title={search().value.trim() ? `Search: ${search().value}` : 'Search'}
                          class={cn(
                            'size-4 items-center justify-center rounded-md cursor-pointer hover:bg-slate-200/80 dark:hover:bg-neutral-800 focus-visible:outline-2',
                            isSearchExpanded() ? 'hidden' : 'inline-flex',
                            search().value.trim() &&
                              'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
                          )}
                          onClick={() => {
                            setIsSearchExpanded(true);
                            searchInput?.focus();
                          }}
                        >
                          <TbOutlineSearch aria-hidden="true" class="size-3" />
                        </button>
                        <div
                          class={cn(
                            'relative items-center',
                            isSearchExpanded() ? 'inline-flex' : 'hidden',
                          )}
                        >
                          <TbOutlineSearch
                            aria-hidden="true"
                            class="pointer-events-none absolute left-1 size-2.5"
                          />
                          <input
                            ref={searchInput}
                            type="search"
                            aria-label="Search"
                            class="min-h-4 w-56 rounded-md pl-5 pr-1 font-normal outline-none bg-slate-200/80 dark:bg-neutral-800 focus-visible:outline-2"
                            placeholder="Search..."
                            value={search().value}
                            onInput={(event) => search().onChange(event.currentTarget.value)}
                            onBlur={() => setIsSearchExpanded(false)}
                            onKeyDown={(event) => {
                              if (event.key !== 'Escape') return;
                              event.preventDefault();
                              setIsSearchExpanded(false);
                              searchButton?.focus();
                            }}
                          />
                        </div>
                      </>
                    )}
                  </Show>
                </>
              }
              footer={props.footer}
            >
              <For each={rows.filter((row) => row.visible)}>
                {(row) => {
                  const href = createMemo(() =>
                    isManifestUrl(row.key.mpd) ? row.key.mpd : row.key.url,
                  );
                  return (
                    <div data-history-row={row.identity} class="[&>div]:rounded-[inherit]">
                      <Cell
                        class="group min-w-0"
                        onClick={() => setOpenedIdentity(row.identity)}
                        selection={
                          props.selection
                            ? {
                                label: `Select record ${row.key.id} from ${row.key.url}`,
                                checked: props.selection.tokens.includes(keyRecordToken(row.key)),
                                onChange: (checked) => {
                                  const token = keyRecordToken(row.key);
                                  const selection = props.selection;
                                  if (!selection) return;
                                  selection.onChange(
                                    checked
                                      ? [...selection.tokens, token]
                                      : selection.tokens.filter((item) => item !== token),
                                  );
                                },
                              }
                            : undefined
                        }
                      >
                        <code title="Click to copy" class="text-[11px] truncate flex w-full">
                          <span class="w-1/2 truncate">{row.key.id}</span>:
                          {/* value may be a status if Spoofing disabled */}
                          <span class="w-1/2 truncate">{row.key.value}</span>
                        </code>
                        <div class="text-[10px] text-gray-500 flex justify-between dark:text-neutral-400">
                          <a
                            title={href()}
                            target="_blank"
                            href={href()}
                            class="w-fit truncate hover:underline hover:text-blue-500 dark:hover:text-blue-400"
                          >
                            {shorten(href())}
                          </a>
                          <div title={new Date(row.key.createdAt).toLocaleString()}>
                            {formatRelativeTime(new Date(row.key.createdAt).toISOString())}
                          </div>
                        </div>
                      </Cell>
                    </div>
                  );
                }}
              </For>
            </Section>
          </List>
        </Show>
      </div>
      <Show when={openedKey()}>
        {(key) => (
          <Portal mount={document.getElementById('root')!}>
            <KeySettings key={key()} onClose={() => setOpenedIdentity(null)} />
          </Portal>
        )}
      </Show>
    </>
  );
};
