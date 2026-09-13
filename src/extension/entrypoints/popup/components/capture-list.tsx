import { getBadgeDrmSystem } from '@/utils/badge';
import { SessionDiagnostics, captureStatus } from './session-diagnostics';
import { type Accessor, type Component, type JSX, untrack } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';
import { type KeyInfo } from '@/utils/storage';
import { manifestLabels } from '@/utils/manifest';
import type { CaptureGroup } from '@/utils/capture-groups';
import { groupCaptureSessions } from '../utils/capture-sessions';
import { getPsshBadgeLabels, getSessionSystemLabels } from '../utils/drm-system-labels';
import { captureHistoryScroll, reconcileHistoryRows, type HistoryRow } from '../utils/history-rows';
import { Cell } from './cell';
import { Section } from './section';
import { formatRelativeTime } from '../utils/date';
import {
  TbOutlineCheck,
  TbOutlineChevronRight,
  TbOutlineCopy,
  TbOutlineFrame,
  TbOutlineKey,
  TbOutlinePlaylist,
} from 'solid-icons/tb';
import { CaptureCommandBuilder } from './capture-command-builder';

const SystemBadges: Component<{ labels: string[] }> = (props) => (
  <For each={props.labels}>
    {(label) => (
      <span class="shrink-0 rounded px-1 border border-neutral-200/80 dark:border-neutral-600/80 text-[9px] bg-neutral-100 dark:bg-neutral-700/80 text-neutral-500 dark:text-neutral-300">
        {label}
      </span>
    )}
  </For>
);

