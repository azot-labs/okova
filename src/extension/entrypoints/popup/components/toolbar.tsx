import { popupHistory } from '../utils/history';
import { A } from '@solidjs/router';
import { TbOutlineDevices, TbOutlineSettings, TbOutlineLayersDifference } from 'solid-icons/tb';
import { CardButton } from './card-button';
import { Section } from './section';
import type { KeyInfo } from '@/utils/storage';
import type { StreamRecord } from '@/utils/streams';
import { groupCaptureRecords } from '@/utils/capture-groups';
import { useCredentials, useCaptureDiagnostics } from '../utils/state';
import { CAPTURES_LABEL, CAPTURES_PATH } from '../utils/captures';

export const Toolbar = (props: { streams?: StreamRecord[] }) => {
  const [credentials] = useCredentials();
  const [diagnostics] = useCaptureDiagnostics();
  const [records, setRecords] = createSignal<KeyInfo[]>([]);
  const captureCount = createMemo(
    () => groupCaptureRecords(records(), props.streams, diagnostics()).length,
  );
  let hasUpdate = false;
  let isDisposed = false;
  const unwatch = popupHistory.allKeys.raw.watch((keys) => {
    hasUpdate = true;
    setRecords(keys ?? []);
  });
  onCleanup(() => {
    isDisposed = true;
    unwatch();
  });
  onMount(async () => {
    const keys = await popupHistory.allKeys.getValue();
    if (!isDisposed && !hasUpdate) setRecords(keys ?? []);
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
          <CardButton badge={captureCount()}>
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
