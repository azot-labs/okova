import { A } from '@solidjs/router';
import { FaSolidArrowLeft, FaSolidClose } from 'solid-icons/fa';
import { Component, JSX } from 'solid-js';
import { cn } from '../utils/cn';

type HeaderProps = {
  children: JSX.Element;
  backHref?: string;
  actions?: JSX.Element;
  onClose?: () => void;
};

export const Header: Component<HeaderProps> = (props) => {
  return (
    <div
      class={cn(
        'text-lg font-bold flex gap-3 items-center select-none',
        '-mt-4 py-2 mb-3',
        'px-4',
        'rounded-b-lg',
        'shadow-xs dark:outline-1 dark:outline-neutral-700/80',
        'bg-white dark:bg-neutral-800 dark:text-neutral-50',
      )}
    >
      <Show
        when={props.backHref}
        fallback={
          props.onClose ? (
            <FaSolidClose
              class="size-3.5 transition-opacity hover:opacity-60"
              onClick={props.onClose}
            />
          ) : null
        }
      >
        <A href={props.backHref!} class="transition-opacity hover:opacity-60">
          <FaSolidArrowLeft class="size-3.5" />
        </A>
      </Show>
      <span>{props.children}</span>
      <div class="ml-auto flex gap-3 items-center">{props.actions}</div>
    </div>
  );
};
