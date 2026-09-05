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

Session requests can select a configured client by its exact path, filename, or filename without
the extension. For `clients/client.wvd`, both `client.wvd` and `client` work. Partial names and
ambiguous names are rejected. Omit `client` to select the first configured device. User allowlists
use the same identifiers; use an exact path when filenames or extensionless names collide.
