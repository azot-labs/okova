import { browser } from 'wxt/browser';
import { type Component } from 'solid-js';
import { appStorage, keyRecordToken, type KeyInfo } from '@/utils/storage';
import { getDownloadHeaders, isSensitiveHeader, type RequestHeader } from '@/utils/request-headers';
import { isManifestUrl } from '@/utils/manifest';
import { buildCaptureDownloadCommand } from '../utils/command';
import { Cell } from './cell';

export const CaptureCommandBuilder: Component<{
  records: KeyInfo[];
  manifestUrl: string | undefined;
  active: boolean;
  copiedValue: string;
  onCopy: (value: string) => Promise<void>;
}> = (props) => {
  const [manualUrl, setManualUrl] = createSignal('');
  const manifestUrl = createMemo(() => props.manifestUrl ?? manualUrl().trim());
  const [headers, setHeaders] = createSignal<RequestHeader[]>([]);
  const [selectedHeaders, setSelectedHeaders] = createSignal<RequestHeader[]>([]);
  const [headerError, setHeaderError] = createSignal<string>();
  const [loading, setLoading] = createSignal(false);
  let generation = 0;
  createEffect(() => {
    if (!props.active || !isManifestUrl(manifestUrl())) return;
    const url = manifestUrl();
    const tokens = props.records.map(keyRecordToken);
    const request = ++generation;
    setHeaders([]);
    setSelectedHeaders([]);
    setHeaderError(undefined);
    setLoading(tokens.length > 0);
    void (async () => {
      try {
        if (!tokens.length) return;
        const window = await browser.windows.getCurrent();
        if (window.id === undefined) throw new Error('Current window has no ID');
        // Keep one captured request intact rather than mixing headers from different sessions.
        for (const token of tokens) {
          if (request !== generation) return;
          const result: unknown = await browser.runtime.sendMessage({
            action: 'download-headers',
            token,
            url,
            windowId: window.id,
          });
          if (request !== generation) return;
          const available = getDownloadHeaders(result);
          if (available.length) {
            setHeaders(available);
            setSelectedHeaders(available.filter((header) => !isSensitiveHeader(header.name)));
            break;
          }
        }
      } catch {
        if (request === generation)
          setHeaderError('Unable to load request headers. Reopen this capture to try again.');
      } finally {
        if (request === generation) setLoading(false);
      }
    })();
    onCleanup(() => {
      generation++;
    });
  });
  const generatedCommand = createMemo(
    () => buildCaptureDownloadCommand(props.records, manifestUrl(), selectedHeaders()) ?? '',
  );
  const [command, setCommand] = createSignal(generatedCommand());
  let previousCommand = generatedCommand();
  let previousUrl = manifestUrl();
  createEffect(() => {
    const nextCommand = generatedCommand();
    const url = manifestUrl();
    setCommand((current) =>
      url !== previousUrl || current === previousCommand ? nextCommand : current,
    );
    previousCommand = nextCommand;
    previousUrl = url;
  });
  onMount(() => {
    const unwatch = appStorage.settings.watch((settings) => {
      if (settings?.requestInterception === false) {
        generation++;
        setLoading(false);
        setHeaders([]);
        setSelectedHeaders([]);
        setHeaderError(undefined);
        setCommand(buildCaptureDownloadCommand(props.records, manifestUrl()) ?? '');
      }
    });
    onCleanup(unwatch);
  });
  return (
    <div class="px-3 pb-2 bg-emerald-200/10 dark:bg-neutral-900/50" data-command-builder>
      <Show when={!props.manifestUrl}>
        <label class="block pt-2 text-xs">
          Manifest URL
          <input
            aria-label="Manifest URL"
            type="url"
            class="mt-1 w-full bg-transparent border border-neutral-300 dark:border-neutral-600 rounded px-2 py-1"
            placeholder="https://example.com/manifest.mpd"
            value={manualUrl()}
            onInput={(event) => setManualUrl(event.currentTarget.value)}
          />
        </label>
      </Show>
      <Cell
        class="group/command w-[stretch] pl-0 pr-2 -mx-2 py-1 bg-transparent dark:bg-transparent relative"
        subtitle={
          <div class="flex flex-wrap items-center gap-1 ml-1">
            <Show when={loading()}>
              <span role="status">Loading request headers…</span>
            </Show>
            <Show when={headerError()}>
              <span role="alert">{headerError()}</span>
            </Show>
            <Cell
              class="w-fit"
              size="xs"
              variant="primary"
              component="button"
              disabled={loading() || Boolean(headerError()) || !command()}
              onClick={() => {
                if (!loading() && !headerError() && command()) void props.onCopy(command());
              }}
            >
              {Boolean(command()) && command() === props.copiedValue ? 'Copied' : 'Copy'}
            </Cell>
            <Show when={command() !== generatedCommand()}>
              <Cell
                class="w-fit"
                size="xs"
                variant="primary"
                onClick={() => setCommand(generatedCommand())}
              >
                Reset
              </Cell>
            </Show>
          </div>
        }
      >
        <textarea
          class="px-2 font-mono text-xs outline-none bg-transparent border-none break-all w-full"
          aria-label="Download command"
          disabled={!isManifestUrl(manifestUrl())}
          placeholder="No manifest detected for this capture"
          rows={4}
          value={command()}
          onInput={(event) => setCommand(event.currentTarget.value)}
        />
      </Cell>
      <For each={headers()}>
        {(header) => {
          const sensitive = isSensitiveHeader(header.name);
          const selected = () => selectedHeaders().some((item) => item.name === header.name);
          const allowed = () =>
            !sensitive ||
            (isManifestUrl(manifestUrl()) && new URL(manifestUrl()!).protocol === 'https:');
          return (
            <label class="flex items-start gap-2 py-1 text-xs">
              <input
                type="checkbox"
                aria-label={`Include ${header.name}`}
                checked={selected()}
                disabled={!allowed()}
                onChange={(event) =>
                  setSelectedHeaders((current) =>
                    event.currentTarget.checked
                      ? [...current, header]
                      : current.filter((item) => item.name !== header.name),
                  )
                }
              />
              <span class="min-w-0 break-all">
                {header.name}:{' '}
                {sensitive && !selected()
                  ? allowed()
                    ? 'Sensitive value hidden'
                    : 'Requires HTTPS'
                  : header.value}
              </span>
            </label>
          );
        }}
      </For>
    </div>
  );
};
