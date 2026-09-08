# Session diagnostics

Open the extension dashboard and expand a capture under **Sessions** to inspect its progress. Each capture has an ID, a DRM session ID when available, page and frame origins, frame/document IDs, and the name, DRM type, and fingerprint of the credentials actually loaded for that session. The saved name reflects the capture time. Older captures without a saved name show "Name unavailable for this capture". The same shortened fingerprint appears in Credentials Settings, so you can match a capture to an imported credential. Selecting different credentials later does not change that provenance.

Frame 0 appears as "Source: Main page" without repeating the page origin. Iframe captures show the frame number and its origin separately.

The panel shows local clock times with milliseconds, with the capture date and timezone above the timeline. Successful stages have no status suffix; pending, failed, and interrupted stages retain a status. Successful request-setup and session-storage entries appear only in the copied trace.

The timeline records EME observation and stage start/completion timestamps, including challenge generation, certificate handling, license processing, key extraction, history storage, and cleanup. Outcomes distinguish observation without credential-backed processing, pending work, returned content keys, no content keys, failures, request timeouts, and closed sessions. A successful license-processing stage does not by itself mean content keys were returned.

Each row shows its session ID, a short DRM name, and its key count or current outcome. Captures without a session ID show their capture ID instead. Expand the row to see its metadata and activity timeline.

The copy and download buttons appear on hover or keyboard focus. **Copy diagnostic trace** copies JSON for that row and reports clipboard success or failure. **Download diagnostic trace** saves the same JSON as `okova-trace-<capture-id>.json`. Both actions work without expanding the row. The trace contains origins, IDs, credential names and fingerprints, key counts, and stage timings. It excludes URL paths and query strings, bridge tokens, credentials, remote configuration, initialization data, challenges, licenses, content keys, and arbitrary error messages. The existing failure alert still shows the detailed error locally. Local credential fingerprints use SHA-256. Remote fingerprints use HMAC-SHA-256 with a random key stored only in this extension installation, so sharing a trace does not expose an offline secret verifier. Changing the remote configuration changes its fingerprint; another installation produces a different fingerprint. Legacy unkeyed remote fingerprints are omitted from display and exports.

Diagnostics stay separate from content-key exports. Captured history records carry an optional `captureId` for correlation; older records remain supported.

The extension retains the latest 20 captures per tab and the latest 100 stage entries per capture in extension session storage. Traces survive popup and background-worker restarts and navigation within the tab. Pending captures become closed on navigation or idle expiry. Closing the tab deletes its traces, including private-tab traces. Browser restarts clear all traces. The same retention limits apply to private and ordinary tabs.

These diagnostics describe extension EME captures. They do not add a CLI/server trace or inspect non-content operational keys.
