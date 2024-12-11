#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { client } from './commands/client';
import { license } from './commands/license';
import pkg from '../../package.json' with { type: 'json' };
import { col } from './utils';
import { serve } from './commands/serve/serve';

const args = parseArgs({
  args: process.argv.slice(2),
  options: {
    pssh: { type: 'string', short: 'p' },
    client: { type: 'string', short: 'c' },
    encrypt: { type: 'boolean', short: 'e', default: false },
    header: { type: 'string', short: 'H', multiple: true },
    help: { type: 'boolean', short: 'h' },
    version: { type: 'boolean', short: 'v' },
    debug: { type: 'boolean', short: 'd' },

    host: { type: 'string' },
    port: { type: 'string' },
    secret: { type: 'string', short: 's' },
    config: { type: 'string' },
  },
  strict: false,
  allowPositionals: true,
});

const help = () => {
  console.log(
    `Azot is a research & pentesting toolkit for Google's Widevine DRM. (${pkg.version})\n`,
  );
  console.log(`Usage: azot <command> [...flags]\n`);
  console.log(`Commands:`);
  console.log(col(`serve`) + 'Run your API instance');
  console.log(col(`license <url>`) + 'Make a license request');
  console.log(
    col(`client <subcommand>`) + 'Additional Widevine client utilities',
  );
  console.log('');
  console.log(`Flags:`);
  console.log(col(`-d, --debug`) + 'Enable debug level logging');
  console.log(col(`-v, --version`) + 'Print version and exit');
  console.log(col(`-h, --help`) + 'Display this menu and exit');
  console.log('');
  console.log(`(more flags in azot license --help and azot client --help)`);
};

(async () => {
  if (args.values.version) {
    console.log(pkg.version);
    process.exit(0);
  }

  const [command, ...positionals] = args.positionals;

  switch (command) {
    case 'serve': {
      if (args.values.help) {
        serve.help();
        process.exit(0);
      }
      serve({
        host: args.values.host as string | undefined,
        port: args.values.port
          ? parseInt(args.values.port as string)
          : undefined,
        config: args.values.config as string | undefined,
        client: args.values.client as string | undefined,
        secret: args.values.secret as string | undefined,
      });
      break;
    }
    case 'client': {
      const subcommand = positionals.shift();
      const [input, output] = positionals;
      switch (subcommand) {
        case 'pack':
          client.pack(input, output);
          break;
        case 'unpack':
          client.unpack(input, output);
          break;
        case 'info':
          client.info(input);
          break;
        default: {
          if (args.values.help) {
            client.help();
            process.exit(0);
          } else {
            console.log('Client subcommand required: pack, unpack, info');
            process.exit(1);
          }
        }
      }
      break;
    }
    case 'license': {
      if (args.values.help) {
        license.help();
        process.exit(0);
      }
      const url = positionals.shift();
      if (!url) throw new Error('License URL required');
      const pssh = args.values.pssh as string;
      if (!pssh) throw new Error('PSSH required');
      const clientPath = args.values.client as string;
      const encrypt = args.values.encrypt as boolean;
      const headers = args.values.header as string[];
      await license({ url, pssh, clientPath, encrypt, headers });
      break;
    }
    case 'pssh':
      break;
    case 'test':
      break;
    default: {
      if (args.values.help) {
        help();
        process.exit(0);
      } else {
        console.log('Command not found');
        process.exit(1);
      }
    }
  }
})();
