import { TbOutlineRefresh } from 'solid-icons/tb';
import { Cell } from './cell';

const reload = () => {
  browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tabId = tabs[0]?.id;
    if (tabId !== undefined) browser.tabs.reload(tabId);
  });
};

export const NoKeys = () => {
  return (
    <div class="w-full flex flex-col text-center gap-1 justify-center items-center">
      <h1 class="text-[16px] font-semibold text-center">No captures here</h1>
      <h2 class="text-[13px] px-8 text-center text-neutral-800 dark:text-neutral-300">
        Start playback to get keys
      </h2>
      <Cell
        component="button"
        class="w-fit mt-1"
        size="xs"
        variant="primary"
        before={<TbOutlineRefresh class="size-3!" />}
        onClick={reload}
      >
        Reload tab
      </Cell>
      <nav
        aria-label="DRM demos"
        class="group relative mt-0.5 flex flex-wrap justify-center gap-x-2 gap-y-1 text-[11px] transition-all *:transition-all opacity-50 hover:opacity-100 [&>a]:opacity-0 hover:[&>a]:opacity-100 hover:[&>span]:opacity-0"
      >
        <span class="absolute left-[50%] -translate-x-1/2 top-0 -z-10 text-neutral-800 dark:text-neutral-300">
          See video demos
        </span>
        <a
          title="bitmovin.com/demos/drm"
          href="https://bitmovin.com/demos/drm"
          target="_blank"
          rel="noopener noreferrer"
          class="text-emerald-600 hover:underline dark:text-emerald-400"
        >
          Bitmovin
        </a>
        <a
          title="bradmax.com/site/en/demo/drm"
          href="https://bradmax.com/site/en/demo/drm"
          target="_blank"
          rel="noopener noreferrer"
          class="text-emerald-600 hover:underline dark:text-emerald-400"
        >
          Bradmax
        </a>
        <a
          title="buydrm.com/multikey-demo/"
          href="https://buydrm.com/multikey-demo/"
          target="_blank"
          rel="noopener noreferrer"
          class="text-emerald-600 hover:underline dark:text-emerald-400"
        >
          BuyDRM
        </a>
        <a
          title="reference.dashif.org/dash.js/latest/samples/drm/widevine"
          href="https://reference.dashif.org/dash.js/latest/samples/drm/widevine.html"
          target="_blank"
          rel="noopener noreferrer"
          class="text-emerald-600 hover:underline dark:text-emerald-400"
        >
          dash.js
        </a>
      </nav>
    </div>
  );
};
