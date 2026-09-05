# Remote Session

It's a minimal example of using `okova` to connect to remote Okova API instance in your JavaSript code. See [examples/instance](https://github.com/azot-labs/okova/tree/main/examples/instance) to learn how to run your own instance.

## Quick start

Install dependencies:

```shell
pnpm install
```

Go to `index.js` and set your API base URL, secret and client name. Then you can create a session, generate a license request and get keys.

Run script:

```shell
node index.js
```

## Privacy mode

The server defaults to `forcePrivacyMode: true`. For Widevine, call
`await cdm.setServerCertificate(certificateBytes)` before generating a request.
`Remote` validates and stores the certificate, then sends it as base64 in the
`serverCertificate` field of each `POST /sessions/:id/generate-request` request.
This also applies to sessions created before the certificate was set. The server
validates the certificate before generating the challenge and acknowledges it with
`serverCertificateAccepted: true`. Remote rejects responses without this acknowledgement
when a certificate was supplied, including responses from older servers. The server returns HTTP 403
if forced privacy is enabled without a certificate.

PlayReady does not support this certificate option or forced privacy mode. Set
`forcePrivacyMode: false` in the server configuration to use PlayReady.

For the CLI, `okova license --encrypt` requests a Widevine service certificate
from the license URL before generating the challenge. A failed certificate
request or invalid certificate stops the command. PlayReady rejects `--encrypt`.
