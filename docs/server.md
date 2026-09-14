# Server configuration

`okova serve` reads `okova.config.json` from the working directory, or the file
passed to `--config`. Relative credential paths resolve from the working
directory, including when the config file is elsewhere. Unknown config fields
and invalid values cause startup to fail.

For two devices with separate access grants:

```json
{
  "credentials": ["client.wvd", "client.prd"],
  "users": {
    "replace-with-widevine-secret": {
      "name": "Widevine client",
      "credentials": ["client.wvd"]
    },
    "replace-with-playready-secret": {
      "name": "PlayReady client",
      "credentials": ["client.prd"]
    }
  }
}
```

## Authorization and credential selection

Anonymous access is disabled by default. Configure `users` or pass `--secret`;
otherwise startup fails unless `public` is true or `--public` is supplied.
Clients send their secret in `x-secret-key`. Each user's `credentials` list
grants access only to those configured devices; an empty list grants none.
`name` is a display label, not a login identifier.

`--credentials <file>` moves that file to the front of the configured list.
`--secret <value>` creates or reuses a user. If that user's grants are empty,
it grants access to the `--credentials` file, or the first configured file.
Existing nonempty grants stay unchanged.

With `public: true`, requests without a secret can use every configured
credential. A supplied secret still requires a valid user and obeys that user's
grants; an invalid secret returns 403. Sessions belong to the secret that created
them. Anonymous sessions share one owner.

Both grants and the `POST /sessions` body's `credentials` field accept a
configured path, absolute path, filename, or filename without its extension.
An identifier must resolve to exactly one configured file.

- With no configured credentials, startup sorts discovered `.wvd` and `.prd`
  filenames and configures only the first, warning if there are several. Having
  both formats in the directory does not enable both DRM systems.
- With `credentials` in the request, the server selects that device, subject to
  authorization and any supplied `keySystem`.
- With only `keySystem`, the server selects the first loadable, authorized device
  matching that system in configured order.
- With neither field, the server tries the first configured file. If the caller
  lacks access, it returns 403 without falling back to another authorized device.

## Configuration reference

| Field                                 | Default       | Behavior                                                                                                                                                                                                                                                        |
| ------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `host`                                | `"127.0.0.1"` | Bind address. `--host` overrides it.                                                                                                                                                                                                                            |
| `port`                                | `4000`        | Listen port, 0–65535. `--port` overrides it.                                                                                                                                                                                                                    |
| `credentials`                         | `[]`          | Ordered WVD/PRD paths; empty enables startup discovery.                                                                                                                                                                                                         |
| `users`                               | `{}`          | Secret-to-user map with required `name` and `credentials` fields.                                                                                                                                                                                               |
| `public`                              | `false`       | Allow anonymous access to all configured credentials.                                                                                                                                                                                                           |
| `allowedHosts`                        | `[]`          | Allowed lowercase hostnames or IP addresses, without ports; bracket IPv6 addresses. Empty allows the bind hostname, or all three loopback names for a loopback bind: `127.0.0.1`, `[::1]`, `localhost`. Binding to `0.0.0.0` or `::` requires an explicit list. |
| `allowedOrigins`                      | omitted       | Omitted allows any origin with CORS `*`. A list allows same-origin requests plus listed HTTP(S) origins, without trailing slashes. `[]` allows only same-origin browser requests. Requests without `Origin` remain allowed.                                     |
| `maxRequestBodyBytes`                 | `1048576`     | JSON body limit, including chunked bodies; positive integer up to 67108864. Oversized bodies return 413.                                                                                                                                                        |
| `forcePrivacyMode`                    | `false`       | Require a valid server certificate before generating a Widevine challenge; otherwise return 403. Does not apply to PlayReady.                                                                                                                                   |
| `sessionLimits.maxSessions`           | `64`          | Server-wide session capacity, including pending creation.                                                                                                                                                                                                       |
| `sessionLimits.maxConcurrentRequests` | `64`          | Server-wide active session API request limit. Capacity limits return 503.                                                                                                                                                                                       |
| `sessionLimits.idleTimeoutMs`         | `300000`      | Close sessions after inactivity; session access resets the timer.                                                                                                                                                                                               |
| `sessionLimits.keyWaitTimeoutMs`      | `30000`       | Maximum wait for keys before returning 504.                                                                                                                                                                                                                     |

Session limits must be positive integers; timeouts cannot exceed 2147483647 ms.
Host and origin checks do not replace secret-based authorization.
For forced Widevine privacy mode, send a base64 `serverCertificate` in
`POST /sessions/:id/generate-request`; the server does not fetch it automatically.
