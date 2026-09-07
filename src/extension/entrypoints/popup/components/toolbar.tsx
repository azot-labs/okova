import { popupHistory } from '../utils/history';
import { A } from '@solidjs/router';
import { TbOutlineKey, TbOutlineDevices, TbOutlineSettings } from 'solid-icons/tb';
import { CardButton } from './card-button';
import { Section } from './section';
import { isCapturedKey } from '@/utils/storage';
import { useCredentials } from '../utils/state';

export const Toolbar = () => {
  const [credentials] = useCredentials();
  const [capturedKeyCount, setCapturedKeyCount] = createSignal(0);
  let hasUpdate = false;
  let isDisposed = false;
  const unwatch = popupHistory.allKeys.raw.watch((keys) => {
    hasUpdate = true;
    setCapturedKeyCount(keys?.filter(isCapturedKey).length ?? 0);
  });
  onCleanup(() => {
    isDisposed = true;
    unwatch();
  });
  onMount(async () => {
    const keys = await popupHistory.allKeys.getValue();
    if (!isDisposed && !hasUpdate) setCapturedKeyCount(keys?.filter(isCapturedKey).length ?? 0);
  });

  return (
    <div class="grid grid-cols-3 gap-3">
      <A href="/credentials" aria-label="Credentials">
        <Section>
          <CardButton badge={credentials().length}>
            <TbOutlineDevices />
            Credentials
          </CardButton>
        </Section>
      </A>
      <A href="/keys" aria-label="Keys">
        <Section>
          <CardButton badge={capturedKeyCount()}>
            <TbOutlineKey />
            Keys
          </CardButton>
        </Section>
      </A>
      <A href="/settings">
        <Section>
          <CardButton>
            <TbOutlineSettings class="w-5 h-5" />
            Settings
          </CardButton>
        </Section>
      </A>
    </div>
  );
};
