import { text } from 'node:stream/consumers';
import { parseArgs, type ParseArgsOptionsConfig } from 'node:util';
import {
  PSSH_SYSTEM_IDS,
  convertPsshBox,
  getPsshKeyIds,
  parsePsshBoxes,
  psshBoxToBase64,
  type ParsedPsshBox,
} from '../../../lib/pssh';

const help = () => {
  console.log(`Usage: okova pssh <inspect|kids|convert> [base64|-] [options]

Commands:
  inspect                 Print box metadata and KIDs
  kids                    Print one KID per line, in box order
  convert                 Convert one box between Widevine and PlayReady

Options:
  --box <index>           Select a box by zero-based index
  --json                  Print structured JSON
  --target <DRM>          Conversion target: widevine or playready
  --la-url <url>          License URL for conversion to PlayReady
  -h, --help              Show this help

Pass base64 directly or use - to read base64 text from stdin.
Inspect and kids process all boxes unless --box is supplied.
Conversion requires --box for multiple boxes and writes base64 by default.
Conversion discards other DRM metadata; warnings go to stderr.
Only full PSSH boxes are accepted, not raw DRM headers or media files.`);
};

const inspectKeyIds = (box: ParsedPsshBox) => {
  const isKnownSystem =
    box.systemId === PSSH_SYSTEM_IDS.widevine || box.systemId === PSSH_SYSTEM_IDS.playready;
  if (!isKnownSystem && !box.keyIds.length) {
    return {
      status: 'unsupported',
      error: 'Cannot inspect payload KIDs for this PSSH system',
    } as const;
  }
  try {
    return { status: 'available', values: getPsshKeyIds(box) } as const;
  } catch (error) {
    return {
      status: 'invalid',
      error: error instanceof Error ? error.message : String(error),
    } as const;
  }
};

export const pssh = async (argv: string[]) => {
  const [command, ...rest] = argv;
  if (!command || command === '--help' || command === '-h') {
    const args = parseArgs({ args: argv, options: { help: { type: 'boolean', short: 'h' } } });
    if (args.values.help) return help();
    throw new Error('PSSH subcommand required: inspect, kids, convert');
  }
  if (command !== 'inspect' && command !== 'kids' && command !== 'convert') {
    throw new Error(`Unknown PSSH subcommand: ${command}`);
  }
  const { values, positionals } = parseArgs({
    args: rest,
    allowPositionals: true,
    options: {
      help: { type: 'boolean', short: 'h' },
      box: { type: 'string' },
      json: { type: 'boolean' },
      target: { type: 'string' },
      'la-url': { type: 'string' },
    } satisfies ParseArgsOptionsConfig,
  });
  if (values.help) return help();
  if (command !== 'convert' && (values.target !== undefined || values['la-url'] !== undefined)) {
    throw new Error('--target and --la-url are only supported by pssh convert');
  }
  if (positionals.length > 1) {
    throw new Error('Supply one base64 PSSH argument or - for stdin');
  }
  const input = positionals[0];
  if (input === undefined) {
    throw new Error('PSSH input required: base64 or - for stdin');
  }
  const target = values.target;
  if (target !== undefined && target !== 'widevine' && target !== 'playready') {
    throw new Error('Conversion --target must be widevine or playready');
  }
  if (command === 'convert' && target === undefined) {
    throw new Error('Conversion --target required: widevine or playready');
  }
  if (values['la-url'] !== undefined && target !== 'playready') {
    throw new Error('--la-url requires --target playready');
  }
  if (values.box !== undefined && !/^(0|[1-9]\d*)$/.test(values.box)) {
    throw new Error('--box must be a zero-based integer');
  }
  const boxes = parsePsshBoxes(input === '-' ? await text(process.stdin) : input);
  const index = values.box === undefined ? undefined : Number(values.box);
  if (index !== undefined && (!Number.isSafeInteger(index) || index >= boxes.length)) {
    throw new Error(`--box is out of range; input contains ${boxes.length} box(es)`);
  }
  const selected = boxes
    .map((box, index) => ({ box, index }))
    .filter((entry) => index === undefined || entry.index === index);
  if (target !== undefined) {
    if (selected.length !== 1) throw new Error('Multiple PSSH boxes found; select one with --box');
    const converted = convertPsshBox(selected[0].box, target, { laUrl: values['la-url'] });
    const warnings = [
      'Conversion preserves KIDs and encryption signaling but discards other DRM metadata, including original license URLs and checksums. No checksums are generated; license servers may reject the result.',
    ];
    for (const warning of warnings) console.error(`Warning: ${warning}`);
    const encoded = psshBoxToBase64(converted);
    console.log(values.json ? JSON.stringify({ pssh: encoded, warnings }, null, 2) : encoded);
    return;
  }
  const records = selected.map(({ box, index }) => ({
    index,
    systemId: box.systemId,
    system: Object.entries(PSSH_SYSTEM_IDS).find(([, id]) => id === box.systemId)?.[0] ?? 'unknown',
    version: box.version,
    flags: box.flags,
    dataSize: box.data.length,
    boxKeyIds: box.keyIds,
    keyIds: inspectKeyIds(box),
  }));
  if (command === 'kids') {
    const ids = records.flatMap((record) => {
      if (record.keyIds.status !== 'available') {
        throw new Error(`Box ${record.index}: ${record.keyIds.error}`);
      }
      return record.keyIds.values;
    });
    if (values.json) console.log(JSON.stringify(ids, null, 2));
    else if (ids.length) console.log(ids.join('\n'));
    return;
  }
  if (values.json) console.log(JSON.stringify(records, null, 2));
  else {
    console.log(
      records
        .map((record) =>
          [
            `Box ${record.index}: ${record.system}`,
            `System ID: ${record.systemId}`,
            `Version: ${record.version}`,
            `Flags: ${record.flags}`,
            `Data size: ${record.dataSize} bytes`,
            `Box KIDs: ${record.boxKeyIds.join(', ') || '(none)'}`,
            record.keyIds.status === 'available'
              ? `KIDs: ${record.keyIds.values.join(', ') || '(none)'}`
              : `KIDs: ${record.keyIds.status}: ${record.keyIds.error}`,
          ].join('\n'),
        )
        .join('\n\n'),
    );
  }
  if (records.some((record) => record.keyIds.status === 'invalid')) {
    throw new Error('One or more PSSH payloads could not be inspected');
  }
};
