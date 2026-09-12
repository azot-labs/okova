import { getShareableCredentialFingerprint } from '@/utils/credential-fingerprint';
import { For, Show, createSignal } from 'solid-js';
import { TbOutlineChevronRight, TbOutlineCopy, TbOutlineDownload } from 'solid-icons/tb';
import { formatCaptureTrace, type CaptureDiagnostic } from '@/utils/session-diagnostics';
import { drmStages } from '@/utils/storage';
import { useCaptureDiagnostics } from '../utils/state';
import { saveFile } from '../utils/file';
import { Section } from './section';
import { Cell } from './cell';

const eventTime = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  fractionalSecondDigits: 3,
  hourCycle: 'h23',
});
const captureDate = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZoneName: 'longOffset',
});

const drmName = (keySystem: string) => {
  if (keySystem === 'com.widevine.alpha') return 'Widevine';
  if (keySystem.startsWith('com.microsoft.playready')) return 'PlayReady';
  if (keySystem === 'org.w3.clearkey') return 'ClearKey';
  return keySystem;
};

const captureStatus = (record: CaptureDiagnostic) => {
  if (record.outcome === 'keys-returned')
    return `${record.keyCount} ${record.keyCount === 1 ? 'key' : 'keys'}`;
  const labels = {
    observed: 'EME observed',
    pending: 'In progress',
    'no-content-keys': 'No content keys',
    failed: 'Failed',
    'timed-out': 'Timed out',
    closed: 'Closed',
  };
  return labels[record.outcome];
};

