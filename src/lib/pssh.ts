import { WrmHeader } from './playready/wrmheader';
import { readPlayreadyObject } from './playready/object';
import { fromBase64, fromBuffer, fromHex } from './utils';
import { WidevinePsshData } from './widevine/proto';

export const PSSH_SYSTEM_IDS = {
  widevine: 'edef8ba979d64acea3c827dcd51d21ed',
  playready: '9a04f07998404286ab92e65be0885f95',
} as const;

/** IDs use UUID byte order, represented as 32 lowercase hex digits. */
export type ParsedPsshBox = {
  systemId: string;
  flags: number;
  data: Uint8Array;
} & ({ version: 0; keyIds: [] } | { version: 1; keyIds: string[] });

type PsshId = string | Uint8Array;

const normalizeId = (value: PsshId) => {
  const hex = typeof value === 'string' ? value : fromBuffer(value).toHex();
  if (!/^(?:[\da-f]{32}|[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12})$/i.test(hex)) {
    throw new Error('PSSH IDs must be 16 bytes, 32 hex digits, or a UUID');
  }
  return hex.replaceAll('-', '').toLowerCase();
};

const inputBytes = (value: Uint8Array | string) =>
  typeof value === 'string' ? fromBase64(value).toBuffer() : value;

/** Construct a box around an opaque payload. keyIds here are the version 1 box IDs. */
export const createPsshBox = (
  options: {
    systemId: PsshId;
    data?: Uint8Array | string;
    flags?: number;
  } & ({ version?: 0; keyIds?: never } | { version: 1; keyIds?: readonly PsshId[] }),
): ParsedPsshBox => {
  const flags = options.flags ?? 0;
  if (!Number.isInteger(flags) || flags < 0 || flags > 0xffffff) {
    throw new Error('PSSH flags must be an unsigned 24-bit integer');
  }
  const common = {
    systemId: normalizeId(options.systemId),
    flags,
    data: new Uint8Array(inputBytes(options.data ?? new Uint8Array())),
  };
  if (options.version === 1) {
    return { ...common, version: 1, keyIds: (options.keyIds ?? []).map(normalizeId) };
  }
  if (options.version !== undefined && options.version !== 0) {
    throw new Error('Unsupported PSSH version');
  }
  if (options.keyIds !== undefined) throw new Error('Version 0 boxes cannot contain box key IDs');
  return { ...common, version: 0, keyIds: [] };
};

/** Recognize the box marker even when its size/version fields are malformed. */
export const isPsshBoxSequence = (bytes: Uint8Array) =>
  bytes.length >= 8 &&
  new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(4) === 0x70737368;

/** Parse a sequence of full PSSH boxes. Raw DRM headers and other MP4 boxes are rejected. */
export const parsePsshBoxes = (input: Uint8Array | string): ParsedPsshBox[] => {
  const bytes = inputBytes(input);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const boxes: ParsedPsshBox[] = [];
  let offset = 0;
  const requireBytes = (cursor: number, count: number, end: number) => {
    if (cursor + count > end) throw new Error('Truncated PSSH box');
  };
  while (offset < bytes.length) {
    requireBytes(offset, 8, bytes.length);
    const size = view.getUint32(offset);
    if (view.getUint32(offset + 4) !== 0x70737368) throw new Error('Expected a PSSH box');
    let cursor = offset + 8;
    let length = size || bytes.length - offset;
    if (size === 1) {
      requireBytes(cursor, 8, bytes.length);
      const extendedSize = view.getBigUint64(cursor);
      if (extendedSize > BigInt(bytes.length - offset)) throw new Error('Truncated PSSH box');
      length = Number(extendedSize);
      cursor += 8;
    }
    const end = offset + length;
    if (end > bytes.length) throw new Error('Truncated PSSH box');
    requireBytes(cursor, 24, end);
    const version = bytes[cursor];
    if (version !== 0 && version !== 1) throw new Error(`Unsupported PSSH version ${version}`);
    const flags = view.getUint32(cursor) & 0xffffff;
    const systemId = bytes.slice(cursor + 4, cursor + 20);
    cursor += 20;
    const keyIds: Uint8Array[] = [];
    if (version === 1) {
      const count = view.getUint32(cursor);
      cursor += 4;
      requireBytes(cursor, count * 16 + 4, end);
      for (let index = 0; index < count; index++, cursor += 16) {
        keyIds.push(bytes.slice(cursor, cursor + 16));
      }
    }
    const dataLength = view.getUint32(cursor);
    cursor += 4;
    if (cursor + dataLength !== end) throw new Error('Invalid PSSH data length');
    const common = { systemId, flags, data: bytes.subarray(cursor, end) };
    boxes.push(
      createPsshBox(version === 1 ? { ...common, version, keyIds } : { ...common, version }),
    );
    offset = end;
  }
  if (!boxes.length) throw new Error('PSSH data must not be empty');
  return boxes;
};

