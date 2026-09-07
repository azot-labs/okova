import { col } from '../../utils';

export const help = () => {
  console.log('okova credentials: Widevine and PlayReady credential utilities\n');
  console.log('Usage: okova credentials <subcommand> [...flags]\n');
  console.log('Aliases: client, creds\n');
  console.log('Commands:');
  console.log(col('info [input]') + 'Print device metadata');
  console.log(col('pack [input] [output]') + 'Pack credentials into a .wvd or .prd file');
  console.log(col('unpack [input] [output]') + 'Export raw credential files into a directory');
  console.log('\nInput is a .wvd/.prd file or a directory containing credential files.');
  console.log(
    'Input defaults to the current directory. Default pack names use the device name and format.',
  );
  console.log('Default unpack output is the current directory. PRD v2 cannot export group files.');
  console.log('Exports create output directories and refuse to overwrite existing paths.');
  console.log('\nFlags:');
  console.log(col('-f, --format <wvd|prd>') + 'Pack format; must match the DRM system');
  console.log(col('-h, --help') + 'Display this menu and exit');
};
