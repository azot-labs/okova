import { Accessor, Component, JSX } from 'solid-js';
import { Cell } from './cell';
import { KeyInfo } from '@/utils/storage';
import { copyKey } from '../utils/key';
import { List } from './list';
import { Section } from './section';

type KeysListProps = {
  keys: Accessor<KeyInfo[]>;
  header?: JSX.Element;
  footer?: JSX.Element;
};

const shorten = (url?: string) => url?.replace('https://', '');

export const KeysList: Component<KeysListProps> = (props) => {
  return (
    <Show when={props.keys().length > 0}>
      <List>
        <Section header={props.header} footer={props.footer}>
          {props.keys().map(({ id, value, url, mpd, createdAt }) => (
            <Cell class="group" onClick={() => copyKey({ id, value })}>
              <code
                title="Click to copy"
                class="text-[13px] truncate flex w-full"
              >
                <span class="w-1/2 truncate">{id}</span>:
                {/* value may be a status if Spoofing disabled */}
                <span class="w-1/2 truncate">{value}</span>
              </code>
              <div class="text-[10px] text-gray-500 flex justify-between">
                <a
                  title={mpd || url}
                  target="_blank"
                  href={mpd || url}
                  class="w-fit truncate hover:underline hover:text-blue-500"
                >
                  {shorten(mpd || url)}
                </a>
                {/* Date without seconds */}
                <div>
                  {new Date(createdAt)
                    .toLocaleString()
                    .replace(',', '')
                    .slice(0, -3)}
                </div>
              </div>
            </Cell>
          ))}
        </Section>
      </List>
    </Show>
  );
};
