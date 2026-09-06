import { Component, createSignal, Show } from 'solid-js';
import { z } from 'zod';
import { Section, SectionFooter } from './section';
import { TbOutlineShieldPlus as TbShieldPlus } from 'solid-icons/tb';
import { Cell } from './cell';
import { syncClients, useClientImportWarning, useSettings } from '../utils/state';
import { appStorage, Client } from '@/utils/storage';
import { parseClientFiles } from '../utils/client-import';

export const CellImportClient: Component<{
  disabled?: boolean;
  onChange?: (client: Client) => void;
}> = (props) => {
  const [, setSettings] = useSettings();

  const [, setImportWarning] = useClientImportWarning();
  const [error, setError] = createSignal<string>();
  const [isImporting, setIsImporting] = createSignal(false);

  const handleFileChange = async (event: Event) => {
    if (!(event.target instanceof HTMLInputElement)) return;
    const input = event.target;
    const files = Array.from(input.files || []);
    if (!files.length || isImporting()) return;
    setError(undefined);
    setImportWarning(undefined);
    setIsImporting(true);
    try {
      const { client, warning } = await parseClientFiles(files);
      const snapshot = await appStorage.clients.import(client);
      syncClients(snapshot);
      if (snapshot.settings) setSettings(snapshot.settings);
      setImportWarning(warning);
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
      <Section>
        <Cell before={<TbShieldPlus />} variant="warning" component="label">
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
      </Section>
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
