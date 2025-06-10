import { WxtStorageItem } from '#imports';
import { fromBase64, fromBuffer } from '../../../lib';

type WatchCallback<T> = (newValue: T, oldValue: T) => void;

export const asBytes = <T extends WxtStorageItem<Uint8Array | null, {}>>(
  item: T,
): T => ({
  ...item,
  getValue: async () => {
    const value = await item.getValue();
    if (!value) return value;
    return fromBase64(value as unknown as string).toBuffer();
  },
  setValue: async (value: Uint8Array) => {
    const data = fromBuffer(value).toBase64() as unknown as Uint8Array;
    return item.setValue(data);
  },
});

export const asJson = <
  K,
  T extends WxtStorageItem<K | null, {}> = WxtStorageItem<K | null, {}>,
>(
  item: T,
): T => ({
  ...item,
  getValue: async () => {
    const value = await item.getValue();
    if (!value) return value;
    return JSON.parse(value as unknown as string) as K;
  },
  setValue: async (value: Uint8Array) => {
    const data = JSON.stringify(value) as unknown as K;
    return item.setValue(data);
  },
  watch: (callback: WatchCallback<K>) => {
    return item.watch((newValue, oldValue) => {
      if (!newValue) return;
      callback(
        JSON.parse(newValue as unknown as string) as K,
        JSON.parse(oldValue as unknown as string) as K,
      );
    });
  },
});
