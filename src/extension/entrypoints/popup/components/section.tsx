import { Component, JSX, children } from 'solid-js';
import { cn } from '../utils/cn';

export const SectionFooter: Component<{ children: JSX.Element }> = (props) => {
  return (
    <footer class="px-3 pt-1.5 pb-1 text-[10px] cursor-default text-neutral-500 dark:text-neutral-400">
      {props.children}
    </footer>
  );
};

type SectionProps = {
  class?: string;
  header?: JSX.Element;
  headerControls?: JSX.Element;
  footer?: JSX.Element;
  children?: JSX.Element;
};

export const Section: Component<SectionProps> = (props) => {
  const resolved = children(() => props.children);
  const items = createMemo(() =>
    resolved
      .toArray()
      .filter(
        (child) =>
          child !== '' && child !== null && child !== undefined && typeof child !== 'boolean',
      ),
  );
  return (
    <section class={cn('w-full', props.class)}>
      <Show when={props.header}>
        <header class="pl-2 pr-1 pt-2 pb-1 text-[10px] cursor-default uppercase tabular-nums text-neutral-500 dark:text-neutral-400 flex items-center gap-0.5">
          {props.header}
          <div class="ml-auto flex items-center gap-0.5">{props.headerControls}</div>
        </header>
      </Show>
      <Show when={items().length}>
        <div class="shadow-xs dark:outline-1 dark:outline-neutral-700/80 rounded-[9px]">
          <div class="rounded-[9px] bg-white dark:bg-neutral-800 [&>*]:rounded-none [&>*:first-child]:rounded-t-lg [&>*:last-child]:rounded-b-lg">
            <For each={items()}>
              {(child, index) => (
                <>
                  {child}
                  <Show when={index() < items().length - 1}>
                    <div class="h-px bg-gray-100 dark:bg-neutral-700/60 transition-colors"></div>
                  </Show>
                </>
              )}
            </For>
          </div>
        </div>
      </Show>
      <Show when={props.footer}>
        <SectionFooter>{props.footer}</SectionFooter>
      </Show>
    </section>
  );
};
