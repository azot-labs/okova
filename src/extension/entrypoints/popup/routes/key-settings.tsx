import { Component } from 'solid-js';
import { TbOutlineClipboardText } from 'solid-icons/tb';
import { KeyInfo } from '@/utils/storage';
import { Header } from '../components/header';
import { Layout } from '../components/layout';
import { List } from '../components/list';
import { Section } from '../components/section';
import { Cell } from '../components/cell';
import { copyKey } from '../utils/key';
import { formatRelativeTime } from '../utils/date';

type KeySettingsProps = {
  key: KeyInfo;
  onClose: () => void;
};

export const KeySettings: Component<KeySettingsProps> = (props) => {
  const [command, setCommand] = createSignal<string>(
    ['N_m3u8DL-RE', props.key.mpd, '--key', `${props.key.id}:${props.key.value}`].join(' '),
  );

  const getMainLayoutElement = () => {
    return document.querySelector<HTMLDivElement>('#root > main');
  };

  const close = () => {
    const mainLayout = getMainLayoutElement();
    if (mainLayout) mainLayout.style.display = 'block';
    props.onClose();
  };

  onMount(() => {
    const mainLayout = getMainLayoutElement();
    if (!mainLayout) return;
    mainLayout.style.display = 'none';
    return () => {
      mainLayout.style.display = 'block';
    };
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
        <Section header="Command builder">
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
