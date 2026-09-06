import { DeleteKeys } from '../components/delete-keys';
import { A } from '@solidjs/router';
import { Cell } from '../components/cell';
import {
  useActiveClient,
  useActiveTabUrl,
  useClients,
  useDrmFailure,
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
import { getRecentKeysForUrl, getWebsiteDomain, drmStages } from '@/utils/storage';

export const Dashboard = () => {
  const [failure] = useDrmFailure();
  const [settings] = useSettings();
  const [clients] = useClients();
  const [recentKeys] = useRecentKeys();
  const [recentKeysByDomain] = useRecentKeysByDomain();
  const [activeTabUrl] = useActiveTabUrl();
  const [activeClient] = useActiveClient();
  const activeFailure = createMemo(() => failure()?.url === activeTabUrl() && failure());
  const activeDomain = createMemo(() => getWebsiteDomain(activeTabUrl()));
  const recentKeysHeader = createMemo(() =>
    activeDomain() ? `Recent Keys for ${activeDomain()}` : 'Recent Keys',
  );
  const activeDomainRecentKeys = createMemo(() => {
    return getRecentKeysForUrl(activeTabUrl(), recentKeysByDomain(), recentKeys());
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
            {`${activeClient()?.client.label}`}
          </Cell>
        </Show>

        <Show when={activeFailure()}>
          {(diagnostic) => (
            <div
              role="alert"
              class="rounded-lg bg-red-50 p-3 text-[13px] text-red-900 dark:bg-red-950 dark:text-red-200"
            >
              <p class="font-semibold">{drmStages[diagnostic().stage]} failed</p>
              <p class="mt-1 whitespace-pre-wrap break-words select-text">{diagnostic().error}</p>
              <p class="mt-2 text-[11px]">Reload the page to retry after fixing the error.</p>
            </div>
          )}
        </Show>

        <Show when={activeDomain()}>
          {(domain) => (
            <DeleteKeys label="Delete This Site" scope={{ kind: 'site', domain: domain() }} />
          )}
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

        <Show when={activeDomainRecentKeys().length === 0 && !activeFailure()}>
          <footer class="w-full flex flex-col items-center justify-center text-center gap-1 mt-auto py-2">
            <NoKeys />
          </footer>
        </Show>
      </div>
    </Layout>
  );
};
