import { A } from '@solidjs/router';
import {
  TbOutlineKey as TbKey,
  TbOutlineSettings2 as TbSettings2,
  TbOutlineShieldCog as TbShieldCog,
} from 'solid-icons/tb';
import { CardButton } from './card-button';
import { Section } from './section';

export const Toolbar = () => {
  return (
    <div class="grid grid-cols-3 gap-2">
      <A href="/clients">
        <Section>
          <CardButton>
            <TbShieldCog />
            Clients
          </CardButton>
        </Section>
      </A>
      <A href="/keys">
        <Section>
          <CardButton>
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
