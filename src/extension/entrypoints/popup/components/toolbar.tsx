import { A } from '@solidjs/router';
import {
  TbOutlineKey as TbKey,
  TbOutlineSettings2 as TbSettings2,
  TbOutlineShieldCog as TbShieldCog,
} from 'solid-icons/tb';
import { CardButton } from './card-button';

export const Toolbar = () => {
  return (
    <div class="grid grid-cols-3 gap-2">
      <A href="/clients">
        <CardButton>
          <TbShieldCog />
          Clients
        </CardButton>
      </A>
      <A href="/keys">
        <CardButton>
          <TbKey />
          Keys
        </CardButton>
      </A>
      <A href="/settings">
        <CardButton>
          <TbSettings2 class="w-5 h-5" />
          Settings
        </CardButton>
      </A>
    </div>
  );
};
