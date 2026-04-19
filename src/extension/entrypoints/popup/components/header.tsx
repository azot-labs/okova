import { A } from '@solidjs/router';
import { FaSolidArrowLeft, FaSolidClose } from 'solid-icons/fa';
import { Component, JSX } from 'solid-js';
import { cn } from '../utils/cn';

type HeaderProps = {
  children: JSX.Element;
  backHref?: string;
  onClose?: () => void;
};

export const Header: Component<HeaderProps> = (props) => {
  return (
    <div
      class={cn(
        'text-lg font-bold flex gap-2 items-center select-none',
        props.backHref || props.onClose ? 'mb-2' : 'mb-1.5',
      )}
    >
      <Show
        when={props.backHref}
        fallback={
          props.onClose ? (
            <FaSolidClose
              class="transition-colors hover:text-blue-500 dark:hover:text-blue-400"
              onClick={props.onClose}
            />
          ) : null
        }
      >
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
