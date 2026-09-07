# Instance

It's a minimal example of using `okova` to run your own Okova API instance. See [examples/connect](https://github.com/azot-labs/okova/tree/main/examples/connect) to learn how to connect to remote instance.

## Quick start

Setup your config in `okova.config.json` file.

Install dependencies:

```shell
pnpm install
```

Run server:

```shell
pnpm start
```

`--host` and `--port` override the corresponding config values.

Session requests can select configured credentials by their exact path, filename, or filename without
the extension. For `credentials/credentials.wvd`, both `credentials.wvd` and `credentials` work. Partial names and
ambiguous names are rejected. Omit `credentials` to select the first configured credentials. User allowlists
use the same identifiers; use an exact path when filenames or extensionless names collide.
