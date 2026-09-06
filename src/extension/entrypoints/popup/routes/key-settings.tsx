import { Component } from 'solid-js';
import { TbOutlineClipboardText, TbOutlineTrash } from 'solid-icons/tb';
import { appStorage, KeyInfo } from '@/utils/storage';
import { Header } from '../components/header';
import { Layout } from '../components/layout';
import { List } from '../components/list';
import { Section } from '../components/section';
import { Cell } from '../components/cell';
import { copyKey } from '../utils/key';
import { formatRelativeTime } from '../utils/date';
import { buildDownloadCommand } from '../utils/command';

type KeySettingsProps = {
  key: KeyInfo;
  onClose: () => void;
};

export const KeySettings: Component<KeySettingsProps> = (props) => {
  const [isDeleting, setIsDeleting] = createSignal(false);
  const [deleteError, setDeleteError] = createSignal<string>();
  const generatedCommand = createMemo(() => buildDownloadCommand(props.key));
  const [command, setCommand] = createSignal(generatedCommand());
  let previousCommand = generatedCommand();
  createEffect(() => {
    const nextCommand = generatedCommand();
    setCommand((current) => (current === previousCommand ? nextCommand : current));
    previousCommand = nextCommand;
  });

  const deleteRecord = async () => {
    if (isDeleting()) return;
    setIsDeleting(true);
    setDeleteError(undefined);
    try {
      await appStorage.allKeys.remove(props.key);
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
      <Header onClose={props.onClose}>Key Settings</Header>
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
          <Cell
            component="button"
            before={<TbOutlineTrash />}
            variant="danger"
            disabled={isDeleting()}
            onClick={deleteRecord}
          >
            Delete
          </Cell>
        </Section>
        <Section header="Command builder (Bash / Zsh)">
          <Cell class="w-full">
            <textarea
              class="font-mono outline-none bg-transparent border-none w-full"
              placeholder="Enter command"
              value={command()}
              rows={6}
              onInput={(e) => setCommand(e.currentTarget.value)}
            />
          </Cell>
          <Cell
            before={<TbOutlineClipboardText />}
            variant="primary"
            onClick={() => navigator.clipboard.writeText(command())}
          >
            Copy command
          </Cell>
        </Section>
      </List>
    </Layout>
  );
};
