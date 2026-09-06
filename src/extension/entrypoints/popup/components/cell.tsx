import { Component, JSX } from 'solid-js';
import { cn } from '../utils/cn';

interface CellProps {
  class?: string;
  title?: string;
  subtitle?: JSX.Element;
  children: JSX.Element;
  size?: 'md' | 'lg';
  variant?: 'default' | 'primary' | 'danger';
  before?: JSX.Element;
  after?: JSX.Element;
  selection?: {
    label: string;
    checked: boolean;
    indeterminate?: boolean;
    onChange: (checked: boolean) => void;
  };
  component?: 'div' | 'button' | 'label';
  disabled?: boolean;
  onClick?: () => void;
}

export const Cell: Component<CellProps> = (props) => {
  const cellProps = mergeProps({ component: 'div' as const }, props);

  return (
    <Dynamic
      component={cellProps.component}
      class={cn(
        'bg-white w-full min-h-9 py-2 rounded-lg text-[13px] flex items-center px-3 cursor-pointer text-left text-neutral-950',
        'transition-colors hover:duration-0 hover:bg-slate-50 active:bg-slate-100',
        'dark:bg-neutral-800 dark:text-neutral-50 dark:hover:bg-neutral-700 dark:active:bg-neutral-700',
        props.variant === 'primary' && 'text-[#007AFF] dark:text-blue-400',
        props.variant === 'danger' && 'text-[#E53935] dark:text-red-400',
        props.disabled && 'cursor-default pointer-events-none opacity-70',
        props.class,
      )}
      title={props.title}
      disabled={cellProps.component === 'button' ? props.disabled : undefined}
      onClick={props.onClick}
    >
      <Show when={props.selection}>
        {(selection) => (
          <label
            class="-my-2 -ml-3 flex min-h-11 w-[42px] shrink-0 cursor-pointer items-center justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            <input
              type="checkbox"
              class="size-4 cursor-pointer accent-blue-600 dark:accent-blue-400 dark:hover:accent-blue-300"
              aria-label={selection().label}
              checked={selection().checked}
              ref={(input) =>
                createEffect(() => {
                  input.indeterminate = selection().indeterminate ?? false;
                })
              }
              onChange={(event) => selection().onChange(event.currentTarget.checked)}
            />
          </label>
        )}
      </Show>
      {props.before && <div class="[&>svg]:w-[18px] [&>svg]:h-[18px] mr-3">{props.before}</div>}
      <div class="flex flex-col truncate select-none w-full">
        <span class="truncate">{props.children}</span>
        <span class={cn('truncate text-[11px] text-neutral-500 select-none dark:text-neutral-400')}>
          {props.subtitle}
        </span>
      </div>
      {props.after && <div class="ml-auto">{props.after}</div>}
    </Dynamic>
  );
};
