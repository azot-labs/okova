import { Component, JSX, children } from 'solid-js';

export const SectionFooter: Component<{ children: JSX.Element }> = (props) => {
  return (
    <footer class="px-3 pt-1.5 pb-1 text-[10px] cursor-default text-neutral-500 dark:text-neutral-400">
      {props.children}
    </footer>
  );
};

type SectionProps = {
  header?: JSX.Element;
  footer?: JSX.Element;
  children?: JSX.Element;
};

export const Section: Component<SectionProps> = (props) => {
  const resolved = children(() => props.children);
  return (
    <section>
      <Show when={props.header}>
        <header class="px-2 pt-2 pb-1 text-[10px] cursor-default uppercase text-neutral-500 dark:text-neutral-400">
          {props.header}
        </header>
      </Show>
      <div class="shadow-xs dark:outline-1 dark:outline-neutral-700/80 rounded-[9px]">
        <div class="rounded-[9px] bg-white dark:bg-neutral-800 [&>*]:rounded-none [&>*:first-child]:rounded-t-lg [&>*:last-child]:rounded-b-lg">
          <For each={resolved.toArray()}>
            {(child, index) => (
              <>
                {child}
                <Show when={resolved.toArray() && index() < resolved.toArray().length - 1}>
                  <div class="h-px bg-gray-100 dark:bg-neutral-700/60 transition-colors"></div>
                </Show>
              </>
            )}
          </For>
        </div>
      </div>
      <Show when={props.footer}>
        <SectionFooter>{props.footer}</SectionFooter>
      </Show>
    </section>
  );
};
