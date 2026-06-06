import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { aesEcbEncrypt, createSha1 } from '../crypto/common';
import { tryGetUtf16Le } from '../buffer';
import { base64ToBytes, bytesToBase64, compareArrays, fromBase64 } from '../utils';
import { InvalidChecksum, InvalidWrmHeader } from './exceptions';

const WRMHEADER_VERSIONS = {
  V4_0_0_0: '4.0.0.0',
  V4_1_0_0: '4.1.0.0',
  V4_2_0_0: '4.2.0.0',
  V4_3_0_0: '4.3.0.0',
  UNKNOWN: 'UNKNOWN',
} as const;

export type WrmHeaderVersion = (typeof WRMHEADER_VERSIONS)[keyof typeof WRMHEADER_VERSIONS];

const WRMHEADER_KEY_ALG_IDS = {
  AESCTR: 'AESCTR',
  AESCBC: 'AESCBC',
  COCKTAIL: 'COCKTAIL',
  UNKNOWN: 'UNKNOWN',
} as const;

export type WrmHeaderKeyAlgId = (typeof WRMHEADER_KEY_ALG_IDS)[keyof typeof WRMHEADER_KEY_ALG_IDS];

const getLocalName = (node: any) => node?.localName ?? node?.nodeName?.split(':').pop() ?? '';

const findDirectChild = (parent: any, localName: string) => {
  if (!parent?.childNodes) return null;

  for (let index = 0; index < parent.childNodes.length; index++) {
    const child = parent.childNodes[index];
    if (child.nodeType === child.ELEMENT_NODE && getLocalName(child) === localName) {
      return child;
    }
  }

  return null;
};

const findDescendantText = (parent: any, localName: string) => {
  const element = parent?.getElementsByTagName?.('*');
  if (!element) return null;

  for (let index = 0; index < element.length; index++) {
    if (getLocalName(element[index]) === localName) {
      return element[index].textContent?.trim() ?? null;
    }
  }

  return null;
};

const padEnd = (bytes: Uint8Array, length: number) => {
  if (bytes.length >= length) {
    return bytes;
  }

  const padded = new Uint8Array(length);
  padded.set(bytes);
  return padded;
};

const normalizeVersion = (version: string | null | undefined): WrmHeaderVersion => {
  switch (version) {
    case WRMHEADER_VERSIONS.V4_0_0_0:
    case WRMHEADER_VERSIONS.V4_1_0_0:
    case WRMHEADER_VERSIONS.V4_2_0_0:
    case WRMHEADER_VERSIONS.V4_3_0_0:
      return version;
    default:
      return WRMHEADER_VERSIONS.UNKNOWN;
  }
};

const normalizeAlgId = (algId: string | null | undefined): WrmHeaderKeyAlgId => {
  switch (algId) {
    case WRMHEADER_KEY_ALG_IDS.AESCTR:
    case WRMHEADER_KEY_ALG_IDS.AESCBC:
    case WRMHEADER_KEY_ALG_IDS.COCKTAIL:
      return algId;
    default:
      return WRMHEADER_KEY_ALG_IDS.UNKNOWN;
  }
};

export class SignedKeyId {
  value: Uint8Array;
  algId: WrmHeaderKeyAlgId;
  checksum: Uint8Array | null;

  constructor(value: Uint8Array, algId: WrmHeaderKeyAlgId, checksum: Uint8Array | null) {
    this.value = value;
    this.algId = algId;
    this.checksum = checksum;
  }

  static load(
    value: string | null | undefined,
    algId: string | null | undefined,
    checksum?: string | null,
  ) {
    if (!value) {
      throw new InvalidWrmHeader('WRMHEADER key ID value must not be empty');
    }

    return new SignedKeyId(
      base64ToBytes(value),
      normalizeAlgId(algId),
      checksum ? base64ToBytes(checksum) : null,
    );
  }

  async verify(contentKey: Uint8Array) {
    if (!this.value.length) {
      throw new InvalidChecksum('Key ID must not be empty');
    }
    if (!this.checksum?.length) {
      throw new InvalidChecksum('Checksum must not be empty');
    }

    if (this.algId === WRMHEADER_KEY_ALG_IDS.AESCTR) {
      const encrypted = await aesEcbEncrypt(contentKey, this.value);
      return compareArrays(encrypted.subarray(0, 8), this.checksum);
    }

    if (this.algId === WRMHEADER_KEY_ALG_IDS.COCKTAIL) {
      let buffer = padEnd(contentKey, 21);
      for (let index = 0; index < 5; index++) {
        buffer = await createSha1(buffer);
      }

      return compareArrays(buffer.subarray(0, 7), this.checksum);
    }

    throw new InvalidChecksum('Algorithm ID must be either "AESCTR" or "COCKTAIL"');
  }
}

