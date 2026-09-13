# Remote Session

It's a minimal example of using `okova` to connect to remote Okova API instance in your JavaSript code. See [examples/instance](https://github.com/azot-labs/okova/tree/main/examples/instance) to learn how to run your own instance.

## Quick start

Build the library from the repository root, then install the example dependencies.
The example uses this checkout of `okova` so its certificate transport matches the server:

```shell
pnpm install
pnpm run build:lib
cd examples/remote-session
pnpm install
```

Go to `index.js` and set your API base URL, secret and credentials name. The example fetches a service certificate from `LICENSE_URL`, sets it on `cdm`, then creates a session and requests keys.

Run script:

```shell
node index.js
```

## Privacy mode

The server defaults to `forcePrivacyMode: false`. Widevine requests without a
service certificate send an unencrypted client ID. To encrypt it, call
`await cdm.setServerCertificate(certificateBytes)` before generating a request;
encryption applies automatically when a valid certificate is supplied.
`Remote` validates and stores the certificate, then sends it as base64 in the
`serverCertificate` field of each `POST /sessions/:id/generate-request` request.
This also applies to sessions created before the certificate was set. The server
validates the certificate before generating the challenge and acknowledges it with
`serverCertificateAccepted: true`. Remote rejects responses without this acknowledgement
when a certificate was supplied, including responses from older servers. The server returns HTTP 403
if `forcePrivacyMode: true` is explicitly configured and a Widevine request has
no certificate. The [instance example](../instance/okova.config.json) explicitly
enables this requirement.

PlayReady does not support this certificate option. `forcePrivacyMode` applies
only to Widevine, so PlayReady works with either setting.

For the CLI, `okova license --encrypt` requests a Widevine service certificate
from the license URL before generating the challenge. A failed certificate
request or invalid certificate stops the command. PlayReady rejects `--encrypt`.
