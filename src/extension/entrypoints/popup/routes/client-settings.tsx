import { Component } from 'solid-js';
import { TbOutlineDownload, TbOutlineTrash } from 'solid-icons/tb';
import { Client } from '@/utils/storage';
import { Header } from '../components/header';
import { Layout } from '../components/layout';
import { List } from '../components/list';
import { Section } from '../components/section';
import { Cell } from '../components/cell';
import { WidevineClient } from '../../../../lib/widevine/client';
import { PlayReadyClient } from '../../../../lib/playready/client';

type ClientSettingsProps = {
  client: Client;
  onExport: (client: Client) => void;
  onDelete: (client: Client) => void;
  onClose: () => void;
};

export const ClientSettings: Component<ClientSettingsProps> = (props) => {
  const drmLabel = createMemo(() => {
    if (props.client instanceof WidevineClient) return 'Google Widevine';
    if (props.client instanceof PlayReadyClient) return 'Microsoft PlayReady';
    return 'Unknown';
  });

  const securityLevel = createMemo(() => {
    if (drmLabel() === 'Google Widevine') return `L${props.client.securityLevel}`;
    if (drmLabel() === 'Microsoft PlayReady') return `SL${props.client.securityLevel}`;
    return 'Unknown';
  });

  return (
    <Layout>
      <Header onClose={props.onClose}>Client Settings</Header>
      <List>
        <Section header="Details">
          <Cell class="capitalize group" subtitle={props.client.label}>
            Label
          </Cell>
          <Cell subtitle={drmLabel()}>DRM</Cell>
          <Cell subtitle={securityLevel()}>Security Level</Cell>
        </Section>
        <Section header="Actions">
          <Cell
            before={<TbOutlineDownload />}
            variant="primary"
            onClick={() => props.onExport(props.client)}
          >
            Export to {drmLabel() === 'Microsoft PlayReady' ? 'PRD' : 'WVD'}
          </Cell>
          <Cell
            before={<TbOutlineTrash />}
            variant="danger"
            onClick={() => props.onDelete(props.client)}
          >
            Delete
          </Cell>
        </Section>
      </List>
    </Layout>
  );
};
