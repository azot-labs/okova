import { RemoteCredentials } from '@okova/lib/remote/credentials';
import { BsCheckLg } from 'solid-icons/bs';
import { TbOutlineSettings } from 'solid-icons/tb';
import { appStorage, Credentials, StoredCredentials } from '@/utils/storage';
import { syncCredentials, useActiveCredentials, useCredentials } from '../utils/state';
import { Layout } from '../components/layout';
import { Header } from '../components/header';
import { Cell } from '../components/cell';
import { List } from '../components/list';
import { Section, SectionFooter } from '../components/section';
import { CellImportCredentials } from '../components/cell-import-credentials';
import { WidevineClientCredentials } from '../../../../lib/widevine/client-credentials';
import { PlayReadyClientCredentials } from '../../../../lib/playready/client-credentials';
import { CredentialsSettings } from './credential-settings';
import { saveFile } from '../utils/file';

export const CredentialsPage = () => {
  const [activeCredentials] = useActiveCredentials();
  const [credentials] = useCredentials();

  const [error, setError] = createSignal<string>();
  const [isSaving, setIsSaving] = createSignal(false);
  const [openedCredentials, setOpenedCredentials] = createSignal<StoredCredentials | null>(null);

  const changeCredentials = async (operation: () => Promise<void>) => {
    if (isSaving()) return;
    setIsSaving(true);
    setError(undefined);
    try {
      await operation();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to save credentials changes');
    } finally {
      setIsSaving(false);
    }
  };
  const setActive = (entry: StoredCredentials) =>
    changeCredentials(async () => {
      syncCredentials(await appStorage.credentials.select(entry.id));
    });
  const isActive = (entry: StoredCredentials) => activeCredentials()?.id === entry.id;

  const exportCredentials = async (credentials: Credentials) => {
    const data = Uint8Array.from(await credentials.pack());
    const name = `${credentials.getName()}`.replaceAll(' ', '-').toLowerCase();
    const extension =
      credentials instanceof RemoteCredentials
        ? 'remote.json'
        : credentials instanceof WidevineClientCredentials
          ? 'wvd'
          : 'prd';
    const filename = `${name.replaceAll(/[^a-z0-9._-]/g, '-')}.${extension}`;
    await saveFile(data, filename);
  };

  const removeCredentials = (entry: StoredCredentials) =>
    changeCredentials(async () => {
      syncCredentials(await appStorage.credentials.remove(entry.id));
      setOpenedCredentials(null);
    });

  const getCredentialsLevel = (credentials: Credentials) => {
    if (credentials instanceof RemoteCredentials)
      return `${credentials.keySystem === 'com.widevine.alpha' ? 'Widevine' : 'PlayReady'} · Remote · ${credentials.protocolLabel}`;
    if (credentials instanceof WidevineClientCredentials)
      return `Widevine L${credentials.securityLevel}`;
    if (credentials instanceof PlayReadyClientCredentials)
      return `PlayReady SL${credentials.securityLevel}`;
    return 'Unknown';
  };

  return (
    <Show
      when={!openedCredentials()}
      fallback={
        <CredentialsSettings
          credentials={openedCredentials()!.credentials}
          error={error()}
          disabled={isSaving()}
          onExport={exportCredentials}
          onDelete={() => removeCredentials(openedCredentials()!)}
          onClose={() => setOpenedCredentials(null)}
        />
      }
    >
      <Layout>
        <Header backHref="/">Credentials</Header>
        <CellImportCredentials disabled={isSaving() || credentials().length >= 10} />
        <Show when={error()}>
          <SectionFooter>
            <span role="alert">{error()}</span>
          </SectionFooter>
        </Show>
        <Show when={credentials().length === 0}>
          <SectionFooter>
            Import a WVD, PRD, raw credential files, or JSON config for remote server
          </SectionFooter>
        </Show>
        <Show when={credentials().length > 0}>
          <List class="mt-2">
            <Section
              header="Imported Credentials"
              footer="You can add a maximum of 10 credentials."
            >
              {credentials().map((entry) => (
                <Cell
                  class="capitalize group"
                  subtitle={getCredentialsLevel(entry.credentials)}
                  disabled={isSaving()}
                  after={
                    <div class="relative min-w-5 min-h-5">
                      <TbOutlineSettings
                        title="Credentials Settings"
                        class="absolute top-0 text-blue-500 hover:text-blue-400 cursor-pointer w-5 h-5 transition-all translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
                        onClick={(event) => {
                          event.stopPropagation();
                          setError(undefined);
                          setOpenedCredentials(entry);
                        }}
                      />
                      <Show when={isActive(entry)}>
                        <BsCheckLg
                          title="Active Credentials"
                          class="text-blue-500 w-5 h-5 transition-transform group-hover:-translate-x-7"
                        />
                      </Show>
                    </div>
                  }
                  onClick={() => setActive(entry)}
                >
                  <div class="group-hover:w-[85%] truncate">{entry.credentials.label}</div>
                </Cell>
              ))}
            </Section>
          </List>
        </Show>
      </Layout>
    </Show>
  );
};
