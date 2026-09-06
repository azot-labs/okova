import { RemoteClient } from '@/utils/remote-client';
import { usesPywidevineFallback } from '@okova/lib/remote/pywidevine';
import { WidevineDeviceCredentials } from '@okova/lib/widevine/device-credentials';
import { PlayReadyDeviceCredentials } from '@okova/lib/playready/device-credentials';
import type { Client } from '@/utils/storage';

// A selection is one packed device/configuration or one complete raw credential pair.
export const parseClientFiles = async (
  files: File[],
): Promise<{ client: Client; warning?: string }> => {
  const read = async (file: File) => new Uint8Array(await file.arrayBuffer());
  const file = files[0];
  if (files.length === 1 && file) {
    const name = file.name.toLowerCase();
    if (name.endsWith('.json')) {
      if (file.size > 64 * 1024) throw new Error('Remote configuration must be smaller than 64 KB');
      const config: unknown = JSON.parse(await file.text());
      const client = await RemoteClient.from(config);
      const warning = usesPywidevineFallback(config)
        ? 'DRM system not specified. Imported as Widevine. Add "security_level" to the JSON for better detection.'
        : undefined;
      return { client, warning };
    }
    if (name.endsWith('.wvd')) {
      return { client: await WidevineDeviceCredentials.from({ wvd: await read(file) }) };
    }
    if (name.endsWith('.prd')) {
      return { client: await PlayReadyDeviceCredentials.from({ prd: await read(file) }) };
    }
  }
  if (files.length === 2) {
    const find = (...names: string[]) =>
      files.find((file) => names.includes(file.name.toLowerCase()));
    const id = find('device_client_id_blob');
    const key = find('device_private_key');
    if (id && key) {
      return {
        client: await WidevineDeviceCredentials.from({ id: await read(id), key: await read(key) }),
      };
    }
    const groupCertificate = find('bgroupcert.dat', 'bgroupcert');
    const groupKey = find('zgpriv.dat', 'zgpriv');
    if (groupCertificate && groupKey) {
      return {
        client: await PlayReadyDeviceCredentials.from({
          groupKey: await read(groupKey),
          groupCertificate: await read(groupCertificate),
        }),
      };
    }
  }
  throw new Error(
    'Select one WVD, PRD, or remote JSON file, or a complete raw pair: device_client_id_blob + device_private_key, or bgroupcert.dat + zgpriv.dat',
  );
};
