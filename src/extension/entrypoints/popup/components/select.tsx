import { splitProps, type Component, type JSX } from 'solid-js';
import { TbOutlineChevronDown } from 'solid-icons/tb';
import { cn } from '../utils/cn';

export type SelectProps = JSX.SelectHTMLAttributes<HTMLSelectElement>;

export const Select: Component<SelectProps> = (props) => {
  const [local, rest] = splitProps(props, ['class']);

  return (
    <span class="relative inline-flex items-center">
      <select
        {...rest}
        class={cn(
          'min-h-4 [field-sizing:content] appearance-none pl-1 pr-3.5 outline-none font-normal rounded-md bg-transparent hover:bg-slate-200/80 hover:dark:bg-neutral-800 cursor-pointer dark:[color-scheme:dark] focus-visible:outline-2 disabled:cursor-default disabled:opacity-50',
          local.class,
        )}
      />
      <TbOutlineChevronDown
        aria-hidden="true"
        class="pointer-events-none absolute right-0.5 size-2.5"
      />
    </span>
  );
};
