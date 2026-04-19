import { cn } from '../utils/cn';
import { Component, JSX } from 'solid-js';

type ListProps = {
  class?: string;
  children?: JSX.Element;
};

export const List: Component<ListProps> = (props) => {
  return <div class={cn('[&>:not(:last-child)]:mb-1', props.class)}>{props.children}</div>;
};
