import { type HistoryFilters } from '../utils/history-filters';
import { Select } from './select';

type FilterProps<T> = { value: T; onChange: (value: T) => void };

export const CaptureSiteFilter = (props: FilterProps<string> & { options: string[] }) => (
  <Select
    aria-label="Site"
    class="max-w-[90px] truncate"
    title={props.value || 'All sites'}
    value={props.value}
    onChange={(event) => props.onChange(event.currentTarget.value)}
  >
    <option value="">All sites</option>
    <For each={props.options}>{(site) => <option value={site}>{site}</option>}</For>
  </Select>
);

export const CaptureDrmFilter = (props: FilterProps<HistoryFilters['drm']>) => (
  <Select
    aria-label="DRM"
    value={props.value}
    onChange={(event) => {
      const value = event.currentTarget.value;
      if (value === 'all' || value === 'W' || value === 'P' || value === 'C' || value === 'unknown')
        props.onChange(value);
    }}
  >
    <option value="all">All DRM systems</option>
    <option value="W">Widevine</option>
    <option value="P">PlayReady</option>
    <option value="C">ClearKey</option>
    <option value="unknown">Unknown</option>
  </Select>
);

export const CaptureOrder = (props: FilterProps<HistoryFilters['order']>) => (
  <Select
    aria-label="Order"
    value={props.value}
    onChange={(event) => {
      const value = event.currentTarget.value;
      if (value === 'newest' || value === 'oldest') props.onChange(value);
    }}
  >
    <option value="newest">Newest first</option>
    <option value="oldest">Oldest first</option>
  </Select>
);
