export const NoMatchingCaptures = (props: { onClear: () => void }) => (
  <div class="flex flex-col items-center gap-1 py-4 text-center">
    <h1 class="text-[16px] font-semibold">No matching captures</h1>
    <p class="text-[13px] text-neutral-800 dark:text-neutral-300">
      Try another search or adjust filters.
    </p>
    <button
      type="button"
      onClick={props.onClear}
      class="rounded px-3 py-2 text-[13px] text-emerald-600 hover:underline focus-visible:outline-2 dark:text-emerald-400"
    >
      Clear filters
    </button>
  </div>
);
