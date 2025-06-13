import { col } from '../../utils';

export const help = () => {
  console.log(`orlan license: Make license request\n`);
  console.log(`Usage: orlan license <url> [...flags]\n`);
  console.log(`Commands:`);
  console.log(
    col(`<url>`) +
      'URL of license server (e.g. https://cwip-shaka-proxy.appspot.com/no_auth)',
  );
  console.log('');
  console.log(`Flags:`);
  console.log(
    col(`-H, --header`) +
      'headers to send with license request, compatible with curl (e.g. -H "Authorization: Bearer ...")',
  );
  console.log(col(`-p, --pssh`) + 'widevine PSSH data in Base64');
  console.log(
    col(`-c, --client`) +
      'path to client (directory with id and private key or path to *.wvd file)',
  );
  console.log(
    col(`-e, --encrypt`) +
      'enable client encryption with service certificate, disabled by default',
  );
  console.log(col(`-h, --help`) + 'display this menu and exit');
};
