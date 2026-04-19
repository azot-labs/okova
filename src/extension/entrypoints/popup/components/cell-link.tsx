import { Component, JSX } from 'solid-js';
import { TbOutlineExternalLink } from 'solid-icons/tb';
import { Cell } from './cell';

type CellLinkProps = {
  href: string;
  children: JSX.Element;
};

export const CellLink: Component<CellLinkProps> = (props) => {
  return (
    <Cell
      component="button"
      variant="primary"
      after={
        <div class="w-5 h-5 flex items-center justify-center">
          <TbOutlineExternalLink class="text-blue-500 dark:text-blue-400 w-4.5 h-4.5" />
        </div>
      }
      onClick={() => window.open(props.href, '_blank')}
    >
      {props.children}
    </Cell>
  );
};