/** Serialize one full box using a normal 32-bit size field. */
export const serializePsshBox = (box: ParsedPsshBox): Uint8Array => {
  const checked = createPsshBox(
    box.version === 1
      ? box
      : {
          systemId: box.systemId,
          flags: box.flags,
          data: box.data,
          version: box.version,
        },
  );
  if (box.version === 0 && box.keyIds.length)
    throw new Error('Version 0 boxes cannot contain box key IDs');
  const size =
    32 + (checked.version === 1 ? 4 + checked.keyIds.length * 16 : 0) + checked.data.length;
  if (size > 0xffffffff) throw new Error('PSSH box exceeds the 32-bit size limit');
  const bytes = new Uint8Array(size);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, size);
  view.setUint32(4, 0x70737368);
  view.setUint32(8, checked.version * 0x1000000 + checked.flags);
  bytes.set(fromHex(checked.systemId).toBuffer(), 12);
  let cursor = 28;
  if (checked.version === 1) {
    view.setUint32(cursor, checked.keyIds.length);
    cursor += 4;
    for (const keyId of checked.keyIds) {
      bytes.set(fromHex(keyId).toBuffer(), cursor);
      cursor += 16;
    }
  }
  view.setUint32(cursor, checked.data.length);
  bytes.set(checked.data, cursor + 4);
  return bytes;
};

export const psshBoxToBase64 = (box: ParsedPsshBox) => fromBuffer(serializePsshBox(box)).toBase64();

// PlayReady stores the first three GUID fields in little endian order.
const swapGuidByteOrder = (bytes: Uint8Array) => {
  normalizeId(bytes);
  const result = new Uint8Array(bytes);
  result.subarray(0, 4).reverse();
  result.subarray(4, 6).reverse();
  result.subarray(6, 8).reverse();
  return result;
};

const readPlayreadyHeaders = (data: Uint8Array) => {
  return readPlayreadyObject(data).map((xml) => {
    const header = new WrmHeader(xml);
    if (header.version === 'UNKNOWN') throw new Error('Unsupported PlayReady header version');
    return header;
  });
};

/** Inspect box KIDs first, falling back to Widevine protobuf or PlayReady Object KIDs. */
export const getPsshKeyIds = (box: ParsedPsshBox): string[] => {
  if (box.version === 1 && box.keyIds.length) return box.keyIds.map(normalizeId);
  switch (normalizeId(box.systemId)) {
    case PSSH_SYSTEM_IDS.widevine:
      // Decode the full payload; valid protobuf fields need not follow the encoder's order.
      return WidevinePsshData.decode(box.data).keyIds.map((keyId) =>
        normalizeId(keyId.length === 32 ? new TextDecoder().decode(keyId) : keyId),
      );
    case PSSH_SYSTEM_IDS.playready:
      return readPlayreadyHeaders(box.data).flatMap((header) =>
        header.keyIds.map((keyId) => normalizeId(swapGuidByteOrder(keyId.value))),
      );
    default:
      throw new Error('Cannot inspect payload KIDs for this PSSH system');
  }
};

/** Replace Widevine payload KIDs and synchronize version 1 box KIDs, without mutating the input. */
export const setPsshKeyIds = (box: ParsedPsshBox, keyIds: readonly PsshId[]): ParsedPsshBox => {
  if (normalizeId(box.systemId) !== PSSH_SYSTEM_IDS.widevine) {
    throw new Error('KID replacement is supported only for Widevine PSSH boxes');
  }
  const ids = keyIds.map(normalizeId);
  const payload = WidevinePsshData.decode(box.data);
  payload.keyIds = ids.map((id) => fromHex(id).toBuffer());
  const data = WidevinePsshData.encode(payload).finish();
  return box.version === 1 ? { ...box, data, keyIds: ids } : { ...box, data, keyIds: [] };
};

