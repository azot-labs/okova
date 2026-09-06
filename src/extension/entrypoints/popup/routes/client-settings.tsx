import { RemoteClient } from '@/utils/remote-client';
import { Component, Show } from 'solid-js';
import { TbOutlineDownload, TbOutlineTrash } from 'solid-icons/tb';
import { Client } from '@/utils/storage';
import { Header } from '../components/header';
import { Layout } from '../components/layout';
import { List } from '../components/list';
import { Section } from '../components/section';
import { Cell } from '../components/cell';
import { WidevineDeviceCredentials } from '../../../../lib/widevine/device-credentials';
import { PlayReadyDeviceCredentials } from '../../../../lib/playready/device-credentials';

type ClientSettingsProps = {
  client: Client;
  onExport: (client: Client) => void;
  onDelete: (client: Client) => void;
  onClose: () => void;
};

export const ClientSettings: Component<ClientSettingsProps> = (props) => {
  const drmLabel = createMemo(() => {
    if (props.client instanceof RemoteClient)
      return props.client.keySystem === 'com.widevine.alpha'
        ? 'Google Widevine'
        : 'Microsoft PlayReady';
    if (props.client instanceof WidevineDeviceCredentials) return 'Google Widevine';
    if (props.client instanceof PlayReadyDeviceCredentials) return 'Microsoft PlayReady';
    return 'Unknown';
  });

  const securityLevel = createMemo(() => {
    if (props.client instanceof RemoteClient) return 'Managed by server';
    if (drmLabel() === 'Google Widevine') return `L${props.client.securityLevel}`;
    if (drmLabel() === 'Microsoft PlayReady') return `SL${props.client.securityLevel}`;
    return 'Unknown';
  });

  const remote = () => (props.client instanceof RemoteClient ? props.client : undefined);

  return (
    <Layout>
      <Header onClose={props.onClose}>Client Settings</Header>
      <List>
        <Section header="Details">
          <Cell class="capitalize group" subtitle={props.client.label}>
            Label
          </Cell>
          <Cell subtitle={drmLabel()}>DRM</Cell>
          <Show when={remote()} fallback={<Cell subtitle={securityLevel()}>Security Level</Cell>}>
            {(client) => (
              <>
                <Cell subtitle={client().protocolLabel}>Remote API</Cell>
                <Cell class="break-all" subtitle={client().config.baseUrl}>
                  Server
                </Cell>
                <Cell class="break-all" subtitle={client().device ?? 'Default client'}>
                  Device
                </Cell>
              </>
            )}
          </Show>
        </Section>
        <Section header="Actions">
          <Cell
            before={<TbOutlineDownload />}
            variant="primary"
            onClick={() => props.onExport(props.client)}
          >
            Export to {remote() ? 'JSON' : drmLabel() === 'Microsoft PlayReady' ? 'PRD' : 'WVD'}
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
