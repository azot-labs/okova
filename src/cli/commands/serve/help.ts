import { col } from '../../utils';

export const help = () => {
  console.log(`okova serve: Run your API instance\n`);
  console.log(`Usage: okova serve [...flags]\n`);
  console.log(`Flags:`);
  console.log(col(`--host`) + 'server host (default: 0.0.0.0)');
  console.log(col(`--port`) + 'server port (default: 4000)');
  console.log(col(`--config`) + 'path to config file (default: okova.config.json)');
  console.log(
    col(`-c, --client`) + 'path to client (.wvd/.prd file or directory with credential files)',
  );
  console.log(col(`-s, --secret`) + 'secret key to access API endpoints');
  console.log(col(`-h, --help`) + 'display this menu and exit');
};
