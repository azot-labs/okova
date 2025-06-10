# inspectine

[![npm version](https://img.shields.io/npm/v/inspectine?style=flat&color=black)](https://www.npmjs.com/package/inspectine)
![GitHub Downloads (all assets, latest release)](https://img.shields.io/github/downloads/azot-labs/inspectine/latest/total?style=flat&color=black)
[![npm downloads](https://img.shields.io/npm/dt/inspectine?style=flat&color=black)](https://www.npmjs.com/package/inspectine)

Inspectine is a set of tools (JavaScript library, command-line utility and browser extension) for diagnosing, researching, and pentesting [DRM](https://www.urbandictionary.com/define.php?term=DRM) systems like [Widevine](https://www.widevine.com/about).

> Inspectine (formerly known as Azot) is still in the early stages of development, so until version 1.0 is released, performance may be unstable and major changes may be made

## Features

- **Minimal** dependencies
- **Runtime agnostic** core: works in Node.js, Bun, Deno, browsers and more
- **Logging** details from EME events in Developer Tools console of current page
- **Encrypted Media Extensions API** compatibility via `requestMediaKeySystemAccess()` method
- **Converting clients** between formats via CLI
- **Manifest V3** compliant browser extension
- **Custom client support**: WVD v2, device_client_id_blob + device_private_key, client_id.bin + private_key.pem
- **Network-independent interception**, so it doesn't matter if the request has one-time tokens or a custom request/response body format.
- **Remote instance** to control sessions via REST API

## Installation

> JavaScript library and command-line tool installation requires pre-installed JavaScript runtime (e.g. Node.js).

### JavaScript library

```bash
npm install inspectine
```

### Command-line tool

```bash
npm install -g inspectine
```

### Chrome extension

**Developer Mode** needs to be enabled in `chrome://extensions/` page

1. Download archive from [latest release](https://github.com/azot-labs/inspectine/releases/latest)
2. Go to `chrome://extensions/` page
3. Ensure Developer Mode enabled and then drag and drop downloaded zip file to this page

[Read Google's guide](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked)

### Firefox extension

1. Download archive from [latest release](https://github.com/azot-labs/inspectine/releases/latest)
2. Go to `about:debugging#/runtime/this-firefox` page
3. Click `Load Temporary Add-on` button and choose downloaded zip file

> Temporary add-on is not persistent and will be removed after browser restart

[Read Mozilla's guide](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension#installing)

## Usage

### Library

See [examples](https://github.com/azot-labs/inspectine/blob/main/examples).

### Command-line tool

See help: `inspectine --help`
