# okova

[![npm version](https://img.shields.io/npm/v/okova?style=flat&color=black)](https://www.npmjs.com/package/okova)
![GitHub Downloads (all assets, latest release)](https://img.shields.io/github/downloads/azot-labs/okova/latest/total?style=flat&color=black)
[![npm downloads](https://img.shields.io/npm/dt/okova?style=flat&color=black)](https://www.npmjs.com/package/okova)

Okova is a toolkit (browser extension, command-line tool, and JavaScript library) for inspecting DRM-protected media and working with Widevine, PlayReady, and ClearKey.

> Okova is under active development. APIs and behavior may change before version 1.0.

## Features

- **Logging** details from [EME](https://w3c.github.io/encrypted-media/index.html) events in DevTools console
- **Network-independent interception** via browser extension, so it doesn't matter if license request has one-time tokens or a custom request/response body format
- **Remote instance** to manage sessions via REST API
- **Custom CDM client support**: bring your WVD, PRD, raw device files, or remote CDM JSON config and import them into browser extension
- **Runtime agnostic** core: works in Node.js, Bun, Deno, browsers and more
- **Encrypted Media Extensions API** compatibility via `requestMediaKeySystemAccess()` method

## Browser Extension

With EME interception enabled, the extension inspects ClearKey license responses and saves their key IDs and keys as hex. ClearKey capture works without an imported device or spoofing enabled.

Import a Widevine or PlayReady client in **Clients**. Okova automatically enables **Spoofing** and **Playback** when you add a client. Select the client you want to use, then reload the video page.

- **Spoofing** uses your active client to retrieve content keys.
- **Playback** lets supported videos keep playing while Okova retrieves their keys, including in browsers without built-in Widevine or PlayReady.

Playback depends on the website, browser, and client. Offline licenses and hardware-protected playback are not supported.

Experimental request interception detects streaming manifests in page fetch and XMLHttpRequest responses. Requests made inside workers are not inspected.

The toolbar badge shows a count capped at `99+`, followed by `W`, `P`, or `C` for Widevine, PlayReady, or ClearKey, such as `3W` or `99+W`:

- Gray: intercepted key IDs/statuses only, without content keys.
- Blue: content keys available from saved history for the domain.
- Green: content keys retrieved during this page visit, including keys retrieved again.
- Orange with `!`: retrieval failed. Hover over the icon for the error.

Reloading or navigating clears the current result; saved keys then appear blue. Hover over the badge for details. Green indicates key retrieval, not verified playback.

### Installing Chrome extension

1. Download archive from [latest release](https://github.com/azot-labs/okova/releases/latest)
2. Go to `chrome://extensions/` page
3. Ensure Developer Mode enabled and then drag and drop downloaded zip file to this page

[Read Google's guide](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked)

### Installing Firefox extension

1. Download archive from [latest release](https://github.com/azot-labs/okova/releases/latest)
2. Go to `about:debugging#/runtime/this-firefox` page
3. Click `Load Temporary Add-on` button and choose downloaded zip file

> Temporary add-on is not persistent and will be removed after browser restart

[Read Mozilla's guide](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension#installing)

## Command-line tool

### Installation

> Command-line tool installation requires a pre-installed JavaScript runtime, such as [Node.js](https://nodejs.org/en/download) 24.5.0 or later.

```bash
npm install -g okova
```

### Usage

> See help for all possible arguments and options: `okova --help`

Convert DRM client files `./drm-files/device_client_id_blob` and `./drm-files/device_private_key` to single WVD file:

```bash
okova client pack ./drm-files ./unknown_android-sdk-built-for-x86.wvd
```

Output example:

```text
Client packed: /Users/.../unknown_android-sdk-built-for-x86.wvd
```

Show DRM client info:

```bash
okova client info ./unknown_android-sdk-built-for-x86.wvd
```

Output example:

```text
application_name: org.chromium.webview_shell
company_name: unknown
model_name: Android SDK built for x86
architecture_name: x86
device_name: generic_x86
product_name: sdk_phone_x86
build_info: Android/sdk_phone_x86/generic_x86:10/RSR1.410600.002.B3/1792159:userdebug/dev-keys
widevine_cdm_version: 16.0.0
oem_crypto_security_patch_level: 0
oem_crypto_build_information: OEMCrypto Level3 Code 8162 May  9 2018 14:01:12
```

## JavaScript library

> Library installation requires a pre-installed JavaScript runtime, such as [Node.js](https://nodejs.org/en/download) 24.5.0 or later.

### Installation

```bash
npm install okova
```

### Usage

> See [examples](https://github.com/azot-labs/okova/blob/main/examples) for more.

Obtain a Widevine license for [Bitmovin's video](https://bitmovin.com/demos/drm/):

```ts
import { readFile } from 'node:fs/promises';
import { fromBase64, Widevine, WidevineDeviceCredentials } from 'okova';

async function main() {
  // Prepare init data (PSSH)
  const initData = fromBase64(
    'AAAAW3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAADsIARIQ62dqu8s0Xpa7z2FmMPGj2hoNd2lkZXZpbmVfdGVzdCIQZmtqM2xqYVNkZmFsa3IzaioCSEQyAA==',
  ).toBuffer();

  // Load device credentials
  const deviceCredentials = await WidevineDeviceCredentials.from({
    wvd: await readFile('client.wvd'),
  });

  const widevine = new Widevine({ deviceCredentials });
  const session = widevine.createSession();

  // Handle generated license challenge (or other session messages like individualization request)
  session.onmessage = async (event) => {
    const { message } = event.detail;
    // Send license request
    const licenseUrl = 'https://cwip-shaka-proxy.appspot.com/no_auth';
    const response = await fetch(licenseUrl, { body: message, method: 'POST' })
      .then((r) => r.arrayBuffer())
      .then((buffer) => new Uint8Array(buffer));
    // Update session with license response
    await session.update(response);
  };

  // Generate license challenge
  await session.generateRequest(initData);

  // Wait for keys
  const keys = await session.waitForKeys();
  for (const [keyId, key] of keys) {
    console.log(`${keyId}:${key}`);
  }

  await session.close(); // Close session to delete of any license(s) and key(s) that have not been explicitly stored.
  await session.remove(); // Destroy the license(s) and/or key(s) associated with the session whether they are in memory, persistent store or both.
}
```

`fetchDecryptionKeys` handles license exchanges with a 30-second default timeout.
Use `timeoutMs` to change the deadline and `signal` to cancel. It throws
`LicenseHttpError` for unsuccessful HTTP responses and `NoContentKeysError` when
an exchange finishes without content keys. License requests are not automatically retried.

### Saving and resuming native sessions

Widevine and PlayReady can serialize an open session with `pause()`. This takes
a snapshot; the original session stays open. Close it before restoring into the
same engine, since `resumeSession()` rejects an already-open session ID:

```ts
const state = session.pause();
await session.close();
const resumed = engine.resumeSession(state);
```

Resume with the same device credentials. Native Widevine sessions do not support
persistent-license storage through `load()`.

### PlayReady custom challenge data

Pass application-specific data as a string when creating the engine:

```ts
const engine = new PlayReady({ deviceCredentials, customData: applicationData });
const keys = await fetchDecryptionKeys({ cdm: engine, pssh, server: licenseUrl });
```

Pass the original text without XML escaping. Remote clients accept the same
`customData` option; REST clients include it in the `POST /sessions` body.

### Remote sessions

`POST /sessions` accepts `keySystem` and an optional `client`. Without a client,
the server selects the first authorized device for that DRM system. An explicit
client must match the requested system.

Wait for each session mutation to finish before starting another; overlapping
requests return HTTP 409. Requests for different sessions can run concurrently.

The server limits sessions and concurrent requests across all users and devices.
In `okova.config.json`, optional `sessionLimits` fields override these defaults:

```json
{
  "sessionLimits": {
    "maxSessions": 64,
    "maxConcurrentRequests": 64,
    "idleTimeoutMs": 300000,
    "keyWaitTimeoutMs": 30000
  }
}
```

Limits must be positive integers. Exceeding session or request limits returns
HTTP 503. Idle sessions expire and must be recreated. Waiting for keys beyond
`keyWaitTimeoutMs` returns HTTP 504.

### Inspect, edit, and convert PSSH boxes

```ts
import {
  PSSH_SYSTEM_IDS,
  createPsshBox,
  parsePsshBoxes,
  getPsshKeyIds,
  setPsshKeyIds,
  convertPsshBox,
  psshBoxToBase64,
} from 'okova';

const widevine = setPsshKeyIds(createPsshBox({ systemId: PSSH_SYSTEM_IDS.widevine }), [
  '00112233-4455-6677-8899-aabbccddeeff',
]);
const playready = convertPsshBox(widevine, 'playready', {
  laUrl: 'https://example.com/license',
});
const [box] = parsePsshBoxes(psshBoxToBase64(playready));
console.log(box.systemId, box.version, getPsshKeyIds(box));
const restored = convertPsshBox(box, 'widevine');
```

`parsePsshBoxes` accepts bytes or base64 containing full PSSH boxes.
`serializePsshBox` returns bytes; `psshBoxToBase64` returns base64.
IDs accept 16-byte arrays, UUID strings, or 32 hex digits.

Use `getPsshKeyIds` to inspect KIDs and `setPsshKeyIds` to replace Widevine KIDs.
PlayReady KID replacement is not supported. Editing and conversion return new
boxes without changing their inputs.

Conversion preserves KIDs and encryption signaling but discards other metadata,
including license URLs and checksums. Supply `laUrl` when converting to PlayReady
if needed. Converted headers may not meet every license server's requirements.

## Disclaimer

1. This project does not condone piracy or any action against the terms of the DRM systems.
2. All efforts in this project have been the result of Reverse-Engineering, Publicly available research, and Trial & Error.
3. Do not use this program to decrypt or access any content for which you do not have the legal rights or explicit permission.
4. Unauthorized decryption or distribution of copyrighted materials is a violation of applicable laws and intellectual property rights.
5. This tool must not be used for any illegal activities, including but not limited to piracy, circumventing digital rights management (DRM), or unauthorized access to protected content.
6. The developers, contributors, and maintainers of this program are not responsible for any misuse or illegal activities performed using this software.
7. By using this program, you agree to comply with all applicable laws and regulations governing digital rights and copyright protections.
