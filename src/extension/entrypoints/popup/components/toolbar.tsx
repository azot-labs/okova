import { A } from '@solidjs/router';
import {
  TbOutlineKey as TbKey,
  TbOutlineSettings2 as TbSettings2,
  TbOutlineShieldCog as TbShieldCog,
} from 'solid-icons/tb';
import { CardButton } from './card-button';
import { Section } from './section';
import { appStorage, isCapturedKey } from '@/utils/storage';
import { useClients } from '../utils/state';

export const Toolbar = () => {
  const [clients] = useClients();
  const [capturedKeyCount, setCapturedKeyCount] = createSignal(0);
  let hasUpdate = false;
  let isDisposed = false;
  const unwatch = appStorage.allKeys.raw.watch((keys) => {
    hasUpdate = true;
    setCapturedKeyCount(keys?.filter(isCapturedKey).length ?? 0);
  });
  onCleanup(() => {
    isDisposed = true;
    unwatch();
  });
  onMount(async () => {
    const keys = await appStorage.allKeys.getValue();
    if (!isDisposed && !hasUpdate) setCapturedKeyCount(keys?.filter(isCapturedKey).length ?? 0);
  });

  return (
    <div class="grid grid-cols-3 gap-3">
      <A href="/clients" aria-label="Clients">
        <Section>
          <CardButton badge={clients().length}>
            <TbShieldCog />
            Clients
          </CardButton>
        </Section>
      </A>
      <A href="/keys" aria-label="Keys">
        <Section>
          <CardButton badge={capturedKeyCount()}>
            <TbKey />
            Keys
          </CardButton>
        </Section>
      </A>
      <A href="/settings">
        <Section>
          <CardButton>
            <TbSettings2 class="w-5 h-5" />
            Settings
          </CardButton>
        </Section>
      </A>
    </div>
  );
};
