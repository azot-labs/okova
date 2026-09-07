import type { WidevineClientCredentials } from './widevine/client-credentials';
import type { PlayReadyClientCredentials } from './playready/client-credentials';
import type { RemoteCredentials } from './remote/credentials';

export type Credentials =
  | WidevineClientCredentials
  | PlayReadyClientCredentials
  | RemoteCredentials;
