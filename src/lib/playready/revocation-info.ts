import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { fromBase64 } from '../utils';

const REVOCATION_LIST_IDS = {
  REV_INFO: 'VVrezIimBUSoi9E/kNW6Pg==',
  REV_INFO_V2: 'Ef/RUojT3U6Ct2jqTCChbA==',
  PLAYREADY_RUNTIME: 'ioydTlK2p0WXkWklprR5Hw==',
  PLAYREADY_APPLICATION: 'gC4IKKPHsUCCVhnlttibJw==',
  WMDRMNET: 'BOZ1zT1UnEqfCf5tJOi/kA==',
} as const;

export const DEFAULT_REVOCATION_LIST_IDS = [
  REVOCATION_LIST_IDS.PLAYREADY_RUNTIME,
  REVOCATION_LIST_IDS.PLAYREADY_APPLICATION,
  REVOCATION_LIST_IDS.REV_INFO_V2,
  REVOCATION_LIST_IDS.WMDRMNET,
] as const;

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

const parseVersion = (listId: string, listData: string) => {
  const bytes = fromBase64(listData).toBuffer();
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  if (listId === REVOCATION_LIST_IDS.REV_INFO || listId === REVOCATION_LIST_IDS.REV_INFO_V2) {
    return bytes.length >= 16 ? view.getUint32(12) : 0;
  }

  if (listId === REVOCATION_LIST_IDS.WMDRMNET) {
    return bytes.length >= 4 ? view.getUint32(0) : 0;
  }

  return bytes.length >= 20 ? view.getUint32(16) : 0;
};

type RevocationEntry = {
  listId: string;
  version: number;
  xml: string;
};

export class RevocationInfoStore {
  #entries: Map<string, RevocationEntry>;
  #parser: DOMParser;
  #serializer: XMLSerializer;

  constructor() {
    this.#entries = new Map();
    this.#parser = new DOMParser();
    this.#serializer = new XMLSerializer();
  }

  merge(revInfoXml: string) {
    const root = this.#parser.parseFromString(revInfoXml, 'application/xml').documentElement;
    if (!root || getLocalName(root) !== 'RevInfo') {
      return false;
    }

    let didChange = false;

    for (let index = 0; index < root.childNodes.length; index++) {
      const revocation = root.childNodes[index];
      if (revocation.nodeType !== revocation.ELEMENT_NODE || getLocalName(revocation) !== 'Revocation') {
        continue;
      }

      const listId = findDirectChild(revocation, 'ListID')?.textContent?.trim();
      const listData = findDirectChild(revocation, 'ListData')?.textContent?.trim();
      if (!listId || !listData) {
        continue;
      }

      const nextVersion = parseVersion(listId, listData);
      const current = this.#entries.get(listId);
      if (current && current.version >= nextVersion) {
        continue;
      }

      this.#entries.set(listId, {
        listId,
        version: nextVersion,
        xml: this.#serializer.serializeToString(revocation),
      });
      didChange = true;
    }

    return didChange;
  }

  buildRequestXml(listIds: readonly string[] = DEFAULT_REVOCATION_LIST_IDS) {
    if (!listIds.length) {
      return '';
    }

    const body = listIds
      .map((listId) => {
        const version = this.#entries.get(listId)?.version ?? 0;
        return `<RevListInfo><ListID>${listId}</ListID><Version>${version}</Version></RevListInfo>`;
      })
      .join('');

    return `<RevocationLists>${body}</RevocationLists>`;
  }

  snapshot() {
    return new Map(
      Array.from(this.#entries.entries()).map(([key, value]) => [key, { ...value }]),
    );
  }

  dumpRevInfoXml() {
    const revocations = Array.from(this.#entries.values()).map((entry) => entry.xml).join('');
    return `<RevInfo>${revocations}</RevInfo>`;
  }
}
