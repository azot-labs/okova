import { RemoteClient } from '@/utils/remote-client';
import { BsCheckLg } from 'solid-icons/bs';
import { TbOutlineSettings } from 'solid-icons/tb';
import { appStorage, Client, StoredClient } from '@/utils/storage';
import { syncClients, useActiveClient, useClients } from '../utils/state';
import { Layout } from '../components/layout';
import { Header } from '../components/header';
import { Cell } from '../components/cell';
import { List } from '../components/list';
import { Section, SectionFooter } from '../components/section';
import { CellImportClient } from '../components/cell-import-client';
import { WidevineDeviceCredentials } from '../../../../lib/widevine/device-credentials';
import { PlayReadyDeviceCredentials } from '../../../../lib/playready/device-credentials';
import { ClientSettings } from './client-settings';
import { saveFile } from '../utils/file';

export const Clients = () => {
  const [activeClient] = useActiveClient();
  const [clients] = useClients();

  const [error, setError] = createSignal<string>();
  const [isSaving, setIsSaving] = createSignal(false);
  const [openedClient, setOpenedClient] = createSignal<StoredClient | null>(null);

  const changeClient = async (operation: () => Promise<void>) => {
    if (isSaving()) return;
    setIsSaving(true);
    setError(undefined);
    try {
      await operation();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to save client changes');
    } finally {
      setIsSaving(false);
    }
  };
  const setActive = (entry: StoredClient) =>
    changeClient(async () => {
      syncClients(await appStorage.clients.select(entry.id));
    });
  const isActive = (entry: StoredClient) => activeClient()?.id === entry.id;

  const exportClient = async (client: Client) => {
    const data = Uint8Array.from(await client.pack());
    const name = `${client.getName()}`.replaceAll(' ', '-').toLowerCase();
    const extension =
      client instanceof RemoteClient
        ? 'remote.json'
        : client instanceof WidevineDeviceCredentials
          ? 'wvd'
          : 'prd';
    const filename = `${name.replaceAll(/[^a-z0-9._-]/g, '-')}.${extension}`;
    await saveFile(data, filename);
  };

  const removeClient = (entry: StoredClient) =>
    changeClient(async () => {
      syncClients(await appStorage.clients.remove(entry.id));
      setOpenedClient(null);
    });

  const getClientLevel = (client: Client) => {
    if (client instanceof RemoteClient)
      return `${client.keySystem === 'com.widevine.alpha' ? 'Widevine' : 'PlayReady'} · Remote · ${client.protocolLabel}`;
    if (client instanceof WidevineDeviceCredentials) return `Widevine L${client.securityLevel}`;
    if (client instanceof PlayReadyDeviceCredentials) return `PlayReady SL${client.securityLevel}`;
    return 'Unknown';
  };

  return (
    <Show
      when={!openedClient()}
      fallback={
        <ClientSettings
          client={openedClient()!.client}
          error={error()}
          disabled={isSaving()}
          onExport={exportClient}
          onDelete={() => removeClient(openedClient()!)}
          onClose={() => setOpenedClient(null)}
        />
      }
    >
      <Layout>
        <Header backHref="/">Clients</Header>
        <CellImportClient disabled={isSaving() || clients().length >= 10} />
        <Show when={error()}>
          <SectionFooter>
            <span role="alert">{error()}</span>
          </SectionFooter>
        </Show>
        <Show when={clients().length === 0}>
          <SectionFooter>
            Import a WVD, PRD, raw device files, or JSON config for remote server
          </SectionFooter>
        </Show>
        <Show when={clients().length > 0}>
          <List class="mt-2">
            <Section header="Imported Clients" footer="You can add a maximum of 10 clients.">
              {clients().map((entry) => (
                <Cell
                  class="capitalize group"
                  subtitle={getClientLevel(entry.client)}
                  disabled={isSaving()}
                  after={
                    <div class="relative min-w-5 min-h-5">
                      <TbOutlineSettings
                        title="Client Settings"
                        class="absolute top-0 text-blue-500 hover:text-blue-400 cursor-pointer w-5 h-5 transition-all translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
                        onClick={(event) => {
                          event.stopPropagation();
                          setError(undefined);
                          setOpenedClient(entry);
                        }}
                      />
                      <Show when={isActive(entry)}>
                        <BsCheckLg
                          title="Active Client"
                          class="text-blue-500 w-5 h-5 transition-transform group-hover:-translate-x-7"
                        />
                      </Show>
                    </div>
                  }
                  onClick={() => setActive(entry)}
                >
                  <div class="group-hover:w-[85%] truncate">{entry.client.label}</div>
                </Cell>
              ))}
            </Section>
          </List>
        </Show>
      </Layout>
    </Show>
  );
};
