import { Component, createSignal, Show } from 'solid-js';
import { z } from 'zod';
import { RemoteClient } from '@/utils/remote-client';
import { usesPywidevineFallback } from '@okova/lib/remote/pywidevine';
import { SectionFooter } from './section';
import { TbOutlineShieldPlus as TbShieldPlus } from 'solid-icons/tb';
import { WidevineDeviceCredentials } from '@okova/lib/widevine/device-credentials';
import { PlayReadyDeviceCredentials } from '@okova/lib/playready/device-credentials';
import { Cell } from './cell';
import { useActiveClient, useClientImportWarning, useClients, useSettings } from '../utils/state';
import { appStorage, Client } from '@/utils/storage';

export const CellImportClient: Component<{
  disabled?: boolean;
  onChange?: (client: Client) => void;
}> = (props) => {
  const [activeClient, setActiveClient] = useActiveClient();
  const [settings, setSettings] = useSettings();
  const [clients, setClients] = useClients();

  const [, setImportWarning] = useClientImportWarning();
  const [error, setError] = createSignal<string>();
  const [isImporting, setIsImporting] = createSignal(false);

  const importClient = async (files: File[]) => {
    const jsonFiles = files.filter((file) => file.name.toLowerCase().endsWith('.json'));
    if (jsonFiles.length) {
      if (files.length !== 1) throw new Error('Select one remote JSON file at a time');
      const file = jsonFiles[0]!;
      if (file.size > 64 * 1024) throw new Error('Remote configuration must be smaller than 64 KB');
      const config: unknown = JSON.parse(await file.text());
      const client = await RemoteClient.from(config);
      if (usesPywidevineFallback(config)) {
        setImportWarning(
          'DRM system not specified. Imported as Widevine. Add "security_level" to the JSON for better detection.',
        );
      }
      return client;
    }
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
    if (clients().some((existing) => existing.filename === client.filename))
      throw new Error('This client is already imported');
    const newClients = [...clients(), client];
    await appStorage.clients.add(client);
    if (!activeClient()) {
      await appStorage.clients.active.setValue(client);
      setActiveClient(client);
    }
    if (clients().length === 0) {
      const nextSettings = {
        ...settings,
        emeInterception: true,
        spoofing: true,
        clientPlayback: true,
      };
      await appStorage.settings.setValue(nextSettings);
      setSettings(nextSettings);
    }
    setClients(newClients);
  };

  const handleFileChange = async (event: Event) => {
    if (!(event.target instanceof HTMLInputElement)) return;
    const input = event.target;
    const files = Array.from(input.files || []);
    if (!files.length || isImporting()) return;
    setError(undefined);
    setImportWarning(undefined);
    setIsImporting(true);
    try {
      if (clients().length >= 10) throw new Error('You can add a maximum of 10 clients');
      const client = await importClient(files);
      if (!client)
        throw new Error('Select a WVD, PRD, device files, or JSON config for remote server');
      await completeClientImport(client);
      props.onChange?.(client);
    } catch (error) {
      setImportWarning(undefined);
      setError(
        error instanceof z.ZodError
          ? error.issues
              .map((issue) => `${issue.path.join('.') || 'Configuration'}: ${issue.message}`)
              .join('; ')
          : error instanceof SyntaxError
            ? 'Invalid JSON file'
            : error instanceof Error
              ? error.message
              : 'Unable to import client',
      );
    } finally {
      input.value = '';
      setIsImporting(false);
    }
  };

  return (
    <>
      <Cell before={<TbShieldPlus />} variant="primary" component="label">
        {isImporting() ? 'Importing client…' : 'Import client'}
        <input
          class="hidden"
          id="file"
          name="client"
          multiple
          type="file"
          disabled={props.disabled || isImporting()}
          onChange={handleFileChange}
        />
      </Cell>
      <Show when={error()}>
        <SectionFooter>
          <span role="alert" class="text-red-500 break-words">
            {error()}
          </span>
        </SectionFooter>
      </Show>
    </>
  );
};
