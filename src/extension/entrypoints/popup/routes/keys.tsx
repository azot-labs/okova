import { TbOutlineDownload, TbOutlineTrash as TbTrash } from 'solid-icons/tb';
import { Layout } from '../components/layout';
import { Header } from '../components/header';
import { Cell } from '../components/cell';
import { appStorage, KeyInfo } from '@/utils/storage';
import { KeysList } from '../components/keys-list';
import { NoKeys } from '../components/no-keys';
import { Section } from '../components/section';

export const Keys = () => {
  const [keys, setKeys] = createSignal<KeyInfo[]>([]);

  onMount(async () => {
    const keys = await appStorage.allKeys.getValue();
    if (keys) setKeys(keys);
  });

  const clearKeys = async () => {
    await appStorage.allKeys.clear();
    await appStorage.recentKeys.setValue([]);
    setKeys([]);
  };

  return (
    <Layout>
      <Header backHref="/">Keys</Header>
      <div class="flex flex-col gap-3">
        <Section header="Actions">
          {/* TODO: Implement */}
          <Cell before={<TbOutlineDownload />} variant="primary" disabled>
            Export All
          </Cell>
          <Cell before={<TbTrash />} variant="danger" onClick={clearKeys}>
            Delete All
          </Cell>
        </Section>
        <KeysList keys={keys} header="All Keys" />
        <Show when={!keys().length}>
          <NoKeys />
        </Show>
      </div>
    </Layout>
  );
};
