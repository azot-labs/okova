export const NoKeys = () => {
  return (
    <div class="w-full flex flex-col text-center gap-1 justify-center items-center">
      <h1 class="text-[16px] font-semibold text-center">Keys will appear here</h1>
      <h2 class="text-[13px] px-8 text-center text-neutral-800 dark:text-neutral-300">
        Go to streaming service and play media to get keys
      </h2>
      <nav
        aria-label="DRM demos"
        class="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px] transition-opacity opacity-50 hover:opacity-100"
      >
        <span class="text-neutral-800 dark:text-neutral-300">Demos:</span>
        <a
          href="https://bitmovin.com/demos/drm"
          target="_blank"
          rel="noopener noreferrer"
          class="text-blue-600 hover:underline dark:text-blue-400"
        >
          Bitmovin
        </a>
        <a
          href="https://bradmax.com/site/en/demo/drm"
          target="_blank"
          rel="noopener noreferrer"
          class="text-blue-600 hover:underline dark:text-blue-400"
        >
          Bradmax
        </a>
        <a
          href="https://buydrm.com/multikey-demo/"
          target="_blank"
          rel="noopener noreferrer"
          class="text-blue-600 hover:underline dark:text-blue-400"
        >
          BuyDRM
        </a>
        <a
          href="https://reference.dashif.org/dash.js/latest/samples/drm/widevine.html"
          target="_blank"
          rel="noopener noreferrer"
          class="text-blue-600 hover:underline dark:text-blue-400"
        >
          dash.js
        </a>
      </nav>
    </div>
  );
};
