import { Component, JSX } from 'solid-js';
import { Cell } from './cell';

type CardButtonProps = {
  children: JSX.Element;
};

export const CardButton: Component<CardButtonProps> = (props) => {
  return (
    <Cell class="flex justify-center items-center py-1.5">
      <div class="text-blue-500 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium dark:text-blue-400 [&_svg]:w-5 [&_svg]:h-5">
        {props.children}
      </div>
    </Cell>
  );
};
