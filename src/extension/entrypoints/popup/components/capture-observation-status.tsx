import { A } from '@solidjs/router';
import { useSettings } from '../utils/state';
import type { createPageStreams } from '../utils/page-streams';

export const CaptureObservationStatus = (props: {
  observation: ReturnType<typeof createPageStreams>;
}) => {
  const [settings] = useSettings();
  return (
    <>
      <Show when={!settings.requestInterception}>
        <p class="px-2 text-xs text-neutral-500 dark:text-neutral-400">
          Request interception is off. Enable it in{' '}
          <A href="/settings" class="text-emerald-600 dark:text-emerald-400 underline">
            Settings
          </A>{' '}
          and reload the website to detect new manifests.
        </p>
      </Show>
      <Show when={props.observation.error()}>
        <p role="alert" class="px-2 text-xs text-red-600 dark:text-red-400">
          {props.observation.error()}
        </p>
      </Show>
      <Show when={props.observation.notice()}>
        <p role="status" class="px-2 text-xs text-neutral-500 dark:text-neutral-400">
          {props.observation.notice()}
        </p>
      </Show>
    </>
  );
};
