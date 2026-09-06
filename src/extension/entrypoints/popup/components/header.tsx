import { A } from '@solidjs/router';
import { FaSolidArrowLeft, FaSolidClose } from 'solid-icons/fa';
import { Component, JSX } from 'solid-js';
import { cn } from '../utils/cn';

type HeaderProps = {
  children: JSX.Element;
  backHref?: string;
  subtitle?: JSX.Element;
  actions?: JSX.Element;
  onClose?: () => void;
};

export const Header: Component<HeaderProps> = (props) => {
  return (
    <div
      class={cn(
        'text-base font-bold flex gap-3 items-center select-none min-h-11',
        '-mt-4 py-1 mb-3',
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
      <div>
        {props.children}
        <Show when={props.subtitle}>
          <div class="text-[10px] font-normal -mt-0.5 text-neutral-500/80 dark:text-neutral-400/80">
            {props.subtitle}
          </div>
        </Show>
      </div>
      <div class="ml-auto flex gap-3 items-center">{props.actions}</div>
    </div>
  );
};
