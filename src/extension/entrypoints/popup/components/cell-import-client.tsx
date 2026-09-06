import { Component } from 'solid-js';
import { TbOutlineShieldPlus as TbShieldPlus } from 'solid-icons/tb';
import { WidevineDeviceCredentials } from '@okova/lib/widevine/device-credentials';
import { PlayReadyDeviceCredentials } from '@okova/lib/playready/device-credentials';
import { Cell } from './cell';
import { useActiveClient, useClients, useSettings } from '../utils/state';
import { appStorage, Client } from '@/utils/storage';

export const CellImportClient: Component<{
  disabled?: boolean;
  onChange?: (client: Client) => void;
}> = (props) => {
  const [activeClient, setActiveClient] = useActiveClient();
  const [settings, setSettings] = useSettings();
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
      return WidevineDeviceCredentials.from({ wvd });
    } else if (id && key) {
      return WidevineDeviceCredentials.from({ id, key });
    }

    // PlayReady
    const prd = await findFile('prd');
    const bgroupcert = await findFile('bgroupcert');
    const zgpriv = await findFile('zgpriv');
    if (prd) {
      return PlayReadyDeviceCredentials.from({ prd });
    } else if (bgroupcert && zgpriv) {
      return PlayReadyDeviceCredentials.from({
        groupKey: zgpriv,
        groupCertificate: bgroupcert,
      });
    }
  };

  const completeClientImport = async (client: Client) => {
    const newClients = [...clients(), client];
    await appStorage.clients.add(client);
    if (!activeClient()) {
      await appStorage.clients.active.setValue(client);
      setActiveClient(client);
    }
    const nextSettings = {
      ...settings,
      emeInterception: true,
      spoofing: true,
      clientPlayback: true,
    };
    await appStorage.settings.setValue(nextSettings);
    setSettings(nextSettings);
    setClients(newClients);
  };

  const handleFileChange = async (event: Event) => {
    if (!(event.target instanceof HTMLInputElement)) return;
    const files = Array.from(event.target.files || []);
    const client = await importClient(files);
    if (!client) return;
    await completeClientImport(client);
    props.onChange?.(client);
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
