import { importClientCredentials } from '../../utils';

export const info = async (input = process.cwd()) => {
  const credentials = await importClientCredentials(input);
  if (!('info' in credentials)) {
    console.log('DRM: PlayReady');
    console.log(`Name: ${credentials.label}`);
    console.log(`Security level: ${credentials.securityLevel}`);
    console.log(`PRD version: ${credentials.groupKey ? 3 : 2}`);
    return;
  }
  for (const [key, value] of credentials.info.entries()) {
    console.log(`${key}: ${value}`);
  }
};
