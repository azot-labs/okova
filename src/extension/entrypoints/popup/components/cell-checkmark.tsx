import { Component, Show } from 'solid-js';
import { BsCheckLg } from 'solid-icons/bs';
import { cn } from '../utils/cn';

type CellCheckmarkProps = {
  checked?: boolean;
  class?: string;
};

export const CellCheckmark: Component<CellCheckmarkProps> = (props) => {
  return (
    <div class={cn('w-5 h-5 flex items-center justify-center', props.class)}>
      <Show when={props.checked}>
        <BsCheckLg class="text-blue-500 dark:text-blue-400 w-5 h-5" />
      </Show>
    </div>
  );
};
