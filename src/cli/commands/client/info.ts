import { importClient } from '../../utils';

export const info = async (input: string) => {
  const client = await importClient(input);
  if (!('info' in client)) return;
  for (const [key, value] of client.info.entries()) {
    console.log(`${key}: ${value}`);
  }
};
