import { BsCheckLg } from 'solid-icons/bs';
import { TbTrash } from 'solid-icons/tb';
import { appStorage, Client } from '@/utils/storage';
import { useActiveClient, useClients } from '../utils/state';
import { Layout } from '../components/layout';
import { Header } from '../components/header';
import { Cell } from '../components/cell';
import { List } from '../components/list';
import { Section, SectionFooter } from '../components/section';
import { CellImportClient } from '../components/cell-import-client';

export const Clients = () => {
  const [activeClient, setActiveClient] = useActiveClient();
  const [clients, setClients] = useClients();

  const setActive = async (client: Client) => {
    setActiveClient(client);
    await appStorage.clients.active.setValue(client);
  };

  const isActive = (client: Client) =>
    activeClient()?.filename === client.filename;

  const removeClient = async (client: Client) => {
    const newClients = clients().filter((c) => c.filename !== client.filename);
    setClients(newClients);
    await appStorage.clients.remove(client);
    if (newClients.length === 0) setActiveClient(null);
    if (isActive(client)) setActiveClient(newClients[0]);
    await appStorage.clients.active.setValue(activeClient());
  };

  return (
    <Layout>
      <Header backHref="/">Clients</Header>
      <CellImportClient disabled={clients().length >= 10} />
      <Show when={clients().length === 0}>
        <SectionFooter>
          WVD v2, device_client_id_blob / client_id.bin + device_private_key /
          private_key.pem
        </SectionFooter>
      </Show>
      <Show when={clients().length > 0}>
        <List class="mt-2">
          <Section
            header="Imported Clients"
            footer="You can add a maximum of 10 clients."
          >
            {clients().map((client) => (
              <Cell
                class="capitalize group"
                after={
                  <div class="relative min-w-5 min-h-5">
                    <TbTrash
                      class="absolute top-0 text-red-500 w-5 h-5 transition-all translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
                      onClick={() => removeClient(client)}
                    />
                    <Show when={isActive(client)}>
                      <BsCheckLg class="text-blue-500 w-5 h-5 transition-transform group-hover:-translate-x-7" />
                    </Show>
                  </div>
                }
                onClick={() => setActive(client)}
              >
                {client.label}
              </Cell>
            ))}
          </Section>
        </List>
      </Show>
    </Layout>
  );
};
