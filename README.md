# okova

[![npm version](https://img.shields.io/npm/v/okova?style=flat&color=black)](https://www.npmjs.com/package/okova)
![GitHub Downloads (all assets, latest release)](https://img.shields.io/github/downloads/azot-labs/okova/latest/total?style=flat&color=black)
[![npm downloads](https://img.shields.io/npm/dt/okova?style=flat&color=black)](https://www.npmjs.com/package/okova)

Okova (formerly known as Azot) is a set of tools (JavaScript library, command-line utility and browser extension) for diagnosing, researching, and pentesting [DRM](https://www.urbandictionary.com/define.php?term=DRM) systems like [Widevine](https://www.widevine.com/about).

> Okova is still in the early stages of development, so until version 1.0 is released, performance may be unstable and major changes may be made

## Features

- **Logging** details from [EME](https://w3c.github.io/encrypted-media/index.html) events in DevTools console
- **Network-independent interception** via browser extension, so it doesn't matter if license request has one-time tokens or a custom request/response body format
- **Remote instance** to manage sessions via REST API
- **Custom CDM client support**: create \*.wvd or \*.prd from raw client files and import them into browser extension
- **Runtime agnostic** core: works in Node.js, Bun, Deno, browsers and more
- **Encrypted Media Extensions API** compatibility via `requestMediaKeySystemAccess()` method

## Installation

> JavaScript library and command-line tool installation requires pre-installed JavaScript runtime (e.g. Node.js).

### JavaScript library

```bash
npm install okova
```

### Command-line tool

```bash
npm install -g okova
```

### Chrome extension

**Developer Mode** needs to be enabled in `chrome://extensions/` page

1. Download archive from [latest release](https://github.com/azot-labs/okova/releases/latest)
2. Go to `chrome://extensions/` page
3. Ensure Developer Mode enabled and then drag and drop downloaded zip file to this page

[Read Google's guide](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked)

### Firefox extension

1. Download archive from [latest release](https://github.com/azot-labs/okova/releases/latest)
2. Go to `about:debugging#/runtime/this-firefox` page
3. Click `Load Temporary Add-on` button and choose downloaded zip file

> Temporary add-on is not persistent and will be removed after browser restart

[Read Mozilla's guide](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension#installing)

## Usage

### Library

See [examples](https://github.com/azot-labs/okova/blob/main/examples).

### Command-line tool

See help: `okova --help`

## Disclaimer

1. This project does not condone piracy or any action against the terms of the DRM systems.
2. All efforts in this project have been the result of Reverse-Engineering, Publicly available research, and Trial & Error.
3. Do not use this program to decrypt or access any content for which you do not have the legal rights or explicit permission.
4. Unauthorized decryption or distribution of copyrighted materials is a violation of applicable laws and intellectual property rights.
5. This tool must not be used for any illegal activities, including but not limited to piracy, circumventing digital rights management (DRM), or unauthorized access to protected content.
6. The developers, contributors, and maintainers of this program are not responsible for any misuse or illegal activities performed using this software.
7. By using this program, you agree to comply with all applicable laws and regulations governing digital rights and copyright protections.
