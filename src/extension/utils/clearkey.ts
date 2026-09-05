import { z } from 'zod';
import { fromBase64 } from '@okova/lib/utils';

const base64url = z.string().regex(/^[A-Za-z0-9_-]+$/);
const clearKeyResponse = z.object({
  keys: z.array(z.object({ kty: z.literal('oct'), kid: base64url, k: base64url })),
  type: z.enum(['temporary', 'persistent-license']).optional(),
});

// Response inspection is best effort; unrelated or malformed licenses pass through.
export const parseClearKeyResponse = (response: BufferSource) => {
  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(response);
    const license = clearKeyResponse.parse(JSON.parse(text));
    return license.keys.map(({ kid, k }) => {
      const id = fromBase64(kid.replace(/-/g, '+').replace(/_/g, '/')).toHex();
      const value = fromBase64(k.replace(/-/g, '+').replace(/_/g, '/')).toHex();
      if (value.length !== 32) throw new Error('Invalid ClearKey key length');
      return { id, value };
    });
  } catch {
    return undefined;
  }
};
