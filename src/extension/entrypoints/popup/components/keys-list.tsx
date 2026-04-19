import { Accessor, Component, JSX } from 'solid-js';
import { Cell } from './cell';
import { KeyInfo } from '@/utils/storage';
import { List } from './list';
import { Section } from './section';
import { KeySettings } from '../routes/key-settings';
import { formatRelativeTime } from '../utils/date';

type KeysListProps = {
  keys: Accessor<KeyInfo[]>;
  header?: JSX.Element;
  footer?: JSX.Element;
};

const shorten = (url?: string) => url?.replace('https://', '');

export const KeysList: Component<KeysListProps> = (props) => {
  const [openedKey, setOpenedKey] = createSignal<KeyInfo | null>(null);

  return (
    <Show when={props.keys().length > 0}>
      <Show
        when={!openedKey()}
        fallback={
          <Portal mount={document.getElementById('root')!}>
            <KeySettings key={openedKey()!} onClose={() => setOpenedKey(null)} />
          </Portal>
        }
      >
        <List>
          <Section header={props.header} footer={props.footer}>
            {props.keys().map(({ id, value, url, mpd, createdAt, ...rest }) => (
              <Cell
                class="group"
                onClick={() => setOpenedKey({ id, value, url, mpd, createdAt, ...rest })}
              >
                <code title="Click to copy" class="text-[13px] truncate flex w-full">
                  <span class="w-1/2 truncate">{id}</span>:
                  {/* value may be a status if Spoofing disabled */}
                  <span class="w-1/2 truncate">{value}</span>
                </code>
                <div class="text-[10px] text-gray-500 flex justify-between dark:text-neutral-400">
                  <a
                    title={mpd || url}
                    target="_blank"
                    href={mpd || url}
                    class="w-fit truncate hover:underline hover:text-blue-500 dark:hover:text-blue-400"
                  >
                    {shorten(mpd || url)}
                  </a>
                  <div>{formatRelativeTime(new Date(createdAt).toISOString())}</div>
                </div>
              </Cell>
            ))}
          </Section>
        </List>
      </Show>
    </Show>
  );
};
