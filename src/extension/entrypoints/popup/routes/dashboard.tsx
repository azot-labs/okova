import { A } from '@solidjs/router';
import { Cell } from '../components/cell';
import {
  useActiveClient,
  useActiveTabUrl,
  useClients,
  useRecentKeys,
  useRecentKeysByDomain,
  useSettings,
} from '../utils/state';
import { Toolbar } from '../components/toolbar';
import { Layout } from '../components/layout';
import { Header } from '../components/header';
import { CellImportClient } from '../components/cell-import-client';
import { NoKeys } from '../components/no-keys';
import { KeysList } from '../components/keys-list';
import { appStorage, getRecentKeysForUrl, getWebsiteDomain } from '@/utils/storage';

export const Dashboard = () => {
  const [settings] = useSettings();
  const [clients] = useClients();
  const [recentKeys] = useRecentKeys();
  const [recentKeysByDomain] = useRecentKeysByDomain();
  const [activeTabUrl] = useActiveTabUrl();
  const [activeClient, setActiveClient] = useActiveClient();
  const activeDomain = createMemo(() => getWebsiteDomain(activeTabUrl()));
  const recentKeysHeader = createMemo(() =>
    activeDomain() ? `Recent Keys for ${activeDomain()}` : 'Recent Keys',
  );
  const activeDomainRecentKeys = createMemo(() => {
    return getRecentKeysForUrl(activeTabUrl(), recentKeysByDomain(), recentKeys());
  });

  createEffect(() => {
    if (clients().length === 1) {
      const client = clients()[0];
      setActiveClient(client);
      appStorage.clients.active.setValue(client);
    }
  });

  return (
    <Layout>
      <Header>Dashboard</Header>
      <div class="flex flex-col gap-3">
        <Toolbar />

        <Show when={!activeClient() && clients().length === 0}>
          <CellImportClient />
        </Show>

        <Show when={activeClient()}>
          <Cell class="capitalize" component="label" subtitle="Active">
            {`${activeClient()?.label}`}
          </Cell>
        </Show>

        <KeysList
          keys={activeDomainRecentKeys}
          header={
            <span class="block truncate" title={recentKeysHeader()}>
              {recentKeysHeader()}
            </span>
          }
          footer={
            <Show when={!settings.spoofing}>
              Enable Spoofing in{' '}
              <A
                href="/settings"
                class="w-fit truncate text-blue-600 hover:underline hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Settings
              </A>{' '}
              to obtain content decryption keys
            </Show>
          }
        />

        <Show when={activeDomainRecentKeys().length === 0}>
          <footer class="w-full flex flex-col items-center justify-center text-center gap-1 mt-auto py-2">
            <NoKeys />
          </footer>
        </Show>
      </div>
    </Layout>
  );
};
