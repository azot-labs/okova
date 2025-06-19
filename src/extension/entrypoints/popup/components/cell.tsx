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
  component?: 'div' | 'button' | 'label';
  disabled?: boolean;
  onClick?: () => void;
}

export const Cell: Component<CellProps> = (props) => {
  const cellProps = mergeProps({ Component: 'div' }, props);

  const component = (props: any) => {
    switch (cellProps.component) {
      case 'button':
        return <button {...props} />;
      case 'label':
        return <label {...props} />;
      default:
      case 'div':
        return <div {...props} />;
    }
  };

  return (
    <Dynamic
      component={component}
      class={cn(
        'bg-white w-full min-h-9 py-2 rounded-lg text-[13px] flex items-center px-3 cursor-pointer',
        'transition hover:bg-slate-50 active:bg-slate-100',
        props.variant === 'primary' && 'text-[#007AFF]',
        props.variant === 'danger' && 'text-[#E53935]',
        props.disabled && 'cursor-default pointer-events-none opacity-70',
        props.class,
      )}
      title={props.title}
      onClick={props.onClick}
    >
      {props.before && (
        <div class="[&>svg]:w-[18px] [&>svg]:h-[18px] mr-3">{props.before}</div>
      )}
      <div class="flex flex-col truncate select-none">
        <span class="truncate">{props.children}</span>
        <span
          class={cn(
            'text-[11px] text-neutral-500 select-none',
            props.variant === 'primary' && 'text-blue-500',
          )}
        >
          {props.subtitle}
        </span>
      </div>
      {props.after && <div class="ml-auto">{props.after}</div>}
    </Dynamic>
  );
};
