import { Accessor, Component, JSX, batch, createComputed, untrack } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';
import { Cell } from './cell';
import { DeleteKeys } from './delete-keys';
import { keyRecordToken, KeyInfo } from '@/utils/storage';
import { List } from './list';
import { Section } from './section';
import { KeySettings } from '../routes/key-settings';
import { formatRelativeTime } from '../utils/date';
import { captureHistoryScroll, reconcileHistoryRows, type HistoryRow } from '../utils/history-rows';
import { TbOutlineSearch, TbOutlineTrash } from 'solid-icons/tb';

type KeysListProps = {
  keys: Accessor<KeyInfo[]>;
  allKeys?: Accessor<KeyInfo[]>;
  selectable?: boolean;
  search?: { value: string; onChange: (value: string) => void };
  header?: JSX.Element;
  footer?: JSX.Element;
};

const shorten = (url?: string) => url?.replace('https://', '');

export const KeysList: Component<KeysListProps> = (props) => {
  const [rows, setRows] = createStore<HistoryRow[]>([]);
  const [openedIdentity, setOpenedIdentity] = createSignal<number | null>(null);
  const openedKey = createMemo(() => rows.find((row) => row.identity === openedIdentity())?.key);
  const [selected, setSelected] = createSignal<string[]>([]);
  const selectedRecords = createMemo(() =>
    props.keys().filter((key) => selected().includes(keyRecordToken(key))),
  );
  createEffect(() => {
    const visible = new Set(props.keys().map(keyRecordToken));
    setSelected((tokens) => tokens.filter((token) => visible.has(token)));
  });
  let nextIdentity = 0;
  let list: HTMLDivElement | undefined;

  createComputed(() => {
    const visible = props.keys();
    const records = props.allKeys?.() ?? visible;
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
      <Show when={props.search || (props.selectable && props.keys().length)}>
        <Section
          footer={
            props.search ? (
              <span role="status">
                {selectedRecords().length} selected / {props.keys().length} filtered /{' '}
                {(props.allKeys ?? props.keys)().length} total
              </span>
            ) : undefined
          }
        >
          <Show when={props.search}>
            {(search) => (
              <Cell class="w-full" before={<TbOutlineSearch class="text-neutral-500" />}>
                <input
                  type="search"
                  aria-label="Search"
                  class="outline-none bg-transparent border-none w-full"
                  placeholder="Search..."
                  value={search().value}
                  onInput={(event) => search().onChange(event.currentTarget.value)}
                />
              </Cell>
            )}
          </Show>
          <Show when={props.selectable && props.keys().length}>
            <Cell
              selection={{
                label: 'Select All Results',
                checked: selectedRecords().length === props.keys().length,
                indeterminate:
                  selectedRecords().length > 0 && selectedRecords().length < props.keys().length,
                onChange: (checked) => setSelected(checked ? props.keys().map(keyRecordToken) : []),
              }}
              onClick={() =>
                setSelected(
                  selectedRecords().length === props.keys().length
                    ? []
                    : props.keys().map(keyRecordToken),
                )
              }
              // after={
              //   <Show when={selectedRecords().length > 0}>
              //     <button
              //       type="button"
              //       class="-my-2 min-h-11 cursor-pointer px-2 text-[13px] text-blue-600 dark:text-blue-400"
              //       onClick={(event) => {
              //         event.stopPropagation();
              //         setSelected([]);
              //       }}
              //     >
              //       Clear
              //     </button>
              //   </Show>
              // }
            >
              Select All Results
            </Cell>
            <DeleteKeys
              label="Delete Selected"
              scope={{ kind: 'selected', records: selectedRecords() }}
              disabled={!selectedRecords().length}
              onDeleted={() => setSelected([])}
            />
          </Show>
        </Section>
      </Show>
      <div ref={list}>
        <Show when={props.keys().length > 0}>
          <List>
            <Section header={props.header} footer={props.footer}>
              <For each={rows.filter((row) => row.visible)}>
                {(row) => (
                  <div data-history-row={row.identity} class="[&>div]:rounded-[inherit]">
                    <Cell
                      class="group min-w-0"
                      onClick={() => setOpenedIdentity(row.identity)}
                      selection={
                        props.selectable
                          ? {
                              label: `Select record ${row.key.id} from ${row.key.url}`,
                              checked: selected().includes(keyRecordToken(row.key)),
                              onChange: (checked) => {
                                const token = keyRecordToken(row.key);
                                setSelected((tokens) =>
                                  checked
                                    ? [...tokens, token]
                                    : tokens.filter((item) => item !== token),
                                );
                              },
                            }
                          : undefined
                      }
                    >
                      <code title="Click to copy" class="text-[13px] truncate flex w-full">
                        <span class="w-1/2 truncate">{row.key.id}</span>:
                        {/* value may be a status if Spoofing disabled */}
                        <span class="w-1/2 truncate">{row.key.value}</span>
                      </code>
                      <div class="text-[10px] text-gray-500 flex justify-between dark:text-neutral-400">
                        <a
                          title={row.key.mpd || row.key.url}
                          target="_blank"
                          href={row.key.mpd || row.key.url}
                          class="w-fit truncate hover:underline hover:text-blue-500 dark:hover:text-blue-400"
                        >
                          {shorten(row.key.mpd || row.key.url)}
                        </a>
                        <div>{formatRelativeTime(new Date(row.key.createdAt).toISOString())}</div>
                      </div>
                    </Cell>
                  </div>
                )}
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
