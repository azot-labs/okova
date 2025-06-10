import { Component } from 'solid-js';
import { TbShieldPlus } from 'solid-icons/tb';
import { Client } from '@inspectine/lib';
import { Cell } from './cell';
import { useActiveClient, useClients } from '../utils/state';
import { appStorage } from '@/utils/storage';

export const CellImportClient: Component<{
  disabled?: boolean;
  onChange?: (client: Client) => void;
}> = (props) => {
  const [, setActiveClient] = useActiveClient();
  const [clients, setClients] = useClients();

  const addClient = async (client: Client) => {
    const newClients = [...clients(), client];
    setClients(newClients);
    await appStorage.clients.add(client);
    if (newClients.length === 1) setActiveClient(client);
  };

  const createClient = async (
    id?: Uint8Array | null,
    key?: Uint8Array | null,
    wvd?: Uint8Array | null,
  ) => {
    if (id && key) return Client.fromUnpacked(id, key);
    else if (wvd) return Client.fromPacked(wvd);
  };

  const applyClient = (client?: Client) => {
    if (!client) return;
    props.onChange?.(client);
  };

  const handleFileChange = async (event: Event) => {
    const files = Array.from((event.target as HTMLInputElement).files || []);

    const wvd = await files
      .find((file) => file.name.includes('wvd'))
      ?.arrayBuffer()
      .then((buffer) => new Uint8Array(buffer));
    const id = await files
      .find((file) => file.name.includes('client'))
      ?.arrayBuffer()
      .then((buffer) => new Uint8Array(buffer));
    const key = await files
      .find((file) => file.name.includes('key'))
      ?.arrayBuffer()
      .then((buffer) => new Uint8Array(buffer));

    const client = await createClient(id, key, wvd);
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
