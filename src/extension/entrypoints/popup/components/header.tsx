import { A } from '@solidjs/router';
import { FaSolidArrowLeft } from 'solid-icons/fa';
import { Component, JSX } from 'solid-js';
import { cn } from '../utils/cn';

type HeaderProps = {
  children: JSX.Element;
  backHref?: string;
};

export const Header: Component<HeaderProps> = (props) => {
  return (
    <div
      class={cn(
        'text-lg font-bold flex gap-2 items-center select-none',
        props.backHref ? 'mb-2' : 'mb-1.5',
      )}
    >
      <Show when={props.backHref}>
        <A
          href={props.backHref!}
          class="transition-colors hover:text-blue-500 dark:hover:text-blue-400"
        >
          <FaSolidArrowLeft />
        </A>
      </Show>
      <span>{props.children}</span>
    </div>
  );
};
