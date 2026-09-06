import { Component, JSX, Show } from 'solid-js';
import { useClientImportWarning } from '../utils/state';
import { cn } from '../utils/cn';

export const Layout: Component<{ children: JSX.Element; className?: string }> = (props) => {
  const [importWarning, setImportWarning] = useClientImportWarning();
  return (
    <main
      class={cn(
        'px-4 py-4 pr-0 min-h-[500px] bg-[#EFEFF4] text-neutral-950 transition-colors dark:bg-neutral-950 dark:text-neutral-50',
        props.className,
      )}
    >
      <Show when={importWarning()}>
        <div
          role="status"
          class="mb-3 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200"
        >
          <span class="flex-1">{importWarning()}</span>
          <button
            type="button"
            aria-label="Dismiss import warning"
            class="cursor-pointer underline"
            onClick={() => setImportWarning(undefined)}
          >
            Dismiss
          </button>
        </div>
      </Show>
      {props.children}
    </main>
  );
};
