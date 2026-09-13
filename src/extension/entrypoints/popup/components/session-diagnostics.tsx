import { getShareableCredentialFingerprint } from '@/utils/credential-fingerprint';
import { For, Show, createSignal, type Component } from 'solid-js';
import { TbOutlineCopy, TbOutlineDownload } from 'solid-icons/tb';
import { formatCaptureTrace, type CaptureDiagnostic } from '@/utils/session-diagnostics';
import { drmStages } from '@/utils/storage';
import { saveFile } from '../utils/file';
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

export const captureStatus = (record: CaptureDiagnostic) => {
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

export const SessionDiagnostics: Component<{ record: CaptureDiagnostic }> = (props) => {
  const [feedback, setFeedback] = createSignal('');
  const copyTrace = async () => {
    try {
      await navigator.clipboard.writeText(formatCaptureTrace(props.record));
      setFeedback('Trace copied');
    } catch {
      setFeedback('Could not copy trace. Try again');
    }
  };
  const downloadTrace = async () => {
    try {
      await saveFile(
        new TextEncoder().encode(formatCaptureTrace(props.record)),
        `okova-trace-${props.record.captureId}.json`,
      );
      setFeedback('Trace saved');
    } catch (error) {
      setFeedback(
        error instanceof DOMException && error.name === 'AbortError'
          ? 'Download cancelled'
          : 'Could not save trace. Try again',
      );
    }
  };
  return (
    <details
      class="py-0 text-[11px] text-neutral-500 dark:text-neutral-400"
      data-capture-id={props.record.captureId}
    >
      <summary class="cursor-pointer py-1">Logs</summary>
      <div class="space-y-1 break-words select-text pb-2">
        <p>Document ID: {props.record.documentId ?? 'Unavailable'}</p>
        <ol class="py-0 font-mono">
          <For
            each={props.record.events.filter(
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

        <div class="flex gap-1">
          <Cell
            size="xs"
            variant="primary"
            class="w-fit cursor-pointer"
            aria-label="Copy diagnostic trace"
            onClick={() => void copyTrace()}
          >
            Copy trace
          </Cell>
          <Cell
            size="xs"
            variant="primary"
            class="w-fit cursor-pointer"
            aria-label="Download diagnostic trace"
            onClick={() => void downloadTrace()}
          >
            Download trace
          </Cell>
        </div>
        <Show when={feedback()}>
          <p role="status">{feedback()}</p>
        </Show>
      </div>
    </details>
  );
};
