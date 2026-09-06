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
  const [command, setCommand] = createSignal(buildDownloadCommand(props.key));

  const getMainLayoutElement = () => {
    return document.querySelector<HTMLDivElement>('#root > main');
  };

  const close = () => {
    const mainLayout = getMainLayoutElement();
    if (mainLayout) mainLayout.style.display = 'block';
    props.onClose();
  };

  const deleteRecord = async () => {
    if (isDeleting()) return;
    setIsDeleting(true);
    setDeleteError(undefined);
    try {
      await appStorage.allKeys.remove(props.key);
      close();
    } catch {
      setDeleteError('Deletion failed. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  onMount(() => {
    const mainLayout = getMainLayoutElement();
    if (!mainLayout) return;
    mainLayout.style.display = 'none';
    onCleanup(() => {
      mainLayout.style.display = 'block';
    });
  });

  return (
    <Layout className="w-full h-full">
      <Header onClose={close}>Key Settings</Header>
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
