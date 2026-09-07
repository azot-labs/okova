#!/usr/bin/env node

import { parseArgs, type ParseArgsOptionsConfig } from 'node:util';
import { credentials } from './commands/credentials';
import { license } from './commands/license';
import pkg from '../../package.json' with { type: 'json' };
import { col } from './utils';
import { serve } from './commands/serve/serve';
import { pssh } from './commands/pssh';

const helpOption = { help: { type: 'boolean', short: 'h' } } satisfies ParseArgsOptionsConfig;
const parse = <T extends ParseArgsOptionsConfig>(args: string[], options: T) =>
  parseArgs({ args, options, strict: true, allowPositionals: true });

const checkPositionals = (positionals: string[], maximum: number) => {
  if (positionals.length > maximum) throw new Error('Too many positional arguments');
};

const help = () => {
  console.log(`Okova: advanced DRM inspection toolkit. (${pkg.version})\n`);
  console.log('Usage: okova <command> [...flags]\n');
  console.log('Commands:');
  console.log(col('serve') + 'Run your API instance');
  console.log(col('license <url>') + 'Make a license request');
  console.log(
    col('credentials <subcommand>') +
      'Widevine and PlayReady credential utilities (aliases: client, creds)',
  );
  console.log(col('pssh <subcommand>') + 'Inspect PSSH boxes, extract KIDs, or convert DRM');
  console.log('\nFlags:');
  console.log(col('-v, --version') + 'Print version and exit');
  console.log(col('-h, --help') + 'Display this menu and exit');
  console.log('\nUse okova <command> --help for command options.');
};

const main = async () => {
  const [command, ...argv] = process.argv.slice(2);
  if (!command || command.startsWith('-')) {
    const args = parse(process.argv.slice(2), {
      ...helpOption,
      version: { type: 'boolean', short: 'v' },
    });
    checkPositionals(args.positionals, 0);
    if (args.values.version) console.log(pkg.version);
    else help();
    return;
  }

  switch (command) {
    case 'serve': {
      const { values, positionals } = parse(argv, {
        ...helpOption,
        host: { type: 'string' },
        port: { type: 'string' },
        secret: { type: 'string', short: 's' },
        public: { type: 'boolean' },
        config: { type: 'string' },
        credentials: { type: 'string', short: 'c' },
      });
      if (values.help) return serve.help();
      checkPositionals(positionals, 0);
      const port = values.port === undefined ? undefined : Number(values.port);
      if (port !== undefined && (!Number.isInteger(port) || port < 1 || port > 65535)) {
        throw new Error('Port must be an integer between 1 and 65535');
      }
      await serve({ ...values, port });
      return;
    }
    case 'client':
    case 'creds':
    case 'credentials': {
      const [subcommand, ...rest] = argv;
      if (!subcommand || subcommand.startsWith('-')) {
        const { values, positionals } = parse(argv, helpOption);
        checkPositionals(positionals, 0);
        if (values.help) return credentials.help();
        throw new Error('Credentials subcommand required: pack, unpack, info');
      }
      if (!['pack', 'unpack', 'info'].includes(subcommand)) {
        throw new Error(`Unknown credentials subcommand: ${subcommand}`);
      }
      const { values, positionals } = parse(rest, {
        ...helpOption,
        ...(subcommand === 'pack' ? { format: { type: 'string', short: 'f' } } : {}),
      } satisfies ParseArgsOptionsConfig);
      if (values.help) return credentials.help();
      checkPositionals(positionals, subcommand === 'info' ? 1 : 2);
      const [input, output] = positionals;
      switch (subcommand) {
        case 'pack': {
          const format = values.format;
          if (format !== undefined && format !== 'wvd' && format !== 'prd') {
            throw new Error('Format must be wvd or prd');
          }
          await credentials.pack(input, format, output);
          return;
        }
        case 'unpack':
          await credentials.unpack(input, output);
          return;
        case 'info':
          await credentials.info(input);
          return;
      }
      return;
    }
    case 'license': {
      const { values, positionals } = parse(argv, {
        ...helpOption,
        pssh: { type: 'string', short: 'p' },
        credentials: { type: 'string', short: 'c' },
        encrypt: { type: 'boolean', short: 'e', default: false },
        header: { type: 'string', short: 'H', multiple: true },
      });
      if (values.help) return license.help();
      checkPositionals(positionals, 1);
      const [url] = positionals;
      if (!url) throw new Error('License URL required');
      if (!values.pssh) throw new Error('PSSH required');
      await license({
        url,
        pssh: values.pssh,
        credentialsPath: values.credentials,
        encrypt: values.encrypt,
        headers: values.header,
      });
      return;
    }
    case 'pssh':
      await pssh(argv);
      return;
    case 'test':
      throw new Error(`Command not implemented: ${command}`);
    default:
      throw new Error(`Unknown command: ${command}`);
  }
};

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
