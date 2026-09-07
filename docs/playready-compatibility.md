# PlayReady compatibility investigation

The fixtures in `test/fixtures/playready/` are synthetic. `generate.py` builds certificate bytes with Python `struct`, canonicalizes XML with `lxml`, and signs with `cryptography` using ECDSA P-256/SHA-256. It verifies each new signature before writing it. No Okova code, device credentials, Microsoft signing keys, or captured licenses are used. The checked-in files contain public keys only.

Regenerate with Python and `lxml==6.1.3`, `cryptography==50.0.1` installed:

```sh
python test/fixtures/playready/generate.py
pnpm exec oxfmt test/fixtures/playready/*.json
pnpm exec vitest run test/playready-compatibility.test.ts
```

Regeneration creates new keys and signatures. Normal tests read the committed fixtures and do not require Python.

## Tagged ExtData

The layout follows `pyplayready/system/bcert.py` at commit `88a4fb2b548395c07676ab4564dd7cd8504f0ba0`. Its `ExtDataContainer` contains a tagged HWID object followed by a tagged signature object. Both have an 8-byte header: big-endian flags, tag, and total object length. The HWID body contains a 32-bit byte count, the HWID, and padding to a 4-byte boundary. The signature body contains a 16-bit signature type, a 16-bit signature size, and signature bytes.

The ExtData signature covers the complete HWID object, including its header and padding. The old record-count/data-record representation omitted both nested headers and interpreted the HWID length as a record count.

`extdata.json` covers HWID lengths 0 through 4, including all padding lengths. Each size has a valid certificate and one with an altered ExtData signature. The outer certificate is signed after that alteration, so rejecting it proves that ExtData verification ran. Tests also require byte-for-byte certificate roundtrips and compare the reconstructed HWID signature payload to the independently built bytes. The PRD integration test covers the corrected layout with a locally provisioned certificate.

## XML canonicalization investigation

`PlayReadySession.#verifySignedLicenseResponse` hashes and verifies `XMLSerializer.serializeToString` output. The previous tests generated signatures through that same serializer. They could establish internal consistency but could not establish C14N interoperability.

`xml-signatures.json` stores the input XML, independently canonicalized LicenseResponse and SignedInfo bytes, digest, and signature. The tests verify the stored bytes with Okova's real SHA-256 and ECDSA implementations before exercising `parseLicense`. Only certificate-chain resolution and trust are substituted with the synthetic public key. These tests do not establish Microsoft certificate-chain trust or production server compatibility.

The fixtures use inclusive [Canonical XML 1.0 without comments](https://www.w3.org/TR/2001/REC-xml-c14n-20010315). That algorithm expands empty elements, sorts namespaces and attributes, includes in-scope namespaces, converts CDATA to text, and omits comments. Each case isolates one difference:

| Case                        | Current result     | Cause                                                      |
| --------------------------- | ------------------ | ---------------------------------------------------------- |
| Canonical baseline          | Accepted           | Serialized bytes already match C14N                        |
| Empty LicenseResponse child | Digest mismatch    | Serializer emits a self-closing element                    |
| Attribute order             | Digest mismatch    | Serializer preserves input order                           |
| Inherited default namespace | Digest mismatch    | Serializer appends the namespace after `Id`                |
| Unused inherited namespace  | Digest mismatch    | Inclusive C14N includes the namespace; serializer omits it |
| CDATA                       | Digest mismatch    | Serializer preserves the CDATA section                     |
| Comment                     | Digest mismatch    | Serializer retains the comment                             |
| Empty SignedInfo method     | Signature mismatch | Response digest passes; serializer self-closes the method  |

Whitespace inside the baseline method elements prevents xmldom from self-closing them. The SignedInfo case removes that whitespace from one method before canonicalization and signing. All eight signatures are cryptographically valid over their recorded C14N bytes. The rejection assertions document the current compatibility limits, not desired long-term behavior.

The generator materializes inherited namespaces by serializing and reparsing each subtree before C14N. With the installed libxml2 2.14.6, directly canonicalizing a nested subtree produced spurious `xmlns=""` declarations on deeper descendants. These fixtures have no inherited `xml:*` attributes; they do not test that separate C14N rule.

The reference implementations do not resolve the standards question. `pyplayready/license/license.py` uses ElementTree serialization with `short_empty_elements=False`; `PlayreadyProxy2/jsplayready/cdm.js` constructs challenge XML strings. Neither provides an independent C14N verifier.

The investigation confirms a response-verification compatibility gap. A follow-up implementation should select canonicalization from an explicitly supported algorithm, bind the Reference URI to the exact response being consumed, and apply the declared digest transforms. It should turn the documented rejection cases into acceptance tests while preserving tamper rejection. Blindly changing serialization or trying multiple byte representations would leave those protocol decisions unresolved. This change fixes ExtData and records the XML evidence; it does not add C14N support or establish canonicalization behavior for outgoing challenges.
