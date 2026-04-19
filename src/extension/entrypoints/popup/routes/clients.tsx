import { BsCheckLg } from 'solid-icons/bs';
import { TbOutlineSettings } from 'solid-icons/tb';
import { appStorage, Client } from '@/utils/storage';
import { useActiveClient, useClients } from '../utils/state';
import { Layout } from '../components/layout';
import { Header } from '../components/header';
import { Cell } from '../components/cell';
import { List } from '../components/list';
import { Section, SectionFooter } from '../components/section';
import { CellImportClient } from '../components/cell-import-client';
import { WidevineClient } from '../../../../lib/widevine/client';
import { PlayReadyClient } from '../../../../lib/playready/client';
import { ClientSettings } from './client-settings';
import { saveFile } from '../utils/file';

export const Clients = () => {
  const [activeClient, setActiveClient] = useActiveClient();
  const [clients, setClients] = useClients();

  const setActive = async (client: Client) => {
    setActiveClient(client);
    await appStorage.clients.active.setValue(client);
  };

  const isActive = (client: Client) => activeClient()?.filename === client.filename;

  const [openedClient, setOpenedClient] = createSignal<Client | null>(null);

  const exportClient = async (client: Client) => {
    const data = Uint8Array.from(await client.pack());
    const name = `${client.getName()}`.replaceAll(' ', '-').toLowerCase();
    const filename = `${name}.${client instanceof WidevineClient ? 'wvd' : 'prd'}`;
    await saveFile(data, filename);
  };

  const removeClient = async (client: Client) => {
    const newClients = clients().filter((c) => c.filename !== client.filename);
    setClients(newClients);
    await appStorage.clients.remove(client);
    if (newClients.length === 0) setActiveClient(null);
    if (isActive(client)) setActiveClient(newClients[0]);
    await appStorage.clients.active.setValue(activeClient());
    setOpenedClient(null);
  };

  const getClientLevel = (client: Client) => {
    if (client instanceof WidevineClient) return `Widevine L${client.securityLevel}`;
    if (client instanceof PlayReadyClient) return `PlayReady SL${client.securityLevel}`;
    return 'Unknown';
  };

  return (
    <Show
      when={!openedClient()}
      fallback={
        <ClientSettings
          client={openedClient()!}
          onExport={exportClient}
          onDelete={removeClient}
          onClose={() => setOpenedClient(null)}
        />
      }
    >
      <Layout>
        <Header backHref="/">Clients</Header>
        <CellImportClient disabled={clients().length >= 10} />
        <Show when={clients().length === 0}>
          <SectionFooter>
            WVD v2, device_client_id_blob / client_id.bin + device_private_key / private_key.pem
          </SectionFooter>
        </Show>
        <Show when={clients().length > 0}>
          <List class="mt-2">
            <Section header="Imported Clients" footer="You can add a maximum of 10 clients.">
              {clients().map((client) => (
                <Cell
                  class="capitalize group"
                  subtitle={getClientLevel(client)}
                  after={
                    <div class="relative min-w-5 min-h-5">
                      <TbOutlineSettings
                        title="Client Settings"
                        class="absolute top-0 text-blue-500 hover:text-blue-400 cursor-pointer w-5 h-5 transition-all translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
                        onClick={(event) => {
                          event.stopPropagation();
                          setOpenedClient(client);
                        }}
                      />
                      <Show when={isActive(client)}>
                        <BsCheckLg
                          title="Active Client"
                          class="text-blue-500 w-5 h-5 transition-transform group-hover:-translate-x-7"
                        />
                      </Show>
                    </div>
                  }
                  onClick={() => setActive(client)}
                >
                  <div class="group-hover:w-[85%] truncate">{client.label}</div>
                </Cell>
              ))}
            </Section>
          </List>
        </Show>
      </Layout>
    </Show>
  );
};
