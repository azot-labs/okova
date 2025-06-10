import { Component, JSX } from 'solid-js';

export const SectionFooter: Component<{ children: JSX.Element }> = (props) => {
  return (
    <footer class="px-3 pt-1.5 pb-1 text-[10px] text-neutral-500">
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
  return (
    <section>
      <div class="shadow-xs">
        <header class="px-2 pt-2 pb-1 text-[10px] uppercase text-neutral-500">
          {props.header}
        </header>
        <div class="rounded-[9px] bg-white [&>div]:rounded-none [&>*:first-child]:rounded-t-lg [&>*:last-child]:rounded-b-lg">
          <For each={props.children}>
            {(child, index) => (
              <>
                {child}
                <Show
                  when={props.children && index() < props.children.length - 1}
                >
                  <div class="h-px bg-gray-100"></div>
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
