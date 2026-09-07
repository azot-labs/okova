import { Component, createSignal, Show } from 'solid-js';
import { z } from 'zod';
import { Section, SectionFooter } from './section';
import { TbOutlineFilePlus } from 'solid-icons/tb';
import { Cell } from './cell';
import { syncCredentials, useCredentialsImportWarning, useSettings } from '../utils/state';
import { appStorage, Credentials } from '@/utils/storage';
import { parseCredentialsFiles } from '../utils/credential-import';

export const CellImportCredentials: Component<{
  disabled?: boolean;
  onChange?: (credentials: Credentials) => void;
}> = (props) => {
  const [, setSettings] = useSettings();

  const [, setImportWarning] = useCredentialsImportWarning();
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
      const { credentials, warning } = await parseCredentialsFiles(files);
      const snapshot = await appStorage.credentials.import(credentials);
      syncCredentials(snapshot);
      if (snapshot.settings) setSettings(snapshot.settings);
      setImportWarning(warning);
      props.onChange?.(credentials);
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
              : 'Unable to import credentials',
      );
    } finally {
      input.value = '';
      setIsImporting(false);
    }
  };

  return (
    <>
      <Section>
        <Cell before={<TbOutlineFilePlus />} variant="warning" component="label">
          {isImporting() ? 'Importing credentials…' : 'Import credentials'}
          <input
            class="hidden"
            id="file"
            name="credentials"
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
