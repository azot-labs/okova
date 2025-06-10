## Encrypted Media Extensions API

It's a minimal example of using `inspectine` to get a license for Bitmovin's Art of Motion Demo.

This example similar to [example from EME](https://www.w3.org/TR/encrypted-media-2/#example-8).

There are some differences from the native EME implementation:

1. You must import your Widevine client to obtain a license.
2. In the `keyStatuses` field, Map's key is not just the key ID (like in EME), but pair with ID and value. For example, if key ID in HEX is `35e7eff366b24121a261832f3368146f` and content key itself is `f01471043a064e039a602346845b690f` then Map's key will be `35e7eff366b24121a261832f3368146f:f01471043a064e039a602346845b690f` (but as binary with `BufferSource` type) instead of just `35e7eff366b24121a261832f3368146f`.

## Quick start

Install dependencies:

```shell
npm install
```

Run script:

```shell
node index.js
```
