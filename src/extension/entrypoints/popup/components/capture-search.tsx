import { type JSX } from 'solid-js';
import { TbOutlineSearch } from 'solid-icons/tb';
import { cn } from '../utils/cn';

type CaptureSearchProps = {
  search: { value: string; onChange: (value: string) => void };
  children?: JSX.Element;
};

// Collapses the other controls while the search field has focus.
export const CaptureSearch = (props: CaptureSearchProps) => {
  const [isSearchExpanded, setIsSearchExpanded] = createSignal(false);
  let searchInput: HTMLInputElement | undefined;
  let searchButton: HTMLButtonElement | undefined;

  return (
    <>
      <div class={isSearchExpanded() ? 'hidden' : 'flex items-center gap-0.5'}>
        {props.children}
      </div>
      <button
        ref={searchButton}
        type="button"
        aria-label="Search"
        aria-expanded={isSearchExpanded()}
        title={props.search.value.trim() ? `Search: ${props.search.value}` : 'Search'}
        class={cn(
          'size-4 items-center justify-center rounded-md cursor-pointer hover:bg-emerald-200/80 dark:hover:bg-neutral-800 focus-visible:outline-2',
          isSearchExpanded() ? 'hidden' : 'inline-flex',
          props.search.value.trim() &&
            'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
        )}
        onClick={() => {
          setIsSearchExpanded(true);
          searchInput?.focus();
        }}
      >
        <TbOutlineSearch aria-hidden="true" class="size-3" />
      </button>
      <div class={cn('relative items-center', isSearchExpanded() ? 'inline-flex' : 'hidden')}>
        <TbOutlineSearch aria-hidden="true" class="pointer-events-none absolute left-1 size-2.5" />
        <input
          ref={searchInput}
          type="search"
          aria-label="Search"
          class="min-h-4 w-56 rounded-md pl-5 pr-1 font-normal outline-none bg-emerald-200/80 dark:bg-neutral-800 focus-visible:outline-2"
          placeholder="Search..."
          value={props.search.value}
          onInput={(event) => props.search.onChange(event.currentTarget.value)}
          onBlur={() => setIsSearchExpanded(false)}
          onKeyDown={(event) => {
            if (event.key !== 'Escape') return;
            event.preventDefault();
            setIsSearchExpanded(false);
            searchButton?.focus();
          }}
        />
      </div>
    </>
  );
};
