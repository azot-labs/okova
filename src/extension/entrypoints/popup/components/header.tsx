import { A } from '@solidjs/router';
import { FaSolidChevronLeft } from 'solid-icons/fa';
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
  const interactive = () => !!props.backHref || !!props.onClose;
  const groupClass = () =>
    cn(
      'group flex gap-0.5 items-center transition-all',
      interactive() ? 'cursor-pointer hover:opacity-70 hover:gap-1' : 'cursor-default',
    );
  const content = (
    <>
      <Show when={props.backHref || props.onClose}>
        <FaSolidChevronLeft class="size-4 transition-all group-hover:scale-110 group-hover:-ml-0.5" />
      </Show>
      <div>
        {props.children}
        <Show when={props.subtitle}>
          <div class="text-[10px] font-normal -mt-0.5 text-neutral-500/80 dark:text-neutral-400/80">
            {props.subtitle}
          </div>
        </Show>
      </div>
    </>
  );
  return (
    <div
      class={cn(
        'text-base font-bold flex gap-1 items-center min-h-11',
        '-mt-4 py-1 mb-3',
        'px-3',
        'rounded-b-lg',
        'shadow-xs dark:outline-1 dark:outline-neutral-700/80',
        'bg-white dark:bg-neutral-800 dark:text-neutral-50',
      )}
    >
      {props.backHref ? (
        <A href={props.backHref} class={groupClass()} onClick={props.onClose}>
          {content}
        </A>
      ) : props.onClose ? (
        <button type="button" class={groupClass()} onClick={props.onClose}>
          {content}
        </button>
      ) : (
        <div class={groupClass()}>{content}</div>
      )}
      <div class="ml-auto flex gap-1.5 items-center">{props.actions}</div>
    </div>
  );
};
