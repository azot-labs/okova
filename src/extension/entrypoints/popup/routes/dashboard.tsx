import { useCaptures } from '../utils/state';
import { getCredentialsSystem } from '@/utils/storage';

import { DeleteKeys } from '../components/delete-keys';
import { A } from '@solidjs/router';
import {
  useActiveCredentials,
  useActiveTabUrl,
  useCredentials,
  useDrmFailure,
  useSettings,
} from '../utils/state';
import { Toolbar } from '../components/toolbar';
import { Cell } from '../components/cell';
import { Layout } from '../components/layout';
import { Header } from '../components/header';
import { CellImportCredentials } from '../components/cell-import-credentials';
import { CaptureList } from '../components/capture-list';
import { createPageStreams } from '../utils/page-streams';
import { CaptureObservationStatus } from '../components/capture-observation-status';
import { CaptureDrmFilter, CaptureOrder } from '../components/capture-filters';
import { CaptureSearch } from '../components/capture-search';
import { NoMatchingCaptures } from '../components/no-matching-captures';
import { createCaptureFilters } from '../utils/capture-filters';
import { getWebsiteDomain, drmStages } from '@/utils/storage';
import { DELETE_SITE_CAPTURES_LABEL, RECENT_CAPTURES_LABEL } from '../utils/captures';
import { TbOutlineRefresh } from 'solid-icons/tb';
import { NoKeys } from '../components/no-keys';

export const Dashboard = () => {
  const [failure] = useDrmFailure();
  const [settings] = useSettings();
  const [credentials] = useCredentials();
  const [activeTabUrl] = useActiveTabUrl();
  const [activeCredentials] = useActiveCredentials();
  const activeFailure = createMemo(() => failure()?.url === activeTabUrl() && failure());
  const activeDomain = createMemo(() => getWebsiteDomain(activeTabUrl()));
  const [allCaptures] = useCaptures();
  const storedCaptures = createMemo(() =>
    allCaptures().filter(
      (capture) => !activeDomain() || getWebsiteDomain(capture.source.url) === activeDomain(),
    ),
  );
  const pageStreams = createPageStreams();
  const filters = createCaptureFilters(storedCaptures);
  const activeDomainRecentKeys = filters.records;

  return (
    <Layout>
      <Header
        subtitle={
          <For each={activeCredentials()}>
            {(entry) => (
              <div>
                {getCredentialsSystem(entry.credentials) === 'widevine' ? 'Widevine' : 'PlayReady'}:{' '}
                {entry.credentials.label}
              </div>
            )}
          </For>
        }
      >
        Dashboard
      </Header>
      <div class="flex flex-col gap-1">
        <Toolbar />
        <CaptureObservationStatus observation={pageStreams} />

        <Show when={credentials().length === 0}>
          <CellImportCredentials />
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

        <CaptureList
          captures={filters.captures}
          total={filters.allCaptures().length}
          records={activeDomainRecentKeys}
          header={RECENT_CAPTURES_LABEL}
          controls={
            <CaptureSearch search={filters.search}>
              <Show when={activeDomain()}>
                {(domain) => (
                  <DeleteKeys
                    class="w-fit ml-auto"
                    label={DELETE_SITE_CAPTURES_LABEL}
                    scope={{ kind: 'site', domain: domain() }}
                    size="xs"
                  />
                )}
              </Show>
              <Cell
                title="Refresh"
                class="w-fit"
                component="button"
                size="xs"
                disabled={pageStreams.isLoading()}
                onClick={() => void pageStreams.refresh()}
              >
                <TbOutlineRefresh aria-hidden="true" class="size-3 opacity-50" />
              </Cell>
              <CaptureDrmFilter {...filters.drm} />
              <CaptureOrder {...filters.order} />
            </CaptureSearch>
          }
          footer={
            <Show when={!settings.spoofing}>
              Enable Spoofing in{' '}
              <A
                href="/settings"
                class="w-fit truncate text-emerald-600 hover:underline hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                Settings
              </A>{' '}
              to obtain content decryption keys
            </Show>
          }
        />

        <Show when={filters.allCaptures().length > 0 && !filters.captures().length}>
          <NoMatchingCaptures onClear={filters.clear} />
        </Show>

        <Show when={filters.allCaptures().length === 0 && !activeFailure()}>
          <footer class="w-full flex flex-col items-center justify-center text-center gap-1 mt-auto py-2">
            <NoKeys />
          </footer>
        </Show>
      </div>
    </Layout>
  );
};
