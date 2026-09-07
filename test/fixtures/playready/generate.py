"""Generate synthetic fixtures, without Okova or client credentials.

Requires lxml==6.1.3 and cryptography==50.0.1. Run this file to regenerate.
Keys are generated afresh; signatures and public keys change on regeneration.
"""
import base64
import hashlib
import json
import struct
from pathlib import Path

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec, utils
from lxml import etree

OUT = Path(__file__).parent


def public_bytes(key):
    return key.public_key().public_bytes(
        serialization.Encoding.X962, serialization.PublicFormat.UncompressedPoint
    )[1:]


def sign(key, payload):
    der = key.sign(payload, ec.ECDSA(hashes.SHA256()))
    key.public_key().verify(der, payload, ec.ECDSA(hashes.SHA256()))
    r, s = utils.decode_dss_signature(der)
    return r.to_bytes(32, 'big') + s.to_bytes(32, 'big')


def b64(value):
    return base64.b64encode(value).decode()


def obj(tag, data, flags=1):
    return struct.pack('>HHI', flags, tag, 8 + len(data)) + data


def canonicalize(element):
    # Materialize inherited namespace declarations before canonicalizing the subtree.
    # This avoids libxml2 2.14.6's spurious xmlns="" on deeply nested subset nodes.
    standalone = etree.fromstring(etree.tostring(element, with_tail=False))
    return etree.tostring(standalone, method='c14n', exclusive=False, with_comments=False)


issuer = ec.generate_private_key(ec.SECP256R1())
ext_key = ec.generate_private_key(ec.SECP256R1())
basic = obj(1, bytes(16) + struct.pack('>III', 2000, 1, 2)
            + bytes(32) + struct.pack('>I', 0xffffffff) + bytes(16))
ext_sign_key = obj(11, struct.pack('>HHI', 1, 512, 0) + public_bytes(ext_key))
ext_fixtures = []
for data in [b'', b'\x01', b'\x01\x02', b'\x01\x02\x03', b'\x01\x02\x03\x04']:
    padding = bytes((-len(data)) % 4)
    record = obj(14, struct.pack('>I', len(data)) + data + padding)
    for tamper in [False, True]:
        ext_signature = bytearray(sign(ext_key, record))
        if tamper:
            ext_signature[0] ^= 1
        container = obj(12, record + obj(13, struct.pack('>HH', 1, 64) + ext_signature), 2)
        attributes = basic + ext_sign_key + container
        payload = b'CERT' + struct.pack('>III', 1, 16 + len(attributes) + 144,
                                      16 + len(attributes)) + attributes
        # Re-sign the outer certificate even when extdata is bad: isolates extdata verification.
        certificate = payload + obj(8, struct.pack('>HH', 1, 64) + sign(issuer, payload)
                                    + struct.pack('>I', 512) + public_bytes(issuer))
        ext_fixtures.append(dict(data=data.hex(), tampered=tamper,
                                 record=record.hex(), certificate=b64(certificate)))
(OUT / 'extdata.json').write_text(json.dumps(dict(issuer=public_bytes(issuer).hex(),
                                                cases=ext_fixtures), indent=2) + '\n')

PROTO = 'http://schemas.microsoft.com/DRM/2007/03/protocols'
DS = 'http://www.w3.org/2000/09/xmldsig#'
C14N = 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315'
key = ec.generate_private_key(ec.SECP256R1())
xml_fixtures = []
for name, attributes, content, inherited in [
    ('canonical', ' Id="SignedData"', '<Version>1</Version>', ''),
    ('empty-element', ' Id="SignedData"', '<Version>1</Version><Licenses/>', ''),
    ('attribute-order', ' z="last" Id="SignedData" a="first"', '<Version>1</Version>', ''),
    ('inherited-default-namespace', ' Id="SignedData"', '<Version>1</Version>', ''),
    ('inherited-namespace', ' Id="SignedData"', '<Version>1</Version>', ' xmlns:unused="urn:fixture"'),
    ('cdata', ' Id="SignedData"', '<Version><![CDATA[1]]></Version>', ''),
    ('comment', ' Id="SignedData"', '<Version>1</Version><!--unsigned comment-->', ''),
    ('signed-info-empty-element', ' Id="SignedData"', '<Version>1</Version>', ''),
]:
    if name != 'inherited-default-namespace':
        attributes = f' xmlns="{PROTO}"' + attributes
    # Whitespace content keeps the baseline method elements from being self-closed by xmldom.
    xml = (f'<AcquireLicenseResponse xmlns="{PROTO}"{inherited}>'
           f'<AcquireLicenseResult><Response><LicenseResponse{attributes}>'
           f'{content}<SigningCertificateChain>AA==</SigningCertificateChain></LicenseResponse>'
           f'<Signature xmlns="{DS}"><SignedInfo>'
           f'<CanonicalizationMethod Algorithm="{C14N}"> </CanonicalizationMethod>'
           '<SignatureMethod Algorithm="http://schemas.microsoft.com/DRM/2007/03/protocols#ecdsa-sha256"> </SignatureMethod>'
           '<Reference URI="#SignedData"><DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"> </DigestMethod>'
           '<DigestValue></DigestValue></Reference></SignedInfo><SignatureValue></SignatureValue>'
           '</Signature></Response></AcquireLicenseResult></AcquireLicenseResponse>')
    if name == 'signed-info-empty-element':
        xml = xml.replace(f'<CanonicalizationMethod Algorithm="{C14N}"> </CanonicalizationMethod>',
                          f'<CanonicalizationMethod Algorithm="{C14N}"/>')
    root = etree.fromstring(xml.encode())
    response = root.find(f'.//{{{PROTO}}}LicenseResponse')
    signed_info = root.find(f'.//{{{DS}}}SignedInfo')
    canonical_response = canonicalize(response)
    digest = b64(hashlib.sha256(canonical_response).digest())
    root.find(f'.//{{{DS}}}DigestValue').text = digest
    canonical_info = canonicalize(signed_info)
    signature = b64(sign(key, canonical_info))
    # Keep the lexical input differences instead of normalizing with lxml serialization.
    xml = xml.replace('<DigestValue></DigestValue>', f'<DigestValue>{digest}</DigestValue>')
    xml = xml.replace('<SignatureValue></SignatureValue>', f'<SignatureValue>{signature}</SignatureValue>')
    xml_fixtures.append(dict(name=name, xml=xml, canonicalResponse=canonical_response.decode(),
                             canonicalSignedInfo=canonical_info.decode(), digest=digest, signature=signature))
(OUT / 'xml-signatures.json').write_text(json.dumps(dict(publicKey=public_bytes(key).hex(),
                                                        cases=xml_fixtures), indent=2) + '\n')
