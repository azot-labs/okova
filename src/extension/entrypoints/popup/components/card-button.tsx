import { Component, JSX } from 'solid-js';
import { Cell } from './cell';

type CardButtonProps = {
  children: JSX.Element;
  badge?: string | number;
};

export const CardButton: Component<CardButtonProps> = (props) => {
  return (
    <Cell class="relative flex justify-center items-center py-1.5">
      <div class="text-blue-500 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium dark:text-blue-400 [&_svg]:w-5 [&_svg]:h-5">
        {props.children}
      </div>
      <Show when={props.badge}>
        <div class="absolute -top-1 -right-1 text-neutral-900 dark:text-white bg-white dark:bg-neutral-700 outline-1 shadow-xs outline-neutral-200/80 dark:outline-neutral-600 rounded-full px-1 py-0.5 text-[10px]">
          {props.badge}
        </div>
      </Show>
    </Cell>
  );
};
