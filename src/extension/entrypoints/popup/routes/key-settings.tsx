import { browser } from 'wxt/browser';
import { getDownloadHeaders, isSensitiveHeader, type RequestHeader } from '@/utils/request-headers';
import { appStorage, keyRecordToken } from '@/utils/storage';
import { getManifestMetadata, isManifestUrl, manifestLabels } from '@/utils/manifest';
import { CellCheckmark } from '../components/cell-checkmark';
import { popupHistory } from '../utils/history';
import { Component } from 'solid-js';
import { TbOutlineClipboardText } from 'solid-icons/tb';
import { getWebsiteDomain, KeyInfo } from '@/utils/storage';
import { DeleteKeys } from '../components/delete-keys';
import { Header } from '../components/header';
import { Layout } from '../components/layout';
import { List } from '../components/list';
import { Section } from '../components/section';
import { Cell } from '../components/cell';
import { copyKey } from '../utils/key';
import { formatRelativeTime } from '../utils/date';
import { buildDownloadCommand } from '../utils/command';
import { CAPTURE_DETAILS_LABEL, DELETE_SITE_CAPTURES_LABEL } from '../utils/captures';

type KeySettingsProps = {
  key: KeyInfo;
  onClose: () => void;
};

export const KeySettings: Component<KeySettingsProps> = (props) => {
  const [isDeleting, setIsDeleting] = createSignal(false);
  const [deleteError, setDeleteError] = createSignal<string>();
  const metadata = createMemo(() => getManifestMetadata(props.key));
  const [manifestUrl, setManifestUrl] = createSignal(metadata().mpd ?? '');
  let previousManifest = metadata().mpd ?? '';
  createEffect(() => {
    const nextManifest = metadata().mpd ?? '';
    setManifestUrl((current) => (current === previousManifest ? nextManifest : current));
    previousManifest = nextManifest;
  });
  const manifests = createMemo(() => {
    const options = (metadata().manifests ?? []).map((manifest) => ({
      url: manifest.url,
      label: `${manifestLabels[manifest.kind]} · ${manifest.matched ? 'Matched' : 'Seen on page'}`,
    }));
    const saved = metadata().mpd;
    if (saved && !options.some((option) => option.url === saved))
      options.unshift({ url: saved, label: 'Saved manifest' });
    return options;
  });
  const [headers, setHeaders] = createSignal<RequestHeader[]>([]);
  const [headerError, setHeaderError] = createSignal<string>();
  const [selectedHeaders, setSelectedHeaders] = createSignal<RequestHeader[]>([]);
  createEffect(() => {
    const token = keyRecordToken(props.key);
    const url = manifestUrl();
    let isCurrent = true;
    setHeaders([]);
    setHeaderError(undefined);
    setSelectedHeaders([]);
    void browser.windows
      .getCurrent()
      .then(async (window) => {
        if (window.id === undefined) throw new Error('Current window has no ID');
        const result: unknown = await browser.runtime.sendMessage({
          action: 'download-headers',
          token,
          url,
          windowId: window.id,
        });
        if (isCurrent) setHeaders(getDownloadHeaders(result));
      })
      .catch(() => {
        if (isCurrent)
          setHeaderError('Unable to load request headers. Reopen the popup to try again.');
      });
    onCleanup(() => {
      isCurrent = false;
    });
  });
  onMount(() => {
    const unwatch = appStorage.settings.watch((settings) => {
      if (settings?.requestInterception === false) {
        setHeaders([]);
        setSelectedHeaders([]);
        setCommand(buildDownloadCommand(props.key, manifestUrl()) ?? '');
      }
    });
    onCleanup(unwatch);
  });
  const generatedCommand = createMemo(
    () => buildDownloadCommand(props.key, manifestUrl(), selectedHeaders()) ?? '',
  );
  const [command, setCommand] = createSignal(generatedCommand());
  let previousCommand = generatedCommand();
  createEffect(() => {
    const nextCommand = generatedCommand();
    setCommand((current) => (current === previousCommand ? nextCommand : current));
    previousCommand = nextCommand;
  });

  const chooseManifest = (url: string) => {
    setSelectedHeaders([]);
    setManifestUrl(url);
    setCommand(buildDownloadCommand(props.key, url) ?? '');
  };

  const deleteRecord = async () => {
    if (isDeleting()) return;
    setIsDeleting(true);
    setDeleteError(undefined);
    try {
      await popupHistory.allKeys.remove(props.key);
      props.onClose();
    } catch {
      setDeleteError('Deletion failed. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  onMount(() => {
    const mainLayout = document.querySelector<HTMLElement>('#root > main');
    const root = document.getElementById('root');
    if (!mainLayout || !root) return;
    const visibility = mainLayout.style.visibility;
    const overflow = root.style.overflowY;
    const inert = mainLayout.inert;
    // Keep the list's layout and scroll position while details scroll independently.
    mainLayout.style.visibility = 'hidden';
    mainLayout.inert = true;
    root.style.overflowY = 'hidden';
    onCleanup(() => {
      mainLayout.style.visibility = visibility;
      mainLayout.inert = inert;
      root.style.overflowY = overflow;
    });
  });

  return (
    <Layout className="fixed top-0 left-0 w-full h-full min-h-0 max-h-[600px] overflow-y-auto [scrollbar-gutter:stable]">
      <Header
        actions={
          <Cell
            component="button"
            variant="danger"
            size="sm"
            disabled={isDeleting()}
            onClick={deleteRecord}
          >
            Delete
          </Cell>
        }
        onClose={props.onClose}
      >
        {CAPTURE_DETAILS_LABEL}
      </Header>
      <List>
        <Section header="Details">
          <Cell subtitle={props.key.url} onClick={() => window.open(props.key.url, '_blank')}>
            Page
          </Cell>
          <Cell subtitle={props.key.id}>Key ID</Cell>
          <Cell subtitle={props.key.value} onClick={() => copyKey(props.key)}>
            Key value
          </Cell>
          <Cell
            subtitle={props.key.pssh}
            onClick={() => navigator.clipboard.writeText(props.key.pssh)}
          >
            PSSH
          </Cell>
          <Cell
            subtitle={`${new Date(props.key.createdAt).toLocaleString().slice(0, -3)} (${formatRelativeTime(new Date(props.key.createdAt).toISOString())})`}
          >
            Added
          </Cell>
        </Section>
        <Section
          header="Actions"
          footer={
            <Show when={deleteError()}>
              <span role="alert">{deleteError()}</span>
            </Show>
          }
        >
          <Show when={getWebsiteDomain(props.key.url)}>
            {(domain) => (
              <DeleteKeys
                label={DELETE_SITE_CAPTURES_LABEL}
                scope={{ kind: 'site', domain: domain() }}
              />
            )}
          </Show>
        </Section>
        <Section
          header="Manifest"
          footer={
            !isManifestUrl(manifestUrl())
              ? 'Choose a detected manifest or enter an HTTP(S) URL to build a download command.'
              : 'Matched manifests share initialization data with this capture. Other URLs were seen in the same page frame.'
          }
        >
          <Show
            when={manifests().length}
            fallback={<Cell>No manifest detected for this capture</Cell>}
          >
            <For each={manifests()}>
              {(manifest) => (
                <Cell
                  component="button"
                  title={manifest.url}
                  subtitle={manifest.url}
                  aria-pressed={manifestUrl() === manifest.url}
                  after={<CellCheckmark checked={manifestUrl() === manifest.url} />}
                  onClick={() => chooseManifest(manifest.url)}
                >
                  {manifest.label}
                </Cell>
              )}
            </For>
          </Show>
          <Cell>
            <input
              type="url"
              aria-label="Manifest URL"
              class="w-full outline-none bg-transparent font-mono text-xs"
              placeholder="https://example.com/manifest.m3u8"
              value={manifestUrl()}
              onInput={(event) => chooseManifest(event.currentTarget.value)}
              aria-invalid={Boolean(manifestUrl()) && !isManifestUrl(manifestUrl())}
            />
          </Cell>
        </Section>
        <Section
          header="Request headers"
          headerControls={
            <Cell
              component="button"
              size="xs"
              class="w-auto"
              disabled={!headers().length || selectedHeaders().length === headers().length}
              onClick={() => setSelectedHeaders([...headers()])}
            >
              Select All
            </Cell>
          }
          footer="Click on items to include necessary headers in the command."
        >
          <Show
            when={headers().length}
            fallback={
              <Cell>
                {headerError() ??
                  'No recent request headers available. Reload the player to capture a new request.'}
              </Cell>
            }
          >
            <For each={headers()}>
              {(header) => {
                const isSelected = () => selectedHeaders().includes(header);
                return (
                  <Cell
                    component="button"
                    aria-pressed={isSelected()}
                    subtitle={
                      isSensitiveHeader(header.name) && !isSelected()
                        ? 'Sensitive value hidden. Select to reveal and include.'
                        : header.value
                    }
                    after={<CellCheckmark checked={isSelected()} />}
                    onClick={() =>
                      setSelectedHeaders((current) =>
                        isSelected()
                          ? current.filter((item) => item !== header)
                          : [...current, header],
                      )
                    }
                  >
                    {header.name}
                  </Cell>
                );
              }}
            </For>
          </Show>
        </Section>
        <Section
          header="Command builder (Bash / Zsh)"
          headerControls={
            <Cell
              component="button"
              size="xs"
              class="w-auto"
              disabled={command() === generatedCommand()}
              onClick={() => setCommand(generatedCommand())}
            >
              Reset
            </Cell>
          }
          footer={
            command() !== generatedCommand()
              ? 'Command edited manually. Reset to apply the selected headers.'
              : undefined
          }
        >
          <Cell class="w-full">
            <textarea
              class="font-mono outline-none bg-transparent border-none w-full"
              aria-label="Download command"
              disabled={!isManifestUrl(manifestUrl())}
              placeholder="Select a manifest first"
              value={command()}
              rows={6}
              onInput={(e) => setCommand(e.currentTarget.value)}
            />
          </Cell>
          <Cell
            component="button"
            before={<TbOutlineClipboardText />}
            variant="primary"
            disabled={!isManifestUrl(manifestUrl()) || !command().trim()}
            onClick={() => navigator.clipboard.writeText(command())}
          >
            Copy command
          </Cell>
        </Section>
      </List>
    </Layout>
  );
};
