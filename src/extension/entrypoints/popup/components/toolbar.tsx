import { A } from '@solidjs/router';
import { TbOutlineDevices, TbOutlineSettings, TbOutlineLayersDifference } from 'solid-icons/tb';
import { CardButton } from './card-button';
import { Section } from './section';
import { useCredentials, useCaptures } from '../utils/state';
import { CAPTURES_LABEL, CAPTURES_PATH } from '../utils/captures';

export const Toolbar = () => {
  const [credentials] = useCredentials();
  const [captures] = useCaptures();
  const captureCount = () => captures().length;

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
