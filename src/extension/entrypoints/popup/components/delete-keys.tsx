import { createSignal, onMount, Show } from 'solid-js';
import { TbOutlineTrash } from 'solid-icons/tb';
import { deleteKeySnapshot, prepareKeyDeletion, type KeyDeletionScope } from '@/utils/storage';
import { Portal } from 'solid-js/web';
import { Cell } from './cell';

type Deletion = Awaited<ReturnType<typeof prepareKeyDeletion>> & { description: string };

export const DeleteKeys = (props: {
  scope: KeyDeletionScope;
  label: string;
  compact?: boolean;
  disabled?: boolean;
  onDeleted?: () => void;
}) => {
  const [pending, setPending] = createSignal<Deletion | null>(null);
  const [isBusy, setIsBusy] = createSignal(false);
  const [error, setError] = createSignal<string>();
  const prepare = async () => {
    if (isBusy()) return;
    setIsBusy(true);
    setError(undefined);
    const scope = props.scope;
    try {
      const snapshot = await prepareKeyDeletion(scope);
      const description =
        scope.kind === 'site'
          ? `All records for ${scope.domain}, including www.${scope.domain}. Other subdomains are excluded.`
          : scope.kind === 'all'
            ? 'All sites, regardless of the current search or selection.'
            : 'Only the selected records, including their copies in recent captures.';
      setIsBusy(false);
      setPending({ ...snapshot, description });
    } catch {
      setError('Could not prepare deletion. Please try again.');
    } finally {
      setIsBusy(false);
    }
  };
  const confirm = async () => {
    const snapshot = pending();
    if (!snapshot || isBusy()) return;
    setIsBusy(true);
    setError(undefined);
    try {
      await deleteKeySnapshot(snapshot.tokens);
      setPending(null);
      props.onDeleted?.();
    } catch {
      setError('Deletion failed. Please try again.');
    } finally {
      setIsBusy(false);
    }
  };
  return (
    <Cell
      component="button"
      before={props.compact ? undefined : <TbOutlineTrash />}
      variant="danger"
      size={props.compact ? 'sm' : 'md'}
      disabled={props.disabled || isBusy()}
      onClick={prepare}
      subtitle={
        <Show when={error() && !pending()}>
          <span role="alert">{error()}</span>
        </Show>
      }
    >
      {props.label}
      <Portal>
        <Show when={pending()}>
          {(snapshot) => {
            let dialog!: HTMLDialogElement;
            onMount(() => dialog.showModal());
            return (
              <dialog
                ref={dialog}
                onClick={(event) => {
                  // Solid portal events bubble to the opening Cell unless stopped here.
                  event.stopPropagation();
                }}
                aria-labelledby="delete-title"
                aria-describedby="delete-description"
                onCancel={(event) => {
                  event.preventDefault();
                  if (!isBusy()) {
                    setPending(null);
                    setError(undefined);
                  }
                }}
                class="m-auto flex w-[280px] max-w-[calc(100%-32px)] max-h-[calc(100vh-32px)] flex-col overflow-hidden rounded-[14px] bg-[#EFEFF4] p-0 text-center text-neutral-950 shadow-xl backdrop:bg-black/40 dark:bg-neutral-800 dark:text-neutral-50"
              >
                <div class="min-h-0 overflow-y-auto p-4">
                  <h2 id="delete-title" class="text-[14px] font-semibold">
                    Delete {snapshot().count} {snapshot().count === 1 ? 'record' : 'records'}?
                  </h2>
                  <p id="delete-description" class="mt-2 text-[12px] break-words">
                    {snapshot().description}
                  </p>
                  <p class="mt-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                    Removes records from history and recent captures. This cannot be undone. New
                    captures arriving after this confirmation opened will be kept.
                  </p>
                  <Show when={error()}>
                    <p role="alert" class="mt-2 text-xs text-red-600">
                      {error()}
                    </p>
                  </Show>
                </div>
                <div class="flex shrink-0 flex-col">
                  <button
                    type="button"
                    disabled={isBusy() || snapshot().count === 0}
                    onClick={confirm}
                    class="min-h-10 w-full cursor-pointer border-t border-neutral-300 px-4 py-2 text-[13px] text-red-600 hover:bg-black/5 focus-visible:outline-2 focus-visible:-outline-offset-2 disabled:cursor-default disabled:opacity-50 dark:border-neutral-600 dark:text-red-400 dark:hover:bg-white/5"
                  >
                    {isBusy()
                      ? 'Deleting…'
                      : `Delete ${snapshot().count} ${snapshot().count === 1 ? 'record' : 'records'}`}
                  </button>
                  <button
                    autofocus
                    type="button"
                    disabled={isBusy()}
                    onClick={() => {
                      setPending(null);
                      setError(undefined);
                    }}
                    class="min-h-10 w-full cursor-pointer border-t border-neutral-300 px-4 py-2 text-[13px] font-semibold text-[#007AFF] hover:bg-black/5 focus-visible:outline-2 focus-visible:-outline-offset-2 disabled:cursor-default disabled:opacity-50 dark:border-neutral-600 dark:text-blue-400 dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                </div>
              </dialog>
            );
          }}
        </Show>
      </Portal>
    </Cell>
  );
};
