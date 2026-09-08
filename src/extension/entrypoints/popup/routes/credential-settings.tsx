import { RemoteCredentials } from '@okova/lib/remote/credentials';
import { Component, Show, createResource } from 'solid-js';
import { TbOutlineDownload, TbOutlineTrash } from 'solid-icons/tb';
import { Credentials, serializeCredentials } from '@/utils/storage';
import { getCredentialFingerprint } from '@/utils/credential-fingerprint';
import { Header } from '../components/header';
import { Layout } from '../components/layout';
import { List } from '../components/list';
import { Section, SectionFooter } from '../components/section';
import { Cell } from '../components/cell';
import { WidevineClientCredentials } from '../../../../lib/widevine/client-credentials';
import { PlayReadyClientCredentials } from '../../../../lib/playready/client-credentials';

type CredentialsSettingsProps = {
  credentials: Credentials;
  error?: string;
  disabled?: boolean;
  onExport: (credentials: Credentials) => void;
  onDelete: (credentials: Credentials) => void;
  onClose: () => void;
};

export const CredentialsSettings: Component<CredentialsSettingsProps> = (props) => {
  const [fingerprint] = createResource(
    () => props.credentials,
    async (credentials) => getCredentialFingerprint(await serializeCredentials(credentials)),
  );
  const drmLabel = createMemo(() => {
    if (props.credentials instanceof RemoteCredentials)
      return props.credentials.keySystem === 'com.widevine.alpha'
        ? 'Google Widevine'
        : 'Microsoft PlayReady';
    if (props.credentials instanceof WidevineClientCredentials) return 'Google Widevine';
    if (props.credentials instanceof PlayReadyClientCredentials) return 'Microsoft PlayReady';
    return 'Unknown';
  });

  const securityLevel = createMemo(() => {
    if (props.credentials instanceof RemoteCredentials) return 'Managed by server';
    if (drmLabel() === 'Google Widevine') return `L${props.credentials.securityLevel}`;
    if (drmLabel() === 'Microsoft PlayReady') return `SL${props.credentials.securityLevel}`;
    return 'Unknown';
  });

  const remote = () =>
    props.credentials instanceof RemoteCredentials ? props.credentials : undefined;

  return (
    <Layout>
      <Header onClose={props.onClose}>Credentials Settings</Header>
      <Show when={props.error}>
        <SectionFooter>
          <span role="alert">{props.error}</span>
        </SectionFooter>
      </Show>
      <List>
        <Section header="Details">
          <Cell class="capitalize group" subtitle={props.credentials.label}>
            Label
          </Cell>
          <Cell subtitle={drmLabel()}>DRM</Cell>
          <Cell
            title="Credential fingerprint. Matches session diagnostics from this installation."
            subtitle={
              fingerprint.error ? 'Unavailable' : (fingerprint()?.slice(0, 12) ?? 'Loading…')
            }
          >
            Fingerprint
          </Cell>
          <Show when={remote()} fallback={<Cell subtitle={securityLevel()}>Security Level</Cell>}>
            {(credentials) => (
              <>
                <Cell subtitle={credentials().protocolLabel}>Remote API</Cell>
                <Cell class="break-all" subtitle={credentials().config.baseUrl}>
                  Server
                </Cell>
                <Cell
                  class="break-all"
                  subtitle={credentials().credentialName ?? 'Default credentials'}
                >
                  Credentials
                </Cell>
              </>
            )}
          </Show>
        </Section>
        <Section header="Actions">
          <Cell
            before={<TbOutlineDownload />}
            variant="primary"
            onClick={() => props.onExport(props.credentials)}
          >
            Export to {remote() ? 'JSON' : drmLabel() === 'Microsoft PlayReady' ? 'PRD' : 'WVD'}
          </Cell>
          <Cell
            before={<TbOutlineTrash />}
            variant="danger"
            disabled={props.disabled}
            onClick={() => props.onDelete(props.credentials)}
          >
            Delete
          </Cell>
        </Section>
      </List>
    </Layout>
  );
};
