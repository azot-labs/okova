# PlayReady compatibility investigation

The fixtures in `test/fixtures/playready/` are synthetic. `generate.py` builds certificate bytes with Python `struct`, canonicalizes XML with `lxml`, and signs with `cryptography` using ECDSA P-256/SHA-256. It verifies each new signature before writing it. No Okova code, client credentials, Microsoft signing keys, or captured licenses are used. The checked-in files contain public keys only.

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

## XML canonicalization

`PlayReadySession.#verifySignedLicenseResponse` now canonicalizes the attached `LicenseResponse` and `SignedInfo` subtrees before hashing and signature verification. Previously, it used `XMLSerializer.serializeToString`, and the tests generated signatures through that same serializer. Those tests established internal consistency but missed C14N interoperability defects.

`xml-signatures.json` stores the input XML, independently canonicalized LicenseResponse and SignedInfo bytes, digest, and signature. The tests verify the stored bytes with Okova's real SHA-256 and ECDSA implementations before exercising `parseLicense`. Only certificate-chain resolution and trust are substituted with the synthetic public key. These tests do not establish Microsoft certificate-chain trust or production server compatibility.

The fixtures use inclusive [Canonical XML 1.0 without comments](https://www.w3.org/TR/2001/REC-xml-c14n-20010315). That algorithm expands empty elements, sorts namespaces and attributes, includes in-scope namespaces, converts CDATA to text, and omits comments. Each case isolates one difference:

| Case                        | Result   | Canonicalization behavior                              |
| --------------------------- | -------- | ------------------------------------------------------ |
| Canonical baseline          | Accepted | Bytes already match C14N                               |
| Empty LicenseResponse child | Accepted | Expands self-closing elements                          |
| Attribute order             | Accepted | Sorts attributes by namespace URI and local name       |
| Inherited default namespace | Accepted | Emits namespace declarations before attributes         |
| Unused inherited namespace  | Accepted | Includes all in-scope namespaces                       |
| CDATA                       | Accepted | Emits escaped text                                     |
| Comment                     | Accepted | Omits comments                                         |
| Empty SignedInfo method     | Accepted | Canonicalizes SignedInfo before signature verification |

All eight signatures are cryptographically valid over their recorded C14N bytes and now pass `parseLicense`. Each fixture also checks rejection of altered response content and signature bytes. `test/playready-xml-c14n.test.ts` covers namespace resets and rebinding, inherited `xml:*` attributes, Unicode ordering, character escaping, line endings, processing instructions, and preservation of the input DOM.

The generator materializes inherited namespaces by serializing and reparsing each subtree before C14N. With the installed libxml2 2.14.6, directly canonicalizing a nested subtree produced spurious `xmlns=""` declarations on deeper descendants. These signed fixtures have no inherited `xml:*` attributes; the separate canonicalization tests cover that rule with expected bytes from the specification.

The reference implementations do not resolve the standards question. `pyplayready/license/license.py` uses ElementTree serialization with `short_empty_elements=False`; `PlayreadyProxy2/jsplayready/cdm.js` constructs challenge XML strings. Neither provides an independent C14N verifier.

### Supported signature profile

- `CanonicalizationMethod` must select inclusive C14N 1.0 without comments. Exclusive C14N, C14N 1.1, and variants with comments are rejected.
- One `Reference` must identify the exact consumed `LicenseResponse` by its nonempty, document-unique `Id`. External, empty, mismatched, or ambiguous references are rejected.
- An absent `Transforms` uses the XMLDSig default node-set conversion, C14N 1.0. One explicit C14N 1.0 transform is also supported. Other transforms, parameters, or transform sequences are rejected.
- Digest verification supports SHA-256 through the PlayReady protocol URI or `http://www.w3.org/2001/04/xmlenc#sha256`. Signature verification supports ECDSA-SHA256 through the PlayReady protocol URI or `http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha256`.
- Signature fields must be direct children in the XMLDSig namespace. A present but incomplete signature is rejected. Responses with no signature retain the existing unsigned-response behavior.
- Documents with a DTD are rejected because the parser does not provide the validating attribute and entity processing C14N requires. Relative namespace URIs are also rejected.

Certificate-chain trust and XMR integrity verification remain in place. These offline fixtures establish canonicalization interoperability, not production server compatibility. Outgoing challenge generation is outside this change.
