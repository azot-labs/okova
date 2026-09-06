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

type KeysListProps = {
  keys: Accessor<KeyInfo[]>;
  allKeys?: Accessor<KeyInfo[]>;
  selectable?: boolean;
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
      <Show when={props.selectable && props.keys().length}>
        <div class="sticky top-0 z-10 flex flex-col gap-1 rounded-lg bg-white p-1 shadow-sm dark:bg-neutral-800">
          <div class="flex items-center justify-between gap-2 px-2 text-[13px]">
            <label class="flex min-h-11 cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                class="size-5 cursor-pointer accent-blue-600"
                checked={selectedRecords().length === props.keys().length}
                ref={(input) =>
                  createEffect(() => {
                    input.indeterminate =
                      selectedRecords().length > 0 &&
                      selectedRecords().length < props.keys().length;
                  })
                }
                onChange={(event) =>
                  setSelected(event.currentTarget.checked ? props.keys().map(keyRecordToken) : [])
                }
              />
              Select All Results
            </label>
            <span aria-live="polite">{selectedRecords().length} selected</span>
            <Show when={selectedRecords().length > 0}>
              <button
                type="button"
                class="min-h-11 px-2 text-blue-600 dark:text-blue-400"
                onClick={() => setSelected([])}
              >
                Clear
              </button>
            </Show>
          </div>
          <DeleteKeys
            label="Delete Selected"
            scope={{ kind: 'selected', records: selectedRecords() }}
            disabled={!selectedRecords().length}
            onDeleted={() => setSelected([])}
          />
        </div>
      </Show>
      <div ref={list}>
        <Show when={props.keys().length > 0}>
          <List>
            <Section header={props.header} footer={props.footer}>
              <For each={rows.filter((row) => row.visible)}>
                {(row) => (
                  <div
                    data-history-row={row.identity}
                    class="flex items-stretch rounded-lg bg-white dark:bg-neutral-800 [&>div]:rounded-[inherit]"
                  >
                    <Show when={props.selectable}>
                      <label class="flex min-w-11 cursor-pointer items-center justify-center rounded-l-lg has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-950">
                        <input
                          type="checkbox"
                          class="size-5 cursor-pointer accent-blue-600"
                          aria-label={`Select record ${row.key.id} from ${row.key.url}`}
                          checked={selected().includes(keyRecordToken(row.key))}
                          onChange={(event) => {
                            const token = keyRecordToken(row.key);
                            setSelected((tokens) =>
                              event.currentTarget.checked
                                ? [...tokens, token]
                                : tokens.filter((item) => item !== token),
                            );
                          }}
                        />
                      </label>
                    </Show>
                    <Cell class="group min-w-0" onClick={() => setOpenedIdentity(row.identity)}>
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