const parseInput = (data: string | Uint8Array) => {
  if (data instanceof Uint8Array) {
    const xml = tryGetUtf16Le(data);
    if (!xml) {
      throw new InvalidWrmHeader('Binary WRMHEADER must be UTF-16LE XML');
    }
    return xml;
  }

  const trimmed = data.trim();
  if (trimmed.startsWith('<')) {
    return data;
  }

  const decoded = fromBase64(data).toBuffer();
  const xml = tryGetUtf16Le(decoded) ?? new TextDecoder().decode(decoded);
  if (!xml.trim().startsWith('<')) {
    throw new InvalidWrmHeader('Data is not a valid WRMHEADER');
  }
  return xml;
};

export class WrmHeader {
  rawXml: string;
  version: WrmHeaderVersion;
  keyIds: SignedKeyId[];
  laUrl: string | null;
  luiUrl: string | null;
  dsId: string | null;
  decryptorSetup: string | null;
  customAttributes: string | null;

  #root: any;

  constructor(data: string | Uint8Array) {
    this.rawXml = parseInput(data);
    const parser = new DOMParser();
    const root = parser.parseFromString(this.rawXml, 'application/xml').documentElement;

    if (!root || getLocalName(root) !== 'WRMHEADER') {
      throw new InvalidWrmHeader('Data is not a valid WRMHEADER');
    }

    this.#root = root;
    this.version = normalizeVersion(root.getAttribute('version'));
    this.keyIds = [];
    this.laUrl = null;
    this.luiUrl = null;
    this.dsId = null;
    this.decryptorSetup = null;
    this.customAttributes = null;

    this.#load();
  }

  #getDataElement() {
    const data = findDirectChild(this.#root, 'DATA');
    if (!data) {
      throw new InvalidWrmHeader('WRMHEADER is missing DATA');
    }
    return data;
  }

  #load() {
    const data = this.#getDataElement();

    switch (this.version) {
      case WRMHEADER_VERSIONS.V4_0_0_0:
        this.#loadV4_0(data);
        break;
      case WRMHEADER_VERSIONS.V4_1_0_0:
        this.#loadV4_1(data);
        break;
      case WRMHEADER_VERSIONS.V4_2_0_0:
      case WRMHEADER_VERSIONS.V4_3_0_0:
      case WRMHEADER_VERSIONS.UNKNOWN:
        this.#loadV4_2Plus(data);
        break;
    }
  }

  #setCommonFields(data: any) {
    this.laUrl = findDescendantText(data, 'LA_URL');
    this.luiUrl = findDescendantText(data, 'LUI_URL');
    this.dsId = findDescendantText(data, 'DS_ID');
    this.decryptorSetup = findDescendantText(data, 'DECRYPTORSETUP');

    const customAttributes = findDirectChild(data, 'CUSTOMATTRIBUTES');
    this.customAttributes = customAttributes
      ? new XMLSerializer().serializeToString(customAttributes)
      : null;
  }

  #loadV4_0(data: any) {
    const kid = findDescendantText(data, 'KID');
    const algId = findDescendantText(data, 'ALGID');
    const checksum = findDescendantText(data, 'CHECKSUM');
    this.keyIds = kid ? [SignedKeyId.load(kid, algId, checksum)] : [];
    this.#setCommonFields(data);
  }

  #loadV4_1(data: any) {
    const protectInfo = findDirectChild(data, 'PROTECTINFO');
    const kid = findDirectChild(protectInfo, 'KID');
    if (kid) {
      this.keyIds.push(
        SignedKeyId.load(
          kid.getAttribute('VALUE'),
          kid.getAttribute('ALGID'),
          kid.getAttribute('CHECKSUM'),
        ),
      );
    }
    this.#setCommonFields(data);
  }

  #loadV4_2Plus(data: any) {
    const protectInfo = findDirectChild(data, 'PROTECTINFO');
    const kids = findDirectChild(protectInfo, 'KIDS');

    if (kids?.childNodes) {
      for (let index = 0; index < kids.childNodes.length; index++) {
        const kid = kids.childNodes[index];
        if (kid.nodeType !== kid.ELEMENT_NODE || getLocalName(kid) !== 'KID') {
          continue;
        }

        this.keyIds.push(
          SignedKeyId.load(
            kid.getAttribute('VALUE'),
            kid.getAttribute('ALGID'),
            kid.getAttribute('CHECKSUM'),
          ),
        );
      }
    }

    this.#setCommonFields(data);
  }

  getProtocolVersion() {
    switch (this.version) {
      case WRMHEADER_VERSIONS.V4_3_0_0:
        return 5;
      case WRMHEADER_VERSIONS.V4_2_0_0:
        return 4;
      default:
        return 1;
    }
  }

  findKeyId(value: Uint8Array) {
    return this.keyIds.find((keyId) => compareArrays(keyId.value, value));
  }

  dumps() {
    return this.rawXml;
  }

  toJSON() {
    return {
      version: this.version,
      laUrl: this.laUrl,
      luiUrl: this.luiUrl,
      dsId: this.dsId,
      decryptorSetup: this.decryptorSetup,
      customAttributes: this.customAttributes,
      keyIds: this.keyIds.map((keyId) => ({
        value: bytesToBase64(keyId.value),
        algId: keyId.algId,
        checksum: keyId.checksum ? bytesToBase64(keyId.checksum) : null,
      })),
    };
  }
}
