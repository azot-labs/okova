import { Component, JSX } from 'solid-js';
import { cn } from '../utils/cn';

export const Layout: Component<{ children: JSX.Element; className?: string }> = (props) => {
  return (
    <main
      class={cn(
        'px-4 py-4 pr-0 min-w-[500px] min-h-[500px] bg-[#EFEFF4] text-neutral-950 transition-colors dark:bg-neutral-950 dark:text-neutral-50',
        props.className,
      )}
    >
      {props.children}
    </main>
  );
};
