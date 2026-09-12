import { popupHistory } from '../utils/history';
import { A } from '@solidjs/router';
import { TbOutlineDevices, TbOutlineSettings, TbOutlineLayersDifference } from 'solid-icons/tb';
import { CardButton } from './card-button';
import { Section } from './section';
import { isCapturedKey } from '@/utils/storage';
import { useCredentials } from '../utils/state';
import { CAPTURES_LABEL, CAPTURES_PATH } from '../utils/captures';

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
      <A href={CAPTURES_PATH} aria-label={CAPTURES_LABEL}>
        <Section>
          <CardButton badge={capturedKeyCount()}>
            <TbOutlineLayersDifference />
            {CAPTURES_LABEL}
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