export const CaptureList: Component<{
  captures: Accessor<CaptureGroup[]>;
  total: number;
  records: Accessor<KeyInfo[]>;
  selection?: { ids: string[]; onChange: (ids: string[]) => void };
  controls?: JSX.Element;
  header?: JSX.Element;
  headerActions?: JSX.Element;
  footer?: JSX.Element;
}> = (props) => {
  const [rows, setRows] = createStore<(CaptureGroup & { identity: number; memberIds: number[] })[]>(
    [],
  );
  const [keyRows, setKeyRows] = createStore<HistoryRow[]>([]);
  let nextIdentity = 0;
  let nextCaptureIdentity = 0;
  const [copyValue, setCopyValue] = createSignal('');
  let list: HTMLDivElement | undefined;
  createEffect(() => {
    const captures = props.captures();
    const records = props.records();
    untrack(() => {
      const restore = captureHistoryScroll(list);
      setKeyRows(
        reconcile(
          reconcileHistoryRows(keyRows, records, records, () => nextIdentity++),
          { key: 'identity' },
        ),
      );
      const memberIds = keyRows.map((row) => row.identity);
      const available = new Set(rows);
      const next = captures.map((capture) => {
        const members = capture.recordIndexes.flatMap((index) =>
          memberIds[index] === undefined ? [] : [memberIds[index]],
        );
        const previous =
          [...available].find((row) => row.id === capture.id) ??
          [...available].find((row) => row.memberIds.some((id) => members.includes(id))) ??
          [...available].find((row) =>
            row.sessionIds.some((id) => capture.sessionIds.includes(id)),
          );
        if (previous) available.delete(previous);
        return {
          ...capture,
          memberIds: members,
          identity: previous?.identity ?? nextCaptureIdentity++,
        };
      });
      setRows(reconcile(next, { key: 'identity' }));
      queueMicrotask(restore);
    });
  });

  const [copyTimeout, setCopyTimeout] = createSignal<number | NodeJS.Timeout>();

  const copy = async (url: string) => {
    if (copyTimeout()) clearTimeout(copyTimeout());
    try {
      await navigator.clipboard.writeText(url);
      setCopyValue(url);
      const timeout = setTimeout(() => setCopyValue(''), 3000);
      setCopyTimeout(timeout);
    } catch {
      setCopyValue('');
    }
  };
  const selectedCount = createMemo(
    () => props.captures().filter((capture) => props.selection?.ids.includes(capture.id)).length,
  );

  return (
    <div ref={list}>
      <Section
        header={
          <>
            {props.header}{' '}
            <span
              role="status"
              aria-label={`${selectedCount()} selected / ${props.total} total captures`}
            >
              ({selectedCount() ? `${selectedCount()}/` : ''}
              {props.total})
            </span>
            {props.headerActions}
          </>
        }
        headerControls={props.controls}
        footer={props.footer}
      >
        <For each={rows}>
          {(capture) => {
            const [isOpen, setIsOpen] = createSignal(false);
            const title = createMemo(() =>
              capture.manifestUrl
                ? (new URL(capture.manifestUrl).pathname.split('/').filter(Boolean).at(-1) ??
                  'Manifest')
                : capture.sessionIds.length
                  ? 'Manifest not detected'
                  : 'Legacy capture',
            );
            const recordEntries = createMemo(() =>
              capture.recordIndexes.flatMap((index) => {
                const row = keyRows[index];
                return row ? [row] : [];
              }),
            );
            const [sessions, setSessions] = createStore<ReturnType<typeof groupCaptureSessions>>(
              [],
            );
            createEffect(() =>
              setSessions(
                reconcile(groupCaptureSessions(recordEntries(), capture.diagnostics), {
                  key: 'id',
                }),
              ),
            );

            const keyCount = createMemo(
              () => new Set(recordEntries().map((row) => row.key.id)).size,
            );
            return (
              <details
                data-capture-row={capture.id}
                data-history-row={capture.identity}
                class="group overflow-hidden"
                onToggle={(event) => setIsOpen(event.currentTarget.open)}
              >
                <summary class="cursor-pointer list-none px-3 py-3 flex items-center gap-3 hover:bg-emerald-50 dark:hover:bg-neutral-700/30 focus-visible:outline-2 focus-visible:outline-emerald-500">
                  <Show when={props.selection}>
                    <input
                      type="checkbox"
                      aria-label={`Select capture ${title()} from ${capture.url}`}
                      class="size-3.5 shrink-0 accent-emerald-600"
                      checked={props.selection?.ids.includes(capture.id)}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) => {
                        const selection = props.selection;
                        if (!selection) return;
                        selection.onChange(
                          event.currentTarget.checked
                            ? [...new Set([...selection.ids, capture.id])]
                            : selection.ids.filter((id) => id !== capture.id),
                        );
                      }}
                    />
                  </Show>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-1.5">
                      <span
                        class="text-[13px] font-medium truncate"
                        title={capture.manifestUrl ?? capture.url}
                      >
                        {title()}
                      </span>
                      <Show when={capture.stream}>
                        {(stream) => (
                          <span class="shrink-0 rounded px-1 py-0 border border-neutral-200/80 dark:border-neutral-600/80 text-[9px] bg-neutral-100 dark:bg-neutral-700/80 text-neutral-500 dark:text-neutral-300">
                            {manifestLabels[stream().manifest.kind]}
                          </span>
                        )}
                      </Show>
                    </div>
                    <p
                      class="mt-0 truncate text-[11px] text-neutral-500 dark:text-neutral-400"
                      title={capture.manifestUrl ?? capture.url}
                    >
                      <a
                        title={capture.manifestUrl ?? capture.url}
                        target="_blank"
                        href={capture.manifestUrl ?? capture.url}
                        class="w-fit truncate hover:underline hover:text-emerald-600 dark:hover:text-emerald-400"
                      >
                        {(capture.manifestUrl ?? capture.url).replace('https://', '')}
                      </a>
                    </p>
                    <p class="flex items-center gap-1 mt-0.5 text-[10px] text-neutral-500 dark:text-neutral-400">
                      {keyCount()
                        ? `${keyCount()} key${keyCount() === 1 ? '' : 's'}`
                        : 'No keys recorded'}
                      <Show when={capture.stream}>
                        {(stream) => (
                          <>
                            {stream().playlists.length
                              ? ` · ${stream().playlists.length} child playlist${stream().playlists.length === 1 ? '' : 's'}`
                              : ''}
                          </>
                        )}
                      </Show>
                      <For
                        each={capture.diagnostics?.filter(
                          (record) => record.outcome !== 'keys-returned',
                        )}
                      >
                        {(record) => <span> · {captureStatus(record)}</span>}
                      </For>
                      <Show when={capture.createdAt}>
                        {' '}
                        · {formatRelativeTime(new Date(capture.createdAt).toISOString())}
                      </Show>
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    class="text-neutral-400 transition-transform group-open:rotate-90"
                  >
                    <TbOutlineChevronRight class="size-5" />
                  </span>
                </summary>
                <Show when={isOpen()}>
                  <div class="px-3 pb-2 pt-1 flex flex-col gap-0.5 border-t border-t-emerald-200/50 dark:border-t-emerald-700/50 bg-emerald-200/10 dark:bg-neutral-900/50">
                    <Show when={!capture.manifestUrl}>
                      <p class="py-1 text-xs text-neutral-500 dark:text-neutral-400">
                        {capture.sessionIds.length
                          ? 'Grouped by the recorded session/capture identity.'
                          : 'This older record has no session identity or manifest URL.'}
                      </p>
                    </Show>
                    <Show
                      when={capture.url}
                      fallback={<p class="py-1 text-xs text-neutral-500">Source unknown</p>}
                    >
                      <Cell
                        class="w-[stretch] px-2 -mx-2 py-1 bg-transparent dark:bg-transparent"
                        component="button"
                        title={`Click to copy: ${capture.url}`}
                        subtitle={
                          <a
                            title={capture.url}
                            target="_blank"
                            href={capture.url}
                            class="w-fit truncate hover:underline hover:text-emerald-600 dark:hover:text-emerald-400"
                          >
                            {capture.url.replace('https://', '')}
                          </a>
                        }
                        after={
                          capture.url === copyValue() ? (
                            <span class="flex gap-1.5 text-xs opacity-50">
                              Copied
                              <TbOutlineCheck class="size-4" />
                            </span>
                          ) : (
                            <TbOutlineCopy class="size-4 transition-opacity opacity-0 group-hover/cell:opacity-50" />
                          )
                        }
                        onClick={() => void copy(capture.url)}
                      >
                        <span class="flex items-center gap-1.5">
                          Source
                          <Show when={capture.stream && capture.stream.frameId !== 0}>
                            <TbOutlineFrame
                              title="Frame / Embedded player"
                              class="size-3 opacity-50"
                            />
                          </Show>
                        </span>
                      </Cell>
                    </Show>
                    <Show when={capture.stream?.playlists.length}>
                      <For each={capture.stream?.playlists}>
                        {(playlist, index) => (
                          <Cell
                            class="w-[stretch] px-2 -mx-2 py-1 bg-transparent dark:bg-transparent"
                            component="button"
                            title={`Click to copy: ${playlist.url}`}
                            subtitle={
                              <a
                                title={playlist.url}
                                target="_blank"
                                href={playlist.url}
                                class="w-fit truncate hover:underline hover:text-emerald-600 dark:hover:text-emerald-400"
                              >
                                {playlist.url.replace('https://', '')}
                              </a>
                            }
                            after={
                              playlist.url === copyValue() ? (
                                <span class="flex gap-1.5 text-xs opacity-50">
                                  Copied
                                  <TbOutlineCheck class="size-4" />
                                </span>
                              ) : (
                                <TbOutlineCopy class="size-4 transition-opacity opacity-0 group-hover/cell:opacity-50" />
                              )
                            }
                            onClick={() => void copy(playlist.url)}
                          >
                            <span class="flex items-center gap-1.5">
                              {new URL(playlist.url).pathname.split('/').filter(Boolean).at(-1) ??
                                `${manifestLabels[playlist.kind]} ${index() + 1}`}
                              <TbOutlinePlaylist
                                title={manifestLabels[playlist.kind]}
                                class="size-3 opacity-50"
                              />
                            </span>
                          </Cell>
                        )}
                      </For>
                    </Show>
                    <For each={sessions}>
                      {(session) => (
                        <section
                          data-capture-session={session.id ?? ''}
                          aria-label={session.id ? `Session ID` : 'Session not recorded'}
                          class="mt-0.5 pt-1 border-t border-neutral-100/80 dark:border-neutral-700/80"
                        >
                          <Show
                            when={session.id}
                            fallback={
                              <p class="py-1 flex flex-wrap items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                                Session not recorded
                                <SystemBadges
                                  labels={getSessionSystemLabels(
                                    session.diagnostic
                                      ? [getBadgeDrmSystem(session.diagnostic.keySystem)]
                                      : session.entries.map((entry) => entry.key.drmSystem),
                                  )}
                                />
                              </p>
                            }
                          >
                            {(id) => (
                              <Cell
                                class="w-[stretch] px-2 -mx-2 py-1 bg-transparent dark:bg-transparent"
                                component="button"
                                title={`Click to copy: ${id()}`}
                                subtitle={
                                  <div class="flex items-center gap-1 justify-between pr-0">
                                    <span class="font-mono">{id()}</span>
                                    <span class="text-[10px]">
                                      <Show when={session.diagnostic}>
                                        {(record) => <span>{captureStatus(record())}</span>}
                                      </Show>
                                    </span>
                                  </div>
                                }
                                onClick={() => void copy(id())}
                              >
                                <span class="flex flex-wrap items-center gap-1.5 capitalize">
                                  Session
                                  <SystemBadges
                                    labels={getSessionSystemLabels(
                                      session.diagnostic
                                        ? [getBadgeDrmSystem(session.diagnostic.keySystem)]
                                        : session.entries.map((entry) => entry.key.drmSystem),
                                    )}
                                  />
                                  <Show when={session.diagnostic}>
                                    {(record) => (
                                      <>
                                        <SystemBadges
                                          labels={[
                                            record().credential?.name ?? 'Unknown credentials',
                                          ]}
                                        />
                                        <span class="ml-auto text-[10px] text-neutral-500 dark:text-neutral-400">
                                          {new Date(record().createdAt).toLocaleString()}
                                        </span>
                                      </>
                                    )}
                                  </Show>
                                </span>
                              </Cell>
                            )}
                          </Show>
                          <For each={session.psshValues}>
                            {(pssh, psshIndex) => (
                              <Cell
                                class="w-[stretch] px-2 -mx-2 py-1 bg-transparent dark:bg-transparent"
                                component="button"
                                title={`Click to copy: ${pssh}`}
                                subtitle={<span class="font-mono">{pssh}</span>}
                                after={
                                  pssh === copyValue() ? (
                                    <span class="flex gap-1.5 text-xs opacity-50">
                                      Copied
                                      <TbOutlineCheck class="size-4" />
                                    </span>
                                  ) : (
                                    <TbOutlineCopy class="size-4 transition-opacity opacity-0 group-hover/cell:opacity-50" />
                                  )
                                }
                                onClick={() => void copy(pssh)}
                              >
                                <span class="flex flex-wrap items-center gap-1.5">
                                  PSSH{session.psshValues.length > 1 ? ` ${psshIndex() + 1}` : ''}
                                  <SystemBadges
                                    labels={getPsshBadgeLabels(
                                      pssh,
                                      session.diagnostic
                                        ? [getBadgeDrmSystem(session.diagnostic.keySystem)]
                                        : session.entries.map((entry) => entry.key.drmSystem),
                                    )}
                                  />
                                </span>
                              </Cell>
                            )}
                          </For>
                          <For each={session.entries}>
                            {(entry) => {
                              return (
                                <Cell
                                  class="w-[stretch] px-2 -mx-2 py-0 min-h-6 font-mono bg-transparent dark:bg-transparent"
                                  component="button"
                                  data-key-record={entry.key.id}
                                  title={`Click to copy: ${entry.key.id}:${entry.key.value}`}
                                  after={
                                    `${entry.key.id}:${entry.key.value}` === copyValue() ? (
                                      <span class="flex justify-end items-center gap-2 text-[11px] font-sans opacity-50">
                                        <TbOutlineCheck class="size-4" />
                                      </span>
                                    ) : (
                                      <span class="flex justify-end items-center gap-2 text-[11px] font-sans transition-opacity opacity-0 group-hover/cell:opacity-50">
                                        <TbOutlineCopy class="size-3.5" />
                                      </span>
                                    )
                                  }
                                  onClick={() => void copy(`${entry.key.id}:${entry.key.value}`)}
                                >
                                  <span class="text-[10px] flex items-center gap-1.5">
                                    {/* {entry.key.id} */}
                                    <TbOutlineKey title="Key" class="size-3 opacity-50" />
                                    {`${entry.key.id}:${entry.key.value}`}
                                  </span>
                                </Cell>
                              );
                            }}
                          </For>
                          <Show when={session.diagnostic}>
                            {(record) => <SessionDiagnostics record={record()} />}
                          </Show>
                        </section>
                      )}
                    </For>
                  </div>
                </Show>
                <Show when={capture.manifestUrl}>
                  <CaptureCommandBuilder
                    records={recordEntries().map((entry) => entry.key)}
                    manifestUrl={capture.manifestUrl}
                    active={isOpen()}
                    copiedValue={copyValue()}
                    onCopy={copy}
                  />
                </Show>
              </details>
            );
          }}
        </For>
      </Section>
    </div>
  );
};
