# okova

[![npm version](https://img.shields.io/npm/v/okova?style=flat&color=black)](https://www.npmjs.com/package/okova)
![GitHub Downloads (all assets, latest release)](https://img.shields.io/github/downloads/azot-labs/okova/latest/total?style=flat&color=black)
[![npm downloads](https://img.shields.io/npm/dt/okova?style=flat&color=black)](https://www.npmjs.com/package/okova)

Okova is a set of tools (JavaScript library, command-line utility and browser extension) for diagnosing, researching, and pentesting [DRM](https://www.urbandictionary.com/define.php?term=DRM) systems used in playable media content.

> Okova is still in the early stages of development, so until version 1.0 is released, performance may be unstable and major changes may be made

## Features

- **Logging** details from [EME](https://w3c.github.io/encrypted-media/index.html) events in DevTools console
- **Network-independent interception** via browser extension, so it doesn't matter if license request has one-time tokens or a custom request/response body format
- **Remote instance** to manage sessions via REST API
- **Custom CDM client support**: create \*.wvd or \*.prd from raw client files and import them into browser extension
- **Runtime agnostic** core: works in Node.js, Bun, Deno, browsers and more
- **Encrypted Media Extensions API** compatibility via `requestMediaKeySystemAccess()` method

## Browser Extension

### Installing Chrome extension

**Developer Mode** needs to be enabled in `chrome://extensions/` page

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

> Command-line tool installation requires pre-installed JavaScript runtime (e.g. [Node.js](https://nodejs.org/en/download)).

```bash
npm install -g okova
```

### Usage

> See help for all possible arguments and options: `okova --help`

Convert DRM client files `./drm-files/device_client_id_blob` and `./drm-files/device_private_key` to single WVD file:

```bash
okova client pack ./drm-files ./unknown_android-sdk-built-for-x86.wvd
```

```text
Client packed: /Users/.../unknown_android-sdk-built-for-x86.wvd
```

Show DRM client info:

```bash
okova client info ./unknown_android-sdk-built-for-x86.wvd
```

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

> Library installation requires pre-installed JavaScript runtime (e.g. [Node.js](https://nodejs.org/en/download)).

### Installation

```bash
npm install okova
```

### Usage

> See [examples](https://github.com/azot-labs/okova/blob/main/examples) for more.

Obtain a Widevine license for [Bitmovin's video](https://bitmovin.com/demos/drm/):

```ts
import { readFile } from 'node:fs/promises';
import { fromBase64, Widevine, requestMediaKeySystemAccess } from 'okova';

async function main() {
  // Prepare init data
  const initDataType = 'cenc'; // Encryption scheme
  const initData = fromBase64(
    'AAAAW3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAADsIARIQ62dqu8s0Xpa7z2FmMPGj2hoNd2lkZXZpbmVfdGVzdCIQZmtqM2xqYVNkZmFsa3IzaioCSEQyAA==',
  ).toBuffer(); // PSSH

  // Load device/client
  const client = await Widevine.Client.from({ wvd: await readFile('client.wvd') });

  const cdm = new Widevine({ client });

  // Create session
  const keySystemAccess = requestMediaKeySystemAccess(cdm.keySystem, []);
  const mediaKeys = await keySystemAccess.createMediaKeys({ cdm });
  const session = mediaKeys.createSession();

  // Get license challenge
  session.generateRequest(initDataType, initData);
  const challenge = await session.waitForLicenseRequest();

  // Send license request
  const licenseUrl = 'https://cwip-shaka-proxy.appspot.com/no_auth';
  const response = await fetch(licenseUrl, { body: challenge, method: 'POST' })
    .then((r) => r.arrayBuffer())
    .then((buffer) => new Uint8Array(buffer));

  // Update session with license response
  await session.update(response);

  // Print keys
  const keys = await session.waitForKeyStatusesChange();
  for (const key of keys) {
    console.log(`${key.keyId}:${key.key}`);
  }

  await session.close(); // Close session to delete of any license(s) and key(s) that have not been explicitly stored.
  await session.remove(); // Destroy the license(s) and/or key(s) associated with the session whether they are in memory, persistent store or both.
}
```

## Disclaimer

1. This project does not condone piracy or any action against the terms of the DRM systems.
2. All efforts in this project have been the result of Reverse-Engineering, Publicly available research, and Trial & Error.
3. Do not use this program to decrypt or access any content for which you do not have the legal rights or explicit permission.
4. Unauthorized decryption or distribution of copyrighted materials is a violation of applicable laws and intellectual property rights.
5. This tool must not be used for any illegal activities, including but not limited to piracy, circumventing digital rights management (DRM), or unauthorized access to protected content.
6. The developers, contributors, and maintainers of this program are not responsible for any misuse or illegal activities performed using this software.
7. By using this program, you agree to comply with all applicable laws and regulations governing digital rights and copyright protections.
