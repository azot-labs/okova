# Credential naming migration

Credential bundles now use `Credentials` terminology. Runtime engines remain
`Widevine`, `PlayReady`, and `Remote`.

| Previous name                                                   | New name                                                                                   |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `WidevineDeviceCredentials`                                     | `WidevineClientCredentials`                                                                |
| `PlayReadyDeviceCredentials`                                    | `PlayReadyClientCredentials`                                                               |
| Engine option/property `deviceCredentials`                      | `clientCredentials`                                                                        |
| `Widevine.DeviceCredentials`, `PlayReady.DeviceCredentials`     | `Widevine.ClientCredentials`, `PlayReady.ClientCredentials`                                |
| `RemoteConfig`                                                  | `RemoteCredentialsData` for serialized data; `RemoteCredentials` for validated credentials |
| `parseRemoteConfig(value)`                                      | `parseRemoteCredentialsData(value)` or `await RemoteCredentials.from(value)`               |
| `okova client pack/info/unpack`                                 | `okova credentials pack/info/unpack`                                                       |
| `--client`                                                      | `--credentials`; `-c` still works                                                          |
| Server config `clients` and `users[secret].clients`             | `credentials` and `users[secret].credentials`                                              |
| Okova remote option and session request/response field `client` | `credentials`                                                                              |
| Extension page **Clients**                                      | **Credentials**                                                                            |

Update applications and their Okova servers together when changing the REST
selector field. The JavaScript names and CLI options are replaced without deprecated
aliases. The `credentials` command also accepts `client` and `creds`.
WVD/PRD formats, raw filenames, Widevine protobuf fields, and third-party
remote API device selectors remain unchanged.

The extension migrates existing imported credentials and the active selection
on first access. Legacy storage is retained as a backup. Previously exported
remote JSON files with a `client` selector are accepted by `RemoteCredentials.from`
and normalized to `credentials` on export. Pending extension sessions also accept
the previous stored credential field.

Test configuration uses `VITEST_WVD_PATH` for both integration and browser tests,
and `VITEST_REMOTE_CREDENTIALS` for the remote selector.

## Remote credentials and runtime

`Credentials` is the union of `WidevineClientCredentials`,
`PlayReadyClientCredentials`, and `RemoteCredentials`. A remote credential bundle
validates, labels, and serializes connection data. It does not open sessions or
send requests. Construct a `Remote` engine to interact with the server:

```ts
import { Remote, RemoteCredentials } from 'okova';

const credentials = await RemoteCredentials.from({
  baseUrl: 'https://cdm.example',
  keySystem: 'com.widevine.alpha',
  credentials: 'example.wvd',
  secret: 'replace-with-your-secret',
});
const engine = new Remote(credentials.config);
const session = await engine.createSession();
```