const CENC = 0x63656e63;
const CBCS = 0x63626373;

const createPlayreadyData = (keyIds: string[], algorithm: 'AESCTR' | 'AESCBC', laUrl?: string) => {
  if (laUrl !== undefined) new URL(laUrl);
  const escapeXml = (value: string) =>
    value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replace(/[^\x20-\x7e]/gu, (character) => `&#${character.codePointAt(0)};`);
  const kids = keyIds
    .map(
      (id) =>
        `<KID ALGID="${algorithm}" VALUE="${fromBuffer(swapGuidByteOrder(fromHex(id).toBuffer())).toBase64()}"></KID>`,
    )
    .join('');
  const xml = `<WRMHEADER xmlns="http://schemas.microsoft.com/DRM/2007/03/PlayReadyHeader" version="4.3.0.0"><DATA><PROTECTINFO><KIDS>${kids}</KIDS></PROTECTINFO>${laUrl === undefined ? '' : `<LA_URL>${escapeXml(laUrl)}</LA_URL>`}</DATA></WRMHEADER>`;
  const length = xml.length * 2;
  if (length > 0xffff) throw new Error('PlayReady header exceeds the 16-bit record size limit');
  const data = new Uint8Array(10 + length);
  const view = new DataView(data.buffer);
  view.setUint32(0, data.length, true);
  view.setUint16(4, 1, true);
  view.setUint16(6, 1, true);
  view.setUint16(8, length, true);
  for (let index = 0; index < xml.length; index++)
    view.setUint16(10 + index * 2, xml.charCodeAt(index), true);
  return data;
};

/** Convert KIDs and cenc/cbcs signaling. Other DRM metadata is discarded; no checksums are generated. */
export const convertPsshBox = (
  box: ParsedPsshBox,
  target: 'widevine' | 'playready',
  options: { laUrl?: string } = {},
): ParsedPsshBox => {
  const source = normalizeId(box.systemId);
  if (target !== 'widevine' && target !== 'playready')
    throw new Error('Unsupported target PSSH system');
  if (source === PSSH_SYSTEM_IDS[target]) throw new Error(`PSSH is already ${target}`);
  if (source !== PSSH_SYSTEM_IDS.widevine && source !== PSSH_SYSTEM_IDS.playready)
    throw new Error('Unsupported source PSSH system');
  const keyIds = getPsshKeyIds(box);
  if (!keyIds.length) throw new Error('PSSH conversion requires at least one KID');
  let data: Uint8Array;
  if (target === 'playready') {
    const payload = WidevinePsshData.decode(box.data);
    if (
      payload.protectionScheme !== 0 &&
      payload.protectionScheme !== CENC &&
      payload.protectionScheme !== CBCS
    )
      throw new Error('Unsupported Widevine protection scheme');
    if (
      Object.hasOwn(payload, 'algorithm') &&
      payload.algorithm !== WidevinePsshData.Algorithm.AESCTR
    )
      throw new Error('Unsupported Widevine algorithm');
    data = createPlayreadyData(
      keyIds,
      payload.protectionScheme === CBCS ? 'AESCBC' : 'AESCTR',
      options.laUrl,
    );
  } else {
    const keys = readPlayreadyHeaders(box.data).flatMap((header) => header.keyIds);
    const algorithm = keys[0]?.algId;
    if (
      (algorithm !== 'AESCTR' && algorithm !== 'AESCBC') ||
      keys.some((key) => key.algId !== algorithm)
    )
      throw new Error('Unsupported or mixed PlayReady algorithms');
    data = WidevinePsshData.encode(
      WidevinePsshData.create({
        keyIds: keyIds.map((id) => fromHex(id).toBuffer()),
        protectionScheme: algorithm === 'AESCBC' ? CBCS : CENC,
      }),
    ).finish();
  }
  const common = { systemId: PSSH_SYSTEM_IDS[target], flags: box.flags, data };
  return createPsshBox(box.version === 1 ? { ...common, version: 1, keyIds } : common);
};