export const SessionDiagnostics = () => {
  const [records] = useCaptureDiagnostics();
  const [feedback, setFeedback] = createSignal<{ captureId: string; message: string }>();
  const [expanded, setExpanded] = createSignal<string[]>([]);
  const copyTrace = async (record: CaptureDiagnostic) => {
    try {
      await navigator.clipboard.writeText(formatCaptureTrace(record));
      setFeedback({ captureId: record.captureId, message: 'Trace copied' });
    } catch {
      setFeedback({ captureId: record.captureId, message: 'Could not copy trace. Try again' });
    }
  };
  const downloadTrace = async (record: CaptureDiagnostic) => {
    try {
      await saveFile(
        new TextEncoder().encode(formatCaptureTrace(record)),
        `okova-trace-${record.captureId}.json`,
      );
      setFeedback({ captureId: record.captureId, message: 'Trace saved' });
    } catch (error) {
      setFeedback({
        captureId: record.captureId,
        message:
          error instanceof DOMException && error.name === 'AbortError'
            ? 'Download cancelled'
            : 'Could not save trace. Try again',
      });
    }
  };
  return (
    <Show when={records().length}>
      <Section
        header={`Recent Sessions (${records().length})`}
        footer="Latest 20 captures in this tab. Cleared when the tab closes."
      >
        <For each={[...records()].reverse()}>
          {(record) => (
            <div data-capture-id={record.captureId}>
              <div class="group flex items-center">
                <Cell
                  component="div"
                  class="min-w-0 flex-1 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500"
                  title={record.sessionId || `Capture ${record.captureId}`}
                  onClick={() =>
                    setExpanded((ids) =>
                      ids.includes(record.captureId)
                        ? ids.filter((id) => id !== record.captureId)
                        : [...ids, record.captureId],
                    )
                  }
                  before={
                    <TbOutlineChevronRight
                      aria-hidden="true"
                      class={`size-4 shrink-0 text-neutral-400 transition-transform duration-150 ease-out motion-reduce:transition-none dark:text-neutral-500 ${expanded().includes(record.captureId) ? 'rotate-90' : ''}`}
                    />
                  }
                  after={
                    <div class="relative mr-3 flex shrink-0 gap-3 min-w-5 min-h-5 transition-all translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 group-focus-within:opacity-100 group-focus-within:translate-x-0">
                      <button
                        type="button"
                        title="Copy diagnostic trace"
                        aria-label="Copy diagnostic trace"
                        class="text-blue-500 hover:text-blue-400 cursor-pointer w-5 h-5 transition-colors focus-visible:outline-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyTrace(record);
                        }}
                      >
                        <TbOutlineCopy aria-hidden="true" class="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        title="Download diagnostic trace"
                        aria-label="Download diagnostic trace"
                        class="text-blue-500 hover:text-blue-400 cursor-pointer w-5 h-5 transition-colors focus-visible:outline-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadTrace(record);
                        }}
                      >
                        <TbOutlineDownload aria-hidden="true" class="w-5 h-5" />
                      </button>
                    </div>
                  }
                  subtitle={
                    <span role="status">
                      {[
                        drmName(record.keySystem),
                        captureStatus(record),
                        feedback()?.captureId === record.captureId
                          ? feedback()?.message
                          : undefined,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  }
                >
                  <button
                    type="button"
                    class="w-full text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500"
                    aria-expanded={expanded().includes(record.captureId)}
                    aria-controls={`capture-${record.captureId}`}
                  >
                    <code>{record.sessionId || `Capture ${record.captureId}`}</code>
                  </button>
                </Cell>
              </div>
              <Show when={expanded().includes(record.captureId)}>
                <div
                  id={`capture-${record.captureId}`}
                  class="mx-3 border-t border-neutral-100 py-3 space-y-1 break-words select-text text-[11px] dark:border-neutral-700/60"
                >
                  <p>Capture: {record.captureId}</p>
                  <p>{captureDate.format(record.createdAt)}</p>
                  <p>Page: {record.origin ?? 'Unknown origin'}</p>
                  <p>Session: {record.sessionId || 'Not created'}</p>
                  <p>
                    Source:{' '}
                    {record.frameId === 0
                      ? 'Main page'
                      : record.frameId === null
                        ? 'Unknown frame'
                        : `Iframe ${record.frameId}`}
                    <Show when={record.frameId !== 0}>
                      {' '}
                      · {record.frameOrigin ?? 'Unknown origin'}
                    </Show>
                  </p>
                  <p>Document: {record.documentId ?? 'Unavailable'}</p>
                  <p>
                    Credentials:{' '}
                    <Show when={record.credential} fallback="Not loaded">
                      {(credential) => (
                        <>
                          {credential().name ?? 'Name unavailable for this capture'} ·{' '}
                          {credential().type === 'wvd' ||
                          credential().keySystem === 'com.widevine.alpha'
                            ? 'Widevine'
                            : credential().type === 'prd' ||
                                credential().keySystem?.startsWith('com.microsoft.playready')
                              ? 'PlayReady'
                              : 'Remote'}
                          <span
                            class="block text-neutral-500"
                            title="Matches the fingerprint in Credentials Settings"
                          >
                            Fingerprint:{' '}
                            {getShareableCredentialFingerprint(credential())?.slice(0, 12) ??
                              'Unavailable for this capture'}
                          </span>
                        </>
                      )}
                    </Show>
                  </p>
                  <p>Content keys returned: {record.keyCount}</p>
                  <h3 class="pt-2 font-medium text-neutral-500">Activity</h3>
                  <ol class="py-2 font-mono">
                    <For
                      each={record.events.filter(
                        (event) =>
                          event.status !== 'succeeded' ||
                          (event.stage !== 'setup' && event.stage !== 'storage'),
                      )}
                    >
                      {(event) => (
                        <li>
                          {eventTime.format(event.at)} ·{' '}
                          {event.stage === 'eme' ? 'EME observed' : drmStages[event.stage]}
                          <Show when={event.status !== 'succeeded'}>
                            <span
                              class={
                                event.status === 'failed'
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-amber-700 dark:text-amber-400'
                              }
                            >
                              {' '}
                              · {event.status === 'started' ? 'in progress' : event.status}
                            </span>
                          </Show>
                        </li>
                      )}
                    </For>
                  </ol>
                </div>
              </Show>
            </div>
          )}
        </For>
      </Section>
    </Show>
  );
};
