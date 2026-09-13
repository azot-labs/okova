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
  const [headers, setHeaders] = createSignal<RequestHeader[]>([]);
  const [selectedHeaders, setSelectedHeaders] = createSignal<RequestHeader[]>([]);
  const [headerError, setHeaderError] = createSignal<string>();
  const [loading, setLoading] = createSignal(false);
  let generation = 0;
  createEffect(() => {
    if (!props.active || !isManifestUrl(props.manifestUrl)) return;
    const url = props.manifestUrl;
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
            setSelectedHeaders(available);
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
    () => buildCaptureDownloadCommand(props.records, props.manifestUrl, selectedHeaders()) ?? '',
  );
  const [command, setCommand] = createSignal(generatedCommand());
  let previousCommand = generatedCommand();
  let previousUrl = props.manifestUrl;
  createEffect(() => {
    const nextCommand = generatedCommand();
    const url = props.manifestUrl;
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
        setCommand(buildCaptureDownloadCommand(props.records, props.manifestUrl) ?? '');
      }
    });
    onCleanup(unwatch);
  });
  return (
    <div class="px-3 pb-2 bg-emerald-200/10 dark:bg-neutral-900/50" data-command-builder>
      <Cell
        class="group/command w-[stretch] pl-0 pr-2 -mx-2 py-1 bg-transparent dark:bg-transparent relative"
        subtitle={
          <div class="flex items-center gap-1 ml-1">
            <Cell
              class="w-fit"
              size="xs"
              variant="primary"
              onClick={() => void props.onCopy(command())}
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
          disabled={!isManifestUrl(props.manifestUrl)}
          placeholder="No manifest detected for this capture"
          rows={4}
          value={command()}
          onInput={(event) => setCommand(event.currentTarget.value)}
        />
      </Cell>
    </div>
  );
};
