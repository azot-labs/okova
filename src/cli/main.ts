#!/usr/bin/env node

import { parseArgs, type ParseArgsOptionsConfig } from 'node:util';
import { client } from './commands/client';
import { license } from './commands/license';
import pkg from '../../package.json' with { type: 'json' };
import { col } from './utils';
import { serve } from './commands/serve/serve';

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
  console.log(col('client <subcommand>') + 'Widevine and PlayReady client utilities');
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
        config: { type: 'string' },
        client: { type: 'string', short: 'c' },
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
    case 'client': {
      const [subcommand, ...rest] = argv;
      if (!subcommand || subcommand.startsWith('-')) {
        const { values, positionals } = parse(argv, helpOption);
        checkPositionals(positionals, 0);
        if (values.help) return client.help();
        throw new Error('Client subcommand required: pack, unpack, info');
      }
      if (!['pack', 'unpack', 'info'].includes(subcommand)) {
        throw new Error(`Unknown client subcommand: ${subcommand}`);
      }
      const { values, positionals } = parse(rest, {
        ...helpOption,
        ...(subcommand === 'pack' ? { format: { type: 'string', short: 'f' } } : {}),
      } satisfies ParseArgsOptionsConfig);
      if (values.help) return client.help();
      checkPositionals(positionals, subcommand === 'info' ? 1 : 2);
      const [input, output] = positionals;
      switch (subcommand) {
        case 'pack': {
          const format = values.format;
          if (format !== undefined && format !== 'wvd' && format !== 'prd') {
            throw new Error('Format must be wvd or prd');
          }
          await client.pack(input, format, output);
          return;
        }
        case 'unpack':
          await client.unpack(input, output);
          return;
        case 'info':
          await client.info(input);
          return;
      }
      return;
    }
    case 'license': {
      const { values, positionals } = parse(argv, {
        ...helpOption,
        pssh: { type: 'string', short: 'p' },
        client: { type: 'string', short: 'c' },
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
        clientPath: values.client,
        encrypt: values.encrypt,
        headers: values.header,
      });
      return;
    }
    case 'pssh':
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
