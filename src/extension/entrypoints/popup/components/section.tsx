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
  children?: JSX.ArrayElement;
};

export const Section: Component<SectionProps> = (props) => {
  const resolved = children(() => props.children);
  return (
    <section>
      <div class="shadow-xs">
        <header class="px-2 pt-2 pb-1 text-[10px] cursor-default uppercase text-neutral-500 dark:text-neutral-400">
          {props.header}
        </header>
        <div class="rounded-[9px] bg-white dark:bg-neutral-800 [&>*]:rounded-none [&>*:first-child]:rounded-t-lg [&>*:last-child]:rounded-b-lg">
          <For each={resolved.toArray()}>
            {(child, index) => (
              <>
                {child}
                <Show when={resolved.toArray() && index() < resolved.toArray().length - 1}>
                  <div class="h-px bg-gray-100 dark:bg-neutral-700 transition-colors"></div>
                </Show>
              </>
            )}
          </For>
        </div>
      </div>
      <SectionFooter>{props.footer}</SectionFooter>
    </section>
  );
};
