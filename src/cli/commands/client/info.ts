import { importClient } from '../../utils';

export const info = async (input = process.cwd()) => {
  const client = await importClient(input);
  if (!('info' in client)) {
    console.log('DRM: PlayReady');
    console.log(`Name: ${client.label}`);
    console.log(`Security level: ${client.securityLevel}`);
    console.log(`PRD version: ${client.groupKey ? 3 : 2}`);
    return;
  }
  for (const [key, value] of client.info.entries()) {
    console.log(`${key}: ${value}`);
  }
};
