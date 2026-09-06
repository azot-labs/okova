import { col } from '../../utils';

export const help = () => {
  console.log(`okova license: Make license request\n`);
  console.log(`Usage: okova license <url> [...flags]\n`);
  console.log(`Commands:`);
  console.log(
    col(`<url>`) + 'URL of license server (e.g. https://cwip-shaka-proxy.appspot.com/no_auth)',
  );
  console.log('');
  console.log(`Flags:`);
  console.log(
    col(`-H, --header`) +
      'headers to send with license request, compatible with curl (e.g. -H "Authorization: Bearer ...")',
  );
  console.log(col(`-p, --pssh`) + 'Widevine or PlayReady PSSH data in Base64');
  console.log(
    col(`-c, --client`) + 'path to client (.wvd/.prd file or directory with credential files)',
  );
  console.log(
    col(`-e, --encrypt`) +
      'encrypt Widevine client ID using a service certificate from the license URL',
  );
  console.log(col(`-h, --help`) + 'display this menu and exit');
};
