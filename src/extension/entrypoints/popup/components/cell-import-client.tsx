import { Component } from 'solid-js';
import { TbShieldPlus } from 'solid-icons/tb';
import { WidevineClient } from '@okova/lib/widevine/client';
import { PlayReadyClient } from '@okova/lib/playready/client';
import { Cell } from './cell';
import { useActiveClient, useClients } from '../utils/state';
import { appStorage, Client } from '@/utils/storage';

export const CellImportClient: Component<{
  disabled?: boolean;
  onChange?: (client: Client) => void;
}> = (props) => {
  const [, setActiveClient] = useActiveClient();
  const [clients, setClients] = useClients();

  const importClient = async (files: File[]) => {
    const findFile = (query: string) =>
      files
        .find((file) => file.name.includes(query))
        ?.arrayBuffer()
        .then((buffer) => new Uint8Array(buffer));

    // Widevine
    const wvd = await findFile('wvd');
    const id = await findFile('client');
    const key = await findFile('key');
    if (wvd) {
      return WidevineClient.from({ wvd });
    } else if (id && key) {
      return WidevineClient.from({ id, key });
    }

    // PlayReady
    const prd = await findFile('prd');
    const bgroupcert = await findFile('bgroupcert');
    const zgpriv = await findFile('zgpriv');
    if (prd) {
      return PlayReadyClient.from({ prd });
    } else if (bgroupcert && zgpriv) {
      return PlayReadyClient.from({
        groupKey: zgpriv,
        groupCertificate: bgroupcert,
      });
    }
  };

  const applyClient = (client?: Client) => {
    if (!client) return;
    props.onChange?.(client);
  };

  const addClient = async (client: Client) => {
    const newClients = [...clients(), client];
    setClients(newClients);
    await appStorage.clients.add(client);
    if (newClients.length === 1) setActiveClient(client);
  };

  const handleFileChange = async (event: Event) => {
    const files = Array.from((event.target as HTMLInputElement).files || []);
    const client = await importClient(files);
    if (!client) return;
    applyClient(client);
    addClient(client);
  };

  return (
    <Cell before={<TbShieldPlus />} variant="primary" component="label">
      Import client
      <input
        class="hidden"
        id="file"
        name="client"
        multiple
        type="file"
        disabled={props.disabled}
        onChange={handleFileChange}
      />
    </Cell>
  );
};
