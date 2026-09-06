import { Accessor, Component, JSX, batch, createComputed, untrack } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';
import { Cell } from './cell';
import { KeyInfo } from '@/utils/storage';
import { List } from './list';
import { Section } from './section';
import { KeySettings } from '../routes/key-settings';
import { formatRelativeTime } from '../utils/date';
import { captureHistoryScroll, reconcileHistoryRows, type HistoryRow } from '../utils/history-rows';

type KeysListProps = {
  keys: Accessor<KeyInfo[]>;
  allKeys?: Accessor<KeyInfo[]>;
  header?: JSX.Element;
  footer?: JSX.Element;
};

const shorten = (url?: string) => url?.replace('https://', '');

export const KeysList: Component<KeysListProps> = (props) => {
  const [rows, setRows] = createStore<HistoryRow[]>([]);
  const [openedIdentity, setOpenedIdentity] = createSignal<number | null>(null);
  const openedKey = createMemo(() => rows.find((row) => row.identity === openedIdentity())?.key);
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
      <div ref={list}>
        <Show when={props.keys().length > 0}>
          <List>
            <Section header={props.header} footer={props.footer}>
              <For each={rows.filter((row) => row.visible)}>
                {(row) => (
                  <div data-history-row={row.identity} class="[&>div]:rounded-[inherit]">
                    <Cell class="group" onClick={() => setOpenedIdentity(row.identity)}>
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
