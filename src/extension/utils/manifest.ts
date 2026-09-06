// Match the original box bytes without decoding DRM-specific payloads.
export const splitPssh = (initData: string): string[] => {
  try {
    const binary = atob(initData.replace(/\s/g, ''));
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const view = new DataView(bytes.buffer);
    const boxes: string[] = [];
    let offset = 0;
    while (offset < bytes.length) {
      if (bytes.length - offset < 8 || view.getUint32(offset + 4) !== 0x70737368) return [];
      const size = view.getUint32(offset);
      let length = size || bytes.length - offset;
      let headerLength = 8;
      if (size === 1) {
        if (bytes.length - offset < 16) return [];
        const extendedSize = view.getBigUint64(offset + 8);
        if (extendedSize > BigInt(bytes.length - offset)) return [];
        length = Number(extendedSize);
        headerLength = 16;
      }
      if (length < headerLength + 24 || length > bytes.length - offset) return [];
      boxes.push(btoa(binary.slice(offset, offset + length)));
      offset += length;
    }
    return boxes;
  } catch {
    return [];
  }
};

export const findManifest = (initData: string | undefined) => {
  if (!initData || !(window.MPD_LIST instanceof Map)) return undefined;
  const exact = window.MPD_LIST.get(initData);
  if (exact) return exact;
  for (const pssh of splitPssh(initData)) {
    const url = window.MPD_LIST.get(pssh);
    if (url) return url;
  }
  return undefined;
};
