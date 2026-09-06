import { WxtStorageItem } from '#imports';
import { fromBase64, fromBuffer } from '../../../lib';

export { asJson } from './json';

export const asBytes = <T extends WxtStorageItem<Uint8Array | null, {}>>(item: T): T => ({
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
