/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as protobufjs from 'protobufjs/minimal.js';

const $protobuf = protobufjs.default || protobufjs;

// Common aliases
const $Reader = $protobuf.Reader,
  $Writer = $protobuf.Writer,
  $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots['default'] || ($protobuf.roots['default'] = {});

/**
 * LicenseType enum.
 * @exports LicenseType
 * @enum {number}
 * @property {number} STREAMING=1 STREAMING value
 * @property {number} OFFLINE=2 OFFLINE value
 * @property {number} AUTOMATIC=3 AUTOMATIC value
 */
export const LicenseType = ($root.LicenseType = (() => {
  const valuesById = {},
    values = Object.create(valuesById);
  values[(valuesById[1] = 'STREAMING')] = 1;
  values[(valuesById[2] = 'OFFLINE')] = 2;
  values[(valuesById[3] = 'AUTOMATIC')] = 3;
  return values;
})());

/**
 * PlatformVerificationStatus enum.
 * @exports PlatformVerificationStatus
 * @enum {number}
 * @property {number} PLATFORM_UNVERIFIED=0 PLATFORM_UNVERIFIED value
 * @property {number} PLATFORM_TAMPERED=1 PLATFORM_TAMPERED value
 * @property {number} PLATFORM_SOFTWARE_VERIFIED=2 PLATFORM_SOFTWARE_VERIFIED value
 * @property {number} PLATFORM_HARDWARE_VERIFIED=3 PLATFORM_HARDWARE_VERIFIED value
 * @property {number} PLATFORM_NO_VERIFICATION=4 PLATFORM_NO_VERIFICATION value
 * @property {number} PLATFORM_SECURE_STORAGE_SOFTWARE_VERIFIED=5 PLATFORM_SECURE_STORAGE_SOFTWARE_VERIFIED value
 */
export const PlatformVerificationStatus = ($root.PlatformVerificationStatus =
  (() => {
    const valuesById = {},
      values = Object.create(valuesById);
    values[(valuesById[0] = 'PLATFORM_UNVERIFIED')] = 0;
    values[(valuesById[1] = 'PLATFORM_TAMPERED')] = 1;
    values[(valuesById[2] = 'PLATFORM_SOFTWARE_VERIFIED')] = 2;
    values[(valuesById[3] = 'PLATFORM_HARDWARE_VERIFIED')] = 3;
    values[(valuesById[4] = 'PLATFORM_NO_VERIFICATION')] = 4;
    values[(valuesById[5] = 'PLATFORM_SECURE_STORAGE_SOFTWARE_VERIFIED')] = 5;
    return values;
  })());

export const LicenseIdentification = ($root.LicenseIdentification = (() => {
  /**
   * Properties of a LicenseIdentification.
   * @exports ILicenseIdentification
   * @interface ILicenseIdentification
   * @property {Uint8Array|null} [requestId] LicenseIdentification requestId
   * @property {Uint8Array|null} [sessionId] LicenseIdentification sessionId
   * @property {Uint8Array|null} [purchaseId] LicenseIdentification purchaseId
   * @property {LicenseType|null} [type] LicenseIdentification type
   * @property {number|null} [version] LicenseIdentification version
   * @property {Uint8Array|null} [providerSessionToken] LicenseIdentification providerSessionToken
   */

  /**
   * Constructs a new LicenseIdentification.
   * @exports LicenseIdentification
   * @classdesc Represents a LicenseIdentification.
   * @implements ILicenseIdentification
   * @constructor
   * @param {ILicenseIdentification=} [p] Properties to set
   */
  function LicenseIdentification(p) {
    if (p)
      for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
        if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
  }

  /**
   * LicenseIdentification requestId.
   * @member {Uint8Array} requestId
   * @memberof LicenseIdentification
   * @instance
   */
  LicenseIdentification.prototype.requestId = $util.newBuffer([]);

  /**
   * LicenseIdentification sessionId.
   * @member {Uint8Array} sessionId
   * @memberof LicenseIdentification
   * @instance
   */
  LicenseIdentification.prototype.sessionId = $util.newBuffer([]);

  /**
   * LicenseIdentification purchaseId.
   * @member {Uint8Array} purchaseId
   * @memberof LicenseIdentification
   * @instance
   */
  LicenseIdentification.prototype.purchaseId = $util.newBuffer([]);

  /**
   * LicenseIdentification type.
   * @member {LicenseType} type
   * @memberof LicenseIdentification
   * @instance
   */
  LicenseIdentification.prototype.type = 1;

  /**
   * LicenseIdentification version.
   * @member {number} version
   * @memberof LicenseIdentification
   * @instance
   */
  LicenseIdentification.prototype.version = 0;

  /**
   * LicenseIdentification providerSessionToken.
   * @member {Uint8Array} providerSessionToken
   * @memberof LicenseIdentification
   * @instance
   */
  LicenseIdentification.prototype.providerSessionToken = $util.newBuffer([]);

  /**
   * Creates a new LicenseIdentification instance using the specified properties.
   * @function create
   * @memberof LicenseIdentification
   * @static
   * @param {ILicenseIdentification=} [properties] Properties to set
   * @returns {LicenseIdentification} LicenseIdentification instance
   */
  LicenseIdentification.create = function create(properties) {
    return new LicenseIdentification(properties);
  };

  /**
   * Encodes the specified LicenseIdentification message. Does not implicitly {@link LicenseIdentification.verify|verify} messages.
   * @function encode
   * @memberof LicenseIdentification
   * @static
   * @param {ILicenseIdentification} m LicenseIdentification message or plain object to encode
   * @param {$protobuf.Writer} [w] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  LicenseIdentification.encode = function encode(m, w) {
    if (!w) w = $Writer.create();
    if (m.requestId != null && Object.hasOwnProperty.call(m, 'requestId'))
      w.uint32(10).bytes(m.requestId);
    if (m.sessionId != null && Object.hasOwnProperty.call(m, 'sessionId'))
      w.uint32(18).bytes(m.sessionId);
    if (m.purchaseId != null && Object.hasOwnProperty.call(m, 'purchaseId'))
      w.uint32(26).bytes(m.purchaseId);
    if (m.type != null && Object.hasOwnProperty.call(m, 'type'))
      w.uint32(32).int32(m.type);
    if (m.version != null && Object.hasOwnProperty.call(m, 'version'))
      w.uint32(40).int32(m.version);
    if (
      m.providerSessionToken != null &&
      Object.hasOwnProperty.call(m, 'providerSessionToken')
    )
      w.uint32(50).bytes(m.providerSessionToken);
    return w;
  };

  /**
   * Encodes the specified LicenseIdentification message, length delimited. Does not implicitly {@link LicenseIdentification.verify|verify} messages.
   * @function encodeDelimited
   * @memberof LicenseIdentification
   * @static
   * @param {ILicenseIdentification} message LicenseIdentification message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  LicenseIdentification.encodeDelimited = function encodeDelimited(
    message,
    writer,
  ) {
    return this.encode(message, writer).ldelim();
  };

  /**
   * Decodes a LicenseIdentification message from the specified reader or buffer.
   * @function decode
   * @memberof LicenseIdentification
   * @static
   * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
   * @param {number} [l] Message length if known beforehand
   * @returns {LicenseIdentification} LicenseIdentification
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  LicenseIdentification.decode = function decode(r, l) {
    if (!(r instanceof $Reader)) r = $Reader.create(r);
    var c = l === undefined ? r.len : r.pos + l,
      m = new $root.LicenseIdentification();
    while (r.pos < c) {
      var t = r.uint32();
      switch (t >>> 3) {
        case 1: {
          m.requestId = r.bytes();
          break;
        }
        case 2: {
          m.sessionId = r.bytes();
          break;
        }
        case 3: {
          m.purchaseId = r.bytes();
          break;
        }
        case 4: {
          m.type = r.int32();
          break;
        }
        case 5: {
          m.version = r.int32();
          break;
        }
        case 6: {
          m.providerSessionToken = r.bytes();
          break;
        }
        default:
          r.skipType(t & 7);
          break;
      }
    }
    return m;
  };

  /**
   * Decodes a LicenseIdentification message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof LicenseIdentification
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {LicenseIdentification} LicenseIdentification
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  LicenseIdentification.decodeDelimited = function decodeDelimited(reader) {
    if (!(reader instanceof $Reader)) reader = new $Reader(reader);
    return this.decode(reader, reader.uint32());
  };

  /**
   * Creates a LicenseIdentification message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof LicenseIdentification
   * @static
   * @param {Object.<string,*>} d Plain object
   * @returns {LicenseIdentification} LicenseIdentification
   */
  LicenseIdentification.fromObject = function fromObject(d) {
    if (d instanceof $root.LicenseIdentification) return d;
    var m = new $root.LicenseIdentification();
    if (d.requestId != null) {
      if (typeof d.requestId === 'string')
        $util.base64.decode(
          d.requestId,
          (m.requestId = $util.newBuffer($util.base64.length(d.requestId))),
          0,
        );
      else if (d.requestId.length >= 0) m.requestId = d.requestId;
    }
    if (d.sessionId != null) {
      if (typeof d.sessionId === 'string')
        $util.base64.decode(
          d.sessionId,
          (m.sessionId = $util.newBuffer($util.base64.length(d.sessionId))),
          0,
        );
      else if (d.sessionId.length >= 0) m.sessionId = d.sessionId;
    }
    if (d.purchaseId != null) {
      if (typeof d.purchaseId === 'string')
        $util.base64.decode(
          d.purchaseId,
          (m.purchaseId = $util.newBuffer($util.base64.length(d.purchaseId))),
          0,
        );
      else if (d.purchaseId.length >= 0) m.purchaseId = d.purchaseId;
    }
    switch (d.type) {
      default:
        if (typeof d.type === 'number') {
          m.type = d.type;
          break;
        }
        break;
      case 'STREAMING':
      case 1:
        m.type = 1;
        break;
      case 'OFFLINE':
      case 2:
        m.type = 2;
        break;
      case 'AUTOMATIC':
      case 3:
        m.type = 3;
        break;
    }
    if (d.version != null) {
      m.version = d.version | 0;
    }
    if (d.providerSessionToken != null) {
      if (typeof d.providerSessionToken === 'string')
        $util.base64.decode(
          d.providerSessionToken,
          (m.providerSessionToken = $util.newBuffer(
            $util.base64.length(d.providerSessionToken),
          )),
          0,
        );
      else if (d.providerSessionToken.length >= 0)
        m.providerSessionToken = d.providerSessionToken;
    }
    return m;
  };

  /**
   * Creates a plain object from a LicenseIdentification message. Also converts values to other types if specified.
   * @function toObject
   * @memberof LicenseIdentification
   * @static
   * @param {LicenseIdentification} m LicenseIdentification
   * @param {$protobuf.IConversionOptions} [o] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  LicenseIdentification.toObject = function toObject(m, o) {
    if (!o) o = {};
    var d = {};
    if (o.defaults) {
      if (o.bytes === String) d.requestId = '';
      else {
        d.requestId = [];
        if (o.bytes !== Array) d.requestId = $util.newBuffer(d.requestId);
      }
      if (o.bytes === String) d.sessionId = '';
      else {
        d.sessionId = [];
        if (o.bytes !== Array) d.sessionId = $util.newBuffer(d.sessionId);
      }
      if (o.bytes === String) d.purchaseId = '';
      else {
        d.purchaseId = [];
        if (o.bytes !== Array) d.purchaseId = $util.newBuffer(d.purchaseId);
      }
      d.type = o.enums === String ? 'STREAMING' : 1;
      d.version = 0;
      if (o.bytes === String) d.providerSessionToken = '';
      else {
        d.providerSessionToken = [];
        if (o.bytes !== Array)
          d.providerSessionToken = $util.newBuffer(d.providerSessionToken);
      }
    }
    if (m.requestId != null && m.hasOwnProperty('requestId')) {
      d.requestId =
        o.bytes === String
          ? $util.base64.encode(m.requestId, 0, m.requestId.length)
          : o.bytes === Array
            ? Array.prototype.slice.call(m.requestId)
            : m.requestId;
    }
    if (m.sessionId != null && m.hasOwnProperty('sessionId')) {
      d.sessionId =
        o.bytes === String
          ? $util.base64.encode(m.sessionId, 0, m.sessionId.length)
          : o.bytes === Array
            ? Array.prototype.slice.call(m.sessionId)
            : m.sessionId;
    }
    if (m.purchaseId != null && m.hasOwnProperty('purchaseId')) {
      d.purchaseId =
        o.bytes === String
          ? $util.base64.encode(m.purchaseId, 0, m.purchaseId.length)
          : o.bytes === Array
            ? Array.prototype.slice.call(m.purchaseId)
            : m.purchaseId;
    }
    if (m.type != null && m.hasOwnProperty('type')) {
      d.type =
        o.enums === String
          ? $root.LicenseType[m.type] === undefined
            ? m.type
            : $root.LicenseType[m.type]
          : m.type;
    }
    if (m.version != null && m.hasOwnProperty('version')) {
      d.version = m.version;
    }
    if (
      m.providerSessionToken != null &&
      m.hasOwnProperty('providerSessionToken')
    ) {
      d.providerSessionToken =
        o.bytes === String
          ? $util.base64.encode(
              m.providerSessionToken,
              0,
              m.providerSessionToken.length,
            )
          : o.bytes === Array
            ? Array.prototype.slice.call(m.providerSessionToken)
            : m.providerSessionToken;
    }
    return d;
  };

  /**
   * Converts this LicenseIdentification to JSON.
   * @function toJSON
   * @memberof LicenseIdentification
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  LicenseIdentification.prototype.toJSON = function toJSON() {
    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
  };

  /**
   * Gets the default type url for LicenseIdentification
   * @function getTypeUrl
   * @memberof LicenseIdentification
   * @static
   * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns {string} The default type url
   */
  LicenseIdentification.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
    if (typeUrlPrefix === undefined) {
      typeUrlPrefix = 'type.googleapis.com';
    }
    return typeUrlPrefix + '/LicenseIdentification';
  };

  return LicenseIdentification;
})());

export const License = ($root.License = (() => {
  /**
   * Properties of a License.
   * @exports ILicense
   * @interface ILicense
   * @property {ILicenseIdentification|null} [id] License id
   * @property {License.IPolicy|null} [policy] License policy
   * @property {Array.<License.IKeyContainer>|null} [key] License key
   * @property {number|Long|null} [licenseStartTime] License licenseStartTime
   * @property {boolean|null} [remoteAttestationVerified] License remoteAttestationVerified
   * @property {Uint8Array|null} [providerClientToken] License providerClientToken
   * @property {number|null} [protectionScheme] License protectionScheme
   * @property {Uint8Array|null} [srmRequirement] License srmRequirement
   * @property {Uint8Array|null} [srmUpdate] License srmUpdate
   * @property {PlatformVerificationStatus|null} [platformVerificationStatus] License platformVerificationStatus
   * @property {Array.<Uint8Array>|null} [groupIds] License groupIds
   */

  /**
   * Constructs a new License.
   * @exports License
   * @classdesc Represents a License.
   * @implements ILicense
   * @constructor
   * @param {ILicense=} [p] Properties to set
   */
  function License(p) {
    this.key = [];
    this.groupIds = [];
    if (p)
      for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
        if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
  }

  /**
   * License id.
   * @member {ILicenseIdentification|null|undefined} id
   * @memberof License
   * @instance
   */
  License.prototype.id = null;

  /**
   * License policy.
   * @member {License.IPolicy|null|undefined} policy
   * @memberof License
   * @instance
   */
  License.prototype.policy = null;

  /**
   * License key.
   * @member {Array.<License.IKeyContainer>} key
   * @memberof License
   * @instance
   */
  License.prototype.key = $util.emptyArray;

  /**
   * License licenseStartTime.
   * @member {number|Long} licenseStartTime
   * @memberof License
   * @instance
   */
  License.prototype.licenseStartTime = $util.Long
    ? $util.Long.fromBits(0, 0, false)
    : 0;

  /**
   * License remoteAttestationVerified.
   * @member {boolean} remoteAttestationVerified
   * @memberof License
   * @instance
   */
  License.prototype.remoteAttestationVerified = false;

  /**
   * License providerClientToken.
   * @member {Uint8Array} providerClientToken
   * @memberof License
   * @instance
   */
  License.prototype.providerClientToken = $util.newBuffer([]);

  /**
   * License protectionScheme.
   * @member {number} protectionScheme
   * @memberof License
   * @instance
   */
  License.prototype.protectionScheme = 0;

  /**
   * License srmRequirement.
   * @member {Uint8Array} srmRequirement
   * @memberof License
   * @instance
   */
  License.prototype.srmRequirement = $util.newBuffer([]);

  /**
   * License srmUpdate.
   * @member {Uint8Array} srmUpdate
   * @memberof License
   * @instance
   */
  License.prototype.srmUpdate = $util.newBuffer([]);

  /**
   * License platformVerificationStatus.
   * @member {PlatformVerificationStatus} platformVerificationStatus
   * @memberof License
   * @instance
   */
  License.prototype.platformVerificationStatus = 4;

  /**
   * License groupIds.
   * @member {Array.<Uint8Array>} groupIds
   * @memberof License
   * @instance
   */
  License.prototype.groupIds = $util.emptyArray;

  /**
   * Creates a new License instance using the specified properties.
   * @function create
   * @memberof License
   * @static
   * @param {ILicense=} [properties] Properties to set
   * @returns {License} License instance
   */
  License.create = function create(properties) {
    return new License(properties);
  };

  /**
   * Encodes the specified License message. Does not implicitly {@link License.verify|verify} messages.
   * @function encode
   * @memberof License
   * @static
   * @param {ILicense} m License message or plain object to encode
   * @param {$protobuf.Writer} [w] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  License.encode = function encode(m, w) {
    if (!w) w = $Writer.create();
    if (m.id != null && Object.hasOwnProperty.call(m, 'id'))
      $root.LicenseIdentification.encode(m.id, w.uint32(10).fork()).ldelim();
    if (m.policy != null && Object.hasOwnProperty.call(m, 'policy'))
      $root.License.Policy.encode(m.policy, w.uint32(18).fork()).ldelim();
    if (m.key != null && m.key.length) {
      for (var i = 0; i < m.key.length; ++i)
        $root.License.KeyContainer.encode(
          m.key[i],
          w.uint32(26).fork(),
        ).ldelim();
    }
    if (
      m.licenseStartTime != null &&
      Object.hasOwnProperty.call(m, 'licenseStartTime')
    )
      w.uint32(32).int64(m.licenseStartTime);
    if (
      m.remoteAttestationVerified != null &&
      Object.hasOwnProperty.call(m, 'remoteAttestationVerified')
    )
      w.uint32(40).bool(m.remoteAttestationVerified);
    if (
      m.providerClientToken != null &&
      Object.hasOwnProperty.call(m, 'providerClientToken')
    )
      w.uint32(50).bytes(m.providerClientToken);
    if (
      m.protectionScheme != null &&
      Object.hasOwnProperty.call(m, 'protectionScheme')
    )
      w.uint32(56).uint32(m.protectionScheme);
    if (
      m.srmRequirement != null &&
      Object.hasOwnProperty.call(m, 'srmRequirement')
    )
      w.uint32(66).bytes(m.srmRequirement);
    if (m.srmUpdate != null && Object.hasOwnProperty.call(m, 'srmUpdate'))
      w.uint32(74).bytes(m.srmUpdate);
    if (
      m.platformVerificationStatus != null &&
      Object.hasOwnProperty.call(m, 'platformVerificationStatus')
    )
      w.uint32(80).int32(m.platformVerificationStatus);
    if (m.groupIds != null && m.groupIds.length) {
      for (var i = 0; i < m.groupIds.length; ++i)
        w.uint32(90).bytes(m.groupIds[i]);
    }
    return w;
  };

  /**
   * Encodes the specified License message, length delimited. Does not implicitly {@link License.verify|verify} messages.
   * @function encodeDelimited
   * @memberof License
   * @static
   * @param {ILicense} message License message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  License.encodeDelimited = function encodeDelimited(message, writer) {
    return this.encode(message, writer).ldelim();
  };

  /**
   * Decodes a License message from the specified reader or buffer.
   * @function decode
   * @memberof License
   * @static
   * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
   * @param {number} [l] Message length if known beforehand
   * @returns {License} License
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  License.decode = function decode(r, l) {
    if (!(r instanceof $Reader)) r = $Reader.create(r);
    var c = l === undefined ? r.len : r.pos + l,
      m = new $root.License();
    while (r.pos < c) {
      var t = r.uint32();
      switch (t >>> 3) {
        case 1: {
          m.id = $root.LicenseIdentification.decode(r, r.uint32());
          break;
        }
        case 2: {
          m.policy = $root.License.Policy.decode(r, r.uint32());
          break;
        }
        case 3: {
          if (!(m.key && m.key.length)) m.key = [];
          m.key.push($root.License.KeyContainer.decode(r, r.uint32()));
          break;
        }
        case 4: {
          m.licenseStartTime = r.int64();
          break;
        }
        case 5: {
          m.remoteAttestationVerified = r.bool();
          break;
        }
        case 6: {
          m.providerClientToken = r.bytes();
          break;
        }
        case 7: {
          m.protectionScheme = r.uint32();
          break;
        }
        case 8: {
          m.srmRequirement = r.bytes();
          break;
        }
        case 9: {
          m.srmUpdate = r.bytes();
          break;
        }
        case 10: {
          m.platformVerificationStatus = r.int32();
          break;
        }
        case 11: {
          if (!(m.groupIds && m.groupIds.length)) m.groupIds = [];
          m.groupIds.push(r.bytes());
          break;
        }
        default:
          r.skipType(t & 7);
          break;
      }
    }
    return m;
  };

  /**
   * Decodes a License message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof License
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {License} License
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  License.decodeDelimited = function decodeDelimited(reader) {
    if (!(reader instanceof $Reader)) reader = new $Reader(reader);
    return this.decode(reader, reader.uint32());
  };

  /**
   * Creates a License message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof License
   * @static
   * @param {Object.<string,*>} d Plain object
   * @returns {License} License
   */
  License.fromObject = function fromObject(d) {
    if (d instanceof $root.License) return d;
    var m = new $root.License();
    if (d.id != null) {
      if (typeof d.id !== 'object')
        throw TypeError('.License.id: object expected');
      m.id = $root.LicenseIdentification.fromObject(d.id);
    }
    if (d.policy != null) {
      if (typeof d.policy !== 'object')
        throw TypeError('.License.policy: object expected');
      m.policy = $root.License.Policy.fromObject(d.policy);
    }
    if (d.key) {
      if (!Array.isArray(d.key))
        throw TypeError('.License.key: array expected');
      m.key = [];
      for (var i = 0; i < d.key.length; ++i) {
        if (typeof d.key[i] !== 'object')
          throw TypeError('.License.key: object expected');
        m.key[i] = $root.License.KeyContainer.fromObject(d.key[i]);
      }
    }
    if (d.licenseStartTime != null) {
      if ($util.Long)
        (m.licenseStartTime = $util.Long.fromValue(
          d.licenseStartTime,
        )).unsigned = false;
      else if (typeof d.licenseStartTime === 'string')
        m.licenseStartTime = parseInt(d.licenseStartTime, 10);
      else if (typeof d.licenseStartTime === 'number')
        m.licenseStartTime = d.licenseStartTime;
      else if (typeof d.licenseStartTime === 'object')
        m.licenseStartTime = new $util.LongBits(
          d.licenseStartTime.low >>> 0,
          d.licenseStartTime.high >>> 0,
        ).toNumber();
    }
    if (d.remoteAttestationVerified != null) {
      m.remoteAttestationVerified = Boolean(d.remoteAttestationVerified);
    }
    if (d.providerClientToken != null) {
      if (typeof d.providerClientToken === 'string')
        $util.base64.decode(
          d.providerClientToken,
          (m.providerClientToken = $util.newBuffer(
            $util.base64.length(d.providerClientToken),
          )),
          0,
        );
      else if (d.providerClientToken.length >= 0)
        m.providerClientToken = d.providerClientToken;
    }
    if (d.protectionScheme != null) {
      m.protectionScheme = d.protectionScheme >>> 0;
    }
    if (d.srmRequirement != null) {
      if (typeof d.srmRequirement === 'string')
        $util.base64.decode(
          d.srmRequirement,
          (m.srmRequirement = $util.newBuffer(
            $util.base64.length(d.srmRequirement),
          )),
          0,
        );
      else if (d.srmRequirement.length >= 0)
        m.srmRequirement = d.srmRequirement;
    }
    if (d.srmUpdate != null) {
      if (typeof d.srmUpdate === 'string')
        $util.base64.decode(
          d.srmUpdate,
          (m.srmUpdate = $util.newBuffer($util.base64.length(d.srmUpdate))),
          0,
        );
      else if (d.srmUpdate.length >= 0) m.srmUpdate = d.srmUpdate;
    }
    switch (d.platformVerificationStatus) {
      case 'PLATFORM_UNVERIFIED':
      case 0:
        m.platformVerificationStatus = 0;
        break;
      case 'PLATFORM_TAMPERED':
      case 1:
        m.platformVerificationStatus = 1;
        break;
      case 'PLATFORM_SOFTWARE_VERIFIED':
      case 2:
        m.platformVerificationStatus = 2;
        break;
      case 'PLATFORM_HARDWARE_VERIFIED':
      case 3:
        m.platformVerificationStatus = 3;
        break;
      default:
        if (typeof d.platformVerificationStatus === 'number') {
          m.platformVerificationStatus = d.platformVerificationStatus;
          break;
        }
        break;
      case 'PLATFORM_NO_VERIFICATION':
      case 4:
        m.platformVerificationStatus = 4;
        break;
      case 'PLATFORM_SECURE_STORAGE_SOFTWARE_VERIFIED':
      case 5:
        m.platformVerificationStatus = 5;
        break;
    }
    if (d.groupIds) {
      if (!Array.isArray(d.groupIds))
        throw TypeError('.License.groupIds: array expected');
      m.groupIds = [];
      for (var i = 0; i < d.groupIds.length; ++i) {
        if (typeof d.groupIds[i] === 'string')
          $util.base64.decode(
            d.groupIds[i],
            (m.groupIds[i] = $util.newBuffer(
              $util.base64.length(d.groupIds[i]),
            )),
            0,
          );
        else if (d.groupIds[i].length >= 0) m.groupIds[i] = d.groupIds[i];
      }
    }
    return m;
  };

  /**
   * Creates a plain object from a License message. Also converts values to other types if specified.
   * @function toObject
   * @memberof License
   * @static
   * @param {License} m License
   * @param {$protobuf.IConversionOptions} [o] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  License.toObject = function toObject(m, o) {
    if (!o) o = {};
    var d = {};
    if (o.arrays || o.defaults) {
      d.key = [];
      d.groupIds = [];
    }
    if (o.defaults) {
      d.id = null;
      d.policy = null;
      if ($util.Long) {
        var n = new $util.Long(0, 0, false);
        d.licenseStartTime =
          o.longs === String
            ? n.toString()
            : o.longs === Number
              ? n.toNumber()
              : n;
      } else d.licenseStartTime = o.longs === String ? '0' : 0;
      d.remoteAttestationVerified = false;
      if (o.bytes === String) d.providerClientToken = '';
      else {
        d.providerClientToken = [];
        if (o.bytes !== Array)
          d.providerClientToken = $util.newBuffer(d.providerClientToken);
      }
      d.protectionScheme = 0;
      if (o.bytes === String) d.srmRequirement = '';
      else {
        d.srmRequirement = [];
        if (o.bytes !== Array)
          d.srmRequirement = $util.newBuffer(d.srmRequirement);
      }
      if (o.bytes === String) d.srmUpdate = '';
      else {
        d.srmUpdate = [];
        if (o.bytes !== Array) d.srmUpdate = $util.newBuffer(d.srmUpdate);
      }
      d.platformVerificationStatus =
        o.enums === String ? 'PLATFORM_NO_VERIFICATION' : 4;
    }
    if (m.id != null && m.hasOwnProperty('id')) {
      d.id = $root.LicenseIdentification.toObject(m.id, o);
    }
    if (m.policy != null && m.hasOwnProperty('policy')) {
      d.policy = $root.License.Policy.toObject(m.policy, o);
    }
    if (m.key && m.key.length) {
      d.key = [];
      for (var j = 0; j < m.key.length; ++j) {
        d.key[j] = $root.License.KeyContainer.toObject(m.key[j], o);
      }
    }
    if (m.licenseStartTime != null && m.hasOwnProperty('licenseStartTime')) {
      if (typeof m.licenseStartTime === 'number')
        d.licenseStartTime =
          o.longs === String ? String(m.licenseStartTime) : m.licenseStartTime;
      else
        d.licenseStartTime =
          o.longs === String
            ? $util.Long.prototype.toString.call(m.licenseStartTime)
            : o.longs === Number
              ? new $util.LongBits(
                  m.licenseStartTime.low >>> 0,
                  m.licenseStartTime.high >>> 0,
                ).toNumber()
              : m.licenseStartTime;
    }
    if (
      m.remoteAttestationVerified != null &&
      m.hasOwnProperty('remoteAttestationVerified')
    ) {
      d.remoteAttestationVerified = m.remoteAttestationVerified;
    }
    if (
      m.providerClientToken != null &&
      m.hasOwnProperty('providerClientToken')
    ) {
      d.providerClientToken =
        o.bytes === String
          ? $util.base64.encode(
              m.providerClientToken,
              0,
              m.providerClientToken.length,
            )
          : o.bytes === Array
            ? Array.prototype.slice.call(m.providerClientToken)
            : m.providerClientToken;
    }
    if (m.protectionScheme != null && m.hasOwnProperty('protectionScheme')) {
      d.protectionScheme = m.protectionScheme;
    }
    if (m.srmRequirement != null && m.hasOwnProperty('srmRequirement')) {
      d.srmRequirement =
        o.bytes === String
          ? $util.base64.encode(m.srmRequirement, 0, m.srmRequirement.length)
          : o.bytes === Array
            ? Array.prototype.slice.call(m.srmRequirement)
            : m.srmRequirement;
    }
    if (m.srmUpdate != null && m.hasOwnProperty('srmUpdate')) {
      d.srmUpdate =
        o.bytes === String
          ? $util.base64.encode(m.srmUpdate, 0, m.srmUpdate.length)
          : o.bytes === Array
            ? Array.prototype.slice.call(m.srmUpdate)
            : m.srmUpdate;
    }
    if (
      m.platformVerificationStatus != null &&
      m.hasOwnProperty('platformVerificationStatus')
    ) {
      d.platformVerificationStatus =
        o.enums === String
          ? $root.PlatformVerificationStatus[m.platformVerificationStatus] ===
            undefined
            ? m.platformVerificationStatus
            : $root.PlatformVerificationStatus[m.platformVerificationStatus]
          : m.platformVerificationStatus;
    }
    if (m.groupIds && m.groupIds.length) {
      d.groupIds = [];
      for (var j = 0; j < m.groupIds.length; ++j) {
        d.groupIds[j] =
          o.bytes === String
            ? $util.base64.encode(m.groupIds[j], 0, m.groupIds[j].length)
            : o.bytes === Array
              ? Array.prototype.slice.call(m.groupIds[j])
              : m.groupIds[j];
      }
    }
    return d;
  };

  /**
   * Converts this License to JSON.
   * @function toJSON
   * @memberof License
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  License.prototype.toJSON = function toJSON() {
    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
  };

  /**
   * Gets the default type url for License
   * @function getTypeUrl
   * @memberof License
   * @static
   * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns {string} The default type url
   */
  License.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
    if (typeUrlPrefix === undefined) {
      typeUrlPrefix = 'type.googleapis.com';
    }
    return typeUrlPrefix + '/License';
  };

  License.Policy = (function () {
    /**
     * Properties of a Policy.
     * @memberof License
     * @interface IPolicy
     * @property {boolean|null} [canPlay] Policy canPlay
     * @property {boolean|null} [canPersist] Policy canPersist
     * @property {boolean|null} [canRenew] Policy canRenew
     * @property {number|Long|null} [rentalDurationSeconds] Policy rentalDurationSeconds
     * @property {number|Long|null} [playbackDurationSeconds] Policy playbackDurationSeconds
     * @property {number|Long|null} [licenseDurationSeconds] Policy licenseDurationSeconds
     * @property {number|Long|null} [renewalRecoveryDurationSeconds] Policy renewalRecoveryDurationSeconds
     * @property {string|null} [renewalServerUrl] Policy renewalServerUrl
     * @property {number|Long|null} [renewalDelaySeconds] Policy renewalDelaySeconds
     * @property {number|Long|null} [renewalRetryIntervalSeconds] Policy renewalRetryIntervalSeconds
     * @property {boolean|null} [renewWithUsage] Policy renewWithUsage
     * @property {boolean|null} [alwaysIncludeClientId] Policy alwaysIncludeClientId
     * @property {number|Long|null} [playStartGracePeriodSeconds] Policy playStartGracePeriodSeconds
     * @property {boolean|null} [softEnforcePlaybackDuration] Policy softEnforcePlaybackDuration
     * @property {boolean|null} [softEnforceRentalDuration] Policy softEnforceRentalDuration
     */

    /**
     * Constructs a new Policy.
     * @memberof License
     * @classdesc Represents a Policy.
     * @implements IPolicy
     * @constructor
     * @param {License.IPolicy=} [p] Properties to set
     */
    function Policy(p) {
      if (p)
        for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
          if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
    }

    /**
     * Policy canPlay.
     * @member {boolean} canPlay
     * @memberof License.Policy
     * @instance
     */
    Policy.prototype.canPlay = false;

    /**
     * Policy canPersist.
     * @member {boolean} canPersist
     * @memberof License.Policy
     * @instance
     */
    Policy.prototype.canPersist = false;

    /**
     * Policy canRenew.
     * @member {boolean} canRenew
     * @memberof License.Policy
     * @instance
     */
    Policy.prototype.canRenew = false;

    /**
     * Policy rentalDurationSeconds.
     * @member {number|Long} rentalDurationSeconds
     * @memberof License.Policy
     * @instance
     */
    Policy.prototype.rentalDurationSeconds = $util.Long
      ? $util.Long.fromBits(0, 0, false)
      : 0;

    /**
     * Policy playbackDurationSeconds.
     * @member {number|Long} playbackDurationSeconds
     * @memberof License.Policy
     * @instance
     */
    Policy.prototype.playbackDurationSeconds = $util.Long
      ? $util.Long.fromBits(0, 0, false)
      : 0;

    /**
     * Policy licenseDurationSeconds.
     * @member {number|Long} licenseDurationSeconds
     * @memberof License.Policy
     * @instance
     */
    Policy.prototype.licenseDurationSeconds = $util.Long
      ? $util.Long.fromBits(0, 0, false)
      : 0;

    /**
     * Policy renewalRecoveryDurationSeconds.
     * @member {number|Long} renewalRecoveryDurationSeconds
     * @memberof License.Policy
     * @instance
     */
    Policy.prototype.renewalRecoveryDurationSeconds = $util.Long
      ? $util.Long.fromBits(0, 0, false)
      : 0;

    /**
     * Policy renewalServerUrl.
     * @member {string} renewalServerUrl
     * @memberof License.Policy
     * @instance
     */
    Policy.prototype.renewalServerUrl = '';

    /**
     * Policy renewalDelaySeconds.
     * @member {number|Long} renewalDelaySeconds
     * @memberof License.Policy
     * @instance
     */
    Policy.prototype.renewalDelaySeconds = $util.Long
      ? $util.Long.fromBits(0, 0, false)
      : 0;

    /**
     * Policy renewalRetryIntervalSeconds.
     * @member {number|Long} renewalRetryIntervalSeconds
     * @memberof License.Policy
     * @instance
     */
    Policy.prototype.renewalRetryIntervalSeconds = $util.Long
      ? $util.Long.fromBits(0, 0, false)
      : 0;

    /**
     * Policy renewWithUsage.
     * @member {boolean} renewWithUsage
     * @memberof License.Policy
     * @instance
     */
    Policy.prototype.renewWithUsage = false;

    /**
     * Policy alwaysIncludeClientId.
     * @member {boolean} alwaysIncludeClientId
     * @memberof License.Policy
     * @instance
     */
    Policy.prototype.alwaysIncludeClientId = false;

    /**
     * Policy playStartGracePeriodSeconds.
     * @member {number|Long} playStartGracePeriodSeconds
     * @memberof License.Policy
     * @instance
     */
    Policy.prototype.playStartGracePeriodSeconds = $util.Long
      ? $util.Long.fromBits(0, 0, false)
      : 0;

    /**
     * Policy softEnforcePlaybackDuration.
     * @member {boolean} softEnforcePlaybackDuration
     * @memberof License.Policy
     * @instance
     */
    Policy.prototype.softEnforcePlaybackDuration = false;

    /**
     * Policy softEnforceRentalDuration.
     * @member {boolean} softEnforceRentalDuration
     * @memberof License.Policy
     * @instance
     */
    Policy.prototype.softEnforceRentalDuration = true;

    /**
     * Creates a new Policy instance using the specified properties.
     * @function create
     * @memberof License.Policy
     * @static
     * @param {License.IPolicy=} [properties] Properties to set
     * @returns {License.Policy} Policy instance
     */
    Policy.create = function create(properties) {
      return new Policy(properties);
    };

    /**
     * Encodes the specified Policy message. Does not implicitly {@link License.Policy.verify|verify} messages.
     * @function encode
     * @memberof License.Policy
     * @static
     * @param {License.IPolicy} m Policy message or plain object to encode
     * @param {$protobuf.Writer} [w] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Policy.encode = function encode(m, w) {
      if (!w) w = $Writer.create();
      if (m.canPlay != null && Object.hasOwnProperty.call(m, 'canPlay'))
        w.uint32(8).bool(m.canPlay);
      if (m.canPersist != null && Object.hasOwnProperty.call(m, 'canPersist'))
        w.uint32(16).bool(m.canPersist);
      if (m.canRenew != null && Object.hasOwnProperty.call(m, 'canRenew'))
        w.uint32(24).bool(m.canRenew);
      if (
        m.rentalDurationSeconds != null &&
        Object.hasOwnProperty.call(m, 'rentalDurationSeconds')
      )
        w.uint32(32).int64(m.rentalDurationSeconds);
      if (
        m.playbackDurationSeconds != null &&
        Object.hasOwnProperty.call(m, 'playbackDurationSeconds')
      )
        w.uint32(40).int64(m.playbackDurationSeconds);
      if (
        m.licenseDurationSeconds != null &&
        Object.hasOwnProperty.call(m, 'licenseDurationSeconds')
      )
        w.uint32(48).int64(m.licenseDurationSeconds);
      if (
        m.renewalRecoveryDurationSeconds != null &&
        Object.hasOwnProperty.call(m, 'renewalRecoveryDurationSeconds')
      )
        w.uint32(56).int64(m.renewalRecoveryDurationSeconds);
      if (
        m.renewalServerUrl != null &&
        Object.hasOwnProperty.call(m, 'renewalServerUrl')
      )
        w.uint32(66).string(m.renewalServerUrl);
      if (
        m.renewalDelaySeconds != null &&
        Object.hasOwnProperty.call(m, 'renewalDelaySeconds')
      )
        w.uint32(72).int64(m.renewalDelaySeconds);
      if (
        m.renewalRetryIntervalSeconds != null &&
        Object.hasOwnProperty.call(m, 'renewalRetryIntervalSeconds')
      )
        w.uint32(80).int64(m.renewalRetryIntervalSeconds);
      if (
        m.renewWithUsage != null &&
        Object.hasOwnProperty.call(m, 'renewWithUsage')
      )
        w.uint32(88).bool(m.renewWithUsage);
      if (
        m.alwaysIncludeClientId != null &&
        Object.hasOwnProperty.call(m, 'alwaysIncludeClientId')
      )
        w.uint32(96).bool(m.alwaysIncludeClientId);
      if (
        m.playStartGracePeriodSeconds != null &&
        Object.hasOwnProperty.call(m, 'playStartGracePeriodSeconds')
      )
        w.uint32(104).int64(m.playStartGracePeriodSeconds);
      if (
        m.softEnforcePlaybackDuration != null &&
        Object.hasOwnProperty.call(m, 'softEnforcePlaybackDuration')
      )
        w.uint32(112).bool(m.softEnforcePlaybackDuration);
      if (
        m.softEnforceRentalDuration != null &&
        Object.hasOwnProperty.call(m, 'softEnforceRentalDuration')
      )
        w.uint32(120).bool(m.softEnforceRentalDuration);
      return w;
    };

    /**
     * Encodes the specified Policy message, length delimited. Does not implicitly {@link License.Policy.verify|verify} messages.
     * @function encodeDelimited
     * @memberof License.Policy
     * @static
     * @param {License.IPolicy} message Policy message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Policy.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Policy message from the specified reader or buffer.
     * @function decode
     * @memberof License.Policy
     * @static
     * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
     * @param {number} [l] Message length if known beforehand
     * @returns {License.Policy} Policy
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Policy.decode = function decode(r, l) {
      if (!(r instanceof $Reader)) r = $Reader.create(r);
      var c = l === undefined ? r.len : r.pos + l,
        m = new $root.License.Policy();
      while (r.pos < c) {
        var t = r.uint32();
        switch (t >>> 3) {
          case 1: {
            m.canPlay = r.bool();
            break;
          }
          case 2: {
            m.canPersist = r.bool();
            break;
          }
          case 3: {
            m.canRenew = r.bool();
            break;
          }
          case 4: {
            m.rentalDurationSeconds = r.int64();
            break;
          }
          case 5: {
            m.playbackDurationSeconds = r.int64();
            break;
          }
          case 6: {
            m.licenseDurationSeconds = r.int64();
            break;
          }
          case 7: {
            m.renewalRecoveryDurationSeconds = r.int64();
            break;
          }
          case 8: {
            m.renewalServerUrl = r.string();
            break;
          }
          case 9: {
            m.renewalDelaySeconds = r.int64();
            break;
          }
          case 10: {
            m.renewalRetryIntervalSeconds = r.int64();
            break;
          }
          case 11: {
            m.renewWithUsage = r.bool();
            break;
          }
          case 12: {
            m.alwaysIncludeClientId = r.bool();
            break;
          }
          case 13: {
            m.playStartGracePeriodSeconds = r.int64();
            break;
          }
          case 14: {
            m.softEnforcePlaybackDuration = r.bool();
            break;
          }
          case 15: {
            m.softEnforceRentalDuration = r.bool();
            break;
          }
          default:
            r.skipType(t & 7);
            break;
        }
      }
      return m;
    };

    /**
     * Decodes a Policy message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof License.Policy
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {License.Policy} Policy
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Policy.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Creates a Policy message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof License.Policy
     * @static
     * @param {Object.<string,*>} d Plain object
     * @returns {License.Policy} Policy
     */
    Policy.fromObject = function fromObject(d) {
      if (d instanceof $root.License.Policy) return d;
      var m = new $root.License.Policy();
      if (d.canPlay != null) {
        m.canPlay = Boolean(d.canPlay);
      }
      if (d.canPersist != null) {
        m.canPersist = Boolean(d.canPersist);
      }
      if (d.canRenew != null) {
        m.canRenew = Boolean(d.canRenew);
      }
      if (d.rentalDurationSeconds != null) {
        if ($util.Long)
          (m.rentalDurationSeconds = $util.Long.fromValue(
            d.rentalDurationSeconds,
          )).unsigned = false;
        else if (typeof d.rentalDurationSeconds === 'string')
          m.rentalDurationSeconds = parseInt(d.rentalDurationSeconds, 10);
        else if (typeof d.rentalDurationSeconds === 'number')
          m.rentalDurationSeconds = d.rentalDurationSeconds;
        else if (typeof d.rentalDurationSeconds === 'object')
          m.rentalDurationSeconds = new $util.LongBits(
            d.rentalDurationSeconds.low >>> 0,
            d.rentalDurationSeconds.high >>> 0,
          ).toNumber();
      }
      if (d.playbackDurationSeconds != null) {
        if ($util.Long)
          (m.playbackDurationSeconds = $util.Long.fromValue(
            d.playbackDurationSeconds,
          )).unsigned = false;
        else if (typeof d.playbackDurationSeconds === 'string')
          m.playbackDurationSeconds = parseInt(d.playbackDurationSeconds, 10);
        else if (typeof d.playbackDurationSeconds === 'number')
          m.playbackDurationSeconds = d.playbackDurationSeconds;
        else if (typeof d.playbackDurationSeconds === 'object')
          m.playbackDurationSeconds = new $util.LongBits(
            d.playbackDurationSeconds.low >>> 0,
            d.playbackDurationSeconds.high >>> 0,
          ).toNumber();
      }
      if (d.licenseDurationSeconds != null) {
        if ($util.Long)
          (m.licenseDurationSeconds = $util.Long.fromValue(
            d.licenseDurationSeconds,
          )).unsigned = false;
        else if (typeof d.licenseDurationSeconds === 'string')
          m.licenseDurationSeconds = parseInt(d.licenseDurationSeconds, 10);
        else if (typeof d.licenseDurationSeconds === 'number')
          m.licenseDurationSeconds = d.licenseDurationSeconds;
        else if (typeof d.licenseDurationSeconds === 'object')
          m.licenseDurationSeconds = new $util.LongBits(
            d.licenseDurationSeconds.low >>> 0,
            d.licenseDurationSeconds.high >>> 0,
          ).toNumber();
      }
      if (d.renewalRecoveryDurationSeconds != null) {
        if ($util.Long)
          (m.renewalRecoveryDurationSeconds = $util.Long.fromValue(
            d.renewalRecoveryDurationSeconds,
          )).unsigned = false;
        else if (typeof d.renewalRecoveryDurationSeconds === 'string')
          m.renewalRecoveryDurationSeconds = parseInt(
            d.renewalRecoveryDurationSeconds,
            10,
          );
        else if (typeof d.renewalRecoveryDurationSeconds === 'number')
          m.renewalRecoveryDurationSeconds = d.renewalRecoveryDurationSeconds;
        else if (typeof d.renewalRecoveryDurationSeconds === 'object')
          m.renewalRecoveryDurationSeconds = new $util.LongBits(
            d.renewalRecoveryDurationSeconds.low >>> 0,
            d.renewalRecoveryDurationSeconds.high >>> 0,
          ).toNumber();
      }
      if (d.renewalServerUrl != null) {
        m.renewalServerUrl = String(d.renewalServerUrl);
      }
      if (d.renewalDelaySeconds != null) {
        if ($util.Long)
          (m.renewalDelaySeconds = $util.Long.fromValue(
            d.renewalDelaySeconds,
          )).unsigned = false;
        else if (typeof d.renewalDelaySeconds === 'string')
          m.renewalDelaySeconds = parseInt(d.renewalDelaySeconds, 10);
        else if (typeof d.renewalDelaySeconds === 'number')
          m.renewalDelaySeconds = d.renewalDelaySeconds;
        else if (typeof d.renewalDelaySeconds === 'object')
          m.renewalDelaySeconds = new $util.LongBits(
            d.renewalDelaySeconds.low >>> 0,
            d.renewalDelaySeconds.high >>> 0,
          ).toNumber();
      }
      if (d.renewalRetryIntervalSeconds != null) {
        if ($util.Long)
          (m.renewalRetryIntervalSeconds = $util.Long.fromValue(
            d.renewalRetryIntervalSeconds,
          )).unsigned = false;
        else if (typeof d.renewalRetryIntervalSeconds === 'string')
          m.renewalRetryIntervalSeconds = parseInt(
            d.renewalRetryIntervalSeconds,
            10,
          );
        else if (typeof d.renewalRetryIntervalSeconds === 'number')
          m.renewalRetryIntervalSeconds = d.renewalRetryIntervalSeconds;
        else if (typeof d.renewalRetryIntervalSeconds === 'object')
          m.renewalRetryIntervalSeconds = new $util.LongBits(
            d.renewalRetryIntervalSeconds.low >>> 0,
            d.renewalRetryIntervalSeconds.high >>> 0,
          ).toNumber();
      }
      if (d.renewWithUsage != null) {
        m.renewWithUsage = Boolean(d.renewWithUsage);
      }
      if (d.alwaysIncludeClientId != null) {
        m.alwaysIncludeClientId = Boolean(d.alwaysIncludeClientId);
      }
      if (d.playStartGracePeriodSeconds != null) {
        if ($util.Long)
          (m.playStartGracePeriodSeconds = $util.Long.fromValue(
            d.playStartGracePeriodSeconds,
          )).unsigned = false;
        else if (typeof d.playStartGracePeriodSeconds === 'string')
          m.playStartGracePeriodSeconds = parseInt(
            d.playStartGracePeriodSeconds,
            10,
          );
        else if (typeof d.playStartGracePeriodSeconds === 'number')
          m.playStartGracePeriodSeconds = d.playStartGracePeriodSeconds;
        else if (typeof d.playStartGracePeriodSeconds === 'object')
          m.playStartGracePeriodSeconds = new $util.LongBits(
            d.playStartGracePeriodSeconds.low >>> 0,
            d.playStartGracePeriodSeconds.high >>> 0,
          ).toNumber();
      }
      if (d.softEnforcePlaybackDuration != null) {
        m.softEnforcePlaybackDuration = Boolean(d.softEnforcePlaybackDuration);
      }
      if (d.softEnforceRentalDuration != null) {
        m.softEnforceRentalDuration = Boolean(d.softEnforceRentalDuration);
      }
      return m;
    };

    /**
     * Creates a plain object from a Policy message. Also converts values to other types if specified.
     * @function toObject
     * @memberof License.Policy
     * @static
     * @param {License.Policy} m Policy
     * @param {$protobuf.IConversionOptions} [o] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Policy.toObject = function toObject(m, o) {
      if (!o) o = {};
      var d = {};
      if (o.defaults) {
        d.canPlay = false;
        d.canPersist = false;
        d.canRenew = false;
        if ($util.Long) {
          var n = new $util.Long(0, 0, false);
          d.rentalDurationSeconds =
            o.longs === String
              ? n.toString()
              : o.longs === Number
                ? n.toNumber()
                : n;
        } else d.rentalDurationSeconds = o.longs === String ? '0' : 0;
        if ($util.Long) {
          var n = new $util.Long(0, 0, false);
          d.playbackDurationSeconds =
            o.longs === String
              ? n.toString()
              : o.longs === Number
                ? n.toNumber()
                : n;
        } else d.playbackDurationSeconds = o.longs === String ? '0' : 0;
        if ($util.Long) {
          var n = new $util.Long(0, 0, false);
          d.licenseDurationSeconds =
            o.longs === String
              ? n.toString()
              : o.longs === Number
                ? n.toNumber()
                : n;
        } else d.licenseDurationSeconds = o.longs === String ? '0' : 0;
        if ($util.Long) {
          var n = new $util.Long(0, 0, false);
          d.renewalRecoveryDurationSeconds =
            o.longs === String
              ? n.toString()
              : o.longs === Number
                ? n.toNumber()
                : n;
        } else d.renewalRecoveryDurationSeconds = o.longs === String ? '0' : 0;
        d.renewalServerUrl = '';
        if ($util.Long) {
          var n = new $util.Long(0, 0, false);
          d.renewalDelaySeconds =
            o.longs === String
              ? n.toString()
              : o.longs === Number
                ? n.toNumber()
                : n;
        } else d.renewalDelaySeconds = o.longs === String ? '0' : 0;
        if ($util.Long) {
          var n = new $util.Long(0, 0, false);
          d.renewalRetryIntervalSeconds =
            o.longs === String
              ? n.toString()
              : o.longs === Number
                ? n.toNumber()
                : n;
        } else d.renewalRetryIntervalSeconds = o.longs === String ? '0' : 0;
        d.renewWithUsage = false;
        d.alwaysIncludeClientId = false;
        if ($util.Long) {
          var n = new $util.Long(0, 0, false);
          d.playStartGracePeriodSeconds =
            o.longs === String
              ? n.toString()
              : o.longs === Number
                ? n.toNumber()
                : n;
        } else d.playStartGracePeriodSeconds = o.longs === String ? '0' : 0;
        d.softEnforcePlaybackDuration = false;
        d.softEnforceRentalDuration = true;
      }
      if (m.canPlay != null && m.hasOwnProperty('canPlay')) {
        d.canPlay = m.canPlay;
      }
      if (m.canPersist != null && m.hasOwnProperty('canPersist')) {
        d.canPersist = m.canPersist;
      }
      if (m.canRenew != null && m.hasOwnProperty('canRenew')) {
        d.canRenew = m.canRenew;
      }
      if (
        m.rentalDurationSeconds != null &&
        m.hasOwnProperty('rentalDurationSeconds')
      ) {
        if (typeof m.rentalDurationSeconds === 'number')
          d.rentalDurationSeconds =
            o.longs === String
              ? String(m.rentalDurationSeconds)
              : m.rentalDurationSeconds;
        else
          d.rentalDurationSeconds =
            o.longs === String
              ? $util.Long.prototype.toString.call(m.rentalDurationSeconds)
              : o.longs === Number
                ? new $util.LongBits(
                    m.rentalDurationSeconds.low >>> 0,
                    m.rentalDurationSeconds.high >>> 0,
                  ).toNumber()
                : m.rentalDurationSeconds;
      }
      if (
        m.playbackDurationSeconds != null &&
        m.hasOwnProperty('playbackDurationSeconds')
      ) {
        if (typeof m.playbackDurationSeconds === 'number')
          d.playbackDurationSeconds =
            o.longs === String
              ? String(m.playbackDurationSeconds)
              : m.playbackDurationSeconds;
        else
          d.playbackDurationSeconds =
            o.longs === String
              ? $util.Long.prototype.toString.call(m.playbackDurationSeconds)
              : o.longs === Number
                ? new $util.LongBits(
                    m.playbackDurationSeconds.low >>> 0,
                    m.playbackDurationSeconds.high >>> 0,
                  ).toNumber()
                : m.playbackDurationSeconds;
      }
      if (
        m.licenseDurationSeconds != null &&
        m.hasOwnProperty('licenseDurationSeconds')
      ) {
        if (typeof m.licenseDurationSeconds === 'number')
          d.licenseDurationSeconds =
            o.longs === String
              ? String(m.licenseDurationSeconds)
              : m.licenseDurationSeconds;
        else
          d.licenseDurationSeconds =
            o.longs === String
              ? $util.Long.prototype.toString.call(m.licenseDurationSeconds)
              : o.longs === Number
                ? new $util.LongBits(
                    m.licenseDurationSeconds.low >>> 0,
                    m.licenseDurationSeconds.high >>> 0,
                  ).toNumber()
                : m.licenseDurationSeconds;
      }
      if (
        m.renewalRecoveryDurationSeconds != null &&
        m.hasOwnProperty('renewalRecoveryDurationSeconds')
      ) {
        if (typeof m.renewalRecoveryDurationSeconds === 'number')
          d.renewalRecoveryDurationSeconds =
            o.longs === String
              ? String(m.renewalRecoveryDurationSeconds)
              : m.renewalRecoveryDurationSeconds;
        else
          d.renewalRecoveryDurationSeconds =
            o.longs === String
              ? $util.Long.prototype.toString.call(
                  m.renewalRecoveryDurationSeconds,
                )
              : o.longs === Number
                ? new $util.LongBits(
                    m.renewalRecoveryDurationSeconds.low >>> 0,
                    m.renewalRecoveryDurationSeconds.high >>> 0,
                  ).toNumber()
                : m.renewalRecoveryDurationSeconds;
      }
      if (m.renewalServerUrl != null && m.hasOwnProperty('renewalServerUrl')) {
        d.renewalServerUrl = m.renewalServerUrl;
      }
      if (
        m.renewalDelaySeconds != null &&
        m.hasOwnProperty('renewalDelaySeconds')
      ) {
        if (typeof m.renewalDelaySeconds === 'number')
          d.renewalDelaySeconds =
            o.longs === String
              ? String(m.renewalDelaySeconds)
              : m.renewalDelaySeconds;
        else
          d.renewalDelaySeconds =
            o.longs === String
              ? $util.Long.prototype.toString.call(m.renewalDelaySeconds)
              : o.longs === Number
                ? new $util.LongBits(
                    m.renewalDelaySeconds.low >>> 0,
                    m.renewalDelaySeconds.high >>> 0,
                  ).toNumber()
                : m.renewalDelaySeconds;
      }
      if (
        m.renewalRetryIntervalSeconds != null &&
        m.hasOwnProperty('renewalRetryIntervalSeconds')
      ) {
        if (typeof m.renewalRetryIntervalSeconds === 'number')
          d.renewalRetryIntervalSeconds =
            o.longs === String
              ? String(m.renewalRetryIntervalSeconds)
              : m.renewalRetryIntervalSeconds;
        else
          d.renewalRetryIntervalSeconds =
            o.longs === String
              ? $util.Long.prototype.toString.call(
                  m.renewalRetryIntervalSeconds,
                )
              : o.longs === Number
                ? new $util.LongBits(
                    m.renewalRetryIntervalSeconds.low >>> 0,
                    m.renewalRetryIntervalSeconds.high >>> 0,
                  ).toNumber()
                : m.renewalRetryIntervalSeconds;
      }
      if (m.renewWithUsage != null && m.hasOwnProperty('renewWithUsage')) {
        d.renewWithUsage = m.renewWithUsage;
      }
      if (
        m.alwaysIncludeClientId != null &&
        m.hasOwnProperty('alwaysIncludeClientId')
      ) {
        d.alwaysIncludeClientId = m.alwaysIncludeClientId;
      }
      if (
        m.playStartGracePeriodSeconds != null &&
        m.hasOwnProperty('playStartGracePeriodSeconds')
      ) {
        if (typeof m.playStartGracePeriodSeconds === 'number')
          d.playStartGracePeriodSeconds =
            o.longs === String
              ? String(m.playStartGracePeriodSeconds)
              : m.playStartGracePeriodSeconds;
        else
          d.playStartGracePeriodSeconds =
            o.longs === String
              ? $util.Long.prototype.toString.call(
                  m.playStartGracePeriodSeconds,
                )
              : o.longs === Number
                ? new $util.LongBits(
                    m.playStartGracePeriodSeconds.low >>> 0,
                    m.playStartGracePeriodSeconds.high >>> 0,
                  ).toNumber()
                : m.playStartGracePeriodSeconds;
      }
      if (
        m.softEnforcePlaybackDuration != null &&
        m.hasOwnProperty('softEnforcePlaybackDuration')
      ) {
        d.softEnforcePlaybackDuration = m.softEnforcePlaybackDuration;
      }
      if (
        m.softEnforceRentalDuration != null &&
        m.hasOwnProperty('softEnforceRentalDuration')
      ) {
        d.softEnforceRentalDuration = m.softEnforceRentalDuration;
      }
      return d;
    };

    /**
     * Converts this Policy to JSON.
     * @function toJSON
     * @memberof License.Policy
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Policy.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Policy
     * @function getTypeUrl
     * @memberof License.Policy
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Policy.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = 'type.googleapis.com';
      }
      return typeUrlPrefix + '/License.Policy';
    };

    return Policy;
  })();

  License.KeyContainer = (function () {
    /**
     * Properties of a KeyContainer.
     * @memberof License
     * @interface IKeyContainer
     * @property {Uint8Array|null} [id] KeyContainer id
     * @property {Uint8Array|null} [iv] KeyContainer iv
     * @property {Uint8Array|null} [key] KeyContainer key
     * @property {License.KeyContainer.KeyType|null} [type] KeyContainer type
     * @property {License.KeyContainer.SecurityLevel|null} [level] KeyContainer level
     * @property {License.KeyContainer.IOutputProtection|null} [requiredProtection] KeyContainer requiredProtection
     * @property {License.KeyContainer.IOutputProtection|null} [requestedProtection] KeyContainer requestedProtection
     * @property {License.KeyContainer.IKeyControl|null} [keyControl] KeyContainer keyControl
     * @property {License.KeyContainer.IOperatorSessionKeyPermissions|null} [operatorSessionKeyPermissions] KeyContainer operatorSessionKeyPermissions
     * @property {Array.<License.KeyContainer.IVideoResolutionConstraint>|null} [videoResolutionConstraints] KeyContainer videoResolutionConstraints
     * @property {boolean|null} [antiRollbackUsageTable] KeyContainer antiRollbackUsageTable
     * @property {string|null} [trackLabel] KeyContainer trackLabel
     */

    /**
     * Constructs a new KeyContainer.
     * @memberof License
     * @classdesc Represents a KeyContainer.
     * @implements IKeyContainer
     * @constructor
     * @param {License.IKeyContainer=} [p] Properties to set
     */
    function KeyContainer(p) {
      this.videoResolutionConstraints = [];
      if (p)
        for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
          if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
    }

    /**
     * KeyContainer id.
     * @member {Uint8Array} id
     * @memberof License.KeyContainer
     * @instance
     */
    KeyContainer.prototype.id = $util.newBuffer([]);

    /**
     * KeyContainer iv.
     * @member {Uint8Array} iv
     * @memberof License.KeyContainer
     * @instance
     */
    KeyContainer.prototype.iv = $util.newBuffer([]);

    /**
     * KeyContainer key.
     * @member {Uint8Array} key
     * @memberof License.KeyContainer
     * @instance
     */
    KeyContainer.prototype.key = $util.newBuffer([]);

    /**
     * KeyContainer type.
     * @member {License.KeyContainer.KeyType} type
     * @memberof License.KeyContainer
     * @instance
     */
    KeyContainer.prototype.type = 1;

    /**
     * KeyContainer level.
     * @member {License.KeyContainer.SecurityLevel} level
     * @memberof License.KeyContainer
     * @instance
     */
    KeyContainer.prototype.level = 1;

    /**
     * KeyContainer requiredProtection.
     * @member {License.KeyContainer.IOutputProtection|null|undefined} requiredProtection
     * @memberof License.KeyContainer
     * @instance
     */
    KeyContainer.prototype.requiredProtection = null;

    /**
     * KeyContainer requestedProtection.
     * @member {License.KeyContainer.IOutputProtection|null|undefined} requestedProtection
     * @memberof License.KeyContainer
     * @instance
     */
    KeyContainer.prototype.requestedProtection = null;

    /**
     * KeyContainer keyControl.
     * @member {License.KeyContainer.IKeyControl|null|undefined} keyControl
     * @memberof License.KeyContainer
     * @instance
     */
    KeyContainer.prototype.keyControl = null;

    /**
     * KeyContainer operatorSessionKeyPermissions.
     * @member {License.KeyContainer.IOperatorSessionKeyPermissions|null|undefined} operatorSessionKeyPermissions
     * @memberof License.KeyContainer
     * @instance
     */
    KeyContainer.prototype.operatorSessionKeyPermissions = null;

    /**
     * KeyContainer videoResolutionConstraints.
     * @member {Array.<License.KeyContainer.IVideoResolutionConstraint>} videoResolutionConstraints
     * @memberof License.KeyContainer
     * @instance
     */
    KeyContainer.prototype.videoResolutionConstraints = $util.emptyArray;

    /**
     * KeyContainer antiRollbackUsageTable.
     * @member {boolean} antiRollbackUsageTable
     * @memberof License.KeyContainer
     * @instance
     */
    KeyContainer.prototype.antiRollbackUsageTable = false;

    /**
     * KeyContainer trackLabel.
     * @member {string} trackLabel
     * @memberof License.KeyContainer
     * @instance
     */
    KeyContainer.prototype.trackLabel = '';

    /**
     * Creates a new KeyContainer instance using the specified properties.
     * @function create
     * @memberof License.KeyContainer
     * @static
     * @param {License.IKeyContainer=} [properties] Properties to set
     * @returns {License.KeyContainer} KeyContainer instance
     */
    KeyContainer.create = function create(properties) {
      return new KeyContainer(properties);
    };

    /**
     * Encodes the specified KeyContainer message. Does not implicitly {@link License.KeyContainer.verify|verify} messages.
     * @function encode
     * @memberof License.KeyContainer
     * @static
     * @param {License.IKeyContainer} m KeyContainer message or plain object to encode
     * @param {$protobuf.Writer} [w] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    KeyContainer.encode = function encode(m, w) {
      if (!w) w = $Writer.create();
      if (m.id != null && Object.hasOwnProperty.call(m, 'id'))
        w.uint32(10).bytes(m.id);
      if (m.iv != null && Object.hasOwnProperty.call(m, 'iv'))
        w.uint32(18).bytes(m.iv);
      if (m.key != null && Object.hasOwnProperty.call(m, 'key'))
        w.uint32(26).bytes(m.key);
      if (m.type != null && Object.hasOwnProperty.call(m, 'type'))
        w.uint32(32).int32(m.type);
      if (m.level != null && Object.hasOwnProperty.call(m, 'level'))
        w.uint32(40).int32(m.level);
      if (
        m.requiredProtection != null &&
        Object.hasOwnProperty.call(m, 'requiredProtection')
      )
        $root.License.KeyContainer.OutputProtection.encode(
          m.requiredProtection,
          w.uint32(50).fork(),
        ).ldelim();
      if (
        m.requestedProtection != null &&
        Object.hasOwnProperty.call(m, 'requestedProtection')
      )
        $root.License.KeyContainer.OutputProtection.encode(
          m.requestedProtection,
          w.uint32(58).fork(),
        ).ldelim();
      if (m.keyControl != null && Object.hasOwnProperty.call(m, 'keyControl'))
        $root.License.KeyContainer.KeyControl.encode(
          m.keyControl,
          w.uint32(66).fork(),
        ).ldelim();
      if (
        m.operatorSessionKeyPermissions != null &&
        Object.hasOwnProperty.call(m, 'operatorSessionKeyPermissions')
      )
        $root.License.KeyContainer.OperatorSessionKeyPermissions.encode(
          m.operatorSessionKeyPermissions,
          w.uint32(74).fork(),
        ).ldelim();
      if (
        m.videoResolutionConstraints != null &&
        m.videoResolutionConstraints.length
      ) {
        for (var i = 0; i < m.videoResolutionConstraints.length; ++i)
          $root.License.KeyContainer.VideoResolutionConstraint.encode(
            m.videoResolutionConstraints[i],
            w.uint32(82).fork(),
          ).ldelim();
      }
      if (
        m.antiRollbackUsageTable != null &&
        Object.hasOwnProperty.call(m, 'antiRollbackUsageTable')
      )
        w.uint32(88).bool(m.antiRollbackUsageTable);
      if (m.trackLabel != null && Object.hasOwnProperty.call(m, 'trackLabel'))
        w.uint32(98).string(m.trackLabel);
      return w;
    };

    /**
     * Encodes the specified KeyContainer message, length delimited. Does not implicitly {@link License.KeyContainer.verify|verify} messages.
     * @function encodeDelimited
     * @memberof License.KeyContainer
     * @static
     * @param {License.IKeyContainer} message KeyContainer message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    KeyContainer.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a KeyContainer message from the specified reader or buffer.
     * @function decode
     * @memberof License.KeyContainer
     * @static
     * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
     * @param {number} [l] Message length if known beforehand
     * @returns {License.KeyContainer} KeyContainer
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    KeyContainer.decode = function decode(r, l) {
      if (!(r instanceof $Reader)) r = $Reader.create(r);
      var c = l === undefined ? r.len : r.pos + l,
        m = new $root.License.KeyContainer();
      while (r.pos < c) {
        var t = r.uint32();
        switch (t >>> 3) {
          case 1: {
            m.id = r.bytes();
            break;
          }
          case 2: {
            m.iv = r.bytes();
            break;
          }
          case 3: {
            m.key = r.bytes();
            break;
          }
          case 4: {
            m.type = r.int32();
            break;
          }
          case 5: {
            m.level = r.int32();
            break;
          }
          case 6: {
            m.requiredProtection =
              $root.License.KeyContainer.OutputProtection.decode(r, r.uint32());
            break;
          }
          case 7: {
            m.requestedProtection =
              $root.License.KeyContainer.OutputProtection.decode(r, r.uint32());
            break;
          }
          case 8: {
            m.keyControl = $root.License.KeyContainer.KeyControl.decode(
              r,
              r.uint32(),
            );
            break;
          }
          case 9: {
            m.operatorSessionKeyPermissions =
              $root.License.KeyContainer.OperatorSessionKeyPermissions.decode(
                r,
                r.uint32(),
              );
            break;
          }
          case 10: {
            if (
              !(
                m.videoResolutionConstraints &&
                m.videoResolutionConstraints.length
              )
            )
              m.videoResolutionConstraints = [];
            m.videoResolutionConstraints.push(
              $root.License.KeyContainer.VideoResolutionConstraint.decode(
                r,
                r.uint32(),
              ),
            );
            break;
          }
          case 11: {
            m.antiRollbackUsageTable = r.bool();
            break;
          }
          case 12: {
            m.trackLabel = r.string();
            break;
          }
          default:
            r.skipType(t & 7);
            break;
        }
      }
      return m;
    };

    /**
     * Decodes a KeyContainer message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof License.KeyContainer
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {License.KeyContainer} KeyContainer
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    KeyContainer.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Creates a KeyContainer message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof License.KeyContainer
     * @static
     * @param {Object.<string,*>} d Plain object
     * @returns {License.KeyContainer} KeyContainer
     */
    KeyContainer.fromObject = function fromObject(d) {
      if (d instanceof $root.License.KeyContainer) return d;
      var m = new $root.License.KeyContainer();
      if (d.id != null) {
        if (typeof d.id === 'string')
          $util.base64.decode(
            d.id,
            (m.id = $util.newBuffer($util.base64.length(d.id))),
            0,
          );
        else if (d.id.length >= 0) m.id = d.id;
      }
      if (d.iv != null) {
        if (typeof d.iv === 'string')
          $util.base64.decode(
            d.iv,
            (m.iv = $util.newBuffer($util.base64.length(d.iv))),
            0,
          );
        else if (d.iv.length >= 0) m.iv = d.iv;
      }
      if (d.key != null) {
        if (typeof d.key === 'string')
          $util.base64.decode(
            d.key,
            (m.key = $util.newBuffer($util.base64.length(d.key))),
            0,
          );
        else if (d.key.length >= 0) m.key = d.key;
      }
      switch (d.type) {
        default:
          if (typeof d.type === 'number') {
            m.type = d.type;
            break;
          }
          break;
        case 'SIGNING':
        case 1:
          m.type = 1;
          break;
        case 'CONTENT':
        case 2:
          m.type = 2;
          break;
        case 'KEY_CONTROL':
        case 3:
          m.type = 3;
          break;
        case 'OPERATOR_SESSION':
        case 4:
          m.type = 4;
          break;
        case 'ENTITLEMENT':
        case 5:
          m.type = 5;
          break;
        case 'OEM_CONTENT':
        case 6:
          m.type = 6;
          break;
      }
      switch (d.level) {
        default:
          if (typeof d.level === 'number') {
            m.level = d.level;
            break;
          }
          break;
        case 'SW_SECURE_CRYPTO':
        case 1:
          m.level = 1;
          break;
        case 'SW_SECURE_DECODE':
        case 2:
          m.level = 2;
          break;
        case 'HW_SECURE_CRYPTO':
        case 3:
          m.level = 3;
          break;
        case 'HW_SECURE_DECODE':
        case 4:
          m.level = 4;
          break;
        case 'HW_SECURE_ALL':
        case 5:
          m.level = 5;
          break;
      }
      if (d.requiredProtection != null) {
        if (typeof d.requiredProtection !== 'object')
          throw TypeError(
            '.License.KeyContainer.requiredProtection: object expected',
          );
        m.requiredProtection =
          $root.License.KeyContainer.OutputProtection.fromObject(
            d.requiredProtection,
          );
      }
      if (d.requestedProtection != null) {
        if (typeof d.requestedProtection !== 'object')
          throw TypeError(
            '.License.KeyContainer.requestedProtection: object expected',
          );
        m.requestedProtection =
          $root.License.KeyContainer.OutputProtection.fromObject(
            d.requestedProtection,
          );
      }
      if (d.keyControl != null) {
        if (typeof d.keyControl !== 'object')
          throw TypeError('.License.KeyContainer.keyControl: object expected');
        m.keyControl = $root.License.KeyContainer.KeyControl.fromObject(
          d.keyControl,
        );
      }
      if (d.operatorSessionKeyPermissions != null) {
        if (typeof d.operatorSessionKeyPermissions !== 'object')
          throw TypeError(
            '.License.KeyContainer.operatorSessionKeyPermissions: object expected',
          );
        m.operatorSessionKeyPermissions =
          $root.License.KeyContainer.OperatorSessionKeyPermissions.fromObject(
            d.operatorSessionKeyPermissions,
          );
      }
      if (d.videoResolutionConstraints) {
        if (!Array.isArray(d.videoResolutionConstraints))
          throw TypeError(
            '.License.KeyContainer.videoResolutionConstraints: array expected',
          );
        m.videoResolutionConstraints = [];
        for (var i = 0; i < d.videoResolutionConstraints.length; ++i) {
          if (typeof d.videoResolutionConstraints[i] !== 'object')
            throw TypeError(
              '.License.KeyContainer.videoResolutionConstraints: object expected',
            );
          m.videoResolutionConstraints[i] =
            $root.License.KeyContainer.VideoResolutionConstraint.fromObject(
              d.videoResolutionConstraints[i],
            );
        }
      }
      if (d.antiRollbackUsageTable != null) {
        m.antiRollbackUsageTable = Boolean(d.antiRollbackUsageTable);
      }
      if (d.trackLabel != null) {
        m.trackLabel = String(d.trackLabel);
      }
      return m;
    };

    /**
     * Creates a plain object from a KeyContainer message. Also converts values to other types if specified.
     * @function toObject
     * @memberof License.KeyContainer
     * @static
     * @param {License.KeyContainer} m KeyContainer
     * @param {$protobuf.IConversionOptions} [o] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    KeyContainer.toObject = function toObject(m, o) {
      if (!o) o = {};
      var d = {};
      if (o.arrays || o.defaults) {
        d.videoResolutionConstraints = [];
      }
      if (o.defaults) {
        if (o.bytes === String) d.id = '';
        else {
          d.id = [];
          if (o.bytes !== Array) d.id = $util.newBuffer(d.id);
        }
        if (o.bytes === String) d.iv = '';
        else {
          d.iv = [];
          if (o.bytes !== Array) d.iv = $util.newBuffer(d.iv);
        }
        if (o.bytes === String) d.key = '';
        else {
          d.key = [];
          if (o.bytes !== Array) d.key = $util.newBuffer(d.key);
        }
        d.type = o.enums === String ? 'SIGNING' : 1;
        d.level = o.enums === String ? 'SW_SECURE_CRYPTO' : 1;
        d.requiredProtection = null;
        d.requestedProtection = null;
        d.keyControl = null;
        d.operatorSessionKeyPermissions = null;
        d.antiRollbackUsageTable = false;
        d.trackLabel = '';
      }
      if (m.id != null && m.hasOwnProperty('id')) {
        d.id =
          o.bytes === String
            ? $util.base64.encode(m.id, 0, m.id.length)
            : o.bytes === Array
              ? Array.prototype.slice.call(m.id)
              : m.id;
      }
      if (m.iv != null && m.hasOwnProperty('iv')) {
        d.iv =
          o.bytes === String
            ? $util.base64.encode(m.iv, 0, m.iv.length)
            : o.bytes === Array
              ? Array.prototype.slice.call(m.iv)
              : m.iv;
      }
      if (m.key != null && m.hasOwnProperty('key')) {
        d.key =
          o.bytes === String
            ? $util.base64.encode(m.key, 0, m.key.length)
            : o.bytes === Array
              ? Array.prototype.slice.call(m.key)
              : m.key;
      }
      if (m.type != null && m.hasOwnProperty('type')) {
        d.type =
          o.enums === String
            ? $root.License.KeyContainer.KeyType[m.type] === undefined
              ? m.type
              : $root.License.KeyContainer.KeyType[m.type]
            : m.type;
      }
      if (m.level != null && m.hasOwnProperty('level')) {
        d.level =
          o.enums === String
            ? $root.License.KeyContainer.SecurityLevel[m.level] === undefined
              ? m.level
              : $root.License.KeyContainer.SecurityLevel[m.level]
            : m.level;
      }
      if (
        m.requiredProtection != null &&
        m.hasOwnProperty('requiredProtection')
      ) {
        d.requiredProtection =
          $root.License.KeyContainer.OutputProtection.toObject(
            m.requiredProtection,
            o,
          );
      }
      if (
        m.requestedProtection != null &&
        m.hasOwnProperty('requestedProtection')
      ) {
        d.requestedProtection =
          $root.License.KeyContainer.OutputProtection.toObject(
            m.requestedProtection,
            o,
          );
      }
      if (m.keyControl != null && m.hasOwnProperty('keyControl')) {
        d.keyControl = $root.License.KeyContainer.KeyControl.toObject(
          m.keyControl,
          o,
        );
      }
      if (
        m.operatorSessionKeyPermissions != null &&
        m.hasOwnProperty('operatorSessionKeyPermissions')
      ) {
        d.operatorSessionKeyPermissions =
          $root.License.KeyContainer.OperatorSessionKeyPermissions.toObject(
            m.operatorSessionKeyPermissions,
            o,
          );
      }
      if (m.videoResolutionConstraints && m.videoResolutionConstraints.length) {
        d.videoResolutionConstraints = [];
        for (var j = 0; j < m.videoResolutionConstraints.length; ++j) {
          d.videoResolutionConstraints[j] =
            $root.License.KeyContainer.VideoResolutionConstraint.toObject(
              m.videoResolutionConstraints[j],
              o,
            );
        }
      }
      if (
        m.antiRollbackUsageTable != null &&
        m.hasOwnProperty('antiRollbackUsageTable')
      ) {
        d.antiRollbackUsageTable = m.antiRollbackUsageTable;
      }
      if (m.trackLabel != null && m.hasOwnProperty('trackLabel')) {
        d.trackLabel = m.trackLabel;
      }
      return d;
    };

    /**
     * Converts this KeyContainer to JSON.
     * @function toJSON
     * @memberof License.KeyContainer
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    KeyContainer.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for KeyContainer
     * @function getTypeUrl
     * @memberof License.KeyContainer
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    KeyContainer.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = 'type.googleapis.com';
      }
      return typeUrlPrefix + '/License.KeyContainer';
    };

    /**
     * KeyType enum.
     * @name License.KeyContainer.KeyType
     * @enum {number}
     * @property {number} SIGNING=1 SIGNING value
     * @property {number} CONTENT=2 CONTENT value
     * @property {number} KEY_CONTROL=3 KEY_CONTROL value
     * @property {number} OPERATOR_SESSION=4 OPERATOR_SESSION value
     * @property {number} ENTITLEMENT=5 ENTITLEMENT value
     * @property {number} OEM_CONTENT=6 OEM_CONTENT value
     */
    KeyContainer.KeyType = (function () {
      const valuesById = {},
        values = Object.create(valuesById);
      values[(valuesById[1] = 'SIGNING')] = 1;
      values[(valuesById[2] = 'CONTENT')] = 2;
      values[(valuesById[3] = 'KEY_CONTROL')] = 3;
      values[(valuesById[4] = 'OPERATOR_SESSION')] = 4;
      values[(valuesById[5] = 'ENTITLEMENT')] = 5;
      values[(valuesById[6] = 'OEM_CONTENT')] = 6;
      return values;
    })();

    /**
     * SecurityLevel enum.
     * @name License.KeyContainer.SecurityLevel
     * @enum {number}
     * @property {number} SW_SECURE_CRYPTO=1 SW_SECURE_CRYPTO value
     * @property {number} SW_SECURE_DECODE=2 SW_SECURE_DECODE value
     * @property {number} HW_SECURE_CRYPTO=3 HW_SECURE_CRYPTO value
     * @property {number} HW_SECURE_DECODE=4 HW_SECURE_DECODE value
     * @property {number} HW_SECURE_ALL=5 HW_SECURE_ALL value
     */
    KeyContainer.SecurityLevel = (function () {
      const valuesById = {},
        values = Object.create(valuesById);
      values[(valuesById[1] = 'SW_SECURE_CRYPTO')] = 1;
      values[(valuesById[2] = 'SW_SECURE_DECODE')] = 2;
      values[(valuesById[3] = 'HW_SECURE_CRYPTO')] = 3;
      values[(valuesById[4] = 'HW_SECURE_DECODE')] = 4;
      values[(valuesById[5] = 'HW_SECURE_ALL')] = 5;
      return values;
    })();

    KeyContainer.KeyControl = (function () {
      /**
       * Properties of a KeyControl.
       * @memberof License.KeyContainer
       * @interface IKeyControl
       * @property {Uint8Array|null} [keyControlBlock] KeyControl keyControlBlock
       * @property {Uint8Array|null} [iv] KeyControl iv
       */

      /**
       * Constructs a new KeyControl.
       * @memberof License.KeyContainer
       * @classdesc Represents a KeyControl.
       * @implements IKeyControl
       * @constructor
       * @param {License.KeyContainer.IKeyControl=} [p] Properties to set
       */
      function KeyControl(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }

      /**
       * KeyControl keyControlBlock.
       * @member {Uint8Array} keyControlBlock
       * @memberof License.KeyContainer.KeyControl
       * @instance
       */
      KeyControl.prototype.keyControlBlock = $util.newBuffer([]);

      /**
       * KeyControl iv.
       * @member {Uint8Array} iv
       * @memberof License.KeyContainer.KeyControl
       * @instance
       */
      KeyControl.prototype.iv = $util.newBuffer([]);

      /**
       * Creates a new KeyControl instance using the specified properties.
       * @function create
       * @memberof License.KeyContainer.KeyControl
       * @static
       * @param {License.KeyContainer.IKeyControl=} [properties] Properties to set
       * @returns {License.KeyContainer.KeyControl} KeyControl instance
       */
      KeyControl.create = function create(properties) {
        return new KeyControl(properties);
      };

      /**
       * Encodes the specified KeyControl message. Does not implicitly {@link License.KeyContainer.KeyControl.verify|verify} messages.
       * @function encode
       * @memberof License.KeyContainer.KeyControl
       * @static
       * @param {License.KeyContainer.IKeyControl} m KeyControl message or plain object to encode
       * @param {$protobuf.Writer} [w] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */
      KeyControl.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (
          m.keyControlBlock != null &&
          Object.hasOwnProperty.call(m, 'keyControlBlock')
        )
          w.uint32(10).bytes(m.keyControlBlock);
        if (m.iv != null && Object.hasOwnProperty.call(m, 'iv'))
          w.uint32(18).bytes(m.iv);
        return w;
      };

      /**
       * Encodes the specified KeyControl message, length delimited. Does not implicitly {@link License.KeyContainer.KeyControl.verify|verify} messages.
       * @function encodeDelimited
       * @memberof License.KeyContainer.KeyControl
       * @static
       * @param {License.KeyContainer.IKeyControl} message KeyControl message or plain object to encode
       * @param {$protobuf.Writer} [writer] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */
      KeyControl.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
      };

      /**
       * Decodes a KeyControl message from the specified reader or buffer.
       * @function decode
       * @memberof License.KeyContainer.KeyControl
       * @static
       * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
       * @param {number} [l] Message length if known beforehand
       * @returns {License.KeyContainer.KeyControl} KeyControl
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      KeyControl.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.License.KeyContainer.KeyControl();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1: {
              m.keyControlBlock = r.bytes();
              break;
            }
            case 2: {
              m.iv = r.bytes();
              break;
            }
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };

      /**
       * Decodes a KeyControl message from the specified reader or buffer, length delimited.
       * @function decodeDelimited
       * @memberof License.KeyContainer.KeyControl
       * @static
       * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
       * @returns {License.KeyContainer.KeyControl} KeyControl
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      KeyControl.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader)) reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
      };

      /**
       * Creates a KeyControl message from a plain object. Also converts values to their respective internal types.
       * @function fromObject
       * @memberof License.KeyContainer.KeyControl
       * @static
       * @param {Object.<string,*>} d Plain object
       * @returns {License.KeyContainer.KeyControl} KeyControl
       */
      KeyControl.fromObject = function fromObject(d) {
        if (d instanceof $root.License.KeyContainer.KeyControl) return d;
        var m = new $root.License.KeyContainer.KeyControl();
        if (d.keyControlBlock != null) {
          if (typeof d.keyControlBlock === 'string')
            $util.base64.decode(
              d.keyControlBlock,
              (m.keyControlBlock = $util.newBuffer(
                $util.base64.length(d.keyControlBlock),
              )),
              0,
            );
          else if (d.keyControlBlock.length >= 0)
            m.keyControlBlock = d.keyControlBlock;
        }
        if (d.iv != null) {
          if (typeof d.iv === 'string')
            $util.base64.decode(
              d.iv,
              (m.iv = $util.newBuffer($util.base64.length(d.iv))),
              0,
            );
          else if (d.iv.length >= 0) m.iv = d.iv;
        }
        return m;
      };

      /**
       * Creates a plain object from a KeyControl message. Also converts values to other types if specified.
       * @function toObject
       * @memberof License.KeyContainer.KeyControl
       * @static
       * @param {License.KeyContainer.KeyControl} m KeyControl
       * @param {$protobuf.IConversionOptions} [o] Conversion options
       * @returns {Object.<string,*>} Plain object
       */
      KeyControl.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          if (o.bytes === String) d.keyControlBlock = '';
          else {
            d.keyControlBlock = [];
            if (o.bytes !== Array)
              d.keyControlBlock = $util.newBuffer(d.keyControlBlock);
          }
          if (o.bytes === String) d.iv = '';
          else {
            d.iv = [];
            if (o.bytes !== Array) d.iv = $util.newBuffer(d.iv);
          }
        }
        if (m.keyControlBlock != null && m.hasOwnProperty('keyControlBlock')) {
          d.keyControlBlock =
            o.bytes === String
              ? $util.base64.encode(
                  m.keyControlBlock,
                  0,
                  m.keyControlBlock.length,
                )
              : o.bytes === Array
                ? Array.prototype.slice.call(m.keyControlBlock)
                : m.keyControlBlock;
        }
        if (m.iv != null && m.hasOwnProperty('iv')) {
          d.iv =
            o.bytes === String
              ? $util.base64.encode(m.iv, 0, m.iv.length)
              : o.bytes === Array
                ? Array.prototype.slice.call(m.iv)
                : m.iv;
        }
        return d;
      };

      /**
       * Converts this KeyControl to JSON.
       * @function toJSON
       * @memberof License.KeyContainer.KeyControl
       * @instance
       * @returns {Object.<string,*>} JSON object
       */
      KeyControl.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };

      /**
       * Gets the default type url for KeyControl
       * @function getTypeUrl
       * @memberof License.KeyContainer.KeyControl
       * @static
       * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns {string} The default type url
       */
      KeyControl.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
          typeUrlPrefix = 'type.googleapis.com';
        }
        return typeUrlPrefix + '/License.KeyContainer.KeyControl';
      };

      return KeyControl;
    })();

    KeyContainer.OutputProtection = (function () {
      /**
       * Properties of an OutputProtection.
       * @memberof License.KeyContainer
       * @interface IOutputProtection
       * @property {License.KeyContainer.OutputProtection.HDCP|null} [hdcp] OutputProtection hdcp
       * @property {License.KeyContainer.OutputProtection.CGMS|null} [cgmsFlags] OutputProtection cgmsFlags
       * @property {License.KeyContainer.OutputProtection.HdcpSrmRule|null} [hdcpSrmRule] OutputProtection hdcpSrmRule
       * @property {boolean|null} [disableAnalogOutput] OutputProtection disableAnalogOutput
       * @property {boolean|null} [disableDigitalOutput] OutputProtection disableDigitalOutput
       */

      /**
       * Constructs a new OutputProtection.
       * @memberof License.KeyContainer
       * @classdesc Represents an OutputProtection.
       * @implements IOutputProtection
       * @constructor
       * @param {License.KeyContainer.IOutputProtection=} [p] Properties to set
       */
      function OutputProtection(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }

      /**
       * OutputProtection hdcp.
       * @member {License.KeyContainer.OutputProtection.HDCP} hdcp
       * @memberof License.KeyContainer.OutputProtection
       * @instance
       */
      OutputProtection.prototype.hdcp = 0;

      /**
       * OutputProtection cgmsFlags.
       * @member {License.KeyContainer.OutputProtection.CGMS} cgmsFlags
       * @memberof License.KeyContainer.OutputProtection
       * @instance
       */
      OutputProtection.prototype.cgmsFlags = 42;

      /**
       * OutputProtection hdcpSrmRule.
       * @member {License.KeyContainer.OutputProtection.HdcpSrmRule} hdcpSrmRule
       * @memberof License.KeyContainer.OutputProtection
       * @instance
       */
      OutputProtection.prototype.hdcpSrmRule = 0;

      /**
       * OutputProtection disableAnalogOutput.
       * @member {boolean} disableAnalogOutput
       * @memberof License.KeyContainer.OutputProtection
       * @instance
       */
      OutputProtection.prototype.disableAnalogOutput = false;

      /**
       * OutputProtection disableDigitalOutput.
       * @member {boolean} disableDigitalOutput
       * @memberof License.KeyContainer.OutputProtection
       * @instance
       */
      OutputProtection.prototype.disableDigitalOutput = false;

      /**
       * Creates a new OutputProtection instance using the specified properties.
       * @function create
       * @memberof License.KeyContainer.OutputProtection
       * @static
       * @param {License.KeyContainer.IOutputProtection=} [properties] Properties to set
       * @returns {License.KeyContainer.OutputProtection} OutputProtection instance
       */
      OutputProtection.create = function create(properties) {
        return new OutputProtection(properties);
      };

      /**
       * Encodes the specified OutputProtection message. Does not implicitly {@link License.KeyContainer.OutputProtection.verify|verify} messages.
       * @function encode
       * @memberof License.KeyContainer.OutputProtection
       * @static
       * @param {License.KeyContainer.IOutputProtection} m OutputProtection message or plain object to encode
       * @param {$protobuf.Writer} [w] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */
      OutputProtection.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.hdcp != null && Object.hasOwnProperty.call(m, 'hdcp'))
          w.uint32(8).int32(m.hdcp);
        if (m.cgmsFlags != null && Object.hasOwnProperty.call(m, 'cgmsFlags'))
          w.uint32(16).int32(m.cgmsFlags);
        if (
          m.hdcpSrmRule != null &&
          Object.hasOwnProperty.call(m, 'hdcpSrmRule')
        )
          w.uint32(24).int32(m.hdcpSrmRule);
        if (
          m.disableAnalogOutput != null &&
          Object.hasOwnProperty.call(m, 'disableAnalogOutput')
        )
          w.uint32(32).bool(m.disableAnalogOutput);
        if (
          m.disableDigitalOutput != null &&
          Object.hasOwnProperty.call(m, 'disableDigitalOutput')
        )
          w.uint32(40).bool(m.disableDigitalOutput);
        return w;
      };

      /**
       * Encodes the specified OutputProtection message, length delimited. Does not implicitly {@link License.KeyContainer.OutputProtection.verify|verify} messages.
       * @function encodeDelimited
       * @memberof License.KeyContainer.OutputProtection
       * @static
       * @param {License.KeyContainer.IOutputProtection} message OutputProtection message or plain object to encode
       * @param {$protobuf.Writer} [writer] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */
      OutputProtection.encodeDelimited = function encodeDelimited(
        message,
        writer,
      ) {
        return this.encode(message, writer).ldelim();
      };

      /**
       * Decodes an OutputProtection message from the specified reader or buffer.
       * @function decode
       * @memberof License.KeyContainer.OutputProtection
       * @static
       * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
       * @param {number} [l] Message length if known beforehand
       * @returns {License.KeyContainer.OutputProtection} OutputProtection
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      OutputProtection.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.License.KeyContainer.OutputProtection();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1: {
              m.hdcp = r.int32();
              break;
            }
            case 2: {
              m.cgmsFlags = r.int32();
              break;
            }
            case 3: {
              m.hdcpSrmRule = r.int32();
              break;
            }
            case 4: {
              m.disableAnalogOutput = r.bool();
              break;
            }
            case 5: {
              m.disableDigitalOutput = r.bool();
              break;
            }
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };

      /**
       * Decodes an OutputProtection message from the specified reader or buffer, length delimited.
       * @function decodeDelimited
       * @memberof License.KeyContainer.OutputProtection
       * @static
       * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
       * @returns {License.KeyContainer.OutputProtection} OutputProtection
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      OutputProtection.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader)) reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
      };

      /**
       * Creates an OutputProtection message from a plain object. Also converts values to their respective internal types.
       * @function fromObject
       * @memberof License.KeyContainer.OutputProtection
       * @static
       * @param {Object.<string,*>} d Plain object
       * @returns {License.KeyContainer.OutputProtection} OutputProtection
       */
      OutputProtection.fromObject = function fromObject(d) {
        if (d instanceof $root.License.KeyContainer.OutputProtection) return d;
        var m = new $root.License.KeyContainer.OutputProtection();
        switch (d.hdcp) {
          default:
            if (typeof d.hdcp === 'number') {
              m.hdcp = d.hdcp;
              break;
            }
            break;
          case 'HDCP_NONE':
          case 0:
            m.hdcp = 0;
            break;
          case 'HDCP_V1':
          case 1:
            m.hdcp = 1;
            break;
          case 'HDCP_V2':
          case 2:
            m.hdcp = 2;
            break;
          case 'HDCP_V2_1':
          case 3:
            m.hdcp = 3;
            break;
          case 'HDCP_V2_2':
          case 4:
            m.hdcp = 4;
            break;
          case 'HDCP_V2_3':
          case 5:
            m.hdcp = 5;
            break;
          case 'HDCP_NO_DIGITAL_OUTPUT':
          case 255:
            m.hdcp = 255;
            break;
        }
        switch (d.cgmsFlags) {
          default:
            if (typeof d.cgmsFlags === 'number') {
              m.cgmsFlags = d.cgmsFlags;
              break;
            }
            break;
          case 'CGMS_NONE':
          case 42:
            m.cgmsFlags = 42;
            break;
          case 'COPY_FREE':
          case 0:
            m.cgmsFlags = 0;
            break;
          case 'COPY_ONCE':
          case 2:
            m.cgmsFlags = 2;
            break;
          case 'COPY_NEVER':
          case 3:
            m.cgmsFlags = 3;
            break;
        }
        switch (d.hdcpSrmRule) {
          default:
            if (typeof d.hdcpSrmRule === 'number') {
              m.hdcpSrmRule = d.hdcpSrmRule;
              break;
            }
            break;
          case 'HDCP_SRM_RULE_NONE':
          case 0:
            m.hdcpSrmRule = 0;
            break;
          case 'CURRENT_SRM':
          case 1:
            m.hdcpSrmRule = 1;
            break;
        }
        if (d.disableAnalogOutput != null) {
          m.disableAnalogOutput = Boolean(d.disableAnalogOutput);
        }
        if (d.disableDigitalOutput != null) {
          m.disableDigitalOutput = Boolean(d.disableDigitalOutput);
        }
        return m;
      };

      /**
       * Creates a plain object from an OutputProtection message. Also converts values to other types if specified.
       * @function toObject
       * @memberof License.KeyContainer.OutputProtection
       * @static
       * @param {License.KeyContainer.OutputProtection} m OutputProtection
       * @param {$protobuf.IConversionOptions} [o] Conversion options
       * @returns {Object.<string,*>} Plain object
       */
      OutputProtection.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          d.hdcp = o.enums === String ? 'HDCP_NONE' : 0;
          d.cgmsFlags = o.enums === String ? 'CGMS_NONE' : 42;
          d.hdcpSrmRule = o.enums === String ? 'HDCP_SRM_RULE_NONE' : 0;
          d.disableAnalogOutput = false;
          d.disableDigitalOutput = false;
        }
        if (m.hdcp != null && m.hasOwnProperty('hdcp')) {
          d.hdcp =
            o.enums === String
              ? $root.License.KeyContainer.OutputProtection.HDCP[m.hdcp] ===
                undefined
                ? m.hdcp
                : $root.License.KeyContainer.OutputProtection.HDCP[m.hdcp]
              : m.hdcp;
        }
        if (m.cgmsFlags != null && m.hasOwnProperty('cgmsFlags')) {
          d.cgmsFlags =
            o.enums === String
              ? $root.License.KeyContainer.OutputProtection.CGMS[
                  m.cgmsFlags
                ] === undefined
                ? m.cgmsFlags
                : $root.License.KeyContainer.OutputProtection.CGMS[m.cgmsFlags]
              : m.cgmsFlags;
        }
        if (m.hdcpSrmRule != null && m.hasOwnProperty('hdcpSrmRule')) {
          d.hdcpSrmRule =
            o.enums === String
              ? $root.License.KeyContainer.OutputProtection.HdcpSrmRule[
                  m.hdcpSrmRule
                ] === undefined
                ? m.hdcpSrmRule
                : $root.License.KeyContainer.OutputProtection.HdcpSrmRule[
                    m.hdcpSrmRule
                  ]
              : m.hdcpSrmRule;
        }
        if (
          m.disableAnalogOutput != null &&
          m.hasOwnProperty('disableAnalogOutput')
        ) {
          d.disableAnalogOutput = m.disableAnalogOutput;
        }
        if (
          m.disableDigitalOutput != null &&
          m.hasOwnProperty('disableDigitalOutput')
        ) {
          d.disableDigitalOutput = m.disableDigitalOutput;
        }
        return d;
      };

      /**
       * Converts this OutputProtection to JSON.
       * @function toJSON
       * @memberof License.KeyContainer.OutputProtection
       * @instance
       * @returns {Object.<string,*>} JSON object
       */
      OutputProtection.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };

      /**
       * Gets the default type url for OutputProtection
       * @function getTypeUrl
       * @memberof License.KeyContainer.OutputProtection
       * @static
       * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns {string} The default type url
       */
      OutputProtection.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
          typeUrlPrefix = 'type.googleapis.com';
        }
        return typeUrlPrefix + '/License.KeyContainer.OutputProtection';
      };

      /**
       * HDCP enum.
       * @name License.KeyContainer.OutputProtection.HDCP
       * @enum {number}
       * @property {number} HDCP_NONE=0 HDCP_NONE value
       * @property {number} HDCP_V1=1 HDCP_V1 value
       * @property {number} HDCP_V2=2 HDCP_V2 value
       * @property {number} HDCP_V2_1=3 HDCP_V2_1 value
       * @property {number} HDCP_V2_2=4 HDCP_V2_2 value
       * @property {number} HDCP_V2_3=5 HDCP_V2_3 value
       * @property {number} HDCP_NO_DIGITAL_OUTPUT=255 HDCP_NO_DIGITAL_OUTPUT value
       */
      OutputProtection.HDCP = (function () {
        const valuesById = {},
          values = Object.create(valuesById);
        values[(valuesById[0] = 'HDCP_NONE')] = 0;
        values[(valuesById[1] = 'HDCP_V1')] = 1;
        values[(valuesById[2] = 'HDCP_V2')] = 2;
        values[(valuesById[3] = 'HDCP_V2_1')] = 3;
        values[(valuesById[4] = 'HDCP_V2_2')] = 4;
        values[(valuesById[5] = 'HDCP_V2_3')] = 5;
        values[(valuesById[255] = 'HDCP_NO_DIGITAL_OUTPUT')] = 255;
        return values;
      })();

      /**
       * CGMS enum.
       * @name License.KeyContainer.OutputProtection.CGMS
       * @enum {number}
       * @property {number} CGMS_NONE=42 CGMS_NONE value
       * @property {number} COPY_FREE=0 COPY_FREE value
       * @property {number} COPY_ONCE=2 COPY_ONCE value
       * @property {number} COPY_NEVER=3 COPY_NEVER value
       */
      OutputProtection.CGMS = (function () {
        const valuesById = {},
          values = Object.create(valuesById);
        values[(valuesById[42] = 'CGMS_NONE')] = 42;
        values[(valuesById[0] = 'COPY_FREE')] = 0;
        values[(valuesById[2] = 'COPY_ONCE')] = 2;
        values[(valuesById[3] = 'COPY_NEVER')] = 3;
        return values;
      })();

      /**
       * HdcpSrmRule enum.
       * @name License.KeyContainer.OutputProtection.HdcpSrmRule
       * @enum {number}
       * @property {number} HDCP_SRM_RULE_NONE=0 HDCP_SRM_RULE_NONE value
       * @property {number} CURRENT_SRM=1 CURRENT_SRM value
       */
      OutputProtection.HdcpSrmRule = (function () {
        const valuesById = {},
          values = Object.create(valuesById);
        values[(valuesById[0] = 'HDCP_SRM_RULE_NONE')] = 0;
        values[(valuesById[1] = 'CURRENT_SRM')] = 1;
        return values;
      })();

      return OutputProtection;
    })();

    KeyContainer.VideoResolutionConstraint = (function () {
      /**
       * Properties of a VideoResolutionConstraint.
       * @memberof License.KeyContainer
       * @interface IVideoResolutionConstraint
       * @property {number|null} [minResolutionPixels] VideoResolutionConstraint minResolutionPixels
       * @property {number|null} [maxResolutionPixels] VideoResolutionConstraint maxResolutionPixels
       * @property {License.KeyContainer.IOutputProtection|null} [requiredProtection] VideoResolutionConstraint requiredProtection
       */

      /**
       * Constructs a new VideoResolutionConstraint.
       * @memberof License.KeyContainer
       * @classdesc Represents a VideoResolutionConstraint.
       * @implements IVideoResolutionConstraint
       * @constructor
       * @param {License.KeyContainer.IVideoResolutionConstraint=} [p] Properties to set
       */
      function VideoResolutionConstraint(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }

      /**
       * VideoResolutionConstraint minResolutionPixels.
       * @member {number} minResolutionPixels
       * @memberof License.KeyContainer.VideoResolutionConstraint
       * @instance
       */
      VideoResolutionConstraint.prototype.minResolutionPixels = 0;

      /**
       * VideoResolutionConstraint maxResolutionPixels.
       * @member {number} maxResolutionPixels
       * @memberof License.KeyContainer.VideoResolutionConstraint
       * @instance
       */
      VideoResolutionConstraint.prototype.maxResolutionPixels = 0;

      /**
       * VideoResolutionConstraint requiredProtection.
       * @member {License.KeyContainer.IOutputProtection|null|undefined} requiredProtection
       * @memberof License.KeyContainer.VideoResolutionConstraint
       * @instance
       */
      VideoResolutionConstraint.prototype.requiredProtection = null;

      /**
       * Creates a new VideoResolutionConstraint instance using the specified properties.
       * @function create
       * @memberof License.KeyContainer.VideoResolutionConstraint
       * @static
       * @param {License.KeyContainer.IVideoResolutionConstraint=} [properties] Properties to set
       * @returns {License.KeyContainer.VideoResolutionConstraint} VideoResolutionConstraint instance
       */
      VideoResolutionConstraint.create = function create(properties) {
        return new VideoResolutionConstraint(properties);
      };

      /**
       * Encodes the specified VideoResolutionConstraint message. Does not implicitly {@link License.KeyContainer.VideoResolutionConstraint.verify|verify} messages.
       * @function encode
       * @memberof License.KeyContainer.VideoResolutionConstraint
       * @static
       * @param {License.KeyContainer.IVideoResolutionConstraint} m VideoResolutionConstraint message or plain object to encode
       * @param {$protobuf.Writer} [w] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */
      VideoResolutionConstraint.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (
          m.minResolutionPixels != null &&
          Object.hasOwnProperty.call(m, 'minResolutionPixels')
        )
          w.uint32(8).uint32(m.minResolutionPixels);
        if (
          m.maxResolutionPixels != null &&
          Object.hasOwnProperty.call(m, 'maxResolutionPixels')
        )
          w.uint32(16).uint32(m.maxResolutionPixels);
        if (
          m.requiredProtection != null &&
          Object.hasOwnProperty.call(m, 'requiredProtection')
        )
          $root.License.KeyContainer.OutputProtection.encode(
            m.requiredProtection,
            w.uint32(26).fork(),
          ).ldelim();
        return w;
      };

      /**
       * Encodes the specified VideoResolutionConstraint message, length delimited. Does not implicitly {@link License.KeyContainer.VideoResolutionConstraint.verify|verify} messages.
       * @function encodeDelimited
       * @memberof License.KeyContainer.VideoResolutionConstraint
       * @static
       * @param {License.KeyContainer.IVideoResolutionConstraint} message VideoResolutionConstraint message or plain object to encode
       * @param {$protobuf.Writer} [writer] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */
      VideoResolutionConstraint.encodeDelimited = function encodeDelimited(
        message,
        writer,
      ) {
        return this.encode(message, writer).ldelim();
      };

      /**
       * Decodes a VideoResolutionConstraint message from the specified reader or buffer.
       * @function decode
       * @memberof License.KeyContainer.VideoResolutionConstraint
       * @static
       * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
       * @param {number} [l] Message length if known beforehand
       * @returns {License.KeyContainer.VideoResolutionConstraint} VideoResolutionConstraint
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      VideoResolutionConstraint.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.License.KeyContainer.VideoResolutionConstraint();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1: {
              m.minResolutionPixels = r.uint32();
              break;
            }
            case 2: {
              m.maxResolutionPixels = r.uint32();
              break;
            }
            case 3: {
              m.requiredProtection =
                $root.License.KeyContainer.OutputProtection.decode(
                  r,
                  r.uint32(),
                );
              break;
            }
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };

      /**
       * Decodes a VideoResolutionConstraint message from the specified reader or buffer, length delimited.
       * @function decodeDelimited
       * @memberof License.KeyContainer.VideoResolutionConstraint
       * @static
       * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
       * @returns {License.KeyContainer.VideoResolutionConstraint} VideoResolutionConstraint
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      VideoResolutionConstraint.decodeDelimited = function decodeDelimited(
        reader,
      ) {
        if (!(reader instanceof $Reader)) reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
      };

      /**
       * Creates a VideoResolutionConstraint message from a plain object. Also converts values to their respective internal types.
       * @function fromObject
       * @memberof License.KeyContainer.VideoResolutionConstraint
       * @static
       * @param {Object.<string,*>} d Plain object
       * @returns {License.KeyContainer.VideoResolutionConstraint} VideoResolutionConstraint
       */
      VideoResolutionConstraint.fromObject = function fromObject(d) {
        if (d instanceof $root.License.KeyContainer.VideoResolutionConstraint)
          return d;
        var m = new $root.License.KeyContainer.VideoResolutionConstraint();
        if (d.minResolutionPixels != null) {
          m.minResolutionPixels = d.minResolutionPixels >>> 0;
        }
        if (d.maxResolutionPixels != null) {
          m.maxResolutionPixels = d.maxResolutionPixels >>> 0;
        }
        if (d.requiredProtection != null) {
          if (typeof d.requiredProtection !== 'object')
            throw TypeError(
              '.License.KeyContainer.VideoResolutionConstraint.requiredProtection: object expected',
            );
          m.requiredProtection =
            $root.License.KeyContainer.OutputProtection.fromObject(
              d.requiredProtection,
            );
        }
        return m;
      };

      /**
       * Creates a plain object from a VideoResolutionConstraint message. Also converts values to other types if specified.
       * @function toObject
       * @memberof License.KeyContainer.VideoResolutionConstraint
       * @static
       * @param {License.KeyContainer.VideoResolutionConstraint} m VideoResolutionConstraint
       * @param {$protobuf.IConversionOptions} [o] Conversion options
       * @returns {Object.<string,*>} Plain object
       */
      VideoResolutionConstraint.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          d.minResolutionPixels = 0;
          d.maxResolutionPixels = 0;
          d.requiredProtection = null;
        }
        if (
          m.minResolutionPixels != null &&
          m.hasOwnProperty('minResolutionPixels')
        ) {
          d.minResolutionPixels = m.minResolutionPixels;
        }
        if (
          m.maxResolutionPixels != null &&
          m.hasOwnProperty('maxResolutionPixels')
        ) {
          d.maxResolutionPixels = m.maxResolutionPixels;
        }
        if (
          m.requiredProtection != null &&
          m.hasOwnProperty('requiredProtection')
        ) {
          d.requiredProtection =
            $root.License.KeyContainer.OutputProtection.toObject(
              m.requiredProtection,
              o,
            );
        }
        return d;
      };

      /**
       * Converts this VideoResolutionConstraint to JSON.
       * @function toJSON
       * @memberof License.KeyContainer.VideoResolutionConstraint
       * @instance
       * @returns {Object.<string,*>} JSON object
       */
      VideoResolutionConstraint.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };

      /**
       * Gets the default type url for VideoResolutionConstraint
       * @function getTypeUrl
       * @memberof License.KeyContainer.VideoResolutionConstraint
       * @static
       * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns {string} The default type url
       */
      VideoResolutionConstraint.getTypeUrl = function getTypeUrl(
        typeUrlPrefix,
      ) {
        if (typeUrlPrefix === undefined) {
          typeUrlPrefix = 'type.googleapis.com';
        }
        return (
          typeUrlPrefix + '/License.KeyContainer.VideoResolutionConstraint'
        );
      };

      return VideoResolutionConstraint;
    })();

    KeyContainer.OperatorSessionKeyPermissions = (function () {
      /**
       * Properties of an OperatorSessionKeyPermissions.
       * @memberof License.KeyContainer
       * @interface IOperatorSessionKeyPermissions
       * @property {boolean|null} [allowEncrypt] OperatorSessionKeyPermissions allowEncrypt
       * @property {boolean|null} [allowDecrypt] OperatorSessionKeyPermissions allowDecrypt
       * @property {boolean|null} [allowSign] OperatorSessionKeyPermissions allowSign
       * @property {boolean|null} [allowSignatureVerify] OperatorSessionKeyPermissions allowSignatureVerify
       */

      /**
       * Constructs a new OperatorSessionKeyPermissions.
       * @memberof License.KeyContainer
       * @classdesc Represents an OperatorSessionKeyPermissions.
       * @implements IOperatorSessionKeyPermissions
       * @constructor
       * @param {License.KeyContainer.IOperatorSessionKeyPermissions=} [p] Properties to set
       */
      function OperatorSessionKeyPermissions(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }

      /**
       * OperatorSessionKeyPermissions allowEncrypt.
       * @member {boolean} allowEncrypt
       * @memberof License.KeyContainer.OperatorSessionKeyPermissions
       * @instance
       */
      OperatorSessionKeyPermissions.prototype.allowEncrypt = false;

      /**
       * OperatorSessionKeyPermissions allowDecrypt.
       * @member {boolean} allowDecrypt
       * @memberof License.KeyContainer.OperatorSessionKeyPermissions
       * @instance
       */
      OperatorSessionKeyPermissions.prototype.allowDecrypt = false;

      /**
       * OperatorSessionKeyPermissions allowSign.
       * @member {boolean} allowSign
       * @memberof License.KeyContainer.OperatorSessionKeyPermissions
       * @instance
       */
      OperatorSessionKeyPermissions.prototype.allowSign = false;

      /**
       * OperatorSessionKeyPermissions allowSignatureVerify.
       * @member {boolean} allowSignatureVerify
       * @memberof License.KeyContainer.OperatorSessionKeyPermissions
       * @instance
       */
      OperatorSessionKeyPermissions.prototype.allowSignatureVerify = false;

      /**
       * Creates a new OperatorSessionKeyPermissions instance using the specified properties.
       * @function create
       * @memberof License.KeyContainer.OperatorSessionKeyPermissions
       * @static
       * @param {License.KeyContainer.IOperatorSessionKeyPermissions=} [properties] Properties to set
       * @returns {License.KeyContainer.OperatorSessionKeyPermissions} OperatorSessionKeyPermissions instance
       */
      OperatorSessionKeyPermissions.create = function create(properties) {
        return new OperatorSessionKeyPermissions(properties);
      };

      /**
       * Encodes the specified OperatorSessionKeyPermissions message. Does not implicitly {@link License.KeyContainer.OperatorSessionKeyPermissions.verify|verify} messages.
       * @function encode
       * @memberof License.KeyContainer.OperatorSessionKeyPermissions
       * @static
       * @param {License.KeyContainer.IOperatorSessionKeyPermissions} m OperatorSessionKeyPermissions message or plain object to encode
       * @param {$protobuf.Writer} [w] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */
      OperatorSessionKeyPermissions.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (
          m.allowEncrypt != null &&
          Object.hasOwnProperty.call(m, 'allowEncrypt')
        )
          w.uint32(8).bool(m.allowEncrypt);
        if (
          m.allowDecrypt != null &&
          Object.hasOwnProperty.call(m, 'allowDecrypt')
        )
          w.uint32(16).bool(m.allowDecrypt);
        if (m.allowSign != null && Object.hasOwnProperty.call(m, 'allowSign'))
          w.uint32(24).bool(m.allowSign);
        if (
          m.allowSignatureVerify != null &&
          Object.hasOwnProperty.call(m, 'allowSignatureVerify')
        )
          w.uint32(32).bool(m.allowSignatureVerify);
        return w;
      };

      /**
       * Encodes the specified OperatorSessionKeyPermissions message, length delimited. Does not implicitly {@link License.KeyContainer.OperatorSessionKeyPermissions.verify|verify} messages.
       * @function encodeDelimited
       * @memberof License.KeyContainer.OperatorSessionKeyPermissions
       * @static
       * @param {License.KeyContainer.IOperatorSessionKeyPermissions} message OperatorSessionKeyPermissions message or plain object to encode
       * @param {$protobuf.Writer} [writer] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */
      OperatorSessionKeyPermissions.encodeDelimited = function encodeDelimited(
        message,
        writer,
      ) {
        return this.encode(message, writer).ldelim();
      };

      /**
       * Decodes an OperatorSessionKeyPermissions message from the specified reader or buffer.
       * @function decode
       * @memberof License.KeyContainer.OperatorSessionKeyPermissions
       * @static
       * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
       * @param {number} [l] Message length if known beforehand
       * @returns {License.KeyContainer.OperatorSessionKeyPermissions} OperatorSessionKeyPermissions
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      OperatorSessionKeyPermissions.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.License.KeyContainer.OperatorSessionKeyPermissions();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1: {
              m.allowEncrypt = r.bool();
              break;
            }
            case 2: {
              m.allowDecrypt = r.bool();
              break;
            }
            case 3: {
              m.allowSign = r.bool();
              break;
            }
            case 4: {
              m.allowSignatureVerify = r.bool();
              break;
            }
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };

      /**
       * Decodes an OperatorSessionKeyPermissions message from the specified reader or buffer, length delimited.
       * @function decodeDelimited
       * @memberof License.KeyContainer.OperatorSessionKeyPermissions
       * @static
       * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
       * @returns {License.KeyContainer.OperatorSessionKeyPermissions} OperatorSessionKeyPermissions
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      OperatorSessionKeyPermissions.decodeDelimited = function decodeDelimited(
        reader,
      ) {
        if (!(reader instanceof $Reader)) reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
      };

      /**
       * Creates an OperatorSessionKeyPermissions message from a plain object. Also converts values to their respective internal types.
       * @function fromObject
       * @memberof License.KeyContainer.OperatorSessionKeyPermissions
       * @static
       * @param {Object.<string,*>} d Plain object
       * @returns {License.KeyContainer.OperatorSessionKeyPermissions} OperatorSessionKeyPermissions
       */
      OperatorSessionKeyPermissions.fromObject = function fromObject(d) {
        if (
          d instanceof $root.License.KeyContainer.OperatorSessionKeyPermissions
        )
          return d;
        var m = new $root.License.KeyContainer.OperatorSessionKeyPermissions();
        if (d.allowEncrypt != null) {
          m.allowEncrypt = Boolean(d.allowEncrypt);
        }
        if (d.allowDecrypt != null) {
          m.allowDecrypt = Boolean(d.allowDecrypt);
        }
        if (d.allowSign != null) {
          m.allowSign = Boolean(d.allowSign);
        }
        if (d.allowSignatureVerify != null) {
          m.allowSignatureVerify = Boolean(d.allowSignatureVerify);
        }
        return m;
      };

      /**
       * Creates a plain object from an OperatorSessionKeyPermissions message. Also converts values to other types if specified.
       * @function toObject
       * @memberof License.KeyContainer.OperatorSessionKeyPermissions
       * @static
       * @param {License.KeyContainer.OperatorSessionKeyPermissions} m OperatorSessionKeyPermissions
       * @param {$protobuf.IConversionOptions} [o] Conversion options
       * @returns {Object.<string,*>} Plain object
       */
      OperatorSessionKeyPermissions.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          d.allowEncrypt = false;
          d.allowDecrypt = false;
          d.allowSign = false;
          d.allowSignatureVerify = false;
        }
        if (m.allowEncrypt != null && m.hasOwnProperty('allowEncrypt')) {
          d.allowEncrypt = m.allowEncrypt;
        }
        if (m.allowDecrypt != null && m.hasOwnProperty('allowDecrypt')) {
          d.allowDecrypt = m.allowDecrypt;
        }
        if (m.allowSign != null && m.hasOwnProperty('allowSign')) {
          d.allowSign = m.allowSign;
        }
        if (
          m.allowSignatureVerify != null &&
          m.hasOwnProperty('allowSignatureVerify')
        ) {
          d.allowSignatureVerify = m.allowSignatureVerify;
        }
        return d;
      };

      /**
       * Converts this OperatorSessionKeyPermissions to JSON.
       * @function toJSON
       * @memberof License.KeyContainer.OperatorSessionKeyPermissions
       * @instance
       * @returns {Object.<string,*>} JSON object
       */
      OperatorSessionKeyPermissions.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };

      /**
       * Gets the default type url for OperatorSessionKeyPermissions
       * @function getTypeUrl
       * @memberof License.KeyContainer.OperatorSessionKeyPermissions
       * @static
       * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns {string} The default type url
       */
      OperatorSessionKeyPermissions.getTypeUrl = function getTypeUrl(
        typeUrlPrefix,
      ) {
        if (typeUrlPrefix === undefined) {
          typeUrlPrefix = 'type.googleapis.com';
        }
        return (
          typeUrlPrefix + '/License.KeyContainer.OperatorSessionKeyPermissions'
        );
      };

      return OperatorSessionKeyPermissions;
    })();

    return KeyContainer;
  })();

  return License;
})());

/**
 * ProtocolVersion enum.
 * @exports ProtocolVersion
 * @enum {number}
 * @property {number} VERSION_2_0=20 VERSION_2_0 value
 * @property {number} VERSION_2_1=21 VERSION_2_1 value
 * @property {number} VERSION_2_2=22 VERSION_2_2 value
 */
export const ProtocolVersion = ($root.ProtocolVersion = (() => {
  const valuesById = {},
    values = Object.create(valuesById);
  values[(valuesById[20] = 'VERSION_2_0')] = 20;
  values[(valuesById[21] = 'VERSION_2_1')] = 21;
  values[(valuesById[22] = 'VERSION_2_2')] = 22;
  return values;
})());

export const LicenseRequest = ($root.LicenseRequest = (() => {
  /**
   * Properties of a LicenseRequest.
   * @exports ILicenseRequest
   * @interface ILicenseRequest
   * @property {IClientIdentification|null} [clientId] LicenseRequest clientId
   * @property {LicenseRequest.IContentIdentification|null} [contentId] LicenseRequest contentId
   * @property {LicenseRequest.RequestType|null} [type] LicenseRequest type
   * @property {number|Long|null} [requestTime] LicenseRequest requestTime
   * @property {Uint8Array|null} [keyControlNonceDeprecated] LicenseRequest keyControlNonceDeprecated
   * @property {ProtocolVersion|null} [protocolVersion] LicenseRequest protocolVersion
   * @property {number|null} [keyControlNonce] LicenseRequest keyControlNonce
   * @property {IEncryptedClientIdentification|null} [encryptedClientId] LicenseRequest encryptedClientId
   */

  /**
   * Constructs a new LicenseRequest.
   * @exports LicenseRequest
   * @classdesc Represents a LicenseRequest.
   * @implements ILicenseRequest
   * @constructor
   * @param {ILicenseRequest=} [p] Properties to set
   */
  function LicenseRequest(p) {
    if (p)
      for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
        if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
  }

  /**
   * LicenseRequest clientId.
   * @member {IClientIdentification|null|undefined} clientId
   * @memberof LicenseRequest
   * @instance
   */
  LicenseRequest.prototype.clientId = null;

  /**
   * LicenseRequest contentId.
   * @member {LicenseRequest.IContentIdentification|null|undefined} contentId
   * @memberof LicenseRequest
   * @instance
   */
  LicenseRequest.prototype.contentId = null;

  /**
   * LicenseRequest type.
   * @member {LicenseRequest.RequestType} type
   * @memberof LicenseRequest
   * @instance
   */
  LicenseRequest.prototype.type = 1;

  /**
   * LicenseRequest requestTime.
   * @member {number|Long} requestTime
   * @memberof LicenseRequest
   * @instance
   */
  LicenseRequest.prototype.requestTime = $util.Long
    ? $util.Long.fromBits(0, 0, false)
    : 0;

  /**
   * LicenseRequest keyControlNonceDeprecated.
   * @member {Uint8Array} keyControlNonceDeprecated
   * @memberof LicenseRequest
   * @instance
   */
  LicenseRequest.prototype.keyControlNonceDeprecated = $util.newBuffer([]);

  /**
   * LicenseRequest protocolVersion.
   * @member {ProtocolVersion} protocolVersion
   * @memberof LicenseRequest
   * @instance
   */
  LicenseRequest.prototype.protocolVersion = 20;

  /**
   * LicenseRequest keyControlNonce.
   * @member {number} keyControlNonce
   * @memberof LicenseRequest
   * @instance
   */
  LicenseRequest.prototype.keyControlNonce = 0;

  /**
   * LicenseRequest encryptedClientId.
   * @member {IEncryptedClientIdentification|null|undefined} encryptedClientId
   * @memberof LicenseRequest
   * @instance
   */
  LicenseRequest.prototype.encryptedClientId = null;

  /**
   * Creates a new LicenseRequest instance using the specified properties.
   * @function create
   * @memberof LicenseRequest
   * @static
   * @param {ILicenseRequest=} [properties] Properties to set
   * @returns {LicenseRequest} LicenseRequest instance
   */
  LicenseRequest.create = function create(properties) {
    return new LicenseRequest(properties);
  };

  /**
   * Encodes the specified LicenseRequest message. Does not implicitly {@link LicenseRequest.verify|verify} messages.
   * @function encode
   * @memberof LicenseRequest
   * @static
   * @param {ILicenseRequest} m LicenseRequest message or plain object to encode
   * @param {$protobuf.Writer} [w] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  LicenseRequest.encode = function encode(m, w) {
    if (!w) w = $Writer.create();
    if (m.clientId != null && Object.hasOwnProperty.call(m, 'clientId'))
      $root.ClientIdentification.encode(
        m.clientId,
        w.uint32(10).fork(),
      ).ldelim();
    if (m.contentId != null && Object.hasOwnProperty.call(m, 'contentId'))
      $root.LicenseRequest.ContentIdentification.encode(
        m.contentId,
        w.uint32(18).fork(),
      ).ldelim();
    if (m.type != null && Object.hasOwnProperty.call(m, 'type'))
      w.uint32(24).int32(m.type);
    if (m.requestTime != null && Object.hasOwnProperty.call(m, 'requestTime'))
      w.uint32(32).int64(m.requestTime);
    if (
      m.keyControlNonceDeprecated != null &&
      Object.hasOwnProperty.call(m, 'keyControlNonceDeprecated')
    )
      w.uint32(42).bytes(m.keyControlNonceDeprecated);
    if (
      m.protocolVersion != null &&
      Object.hasOwnProperty.call(m, 'protocolVersion')
    )
      w.uint32(48).int32(m.protocolVersion);
    if (
      m.keyControlNonce != null &&
      Object.hasOwnProperty.call(m, 'keyControlNonce')
    )
      w.uint32(56).uint32(m.keyControlNonce);
    if (
      m.encryptedClientId != null &&
      Object.hasOwnProperty.call(m, 'encryptedClientId')
    )
      $root.EncryptedClientIdentification.encode(
        m.encryptedClientId,
        w.uint32(66).fork(),
      ).ldelim();
    return w;
  };

  /**
   * Encodes the specified LicenseRequest message, length delimited. Does not implicitly {@link LicenseRequest.verify|verify} messages.
   * @function encodeDelimited
   * @memberof LicenseRequest
   * @static
   * @param {ILicenseRequest} message LicenseRequest message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  LicenseRequest.encodeDelimited = function encodeDelimited(message, writer) {
    return this.encode(message, writer).ldelim();
  };

  /**
   * Decodes a LicenseRequest message from the specified reader or buffer.
   * @function decode
   * @memberof LicenseRequest
   * @static
   * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
   * @param {number} [l] Message length if known beforehand
   * @returns {LicenseRequest} LicenseRequest
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  LicenseRequest.decode = function decode(r, l) {
    if (!(r instanceof $Reader)) r = $Reader.create(r);
    var c = l === undefined ? r.len : r.pos + l,
      m = new $root.LicenseRequest();
    while (r.pos < c) {
      var t = r.uint32();
      switch (t >>> 3) {
        case 1: {
          m.clientId = $root.ClientIdentification.decode(r, r.uint32());
          break;
        }
        case 2: {
          m.contentId = $root.LicenseRequest.ContentIdentification.decode(
            r,
            r.uint32(),
          );
          break;
        }
        case 3: {
          m.type = r.int32();
          break;
        }
        case 4: {
          m.requestTime = r.int64();
          break;
        }
        case 5: {
          m.keyControlNonceDeprecated = r.bytes();
          break;
        }
        case 6: {
          m.protocolVersion = r.int32();
          break;
        }
        case 7: {
          m.keyControlNonce = r.uint32();
          break;
        }
        case 8: {
          m.encryptedClientId = $root.EncryptedClientIdentification.decode(
            r,
            r.uint32(),
          );
          break;
        }
        default:
          r.skipType(t & 7);
          break;
      }
    }
    return m;
  };

  /**
   * Decodes a LicenseRequest message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof LicenseRequest
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {LicenseRequest} LicenseRequest
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  LicenseRequest.decodeDelimited = function decodeDelimited(reader) {
    if (!(reader instanceof $Reader)) reader = new $Reader(reader);
    return this.decode(reader, reader.uint32());
  };

  /**
   * Creates a LicenseRequest message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof LicenseRequest
   * @static
   * @param {Object.<string,*>} d Plain object
   * @returns {LicenseRequest} LicenseRequest
   */
  LicenseRequest.fromObject = function fromObject(d) {
    if (d instanceof $root.LicenseRequest) return d;
    var m = new $root.LicenseRequest();
    if (d.clientId != null) {
      if (typeof d.clientId !== 'object')
        throw TypeError('.LicenseRequest.clientId: object expected');
      m.clientId = $root.ClientIdentification.fromObject(d.clientId);
    }
    if (d.contentId != null) {
      if (typeof d.contentId !== 'object')
        throw TypeError('.LicenseRequest.contentId: object expected');
      m.contentId = $root.LicenseRequest.ContentIdentification.fromObject(
        d.contentId,
      );
    }
    switch (d.type) {
      default:
        if (typeof d.type === 'number') {
          m.type = d.type;
          break;
        }
        break;
      case 'NEW':
      case 1:
        m.type = 1;
        break;
      case 'RENEWAL':
      case 2:
        m.type = 2;
        break;
      case 'RELEASE':
      case 3:
        m.type = 3;
        break;
    }
    if (d.requestTime != null) {
      if ($util.Long)
        (m.requestTime = $util.Long.fromValue(d.requestTime)).unsigned = false;
      else if (typeof d.requestTime === 'string')
        m.requestTime = parseInt(d.requestTime, 10);
      else if (typeof d.requestTime === 'number') m.requestTime = d.requestTime;
      else if (typeof d.requestTime === 'object')
        m.requestTime = new $util.LongBits(
          d.requestTime.low >>> 0,
          d.requestTime.high >>> 0,
        ).toNumber();
    }
    if (d.keyControlNonceDeprecated != null) {
      if (typeof d.keyControlNonceDeprecated === 'string')
        $util.base64.decode(
          d.keyControlNonceDeprecated,
          (m.keyControlNonceDeprecated = $util.newBuffer(
            $util.base64.length(d.keyControlNonceDeprecated),
          )),
          0,
        );
      else if (d.keyControlNonceDeprecated.length >= 0)
        m.keyControlNonceDeprecated = d.keyControlNonceDeprecated;
    }
    switch (d.protocolVersion) {
      default:
        if (typeof d.protocolVersion === 'number') {
          m.protocolVersion = d.protocolVersion;
          break;
        }
        break;
      case 'VERSION_2_0':
      case 20:
        m.protocolVersion = 20;
        break;
      case 'VERSION_2_1':
      case 21:
        m.protocolVersion = 21;
        break;
      case 'VERSION_2_2':
      case 22:
        m.protocolVersion = 22;
        break;
    }
    if (d.keyControlNonce != null) {
      m.keyControlNonce = d.keyControlNonce >>> 0;
    }
    if (d.encryptedClientId != null) {
      if (typeof d.encryptedClientId !== 'object')
        throw TypeError('.LicenseRequest.encryptedClientId: object expected');
      m.encryptedClientId = $root.EncryptedClientIdentification.fromObject(
        d.encryptedClientId,
      );
    }
    return m;
  };

  /**
   * Creates a plain object from a LicenseRequest message. Also converts values to other types if specified.
   * @function toObject
   * @memberof LicenseRequest
   * @static
   * @param {LicenseRequest} m LicenseRequest
   * @param {$protobuf.IConversionOptions} [o] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  LicenseRequest.toObject = function toObject(m, o) {
    if (!o) o = {};
    var d = {};
    if (o.defaults) {
      d.clientId = null;
      d.contentId = null;
      d.type = o.enums === String ? 'NEW' : 1;
      if ($util.Long) {
        var n = new $util.Long(0, 0, false);
        d.requestTime =
          o.longs === String
            ? n.toString()
            : o.longs === Number
              ? n.toNumber()
              : n;
      } else d.requestTime = o.longs === String ? '0' : 0;
      if (o.bytes === String) d.keyControlNonceDeprecated = '';
      else {
        d.keyControlNonceDeprecated = [];
        if (o.bytes !== Array)
          d.keyControlNonceDeprecated = $util.newBuffer(
            d.keyControlNonceDeprecated,
          );
      }
      d.protocolVersion = o.enums === String ? 'VERSION_2_0' : 20;
      d.keyControlNonce = 0;
      d.encryptedClientId = null;
    }
    if (m.clientId != null && m.hasOwnProperty('clientId')) {
      d.clientId = $root.ClientIdentification.toObject(m.clientId, o);
    }
    if (m.contentId != null && m.hasOwnProperty('contentId')) {
      d.contentId = $root.LicenseRequest.ContentIdentification.toObject(
        m.contentId,
        o,
      );
    }
    if (m.type != null && m.hasOwnProperty('type')) {
      d.type =
        o.enums === String
          ? $root.LicenseRequest.RequestType[m.type] === undefined
            ? m.type
            : $root.LicenseRequest.RequestType[m.type]
          : m.type;
    }
    if (m.requestTime != null && m.hasOwnProperty('requestTime')) {
      if (typeof m.requestTime === 'number')
        d.requestTime =
          o.longs === String ? String(m.requestTime) : m.requestTime;
      else
        d.requestTime =
          o.longs === String
            ? $util.Long.prototype.toString.call(m.requestTime)
            : o.longs === Number
              ? new $util.LongBits(
                  m.requestTime.low >>> 0,
                  m.requestTime.high >>> 0,
                ).toNumber()
              : m.requestTime;
    }
    if (
      m.keyControlNonceDeprecated != null &&
      m.hasOwnProperty('keyControlNonceDeprecated')
    ) {
      d.keyControlNonceDeprecated =
        o.bytes === String
          ? $util.base64.encode(
              m.keyControlNonceDeprecated,
              0,
              m.keyControlNonceDeprecated.length,
            )
          : o.bytes === Array
            ? Array.prototype.slice.call(m.keyControlNonceDeprecated)
            : m.keyControlNonceDeprecated;
    }
    if (m.protocolVersion != null && m.hasOwnProperty('protocolVersion')) {
      d.protocolVersion =
        o.enums === String
          ? $root.ProtocolVersion[m.protocolVersion] === undefined
            ? m.protocolVersion
            : $root.ProtocolVersion[m.protocolVersion]
          : m.protocolVersion;
    }
    if (m.keyControlNonce != null && m.hasOwnProperty('keyControlNonce')) {
      d.keyControlNonce = m.keyControlNonce;
    }
    if (m.encryptedClientId != null && m.hasOwnProperty('encryptedClientId')) {
      d.encryptedClientId = $root.EncryptedClientIdentification.toObject(
        m.encryptedClientId,
        o,
      );
    }
    return d;
  };

  /**
   * Converts this LicenseRequest to JSON.
   * @function toJSON
   * @memberof LicenseRequest
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  LicenseRequest.prototype.toJSON = function toJSON() {
    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
  };

  /**
   * Gets the default type url for LicenseRequest
   * @function getTypeUrl
   * @memberof LicenseRequest
   * @static
   * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns {string} The default type url
   */
  LicenseRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
    if (typeUrlPrefix === undefined) {
      typeUrlPrefix = 'type.googleapis.com';
    }
    return typeUrlPrefix + '/LicenseRequest';
  };

  LicenseRequest.ContentIdentification = (function () {
    /**
     * Properties of a ContentIdentification.
     * @memberof LicenseRequest
     * @interface IContentIdentification
     * @property {LicenseRequest.ContentIdentification.IWidevinePsshData|null} [widevinePsshData] ContentIdentification widevinePsshData
     * @property {LicenseRequest.ContentIdentification.IWebmKeyId|null} [webmKeyId] ContentIdentification webmKeyId
     * @property {LicenseRequest.ContentIdentification.IExistingLicense|null} [existingLicense] ContentIdentification existingLicense
     * @property {LicenseRequest.ContentIdentification.IInitData|null} [initData] ContentIdentification initData
     */

    /**
     * Constructs a new ContentIdentification.
     * @memberof LicenseRequest
     * @classdesc Represents a ContentIdentification.
     * @implements IContentIdentification
     * @constructor
     * @param {LicenseRequest.IContentIdentification=} [p] Properties to set
     */
    function ContentIdentification(p) {
      if (p)
        for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
          if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
    }

    /**
     * ContentIdentification widevinePsshData.
     * @member {LicenseRequest.ContentIdentification.IWidevinePsshData|null|undefined} widevinePsshData
     * @memberof LicenseRequest.ContentIdentification
     * @instance
     */
    ContentIdentification.prototype.widevinePsshData = null;

    /**
     * ContentIdentification webmKeyId.
     * @member {LicenseRequest.ContentIdentification.IWebmKeyId|null|undefined} webmKeyId
     * @memberof LicenseRequest.ContentIdentification
     * @instance
     */
    ContentIdentification.prototype.webmKeyId = null;

    /**
     * ContentIdentification existingLicense.
     * @member {LicenseRequest.ContentIdentification.IExistingLicense|null|undefined} existingLicense
     * @memberof LicenseRequest.ContentIdentification
     * @instance
     */
    ContentIdentification.prototype.existingLicense = null;

    /**
     * ContentIdentification initData.
     * @member {LicenseRequest.ContentIdentification.IInitData|null|undefined} initData
     * @memberof LicenseRequest.ContentIdentification
     * @instance
     */
    ContentIdentification.prototype.initData = null;

    // OneOf field names bound to virtual getters and setters
    let $oneOfFields;

    /**
     * ContentIdentification contentIdVariant.
     * @member {"widevinePsshData"|"webmKeyId"|"existingLicense"|"initData"|undefined} contentIdVariant
     * @memberof LicenseRequest.ContentIdentification
     * @instance
     */
    Object.defineProperty(ContentIdentification.prototype, 'contentIdVariant', {
      get: $util.oneOfGetter(
        ($oneOfFields = [
          'widevinePsshData',
          'webmKeyId',
          'existingLicense',
          'initData',
        ]),
      ),
      set: $util.oneOfSetter($oneOfFields),
    });

    /**
     * Creates a new ContentIdentification instance using the specified properties.
     * @function create
     * @memberof LicenseRequest.ContentIdentification
     * @static
     * @param {LicenseRequest.IContentIdentification=} [properties] Properties to set
     * @returns {LicenseRequest.ContentIdentification} ContentIdentification instance
     */
    ContentIdentification.create = function create(properties) {
      return new ContentIdentification(properties);
    };

    /**
     * Encodes the specified ContentIdentification message. Does not implicitly {@link LicenseRequest.ContentIdentification.verify|verify} messages.
     * @function encode
     * @memberof LicenseRequest.ContentIdentification
     * @static
     * @param {LicenseRequest.IContentIdentification} m ContentIdentification message or plain object to encode
     * @param {$protobuf.Writer} [w] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ContentIdentification.encode = function encode(m, w) {
      if (!w) w = $Writer.create();
      if (
        m.widevinePsshData != null &&
        Object.hasOwnProperty.call(m, 'widevinePsshData')
      )
        $root.LicenseRequest.ContentIdentification.WidevinePsshData.encode(
          m.widevinePsshData,
          w.uint32(10).fork(),
        ).ldelim();
      if (m.webmKeyId != null && Object.hasOwnProperty.call(m, 'webmKeyId'))
        $root.LicenseRequest.ContentIdentification.WebmKeyId.encode(
          m.webmKeyId,
          w.uint32(18).fork(),
        ).ldelim();
      if (
        m.existingLicense != null &&
        Object.hasOwnProperty.call(m, 'existingLicense')
      )
        $root.LicenseRequest.ContentIdentification.ExistingLicense.encode(
          m.existingLicense,
          w.uint32(26).fork(),
        ).ldelim();
      if (m.initData != null && Object.hasOwnProperty.call(m, 'initData'))
        $root.LicenseRequest.ContentIdentification.InitData.encode(
          m.initData,
          w.uint32(34).fork(),
        ).ldelim();
      return w;
    };

    /**
     * Encodes the specified ContentIdentification message, length delimited. Does not implicitly {@link LicenseRequest.ContentIdentification.verify|verify} messages.
     * @function encodeDelimited
     * @memberof LicenseRequest.ContentIdentification
     * @static
     * @param {LicenseRequest.IContentIdentification} message ContentIdentification message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ContentIdentification.encodeDelimited = function encodeDelimited(
      message,
      writer,
    ) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a ContentIdentification message from the specified reader or buffer.
     * @function decode
     * @memberof LicenseRequest.ContentIdentification
     * @static
     * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
     * @param {number} [l] Message length if known beforehand
     * @returns {LicenseRequest.ContentIdentification} ContentIdentification
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ContentIdentification.decode = function decode(r, l) {
      if (!(r instanceof $Reader)) r = $Reader.create(r);
      var c = l === undefined ? r.len : r.pos + l,
        m = new $root.LicenseRequest.ContentIdentification();
      while (r.pos < c) {
        var t = r.uint32();
        switch (t >>> 3) {
          case 1: {
            m.widevinePsshData =
              $root.LicenseRequest.ContentIdentification.WidevinePsshData.decode(
                r,
                r.uint32(),
              );
            break;
          }
          case 2: {
            m.webmKeyId =
              $root.LicenseRequest.ContentIdentification.WebmKeyId.decode(
                r,
                r.uint32(),
              );
            break;
          }
          case 3: {
            m.existingLicense =
              $root.LicenseRequest.ContentIdentification.ExistingLicense.decode(
                r,
                r.uint32(),
              );
            break;
          }
          case 4: {
            m.initData =
              $root.LicenseRequest.ContentIdentification.InitData.decode(
                r,
                r.uint32(),
              );
            break;
          }
          default:
            r.skipType(t & 7);
            break;
        }
      }
      return m;
    };

    /**
     * Decodes a ContentIdentification message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof LicenseRequest.ContentIdentification
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {LicenseRequest.ContentIdentification} ContentIdentification
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ContentIdentification.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Creates a ContentIdentification message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof LicenseRequest.ContentIdentification
     * @static
     * @param {Object.<string,*>} d Plain object
     * @returns {LicenseRequest.ContentIdentification} ContentIdentification
     */
    ContentIdentification.fromObject = function fromObject(d) {
      if (d instanceof $root.LicenseRequest.ContentIdentification) return d;
      var m = new $root.LicenseRequest.ContentIdentification();
      if (d.widevinePsshData != null) {
        if (typeof d.widevinePsshData !== 'object')
          throw TypeError(
            '.LicenseRequest.ContentIdentification.widevinePsshData: object expected',
          );
        m.widevinePsshData =
          $root.LicenseRequest.ContentIdentification.WidevinePsshData.fromObject(
            d.widevinePsshData,
          );
      }
      if (d.webmKeyId != null) {
        if (typeof d.webmKeyId !== 'object')
          throw TypeError(
            '.LicenseRequest.ContentIdentification.webmKeyId: object expected',
          );
        m.webmKeyId =
          $root.LicenseRequest.ContentIdentification.WebmKeyId.fromObject(
            d.webmKeyId,
          );
      }
      if (d.existingLicense != null) {
        if (typeof d.existingLicense !== 'object')
          throw TypeError(
            '.LicenseRequest.ContentIdentification.existingLicense: object expected',
          );
        m.existingLicense =
          $root.LicenseRequest.ContentIdentification.ExistingLicense.fromObject(
            d.existingLicense,
          );
      }
      if (d.initData != null) {
        if (typeof d.initData !== 'object')
          throw TypeError(
            '.LicenseRequest.ContentIdentification.initData: object expected',
          );
        m.initData =
          $root.LicenseRequest.ContentIdentification.InitData.fromObject(
            d.initData,
          );
      }
      return m;
    };

    /**
     * Creates a plain object from a ContentIdentification message. Also converts values to other types if specified.
     * @function toObject
     * @memberof LicenseRequest.ContentIdentification
     * @static
     * @param {LicenseRequest.ContentIdentification} m ContentIdentification
     * @param {$protobuf.IConversionOptions} [o] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    ContentIdentification.toObject = function toObject(m, o) {
      if (!o) o = {};
      var d = {};
      if (m.widevinePsshData != null && m.hasOwnProperty('widevinePsshData')) {
        d.widevinePsshData =
          $root.LicenseRequest.ContentIdentification.WidevinePsshData.toObject(
            m.widevinePsshData,
            o,
          );
        if (o.oneofs) d.contentIdVariant = 'widevinePsshData';
      }
      if (m.webmKeyId != null && m.hasOwnProperty('webmKeyId')) {
        d.webmKeyId =
          $root.LicenseRequest.ContentIdentification.WebmKeyId.toObject(
            m.webmKeyId,
            o,
          );
        if (o.oneofs) d.contentIdVariant = 'webmKeyId';
      }
      if (m.existingLicense != null && m.hasOwnProperty('existingLicense')) {
        d.existingLicense =
          $root.LicenseRequest.ContentIdentification.ExistingLicense.toObject(
            m.existingLicense,
            o,
          );
        if (o.oneofs) d.contentIdVariant = 'existingLicense';
      }
      if (m.initData != null && m.hasOwnProperty('initData')) {
        d.initData =
          $root.LicenseRequest.ContentIdentification.InitData.toObject(
            m.initData,
            o,
          );
        if (o.oneofs) d.contentIdVariant = 'initData';
      }
      return d;
    };

    /**
     * Converts this ContentIdentification to JSON.
     * @function toJSON
     * @memberof LicenseRequest.ContentIdentification
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    ContentIdentification.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for ContentIdentification
     * @function getTypeUrl
     * @memberof LicenseRequest.ContentIdentification
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    ContentIdentification.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = 'type.googleapis.com';
      }
      return typeUrlPrefix + '/LicenseRequest.ContentIdentification';
    };

    ContentIdentification.WidevinePsshData = (function () {
      /**
       * Properties of a WidevinePsshData.
       * @memberof LicenseRequest.ContentIdentification
       * @interface IWidevinePsshData
       * @property {Array.<Uint8Array>|null} [psshData] WidevinePsshData psshData
       * @property {LicenseType|null} [licenseType] WidevinePsshData licenseType
       * @property {Uint8Array|null} [requestId] WidevinePsshData requestId
       */

      /**
       * Constructs a new WidevinePsshData.
       * @memberof LicenseRequest.ContentIdentification
       * @classdesc Represents a WidevinePsshData.
       * @implements IWidevinePsshData
       * @constructor
       * @param {LicenseRequest.ContentIdentification.IWidevinePsshData=} [p] Properties to set
       */
      function WidevinePsshData(p) {
        this.psshData = [];
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }

      /**
       * WidevinePsshData psshData.
       * @member {Array.<Uint8Array>} psshData
       * @memberof LicenseRequest.ContentIdentification.WidevinePsshData
       * @instance
       */
      WidevinePsshData.prototype.psshData = $util.emptyArray;

      /**
       * WidevinePsshData licenseType.
       * @member {LicenseType} licenseType
       * @memberof LicenseRequest.ContentIdentification.WidevinePsshData
       * @instance
       */
      WidevinePsshData.prototype.licenseType = 1;

      /**
       * WidevinePsshData requestId.
       * @member {Uint8Array} requestId
       * @memberof LicenseRequest.ContentIdentification.WidevinePsshData
       * @instance
       */
      WidevinePsshData.prototype.requestId = $util.newBuffer([]);

      /**
       * Creates a new WidevinePsshData instance using the specified properties.
       * @function create
       * @memberof LicenseRequest.ContentIdentification.WidevinePsshData
       * @static
       * @param {LicenseRequest.ContentIdentification.IWidevinePsshData=} [properties] Properties to set
       * @returns {LicenseRequest.ContentIdentification.WidevinePsshData} WidevinePsshData instance
       */
      WidevinePsshData.create = function create(properties) {
        return new WidevinePsshData(properties);
      };

      /**
       * Encodes the specified WidevinePsshData message. Does not implicitly {@link LicenseRequest.ContentIdentification.WidevinePsshData.verify|verify} messages.
       * @function encode
       * @memberof LicenseRequest.ContentIdentification.WidevinePsshData
       * @static
       * @param {LicenseRequest.ContentIdentification.IWidevinePsshData} m WidevinePsshData message or plain object to encode
       * @param {$protobuf.Writer} [w] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */
      WidevinePsshData.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.psshData != null && m.psshData.length) {
          for (var i = 0; i < m.psshData.length; ++i)
            w.uint32(10).bytes(m.psshData[i]);
        }
        if (
          m.licenseType != null &&
          Object.hasOwnProperty.call(m, 'licenseType')
        )
          w.uint32(16).int32(m.licenseType);
        if (m.requestId != null && Object.hasOwnProperty.call(m, 'requestId'))
          w.uint32(26).bytes(m.requestId);
        return w;
      };

      /**
       * Encodes the specified WidevinePsshData message, length delimited. Does not implicitly {@link LicenseRequest.ContentIdentification.WidevinePsshData.verify|verify} messages.
       * @function encodeDelimited
       * @memberof LicenseRequest.ContentIdentification.WidevinePsshData
       * @static
       * @param {LicenseRequest.ContentIdentification.IWidevinePsshData} message WidevinePsshData message or plain object to encode
       * @param {$protobuf.Writer} [writer] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */
      WidevinePsshData.encodeDelimited = function encodeDelimited(
        message,
        writer,
      ) {
        return this.encode(message, writer).ldelim();
      };

      /**
       * Decodes a WidevinePsshData message from the specified reader or buffer.
       * @function decode
       * @memberof LicenseRequest.ContentIdentification.WidevinePsshData
       * @static
       * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
       * @param {number} [l] Message length if known beforehand
       * @returns {LicenseRequest.ContentIdentification.WidevinePsshData} WidevinePsshData
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      WidevinePsshData.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.LicenseRequest.ContentIdentification.WidevinePsshData();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1: {
              if (!(m.psshData && m.psshData.length)) m.psshData = [];
              m.psshData.push(r.bytes());
              break;
            }
            case 2: {
              m.licenseType = r.int32();
              break;
            }
            case 3: {
              m.requestId = r.bytes();
              break;
            }
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };

      /**
       * Decodes a WidevinePsshData message from the specified reader or buffer, length delimited.
       * @function decodeDelimited
       * @memberof LicenseRequest.ContentIdentification.WidevinePsshData
       * @static
       * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
       * @returns {LicenseRequest.ContentIdentification.WidevinePsshData} WidevinePsshData
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      WidevinePsshData.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader)) reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
      };

      /**
       * Creates a WidevinePsshData message from a plain object. Also converts values to their respective internal types.
       * @function fromObject
       * @memberof LicenseRequest.ContentIdentification.WidevinePsshData
       * @static
       * @param {Object.<string,*>} d Plain object
       * @returns {LicenseRequest.ContentIdentification.WidevinePsshData} WidevinePsshData
       */
      WidevinePsshData.fromObject = function fromObject(d) {
        if (
          d instanceof
          $root.LicenseRequest.ContentIdentification.WidevinePsshData
        )
          return d;
        var m =
          new $root.LicenseRequest.ContentIdentification.WidevinePsshData();
        if (d.psshData) {
          if (!Array.isArray(d.psshData))
            throw TypeError(
              '.LicenseRequest.ContentIdentification.WidevinePsshData.psshData: array expected',
            );
          m.psshData = [];
          for (var i = 0; i < d.psshData.length; ++i) {
            if (typeof d.psshData[i] === 'string')
              $util.base64.decode(
                d.psshData[i],
                (m.psshData[i] = $util.newBuffer(
                  $util.base64.length(d.psshData[i]),
                )),
                0,
              );
            else if (d.psshData[i].length >= 0) m.psshData[i] = d.psshData[i];
          }
        }
        switch (d.licenseType) {
          default:
            if (typeof d.licenseType === 'number') {
              m.licenseType = d.licenseType;
              break;
            }
            break;
          case 'STREAMING':
          case 1:
            m.licenseType = 1;
            break;
          case 'OFFLINE':
          case 2:
            m.licenseType = 2;
            break;
          case 'AUTOMATIC':
          case 3:
            m.licenseType = 3;
            break;
        }
        if (d.requestId != null) {
          if (typeof d.requestId === 'string')
            $util.base64.decode(
              d.requestId,
              (m.requestId = $util.newBuffer($util.base64.length(d.requestId))),
              0,
            );
          else if (d.requestId.length >= 0) m.requestId = d.requestId;
        }
        return m;
      };

      /**
       * Creates a plain object from a WidevinePsshData message. Also converts values to other types if specified.
       * @function toObject
       * @memberof LicenseRequest.ContentIdentification.WidevinePsshData
       * @static
       * @param {LicenseRequest.ContentIdentification.WidevinePsshData} m WidevinePsshData
       * @param {$protobuf.IConversionOptions} [o] Conversion options
       * @returns {Object.<string,*>} Plain object
       */
      WidevinePsshData.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.arrays || o.defaults) {
          d.psshData = [];
        }
        if (o.defaults) {
          d.licenseType = o.enums === String ? 'STREAMING' : 1;
          if (o.bytes === String) d.requestId = '';
          else {
            d.requestId = [];
            if (o.bytes !== Array) d.requestId = $util.newBuffer(d.requestId);
          }
        }
        if (m.psshData && m.psshData.length) {
          d.psshData = [];
          for (var j = 0; j < m.psshData.length; ++j) {
            d.psshData[j] =
              o.bytes === String
                ? $util.base64.encode(m.psshData[j], 0, m.psshData[j].length)
                : o.bytes === Array
                  ? Array.prototype.slice.call(m.psshData[j])
                  : m.psshData[j];
          }
        }
        if (m.licenseType != null && m.hasOwnProperty('licenseType')) {
          d.licenseType =
            o.enums === String
              ? $root.LicenseType[m.licenseType] === undefined
                ? m.licenseType
                : $root.LicenseType[m.licenseType]
              : m.licenseType;
        }
        if (m.requestId != null && m.hasOwnProperty('requestId')) {
          d.requestId =
            o.bytes === String
              ? $util.base64.encode(m.requestId, 0, m.requestId.length)
              : o.bytes === Array
                ? Array.prototype.slice.call(m.requestId)
                : m.requestId;
        }
        return d;
      };

      /**
       * Converts this WidevinePsshData to JSON.
       * @function toJSON
       * @memberof LicenseRequest.ContentIdentification.WidevinePsshData
       * @instance
       * @returns {Object.<string,*>} JSON object
       */
      WidevinePsshData.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };

      /**
       * Gets the default type url for WidevinePsshData
       * @function getTypeUrl
       * @memberof LicenseRequest.ContentIdentification.WidevinePsshData
       * @static
       * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns {string} The default type url
       */
      WidevinePsshData.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
          typeUrlPrefix = 'type.googleapis.com';
        }
        return (
          typeUrlPrefix +
          '/LicenseRequest.ContentIdentification.WidevinePsshData'
        );
      };

      return WidevinePsshData;
    })();

    ContentIdentification.WebmKeyId = (function () {
      /**
       * Properties of a WebmKeyId.
       * @memberof LicenseRequest.ContentIdentification
       * @interface IWebmKeyId
       * @property {Uint8Array|null} [header] WebmKeyId header
       * @property {LicenseType|null} [licenseType] WebmKeyId licenseType
       * @property {Uint8Array|null} [requestId] WebmKeyId requestId
       */

      /**
       * Constructs a new WebmKeyId.
       * @memberof LicenseRequest.ContentIdentification
       * @classdesc Represents a WebmKeyId.
       * @implements IWebmKeyId
       * @constructor
       * @param {LicenseRequest.ContentIdentification.IWebmKeyId=} [p] Properties to set
       */
      function WebmKeyId(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }

      /**
       * WebmKeyId header.
       * @member {Uint8Array} header
       * @memberof LicenseRequest.ContentIdentification.WebmKeyId
       * @instance
       */
      WebmKeyId.prototype.header = $util.newBuffer([]);

      /**
       * WebmKeyId licenseType.
       * @member {LicenseType} licenseType
       * @memberof LicenseRequest.ContentIdentification.WebmKeyId
       * @instance
       */
      WebmKeyId.prototype.licenseType = 1;

      /**
       * WebmKeyId requestId.
       * @member {Uint8Array} requestId
       * @memberof LicenseRequest.ContentIdentification.WebmKeyId
       * @instance
       */
      WebmKeyId.prototype.requestId = $util.newBuffer([]);

      /**
       * Creates a new WebmKeyId instance using the specified properties.
       * @function create
       * @memberof LicenseRequest.ContentIdentification.WebmKeyId
       * @static
       * @param {LicenseRequest.ContentIdentification.IWebmKeyId=} [properties] Properties to set
       * @returns {LicenseRequest.ContentIdentification.WebmKeyId} WebmKeyId instance
       */
      WebmKeyId.create = function create(properties) {
        return new WebmKeyId(properties);
      };

      /**
       * Encodes the specified WebmKeyId message. Does not implicitly {@link LicenseRequest.ContentIdentification.WebmKeyId.verify|verify} messages.
       * @function encode
       * @memberof LicenseRequest.ContentIdentification.WebmKeyId
       * @static
       * @param {LicenseRequest.ContentIdentification.IWebmKeyId} m WebmKeyId message or plain object to encode
       * @param {$protobuf.Writer} [w] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */
      WebmKeyId.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.header != null && Object.hasOwnProperty.call(m, 'header'))
          w.uint32(10).bytes(m.header);
        if (
          m.licenseType != null &&
          Object.hasOwnProperty.call(m, 'licenseType')
        )
          w.uint32(16).int32(m.licenseType);
        if (m.requestId != null && Object.hasOwnProperty.call(m, 'requestId'))
          w.uint32(26).bytes(m.requestId);
        return w;
      };

      /**
       * Encodes the specified WebmKeyId message, length delimited. Does not implicitly {@link LicenseRequest.ContentIdentification.WebmKeyId.verify|verify} messages.
       * @function encodeDelimited
       * @memberof LicenseRequest.ContentIdentification.WebmKeyId
       * @static
       * @param {LicenseRequest.ContentIdentification.IWebmKeyId} message WebmKeyId message or plain object to encode
       * @param {$protobuf.Writer} [writer] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */
      WebmKeyId.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
      };

      /**
       * Decodes a WebmKeyId message from the specified reader or buffer.
       * @function decode
       * @memberof LicenseRequest.ContentIdentification.WebmKeyId
       * @static
       * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
       * @param {number} [l] Message length if known beforehand
       * @returns {LicenseRequest.ContentIdentification.WebmKeyId} WebmKeyId
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      WebmKeyId.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.LicenseRequest.ContentIdentification.WebmKeyId();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1: {
              m.header = r.bytes();
              break;
            }
            case 2: {
              m.licenseType = r.int32();
              break;
            }
            case 3: {
              m.requestId = r.bytes();
              break;
            }
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };

      /**
       * Decodes a WebmKeyId message from the specified reader or buffer, length delimited.
       * @function decodeDelimited
       * @memberof LicenseRequest.ContentIdentification.WebmKeyId
       * @static
       * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
       * @returns {LicenseRequest.ContentIdentification.WebmKeyId} WebmKeyId
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      WebmKeyId.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader)) reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
      };

      /**
       * Creates a WebmKeyId message from a plain object. Also converts values to their respective internal types.
       * @function fromObject
       * @memberof LicenseRequest.ContentIdentification.WebmKeyId
       * @static
       * @param {Object.<string,*>} d Plain object
       * @returns {LicenseRequest.ContentIdentification.WebmKeyId} WebmKeyId
       */
      WebmKeyId.fromObject = function fromObject(d) {
        if (d instanceof $root.LicenseRequest.ContentIdentification.WebmKeyId)
          return d;
        var m = new $root.LicenseRequest.ContentIdentification.WebmKeyId();
        if (d.header != null) {
          if (typeof d.header === 'string')
            $util.base64.decode(
              d.header,
              (m.header = $util.newBuffer($util.base64.length(d.header))),
              0,
            );
          else if (d.header.length >= 0) m.header = d.header;
        }
        switch (d.licenseType) {
          default:
            if (typeof d.licenseType === 'number') {
              m.licenseType = d.licenseType;
              break;
            }
            break;
          case 'STREAMING':
          case 1:
            m.licenseType = 1;
            break;
          case 'OFFLINE':
          case 2:
            m.licenseType = 2;
            break;
          case 'AUTOMATIC':
          case 3:
            m.licenseType = 3;
            break;
        }
        if (d.requestId != null) {
          if (typeof d.requestId === 'string')
            $util.base64.decode(
              d.requestId,
              (m.requestId = $util.newBuffer($util.base64.length(d.requestId))),
              0,
            );
          else if (d.requestId.length >= 0) m.requestId = d.requestId;
        }
        return m;
      };

      /**
       * Creates a plain object from a WebmKeyId message. Also converts values to other types if specified.
       * @function toObject
       * @memberof LicenseRequest.ContentIdentification.WebmKeyId
       * @static
       * @param {LicenseRequest.ContentIdentification.WebmKeyId} m WebmKeyId
       * @param {$protobuf.IConversionOptions} [o] Conversion options
       * @returns {Object.<string,*>} Plain object
       */
      WebmKeyId.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          if (o.bytes === String) d.header = '';
          else {
            d.header = [];
            if (o.bytes !== Array) d.header = $util.newBuffer(d.header);
          }
          d.licenseType = o.enums === String ? 'STREAMING' : 1;
          if (o.bytes === String) d.requestId = '';
          else {
            d.requestId = [];
            if (o.bytes !== Array) d.requestId = $util.newBuffer(d.requestId);
          }
        }
        if (m.header != null && m.hasOwnProperty('header')) {
          d.header =
            o.bytes === String
              ? $util.base64.encode(m.header, 0, m.header.length)
              : o.bytes === Array
                ? Array.prototype.slice.call(m.header)
                : m.header;
        }
        if (m.licenseType != null && m.hasOwnProperty('licenseType')) {
          d.licenseType =
            o.enums === String
              ? $root.LicenseType[m.licenseType] === undefined
                ? m.licenseType
                : $root.LicenseType[m.licenseType]
              : m.licenseType;
        }
        if (m.requestId != null && m.hasOwnProperty('requestId')) {
          d.requestId =
            o.bytes === String
              ? $util.base64.encode(m.requestId, 0, m.requestId.length)
              : o.bytes === Array
                ? Array.prototype.slice.call(m.requestId)
                : m.requestId;
        }
        return d;
      };

      /**
       * Converts this WebmKeyId to JSON.
       * @function toJSON
       * @memberof LicenseRequest.ContentIdentification.WebmKeyId
       * @instance
       * @returns {Object.<string,*>} JSON object
       */
      WebmKeyId.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };

      /**
       * Gets the default type url for WebmKeyId
       * @function getTypeUrl
       * @memberof LicenseRequest.ContentIdentification.WebmKeyId
       * @static
       * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns {string} The default type url
       */
      WebmKeyId.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
          typeUrlPrefix = 'type.googleapis.com';
        }
        return (
          typeUrlPrefix + '/LicenseRequest.ContentIdentification.WebmKeyId'
        );
      };

      return WebmKeyId;
    })();

    ContentIdentification.ExistingLicense = (function () {
      /**
       * Properties of an ExistingLicense.
       * @memberof LicenseRequest.ContentIdentification
       * @interface IExistingLicense
       * @property {ILicenseIdentification|null} [licenseId] ExistingLicense licenseId
       * @property {number|Long|null} [secondsSinceStarted] ExistingLicense secondsSinceStarted
       * @property {number|Long|null} [secondsSinceLastPlayed] ExistingLicense secondsSinceLastPlayed
       * @property {Uint8Array|null} [sessionUsageTableEntry] ExistingLicense sessionUsageTableEntry
       */

      /**
       * Constructs a new ExistingLicense.
       * @memberof LicenseRequest.ContentIdentification
       * @classdesc Represents an ExistingLicense.
       * @implements IExistingLicense
       * @constructor
       * @param {LicenseRequest.ContentIdentification.IExistingLicense=} [p] Properties to set
       */
      function ExistingLicense(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }

      /**
       * ExistingLicense licenseId.
       * @member {ILicenseIdentification|null|undefined} licenseId
       * @memberof LicenseRequest.ContentIdentification.ExistingLicense
       * @instance
       */
      ExistingLicense.prototype.licenseId = null;

      /**
       * ExistingLicense secondsSinceStarted.
       * @member {number|Long} secondsSinceStarted
       * @memberof LicenseRequest.ContentIdentification.ExistingLicense
       * @instance
       */
      ExistingLicense.prototype.secondsSinceStarted = $util.Long
        ? $util.Long.fromBits(0, 0, false)
        : 0;

      /**
       * ExistingLicense secondsSinceLastPlayed.
       * @member {number|Long} secondsSinceLastPlayed
       * @memberof LicenseRequest.ContentIdentification.ExistingLicense
       * @instance
       */
      ExistingLicense.prototype.secondsSinceLastPlayed = $util.Long
        ? $util.Long.fromBits(0, 0, false)
        : 0;

      /**
       * ExistingLicense sessionUsageTableEntry.
       * @member {Uint8Array} sessionUsageTableEntry
       * @memberof LicenseRequest.ContentIdentification.ExistingLicense
       * @instance
       */
      ExistingLicense.prototype.sessionUsageTableEntry = $util.newBuffer([]);

      /**
       * Creates a new ExistingLicense instance using the specified properties.
       * @function create
       * @memberof LicenseRequest.ContentIdentification.ExistingLicense
       * @static
       * @param {LicenseRequest.ContentIdentification.IExistingLicense=} [properties] Properties to set
       * @returns {LicenseRequest.ContentIdentification.ExistingLicense} ExistingLicense instance
       */
      ExistingLicense.create = function create(properties) {
        return new ExistingLicense(properties);
      };

      /**
       * Encodes the specified ExistingLicense message. Does not implicitly {@link LicenseRequest.ContentIdentification.ExistingLicense.verify|verify} messages.
       * @function encode
       * @memberof LicenseRequest.ContentIdentification.ExistingLicense
       * @static
       * @param {LicenseRequest.ContentIdentification.IExistingLicense} m ExistingLicense message or plain object to encode
       * @param {$protobuf.Writer} [w] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */
      ExistingLicense.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.licenseId != null && Object.hasOwnProperty.call(m, 'licenseId'))
          $root.LicenseIdentification.encode(
            m.licenseId,
            w.uint32(10).fork(),
          ).ldelim();
        if (
          m.secondsSinceStarted != null &&
          Object.hasOwnProperty.call(m, 'secondsSinceStarted')
        )
          w.uint32(16).int64(m.secondsSinceStarted);
        if (
          m.secondsSinceLastPlayed != null &&
          Object.hasOwnProperty.call(m, 'secondsSinceLastPlayed')
        )
          w.uint32(24).int64(m.secondsSinceLastPlayed);
        if (
          m.sessionUsageTableEntry != null &&
          Object.hasOwnProperty.call(m, 'sessionUsageTableEntry')
        )
          w.uint32(34).bytes(m.sessionUsageTableEntry);
        return w;
      };

      /**
       * Encodes the specified ExistingLicense message, length delimited. Does not implicitly {@link LicenseRequest.ContentIdentification.ExistingLicense.verify|verify} messages.
       * @function encodeDelimited
       * @memberof LicenseRequest.ContentIdentification.ExistingLicense
       * @static
       * @param {LicenseRequest.ContentIdentification.IExistingLicense} message ExistingLicense message or plain object to encode
       * @param {$protobuf.Writer} [writer] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */
      ExistingLicense.encodeDelimited = function encodeDelimited(
        message,
        writer,
      ) {
        return this.encode(message, writer).ldelim();
      };

      /**
       * Decodes an ExistingLicense message from the specified reader or buffer.
       * @function decode
       * @memberof LicenseRequest.ContentIdentification.ExistingLicense
       * @static
       * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
       * @param {number} [l] Message length if known beforehand
       * @returns {LicenseRequest.ContentIdentification.ExistingLicense} ExistingLicense
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      ExistingLicense.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.LicenseRequest.ContentIdentification.ExistingLicense();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1: {
              m.licenseId = $root.LicenseIdentification.decode(r, r.uint32());
              break;
            }
            case 2: {
              m.secondsSinceStarted = r.int64();
              break;
            }
            case 3: {
              m.secondsSinceLastPlayed = r.int64();
              break;
            }
            case 4: {
              m.sessionUsageTableEntry = r.bytes();
              break;
            }
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };

      /**
       * Decodes an ExistingLicense message from the specified reader or buffer, length delimited.
       * @function decodeDelimited
       * @memberof LicenseRequest.ContentIdentification.ExistingLicense
       * @static
       * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
       * @returns {LicenseRequest.ContentIdentification.ExistingLicense} ExistingLicense
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      ExistingLicense.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader)) reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
      };

      /**
       * Creates an ExistingLicense message from a plain object. Also converts values to their respective internal types.
       * @function fromObject
       * @memberof LicenseRequest.ContentIdentification.ExistingLicense
       * @static
       * @param {Object.<string,*>} d Plain object
       * @returns {LicenseRequest.ContentIdentification.ExistingLicense} ExistingLicense
       */
      ExistingLicense.fromObject = function fromObject(d) {
        if (
          d instanceof
          $root.LicenseRequest.ContentIdentification.ExistingLicense
        )
          return d;
        var m =
          new $root.LicenseRequest.ContentIdentification.ExistingLicense();
        if (d.licenseId != null) {
          if (typeof d.licenseId !== 'object')
            throw TypeError(
              '.LicenseRequest.ContentIdentification.ExistingLicense.licenseId: object expected',
            );
          m.licenseId = $root.LicenseIdentification.fromObject(d.licenseId);
        }
        if (d.secondsSinceStarted != null) {
          if ($util.Long)
            (m.secondsSinceStarted = $util.Long.fromValue(
              d.secondsSinceStarted,
            )).unsigned = false;
          else if (typeof d.secondsSinceStarted === 'string')
            m.secondsSinceStarted = parseInt(d.secondsSinceStarted, 10);
          else if (typeof d.secondsSinceStarted === 'number')
            m.secondsSinceStarted = d.secondsSinceStarted;
          else if (typeof d.secondsSinceStarted === 'object')
            m.secondsSinceStarted = new $util.LongBits(
              d.secondsSinceStarted.low >>> 0,
              d.secondsSinceStarted.high >>> 0,
            ).toNumber();
        }
        if (d.secondsSinceLastPlayed != null) {
          if ($util.Long)
            (m.secondsSinceLastPlayed = $util.Long.fromValue(
              d.secondsSinceLastPlayed,
            )).unsigned = false;
          else if (typeof d.secondsSinceLastPlayed === 'string')
            m.secondsSinceLastPlayed = parseInt(d.secondsSinceLastPlayed, 10);
          else if (typeof d.secondsSinceLastPlayed === 'number')
            m.secondsSinceLastPlayed = d.secondsSinceLastPlayed;
          else if (typeof d.secondsSinceLastPlayed === 'object')
            m.secondsSinceLastPlayed = new $util.LongBits(
              d.secondsSinceLastPlayed.low >>> 0,
              d.secondsSinceLastPlayed.high >>> 0,
            ).toNumber();
        }
        if (d.sessionUsageTableEntry != null) {
          if (typeof d.sessionUsageTableEntry === 'string')
            $util.base64.decode(
              d.sessionUsageTableEntry,
              (m.sessionUsageTableEntry = $util.newBuffer(
                $util.base64.length(d.sessionUsageTableEntry),
              )),
              0,
            );
          else if (d.sessionUsageTableEntry.length >= 0)
            m.sessionUsageTableEntry = d.sessionUsageTableEntry;
        }
        return m;
      };

      /**
       * Creates a plain object from an ExistingLicense message. Also converts values to other types if specified.
       * @function toObject
       * @memberof LicenseRequest.ContentIdentification.ExistingLicense
       * @static
       * @param {LicenseRequest.ContentIdentification.ExistingLicense} m ExistingLicense
       * @param {$protobuf.IConversionOptions} [o] Conversion options
       * @returns {Object.<string,*>} Plain object
       */
      ExistingLicense.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          d.licenseId = null;
          if ($util.Long) {
            var n = new $util.Long(0, 0, false);
            d.secondsSinceStarted =
              o.longs === String
                ? n.toString()
                : o.longs === Number
                  ? n.toNumber()
                  : n;
          } else d.secondsSinceStarted = o.longs === String ? '0' : 0;
          if ($util.Long) {
            var n = new $util.Long(0, 0, false);
            d.secondsSinceLastPlayed =
              o.longs === String
                ? n.toString()
                : o.longs === Number
                  ? n.toNumber()
                  : n;
          } else d.secondsSinceLastPlayed = o.longs === String ? '0' : 0;
          if (o.bytes === String) d.sessionUsageTableEntry = '';
          else {
            d.sessionUsageTableEntry = [];
            if (o.bytes !== Array)
              d.sessionUsageTableEntry = $util.newBuffer(
                d.sessionUsageTableEntry,
              );
          }
        }
        if (m.licenseId != null && m.hasOwnProperty('licenseId')) {
          d.licenseId = $root.LicenseIdentification.toObject(m.licenseId, o);
        }
        if (
          m.secondsSinceStarted != null &&
          m.hasOwnProperty('secondsSinceStarted')
        ) {
          if (typeof m.secondsSinceStarted === 'number')
            d.secondsSinceStarted =
              o.longs === String
                ? String(m.secondsSinceStarted)
                : m.secondsSinceStarted;
          else
            d.secondsSinceStarted =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.secondsSinceStarted)
                : o.longs === Number
                  ? new $util.LongBits(
                      m.secondsSinceStarted.low >>> 0,
                      m.secondsSinceStarted.high >>> 0,
                    ).toNumber()
                  : m.secondsSinceStarted;
        }
        if (
          m.secondsSinceLastPlayed != null &&
          m.hasOwnProperty('secondsSinceLastPlayed')
        ) {
          if (typeof m.secondsSinceLastPlayed === 'number')
            d.secondsSinceLastPlayed =
              o.longs === String
                ? String(m.secondsSinceLastPlayed)
                : m.secondsSinceLastPlayed;
          else
            d.secondsSinceLastPlayed =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.secondsSinceLastPlayed)
                : o.longs === Number
                  ? new $util.LongBits(
                      m.secondsSinceLastPlayed.low >>> 0,
                      m.secondsSinceLastPlayed.high >>> 0,
                    ).toNumber()
                  : m.secondsSinceLastPlayed;
        }
        if (
          m.sessionUsageTableEntry != null &&
          m.hasOwnProperty('sessionUsageTableEntry')
        ) {
          d.sessionUsageTableEntry =
            o.bytes === String
              ? $util.base64.encode(
                  m.sessionUsageTableEntry,
                  0,
                  m.sessionUsageTableEntry.length,
                )
              : o.bytes === Array
                ? Array.prototype.slice.call(m.sessionUsageTableEntry)
                : m.sessionUsageTableEntry;
        }
        return d;
      };

      /**
       * Converts this ExistingLicense to JSON.
       * @function toJSON
       * @memberof LicenseRequest.ContentIdentification.ExistingLicense
       * @instance
       * @returns {Object.<string,*>} JSON object
       */
      ExistingLicense.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };

      /**
       * Gets the default type url for ExistingLicense
       * @function getTypeUrl
       * @memberof LicenseRequest.ContentIdentification.ExistingLicense
       * @static
       * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns {string} The default type url
       */
      ExistingLicense.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
          typeUrlPrefix = 'type.googleapis.com';
        }
        return (
          typeUrlPrefix +
          '/LicenseRequest.ContentIdentification.ExistingLicense'
        );
      };

      return ExistingLicense;
    })();

    ContentIdentification.InitData = (function () {
      /**
       * Properties of an InitData.
       * @memberof LicenseRequest.ContentIdentification
       * @interface IInitData
       * @property {LicenseRequest.ContentIdentification.InitData.InitDataType|null} [initDataType] InitData initDataType
       * @property {Uint8Array|null} [initData] InitData initData
       * @property {LicenseType|null} [licenseType] InitData licenseType
       * @property {Uint8Array|null} [requestId] InitData requestId
       */

      /**
       * Constructs a new InitData.
       * @memberof LicenseRequest.ContentIdentification
       * @classdesc Represents an InitData.
       * @implements IInitData
       * @constructor
       * @param {LicenseRequest.ContentIdentification.IInitData=} [p] Properties to set
       */
      function InitData(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }

      /**
       * InitData initDataType.
       * @member {LicenseRequest.ContentIdentification.InitData.InitDataType} initDataType
       * @memberof LicenseRequest.ContentIdentification.InitData
       * @instance
       */
      InitData.prototype.initDataType = 1;

      /**
       * InitData initData.
       * @member {Uint8Array} initData
       * @memberof LicenseRequest.ContentIdentification.InitData
       * @instance
       */
      InitData.prototype.initData = $util.newBuffer([]);

      /**
       * InitData licenseType.
       * @member {LicenseType} licenseType
       * @memberof LicenseRequest.ContentIdentification.InitData
       * @instance
       */
      InitData.prototype.licenseType = 1;

      /**
       * InitData requestId.
       * @member {Uint8Array} requestId
       * @memberof LicenseRequest.ContentIdentification.InitData
       * @instance
       */
      InitData.prototype.requestId = $util.newBuffer([]);

      /**
       * Creates a new InitData instance using the specified properties.
       * @function create
       * @memberof LicenseRequest.ContentIdentification.InitData
       * @static
       * @param {LicenseRequest.ContentIdentification.IInitData=} [properties] Properties to set
       * @returns {LicenseRequest.ContentIdentification.InitData} InitData instance
       */
      InitData.create = function create(properties) {
        return new InitData(properties);
      };

      /**
       * Encodes the specified InitData message. Does not implicitly {@link LicenseRequest.ContentIdentification.InitData.verify|verify} messages.
       * @function encode
       * @memberof LicenseRequest.ContentIdentification.InitData
       * @static
       * @param {LicenseRequest.ContentIdentification.IInitData} m InitData message or plain object to encode
       * @param {$protobuf.Writer} [w] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */
      InitData.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (
          m.initDataType != null &&
          Object.hasOwnProperty.call(m, 'initDataType')
        )
          w.uint32(8).int32(m.initDataType);
        if (m.initData != null && Object.hasOwnProperty.call(m, 'initData'))
          w.uint32(18).bytes(m.initData);
        if (
          m.licenseType != null &&
          Object.hasOwnProperty.call(m, 'licenseType')
        )
          w.uint32(24).int32(m.licenseType);
        if (m.requestId != null && Object.hasOwnProperty.call(m, 'requestId'))
          w.uint32(34).bytes(m.requestId);
        return w;
      };

      /**
       * Encodes the specified InitData message, length delimited. Does not implicitly {@link LicenseRequest.ContentIdentification.InitData.verify|verify} messages.
       * @function encodeDelimited
       * @memberof LicenseRequest.ContentIdentification.InitData
       * @static
       * @param {LicenseRequest.ContentIdentification.IInitData} message InitData message or plain object to encode
       * @param {$protobuf.Writer} [writer] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */
      InitData.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
      };

      /**
       * Decodes an InitData message from the specified reader or buffer.
       * @function decode
       * @memberof LicenseRequest.ContentIdentification.InitData
       * @static
       * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
       * @param {number} [l] Message length if known beforehand
       * @returns {LicenseRequest.ContentIdentification.InitData} InitData
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      InitData.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.LicenseRequest.ContentIdentification.InitData();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1: {
              m.initDataType = r.int32();
              break;
            }
            case 2: {
              m.initData = r.bytes();
              break;
            }
            case 3: {
              m.licenseType = r.int32();
              break;
            }
            case 4: {
              m.requestId = r.bytes();
              break;
            }
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };

      /**
       * Decodes an InitData message from the specified reader or buffer, length delimited.
       * @function decodeDelimited
       * @memberof LicenseRequest.ContentIdentification.InitData
       * @static
       * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
       * @returns {LicenseRequest.ContentIdentification.InitData} InitData
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      InitData.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader)) reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
      };

      /**
       * Creates an InitData message from a plain object. Also converts values to their respective internal types.
       * @function fromObject
       * @memberof LicenseRequest.ContentIdentification.InitData
       * @static
       * @param {Object.<string,*>} d Plain object
       * @returns {LicenseRequest.ContentIdentification.InitData} InitData
       */
      InitData.fromObject = function fromObject(d) {
        if (d instanceof $root.LicenseRequest.ContentIdentification.InitData)
          return d;
        var m = new $root.LicenseRequest.ContentIdentification.InitData();
        switch (d.initDataType) {
          default:
            if (typeof d.initDataType === 'number') {
              m.initDataType = d.initDataType;
              break;
            }
            break;
          case 'CENC':
          case 1:
            m.initDataType = 1;
            break;
          case 'WEBM':
          case 2:
            m.initDataType = 2;
            break;
        }
        if (d.initData != null) {
          if (typeof d.initData === 'string')
            $util.base64.decode(
              d.initData,
              (m.initData = $util.newBuffer($util.base64.length(d.initData))),
              0,
            );
          else if (d.initData.length >= 0) m.initData = d.initData;
        }
        switch (d.licenseType) {
          default:
            if (typeof d.licenseType === 'number') {
              m.licenseType = d.licenseType;
              break;
            }
            break;
          case 'STREAMING':
          case 1:
            m.licenseType = 1;
            break;
          case 'OFFLINE':
          case 2:
            m.licenseType = 2;
            break;
          case 'AUTOMATIC':
          case 3:
            m.licenseType = 3;
            break;
        }
        if (d.requestId != null) {
          if (typeof d.requestId === 'string')
            $util.base64.decode(
              d.requestId,
              (m.requestId = $util.newBuffer($util.base64.length(d.requestId))),
              0,
            );
          else if (d.requestId.length >= 0) m.requestId = d.requestId;
        }
        return m;
      };

      /**
       * Creates a plain object from an InitData message. Also converts values to other types if specified.
       * @function toObject
       * @memberof LicenseRequest.ContentIdentification.InitData
       * @static
       * @param {LicenseRequest.ContentIdentification.InitData} m InitData
       * @param {$protobuf.IConversionOptions} [o] Conversion options
       * @returns {Object.<string,*>} Plain object
       */
      InitData.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          d.initDataType = o.enums === String ? 'CENC' : 1;
          if (o.bytes === String) d.initData = '';
          else {
            d.initData = [];
            if (o.bytes !== Array) d.initData = $util.newBuffer(d.initData);
          }
          d.licenseType = o.enums === String ? 'STREAMING' : 1;
          if (o.bytes === String) d.requestId = '';
          else {
            d.requestId = [];
            if (o.bytes !== Array) d.requestId = $util.newBuffer(d.requestId);
          }
        }
        if (m.initDataType != null && m.hasOwnProperty('initDataType')) {
          d.initDataType =
            o.enums === String
              ? $root.LicenseRequest.ContentIdentification.InitData
                  .InitDataType[m.initDataType] === undefined
                ? m.initDataType
                : $root.LicenseRequest.ContentIdentification.InitData
                    .InitDataType[m.initDataType]
              : m.initDataType;
        }
        if (m.initData != null && m.hasOwnProperty('initData')) {
          d.initData =
            o.bytes === String
              ? $util.base64.encode(m.initData, 0, m.initData.length)
              : o.bytes === Array
                ? Array.prototype.slice.call(m.initData)
                : m.initData;
        }
        if (m.licenseType != null && m.hasOwnProperty('licenseType')) {
          d.licenseType =
            o.enums === String
              ? $root.LicenseType[m.licenseType] === undefined
                ? m.licenseType
                : $root.LicenseType[m.licenseType]
              : m.licenseType;
        }
        if (m.requestId != null && m.hasOwnProperty('requestId')) {
          d.requestId =
            o.bytes === String
              ? $util.base64.encode(m.requestId, 0, m.requestId.length)
              : o.bytes === Array
                ? Array.prototype.slice.call(m.requestId)
                : m.requestId;
        }
        return d;
      };

      /**
       * Converts this InitData to JSON.
       * @function toJSON
       * @memberof LicenseRequest.ContentIdentification.InitData
       * @instance
       * @returns {Object.<string,*>} JSON object
       */
      InitData.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };

      /**
       * Gets the default type url for InitData
       * @function getTypeUrl
       * @memberof LicenseRequest.ContentIdentification.InitData
       * @static
       * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns {string} The default type url
       */
      InitData.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
          typeUrlPrefix = 'type.googleapis.com';
        }
        return typeUrlPrefix + '/LicenseRequest.ContentIdentification.InitData';
      };

      /**
       * InitDataType enum.
       * @name LicenseRequest.ContentIdentification.InitData.InitDataType
       * @enum {number}
       * @property {number} CENC=1 CENC value
       * @property {number} WEBM=2 WEBM value
       */
      InitData.InitDataType = (function () {
        const valuesById = {},
          values = Object.create(valuesById);
        values[(valuesById[1] = 'CENC')] = 1;
        values[(valuesById[2] = 'WEBM')] = 2;
        return values;
      })();

      return InitData;
    })();

    return ContentIdentification;
  })();

  /**
   * RequestType enum.
   * @name LicenseRequest.RequestType
   * @enum {number}
   * @property {number} NEW=1 NEW value
   * @property {number} RENEWAL=2 RENEWAL value
   * @property {number} RELEASE=3 RELEASE value
   */
  LicenseRequest.RequestType = (function () {
    const valuesById = {},
      values = Object.create(valuesById);
    values[(valuesById[1] = 'NEW')] = 1;
    values[(valuesById[2] = 'RENEWAL')] = 2;
    values[(valuesById[3] = 'RELEASE')] = 3;
    return values;
  })();

  return LicenseRequest;
})());

export const MetricData = ($root.MetricData = (() => {
  /**
   * Properties of a MetricData.
   * @exports IMetricData
   * @interface IMetricData
   * @property {string|null} [stageName] MetricData stageName
   * @property {Array.<MetricData.ITypeValue>|null} [metricData] MetricData metricData
   */

  /**
   * Constructs a new MetricData.
   * @exports MetricData
   * @classdesc Represents a MetricData.
   * @implements IMetricData
   * @constructor
   * @param {IMetricData=} [p] Properties to set
   */
  function MetricData(p) {
    this.metricData = [];
    if (p)
      for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
        if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
  }

  /**
   * MetricData stageName.
   * @member {string} stageName
   * @memberof MetricData
   * @instance
   */
  MetricData.prototype.stageName = '';

  /**
   * MetricData metricData.
   * @member {Array.<MetricData.ITypeValue>} metricData
   * @memberof MetricData
   * @instance
   */
  MetricData.prototype.metricData = $util.emptyArray;

  /**
   * Creates a new MetricData instance using the specified properties.
   * @function create
   * @memberof MetricData
   * @static
   * @param {IMetricData=} [properties] Properties to set
   * @returns {MetricData} MetricData instance
   */
  MetricData.create = function create(properties) {
    return new MetricData(properties);
  };

  /**
   * Encodes the specified MetricData message. Does not implicitly {@link MetricData.verify|verify} messages.
   * @function encode
   * @memberof MetricData
   * @static
   * @param {IMetricData} m MetricData message or plain object to encode
   * @param {$protobuf.Writer} [w] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  MetricData.encode = function encode(m, w) {
    if (!w) w = $Writer.create();
    if (m.stageName != null && Object.hasOwnProperty.call(m, 'stageName'))
      w.uint32(10).string(m.stageName);
    if (m.metricData != null && m.metricData.length) {
      for (var i = 0; i < m.metricData.length; ++i)
        $root.MetricData.TypeValue.encode(
          m.metricData[i],
          w.uint32(18).fork(),
        ).ldelim();
    }
    return w;
  };

  /**
   * Encodes the specified MetricData message, length delimited. Does not implicitly {@link MetricData.verify|verify} messages.
   * @function encodeDelimited
   * @memberof MetricData
   * @static
   * @param {IMetricData} message MetricData message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  MetricData.encodeDelimited = function encodeDelimited(message, writer) {
    return this.encode(message, writer).ldelim();
  };

  /**
   * Decodes a MetricData message from the specified reader or buffer.
   * @function decode
   * @memberof MetricData
   * @static
   * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
   * @param {number} [l] Message length if known beforehand
   * @returns {MetricData} MetricData
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  MetricData.decode = function decode(r, l) {
    if (!(r instanceof $Reader)) r = $Reader.create(r);
    var c = l === undefined ? r.len : r.pos + l,
      m = new $root.MetricData();
    while (r.pos < c) {
      var t = r.uint32();
      switch (t >>> 3) {
        case 1: {
          m.stageName = r.string();
          break;
        }
        case 2: {
          if (!(m.metricData && m.metricData.length)) m.metricData = [];
          m.metricData.push($root.MetricData.TypeValue.decode(r, r.uint32()));
          break;
        }
        default:
          r.skipType(t & 7);
          break;
      }
    }
    return m;
  };

  /**
   * Decodes a MetricData message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof MetricData
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {MetricData} MetricData
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  MetricData.decodeDelimited = function decodeDelimited(reader) {
    if (!(reader instanceof $Reader)) reader = new $Reader(reader);
    return this.decode(reader, reader.uint32());
  };

  /**
   * Creates a MetricData message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof MetricData
   * @static
   * @param {Object.<string,*>} d Plain object
   * @returns {MetricData} MetricData
   */
  MetricData.fromObject = function fromObject(d) {
    if (d instanceof $root.MetricData) return d;
    var m = new $root.MetricData();
    if (d.stageName != null) {
      m.stageName = String(d.stageName);
    }
    if (d.metricData) {
      if (!Array.isArray(d.metricData))
        throw TypeError('.MetricData.metricData: array expected');
      m.metricData = [];
      for (var i = 0; i < d.metricData.length; ++i) {
        if (typeof d.metricData[i] !== 'object')
          throw TypeError('.MetricData.metricData: object expected');
        m.metricData[i] = $root.MetricData.TypeValue.fromObject(
          d.metricData[i],
        );
      }
    }
    return m;
  };

  /**
   * Creates a plain object from a MetricData message. Also converts values to other types if specified.
   * @function toObject
   * @memberof MetricData
   * @static
   * @param {MetricData} m MetricData
   * @param {$protobuf.IConversionOptions} [o] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  MetricData.toObject = function toObject(m, o) {
    if (!o) o = {};
    var d = {};
    if (o.arrays || o.defaults) {
      d.metricData = [];
    }
    if (o.defaults) {
      d.stageName = '';
    }
    if (m.stageName != null && m.hasOwnProperty('stageName')) {
      d.stageName = m.stageName;
    }
    if (m.metricData && m.metricData.length) {
      d.metricData = [];
      for (var j = 0; j < m.metricData.length; ++j) {
        d.metricData[j] = $root.MetricData.TypeValue.toObject(
          m.metricData[j],
          o,
        );
      }
    }
    return d;
  };

  /**
   * Converts this MetricData to JSON.
   * @function toJSON
   * @memberof MetricData
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  MetricData.prototype.toJSON = function toJSON() {
    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
  };

  /**
   * Gets the default type url for MetricData
   * @function getTypeUrl
   * @memberof MetricData
   * @static
   * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns {string} The default type url
   */
  MetricData.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
    if (typeUrlPrefix === undefined) {
      typeUrlPrefix = 'type.googleapis.com';
    }
    return typeUrlPrefix + '/MetricData';
  };

  /**
   * MetricType enum.
   * @name MetricData.MetricType
   * @enum {number}
   * @property {number} LATENCY=1 LATENCY value
   * @property {number} TIMESTAMP=2 TIMESTAMP value
   */
  MetricData.MetricType = (function () {
    const valuesById = {},
      values = Object.create(valuesById);
    values[(valuesById[1] = 'LATENCY')] = 1;
    values[(valuesById[2] = 'TIMESTAMP')] = 2;
    return values;
  })();

  MetricData.TypeValue = (function () {
    /**
     * Properties of a TypeValue.
     * @memberof MetricData
     * @interface ITypeValue
     * @property {MetricData.MetricType|null} [type] TypeValue type
     * @property {number|Long|null} [value] TypeValue value
     */

    /**
     * Constructs a new TypeValue.
     * @memberof MetricData
     * @classdesc Represents a TypeValue.
     * @implements ITypeValue
     * @constructor
     * @param {MetricData.ITypeValue=} [p] Properties to set
     */
    function TypeValue(p) {
      if (p)
        for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
          if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
    }

    /**
     * TypeValue type.
     * @member {MetricData.MetricType} type
     * @memberof MetricData.TypeValue
     * @instance
     */
    TypeValue.prototype.type = 1;

    /**
     * TypeValue value.
     * @member {number|Long} value
     * @memberof MetricData.TypeValue
     * @instance
     */
    TypeValue.prototype.value = $util.Long
      ? $util.Long.fromBits(0, 0, false)
      : 0;

    /**
     * Creates a new TypeValue instance using the specified properties.
     * @function create
     * @memberof MetricData.TypeValue
     * @static
     * @param {MetricData.ITypeValue=} [properties] Properties to set
     * @returns {MetricData.TypeValue} TypeValue instance
     */
    TypeValue.create = function create(properties) {
      return new TypeValue(properties);
    };

    /**
     * Encodes the specified TypeValue message. Does not implicitly {@link MetricData.TypeValue.verify|verify} messages.
     * @function encode
     * @memberof MetricData.TypeValue
     * @static
     * @param {MetricData.ITypeValue} m TypeValue message or plain object to encode
     * @param {$protobuf.Writer} [w] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    TypeValue.encode = function encode(m, w) {
      if (!w) w = $Writer.create();
      if (m.type != null && Object.hasOwnProperty.call(m, 'type'))
        w.uint32(8).int32(m.type);
      if (m.value != null && Object.hasOwnProperty.call(m, 'value'))
        w.uint32(16).int64(m.value);
      return w;
    };

    /**
     * Encodes the specified TypeValue message, length delimited. Does not implicitly {@link MetricData.TypeValue.verify|verify} messages.
     * @function encodeDelimited
     * @memberof MetricData.TypeValue
     * @static
     * @param {MetricData.ITypeValue} message TypeValue message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    TypeValue.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a TypeValue message from the specified reader or buffer.
     * @function decode
     * @memberof MetricData.TypeValue
     * @static
     * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
     * @param {number} [l] Message length if known beforehand
     * @returns {MetricData.TypeValue} TypeValue
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    TypeValue.decode = function decode(r, l) {
      if (!(r instanceof $Reader)) r = $Reader.create(r);
      var c = l === undefined ? r.len : r.pos + l,
        m = new $root.MetricData.TypeValue();
      while (r.pos < c) {
        var t = r.uint32();
        switch (t >>> 3) {
          case 1: {
            m.type = r.int32();
            break;
          }
          case 2: {
            m.value = r.int64();
            break;
          }
          default:
            r.skipType(t & 7);
            break;
        }
      }
      return m;
    };

    /**
     * Decodes a TypeValue message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof MetricData.TypeValue
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {MetricData.TypeValue} TypeValue
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    TypeValue.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Creates a TypeValue message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof MetricData.TypeValue
     * @static
     * @param {Object.<string,*>} d Plain object
     * @returns {MetricData.TypeValue} TypeValue
     */
    TypeValue.fromObject = function fromObject(d) {
      if (d instanceof $root.MetricData.TypeValue) return d;
      var m = new $root.MetricData.TypeValue();
      switch (d.type) {
        default:
          if (typeof d.type === 'number') {
            m.type = d.type;
            break;
          }
          break;
        case 'LATENCY':
        case 1:
          m.type = 1;
          break;
        case 'TIMESTAMP':
        case 2:
          m.type = 2;
          break;
      }
      if (d.value != null) {
        if ($util.Long)
          (m.value = $util.Long.fromValue(d.value)).unsigned = false;
        else if (typeof d.value === 'string') m.value = parseInt(d.value, 10);
        else if (typeof d.value === 'number') m.value = d.value;
        else if (typeof d.value === 'object')
          m.value = new $util.LongBits(
            d.value.low >>> 0,
            d.value.high >>> 0,
          ).toNumber();
      }
      return m;
    };

    /**
     * Creates a plain object from a TypeValue message. Also converts values to other types if specified.
     * @function toObject
     * @memberof MetricData.TypeValue
     * @static
     * @param {MetricData.TypeValue} m TypeValue
     * @param {$protobuf.IConversionOptions} [o] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    TypeValue.toObject = function toObject(m, o) {
      if (!o) o = {};
      var d = {};
      if (o.defaults) {
        d.type = o.enums === String ? 'LATENCY' : 1;
        if ($util.Long) {
          var n = new $util.Long(0, 0, false);
          d.value =
            o.longs === String
              ? n.toString()
              : o.longs === Number
                ? n.toNumber()
                : n;
        } else d.value = o.longs === String ? '0' : 0;
      }
      if (m.type != null && m.hasOwnProperty('type')) {
        d.type =
          o.enums === String
            ? $root.MetricData.MetricType[m.type] === undefined
              ? m.type
              : $root.MetricData.MetricType[m.type]
            : m.type;
      }
      if (m.value != null && m.hasOwnProperty('value')) {
        if (typeof m.value === 'number')
          d.value = o.longs === String ? String(m.value) : m.value;
        else
          d.value =
            o.longs === String
              ? $util.Long.prototype.toString.call(m.value)
              : o.longs === Number
                ? new $util.LongBits(
                    m.value.low >>> 0,
                    m.value.high >>> 0,
                  ).toNumber()
                : m.value;
      }
      return d;
    };

    /**
     * Converts this TypeValue to JSON.
     * @function toJSON
     * @memberof MetricData.TypeValue
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    TypeValue.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for TypeValue
     * @function getTypeUrl
     * @memberof MetricData.TypeValue
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    TypeValue.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = 'type.googleapis.com';
      }
      return typeUrlPrefix + '/MetricData.TypeValue';
    };

    return TypeValue;
  })();

  return MetricData;
})());

export const VersionInfo = ($root.VersionInfo = (() => {
  /**
   * Properties of a VersionInfo.
   * @exports IVersionInfo
   * @interface IVersionInfo
   * @property {string|null} [licenseSdkVersion] VersionInfo licenseSdkVersion
   * @property {string|null} [licenseServiceVersion] VersionInfo licenseServiceVersion
   */

  /**
   * Constructs a new VersionInfo.
   * @exports VersionInfo
   * @classdesc Represents a VersionInfo.
   * @implements IVersionInfo
   * @constructor
   * @param {IVersionInfo=} [p] Properties to set
   */
  function VersionInfo(p) {
    if (p)
      for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
        if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
  }

  /**
   * VersionInfo licenseSdkVersion.
   * @member {string} licenseSdkVersion
   * @memberof VersionInfo
   * @instance
   */
  VersionInfo.prototype.licenseSdkVersion = '';

  /**
   * VersionInfo licenseServiceVersion.
   * @member {string} licenseServiceVersion
   * @memberof VersionInfo
   * @instance
   */
  VersionInfo.prototype.licenseServiceVersion = '';

  /**
   * Creates a new VersionInfo instance using the specified properties.
   * @function create
   * @memberof VersionInfo
   * @static
   * @param {IVersionInfo=} [properties] Properties to set
   * @returns {VersionInfo} VersionInfo instance
   */
  VersionInfo.create = function create(properties) {
    return new VersionInfo(properties);
  };

  /**
   * Encodes the specified VersionInfo message. Does not implicitly {@link VersionInfo.verify|verify} messages.
   * @function encode
   * @memberof VersionInfo
   * @static
   * @param {IVersionInfo} m VersionInfo message or plain object to encode
   * @param {$protobuf.Writer} [w] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  VersionInfo.encode = function encode(m, w) {
    if (!w) w = $Writer.create();
    if (
      m.licenseSdkVersion != null &&
      Object.hasOwnProperty.call(m, 'licenseSdkVersion')
    )
      w.uint32(10).string(m.licenseSdkVersion);
    if (
      m.licenseServiceVersion != null &&
      Object.hasOwnProperty.call(m, 'licenseServiceVersion')
    )
      w.uint32(18).string(m.licenseServiceVersion);
    return w;
  };

  /**
   * Encodes the specified VersionInfo message, length delimited. Does not implicitly {@link VersionInfo.verify|verify} messages.
   * @function encodeDelimited
   * @memberof VersionInfo
   * @static
   * @param {IVersionInfo} message VersionInfo message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  VersionInfo.encodeDelimited = function encodeDelimited(message, writer) {
    return this.encode(message, writer).ldelim();
  };

  /**
   * Decodes a VersionInfo message from the specified reader or buffer.
   * @function decode
   * @memberof VersionInfo
   * @static
   * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
   * @param {number} [l] Message length if known beforehand
   * @returns {VersionInfo} VersionInfo
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  VersionInfo.decode = function decode(r, l) {
    if (!(r instanceof $Reader)) r = $Reader.create(r);
    var c = l === undefined ? r.len : r.pos + l,
      m = new $root.VersionInfo();
    while (r.pos < c) {
      var t = r.uint32();
      switch (t >>> 3) {
        case 1: {
          m.licenseSdkVersion = r.string();
          break;
        }
        case 2: {
          m.licenseServiceVersion = r.string();
          break;
        }
        default:
          r.skipType(t & 7);
          break;
      }
    }
    return m;
  };

  /**
   * Decodes a VersionInfo message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof VersionInfo
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {VersionInfo} VersionInfo
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  VersionInfo.decodeDelimited = function decodeDelimited(reader) {
    if (!(reader instanceof $Reader)) reader = new $Reader(reader);
    return this.decode(reader, reader.uint32());
  };

  /**
   * Creates a VersionInfo message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof VersionInfo
   * @static
   * @param {Object.<string,*>} d Plain object
   * @returns {VersionInfo} VersionInfo
   */
  VersionInfo.fromObject = function fromObject(d) {
    if (d instanceof $root.VersionInfo) return d;
    var m = new $root.VersionInfo();
    if (d.licenseSdkVersion != null) {
      m.licenseSdkVersion = String(d.licenseSdkVersion);
    }
    if (d.licenseServiceVersion != null) {
      m.licenseServiceVersion = String(d.licenseServiceVersion);
    }
    return m;
  };

  /**
   * Creates a plain object from a VersionInfo message. Also converts values to other types if specified.
   * @function toObject
   * @memberof VersionInfo
   * @static
   * @param {VersionInfo} m VersionInfo
   * @param {$protobuf.IConversionOptions} [o] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  VersionInfo.toObject = function toObject(m, o) {
    if (!o) o = {};
    var d = {};
    if (o.defaults) {
      d.licenseSdkVersion = '';
      d.licenseServiceVersion = '';
    }
    if (m.licenseSdkVersion != null && m.hasOwnProperty('licenseSdkVersion')) {
      d.licenseSdkVersion = m.licenseSdkVersion;
    }
    if (
      m.licenseServiceVersion != null &&
      m.hasOwnProperty('licenseServiceVersion')
    ) {
      d.licenseServiceVersion = m.licenseServiceVersion;
    }
    return d;
  };

  /**
   * Converts this VersionInfo to JSON.
   * @function toJSON
   * @memberof VersionInfo
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  VersionInfo.prototype.toJSON = function toJSON() {
    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
  };

  /**
   * Gets the default type url for VersionInfo
   * @function getTypeUrl
   * @memberof VersionInfo
   * @static
   * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns {string} The default type url
   */
  VersionInfo.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
    if (typeUrlPrefix === undefined) {
      typeUrlPrefix = 'type.googleapis.com';
    }
    return typeUrlPrefix + '/VersionInfo';
  };

  return VersionInfo;
})());

export const SignedMessage = ($root.SignedMessage = (() => {
  /**
   * Properties of a SignedMessage.
   * @exports ISignedMessage
   * @interface ISignedMessage
   * @property {SignedMessage.MessageType|null} [type] SignedMessage type
   * @property {Uint8Array|null} [msg] SignedMessage msg
   * @property {Uint8Array|null} [signature] SignedMessage signature
   * @property {Uint8Array|null} [sessionKey] SignedMessage sessionKey
   * @property {Uint8Array|null} [remoteAttestation] SignedMessage remoteAttestation
   * @property {Array.<IMetricData>|null} [metricData] SignedMessage metricData
   * @property {IVersionInfo|null} [serviceVersionInfo] SignedMessage serviceVersionInfo
   * @property {SignedMessage.SessionKeyType|null} [sessionKeyType] SignedMessage sessionKeyType
   * @property {Uint8Array|null} [oemcryptoCoreMessage] SignedMessage oemcryptoCoreMessage
   */

  /**
   * Constructs a new SignedMessage.
   * @exports SignedMessage
   * @classdesc Represents a SignedMessage.
   * @implements ISignedMessage
   * @constructor
   * @param {ISignedMessage=} [p] Properties to set
   */
  function SignedMessage(p) {
    this.metricData = [];
    if (p)
      for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
        if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
  }

  /**
   * SignedMessage type.
   * @member {SignedMessage.MessageType} type
   * @memberof SignedMessage
   * @instance
   */
  SignedMessage.prototype.type = 1;

  /**
   * SignedMessage msg.
   * @member {Uint8Array} msg
   * @memberof SignedMessage
   * @instance
   */
  SignedMessage.prototype.msg = $util.newBuffer([]);

  /**
   * SignedMessage signature.
   * @member {Uint8Array} signature
   * @memberof SignedMessage
   * @instance
   */
  SignedMessage.prototype.signature = $util.newBuffer([]);

  /**
   * SignedMessage sessionKey.
   * @member {Uint8Array} sessionKey
   * @memberof SignedMessage
   * @instance
   */
  SignedMessage.prototype.sessionKey = $util.newBuffer([]);

  /**
   * SignedMessage remoteAttestation.
   * @member {Uint8Array} remoteAttestation
   * @memberof SignedMessage
   * @instance
   */
  SignedMessage.prototype.remoteAttestation = $util.newBuffer([]);

  /**
   * SignedMessage metricData.
   * @member {Array.<IMetricData>} metricData
   * @memberof SignedMessage
   * @instance
   */
  SignedMessage.prototype.metricData = $util.emptyArray;

  /**
   * SignedMessage serviceVersionInfo.
   * @member {IVersionInfo|null|undefined} serviceVersionInfo
   * @memberof SignedMessage
   * @instance
   */
  SignedMessage.prototype.serviceVersionInfo = null;

  /**
   * SignedMessage sessionKeyType.
   * @member {SignedMessage.SessionKeyType} sessionKeyType
   * @memberof SignedMessage
   * @instance
   */
  SignedMessage.prototype.sessionKeyType = 1;

  /**
   * SignedMessage oemcryptoCoreMessage.
   * @member {Uint8Array} oemcryptoCoreMessage
   * @memberof SignedMessage
   * @instance
   */
  SignedMessage.prototype.oemcryptoCoreMessage = $util.newBuffer([]);

  /**
   * Creates a new SignedMessage instance using the specified properties.
   * @function create
   * @memberof SignedMessage
   * @static
   * @param {ISignedMessage=} [properties] Properties to set
   * @returns {SignedMessage} SignedMessage instance
   */
  SignedMessage.create = function create(properties) {
    return new SignedMessage(properties);
  };

  /**
   * Encodes the specified SignedMessage message. Does not implicitly {@link SignedMessage.verify|verify} messages.
   * @function encode
   * @memberof SignedMessage
   * @static
   * @param {ISignedMessage} m SignedMessage message or plain object to encode
   * @param {$protobuf.Writer} [w] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  SignedMessage.encode = function encode(m, w) {
    if (!w) w = $Writer.create();
    if (m.type != null && Object.hasOwnProperty.call(m, 'type'))
      w.uint32(8).int32(m.type);
    if (m.msg != null && Object.hasOwnProperty.call(m, 'msg'))
      w.uint32(18).bytes(m.msg);
    if (m.signature != null && Object.hasOwnProperty.call(m, 'signature'))
      w.uint32(26).bytes(m.signature);
    if (m.sessionKey != null && Object.hasOwnProperty.call(m, 'sessionKey'))
      w.uint32(34).bytes(m.sessionKey);
    if (
      m.remoteAttestation != null &&
      Object.hasOwnProperty.call(m, 'remoteAttestation')
    )
      w.uint32(42).bytes(m.remoteAttestation);
    if (m.metricData != null && m.metricData.length) {
      for (var i = 0; i < m.metricData.length; ++i)
        $root.MetricData.encode(m.metricData[i], w.uint32(50).fork()).ldelim();
    }
    if (
      m.serviceVersionInfo != null &&
      Object.hasOwnProperty.call(m, 'serviceVersionInfo')
    )
      $root.VersionInfo.encode(
        m.serviceVersionInfo,
        w.uint32(58).fork(),
      ).ldelim();
    if (
      m.sessionKeyType != null &&
      Object.hasOwnProperty.call(m, 'sessionKeyType')
    )
      w.uint32(64).int32(m.sessionKeyType);
    if (
      m.oemcryptoCoreMessage != null &&
      Object.hasOwnProperty.call(m, 'oemcryptoCoreMessage')
    )
      w.uint32(74).bytes(m.oemcryptoCoreMessage);
    return w;
  };

  /**
   * Encodes the specified SignedMessage message, length delimited. Does not implicitly {@link SignedMessage.verify|verify} messages.
   * @function encodeDelimited
   * @memberof SignedMessage
   * @static
   * @param {ISignedMessage} message SignedMessage message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  SignedMessage.encodeDelimited = function encodeDelimited(message, writer) {
    return this.encode(message, writer).ldelim();
  };

  /**
   * Decodes a SignedMessage message from the specified reader or buffer.
   * @function decode
   * @memberof SignedMessage
   * @static
   * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
   * @param {number} [l] Message length if known beforehand
   * @returns {SignedMessage} SignedMessage
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  SignedMessage.decode = function decode(r, l) {
    if (!(r instanceof $Reader)) r = $Reader.create(r);
    var c = l === undefined ? r.len : r.pos + l,
      m = new $root.SignedMessage();
    while (r.pos < c) {
      var t = r.uint32();
      switch (t >>> 3) {
        case 1: {
          m.type = r.int32();
          break;
        }
        case 2: {
          m.msg = r.bytes();
          break;
        }
        case 3: {
          m.signature = r.bytes();
          break;
        }
        case 4: {
          m.sessionKey = r.bytes();
          break;
        }
        case 5: {
          m.remoteAttestation = r.bytes();
          break;
        }
        case 6: {
          if (!(m.metricData && m.metricData.length)) m.metricData = [];
          m.metricData.push($root.MetricData.decode(r, r.uint32()));
          break;
        }
        case 7: {
          m.serviceVersionInfo = $root.VersionInfo.decode(r, r.uint32());
          break;
        }
        case 8: {
          m.sessionKeyType = r.int32();
          break;
        }
        case 9: {
          m.oemcryptoCoreMessage = r.bytes();
          break;
        }
        default:
          r.skipType(t & 7);
          break;
      }
    }
    return m;
  };

  /**
   * Decodes a SignedMessage message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof SignedMessage
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {SignedMessage} SignedMessage
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  SignedMessage.decodeDelimited = function decodeDelimited(reader) {
    if (!(reader instanceof $Reader)) reader = new $Reader(reader);
    return this.decode(reader, reader.uint32());
  };

  /**
   * Creates a SignedMessage message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof SignedMessage
   * @static
   * @param {Object.<string,*>} d Plain object
   * @returns {SignedMessage} SignedMessage
   */
  SignedMessage.fromObject = function fromObject(d) {
    if (d instanceof $root.SignedMessage) return d;
    var m = new $root.SignedMessage();
    switch (d.type) {
      default:
        if (typeof d.type === 'number') {
          m.type = d.type;
          break;
        }
        break;
      case 'LICENSE_REQUEST':
      case 1:
        m.type = 1;
        break;
      case 'LICENSE':
      case 2:
        m.type = 2;
        break;
      case 'ERROR_RESPONSE':
      case 3:
        m.type = 3;
        break;
      case 'SERVICE_CERTIFICATE_REQUEST':
      case 4:
        m.type = 4;
        break;
      case 'SERVICE_CERTIFICATE':
      case 5:
        m.type = 5;
        break;
      case 'SUB_LICENSE':
      case 6:
        m.type = 6;
        break;
      case 'CAS_LICENSE_REQUEST':
      case 7:
        m.type = 7;
        break;
      case 'CAS_LICENSE':
      case 8:
        m.type = 8;
        break;
      case 'EXTERNAL_LICENSE_REQUEST':
      case 9:
        m.type = 9;
        break;
      case 'EXTERNAL_LICENSE':
      case 10:
        m.type = 10;
        break;
    }
    if (d.msg != null) {
      if (typeof d.msg === 'string')
        $util.base64.decode(
          d.msg,
          (m.msg = $util.newBuffer($util.base64.length(d.msg))),
          0,
        );
      else if (d.msg.length >= 0) m.msg = d.msg;
    }
    if (d.signature != null) {
      if (typeof d.signature === 'string')
        $util.base64.decode(
          d.signature,
          (m.signature = $util.newBuffer($util.base64.length(d.signature))),
          0,
        );
      else if (d.signature.length >= 0) m.signature = d.signature;
    }
    if (d.sessionKey != null) {
      if (typeof d.sessionKey === 'string')
        $util.base64.decode(
          d.sessionKey,
          (m.sessionKey = $util.newBuffer($util.base64.length(d.sessionKey))),
          0,
        );
      else if (d.sessionKey.length >= 0) m.sessionKey = d.sessionKey;
    }
    if (d.remoteAttestation != null) {
      if (typeof d.remoteAttestation === 'string')
        $util.base64.decode(
          d.remoteAttestation,
          (m.remoteAttestation = $util.newBuffer(
            $util.base64.length(d.remoteAttestation),
          )),
          0,
        );
      else if (d.remoteAttestation.length >= 0)
        m.remoteAttestation = d.remoteAttestation;
    }
    if (d.metricData) {
      if (!Array.isArray(d.metricData))
        throw TypeError('.SignedMessage.metricData: array expected');
      m.metricData = [];
      for (var i = 0; i < d.metricData.length; ++i) {
        if (typeof d.metricData[i] !== 'object')
          throw TypeError('.SignedMessage.metricData: object expected');
        m.metricData[i] = $root.MetricData.fromObject(d.metricData[i]);
      }
    }
    if (d.serviceVersionInfo != null) {
      if (typeof d.serviceVersionInfo !== 'object')
        throw TypeError('.SignedMessage.serviceVersionInfo: object expected');
      m.serviceVersionInfo = $root.VersionInfo.fromObject(d.serviceVersionInfo);
    }
    switch (d.sessionKeyType) {
      case 'UNDEFINED':
      case 0:
        m.sessionKeyType = 0;
        break;
      default:
        if (typeof d.sessionKeyType === 'number') {
          m.sessionKeyType = d.sessionKeyType;
          break;
        }
        break;
      case 'WRAPPED_AES_KEY':
      case 1:
        m.sessionKeyType = 1;
        break;
      case 'EPHERMERAL_ECC_PUBLIC_KEY':
      case 2:
        m.sessionKeyType = 2;
        break;
    }
    if (d.oemcryptoCoreMessage != null) {
      if (typeof d.oemcryptoCoreMessage === 'string')
        $util.base64.decode(
          d.oemcryptoCoreMessage,
          (m.oemcryptoCoreMessage = $util.newBuffer(
            $util.base64.length(d.oemcryptoCoreMessage),
          )),
          0,
        );
      else if (d.oemcryptoCoreMessage.length >= 0)
        m.oemcryptoCoreMessage = d.oemcryptoCoreMessage;
    }
    return m;
  };

  /**
   * Creates a plain object from a SignedMessage message. Also converts values to other types if specified.
   * @function toObject
   * @memberof SignedMessage
   * @static
   * @param {SignedMessage} m SignedMessage
   * @param {$protobuf.IConversionOptions} [o] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  SignedMessage.toObject = function toObject(m, o) {
    if (!o) o = {};
    var d = {};
    if (o.arrays || o.defaults) {
      d.metricData = [];
    }
    if (o.defaults) {
      d.type = o.enums === String ? 'LICENSE_REQUEST' : 1;
      if (o.bytes === String) d.msg = '';
      else {
        d.msg = [];
        if (o.bytes !== Array) d.msg = $util.newBuffer(d.msg);
      }
      if (o.bytes === String) d.signature = '';
      else {
        d.signature = [];
        if (o.bytes !== Array) d.signature = $util.newBuffer(d.signature);
      }
      if (o.bytes === String) d.sessionKey = '';
      else {
        d.sessionKey = [];
        if (o.bytes !== Array) d.sessionKey = $util.newBuffer(d.sessionKey);
      }
      if (o.bytes === String) d.remoteAttestation = '';
      else {
        d.remoteAttestation = [];
        if (o.bytes !== Array)
          d.remoteAttestation = $util.newBuffer(d.remoteAttestation);
      }
      d.serviceVersionInfo = null;
      d.sessionKeyType = o.enums === String ? 'WRAPPED_AES_KEY' : 1;
      if (o.bytes === String) d.oemcryptoCoreMessage = '';
      else {
        d.oemcryptoCoreMessage = [];
        if (o.bytes !== Array)
          d.oemcryptoCoreMessage = $util.newBuffer(d.oemcryptoCoreMessage);
      }
    }
    if (m.type != null && m.hasOwnProperty('type')) {
      d.type =
        o.enums === String
          ? $root.SignedMessage.MessageType[m.type] === undefined
            ? m.type
            : $root.SignedMessage.MessageType[m.type]
          : m.type;
    }
    if (m.msg != null && m.hasOwnProperty('msg')) {
      d.msg =
        o.bytes === String
          ? $util.base64.encode(m.msg, 0, m.msg.length)
          : o.bytes === Array
            ? Array.prototype.slice.call(m.msg)
            : m.msg;
    }
    if (m.signature != null && m.hasOwnProperty('signature')) {
      d.signature =
        o.bytes === String
          ? $util.base64.encode(m.signature, 0, m.signature.length)
          : o.bytes === Array
            ? Array.prototype.slice.call(m.signature)
            : m.signature;
    }
    if (m.sessionKey != null && m.hasOwnProperty('sessionKey')) {
      d.sessionKey =
        o.bytes === String
          ? $util.base64.encode(m.sessionKey, 0, m.sessionKey.length)
          : o.bytes === Array
            ? Array.prototype.slice.call(m.sessionKey)
            : m.sessionKey;
    }
    if (m.remoteAttestation != null && m.hasOwnProperty('remoteAttestation')) {
      d.remoteAttestation =
        o.bytes === String
          ? $util.base64.encode(
              m.remoteAttestation,
              0,
              m.remoteAttestation.length,
            )
          : o.bytes === Array
            ? Array.prototype.slice.call(m.remoteAttestation)
            : m.remoteAttestation;
    }
    if (m.metricData && m.metricData.length) {
      d.metricData = [];
      for (var j = 0; j < m.metricData.length; ++j) {
        d.metricData[j] = $root.MetricData.toObject(m.metricData[j], o);
      }
    }
    if (
      m.serviceVersionInfo != null &&
      m.hasOwnProperty('serviceVersionInfo')
    ) {
      d.serviceVersionInfo = $root.VersionInfo.toObject(
        m.serviceVersionInfo,
        o,
      );
    }
    if (m.sessionKeyType != null && m.hasOwnProperty('sessionKeyType')) {
      d.sessionKeyType =
        o.enums === String
          ? $root.SignedMessage.SessionKeyType[m.sessionKeyType] === undefined
            ? m.sessionKeyType
            : $root.SignedMessage.SessionKeyType[m.sessionKeyType]
          : m.sessionKeyType;
    }
    if (
      m.oemcryptoCoreMessage != null &&
      m.hasOwnProperty('oemcryptoCoreMessage')
    ) {
      d.oemcryptoCoreMessage =
        o.bytes === String
          ? $util.base64.encode(
              m.oemcryptoCoreMessage,
              0,
              m.oemcryptoCoreMessage.length,
            )
          : o.bytes === Array
            ? Array.prototype.slice.call(m.oemcryptoCoreMessage)
            : m.oemcryptoCoreMessage;
    }
    return d;
  };

  /**
   * Converts this SignedMessage to JSON.
   * @function toJSON
   * @memberof SignedMessage
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  SignedMessage.prototype.toJSON = function toJSON() {
    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
  };

  /**
   * Gets the default type url for SignedMessage
   * @function getTypeUrl
   * @memberof SignedMessage
   * @static
   * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns {string} The default type url
   */
  SignedMessage.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
    if (typeUrlPrefix === undefined) {
      typeUrlPrefix = 'type.googleapis.com';
    }
    return typeUrlPrefix + '/SignedMessage';
  };

  /**
   * MessageType enum.
   * @name SignedMessage.MessageType
   * @enum {number}
   * @property {number} LICENSE_REQUEST=1 LICENSE_REQUEST value
   * @property {number} LICENSE=2 LICENSE value
   * @property {number} ERROR_RESPONSE=3 ERROR_RESPONSE value
   * @property {number} SERVICE_CERTIFICATE_REQUEST=4 SERVICE_CERTIFICATE_REQUEST value
   * @property {number} SERVICE_CERTIFICATE=5 SERVICE_CERTIFICATE value
   * @property {number} SUB_LICENSE=6 SUB_LICENSE value
   * @property {number} CAS_LICENSE_REQUEST=7 CAS_LICENSE_REQUEST value
   * @property {number} CAS_LICENSE=8 CAS_LICENSE value
   * @property {number} EXTERNAL_LICENSE_REQUEST=9 EXTERNAL_LICENSE_REQUEST value
   * @property {number} EXTERNAL_LICENSE=10 EXTERNAL_LICENSE value
   */
  SignedMessage.MessageType = (function () {
    const valuesById = {},
      values = Object.create(valuesById);
    values[(valuesById[1] = 'LICENSE_REQUEST')] = 1;
    values[(valuesById[2] = 'LICENSE')] = 2;
    values[(valuesById[3] = 'ERROR_RESPONSE')] = 3;
    values[(valuesById[4] = 'SERVICE_CERTIFICATE_REQUEST')] = 4;
    values[(valuesById[5] = 'SERVICE_CERTIFICATE')] = 5;
    values[(valuesById[6] = 'SUB_LICENSE')] = 6;
    values[(valuesById[7] = 'CAS_LICENSE_REQUEST')] = 7;
    values[(valuesById[8] = 'CAS_LICENSE')] = 8;
    values[(valuesById[9] = 'EXTERNAL_LICENSE_REQUEST')] = 9;
    values[(valuesById[10] = 'EXTERNAL_LICENSE')] = 10;
    return values;
  })();

  /**
   * SessionKeyType enum.
   * @name SignedMessage.SessionKeyType
   * @enum {number}
   * @property {number} UNDEFINED=0 UNDEFINED value
   * @property {number} WRAPPED_AES_KEY=1 WRAPPED_AES_KEY value
   * @property {number} EPHERMERAL_ECC_PUBLIC_KEY=2 EPHERMERAL_ECC_PUBLIC_KEY value
   */
  SignedMessage.SessionKeyType = (function () {
    const valuesById = {},
      values = Object.create(valuesById);
    values[(valuesById[0] = 'UNDEFINED')] = 0;
    values[(valuesById[1] = 'WRAPPED_AES_KEY')] = 1;
    values[(valuesById[2] = 'EPHERMERAL_ECC_PUBLIC_KEY')] = 2;
    return values;
  })();

  return SignedMessage;
})());

/**
 * HashAlgorithmProto enum.
 * @exports HashAlgorithmProto
 * @enum {number}
 * @property {number} HASH_ALGORITHM_UNSPECIFIED=0 HASH_ALGORITHM_UNSPECIFIED value
 * @property {number} HASH_ALGORITHM_SHA_1=1 HASH_ALGORITHM_SHA_1 value
 * @property {number} HASH_ALGORITHM_SHA_256=2 HASH_ALGORITHM_SHA_256 value
 * @property {number} HASH_ALGORITHM_SHA_384=3 HASH_ALGORITHM_SHA_384 value
 */
export const HashAlgorithmProto = ($root.HashAlgorithmProto = (() => {
  const valuesById = {},
    values = Object.create(valuesById);
  values[(valuesById[0] = 'HASH_ALGORITHM_UNSPECIFIED')] = 0;
  values[(valuesById[1] = 'HASH_ALGORITHM_SHA_1')] = 1;
  values[(valuesById[2] = 'HASH_ALGORITHM_SHA_256')] = 2;
  values[(valuesById[3] = 'HASH_ALGORITHM_SHA_384')] = 3;
  return values;
})());

export const ClientIdentification = ($root.ClientIdentification = (() => {
  /**
   * Properties of a ClientIdentification.
   * @exports IClientIdentification
   * @interface IClientIdentification
   * @property {ClientIdentification.TokenType|null} [type] ClientIdentification type
   * @property {Uint8Array|null} [token] ClientIdentification token
   * @property {Array.<ClientIdentification.INameValue>|null} [clientInfo] ClientIdentification clientInfo
   * @property {Uint8Array|null} [providerClientToken] ClientIdentification providerClientToken
   * @property {number|null} [licenseCounter] ClientIdentification licenseCounter
   * @property {ClientIdentification.IClientCapabilities|null} [clientCapabilities] ClientIdentification clientCapabilities
   * @property {Uint8Array|null} [vmpData] ClientIdentification vmpData
   * @property {Array.<ClientIdentification.IClientCredentials>|null} [deviceCredentials] ClientIdentification deviceCredentials
   */

  /**
   * Constructs a new ClientIdentification.
   * @exports ClientIdentification
   * @classdesc Represents a ClientIdentification.
   * @implements IClientIdentification
   * @constructor
   * @param {IClientIdentification=} [p] Properties to set
   */
  function ClientIdentification(p) {
    this.clientInfo = [];
    this.deviceCredentials = [];
    if (p)
      for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
        if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
  }

  /**
   * ClientIdentification type.
   * @member {ClientIdentification.TokenType} type
   * @memberof ClientIdentification
   * @instance
   */
  ClientIdentification.prototype.type = 0;

  /**
   * ClientIdentification token.
   * @member {Uint8Array} token
   * @memberof ClientIdentification
   * @instance
   */
  ClientIdentification.prototype.token = $util.newBuffer([]);

  /**
   * ClientIdentification clientInfo.
   * @member {Array.<ClientIdentification.INameValue>} clientInfo
   * @memberof ClientIdentification
   * @instance
   */
  ClientIdentification.prototype.clientInfo = $util.emptyArray;

  /**
   * ClientIdentification providerClientToken.
   * @member {Uint8Array} providerClientToken
   * @memberof ClientIdentification
   * @instance
   */
  ClientIdentification.prototype.providerClientToken = $util.newBuffer([]);

  /**
   * ClientIdentification licenseCounter.
   * @member {number} licenseCounter
   * @memberof ClientIdentification
   * @instance
   */
  ClientIdentification.prototype.licenseCounter = 0;

  /**
   * ClientIdentification clientCapabilities.
   * @member {ClientIdentification.IClientCapabilities|null|undefined} clientCapabilities
   * @memberof ClientIdentification
   * @instance
   */
  ClientIdentification.prototype.clientCapabilities = null;

  /**
   * ClientIdentification vmpData.
   * @member {Uint8Array} vmpData
   * @memberof ClientIdentification
   * @instance
   */
  ClientIdentification.prototype.vmpData = $util.newBuffer([]);

  /**
   * ClientIdentification deviceCredentials.
   * @member {Array.<ClientIdentification.IClientCredentials>} deviceCredentials
   * @memberof ClientIdentification
   * @instance
   */
  ClientIdentification.prototype.deviceCredentials = $util.emptyArray;

  /**
   * Creates a new ClientIdentification instance using the specified properties.
   * @function create
   * @memberof ClientIdentification
   * @static
   * @param {IClientIdentification=} [properties] Properties to set
   * @returns {ClientIdentification} ClientIdentification instance
   */
  ClientIdentification.create = function create(properties) {
    return new ClientIdentification(properties);
  };

  /**
   * Encodes the specified ClientIdentification message. Does not implicitly {@link ClientIdentification.verify|verify} messages.
   * @function encode
   * @memberof ClientIdentification
   * @static
   * @param {IClientIdentification} m ClientIdentification message or plain object to encode
   * @param {$protobuf.Writer} [w] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  ClientIdentification.encode = function encode(m, w) {
    if (!w) w = $Writer.create();
    if (m.type != null && Object.hasOwnProperty.call(m, 'type'))
      w.uint32(8).int32(m.type);
    if (m.token != null && Object.hasOwnProperty.call(m, 'token'))
      w.uint32(18).bytes(m.token);
    if (m.clientInfo != null && m.clientInfo.length) {
      for (var i = 0; i < m.clientInfo.length; ++i)
        $root.ClientIdentification.NameValue.encode(
          m.clientInfo[i],
          w.uint32(26).fork(),
        ).ldelim();
    }
    if (
      m.providerClientToken != null &&
      Object.hasOwnProperty.call(m, 'providerClientToken')
    )
      w.uint32(34).bytes(m.providerClientToken);
    if (
      m.licenseCounter != null &&
      Object.hasOwnProperty.call(m, 'licenseCounter')
    )
      w.uint32(40).uint32(m.licenseCounter);
    if (
      m.clientCapabilities != null &&
      Object.hasOwnProperty.call(m, 'clientCapabilities')
    )
      $root.ClientIdentification.ClientCapabilities.encode(
        m.clientCapabilities,
        w.uint32(50).fork(),
      ).ldelim();
    if (m.vmpData != null && Object.hasOwnProperty.call(m, 'vmpData'))
      w.uint32(58).bytes(m.vmpData);
    if (m.deviceCredentials != null && m.deviceCredentials.length) {
      for (var i = 0; i < m.deviceCredentials.length; ++i)
        $root.ClientIdentification.ClientCredentials.encode(
          m.deviceCredentials[i],
          w.uint32(66).fork(),
        ).ldelim();
    }
    return w;
  };

  /**
   * Encodes the specified ClientIdentification message, length delimited. Does not implicitly {@link ClientIdentification.verify|verify} messages.
   * @function encodeDelimited
   * @memberof ClientIdentification
   * @static
   * @param {IClientIdentification} message ClientIdentification message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  ClientIdentification.encodeDelimited = function encodeDelimited(
    message,
    writer,
  ) {
    return this.encode(message, writer).ldelim();
  };

  /**
   * Decodes a ClientIdentification message from the specified reader or buffer.
   * @function decode
   * @memberof ClientIdentification
   * @static
   * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
   * @param {number} [l] Message length if known beforehand
   * @returns {ClientIdentification} ClientIdentification
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  ClientIdentification.decode = function decode(r, l) {
    if (!(r instanceof $Reader)) r = $Reader.create(r);
    var c = l === undefined ? r.len : r.pos + l,
      m = new $root.ClientIdentification();
    while (r.pos < c) {
      var t = r.uint32();
      switch (t >>> 3) {
        case 1: {
          m.type = r.int32();
          break;
        }
        case 2: {
          m.token = r.bytes();
          break;
        }
        case 3: {
          if (!(m.clientInfo && m.clientInfo.length)) m.clientInfo = [];
          m.clientInfo.push(
            $root.ClientIdentification.NameValue.decode(r, r.uint32()),
          );
          break;
        }
        case 4: {
          m.providerClientToken = r.bytes();
          break;
        }
        case 5: {
          m.licenseCounter = r.uint32();
          break;
        }
        case 6: {
          m.clientCapabilities =
            $root.ClientIdentification.ClientCapabilities.decode(r, r.uint32());
          break;
        }
        case 7: {
          m.vmpData = r.bytes();
          break;
        }
        case 8: {
          if (!(m.deviceCredentials && m.deviceCredentials.length))
            m.deviceCredentials = [];
          m.deviceCredentials.push(
            $root.ClientIdentification.ClientCredentials.decode(r, r.uint32()),
          );
          break;
        }
        default:
          r.skipType(t & 7);
          break;
      }
    }
    return m;
  };

  /**
   * Decodes a ClientIdentification message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof ClientIdentification
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {ClientIdentification} ClientIdentification
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  ClientIdentification.decodeDelimited = function decodeDelimited(reader) {
    if (!(reader instanceof $Reader)) reader = new $Reader(reader);
    return this.decode(reader, reader.uint32());
  };

  /**
   * Creates a ClientIdentification message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof ClientIdentification
   * @static
   * @param {Object.<string,*>} d Plain object
   * @returns {ClientIdentification} ClientIdentification
   */
  ClientIdentification.fromObject = function fromObject(d) {
    if (d instanceof $root.ClientIdentification) return d;
    var m = new $root.ClientIdentification();
    switch (d.type) {
      default:
        if (typeof d.type === 'number') {
          m.type = d.type;
          break;
        }
        break;
      case 'KEYBOX':
      case 0:
        m.type = 0;
        break;
      case 'DRM_DEVICE_CERTIFICATE':
      case 1:
        m.type = 1;
        break;
      case 'REMOTE_ATTESTATION_CERTIFICATE':
      case 2:
        m.type = 2;
        break;
      case 'OEM_DEVICE_CERTIFICATE':
      case 3:
        m.type = 3;
        break;
    }
    if (d.token != null) {
      if (typeof d.token === 'string')
        $util.base64.decode(
          d.token,
          (m.token = $util.newBuffer($util.base64.length(d.token))),
          0,
        );
      else if (d.token.length >= 0) m.token = d.token;
    }
    if (d.clientInfo) {
      if (!Array.isArray(d.clientInfo))
        throw TypeError('.ClientIdentification.clientInfo: array expected');
      m.clientInfo = [];
      for (var i = 0; i < d.clientInfo.length; ++i) {
        if (typeof d.clientInfo[i] !== 'object')
          throw TypeError('.ClientIdentification.clientInfo: object expected');
        m.clientInfo[i] = $root.ClientIdentification.NameValue.fromObject(
          d.clientInfo[i],
        );
      }
    }
    if (d.providerClientToken != null) {
      if (typeof d.providerClientToken === 'string')
        $util.base64.decode(
          d.providerClientToken,
          (m.providerClientToken = $util.newBuffer(
            $util.base64.length(d.providerClientToken),
          )),
          0,
        );
      else if (d.providerClientToken.length >= 0)
        m.providerClientToken = d.providerClientToken;
    }
    if (d.licenseCounter != null) {
      m.licenseCounter = d.licenseCounter >>> 0;
    }
    if (d.clientCapabilities != null) {
      if (typeof d.clientCapabilities !== 'object')
        throw TypeError(
          '.ClientIdentification.clientCapabilities: object expected',
        );
      m.clientCapabilities =
        $root.ClientIdentification.ClientCapabilities.fromObject(
          d.clientCapabilities,
        );
    }
    if (d.vmpData != null) {
      if (typeof d.vmpData === 'string')
        $util.base64.decode(
          d.vmpData,
          (m.vmpData = $util.newBuffer($util.base64.length(d.vmpData))),
          0,
        );
      else if (d.vmpData.length >= 0) m.vmpData = d.vmpData;
    }
    if (d.deviceCredentials) {
      if (!Array.isArray(d.deviceCredentials))
        throw TypeError(
          '.ClientIdentification.deviceCredentials: array expected',
        );
      m.deviceCredentials = [];
      for (var i = 0; i < d.deviceCredentials.length; ++i) {
        if (typeof d.deviceCredentials[i] !== 'object')
          throw TypeError(
            '.ClientIdentification.deviceCredentials: object expected',
          );
        m.deviceCredentials[i] =
          $root.ClientIdentification.ClientCredentials.fromObject(
            d.deviceCredentials[i],
          );
      }
    }
    return m;
  };

  /**
   * Creates a plain object from a ClientIdentification message. Also converts values to other types if specified.
   * @function toObject
   * @memberof ClientIdentification
   * @static
   * @param {ClientIdentification} m ClientIdentification
   * @param {$protobuf.IConversionOptions} [o] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  ClientIdentification.toObject = function toObject(m, o) {
    if (!o) o = {};
    var d = {};
    if (o.arrays || o.defaults) {
      d.clientInfo = [];
      d.deviceCredentials = [];
    }
    if (o.defaults) {
      d.type = o.enums === String ? 'KEYBOX' : 0;
      if (o.bytes === String) d.token = '';
      else {
        d.token = [];
        if (o.bytes !== Array) d.token = $util.newBuffer(d.token);
      }
      if (o.bytes === String) d.providerClientToken = '';
      else {
        d.providerClientToken = [];
        if (o.bytes !== Array)
          d.providerClientToken = $util.newBuffer(d.providerClientToken);
      }
      d.licenseCounter = 0;
      d.clientCapabilities = null;
      if (o.bytes === String) d.vmpData = '';
      else {
        d.vmpData = [];
        if (o.bytes !== Array) d.vmpData = $util.newBuffer(d.vmpData);
      }
    }
    if (m.type != null && m.hasOwnProperty('type')) {
      d.type =
        o.enums === String
          ? $root.ClientIdentification.TokenType[m.type] === undefined
            ? m.type
            : $root.ClientIdentification.TokenType[m.type]
          : m.type;
    }
    if (m.token != null && m.hasOwnProperty('token')) {
      d.token =
        o.bytes === String
          ? $util.base64.encode(m.token, 0, m.token.length)
          : o.bytes === Array
            ? Array.prototype.slice.call(m.token)
            : m.token;
    }
    if (m.clientInfo && m.clientInfo.length) {
      d.clientInfo = [];
      for (var j = 0; j < m.clientInfo.length; ++j) {
        d.clientInfo[j] = $root.ClientIdentification.NameValue.toObject(
          m.clientInfo[j],
          o,
        );
      }
    }
    if (
      m.providerClientToken != null &&
      m.hasOwnProperty('providerClientToken')
    ) {
      d.providerClientToken =
        o.bytes === String
          ? $util.base64.encode(
              m.providerClientToken,
              0,
              m.providerClientToken.length,
            )
          : o.bytes === Array
            ? Array.prototype.slice.call(m.providerClientToken)
            : m.providerClientToken;
    }
    if (m.licenseCounter != null && m.hasOwnProperty('licenseCounter')) {
      d.licenseCounter = m.licenseCounter;
    }
    if (
      m.clientCapabilities != null &&
      m.hasOwnProperty('clientCapabilities')
    ) {
      d.clientCapabilities =
        $root.ClientIdentification.ClientCapabilities.toObject(
          m.clientCapabilities,
          o,
        );
    }
    if (m.vmpData != null && m.hasOwnProperty('vmpData')) {
      d.vmpData =
        o.bytes === String
          ? $util.base64.encode(m.vmpData, 0, m.vmpData.length)
          : o.bytes === Array
            ? Array.prototype.slice.call(m.vmpData)
            : m.vmpData;
    }
    if (m.deviceCredentials && m.deviceCredentials.length) {
      d.deviceCredentials = [];
      for (var j = 0; j < m.deviceCredentials.length; ++j) {
        d.deviceCredentials[j] =
          $root.ClientIdentification.ClientCredentials.toObject(
            m.deviceCredentials[j],
            o,
          );
      }
    }
    return d;
  };

  /**
   * Converts this ClientIdentification to JSON.
   * @function toJSON
   * @memberof ClientIdentification
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  ClientIdentification.prototype.toJSON = function toJSON() {
    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
  };

  /**
   * Gets the default type url for ClientIdentification
   * @function getTypeUrl
   * @memberof ClientIdentification
   * @static
   * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns {string} The default type url
   */
  ClientIdentification.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
    if (typeUrlPrefix === undefined) {
      typeUrlPrefix = 'type.googleapis.com';
    }
    return typeUrlPrefix + '/ClientIdentification';
  };

  /**
   * TokenType enum.
   * @name ClientIdentification.TokenType
   * @enum {number}
   * @property {number} KEYBOX=0 KEYBOX value
   * @property {number} DRM_DEVICE_CERTIFICATE=1 DRM_DEVICE_CERTIFICATE value
   * @property {number} REMOTE_ATTESTATION_CERTIFICATE=2 REMOTE_ATTESTATION_CERTIFICATE value
   * @property {number} OEM_DEVICE_CERTIFICATE=3 OEM_DEVICE_CERTIFICATE value
   */
  ClientIdentification.TokenType = (function () {
    const valuesById = {},
      values = Object.create(valuesById);
    values[(valuesById[0] = 'KEYBOX')] = 0;
    values[(valuesById[1] = 'DRM_DEVICE_CERTIFICATE')] = 1;
    values[(valuesById[2] = 'REMOTE_ATTESTATION_CERTIFICATE')] = 2;
    values[(valuesById[3] = 'OEM_DEVICE_CERTIFICATE')] = 3;
    return values;
  })();

  ClientIdentification.NameValue = (function () {
    /**
     * Properties of a NameValue.
     * @memberof ClientIdentification
     * @interface INameValue
     * @property {string|null} [name] NameValue name
     * @property {string|null} [value] NameValue value
     */

    /**
     * Constructs a new NameValue.
     * @memberof ClientIdentification
     * @classdesc Represents a NameValue.
     * @implements INameValue
     * @constructor
     * @param {ClientIdentification.INameValue=} [p] Properties to set
     */
    function NameValue(p) {
      if (p)
        for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
          if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
    }

    /**
     * NameValue name.
     * @member {string} name
     * @memberof ClientIdentification.NameValue
     * @instance
     */
    NameValue.prototype.name = '';

    /**
     * NameValue value.
     * @member {string} value
     * @memberof ClientIdentification.NameValue
     * @instance
     */
    NameValue.prototype.value = '';

    /**
     * Creates a new NameValue instance using the specified properties.
     * @function create
     * @memberof ClientIdentification.NameValue
     * @static
     * @param {ClientIdentification.INameValue=} [properties] Properties to set
     * @returns {ClientIdentification.NameValue} NameValue instance
     */
    NameValue.create = function create(properties) {
      return new NameValue(properties);
    };

    /**
     * Encodes the specified NameValue message. Does not implicitly {@link ClientIdentification.NameValue.verify|verify} messages.
     * @function encode
     * @memberof ClientIdentification.NameValue
     * @static
     * @param {ClientIdentification.INameValue} m NameValue message or plain object to encode
     * @param {$protobuf.Writer} [w] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    NameValue.encode = function encode(m, w) {
      if (!w) w = $Writer.create();
      if (m.name != null && Object.hasOwnProperty.call(m, 'name'))
        w.uint32(10).string(m.name);
      if (m.value != null && Object.hasOwnProperty.call(m, 'value'))
        w.uint32(18).string(m.value);
      return w;
    };

    /**
     * Encodes the specified NameValue message, length delimited. Does not implicitly {@link ClientIdentification.NameValue.verify|verify} messages.
     * @function encodeDelimited
     * @memberof ClientIdentification.NameValue
     * @static
     * @param {ClientIdentification.INameValue} message NameValue message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    NameValue.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a NameValue message from the specified reader or buffer.
     * @function decode
     * @memberof ClientIdentification.NameValue
     * @static
     * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
     * @param {number} [l] Message length if known beforehand
     * @returns {ClientIdentification.NameValue} NameValue
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    NameValue.decode = function decode(r, l) {
      if (!(r instanceof $Reader)) r = $Reader.create(r);
      var c = l === undefined ? r.len : r.pos + l,
        m = new $root.ClientIdentification.NameValue();
      while (r.pos < c) {
        var t = r.uint32();
        switch (t >>> 3) {
          case 1: {
            m.name = r.string();
            break;
          }
          case 2: {
            m.value = r.string();
            break;
          }
          default:
            r.skipType(t & 7);
            break;
        }
      }
      return m;
    };

    /**
     * Decodes a NameValue message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof ClientIdentification.NameValue
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {ClientIdentification.NameValue} NameValue
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    NameValue.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Creates a NameValue message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof ClientIdentification.NameValue
     * @static
     * @param {Object.<string,*>} d Plain object
     * @returns {ClientIdentification.NameValue} NameValue
     */
    NameValue.fromObject = function fromObject(d) {
      if (d instanceof $root.ClientIdentification.NameValue) return d;
      var m = new $root.ClientIdentification.NameValue();
      if (d.name != null) {
        m.name = String(d.name);
      }
      if (d.value != null) {
        m.value = String(d.value);
      }
      return m;
    };

    /**
     * Creates a plain object from a NameValue message. Also converts values to other types if specified.
     * @function toObject
     * @memberof ClientIdentification.NameValue
     * @static
     * @param {ClientIdentification.NameValue} m NameValue
     * @param {$protobuf.IConversionOptions} [o] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    NameValue.toObject = function toObject(m, o) {
      if (!o) o = {};
      var d = {};
      if (o.defaults) {
        d.name = '';
        d.value = '';
      }
      if (m.name != null && m.hasOwnProperty('name')) {
        d.name = m.name;
      }
      if (m.value != null && m.hasOwnProperty('value')) {
        d.value = m.value;
      }
      return d;
    };

    /**
     * Converts this NameValue to JSON.
     * @function toJSON
     * @memberof ClientIdentification.NameValue
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    NameValue.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for NameValue
     * @function getTypeUrl
     * @memberof ClientIdentification.NameValue
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    NameValue.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = 'type.googleapis.com';
      }
      return typeUrlPrefix + '/ClientIdentification.NameValue';
    };

    return NameValue;
  })();

  ClientIdentification.ClientCapabilities = (function () {
    /**
     * Properties of a ClientCapabilities.
     * @memberof ClientIdentification
     * @interface IClientCapabilities
     * @property {boolean|null} [clientToken] ClientCapabilities clientToken
     * @property {boolean|null} [sessionToken] ClientCapabilities sessionToken
     * @property {boolean|null} [videoResolutionConstraints] ClientCapabilities videoResolutionConstraints
     * @property {ClientIdentification.ClientCapabilities.HdcpVersion|null} [maxHdcpVersion] ClientCapabilities maxHdcpVersion
     * @property {number|null} [oemCryptoApiVersion] ClientCapabilities oemCryptoApiVersion
     * @property {boolean|null} [antiRollbackUsageTable] ClientCapabilities antiRollbackUsageTable
     * @property {number|null} [srmVersion] ClientCapabilities srmVersion
     * @property {boolean|null} [canUpdateSrm] ClientCapabilities canUpdateSrm
     * @property {Array.<ClientIdentification.ClientCapabilities.CertificateKeyType>|null} [supportedCertificateKeyType] ClientCapabilities supportedCertificateKeyType
     * @property {ClientIdentification.ClientCapabilities.AnalogOutputCapabilities|null} [analogOutputCapabilities] ClientCapabilities analogOutputCapabilities
     * @property {boolean|null} [canDisableAnalogOutput] ClientCapabilities canDisableAnalogOutput
     * @property {number|null} [resourceRatingTier] ClientCapabilities resourceRatingTier
     */

    /**
     * Constructs a new ClientCapabilities.
     * @memberof ClientIdentification
     * @classdesc Represents a ClientCapabilities.
     * @implements IClientCapabilities
     * @constructor
     * @param {ClientIdentification.IClientCapabilities=} [p] Properties to set
     */
    function ClientCapabilities(p) {
      this.supportedCertificateKeyType = [];
      if (p)
        for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
          if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
    }

    /**
     * ClientCapabilities clientToken.
     * @member {boolean} clientToken
     * @memberof ClientIdentification.ClientCapabilities
     * @instance
     */
    ClientCapabilities.prototype.clientToken = false;

    /**
     * ClientCapabilities sessionToken.
     * @member {boolean} sessionToken
     * @memberof ClientIdentification.ClientCapabilities
     * @instance
     */
    ClientCapabilities.prototype.sessionToken = false;

    /**
     * ClientCapabilities videoResolutionConstraints.
     * @member {boolean} videoResolutionConstraints
     * @memberof ClientIdentification.ClientCapabilities
     * @instance
     */
    ClientCapabilities.prototype.videoResolutionConstraints = false;

    /**
     * ClientCapabilities maxHdcpVersion.
     * @member {ClientIdentification.ClientCapabilities.HdcpVersion} maxHdcpVersion
     * @memberof ClientIdentification.ClientCapabilities
     * @instance
     */
    ClientCapabilities.prototype.maxHdcpVersion = 0;

    /**
     * ClientCapabilities oemCryptoApiVersion.
     * @member {number} oemCryptoApiVersion
     * @memberof ClientIdentification.ClientCapabilities
     * @instance
     */
    ClientCapabilities.prototype.oemCryptoApiVersion = 0;

    /**
     * ClientCapabilities antiRollbackUsageTable.
     * @member {boolean} antiRollbackUsageTable
     * @memberof ClientIdentification.ClientCapabilities
     * @instance
     */
    ClientCapabilities.prototype.antiRollbackUsageTable = false;

    /**
     * ClientCapabilities srmVersion.
     * @member {number} srmVersion
     * @memberof ClientIdentification.ClientCapabilities
     * @instance
     */
    ClientCapabilities.prototype.srmVersion = 0;

    /**
     * ClientCapabilities canUpdateSrm.
     * @member {boolean} canUpdateSrm
     * @memberof ClientIdentification.ClientCapabilities
     * @instance
     */
    ClientCapabilities.prototype.canUpdateSrm = false;

    /**
     * ClientCapabilities supportedCertificateKeyType.
     * @member {Array.<ClientIdentification.ClientCapabilities.CertificateKeyType>} supportedCertificateKeyType
     * @memberof ClientIdentification.ClientCapabilities
     * @instance
     */
    ClientCapabilities.prototype.supportedCertificateKeyType = $util.emptyArray;

    /**
     * ClientCapabilities analogOutputCapabilities.
     * @member {ClientIdentification.ClientCapabilities.AnalogOutputCapabilities} analogOutputCapabilities
     * @memberof ClientIdentification.ClientCapabilities
     * @instance
     */
    ClientCapabilities.prototype.analogOutputCapabilities = 0;

    /**
     * ClientCapabilities canDisableAnalogOutput.
     * @member {boolean} canDisableAnalogOutput
     * @memberof ClientIdentification.ClientCapabilities
     * @instance
     */
    ClientCapabilities.prototype.canDisableAnalogOutput = false;

    /**
     * ClientCapabilities resourceRatingTier.
     * @member {number} resourceRatingTier
     * @memberof ClientIdentification.ClientCapabilities
     * @instance
     */
    ClientCapabilities.prototype.resourceRatingTier = 0;

    /**
     * Creates a new ClientCapabilities instance using the specified properties.
     * @function create
     * @memberof ClientIdentification.ClientCapabilities
     * @static
     * @param {ClientIdentification.IClientCapabilities=} [properties] Properties to set
     * @returns {ClientIdentification.ClientCapabilities} ClientCapabilities instance
     */
    ClientCapabilities.create = function create(properties) {
      return new ClientCapabilities(properties);
    };

    /**
     * Encodes the specified ClientCapabilities message. Does not implicitly {@link ClientIdentification.ClientCapabilities.verify|verify} messages.
     * @function encode
     * @memberof ClientIdentification.ClientCapabilities
     * @static
     * @param {ClientIdentification.IClientCapabilities} m ClientCapabilities message or plain object to encode
     * @param {$protobuf.Writer} [w] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ClientCapabilities.encode = function encode(m, w) {
      if (!w) w = $Writer.create();
      if (m.clientToken != null && Object.hasOwnProperty.call(m, 'clientToken'))
        w.uint32(8).bool(m.clientToken);
      if (
        m.sessionToken != null &&
        Object.hasOwnProperty.call(m, 'sessionToken')
      )
        w.uint32(16).bool(m.sessionToken);
      if (
        m.videoResolutionConstraints != null &&
        Object.hasOwnProperty.call(m, 'videoResolutionConstraints')
      )
        w.uint32(24).bool(m.videoResolutionConstraints);
      if (
        m.maxHdcpVersion != null &&
        Object.hasOwnProperty.call(m, 'maxHdcpVersion')
      )
        w.uint32(32).int32(m.maxHdcpVersion);
      if (
        m.oemCryptoApiVersion != null &&
        Object.hasOwnProperty.call(m, 'oemCryptoApiVersion')
      )
        w.uint32(40).uint32(m.oemCryptoApiVersion);
      if (
        m.antiRollbackUsageTable != null &&
        Object.hasOwnProperty.call(m, 'antiRollbackUsageTable')
      )
        w.uint32(48).bool(m.antiRollbackUsageTable);
      if (m.srmVersion != null && Object.hasOwnProperty.call(m, 'srmVersion'))
        w.uint32(56).uint32(m.srmVersion);
      if (
        m.canUpdateSrm != null &&
        Object.hasOwnProperty.call(m, 'canUpdateSrm')
      )
        w.uint32(64).bool(m.canUpdateSrm);
      if (
        m.supportedCertificateKeyType != null &&
        m.supportedCertificateKeyType.length
      ) {
        for (var i = 0; i < m.supportedCertificateKeyType.length; ++i)
          w.uint32(72).int32(m.supportedCertificateKeyType[i]);
      }
      if (
        m.analogOutputCapabilities != null &&
        Object.hasOwnProperty.call(m, 'analogOutputCapabilities')
      )
        w.uint32(80).int32(m.analogOutputCapabilities);
      if (
        m.canDisableAnalogOutput != null &&
        Object.hasOwnProperty.call(m, 'canDisableAnalogOutput')
      )
        w.uint32(88).bool(m.canDisableAnalogOutput);
      if (
        m.resourceRatingTier != null &&
        Object.hasOwnProperty.call(m, 'resourceRatingTier')
      )
        w.uint32(96).uint32(m.resourceRatingTier);
      return w;
    };

    /**
     * Encodes the specified ClientCapabilities message, length delimited. Does not implicitly {@link ClientIdentification.ClientCapabilities.verify|verify} messages.
     * @function encodeDelimited
     * @memberof ClientIdentification.ClientCapabilities
     * @static
     * @param {ClientIdentification.IClientCapabilities} message ClientCapabilities message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ClientCapabilities.encodeDelimited = function encodeDelimited(
      message,
      writer,
    ) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a ClientCapabilities message from the specified reader or buffer.
     * @function decode
     * @memberof ClientIdentification.ClientCapabilities
     * @static
     * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
     * @param {number} [l] Message length if known beforehand
     * @returns {ClientIdentification.ClientCapabilities} ClientCapabilities
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ClientCapabilities.decode = function decode(r, l) {
      if (!(r instanceof $Reader)) r = $Reader.create(r);
      var c = l === undefined ? r.len : r.pos + l,
        m = new $root.ClientIdentification.ClientCapabilities();
      while (r.pos < c) {
        var t = r.uint32();
        switch (t >>> 3) {
          case 1: {
            m.clientToken = r.bool();
            break;
          }
          case 2: {
            m.sessionToken = r.bool();
            break;
          }
          case 3: {
            m.videoResolutionConstraints = r.bool();
            break;
          }
          case 4: {
            m.maxHdcpVersion = r.int32();
            break;
          }
          case 5: {
            m.oemCryptoApiVersion = r.uint32();
            break;
          }
          case 6: {
            m.antiRollbackUsageTable = r.bool();
            break;
          }
          case 7: {
            m.srmVersion = r.uint32();
            break;
          }
          case 8: {
            m.canUpdateSrm = r.bool();
            break;
          }
          case 9: {
            if (
              !(
                m.supportedCertificateKeyType &&
                m.supportedCertificateKeyType.length
              )
            )
              m.supportedCertificateKeyType = [];
            if ((t & 7) === 2) {
              var c2 = r.uint32() + r.pos;
              while (r.pos < c2) m.supportedCertificateKeyType.push(r.int32());
            } else m.supportedCertificateKeyType.push(r.int32());
            break;
          }
          case 10: {
            m.analogOutputCapabilities = r.int32();
            break;
          }
          case 11: {
            m.canDisableAnalogOutput = r.bool();
            break;
          }
          case 12: {
            m.resourceRatingTier = r.uint32();
            break;
          }
          default:
            r.skipType(t & 7);
            break;
        }
      }
      return m;
    };

    /**
     * Decodes a ClientCapabilities message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof ClientIdentification.ClientCapabilities
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {ClientIdentification.ClientCapabilities} ClientCapabilities
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ClientCapabilities.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Creates a ClientCapabilities message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof ClientIdentification.ClientCapabilities
     * @static
     * @param {Object.<string,*>} d Plain object
     * @returns {ClientIdentification.ClientCapabilities} ClientCapabilities
     */
    ClientCapabilities.fromObject = function fromObject(d) {
      if (d instanceof $root.ClientIdentification.ClientCapabilities) return d;
      var m = new $root.ClientIdentification.ClientCapabilities();
      if (d.clientToken != null) {
        m.clientToken = Boolean(d.clientToken);
      }
      if (d.sessionToken != null) {
        m.sessionToken = Boolean(d.sessionToken);
      }
      if (d.videoResolutionConstraints != null) {
        m.videoResolutionConstraints = Boolean(d.videoResolutionConstraints);
      }
      switch (d.maxHdcpVersion) {
        default:
          if (typeof d.maxHdcpVersion === 'number') {
            m.maxHdcpVersion = d.maxHdcpVersion;
            break;
          }
          break;
        case 'HDCP_NONE':
        case 0:
          m.maxHdcpVersion = 0;
          break;
        case 'HDCP_V1':
        case 1:
          m.maxHdcpVersion = 1;
          break;
        case 'HDCP_V2':
        case 2:
          m.maxHdcpVersion = 2;
          break;
        case 'HDCP_V2_1':
        case 3:
          m.maxHdcpVersion = 3;
          break;
        case 'HDCP_V2_2':
        case 4:
          m.maxHdcpVersion = 4;
          break;
        case 'HDCP_V2_3':
        case 5:
          m.maxHdcpVersion = 5;
          break;
        case 'HDCP_NO_DIGITAL_OUTPUT':
        case 255:
          m.maxHdcpVersion = 255;
          break;
      }
      if (d.oemCryptoApiVersion != null) {
        m.oemCryptoApiVersion = d.oemCryptoApiVersion >>> 0;
      }
      if (d.antiRollbackUsageTable != null) {
        m.antiRollbackUsageTable = Boolean(d.antiRollbackUsageTable);
      }
      if (d.srmVersion != null) {
        m.srmVersion = d.srmVersion >>> 0;
      }
      if (d.canUpdateSrm != null) {
        m.canUpdateSrm = Boolean(d.canUpdateSrm);
      }
      if (d.supportedCertificateKeyType) {
        if (!Array.isArray(d.supportedCertificateKeyType))
          throw TypeError(
            '.ClientIdentification.ClientCapabilities.supportedCertificateKeyType: array expected',
          );
        m.supportedCertificateKeyType = [];
        for (var i = 0; i < d.supportedCertificateKeyType.length; ++i) {
          switch (d.supportedCertificateKeyType[i]) {
            default:
              if (typeof d.supportedCertificateKeyType[i] === 'number') {
                m.supportedCertificateKeyType[i] =
                  d.supportedCertificateKeyType[i];
                break;
              }
            case 'RSA_2048':
            case 0:
              m.supportedCertificateKeyType[i] = 0;
              break;
            case 'RSA_3072':
            case 1:
              m.supportedCertificateKeyType[i] = 1;
              break;
            case 'ECC_SECP256R1':
            case 2:
              m.supportedCertificateKeyType[i] = 2;
              break;
            case 'ECC_SECP384R1':
            case 3:
              m.supportedCertificateKeyType[i] = 3;
              break;
            case 'ECC_SECP521R1':
            case 4:
              m.supportedCertificateKeyType[i] = 4;
              break;
          }
        }
      }
      switch (d.analogOutputCapabilities) {
        default:
          if (typeof d.analogOutputCapabilities === 'number') {
            m.analogOutputCapabilities = d.analogOutputCapabilities;
            break;
          }
          break;
        case 'ANALOG_OUTPUT_UNKNOWN':
        case 0:
          m.analogOutputCapabilities = 0;
          break;
        case 'ANALOG_OUTPUT_NONE':
        case 1:
          m.analogOutputCapabilities = 1;
          break;
        case 'ANALOG_OUTPUT_SUPPORTED':
        case 2:
          m.analogOutputCapabilities = 2;
          break;
        case 'ANALOG_OUTPUT_SUPPORTS_CGMS_A':
        case 3:
          m.analogOutputCapabilities = 3;
          break;
      }
      if (d.canDisableAnalogOutput != null) {
        m.canDisableAnalogOutput = Boolean(d.canDisableAnalogOutput);
      }
      if (d.resourceRatingTier != null) {
        m.resourceRatingTier = d.resourceRatingTier >>> 0;
      }
      return m;
    };

    /**
     * Creates a plain object from a ClientCapabilities message. Also converts values to other types if specified.
     * @function toObject
     * @memberof ClientIdentification.ClientCapabilities
     * @static
     * @param {ClientIdentification.ClientCapabilities} m ClientCapabilities
     * @param {$protobuf.IConversionOptions} [o] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    ClientCapabilities.toObject = function toObject(m, o) {
      if (!o) o = {};
      var d = {};
      if (o.arrays || o.defaults) {
        d.supportedCertificateKeyType = [];
      }
      if (o.defaults) {
        d.clientToken = false;
        d.sessionToken = false;
        d.videoResolutionConstraints = false;
        d.maxHdcpVersion = o.enums === String ? 'HDCP_NONE' : 0;
        d.oemCryptoApiVersion = 0;
        d.antiRollbackUsageTable = false;
        d.srmVersion = 0;
        d.canUpdateSrm = false;
        d.analogOutputCapabilities =
          o.enums === String ? 'ANALOG_OUTPUT_UNKNOWN' : 0;
        d.canDisableAnalogOutput = false;
        d.resourceRatingTier = 0;
      }
      if (m.clientToken != null && m.hasOwnProperty('clientToken')) {
        d.clientToken = m.clientToken;
      }
      if (m.sessionToken != null && m.hasOwnProperty('sessionToken')) {
        d.sessionToken = m.sessionToken;
      }
      if (
        m.videoResolutionConstraints != null &&
        m.hasOwnProperty('videoResolutionConstraints')
      ) {
        d.videoResolutionConstraints = m.videoResolutionConstraints;
      }
      if (m.maxHdcpVersion != null && m.hasOwnProperty('maxHdcpVersion')) {
        d.maxHdcpVersion =
          o.enums === String
            ? $root.ClientIdentification.ClientCapabilities.HdcpVersion[
                m.maxHdcpVersion
              ] === undefined
              ? m.maxHdcpVersion
              : $root.ClientIdentification.ClientCapabilities.HdcpVersion[
                  m.maxHdcpVersion
                ]
            : m.maxHdcpVersion;
      }
      if (
        m.oemCryptoApiVersion != null &&
        m.hasOwnProperty('oemCryptoApiVersion')
      ) {
        d.oemCryptoApiVersion = m.oemCryptoApiVersion;
      }
      if (
        m.antiRollbackUsageTable != null &&
        m.hasOwnProperty('antiRollbackUsageTable')
      ) {
        d.antiRollbackUsageTable = m.antiRollbackUsageTable;
      }
      if (m.srmVersion != null && m.hasOwnProperty('srmVersion')) {
        d.srmVersion = m.srmVersion;
      }
      if (m.canUpdateSrm != null && m.hasOwnProperty('canUpdateSrm')) {
        d.canUpdateSrm = m.canUpdateSrm;
      }
      if (
        m.supportedCertificateKeyType &&
        m.supportedCertificateKeyType.length
      ) {
        d.supportedCertificateKeyType = [];
        for (var j = 0; j < m.supportedCertificateKeyType.length; ++j) {
          d.supportedCertificateKeyType[j] =
            o.enums === String
              ? $root.ClientIdentification.ClientCapabilities
                  .CertificateKeyType[m.supportedCertificateKeyType[j]] ===
                undefined
                ? m.supportedCertificateKeyType[j]
                : $root.ClientIdentification.ClientCapabilities
                    .CertificateKeyType[m.supportedCertificateKeyType[j]]
              : m.supportedCertificateKeyType[j];
        }
      }
      if (
        m.analogOutputCapabilities != null &&
        m.hasOwnProperty('analogOutputCapabilities')
      ) {
        d.analogOutputCapabilities =
          o.enums === String
            ? $root.ClientIdentification.ClientCapabilities
                .AnalogOutputCapabilities[m.analogOutputCapabilities] ===
              undefined
              ? m.analogOutputCapabilities
              : $root.ClientIdentification.ClientCapabilities
                  .AnalogOutputCapabilities[m.analogOutputCapabilities]
            : m.analogOutputCapabilities;
      }
      if (
        m.canDisableAnalogOutput != null &&
        m.hasOwnProperty('canDisableAnalogOutput')
      ) {
        d.canDisableAnalogOutput = m.canDisableAnalogOutput;
      }
      if (
        m.resourceRatingTier != null &&
        m.hasOwnProperty('resourceRatingTier')
      ) {
        d.resourceRatingTier = m.resourceRatingTier;
      }
      return d;
    };

    /**
     * Converts this ClientCapabilities to JSON.
     * @function toJSON
     * @memberof ClientIdentification.ClientCapabilities
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    ClientCapabilities.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for ClientCapabilities
     * @function getTypeUrl
     * @memberof ClientIdentification.ClientCapabilities
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    ClientCapabilities.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = 'type.googleapis.com';
      }
      return typeUrlPrefix + '/ClientIdentification.ClientCapabilities';
    };

    /**
     * HdcpVersion enum.
     * @name ClientIdentification.ClientCapabilities.HdcpVersion
     * @enum {number}
     * @property {number} HDCP_NONE=0 HDCP_NONE value
     * @property {number} HDCP_V1=1 HDCP_V1 value
     * @property {number} HDCP_V2=2 HDCP_V2 value
     * @property {number} HDCP_V2_1=3 HDCP_V2_1 value
     * @property {number} HDCP_V2_2=4 HDCP_V2_2 value
     * @property {number} HDCP_V2_3=5 HDCP_V2_3 value
     * @property {number} HDCP_NO_DIGITAL_OUTPUT=255 HDCP_NO_DIGITAL_OUTPUT value
     */
    ClientCapabilities.HdcpVersion = (function () {
      const valuesById = {},
        values = Object.create(valuesById);
      values[(valuesById[0] = 'HDCP_NONE')] = 0;
      values[(valuesById[1] = 'HDCP_V1')] = 1;
      values[(valuesById[2] = 'HDCP_V2')] = 2;
      values[(valuesById[3] = 'HDCP_V2_1')] = 3;
      values[(valuesById[4] = 'HDCP_V2_2')] = 4;
      values[(valuesById[5] = 'HDCP_V2_3')] = 5;
      values[(valuesById[255] = 'HDCP_NO_DIGITAL_OUTPUT')] = 255;
      return values;
    })();

    /**
     * CertificateKeyType enum.
     * @name ClientIdentification.ClientCapabilities.CertificateKeyType
     * @enum {number}
     * @property {number} RSA_2048=0 RSA_2048 value
     * @property {number} RSA_3072=1 RSA_3072 value
     * @property {number} ECC_SECP256R1=2 ECC_SECP256R1 value
     * @property {number} ECC_SECP384R1=3 ECC_SECP384R1 value
     * @property {number} ECC_SECP521R1=4 ECC_SECP521R1 value
     */
    ClientCapabilities.CertificateKeyType = (function () {
      const valuesById = {},
        values = Object.create(valuesById);
      values[(valuesById[0] = 'RSA_2048')] = 0;
      values[(valuesById[1] = 'RSA_3072')] = 1;
      values[(valuesById[2] = 'ECC_SECP256R1')] = 2;
      values[(valuesById[3] = 'ECC_SECP384R1')] = 3;
      values[(valuesById[4] = 'ECC_SECP521R1')] = 4;
      return values;
    })();

    /**
     * AnalogOutputCapabilities enum.
     * @name ClientIdentification.ClientCapabilities.AnalogOutputCapabilities
     * @enum {number}
     * @property {number} ANALOG_OUTPUT_UNKNOWN=0 ANALOG_OUTPUT_UNKNOWN value
     * @property {number} ANALOG_OUTPUT_NONE=1 ANALOG_OUTPUT_NONE value
     * @property {number} ANALOG_OUTPUT_SUPPORTED=2 ANALOG_OUTPUT_SUPPORTED value
     * @property {number} ANALOG_OUTPUT_SUPPORTS_CGMS_A=3 ANALOG_OUTPUT_SUPPORTS_CGMS_A value
     */
    ClientCapabilities.AnalogOutputCapabilities = (function () {
      const valuesById = {},
        values = Object.create(valuesById);
      values[(valuesById[0] = 'ANALOG_OUTPUT_UNKNOWN')] = 0;
      values[(valuesById[1] = 'ANALOG_OUTPUT_NONE')] = 1;
      values[(valuesById[2] = 'ANALOG_OUTPUT_SUPPORTED')] = 2;
      values[(valuesById[3] = 'ANALOG_OUTPUT_SUPPORTS_CGMS_A')] = 3;
      return values;
    })();

    return ClientCapabilities;
  })();

  ClientIdentification.ClientCredentials = (function () {
    /**
     * Properties of a ClientCredentials.
     * @memberof ClientIdentification
     * @interface IClientCredentials
     * @property {ClientIdentification.TokenType|null} [type] ClientCredentials type
     * @property {Uint8Array|null} [token] ClientCredentials token
     */

    /**
     * Constructs a new ClientCredentials.
     * @memberof ClientIdentification
     * @classdesc Represents a ClientCredentials.
     * @implements IClientCredentials
     * @constructor
     * @param {ClientIdentification.IClientCredentials=} [p] Properties to set
     */
    function ClientCredentials(p) {
      if (p)
        for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
          if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
    }

    /**
     * ClientCredentials type.
     * @member {ClientIdentification.TokenType} type
     * @memberof ClientIdentification.ClientCredentials
     * @instance
     */
    ClientCredentials.prototype.type = 0;

    /**
     * ClientCredentials token.
     * @member {Uint8Array} token
     * @memberof ClientIdentification.ClientCredentials
     * @instance
     */
    ClientCredentials.prototype.token = $util.newBuffer([]);

    /**
     * Creates a new ClientCredentials instance using the specified properties.
     * @function create
     * @memberof ClientIdentification.ClientCredentials
     * @static
     * @param {ClientIdentification.IClientCredentials=} [properties] Properties to set
     * @returns {ClientIdentification.ClientCredentials} ClientCredentials instance
     */
    ClientCredentials.create = function create(properties) {
      return new ClientCredentials(properties);
    };

    /**
     * Encodes the specified ClientCredentials message. Does not implicitly {@link ClientIdentification.ClientCredentials.verify|verify} messages.
     * @function encode
     * @memberof ClientIdentification.ClientCredentials
     * @static
     * @param {ClientIdentification.IClientCredentials} m ClientCredentials message or plain object to encode
     * @param {$protobuf.Writer} [w] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ClientCredentials.encode = function encode(m, w) {
      if (!w) w = $Writer.create();
      if (m.type != null && Object.hasOwnProperty.call(m, 'type'))
        w.uint32(8).int32(m.type);
      if (m.token != null && Object.hasOwnProperty.call(m, 'token'))
        w.uint32(18).bytes(m.token);
      return w;
    };

    /**
     * Encodes the specified ClientCredentials message, length delimited. Does not implicitly {@link ClientIdentification.ClientCredentials.verify|verify} messages.
     * @function encodeDelimited
     * @memberof ClientIdentification.ClientCredentials
     * @static
     * @param {ClientIdentification.IClientCredentials} message ClientCredentials message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ClientCredentials.encodeDelimited = function encodeDelimited(
      message,
      writer,
    ) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a ClientCredentials message from the specified reader or buffer.
     * @function decode
     * @memberof ClientIdentification.ClientCredentials
     * @static
     * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
     * @param {number} [l] Message length if known beforehand
     * @returns {ClientIdentification.ClientCredentials} ClientCredentials
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ClientCredentials.decode = function decode(r, l) {
      if (!(r instanceof $Reader)) r = $Reader.create(r);
      var c = l === undefined ? r.len : r.pos + l,
        m = new $root.ClientIdentification.ClientCredentials();
      while (r.pos < c) {
        var t = r.uint32();
        switch (t >>> 3) {
          case 1: {
            m.type = r.int32();
            break;
          }
          case 2: {
            m.token = r.bytes();
            break;
          }
          default:
            r.skipType(t & 7);
            break;
        }
      }
      return m;
    };

    /**
     * Decodes a ClientCredentials message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof ClientIdentification.ClientCredentials
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {ClientIdentification.ClientCredentials} ClientCredentials
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ClientCredentials.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Creates a ClientCredentials message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof ClientIdentification.ClientCredentials
     * @static
     * @param {Object.<string,*>} d Plain object
     * @returns {ClientIdentification.ClientCredentials} ClientCredentials
     */
    ClientCredentials.fromObject = function fromObject(d) {
      if (d instanceof $root.ClientIdentification.ClientCredentials) return d;
      var m = new $root.ClientIdentification.ClientCredentials();
      switch (d.type) {
        default:
          if (typeof d.type === 'number') {
            m.type = d.type;
            break;
          }
          break;
        case 'KEYBOX':
        case 0:
          m.type = 0;
          break;
        case 'DRM_DEVICE_CERTIFICATE':
        case 1:
          m.type = 1;
          break;
        case 'REMOTE_ATTESTATION_CERTIFICATE':
        case 2:
          m.type = 2;
          break;
        case 'OEM_DEVICE_CERTIFICATE':
        case 3:
          m.type = 3;
          break;
      }
      if (d.token != null) {
        if (typeof d.token === 'string')
          $util.base64.decode(
            d.token,
            (m.token = $util.newBuffer($util.base64.length(d.token))),
            0,
          );
        else if (d.token.length >= 0) m.token = d.token;
      }
      return m;
    };

    /**
     * Creates a plain object from a ClientCredentials message. Also converts values to other types if specified.
     * @function toObject
     * @memberof ClientIdentification.ClientCredentials
     * @static
     * @param {ClientIdentification.ClientCredentials} m ClientCredentials
     * @param {$protobuf.IConversionOptions} [o] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    ClientCredentials.toObject = function toObject(m, o) {
      if (!o) o = {};
      var d = {};
      if (o.defaults) {
        d.type = o.enums === String ? 'KEYBOX' : 0;
        if (o.bytes === String) d.token = '';
        else {
          d.token = [];
          if (o.bytes !== Array) d.token = $util.newBuffer(d.token);
        }
      }
      if (m.type != null && m.hasOwnProperty('type')) {
        d.type =
          o.enums === String
            ? $root.ClientIdentification.TokenType[m.type] === undefined
              ? m.type
              : $root.ClientIdentification.TokenType[m.type]
            : m.type;
      }
      if (m.token != null && m.hasOwnProperty('token')) {
        d.token =
          o.bytes === String
            ? $util.base64.encode(m.token, 0, m.token.length)
            : o.bytes === Array
              ? Array.prototype.slice.call(m.token)
              : m.token;
      }
      return d;
    };

    /**
     * Converts this ClientCredentials to JSON.
     * @function toJSON
     * @memberof ClientIdentification.ClientCredentials
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    ClientCredentials.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for ClientCredentials
     * @function getTypeUrl
     * @memberof ClientIdentification.ClientCredentials
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    ClientCredentials.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = 'type.googleapis.com';
      }
      return typeUrlPrefix + '/ClientIdentification.ClientCredentials';
    };

    return ClientCredentials;
  })();

  return ClientIdentification;
})());

export const EncryptedClientIdentification =
  ($root.EncryptedClientIdentification = (() => {
    /**
     * Properties of an EncryptedClientIdentification.
     * @exports IEncryptedClientIdentification
     * @interface IEncryptedClientIdentification
     * @property {string|null} [providerId] EncryptedClientIdentification providerId
     * @property {Uint8Array|null} [serviceCertificateSerialNumber] EncryptedClientIdentification serviceCertificateSerialNumber
     * @property {Uint8Array|null} [encryptedClientId] EncryptedClientIdentification encryptedClientId
     * @property {Uint8Array|null} [encryptedClientIdIv] EncryptedClientIdentification encryptedClientIdIv
     * @property {Uint8Array|null} [encryptedPrivacyKey] EncryptedClientIdentification encryptedPrivacyKey
     */

    /**
     * Constructs a new EncryptedClientIdentification.
     * @exports EncryptedClientIdentification
     * @classdesc Represents an EncryptedClientIdentification.
     * @implements IEncryptedClientIdentification
     * @constructor
     * @param {IEncryptedClientIdentification=} [p] Properties to set
     */
    function EncryptedClientIdentification(p) {
      if (p)
        for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
          if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
    }

    /**
     * EncryptedClientIdentification providerId.
     * @member {string} providerId
     * @memberof EncryptedClientIdentification
     * @instance
     */
    EncryptedClientIdentification.prototype.providerId = '';

    /**
     * EncryptedClientIdentification serviceCertificateSerialNumber.
     * @member {Uint8Array} serviceCertificateSerialNumber
     * @memberof EncryptedClientIdentification
     * @instance
     */
    EncryptedClientIdentification.prototype.serviceCertificateSerialNumber =
      $util.newBuffer([]);

    /**
     * EncryptedClientIdentification encryptedClientId.
     * @member {Uint8Array} encryptedClientId
     * @memberof EncryptedClientIdentification
     * @instance
     */
    EncryptedClientIdentification.prototype.encryptedClientId = $util.newBuffer(
      [],
    );

    /**
     * EncryptedClientIdentification encryptedClientIdIv.
     * @member {Uint8Array} encryptedClientIdIv
     * @memberof EncryptedClientIdentification
     * @instance
     */
    EncryptedClientIdentification.prototype.encryptedClientIdIv =
      $util.newBuffer([]);

    /**
     * EncryptedClientIdentification encryptedPrivacyKey.
     * @member {Uint8Array} encryptedPrivacyKey
     * @memberof EncryptedClientIdentification
     * @instance
     */
    EncryptedClientIdentification.prototype.encryptedPrivacyKey =
      $util.newBuffer([]);

    /**
     * Creates a new EncryptedClientIdentification instance using the specified properties.
     * @function create
     * @memberof EncryptedClientIdentification
     * @static
     * @param {IEncryptedClientIdentification=} [properties] Properties to set
     * @returns {EncryptedClientIdentification} EncryptedClientIdentification instance
     */
    EncryptedClientIdentification.create = function create(properties) {
      return new EncryptedClientIdentification(properties);
    };

    /**
     * Encodes the specified EncryptedClientIdentification message. Does not implicitly {@link EncryptedClientIdentification.verify|verify} messages.
     * @function encode
     * @memberof EncryptedClientIdentification
     * @static
     * @param {IEncryptedClientIdentification} m EncryptedClientIdentification message or plain object to encode
     * @param {$protobuf.Writer} [w] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    EncryptedClientIdentification.encode = function encode(m, w) {
      if (!w) w = $Writer.create();
      if (m.providerId != null && Object.hasOwnProperty.call(m, 'providerId'))
        w.uint32(10).string(m.providerId);
      if (
        m.serviceCertificateSerialNumber != null &&
        Object.hasOwnProperty.call(m, 'serviceCertificateSerialNumber')
      )
        w.uint32(18).bytes(m.serviceCertificateSerialNumber);
      if (
        m.encryptedClientId != null &&
        Object.hasOwnProperty.call(m, 'encryptedClientId')
      )
        w.uint32(26).bytes(m.encryptedClientId);
      if (
        m.encryptedClientIdIv != null &&
        Object.hasOwnProperty.call(m, 'encryptedClientIdIv')
      )
        w.uint32(34).bytes(m.encryptedClientIdIv);
      if (
        m.encryptedPrivacyKey != null &&
        Object.hasOwnProperty.call(m, 'encryptedPrivacyKey')
      )
        w.uint32(42).bytes(m.encryptedPrivacyKey);
      return w;
    };

    /**
     * Encodes the specified EncryptedClientIdentification message, length delimited. Does not implicitly {@link EncryptedClientIdentification.verify|verify} messages.
     * @function encodeDelimited
     * @memberof EncryptedClientIdentification
     * @static
     * @param {IEncryptedClientIdentification} message EncryptedClientIdentification message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    EncryptedClientIdentification.encodeDelimited = function encodeDelimited(
      message,
      writer,
    ) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes an EncryptedClientIdentification message from the specified reader or buffer.
     * @function decode
     * @memberof EncryptedClientIdentification
     * @static
     * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
     * @param {number} [l] Message length if known beforehand
     * @returns {EncryptedClientIdentification} EncryptedClientIdentification
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    EncryptedClientIdentification.decode = function decode(r, l) {
      if (!(r instanceof $Reader)) r = $Reader.create(r);
      var c = l === undefined ? r.len : r.pos + l,
        m = new $root.EncryptedClientIdentification();
      while (r.pos < c) {
        var t = r.uint32();
        switch (t >>> 3) {
          case 1: {
            m.providerId = r.string();
            break;
          }
          case 2: {
            m.serviceCertificateSerialNumber = r.bytes();
            break;
          }
          case 3: {
            m.encryptedClientId = r.bytes();
            break;
          }
          case 4: {
            m.encryptedClientIdIv = r.bytes();
            break;
          }
          case 5: {
            m.encryptedPrivacyKey = r.bytes();
            break;
          }
          default:
            r.skipType(t & 7);
            break;
        }
      }
      return m;
    };

    /**
     * Decodes an EncryptedClientIdentification message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof EncryptedClientIdentification
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {EncryptedClientIdentification} EncryptedClientIdentification
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    EncryptedClientIdentification.decodeDelimited = function decodeDelimited(
      reader,
    ) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Creates an EncryptedClientIdentification message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof EncryptedClientIdentification
     * @static
     * @param {Object.<string,*>} d Plain object
     * @returns {EncryptedClientIdentification} EncryptedClientIdentification
     */
    EncryptedClientIdentification.fromObject = function fromObject(d) {
      if (d instanceof $root.EncryptedClientIdentification) return d;
      var m = new $root.EncryptedClientIdentification();
      if (d.providerId != null) {
        m.providerId = String(d.providerId);
      }
      if (d.serviceCertificateSerialNumber != null) {
        if (typeof d.serviceCertificateSerialNumber === 'string')
          $util.base64.decode(
            d.serviceCertificateSerialNumber,
            (m.serviceCertificateSerialNumber = $util.newBuffer(
              $util.base64.length(d.serviceCertificateSerialNumber),
            )),
            0,
          );
        else if (d.serviceCertificateSerialNumber.length >= 0)
          m.serviceCertificateSerialNumber = d.serviceCertificateSerialNumber;
      }
      if (d.encryptedClientId != null) {
        if (typeof d.encryptedClientId === 'string')
          $util.base64.decode(
            d.encryptedClientId,
            (m.encryptedClientId = $util.newBuffer(
              $util.base64.length(d.encryptedClientId),
            )),
            0,
          );
        else if (d.encryptedClientId.length >= 0)
          m.encryptedClientId = d.encryptedClientId;
      }
      if (d.encryptedClientIdIv != null) {
        if (typeof d.encryptedClientIdIv === 'string')
          $util.base64.decode(
            d.encryptedClientIdIv,
            (m.encryptedClientIdIv = $util.newBuffer(
              $util.base64.length(d.encryptedClientIdIv),
            )),
            0,
          );
        else if (d.encryptedClientIdIv.length >= 0)
          m.encryptedClientIdIv = d.encryptedClientIdIv;
      }
      if (d.encryptedPrivacyKey != null) {
        if (typeof d.encryptedPrivacyKey === 'string')
          $util.base64.decode(
            d.encryptedPrivacyKey,
            (m.encryptedPrivacyKey = $util.newBuffer(
              $util.base64.length(d.encryptedPrivacyKey),
            )),
            0,
          );
        else if (d.encryptedPrivacyKey.length >= 0)
          m.encryptedPrivacyKey = d.encryptedPrivacyKey;
      }
      return m;
    };

    /**
     * Creates a plain object from an EncryptedClientIdentification message. Also converts values to other types if specified.
     * @function toObject
     * @memberof EncryptedClientIdentification
     * @static
     * @param {EncryptedClientIdentification} m EncryptedClientIdentification
     * @param {$protobuf.IConversionOptions} [o] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    EncryptedClientIdentification.toObject = function toObject(m, o) {
      if (!o) o = {};
      var d = {};
      if (o.defaults) {
        d.providerId = '';
        if (o.bytes === String) d.serviceCertificateSerialNumber = '';
        else {
          d.serviceCertificateSerialNumber = [];
          if (o.bytes !== Array)
            d.serviceCertificateSerialNumber = $util.newBuffer(
              d.serviceCertificateSerialNumber,
            );
        }
        if (o.bytes === String) d.encryptedClientId = '';
        else {
          d.encryptedClientId = [];
          if (o.bytes !== Array)
            d.encryptedClientId = $util.newBuffer(d.encryptedClientId);
        }
        if (o.bytes === String) d.encryptedClientIdIv = '';
        else {
          d.encryptedClientIdIv = [];
          if (o.bytes !== Array)
            d.encryptedClientIdIv = $util.newBuffer(d.encryptedClientIdIv);
        }
        if (o.bytes === String) d.encryptedPrivacyKey = '';
        else {
          d.encryptedPrivacyKey = [];
          if (o.bytes !== Array)
            d.encryptedPrivacyKey = $util.newBuffer(d.encryptedPrivacyKey);
        }
      }
      if (m.providerId != null && m.hasOwnProperty('providerId')) {
        d.providerId = m.providerId;
      }
      if (
        m.serviceCertificateSerialNumber != null &&
        m.hasOwnProperty('serviceCertificateSerialNumber')
      ) {
        d.serviceCertificateSerialNumber =
          o.bytes === String
            ? $util.base64.encode(
                m.serviceCertificateSerialNumber,
                0,
                m.serviceCertificateSerialNumber.length,
              )
            : o.bytes === Array
              ? Array.prototype.slice.call(m.serviceCertificateSerialNumber)
              : m.serviceCertificateSerialNumber;
      }
      if (
        m.encryptedClientId != null &&
        m.hasOwnProperty('encryptedClientId')
      ) {
        d.encryptedClientId =
          o.bytes === String
            ? $util.base64.encode(
                m.encryptedClientId,
                0,
                m.encryptedClientId.length,
              )
            : o.bytes === Array
              ? Array.prototype.slice.call(m.encryptedClientId)
              : m.encryptedClientId;
      }
      if (
        m.encryptedClientIdIv != null &&
        m.hasOwnProperty('encryptedClientIdIv')
      ) {
        d.encryptedClientIdIv =
          o.bytes === String
            ? $util.base64.encode(
                m.encryptedClientIdIv,
                0,
                m.encryptedClientIdIv.length,
              )
            : o.bytes === Array
              ? Array.prototype.slice.call(m.encryptedClientIdIv)
              : m.encryptedClientIdIv;
      }
      if (
        m.encryptedPrivacyKey != null &&
        m.hasOwnProperty('encryptedPrivacyKey')
      ) {
        d.encryptedPrivacyKey =
          o.bytes === String
            ? $util.base64.encode(
                m.encryptedPrivacyKey,
                0,
                m.encryptedPrivacyKey.length,
              )
            : o.bytes === Array
              ? Array.prototype.slice.call(m.encryptedPrivacyKey)
              : m.encryptedPrivacyKey;
      }
      return d;
    };

    /**
     * Converts this EncryptedClientIdentification to JSON.
     * @function toJSON
     * @memberof EncryptedClientIdentification
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    EncryptedClientIdentification.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for EncryptedClientIdentification
     * @function getTypeUrl
     * @memberof EncryptedClientIdentification
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    EncryptedClientIdentification.getTypeUrl = function getTypeUrl(
      typeUrlPrefix,
    ) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = 'type.googleapis.com';
      }
      return typeUrlPrefix + '/EncryptedClientIdentification';
    };

    return EncryptedClientIdentification;
  })());

export const LicenseError = ($root.LicenseError = (() => {
  /**
   * Properties of a LicenseError.
   * @exports ILicenseError
   * @interface ILicenseError
   * @property {LicenseError.Error|null} [errorCode] LicenseError errorCode
   */

  /**
   * Constructs a new LicenseError.
   * @exports LicenseError
   * @classdesc Represents a LicenseError.
   * @implements ILicenseError
   * @constructor
   * @param {ILicenseError=} [p] Properties to set
   */
  function LicenseError(p) {
    if (p)
      for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
        if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
  }

  /**
   * LicenseError errorCode.
   * @member {LicenseError.Error} errorCode
   * @memberof LicenseError
   * @instance
   */
  LicenseError.prototype.errorCode = 1;

  /**
   * Creates a new LicenseError instance using the specified properties.
   * @function create
   * @memberof LicenseError
   * @static
   * @param {ILicenseError=} [properties] Properties to set
   * @returns {LicenseError} LicenseError instance
   */
  LicenseError.create = function create(properties) {
    return new LicenseError(properties);
  };

  /**
   * Encodes the specified LicenseError message. Does not implicitly {@link LicenseError.verify|verify} messages.
   * @function encode
   * @memberof LicenseError
   * @static
   * @param {ILicenseError} m LicenseError message or plain object to encode
   * @param {$protobuf.Writer} [w] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  LicenseError.encode = function encode(m, w) {
    if (!w) w = $Writer.create();
    if (m.errorCode != null && Object.hasOwnProperty.call(m, 'errorCode'))
      w.uint32(8).int32(m.errorCode);
    return w;
  };

  /**
   * Encodes the specified LicenseError message, length delimited. Does not implicitly {@link LicenseError.verify|verify} messages.
   * @function encodeDelimited
   * @memberof LicenseError
   * @static
   * @param {ILicenseError} message LicenseError message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  LicenseError.encodeDelimited = function encodeDelimited(message, writer) {
    return this.encode(message, writer).ldelim();
  };

  /**
   * Decodes a LicenseError message from the specified reader or buffer.
   * @function decode
   * @memberof LicenseError
   * @static
   * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
   * @param {number} [l] Message length if known beforehand
   * @returns {LicenseError} LicenseError
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  LicenseError.decode = function decode(r, l) {
    if (!(r instanceof $Reader)) r = $Reader.create(r);
    var c = l === undefined ? r.len : r.pos + l,
      m = new $root.LicenseError();
    while (r.pos < c) {
      var t = r.uint32();
      switch (t >>> 3) {
        case 1: {
          m.errorCode = r.int32();
          break;
        }
        default:
          r.skipType(t & 7);
          break;
      }
    }
    return m;
  };

  /**
   * Decodes a LicenseError message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof LicenseError
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {LicenseError} LicenseError
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  LicenseError.decodeDelimited = function decodeDelimited(reader) {
    if (!(reader instanceof $Reader)) reader = new $Reader(reader);
    return this.decode(reader, reader.uint32());
  };

  /**
   * Creates a LicenseError message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof LicenseError
   * @static
   * @param {Object.<string,*>} d Plain object
   * @returns {LicenseError} LicenseError
   */
  LicenseError.fromObject = function fromObject(d) {
    if (d instanceof $root.LicenseError) return d;
    var m = new $root.LicenseError();
    switch (d.errorCode) {
      default:
        if (typeof d.errorCode === 'number') {
          m.errorCode = d.errorCode;
          break;
        }
        break;
      case 'INVALID_DEVICE_CERTIFICATE':
      case 1:
        m.errorCode = 1;
        break;
      case 'REVOKED_DEVICE_CERTIFICATE':
      case 2:
        m.errorCode = 2;
        break;
      case 'SERVICE_UNAVAILABLE':
      case 3:
        m.errorCode = 3;
        break;
    }
    return m;
  };

  /**
   * Creates a plain object from a LicenseError message. Also converts values to other types if specified.
   * @function toObject
   * @memberof LicenseError
   * @static
   * @param {LicenseError} m LicenseError
   * @param {$protobuf.IConversionOptions} [o] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  LicenseError.toObject = function toObject(m, o) {
    if (!o) o = {};
    var d = {};
    if (o.defaults) {
      d.errorCode = o.enums === String ? 'INVALID_DEVICE_CERTIFICATE' : 1;
    }
    if (m.errorCode != null && m.hasOwnProperty('errorCode')) {
      d.errorCode =
        o.enums === String
          ? $root.LicenseError.Error[m.errorCode] === undefined
            ? m.errorCode
            : $root.LicenseError.Error[m.errorCode]
          : m.errorCode;
    }
    return d;
  };

  /**
   * Converts this LicenseError to JSON.
   * @function toJSON
   * @memberof LicenseError
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  LicenseError.prototype.toJSON = function toJSON() {
    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
  };

  /**
   * Gets the default type url for LicenseError
   * @function getTypeUrl
   * @memberof LicenseError
   * @static
   * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns {string} The default type url
   */
  LicenseError.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
    if (typeUrlPrefix === undefined) {
      typeUrlPrefix = 'type.googleapis.com';
    }
    return typeUrlPrefix + '/LicenseError';
  };

  /**
   * Error enum.
   * @name LicenseError.Error
   * @enum {number}
   * @property {number} INVALID_DEVICE_CERTIFICATE=1 INVALID_DEVICE_CERTIFICATE value
   * @property {number} REVOKED_DEVICE_CERTIFICATE=2 REVOKED_DEVICE_CERTIFICATE value
   * @property {number} SERVICE_UNAVAILABLE=3 SERVICE_UNAVAILABLE value
   */
  LicenseError.Error = (function () {
    const valuesById = {},
      values = Object.create(valuesById);
    values[(valuesById[1] = 'INVALID_DEVICE_CERTIFICATE')] = 1;
    values[(valuesById[2] = 'REVOKED_DEVICE_CERTIFICATE')] = 2;
    values[(valuesById[3] = 'SERVICE_UNAVAILABLE')] = 3;
    return values;
  })();

  return LicenseError;
})());

export const DrmCertificate = ($root.DrmCertificate = (() => {
  /**
   * Properties of a DrmCertificate.
   * @exports IDrmCertificate
   * @interface IDrmCertificate
   * @property {DrmCertificate.Type|null} [type] DrmCertificate type
   * @property {Uint8Array|null} [serialNumber] DrmCertificate serialNumber
   * @property {number|null} [creationTimeSeconds] DrmCertificate creationTimeSeconds
   * @property {number|null} [expirationTimeSeconds] DrmCertificate expirationTimeSeconds
   * @property {Uint8Array|null} [publicKey] DrmCertificate publicKey
   * @property {number|null} [systemId] DrmCertificate systemId
   * @property {boolean|null} [testDeviceDeprecated] DrmCertificate testDeviceDeprecated
   * @property {string|null} [providerId] DrmCertificate providerId
   * @property {Array.<DrmCertificate.ServiceType>|null} [serviceTypes] DrmCertificate serviceTypes
   * @property {DrmCertificate.Algorithm|null} [algorithm] DrmCertificate algorithm
   * @property {Uint8Array|null} [rotId] DrmCertificate rotId
   * @property {DrmCertificate.IEncryptionKey|null} [encryptionKey] DrmCertificate encryptionKey
   */

  /**
   * Constructs a new DrmCertificate.
   * @exports DrmCertificate
   * @classdesc Represents a DrmCertificate.
   * @implements IDrmCertificate
   * @constructor
   * @param {IDrmCertificate=} [p] Properties to set
   */
  function DrmCertificate(p) {
    this.serviceTypes = [];
    if (p)
      for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
        if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
  }

  /**
   * DrmCertificate type.
   * @member {DrmCertificate.Type} type
   * @memberof DrmCertificate
   * @instance
   */
  DrmCertificate.prototype.type = 0;

  /**
   * DrmCertificate serialNumber.
   * @member {Uint8Array} serialNumber
   * @memberof DrmCertificate
   * @instance
   */
  DrmCertificate.prototype.serialNumber = $util.newBuffer([]);

  /**
   * DrmCertificate creationTimeSeconds.
   * @member {number} creationTimeSeconds
   * @memberof DrmCertificate
   * @instance
   */
  DrmCertificate.prototype.creationTimeSeconds = 0;

  /**
   * DrmCertificate expirationTimeSeconds.
   * @member {number} expirationTimeSeconds
   * @memberof DrmCertificate
   * @instance
   */
  DrmCertificate.prototype.expirationTimeSeconds = 0;

  /**
   * DrmCertificate publicKey.
   * @member {Uint8Array} publicKey
   * @memberof DrmCertificate
   * @instance
   */
  DrmCertificate.prototype.publicKey = $util.newBuffer([]);

  /**
   * DrmCertificate systemId.
   * @member {number} systemId
   * @memberof DrmCertificate
   * @instance
   */
  DrmCertificate.prototype.systemId = 0;

  /**
   * DrmCertificate testDeviceDeprecated.
   * @member {boolean} testDeviceDeprecated
   * @memberof DrmCertificate
   * @instance
   */
  DrmCertificate.prototype.testDeviceDeprecated = false;

  /**
   * DrmCertificate providerId.
   * @member {string} providerId
   * @memberof DrmCertificate
   * @instance
   */
  DrmCertificate.prototype.providerId = '';

  /**
   * DrmCertificate serviceTypes.
   * @member {Array.<DrmCertificate.ServiceType>} serviceTypes
   * @memberof DrmCertificate
   * @instance
   */
  DrmCertificate.prototype.serviceTypes = $util.emptyArray;

  /**
   * DrmCertificate algorithm.
   * @member {DrmCertificate.Algorithm} algorithm
   * @memberof DrmCertificate
   * @instance
   */
  DrmCertificate.prototype.algorithm = 1;

  /**
   * DrmCertificate rotId.
   * @member {Uint8Array} rotId
   * @memberof DrmCertificate
   * @instance
   */
  DrmCertificate.prototype.rotId = $util.newBuffer([]);

  /**
   * DrmCertificate encryptionKey.
   * @member {DrmCertificate.IEncryptionKey|null|undefined} encryptionKey
   * @memberof DrmCertificate
   * @instance
   */
  DrmCertificate.prototype.encryptionKey = null;

  /**
   * Creates a new DrmCertificate instance using the specified properties.
   * @function create
   * @memberof DrmCertificate
   * @static
   * @param {IDrmCertificate=} [properties] Properties to set
   * @returns {DrmCertificate} DrmCertificate instance
   */
  DrmCertificate.create = function create(properties) {
    return new DrmCertificate(properties);
  };

  /**
   * Encodes the specified DrmCertificate message. Does not implicitly {@link DrmCertificate.verify|verify} messages.
   * @function encode
   * @memberof DrmCertificate
   * @static
   * @param {IDrmCertificate} m DrmCertificate message or plain object to encode
   * @param {$protobuf.Writer} [w] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  DrmCertificate.encode = function encode(m, w) {
    if (!w) w = $Writer.create();
    if (m.type != null && Object.hasOwnProperty.call(m, 'type'))
      w.uint32(8).int32(m.type);
    if (m.serialNumber != null && Object.hasOwnProperty.call(m, 'serialNumber'))
      w.uint32(18).bytes(m.serialNumber);
    if (
      m.creationTimeSeconds != null &&
      Object.hasOwnProperty.call(m, 'creationTimeSeconds')
    )
      w.uint32(24).uint32(m.creationTimeSeconds);
    if (m.publicKey != null && Object.hasOwnProperty.call(m, 'publicKey'))
      w.uint32(34).bytes(m.publicKey);
    if (m.systemId != null && Object.hasOwnProperty.call(m, 'systemId'))
      w.uint32(40).uint32(m.systemId);
    if (
      m.testDeviceDeprecated != null &&
      Object.hasOwnProperty.call(m, 'testDeviceDeprecated')
    )
      w.uint32(48).bool(m.testDeviceDeprecated);
    if (m.providerId != null && Object.hasOwnProperty.call(m, 'providerId'))
      w.uint32(58).string(m.providerId);
    if (m.serviceTypes != null && m.serviceTypes.length) {
      for (var i = 0; i < m.serviceTypes.length; ++i)
        w.uint32(64).int32(m.serviceTypes[i]);
    }
    if (m.algorithm != null && Object.hasOwnProperty.call(m, 'algorithm'))
      w.uint32(72).int32(m.algorithm);
    if (m.rotId != null && Object.hasOwnProperty.call(m, 'rotId'))
      w.uint32(82).bytes(m.rotId);
    if (
      m.encryptionKey != null &&
      Object.hasOwnProperty.call(m, 'encryptionKey')
    )
      $root.DrmCertificate.EncryptionKey.encode(
        m.encryptionKey,
        w.uint32(90).fork(),
      ).ldelim();
    if (
      m.expirationTimeSeconds != null &&
      Object.hasOwnProperty.call(m, 'expirationTimeSeconds')
    )
      w.uint32(96).uint32(m.expirationTimeSeconds);
    return w;
  };

  /**
   * Encodes the specified DrmCertificate message, length delimited. Does not implicitly {@link DrmCertificate.verify|verify} messages.
   * @function encodeDelimited
   * @memberof DrmCertificate
   * @static
   * @param {IDrmCertificate} message DrmCertificate message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  DrmCertificate.encodeDelimited = function encodeDelimited(message, writer) {
    return this.encode(message, writer).ldelim();
  };

  /**
   * Decodes a DrmCertificate message from the specified reader or buffer.
   * @function decode
   * @memberof DrmCertificate
   * @static
   * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
   * @param {number} [l] Message length if known beforehand
   * @returns {DrmCertificate} DrmCertificate
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  DrmCertificate.decode = function decode(r, l) {
    if (!(r instanceof $Reader)) r = $Reader.create(r);
    var c = l === undefined ? r.len : r.pos + l,
      m = new $root.DrmCertificate();
    while (r.pos < c) {
      var t = r.uint32();
      switch (t >>> 3) {
        case 1: {
          m.type = r.int32();
          break;
        }
        case 2: {
          m.serialNumber = r.bytes();
          break;
        }
        case 3: {
          m.creationTimeSeconds = r.uint32();
          break;
        }
        case 12: {
          m.expirationTimeSeconds = r.uint32();
          break;
        }
        case 4: {
          m.publicKey = r.bytes();
          break;
        }
        case 5: {
          m.systemId = r.uint32();
          break;
        }
        case 6: {
          m.testDeviceDeprecated = r.bool();
          break;
        }
        case 7: {
          m.providerId = r.string();
          break;
        }
        case 8: {
          if (!(m.serviceTypes && m.serviceTypes.length)) m.serviceTypes = [];
          if ((t & 7) === 2) {
            var c2 = r.uint32() + r.pos;
            while (r.pos < c2) m.serviceTypes.push(r.int32());
          } else m.serviceTypes.push(r.int32());
          break;
        }
        case 9: {
          m.algorithm = r.int32();
          break;
        }
        case 10: {
          m.rotId = r.bytes();
          break;
        }
        case 11: {
          m.encryptionKey = $root.DrmCertificate.EncryptionKey.decode(
            r,
            r.uint32(),
          );
          break;
        }
        default:
          r.skipType(t & 7);
          break;
      }
    }
    return m;
  };

  /**
   * Decodes a DrmCertificate message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof DrmCertificate
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {DrmCertificate} DrmCertificate
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  DrmCertificate.decodeDelimited = function decodeDelimited(reader) {
    if (!(reader instanceof $Reader)) reader = new $Reader(reader);
    return this.decode(reader, reader.uint32());
  };

  /**
   * Creates a DrmCertificate message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof DrmCertificate
   * @static
   * @param {Object.<string,*>} d Plain object
   * @returns {DrmCertificate} DrmCertificate
   */
  DrmCertificate.fromObject = function fromObject(d) {
    if (d instanceof $root.DrmCertificate) return d;
    var m = new $root.DrmCertificate();
    switch (d.type) {
      default:
        if (typeof d.type === 'number') {
          m.type = d.type;
          break;
        }
        break;
      case 'ROOT':
      case 0:
        m.type = 0;
        break;
      case 'DEVICE_MODEL':
      case 1:
        m.type = 1;
        break;
      case 'DEVICE':
      case 2:
        m.type = 2;
        break;
      case 'SERVICE':
      case 3:
        m.type = 3;
        break;
      case 'PROVISIONER':
      case 4:
        m.type = 4;
        break;
    }
    if (d.serialNumber != null) {
      if (typeof d.serialNumber === 'string')
        $util.base64.decode(
          d.serialNumber,
          (m.serialNumber = $util.newBuffer(
            $util.base64.length(d.serialNumber),
          )),
          0,
        );
      else if (d.serialNumber.length >= 0) m.serialNumber = d.serialNumber;
    }
    if (d.creationTimeSeconds != null) {
      m.creationTimeSeconds = d.creationTimeSeconds >>> 0;
    }
    if (d.expirationTimeSeconds != null) {
      m.expirationTimeSeconds = d.expirationTimeSeconds >>> 0;
    }
    if (d.publicKey != null) {
      if (typeof d.publicKey === 'string')
        $util.base64.decode(
          d.publicKey,
          (m.publicKey = $util.newBuffer($util.base64.length(d.publicKey))),
          0,
        );
      else if (d.publicKey.length >= 0) m.publicKey = d.publicKey;
    }
    if (d.systemId != null) {
      m.systemId = d.systemId >>> 0;
    }
    if (d.testDeviceDeprecated != null) {
      m.testDeviceDeprecated = Boolean(d.testDeviceDeprecated);
    }
    if (d.providerId != null) {
      m.providerId = String(d.providerId);
    }
    if (d.serviceTypes) {
      if (!Array.isArray(d.serviceTypes))
        throw TypeError('.DrmCertificate.serviceTypes: array expected');
      m.serviceTypes = [];
      for (var i = 0; i < d.serviceTypes.length; ++i) {
        switch (d.serviceTypes[i]) {
          default:
            if (typeof d.serviceTypes[i] === 'number') {
              m.serviceTypes[i] = d.serviceTypes[i];
              break;
            }
          case 'UNKNOWN_SERVICE_TYPE':
          case 0:
            m.serviceTypes[i] = 0;
            break;
          case 'LICENSE_SERVER_SDK':
          case 1:
            m.serviceTypes[i] = 1;
            break;
          case 'LICENSE_SERVER_PROXY_SDK':
          case 2:
            m.serviceTypes[i] = 2;
            break;
          case 'PROVISIONING_SDK':
          case 3:
            m.serviceTypes[i] = 3;
            break;
          case 'CAS_PROXY_SDK':
          case 4:
            m.serviceTypes[i] = 4;
            break;
        }
      }
    }
    switch (d.algorithm) {
      case 'UNKNOWN_ALGORITHM':
      case 0:
        m.algorithm = 0;
        break;
      default:
        if (typeof d.algorithm === 'number') {
          m.algorithm = d.algorithm;
          break;
        }
        break;
      case 'RSA':
      case 1:
        m.algorithm = 1;
        break;
      case 'ECC_SECP256R1':
      case 2:
        m.algorithm = 2;
        break;
      case 'ECC_SECP384R1':
      case 3:
        m.algorithm = 3;
        break;
      case 'ECC_SECP521R1':
      case 4:
        m.algorithm = 4;
        break;
    }
    if (d.rotId != null) {
      if (typeof d.rotId === 'string')
        $util.base64.decode(
          d.rotId,
          (m.rotId = $util.newBuffer($util.base64.length(d.rotId))),
          0,
        );
      else if (d.rotId.length >= 0) m.rotId = d.rotId;
    }
    if (d.encryptionKey != null) {
      if (typeof d.encryptionKey !== 'object')
        throw TypeError('.DrmCertificate.encryptionKey: object expected');
      m.encryptionKey = $root.DrmCertificate.EncryptionKey.fromObject(
        d.encryptionKey,
      );
    }
    return m;
  };

  /**
   * Creates a plain object from a DrmCertificate message. Also converts values to other types if specified.
   * @function toObject
   * @memberof DrmCertificate
   * @static
   * @param {DrmCertificate} m DrmCertificate
   * @param {$protobuf.IConversionOptions} [o] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  DrmCertificate.toObject = function toObject(m, o) {
    if (!o) o = {};
    var d = {};
    if (o.arrays || o.defaults) {
      d.serviceTypes = [];
    }
    if (o.defaults) {
      d.type = o.enums === String ? 'ROOT' : 0;
      if (o.bytes === String) d.serialNumber = '';
      else {
        d.serialNumber = [];
        if (o.bytes !== Array) d.serialNumber = $util.newBuffer(d.serialNumber);
      }
      d.creationTimeSeconds = 0;
      if (o.bytes === String) d.publicKey = '';
      else {
        d.publicKey = [];
        if (o.bytes !== Array) d.publicKey = $util.newBuffer(d.publicKey);
      }
      d.systemId = 0;
      d.testDeviceDeprecated = false;
      d.providerId = '';
      d.algorithm = o.enums === String ? 'RSA' : 1;
      if (o.bytes === String) d.rotId = '';
      else {
        d.rotId = [];
        if (o.bytes !== Array) d.rotId = $util.newBuffer(d.rotId);
      }
      d.encryptionKey = null;
      d.expirationTimeSeconds = 0;
    }
    if (m.type != null && m.hasOwnProperty('type')) {
      d.type =
        o.enums === String
          ? $root.DrmCertificate.Type[m.type] === undefined
            ? m.type
            : $root.DrmCertificate.Type[m.type]
          : m.type;
    }
    if (m.serialNumber != null && m.hasOwnProperty('serialNumber')) {
      d.serialNumber =
        o.bytes === String
          ? $util.base64.encode(m.serialNumber, 0, m.serialNumber.length)
          : o.bytes === Array
            ? Array.prototype.slice.call(m.serialNumber)
            : m.serialNumber;
    }
    if (
      m.creationTimeSeconds != null &&
      m.hasOwnProperty('creationTimeSeconds')
    ) {
      d.creationTimeSeconds = m.creationTimeSeconds;
    }
    if (m.publicKey != null && m.hasOwnProperty('publicKey')) {
      d.publicKey =
        o.bytes === String
          ? $util.base64.encode(m.publicKey, 0, m.publicKey.length)
          : o.bytes === Array
            ? Array.prototype.slice.call(m.publicKey)
            : m.publicKey;
    }
    if (m.systemId != null && m.hasOwnProperty('systemId')) {
      d.systemId = m.systemId;
    }
    if (
      m.testDeviceDeprecated != null &&
      m.hasOwnProperty('testDeviceDeprecated')
    ) {
      d.testDeviceDeprecated = m.testDeviceDeprecated;
    }
    if (m.providerId != null && m.hasOwnProperty('providerId')) {
      d.providerId = m.providerId;
    }
    if (m.serviceTypes && m.serviceTypes.length) {
      d.serviceTypes = [];
      for (var j = 0; j < m.serviceTypes.length; ++j) {
        d.serviceTypes[j] =
          o.enums === String
            ? $root.DrmCertificate.ServiceType[m.serviceTypes[j]] === undefined
              ? m.serviceTypes[j]
              : $root.DrmCertificate.ServiceType[m.serviceTypes[j]]
            : m.serviceTypes[j];
      }
    }
    if (m.algorithm != null && m.hasOwnProperty('algorithm')) {
      d.algorithm =
        o.enums === String
          ? $root.DrmCertificate.Algorithm[m.algorithm] === undefined
            ? m.algorithm
            : $root.DrmCertificate.Algorithm[m.algorithm]
          : m.algorithm;
    }
    if (m.rotId != null && m.hasOwnProperty('rotId')) {
      d.rotId =
        o.bytes === String
          ? $util.base64.encode(m.rotId, 0, m.rotId.length)
          : o.bytes === Array
            ? Array.prototype.slice.call(m.rotId)
            : m.rotId;
    }
    if (m.encryptionKey != null && m.hasOwnProperty('encryptionKey')) {
      d.encryptionKey = $root.DrmCertificate.EncryptionKey.toObject(
        m.encryptionKey,
        o,
      );
    }
    if (
      m.expirationTimeSeconds != null &&
      m.hasOwnProperty('expirationTimeSeconds')
    ) {
      d.expirationTimeSeconds = m.expirationTimeSeconds;
    }
    return d;
  };

  /**
   * Converts this DrmCertificate to JSON.
   * @function toJSON
   * @memberof DrmCertificate
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  DrmCertificate.prototype.toJSON = function toJSON() {
    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
  };

  /**
   * Gets the default type url for DrmCertificate
   * @function getTypeUrl
   * @memberof DrmCertificate
   * @static
   * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns {string} The default type url
   */
  DrmCertificate.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
    if (typeUrlPrefix === undefined) {
      typeUrlPrefix = 'type.googleapis.com';
    }
    return typeUrlPrefix + '/DrmCertificate';
  };

  /**
   * Type enum.
   * @name DrmCertificate.Type
   * @enum {number}
   * @property {number} ROOT=0 ROOT value
   * @property {number} DEVICE_MODEL=1 DEVICE_MODEL value
   * @property {number} DEVICE=2 DEVICE value
   * @property {number} SERVICE=3 SERVICE value
   * @property {number} PROVISIONER=4 PROVISIONER value
   */
  DrmCertificate.Type = (function () {
    const valuesById = {},
      values = Object.create(valuesById);
    values[(valuesById[0] = 'ROOT')] = 0;
    values[(valuesById[1] = 'DEVICE_MODEL')] = 1;
    values[(valuesById[2] = 'DEVICE')] = 2;
    values[(valuesById[3] = 'SERVICE')] = 3;
    values[(valuesById[4] = 'PROVISIONER')] = 4;
    return values;
  })();

  /**
   * ServiceType enum.
   * @name DrmCertificate.ServiceType
   * @enum {number}
   * @property {number} UNKNOWN_SERVICE_TYPE=0 UNKNOWN_SERVICE_TYPE value
   * @property {number} LICENSE_SERVER_SDK=1 LICENSE_SERVER_SDK value
   * @property {number} LICENSE_SERVER_PROXY_SDK=2 LICENSE_SERVER_PROXY_SDK value
   * @property {number} PROVISIONING_SDK=3 PROVISIONING_SDK value
   * @property {number} CAS_PROXY_SDK=4 CAS_PROXY_SDK value
   */
  DrmCertificate.ServiceType = (function () {
    const valuesById = {},
      values = Object.create(valuesById);
    values[(valuesById[0] = 'UNKNOWN_SERVICE_TYPE')] = 0;
    values[(valuesById[1] = 'LICENSE_SERVER_SDK')] = 1;
    values[(valuesById[2] = 'LICENSE_SERVER_PROXY_SDK')] = 2;
    values[(valuesById[3] = 'PROVISIONING_SDK')] = 3;
    values[(valuesById[4] = 'CAS_PROXY_SDK')] = 4;
    return values;
  })();

  /**
   * Algorithm enum.
   * @name DrmCertificate.Algorithm
   * @enum {number}
   * @property {number} UNKNOWN_ALGORITHM=0 UNKNOWN_ALGORITHM value
   * @property {number} RSA=1 RSA value
   * @property {number} ECC_SECP256R1=2 ECC_SECP256R1 value
   * @property {number} ECC_SECP384R1=3 ECC_SECP384R1 value
   * @property {number} ECC_SECP521R1=4 ECC_SECP521R1 value
   */
  DrmCertificate.Algorithm = (function () {
    const valuesById = {},
      values = Object.create(valuesById);
    values[(valuesById[0] = 'UNKNOWN_ALGORITHM')] = 0;
    values[(valuesById[1] = 'RSA')] = 1;
    values[(valuesById[2] = 'ECC_SECP256R1')] = 2;
    values[(valuesById[3] = 'ECC_SECP384R1')] = 3;
    values[(valuesById[4] = 'ECC_SECP521R1')] = 4;
    return values;
  })();

  DrmCertificate.EncryptionKey = (function () {
    /**
     * Properties of an EncryptionKey.
     * @memberof DrmCertificate
     * @interface IEncryptionKey
     * @property {Uint8Array|null} [publicKey] EncryptionKey publicKey
     * @property {DrmCertificate.Algorithm|null} [algorithm] EncryptionKey algorithm
     */

    /**
     * Constructs a new EncryptionKey.
     * @memberof DrmCertificate
     * @classdesc Represents an EncryptionKey.
     * @implements IEncryptionKey
     * @constructor
     * @param {DrmCertificate.IEncryptionKey=} [p] Properties to set
     */
    function EncryptionKey(p) {
      if (p)
        for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
          if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
    }

    /**
     * EncryptionKey publicKey.
     * @member {Uint8Array} publicKey
     * @memberof DrmCertificate.EncryptionKey
     * @instance
     */
    EncryptionKey.prototype.publicKey = $util.newBuffer([]);

    /**
     * EncryptionKey algorithm.
     * @member {DrmCertificate.Algorithm} algorithm
     * @memberof DrmCertificate.EncryptionKey
     * @instance
     */
    EncryptionKey.prototype.algorithm = 1;

    /**
     * Creates a new EncryptionKey instance using the specified properties.
     * @function create
     * @memberof DrmCertificate.EncryptionKey
     * @static
     * @param {DrmCertificate.IEncryptionKey=} [properties] Properties to set
     * @returns {DrmCertificate.EncryptionKey} EncryptionKey instance
     */
    EncryptionKey.create = function create(properties) {
      return new EncryptionKey(properties);
    };

    /**
     * Encodes the specified EncryptionKey message. Does not implicitly {@link DrmCertificate.EncryptionKey.verify|verify} messages.
     * @function encode
     * @memberof DrmCertificate.EncryptionKey
     * @static
     * @param {DrmCertificate.IEncryptionKey} m EncryptionKey message or plain object to encode
     * @param {$protobuf.Writer} [w] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    EncryptionKey.encode = function encode(m, w) {
      if (!w) w = $Writer.create();
      if (m.publicKey != null && Object.hasOwnProperty.call(m, 'publicKey'))
        w.uint32(10).bytes(m.publicKey);
      if (m.algorithm != null && Object.hasOwnProperty.call(m, 'algorithm'))
        w.uint32(16).int32(m.algorithm);
      return w;
    };

    /**
     * Encodes the specified EncryptionKey message, length delimited. Does not implicitly {@link DrmCertificate.EncryptionKey.verify|verify} messages.
     * @function encodeDelimited
     * @memberof DrmCertificate.EncryptionKey
     * @static
     * @param {DrmCertificate.IEncryptionKey} message EncryptionKey message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    EncryptionKey.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes an EncryptionKey message from the specified reader or buffer.
     * @function decode
     * @memberof DrmCertificate.EncryptionKey
     * @static
     * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
     * @param {number} [l] Message length if known beforehand
     * @returns {DrmCertificate.EncryptionKey} EncryptionKey
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    EncryptionKey.decode = function decode(r, l) {
      if (!(r instanceof $Reader)) r = $Reader.create(r);
      var c = l === undefined ? r.len : r.pos + l,
        m = new $root.DrmCertificate.EncryptionKey();
      while (r.pos < c) {
        var t = r.uint32();
        switch (t >>> 3) {
          case 1: {
            m.publicKey = r.bytes();
            break;
          }
          case 2: {
            m.algorithm = r.int32();
            break;
          }
          default:
            r.skipType(t & 7);
            break;
        }
      }
      return m;
    };

    /**
     * Decodes an EncryptionKey message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof DrmCertificate.EncryptionKey
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {DrmCertificate.EncryptionKey} EncryptionKey
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    EncryptionKey.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Creates an EncryptionKey message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof DrmCertificate.EncryptionKey
     * @static
     * @param {Object.<string,*>} d Plain object
     * @returns {DrmCertificate.EncryptionKey} EncryptionKey
     */
    EncryptionKey.fromObject = function fromObject(d) {
      if (d instanceof $root.DrmCertificate.EncryptionKey) return d;
      var m = new $root.DrmCertificate.EncryptionKey();
      if (d.publicKey != null) {
        if (typeof d.publicKey === 'string')
          $util.base64.decode(
            d.publicKey,
            (m.publicKey = $util.newBuffer($util.base64.length(d.publicKey))),
            0,
          );
        else if (d.publicKey.length >= 0) m.publicKey = d.publicKey;
      }
      switch (d.algorithm) {
        case 'UNKNOWN_ALGORITHM':
        case 0:
          m.algorithm = 0;
          break;
        default:
          if (typeof d.algorithm === 'number') {
            m.algorithm = d.algorithm;
            break;
          }
          break;
        case 'RSA':
        case 1:
          m.algorithm = 1;
          break;
        case 'ECC_SECP256R1':
        case 2:
          m.algorithm = 2;
          break;
        case 'ECC_SECP384R1':
        case 3:
          m.algorithm = 3;
          break;
        case 'ECC_SECP521R1':
        case 4:
          m.algorithm = 4;
          break;
      }
      return m;
    };

    /**
     * Creates a plain object from an EncryptionKey message. Also converts values to other types if specified.
     * @function toObject
     * @memberof DrmCertificate.EncryptionKey
     * @static
     * @param {DrmCertificate.EncryptionKey} m EncryptionKey
     * @param {$protobuf.IConversionOptions} [o] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    EncryptionKey.toObject = function toObject(m, o) {
      if (!o) o = {};
      var d = {};
      if (o.defaults) {
        if (o.bytes === String) d.publicKey = '';
        else {
          d.publicKey = [];
          if (o.bytes !== Array) d.publicKey = $util.newBuffer(d.publicKey);
        }
        d.algorithm = o.enums === String ? 'RSA' : 1;
      }
      if (m.publicKey != null && m.hasOwnProperty('publicKey')) {
        d.publicKey =
          o.bytes === String
            ? $util.base64.encode(m.publicKey, 0, m.publicKey.length)
            : o.bytes === Array
              ? Array.prototype.slice.call(m.publicKey)
              : m.publicKey;
      }
      if (m.algorithm != null && m.hasOwnProperty('algorithm')) {
        d.algorithm =
          o.enums === String
            ? $root.DrmCertificate.Algorithm[m.algorithm] === undefined
              ? m.algorithm
              : $root.DrmCertificate.Algorithm[m.algorithm]
            : m.algorithm;
      }
      return d;
    };

    /**
     * Converts this EncryptionKey to JSON.
     * @function toJSON
     * @memberof DrmCertificate.EncryptionKey
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    EncryptionKey.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for EncryptionKey
     * @function getTypeUrl
     * @memberof DrmCertificate.EncryptionKey
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    EncryptionKey.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = 'type.googleapis.com';
      }
      return typeUrlPrefix + '/DrmCertificate.EncryptionKey';
    };

    return EncryptionKey;
  })();

  return DrmCertificate;
})());

export const SignedDrmCertificate = ($root.SignedDrmCertificate = (() => {
  /**
   * Properties of a SignedDrmCertificate.
   * @exports ISignedDrmCertificate
   * @interface ISignedDrmCertificate
   * @property {Uint8Array|null} [drmCertificate] SignedDrmCertificate drmCertificate
   * @property {Uint8Array|null} [signature] SignedDrmCertificate signature
   * @property {ISignedDrmCertificate|null} [signer] SignedDrmCertificate signer
   * @property {HashAlgorithmProto|null} [hashAlgorithm] SignedDrmCertificate hashAlgorithm
   */

  /**
   * Constructs a new SignedDrmCertificate.
   * @exports SignedDrmCertificate
   * @classdesc Represents a SignedDrmCertificate.
   * @implements ISignedDrmCertificate
   * @constructor
   * @param {ISignedDrmCertificate=} [p] Properties to set
   */
  function SignedDrmCertificate(p) {
    if (p)
      for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
        if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
  }

  /**
   * SignedDrmCertificate drmCertificate.
   * @member {Uint8Array} drmCertificate
   * @memberof SignedDrmCertificate
   * @instance
   */
  SignedDrmCertificate.prototype.drmCertificate = $util.newBuffer([]);

  /**
   * SignedDrmCertificate signature.
   * @member {Uint8Array} signature
   * @memberof SignedDrmCertificate
   * @instance
   */
  SignedDrmCertificate.prototype.signature = $util.newBuffer([]);

  /**
   * SignedDrmCertificate signer.
   * @member {ISignedDrmCertificate|null|undefined} signer
   * @memberof SignedDrmCertificate
   * @instance
   */
  SignedDrmCertificate.prototype.signer = null;

  /**
   * SignedDrmCertificate hashAlgorithm.
   * @member {HashAlgorithmProto} hashAlgorithm
   * @memberof SignedDrmCertificate
   * @instance
   */
  SignedDrmCertificate.prototype.hashAlgorithm = 0;

  /**
   * Creates a new SignedDrmCertificate instance using the specified properties.
   * @function create
   * @memberof SignedDrmCertificate
   * @static
   * @param {ISignedDrmCertificate=} [properties] Properties to set
   * @returns {SignedDrmCertificate} SignedDrmCertificate instance
   */
  SignedDrmCertificate.create = function create(properties) {
    return new SignedDrmCertificate(properties);
  };

  /**
   * Encodes the specified SignedDrmCertificate message. Does not implicitly {@link SignedDrmCertificate.verify|verify} messages.
   * @function encode
   * @memberof SignedDrmCertificate
   * @static
   * @param {ISignedDrmCertificate} m SignedDrmCertificate message or plain object to encode
   * @param {$protobuf.Writer} [w] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  SignedDrmCertificate.encode = function encode(m, w) {
    if (!w) w = $Writer.create();
    if (
      m.drmCertificate != null &&
      Object.hasOwnProperty.call(m, 'drmCertificate')
    )
      w.uint32(10).bytes(m.drmCertificate);
    if (m.signature != null && Object.hasOwnProperty.call(m, 'signature'))
      w.uint32(18).bytes(m.signature);
    if (m.signer != null && Object.hasOwnProperty.call(m, 'signer'))
      $root.SignedDrmCertificate.encode(m.signer, w.uint32(26).fork()).ldelim();
    if (
      m.hashAlgorithm != null &&
      Object.hasOwnProperty.call(m, 'hashAlgorithm')
    )
      w.uint32(32).int32(m.hashAlgorithm);
    return w;
  };

  /**
   * Encodes the specified SignedDrmCertificate message, length delimited. Does not implicitly {@link SignedDrmCertificate.verify|verify} messages.
   * @function encodeDelimited
   * @memberof SignedDrmCertificate
   * @static
   * @param {ISignedDrmCertificate} message SignedDrmCertificate message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  SignedDrmCertificate.encodeDelimited = function encodeDelimited(
    message,
    writer,
  ) {
    return this.encode(message, writer).ldelim();
  };

  /**
   * Decodes a SignedDrmCertificate message from the specified reader or buffer.
   * @function decode
   * @memberof SignedDrmCertificate
   * @static
   * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
   * @param {number} [l] Message length if known beforehand
   * @returns {SignedDrmCertificate} SignedDrmCertificate
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  SignedDrmCertificate.decode = function decode(r, l) {
    if (!(r instanceof $Reader)) r = $Reader.create(r);
    var c = l === undefined ? r.len : r.pos + l,
      m = new $root.SignedDrmCertificate();
    while (r.pos < c) {
      var t = r.uint32();
      switch (t >>> 3) {
        case 1: {
          m.drmCertificate = r.bytes();
          break;
        }
        case 2: {
          m.signature = r.bytes();
          break;
        }
        case 3: {
          m.signer = $root.SignedDrmCertificate.decode(r, r.uint32());
          break;
        }
        case 4: {
          m.hashAlgorithm = r.int32();
          break;
        }
        default:
          r.skipType(t & 7);
          break;
      }
    }
    return m;
  };

  /**
   * Decodes a SignedDrmCertificate message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof SignedDrmCertificate
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {SignedDrmCertificate} SignedDrmCertificate
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  SignedDrmCertificate.decodeDelimited = function decodeDelimited(reader) {
    if (!(reader instanceof $Reader)) reader = new $Reader(reader);
    return this.decode(reader, reader.uint32());
  };

  /**
   * Creates a SignedDrmCertificate message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof SignedDrmCertificate
   * @static
   * @param {Object.<string,*>} d Plain object
   * @returns {SignedDrmCertificate} SignedDrmCertificate
   */
  SignedDrmCertificate.fromObject = function fromObject(d) {
    if (d instanceof $root.SignedDrmCertificate) return d;
    var m = new $root.SignedDrmCertificate();
    if (d.drmCertificate != null) {
      if (typeof d.drmCertificate === 'string')
        $util.base64.decode(
          d.drmCertificate,
          (m.drmCertificate = $util.newBuffer(
            $util.base64.length(d.drmCertificate),
          )),
          0,
        );
      else if (d.drmCertificate.length >= 0)
        m.drmCertificate = d.drmCertificate;
    }
    if (d.signature != null) {
      if (typeof d.signature === 'string')
        $util.base64.decode(
          d.signature,
          (m.signature = $util.newBuffer($util.base64.length(d.signature))),
          0,
        );
      else if (d.signature.length >= 0) m.signature = d.signature;
    }
    if (d.signer != null) {
      if (typeof d.signer !== 'object')
        throw TypeError('.SignedDrmCertificate.signer: object expected');
      m.signer = $root.SignedDrmCertificate.fromObject(d.signer);
    }
    switch (d.hashAlgorithm) {
      default:
        if (typeof d.hashAlgorithm === 'number') {
          m.hashAlgorithm = d.hashAlgorithm;
          break;
        }
        break;
      case 'HASH_ALGORITHM_UNSPECIFIED':
      case 0:
        m.hashAlgorithm = 0;
        break;
      case 'HASH_ALGORITHM_SHA_1':
      case 1:
        m.hashAlgorithm = 1;
        break;
      case 'HASH_ALGORITHM_SHA_256':
      case 2:
        m.hashAlgorithm = 2;
        break;
      case 'HASH_ALGORITHM_SHA_384':
      case 3:
        m.hashAlgorithm = 3;
        break;
    }
    return m;
  };

  /**
   * Creates a plain object from a SignedDrmCertificate message. Also converts values to other types if specified.
   * @function toObject
   * @memberof SignedDrmCertificate
   * @static
   * @param {SignedDrmCertificate} m SignedDrmCertificate
   * @param {$protobuf.IConversionOptions} [o] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  SignedDrmCertificate.toObject = function toObject(m, o) {
    if (!o) o = {};
    var d = {};
    if (o.defaults) {
      if (o.bytes === String) d.drmCertificate = '';
      else {
        d.drmCertificate = [];
        if (o.bytes !== Array)
          d.drmCertificate = $util.newBuffer(d.drmCertificate);
      }
      if (o.bytes === String) d.signature = '';
      else {
        d.signature = [];
        if (o.bytes !== Array) d.signature = $util.newBuffer(d.signature);
      }
      d.signer = null;
      d.hashAlgorithm = o.enums === String ? 'HASH_ALGORITHM_UNSPECIFIED' : 0;
    }
    if (m.drmCertificate != null && m.hasOwnProperty('drmCertificate')) {
      d.drmCertificate =
        o.bytes === String
          ? $util.base64.encode(m.drmCertificate, 0, m.drmCertificate.length)
          : o.bytes === Array
            ? Array.prototype.slice.call(m.drmCertificate)
            : m.drmCertificate;
    }
    if (m.signature != null && m.hasOwnProperty('signature')) {
      d.signature =
        o.bytes === String
          ? $util.base64.encode(m.signature, 0, m.signature.length)
          : o.bytes === Array
            ? Array.prototype.slice.call(m.signature)
            : m.signature;
    }
    if (m.signer != null && m.hasOwnProperty('signer')) {
      d.signer = $root.SignedDrmCertificate.toObject(m.signer, o);
    }
    if (m.hashAlgorithm != null && m.hasOwnProperty('hashAlgorithm')) {
      d.hashAlgorithm =
        o.enums === String
          ? $root.HashAlgorithmProto[m.hashAlgorithm] === undefined
            ? m.hashAlgorithm
            : $root.HashAlgorithmProto[m.hashAlgorithm]
          : m.hashAlgorithm;
    }
    return d;
  };

  /**
   * Converts this SignedDrmCertificate to JSON.
   * @function toJSON
   * @memberof SignedDrmCertificate
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  SignedDrmCertificate.prototype.toJSON = function toJSON() {
    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
  };

  /**
   * Gets the default type url for SignedDrmCertificate
   * @function getTypeUrl
   * @memberof SignedDrmCertificate
   * @static
   * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns {string} The default type url
   */
  SignedDrmCertificate.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
    if (typeUrlPrefix === undefined) {
      typeUrlPrefix = 'type.googleapis.com';
    }
    return typeUrlPrefix + '/SignedDrmCertificate';
  };

  return SignedDrmCertificate;
})());

export const WidevinePsshData = ($root.WidevinePsshData = (() => {
  /**
   * Properties of a WidevinePsshData.
   * @exports IWidevinePsshData
   * @interface IWidevinePsshData
   * @property {Array.<Uint8Array>|null} [keyIds] WidevinePsshData keyIds
   * @property {Uint8Array|null} [contentId] WidevinePsshData contentId
   * @property {number|null} [cryptoPeriodIndex] WidevinePsshData cryptoPeriodIndex
   * @property {number|null} [protectionScheme] WidevinePsshData protectionScheme
   * @property {number|null} [cryptoPeriodSeconds] WidevinePsshData cryptoPeriodSeconds
   * @property {WidevinePsshData.Type|null} [type] WidevinePsshData type
   * @property {number|null} [keySequence] WidevinePsshData keySequence
   * @property {Array.<Uint8Array>|null} [groupIds] WidevinePsshData groupIds
   * @property {Array.<WidevinePsshData.IEntitledKey>|null} [entitledKeys] WidevinePsshData entitledKeys
   * @property {string|null} [videoFeature] WidevinePsshData videoFeature
   * @property {WidevinePsshData.Algorithm|null} [algorithm] WidevinePsshData algorithm
   * @property {string|null} [provider] WidevinePsshData provider
   * @property {string|null} [trackType] WidevinePsshData trackType
   * @property {string|null} [policy] WidevinePsshData policy
   * @property {Uint8Array|null} [groupedLicense] WidevinePsshData groupedLicense
   */

  /**
   * Constructs a new WidevinePsshData.
   * @exports WidevinePsshData
   * @classdesc Represents a WidevinePsshData.
   * @implements IWidevinePsshData
   * @constructor
   * @param {IWidevinePsshData=} [p] Properties to set
   */
  function WidevinePsshData(p) {
    this.keyIds = [];
    this.groupIds = [];
    this.entitledKeys = [];
    if (p)
      for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
        if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
  }

  /**
   * WidevinePsshData keyIds.
   * @member {Array.<Uint8Array>} keyIds
   * @memberof WidevinePsshData
   * @instance
   */
  WidevinePsshData.prototype.keyIds = $util.emptyArray;

  /**
   * WidevinePsshData contentId.
   * @member {Uint8Array} contentId
   * @memberof WidevinePsshData
   * @instance
   */
  WidevinePsshData.prototype.contentId = $util.newBuffer([]);

  /**
   * WidevinePsshData cryptoPeriodIndex.
   * @member {number} cryptoPeriodIndex
   * @memberof WidevinePsshData
   * @instance
   */
  WidevinePsshData.prototype.cryptoPeriodIndex = 0;

  /**
   * WidevinePsshData protectionScheme.
   * @member {number} protectionScheme
   * @memberof WidevinePsshData
   * @instance
   */
  WidevinePsshData.prototype.protectionScheme = 0;

  /**
   * WidevinePsshData cryptoPeriodSeconds.
   * @member {number} cryptoPeriodSeconds
   * @memberof WidevinePsshData
   * @instance
   */
  WidevinePsshData.prototype.cryptoPeriodSeconds = 0;

  /**
   * WidevinePsshData type.
   * @member {WidevinePsshData.Type} type
   * @memberof WidevinePsshData
   * @instance
   */
  WidevinePsshData.prototype.type = 0;

  /**
   * WidevinePsshData keySequence.
   * @member {number} keySequence
   * @memberof WidevinePsshData
   * @instance
   */
  WidevinePsshData.prototype.keySequence = 0;

  /**
   * WidevinePsshData groupIds.
   * @member {Array.<Uint8Array>} groupIds
   * @memberof WidevinePsshData
   * @instance
   */
  WidevinePsshData.prototype.groupIds = $util.emptyArray;

  /**
   * WidevinePsshData entitledKeys.
   * @member {Array.<WidevinePsshData.IEntitledKey>} entitledKeys
   * @memberof WidevinePsshData
   * @instance
   */
  WidevinePsshData.prototype.entitledKeys = $util.emptyArray;

  /**
   * WidevinePsshData videoFeature.
   * @member {string} videoFeature
   * @memberof WidevinePsshData
   * @instance
   */
  WidevinePsshData.prototype.videoFeature = '';

  /**
   * WidevinePsshData algorithm.
   * @member {WidevinePsshData.Algorithm} algorithm
   * @memberof WidevinePsshData
   * @instance
   */
  WidevinePsshData.prototype.algorithm = 0;

  /**
   * WidevinePsshData provider.
   * @member {string} provider
   * @memberof WidevinePsshData
   * @instance
   */
  WidevinePsshData.prototype.provider = '';

  /**
   * WidevinePsshData trackType.
   * @member {string} trackType
   * @memberof WidevinePsshData
   * @instance
   */
  WidevinePsshData.prototype.trackType = '';

  /**
   * WidevinePsshData policy.
   * @member {string} policy
   * @memberof WidevinePsshData
   * @instance
   */
  WidevinePsshData.prototype.policy = '';

  /**
   * WidevinePsshData groupedLicense.
   * @member {Uint8Array} groupedLicense
   * @memberof WidevinePsshData
   * @instance
   */
  WidevinePsshData.prototype.groupedLicense = $util.newBuffer([]);

  /**
   * Creates a new WidevinePsshData instance using the specified properties.
   * @function create
   * @memberof WidevinePsshData
   * @static
   * @param {IWidevinePsshData=} [properties] Properties to set
   * @returns {WidevinePsshData} WidevinePsshData instance
   */
  WidevinePsshData.create = function create(properties) {
    return new WidevinePsshData(properties);
  };

  /**
   * Encodes the specified WidevinePsshData message. Does not implicitly {@link WidevinePsshData.verify|verify} messages.
   * @function encode
   * @memberof WidevinePsshData
   * @static
   * @param {IWidevinePsshData} m WidevinePsshData message or plain object to encode
   * @param {$protobuf.Writer} [w] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  WidevinePsshData.encode = function encode(m, w) {
    if (!w) w = $Writer.create();
    if (m.algorithm != null && Object.hasOwnProperty.call(m, 'algorithm'))
      w.uint32(8).int32(m.algorithm);
    if (m.keyIds != null && m.keyIds.length) {
      for (var i = 0; i < m.keyIds.length; ++i) w.uint32(18).bytes(m.keyIds[i]);
    }
    if (m.provider != null && Object.hasOwnProperty.call(m, 'provider'))
      w.uint32(26).string(m.provider);
    if (m.contentId != null && Object.hasOwnProperty.call(m, 'contentId'))
      w.uint32(34).bytes(m.contentId);
    if (m.trackType != null && Object.hasOwnProperty.call(m, 'trackType'))
      w.uint32(42).string(m.trackType);
    if (m.policy != null && Object.hasOwnProperty.call(m, 'policy'))
      w.uint32(50).string(m.policy);
    if (
      m.cryptoPeriodIndex != null &&
      Object.hasOwnProperty.call(m, 'cryptoPeriodIndex')
    )
      w.uint32(56).uint32(m.cryptoPeriodIndex);
    if (
      m.groupedLicense != null &&
      Object.hasOwnProperty.call(m, 'groupedLicense')
    )
      w.uint32(66).bytes(m.groupedLicense);
    if (
      m.protectionScheme != null &&
      Object.hasOwnProperty.call(m, 'protectionScheme')
    )
      w.uint32(72).uint32(m.protectionScheme);
    if (
      m.cryptoPeriodSeconds != null &&
      Object.hasOwnProperty.call(m, 'cryptoPeriodSeconds')
    )
      w.uint32(80).uint32(m.cryptoPeriodSeconds);
    if (m.type != null && Object.hasOwnProperty.call(m, 'type'))
      w.uint32(88).int32(m.type);
    if (m.keySequence != null && Object.hasOwnProperty.call(m, 'keySequence'))
      w.uint32(96).uint32(m.keySequence);
    if (m.groupIds != null && m.groupIds.length) {
      for (var i = 0; i < m.groupIds.length; ++i)
        w.uint32(106).bytes(m.groupIds[i]);
    }
    if (m.entitledKeys != null && m.entitledKeys.length) {
      for (var i = 0; i < m.entitledKeys.length; ++i)
        $root.WidevinePsshData.EntitledKey.encode(
          m.entitledKeys[i],
          w.uint32(114).fork(),
        ).ldelim();
    }
    if (m.videoFeature != null && Object.hasOwnProperty.call(m, 'videoFeature'))
      w.uint32(122).string(m.videoFeature);
    return w;
  };

  /**
   * Encodes the specified WidevinePsshData message, length delimited. Does not implicitly {@link WidevinePsshData.verify|verify} messages.
   * @function encodeDelimited
   * @memberof WidevinePsshData
   * @static
   * @param {IWidevinePsshData} message WidevinePsshData message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  WidevinePsshData.encodeDelimited = function encodeDelimited(message, writer) {
    return this.encode(message, writer).ldelim();
  };

  /**
   * Decodes a WidevinePsshData message from the specified reader or buffer.
   * @function decode
   * @memberof WidevinePsshData
   * @static
   * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
   * @param {number} [l] Message length if known beforehand
   * @returns {WidevinePsshData} WidevinePsshData
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  WidevinePsshData.decode = function decode(r, l) {
    if (!(r instanceof $Reader)) r = $Reader.create(r);
    var c = l === undefined ? r.len : r.pos + l,
      m = new $root.WidevinePsshData();
    while (r.pos < c) {
      var t = r.uint32();
      switch (t >>> 3) {
        case 2: {
          if (!(m.keyIds && m.keyIds.length)) m.keyIds = [];
          m.keyIds.push(r.bytes());
          break;
        }
        case 4: {
          m.contentId = r.bytes();
          break;
        }
        case 7: {
          m.cryptoPeriodIndex = r.uint32();
          break;
        }
        case 9: {
          m.protectionScheme = r.uint32();
          break;
        }
        case 10: {
          m.cryptoPeriodSeconds = r.uint32();
          break;
        }
        case 11: {
          m.type = r.int32();
          break;
        }
        case 12: {
          m.keySequence = r.uint32();
          break;
        }
        case 13: {
          if (!(m.groupIds && m.groupIds.length)) m.groupIds = [];
          m.groupIds.push(r.bytes());
          break;
        }
        case 14: {
          if (!(m.entitledKeys && m.entitledKeys.length)) m.entitledKeys = [];
          m.entitledKeys.push(
            $root.WidevinePsshData.EntitledKey.decode(r, r.uint32()),
          );
          break;
        }
        case 15: {
          m.videoFeature = r.string();
          break;
        }
        case 1: {
          m.algorithm = r.int32();
          break;
        }
        case 3: {
          m.provider = r.string();
          break;
        }
        case 5: {
          m.trackType = r.string();
          break;
        }
        case 6: {
          m.policy = r.string();
          break;
        }
        case 8: {
          m.groupedLicense = r.bytes();
          break;
        }
        default:
          r.skipType(t & 7);
          break;
      }
    }
    return m;
  };

  /**
   * Decodes a WidevinePsshData message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof WidevinePsshData
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {WidevinePsshData} WidevinePsshData
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  WidevinePsshData.decodeDelimited = function decodeDelimited(reader) {
    if (!(reader instanceof $Reader)) reader = new $Reader(reader);
    return this.decode(reader, reader.uint32());
  };

  /**
   * Creates a WidevinePsshData message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof WidevinePsshData
   * @static
   * @param {Object.<string,*>} d Plain object
   * @returns {WidevinePsshData} WidevinePsshData
   */
  WidevinePsshData.fromObject = function fromObject(d) {
    if (d instanceof $root.WidevinePsshData) return d;
    var m = new $root.WidevinePsshData();
    if (d.keyIds) {
      if (!Array.isArray(d.keyIds))
        throw TypeError('.WidevinePsshData.keyIds: array expected');
      m.keyIds = [];
      for (var i = 0; i < d.keyIds.length; ++i) {
        if (typeof d.keyIds[i] === 'string')
          $util.base64.decode(
            d.keyIds[i],
            (m.keyIds[i] = $util.newBuffer($util.base64.length(d.keyIds[i]))),
            0,
          );
        else if (d.keyIds[i].length >= 0) m.keyIds[i] = d.keyIds[i];
      }
    }
    if (d.contentId != null) {
      if (typeof d.contentId === 'string')
        $util.base64.decode(
          d.contentId,
          (m.contentId = $util.newBuffer($util.base64.length(d.contentId))),
          0,
        );
      else if (d.contentId.length >= 0) m.contentId = d.contentId;
    }
    if (d.cryptoPeriodIndex != null) {
      m.cryptoPeriodIndex = d.cryptoPeriodIndex >>> 0;
    }
    if (d.protectionScheme != null) {
      m.protectionScheme = d.protectionScheme >>> 0;
    }
    if (d.cryptoPeriodSeconds != null) {
      m.cryptoPeriodSeconds = d.cryptoPeriodSeconds >>> 0;
    }
    switch (d.type) {
      default:
        if (typeof d.type === 'number') {
          m.type = d.type;
          break;
        }
        break;
      case 'SINGLE':
      case 0:
        m.type = 0;
        break;
      case 'ENTITLEMENT':
      case 1:
        m.type = 1;
        break;
      case 'ENTITLED_KEY':
      case 2:
        m.type = 2;
        break;
    }
    if (d.keySequence != null) {
      m.keySequence = d.keySequence >>> 0;
    }
    if (d.groupIds) {
      if (!Array.isArray(d.groupIds))
        throw TypeError('.WidevinePsshData.groupIds: array expected');
      m.groupIds = [];
      for (var i = 0; i < d.groupIds.length; ++i) {
        if (typeof d.groupIds[i] === 'string')
          $util.base64.decode(
            d.groupIds[i],
            (m.groupIds[i] = $util.newBuffer(
              $util.base64.length(d.groupIds[i]),
            )),
            0,
          );
        else if (d.groupIds[i].length >= 0) m.groupIds[i] = d.groupIds[i];
      }
    }
    if (d.entitledKeys) {
      if (!Array.isArray(d.entitledKeys))
        throw TypeError('.WidevinePsshData.entitledKeys: array expected');
      m.entitledKeys = [];
      for (var i = 0; i < d.entitledKeys.length; ++i) {
        if (typeof d.entitledKeys[i] !== 'object')
          throw TypeError('.WidevinePsshData.entitledKeys: object expected');
        m.entitledKeys[i] = $root.WidevinePsshData.EntitledKey.fromObject(
          d.entitledKeys[i],
        );
      }
    }
    if (d.videoFeature != null) {
      m.videoFeature = String(d.videoFeature);
    }
    switch (d.algorithm) {
      default:
        if (typeof d.algorithm === 'number') {
          m.algorithm = d.algorithm;
          break;
        }
        break;
      case 'UNENCRYPTED':
      case 0:
        m.algorithm = 0;
        break;
      case 'AESCTR':
      case 1:
        m.algorithm = 1;
        break;
    }
    if (d.provider != null) {
      m.provider = String(d.provider);
    }
    if (d.trackType != null) {
      m.trackType = String(d.trackType);
    }
    if (d.policy != null) {
      m.policy = String(d.policy);
    }
    if (d.groupedLicense != null) {
      if (typeof d.groupedLicense === 'string')
        $util.base64.decode(
          d.groupedLicense,
          (m.groupedLicense = $util.newBuffer(
            $util.base64.length(d.groupedLicense),
          )),
          0,
        );
      else if (d.groupedLicense.length >= 0)
        m.groupedLicense = d.groupedLicense;
    }
    return m;
  };

  /**
   * Creates a plain object from a WidevinePsshData message. Also converts values to other types if specified.
   * @function toObject
   * @memberof WidevinePsshData
   * @static
   * @param {WidevinePsshData} m WidevinePsshData
   * @param {$protobuf.IConversionOptions} [o] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  WidevinePsshData.toObject = function toObject(m, o) {
    if (!o) o = {};
    var d = {};
    if (o.arrays || o.defaults) {
      d.keyIds = [];
      d.groupIds = [];
      d.entitledKeys = [];
    }
    if (o.defaults) {
      d.algorithm = o.enums === String ? 'UNENCRYPTED' : 0;
      d.provider = '';
      if (o.bytes === String) d.contentId = '';
      else {
        d.contentId = [];
        if (o.bytes !== Array) d.contentId = $util.newBuffer(d.contentId);
      }
      d.trackType = '';
      d.policy = '';
      d.cryptoPeriodIndex = 0;
      if (o.bytes === String) d.groupedLicense = '';
      else {
        d.groupedLicense = [];
        if (o.bytes !== Array)
          d.groupedLicense = $util.newBuffer(d.groupedLicense);
      }
      d.protectionScheme = 0;
      d.cryptoPeriodSeconds = 0;
      d.type = o.enums === String ? 'SINGLE' : 0;
      d.keySequence = 0;
      d.videoFeature = '';
    }
    if (m.algorithm != null && m.hasOwnProperty('algorithm')) {
      d.algorithm =
        o.enums === String
          ? $root.WidevinePsshData.Algorithm[m.algorithm] === undefined
            ? m.algorithm
            : $root.WidevinePsshData.Algorithm[m.algorithm]
          : m.algorithm;
    }
    if (m.keyIds && m.keyIds.length) {
      d.keyIds = [];
      for (var j = 0; j < m.keyIds.length; ++j) {
        d.keyIds[j] =
          o.bytes === String
            ? $util.base64.encode(m.keyIds[j], 0, m.keyIds[j].length)
            : o.bytes === Array
              ? Array.prototype.slice.call(m.keyIds[j])
              : m.keyIds[j];
      }
    }
    if (m.provider != null && m.hasOwnProperty('provider')) {
      d.provider = m.provider;
    }
    if (m.contentId != null && m.hasOwnProperty('contentId')) {
      d.contentId =
        o.bytes === String
          ? $util.base64.encode(m.contentId, 0, m.contentId.length)
          : o.bytes === Array
            ? Array.prototype.slice.call(m.contentId)
            : m.contentId;
    }
    if (m.trackType != null && m.hasOwnProperty('trackType')) {
      d.trackType = m.trackType;
    }
    if (m.policy != null && m.hasOwnProperty('policy')) {
      d.policy = m.policy;
    }
    if (m.cryptoPeriodIndex != null && m.hasOwnProperty('cryptoPeriodIndex')) {
      d.cryptoPeriodIndex = m.cryptoPeriodIndex;
    }
    if (m.groupedLicense != null && m.hasOwnProperty('groupedLicense')) {
      d.groupedLicense =
        o.bytes === String
          ? $util.base64.encode(m.groupedLicense, 0, m.groupedLicense.length)
          : o.bytes === Array
            ? Array.prototype.slice.call(m.groupedLicense)
            : m.groupedLicense;
    }
    if (m.protectionScheme != null && m.hasOwnProperty('protectionScheme')) {
      d.protectionScheme = m.protectionScheme;
    }
    if (
      m.cryptoPeriodSeconds != null &&
      m.hasOwnProperty('cryptoPeriodSeconds')
    ) {
      d.cryptoPeriodSeconds = m.cryptoPeriodSeconds;
    }
    if (m.type != null && m.hasOwnProperty('type')) {
      d.type =
        o.enums === String
          ? $root.WidevinePsshData.Type[m.type] === undefined
            ? m.type
            : $root.WidevinePsshData.Type[m.type]
          : m.type;
    }
    if (m.keySequence != null && m.hasOwnProperty('keySequence')) {
      d.keySequence = m.keySequence;
    }
    if (m.groupIds && m.groupIds.length) {
      d.groupIds = [];
      for (var j = 0; j < m.groupIds.length; ++j) {
        d.groupIds[j] =
          o.bytes === String
            ? $util.base64.encode(m.groupIds[j], 0, m.groupIds[j].length)
            : o.bytes === Array
              ? Array.prototype.slice.call(m.groupIds[j])
              : m.groupIds[j];
      }
    }
    if (m.entitledKeys && m.entitledKeys.length) {
      d.entitledKeys = [];
      for (var j = 0; j < m.entitledKeys.length; ++j) {
        d.entitledKeys[j] = $root.WidevinePsshData.EntitledKey.toObject(
          m.entitledKeys[j],
          o,
        );
      }
    }
    if (m.videoFeature != null && m.hasOwnProperty('videoFeature')) {
      d.videoFeature = m.videoFeature;
    }
    return d;
  };

  /**
   * Converts this WidevinePsshData to JSON.
   * @function toJSON
   * @memberof WidevinePsshData
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  WidevinePsshData.prototype.toJSON = function toJSON() {
    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
  };

  /**
   * Gets the default type url for WidevinePsshData
   * @function getTypeUrl
   * @memberof WidevinePsshData
   * @static
   * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns {string} The default type url
   */
  WidevinePsshData.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
    if (typeUrlPrefix === undefined) {
      typeUrlPrefix = 'type.googleapis.com';
    }
    return typeUrlPrefix + '/WidevinePsshData';
  };

  /**
   * Type enum.
   * @name WidevinePsshData.Type
   * @enum {number}
   * @property {number} SINGLE=0 SINGLE value
   * @property {number} ENTITLEMENT=1 ENTITLEMENT value
   * @property {number} ENTITLED_KEY=2 ENTITLED_KEY value
   */
  WidevinePsshData.Type = (function () {
    const valuesById = {},
      values = Object.create(valuesById);
    values[(valuesById[0] = 'SINGLE')] = 0;
    values[(valuesById[1] = 'ENTITLEMENT')] = 1;
    values[(valuesById[2] = 'ENTITLED_KEY')] = 2;
    return values;
  })();

  WidevinePsshData.EntitledKey = (function () {
    /**
     * Properties of an EntitledKey.
     * @memberof WidevinePsshData
     * @interface IEntitledKey
     * @property {Uint8Array|null} [entitlementKeyId] EntitledKey entitlementKeyId
     * @property {Uint8Array|null} [keyId] EntitledKey keyId
     * @property {Uint8Array|null} [key] EntitledKey key
     * @property {Uint8Array|null} [iv] EntitledKey iv
     * @property {number|null} [entitlementKeySizeBytes] EntitledKey entitlementKeySizeBytes
     */

    /**
     * Constructs a new EntitledKey.
     * @memberof WidevinePsshData
     * @classdesc Represents an EntitledKey.
     * @implements IEntitledKey
     * @constructor
     * @param {WidevinePsshData.IEntitledKey=} [p] Properties to set
     */
    function EntitledKey(p) {
      if (p)
        for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
          if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
    }

    /**
     * EntitledKey entitlementKeyId.
     * @member {Uint8Array} entitlementKeyId
     * @memberof WidevinePsshData.EntitledKey
     * @instance
     */
    EntitledKey.prototype.entitlementKeyId = $util.newBuffer([]);

    /**
     * EntitledKey keyId.
     * @member {Uint8Array} keyId
     * @memberof WidevinePsshData.EntitledKey
     * @instance
     */
    EntitledKey.prototype.keyId = $util.newBuffer([]);

    /**
     * EntitledKey key.
     * @member {Uint8Array} key
     * @memberof WidevinePsshData.EntitledKey
     * @instance
     */
    EntitledKey.prototype.key = $util.newBuffer([]);

    /**
     * EntitledKey iv.
     * @member {Uint8Array} iv
     * @memberof WidevinePsshData.EntitledKey
     * @instance
     */
    EntitledKey.prototype.iv = $util.newBuffer([]);

    /**
     * EntitledKey entitlementKeySizeBytes.
     * @member {number} entitlementKeySizeBytes
     * @memberof WidevinePsshData.EntitledKey
     * @instance
     */
    EntitledKey.prototype.entitlementKeySizeBytes = 32;

    /**
     * Creates a new EntitledKey instance using the specified properties.
     * @function create
     * @memberof WidevinePsshData.EntitledKey
     * @static
     * @param {WidevinePsshData.IEntitledKey=} [properties] Properties to set
     * @returns {WidevinePsshData.EntitledKey} EntitledKey instance
     */
    EntitledKey.create = function create(properties) {
      return new EntitledKey(properties);
    };

    /**
     * Encodes the specified EntitledKey message. Does not implicitly {@link WidevinePsshData.EntitledKey.verify|verify} messages.
     * @function encode
     * @memberof WidevinePsshData.EntitledKey
     * @static
     * @param {WidevinePsshData.IEntitledKey} m EntitledKey message or plain object to encode
     * @param {$protobuf.Writer} [w] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    EntitledKey.encode = function encode(m, w) {
      if (!w) w = $Writer.create();
      if (
        m.entitlementKeyId != null &&
        Object.hasOwnProperty.call(m, 'entitlementKeyId')
      )
        w.uint32(10).bytes(m.entitlementKeyId);
      if (m.keyId != null && Object.hasOwnProperty.call(m, 'keyId'))
        w.uint32(18).bytes(m.keyId);
      if (m.key != null && Object.hasOwnProperty.call(m, 'key'))
        w.uint32(26).bytes(m.key);
      if (m.iv != null && Object.hasOwnProperty.call(m, 'iv'))
        w.uint32(34).bytes(m.iv);
      if (
        m.entitlementKeySizeBytes != null &&
        Object.hasOwnProperty.call(m, 'entitlementKeySizeBytes')
      )
        w.uint32(40).uint32(m.entitlementKeySizeBytes);
      return w;
    };

    /**
     * Encodes the specified EntitledKey message, length delimited. Does not implicitly {@link WidevinePsshData.EntitledKey.verify|verify} messages.
     * @function encodeDelimited
     * @memberof WidevinePsshData.EntitledKey
     * @static
     * @param {WidevinePsshData.IEntitledKey} message EntitledKey message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    EntitledKey.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes an EntitledKey message from the specified reader or buffer.
     * @function decode
     * @memberof WidevinePsshData.EntitledKey
     * @static
     * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
     * @param {number} [l] Message length if known beforehand
     * @returns {WidevinePsshData.EntitledKey} EntitledKey
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    EntitledKey.decode = function decode(r, l) {
      if (!(r instanceof $Reader)) r = $Reader.create(r);
      var c = l === undefined ? r.len : r.pos + l,
        m = new $root.WidevinePsshData.EntitledKey();
      while (r.pos < c) {
        var t = r.uint32();
        switch (t >>> 3) {
          case 1: {
            m.entitlementKeyId = r.bytes();
            break;
          }
          case 2: {
            m.keyId = r.bytes();
            break;
          }
          case 3: {
            m.key = r.bytes();
            break;
          }
          case 4: {
            m.iv = r.bytes();
            break;
          }
          case 5: {
            m.entitlementKeySizeBytes = r.uint32();
            break;
          }
          default:
            r.skipType(t & 7);
            break;
        }
      }
      return m;
    };

    /**
     * Decodes an EntitledKey message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof WidevinePsshData.EntitledKey
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {WidevinePsshData.EntitledKey} EntitledKey
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    EntitledKey.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Creates an EntitledKey message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof WidevinePsshData.EntitledKey
     * @static
     * @param {Object.<string,*>} d Plain object
     * @returns {WidevinePsshData.EntitledKey} EntitledKey
     */
    EntitledKey.fromObject = function fromObject(d) {
      if (d instanceof $root.WidevinePsshData.EntitledKey) return d;
      var m = new $root.WidevinePsshData.EntitledKey();
      if (d.entitlementKeyId != null) {
        if (typeof d.entitlementKeyId === 'string')
          $util.base64.decode(
            d.entitlementKeyId,
            (m.entitlementKeyId = $util.newBuffer(
              $util.base64.length(d.entitlementKeyId),
            )),
            0,
          );
        else if (d.entitlementKeyId.length >= 0)
          m.entitlementKeyId = d.entitlementKeyId;
      }
      if (d.keyId != null) {
        if (typeof d.keyId === 'string')
          $util.base64.decode(
            d.keyId,
            (m.keyId = $util.newBuffer($util.base64.length(d.keyId))),
            0,
          );
        else if (d.keyId.length >= 0) m.keyId = d.keyId;
      }
      if (d.key != null) {
        if (typeof d.key === 'string')
          $util.base64.decode(
            d.key,
            (m.key = $util.newBuffer($util.base64.length(d.key))),
            0,
          );
        else if (d.key.length >= 0) m.key = d.key;
      }
      if (d.iv != null) {
        if (typeof d.iv === 'string')
          $util.base64.decode(
            d.iv,
            (m.iv = $util.newBuffer($util.base64.length(d.iv))),
            0,
          );
        else if (d.iv.length >= 0) m.iv = d.iv;
      }
      if (d.entitlementKeySizeBytes != null) {
        m.entitlementKeySizeBytes = d.entitlementKeySizeBytes >>> 0;
      }
      return m;
    };

    /**
     * Creates a plain object from an EntitledKey message. Also converts values to other types if specified.
     * @function toObject
     * @memberof WidevinePsshData.EntitledKey
     * @static
     * @param {WidevinePsshData.EntitledKey} m EntitledKey
     * @param {$protobuf.IConversionOptions} [o] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    EntitledKey.toObject = function toObject(m, o) {
      if (!o) o = {};
      var d = {};
      if (o.defaults) {
        if (o.bytes === String) d.entitlementKeyId = '';
        else {
          d.entitlementKeyId = [];
          if (o.bytes !== Array)
            d.entitlementKeyId = $util.newBuffer(d.entitlementKeyId);
        }
        if (o.bytes === String) d.keyId = '';
        else {
          d.keyId = [];
          if (o.bytes !== Array) d.keyId = $util.newBuffer(d.keyId);
        }
        if (o.bytes === String) d.key = '';
        else {
          d.key = [];
          if (o.bytes !== Array) d.key = $util.newBuffer(d.key);
        }
        if (o.bytes === String) d.iv = '';
        else {
          d.iv = [];
          if (o.bytes !== Array) d.iv = $util.newBuffer(d.iv);
        }
        d.entitlementKeySizeBytes = 32;
      }
      if (m.entitlementKeyId != null && m.hasOwnProperty('entitlementKeyId')) {
        d.entitlementKeyId =
          o.bytes === String
            ? $util.base64.encode(
                m.entitlementKeyId,
                0,
                m.entitlementKeyId.length,
              )
            : o.bytes === Array
              ? Array.prototype.slice.call(m.entitlementKeyId)
              : m.entitlementKeyId;
      }
      if (m.keyId != null && m.hasOwnProperty('keyId')) {
        d.keyId =
          o.bytes === String
            ? $util.base64.encode(m.keyId, 0, m.keyId.length)
            : o.bytes === Array
              ? Array.prototype.slice.call(m.keyId)
              : m.keyId;
      }
      if (m.key != null && m.hasOwnProperty('key')) {
        d.key =
          o.bytes === String
            ? $util.base64.encode(m.key, 0, m.key.length)
            : o.bytes === Array
              ? Array.prototype.slice.call(m.key)
              : m.key;
      }
      if (m.iv != null && m.hasOwnProperty('iv')) {
        d.iv =
          o.bytes === String
            ? $util.base64.encode(m.iv, 0, m.iv.length)
            : o.bytes === Array
              ? Array.prototype.slice.call(m.iv)
              : m.iv;
      }
      if (
        m.entitlementKeySizeBytes != null &&
        m.hasOwnProperty('entitlementKeySizeBytes')
      ) {
        d.entitlementKeySizeBytes = m.entitlementKeySizeBytes;
      }
      return d;
    };

    /**
     * Converts this EntitledKey to JSON.
     * @function toJSON
     * @memberof WidevinePsshData.EntitledKey
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    EntitledKey.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for EntitledKey
     * @function getTypeUrl
     * @memberof WidevinePsshData.EntitledKey
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    EntitledKey.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = 'type.googleapis.com';
      }
      return typeUrlPrefix + '/WidevinePsshData.EntitledKey';
    };

    return EntitledKey;
  })();

  /**
   * Deprecated Fields  ////////////////////////////
   * @name WidevinePsshData.Algorithm
   * @enum {number}
   * @property {number} UNENCRYPTED=0 UNENCRYPTED value
   * @property {number} AESCTR=1 AESCTR value
   */
  WidevinePsshData.Algorithm = (function () {
    const valuesById = {},
      values = Object.create(valuesById);
    values[(valuesById[0] = 'UNENCRYPTED')] = 0;
    values[(valuesById[1] = 'AESCTR')] = 1;
    return values;
  })();

  return WidevinePsshData;
})());

export const FileHashes = ($root.FileHashes = (() => {
  /**
   * Properties of a FileHashes.
   * @exports IFileHashes
   * @interface IFileHashes
   * @property {Uint8Array|null} [signer] FileHashes signer
   * @property {Array.<FileHashes.ISignature>|null} [signatures] FileHashes signatures
   */

  /**
   * Constructs a new FileHashes.
   * @exports FileHashes
   * @classdesc Represents a FileHashes.
   * @implements IFileHashes
   * @constructor
   * @param {IFileHashes=} [p] Properties to set
   */
  function FileHashes(p) {
    this.signatures = [];
    if (p)
      for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
        if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
  }

  /**
   * FileHashes signer.
   * @member {Uint8Array} signer
   * @memberof FileHashes
   * @instance
   */
  FileHashes.prototype.signer = $util.newBuffer([]);

  /**
   * FileHashes signatures.
   * @member {Array.<FileHashes.ISignature>} signatures
   * @memberof FileHashes
   * @instance
   */
  FileHashes.prototype.signatures = $util.emptyArray;

  /**
   * Creates a new FileHashes instance using the specified properties.
   * @function create
   * @memberof FileHashes
   * @static
   * @param {IFileHashes=} [properties] Properties to set
   * @returns {FileHashes} FileHashes instance
   */
  FileHashes.create = function create(properties) {
    return new FileHashes(properties);
  };

  /**
   * Encodes the specified FileHashes message. Does not implicitly {@link FileHashes.verify|verify} messages.
   * @function encode
   * @memberof FileHashes
   * @static
   * @param {IFileHashes} m FileHashes message or plain object to encode
   * @param {$protobuf.Writer} [w] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  FileHashes.encode = function encode(m, w) {
    if (!w) w = $Writer.create();
    if (m.signer != null && Object.hasOwnProperty.call(m, 'signer'))
      w.uint32(10).bytes(m.signer);
    if (m.signatures != null && m.signatures.length) {
      for (var i = 0; i < m.signatures.length; ++i)
        $root.FileHashes.Signature.encode(
          m.signatures[i],
          w.uint32(18).fork(),
        ).ldelim();
    }
    return w;
  };

  /**
   * Encodes the specified FileHashes message, length delimited. Does not implicitly {@link FileHashes.verify|verify} messages.
   * @function encodeDelimited
   * @memberof FileHashes
   * @static
   * @param {IFileHashes} message FileHashes message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  FileHashes.encodeDelimited = function encodeDelimited(message, writer) {
    return this.encode(message, writer).ldelim();
  };

  /**
   * Decodes a FileHashes message from the specified reader or buffer.
   * @function decode
   * @memberof FileHashes
   * @static
   * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
   * @param {number} [l] Message length if known beforehand
   * @returns {FileHashes} FileHashes
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  FileHashes.decode = function decode(r, l) {
    if (!(r instanceof $Reader)) r = $Reader.create(r);
    var c = l === undefined ? r.len : r.pos + l,
      m = new $root.FileHashes();
    while (r.pos < c) {
      var t = r.uint32();
      switch (t >>> 3) {
        case 1: {
          m.signer = r.bytes();
          break;
        }
        case 2: {
          if (!(m.signatures && m.signatures.length)) m.signatures = [];
          m.signatures.push($root.FileHashes.Signature.decode(r, r.uint32()));
          break;
        }
        default:
          r.skipType(t & 7);
          break;
      }
    }
    return m;
  };

  /**
   * Decodes a FileHashes message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof FileHashes
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {FileHashes} FileHashes
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  FileHashes.decodeDelimited = function decodeDelimited(reader) {
    if (!(reader instanceof $Reader)) reader = new $Reader(reader);
    return this.decode(reader, reader.uint32());
  };

  /**
   * Creates a FileHashes message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof FileHashes
   * @static
   * @param {Object.<string,*>} d Plain object
   * @returns {FileHashes} FileHashes
   */
  FileHashes.fromObject = function fromObject(d) {
    if (d instanceof $root.FileHashes) return d;
    var m = new $root.FileHashes();
    if (d.signer != null) {
      if (typeof d.signer === 'string')
        $util.base64.decode(
          d.signer,
          (m.signer = $util.newBuffer($util.base64.length(d.signer))),
          0,
        );
      else if (d.signer.length >= 0) m.signer = d.signer;
    }
    if (d.signatures) {
      if (!Array.isArray(d.signatures))
        throw TypeError('.FileHashes.signatures: array expected');
      m.signatures = [];
      for (var i = 0; i < d.signatures.length; ++i) {
        if (typeof d.signatures[i] !== 'object')
          throw TypeError('.FileHashes.signatures: object expected');
        m.signatures[i] = $root.FileHashes.Signature.fromObject(
          d.signatures[i],
        );
      }
    }
    return m;
  };

  /**
   * Creates a plain object from a FileHashes message. Also converts values to other types if specified.
   * @function toObject
   * @memberof FileHashes
   * @static
   * @param {FileHashes} m FileHashes
   * @param {$protobuf.IConversionOptions} [o] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  FileHashes.toObject = function toObject(m, o) {
    if (!o) o = {};
    var d = {};
    if (o.arrays || o.defaults) {
      d.signatures = [];
    }
    if (o.defaults) {
      if (o.bytes === String) d.signer = '';
      else {
        d.signer = [];
        if (o.bytes !== Array) d.signer = $util.newBuffer(d.signer);
      }
    }
    if (m.signer != null && m.hasOwnProperty('signer')) {
      d.signer =
        o.bytes === String
          ? $util.base64.encode(m.signer, 0, m.signer.length)
          : o.bytes === Array
            ? Array.prototype.slice.call(m.signer)
            : m.signer;
    }
    if (m.signatures && m.signatures.length) {
      d.signatures = [];
      for (var j = 0; j < m.signatures.length; ++j) {
        d.signatures[j] = $root.FileHashes.Signature.toObject(
          m.signatures[j],
          o,
        );
      }
    }
    return d;
  };

  /**
   * Converts this FileHashes to JSON.
   * @function toJSON
   * @memberof FileHashes
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  FileHashes.prototype.toJSON = function toJSON() {
    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
  };

  /**
   * Gets the default type url for FileHashes
   * @function getTypeUrl
   * @memberof FileHashes
   * @static
   * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns {string} The default type url
   */
  FileHashes.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
    if (typeUrlPrefix === undefined) {
      typeUrlPrefix = 'type.googleapis.com';
    }
    return typeUrlPrefix + '/FileHashes';
  };

  FileHashes.Signature = (function () {
    /**
     * Properties of a Signature.
     * @memberof FileHashes
     * @interface ISignature
     * @property {string|null} [filename] Signature filename
     * @property {boolean|null} [testSigning] Signature testSigning
     * @property {Uint8Array|null} [SHA512Hash] Signature SHA512Hash
     * @property {boolean|null} [mainExe] Signature mainExe
     * @property {Uint8Array|null} [signature] Signature signature
     */

    /**
     * Constructs a new Signature.
     * @memberof FileHashes
     * @classdesc Represents a Signature.
     * @implements ISignature
     * @constructor
     * @param {FileHashes.ISignature=} [p] Properties to set
     */
    function Signature(p) {
      if (p)
        for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
          if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
    }

    /**
     * Signature filename.
     * @member {string} filename
     * @memberof FileHashes.Signature
     * @instance
     */
    Signature.prototype.filename = '';

    /**
     * Signature testSigning.
     * @member {boolean} testSigning
     * @memberof FileHashes.Signature
     * @instance
     */
    Signature.prototype.testSigning = false;

    /**
     * Signature SHA512Hash.
     * @member {Uint8Array} SHA512Hash
     * @memberof FileHashes.Signature
     * @instance
     */
    Signature.prototype.SHA512Hash = $util.newBuffer([]);

    /**
     * Signature mainExe.
     * @member {boolean} mainExe
     * @memberof FileHashes.Signature
     * @instance
     */
    Signature.prototype.mainExe = false;

    /**
     * Signature signature.
     * @member {Uint8Array} signature
     * @memberof FileHashes.Signature
     * @instance
     */
    Signature.prototype.signature = $util.newBuffer([]);

    /**
     * Creates a new Signature instance using the specified properties.
     * @function create
     * @memberof FileHashes.Signature
     * @static
     * @param {FileHashes.ISignature=} [properties] Properties to set
     * @returns {FileHashes.Signature} Signature instance
     */
    Signature.create = function create(properties) {
      return new Signature(properties);
    };

    /**
     * Encodes the specified Signature message. Does not implicitly {@link FileHashes.Signature.verify|verify} messages.
     * @function encode
     * @memberof FileHashes.Signature
     * @static
     * @param {FileHashes.ISignature} m Signature message or plain object to encode
     * @param {$protobuf.Writer} [w] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Signature.encode = function encode(m, w) {
      if (!w) w = $Writer.create();
      if (m.filename != null && Object.hasOwnProperty.call(m, 'filename'))
        w.uint32(10).string(m.filename);
      if (m.testSigning != null && Object.hasOwnProperty.call(m, 'testSigning'))
        w.uint32(16).bool(m.testSigning);
      if (m.SHA512Hash != null && Object.hasOwnProperty.call(m, 'SHA512Hash'))
        w.uint32(26).bytes(m.SHA512Hash);
      if (m.mainExe != null && Object.hasOwnProperty.call(m, 'mainExe'))
        w.uint32(32).bool(m.mainExe);
      if (m.signature != null && Object.hasOwnProperty.call(m, 'signature'))
        w.uint32(42).bytes(m.signature);
      return w;
    };

    /**
     * Encodes the specified Signature message, length delimited. Does not implicitly {@link FileHashes.Signature.verify|verify} messages.
     * @function encodeDelimited
     * @memberof FileHashes.Signature
     * @static
     * @param {FileHashes.ISignature} message Signature message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Signature.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Signature message from the specified reader or buffer.
     * @function decode
     * @memberof FileHashes.Signature
     * @static
     * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
     * @param {number} [l] Message length if known beforehand
     * @returns {FileHashes.Signature} Signature
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Signature.decode = function decode(r, l) {
      if (!(r instanceof $Reader)) r = $Reader.create(r);
      var c = l === undefined ? r.len : r.pos + l,
        m = new $root.FileHashes.Signature();
      while (r.pos < c) {
        var t = r.uint32();
        switch (t >>> 3) {
          case 1: {
            m.filename = r.string();
            break;
          }
          case 2: {
            m.testSigning = r.bool();
            break;
          }
          case 3: {
            m.SHA512Hash = r.bytes();
            break;
          }
          case 4: {
            m.mainExe = r.bool();
            break;
          }
          case 5: {
            m.signature = r.bytes();
            break;
          }
          default:
            r.skipType(t & 7);
            break;
        }
      }
      return m;
    };

    /**
     * Decodes a Signature message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof FileHashes.Signature
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {FileHashes.Signature} Signature
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Signature.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Creates a Signature message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof FileHashes.Signature
     * @static
     * @param {Object.<string,*>} d Plain object
     * @returns {FileHashes.Signature} Signature
     */
    Signature.fromObject = function fromObject(d) {
      if (d instanceof $root.FileHashes.Signature) return d;
      var m = new $root.FileHashes.Signature();
      if (d.filename != null) {
        m.filename = String(d.filename);
      }
      if (d.testSigning != null) {
        m.testSigning = Boolean(d.testSigning);
      }
      if (d.SHA512Hash != null) {
        if (typeof d.SHA512Hash === 'string')
          $util.base64.decode(
            d.SHA512Hash,
            (m.SHA512Hash = $util.newBuffer($util.base64.length(d.SHA512Hash))),
            0,
          );
        else if (d.SHA512Hash.length >= 0) m.SHA512Hash = d.SHA512Hash;
      }
      if (d.mainExe != null) {
        m.mainExe = Boolean(d.mainExe);
      }
      if (d.signature != null) {
        if (typeof d.signature === 'string')
          $util.base64.decode(
            d.signature,
            (m.signature = $util.newBuffer($util.base64.length(d.signature))),
            0,
          );
        else if (d.signature.length >= 0) m.signature = d.signature;
      }
      return m;
    };

    /**
     * Creates a plain object from a Signature message. Also converts values to other types if specified.
     * @function toObject
     * @memberof FileHashes.Signature
     * @static
     * @param {FileHashes.Signature} m Signature
     * @param {$protobuf.IConversionOptions} [o] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Signature.toObject = function toObject(m, o) {
      if (!o) o = {};
      var d = {};
      if (o.defaults) {
        d.filename = '';
        d.testSigning = false;
        if (o.bytes === String) d.SHA512Hash = '';
        else {
          d.SHA512Hash = [];
          if (o.bytes !== Array) d.SHA512Hash = $util.newBuffer(d.SHA512Hash);
        }
        d.mainExe = false;
        if (o.bytes === String) d.signature = '';
        else {
          d.signature = [];
          if (o.bytes !== Array) d.signature = $util.newBuffer(d.signature);
        }
      }
      if (m.filename != null && m.hasOwnProperty('filename')) {
        d.filename = m.filename;
      }
      if (m.testSigning != null && m.hasOwnProperty('testSigning')) {
        d.testSigning = m.testSigning;
      }
      if (m.SHA512Hash != null && m.hasOwnProperty('SHA512Hash')) {
        d.SHA512Hash =
          o.bytes === String
            ? $util.base64.encode(m.SHA512Hash, 0, m.SHA512Hash.length)
            : o.bytes === Array
              ? Array.prototype.slice.call(m.SHA512Hash)
              : m.SHA512Hash;
      }
      if (m.mainExe != null && m.hasOwnProperty('mainExe')) {
        d.mainExe = m.mainExe;
      }
      if (m.signature != null && m.hasOwnProperty('signature')) {
        d.signature =
          o.bytes === String
            ? $util.base64.encode(m.signature, 0, m.signature.length)
            : o.bytes === Array
              ? Array.prototype.slice.call(m.signature)
              : m.signature;
      }
      return d;
    };

    /**
     * Converts this Signature to JSON.
     * @function toJSON
     * @memberof FileHashes.Signature
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Signature.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Signature
     * @function getTypeUrl
     * @memberof FileHashes.Signature
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Signature.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = 'type.googleapis.com';
      }
      return typeUrlPrefix + '/FileHashes.Signature';
    };

    return Signature;
  })();

  return FileHashes;
})());

export const RemoteAttestation = ($root.RemoteAttestation = (() => {
  /**
   * Properties of a RemoteAttestation.
   * @exports IRemoteAttestation
   * @interface IRemoteAttestation
   * @property {IEncryptedClientIdentification|null} [certificate] RemoteAttestation certificate
   * @property {Uint8Array|null} [salt] RemoteAttestation salt
   * @property {Uint8Array|null} [signature] RemoteAttestation signature
   */

  /**
   * Constructs a new RemoteAttestation.
   * @exports RemoteAttestation
   * @classdesc Represents a RemoteAttestation.
   * @implements IRemoteAttestation
   * @constructor
   * @param {IRemoteAttestation=} [p] Properties to set
   */
  function RemoteAttestation(p) {
    if (p)
      for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
        if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
  }

  /**
   * RemoteAttestation certificate.
   * @member {IEncryptedClientIdentification|null|undefined} certificate
   * @memberof RemoteAttestation
   * @instance
   */
  RemoteAttestation.prototype.certificate = null;

  /**
   * RemoteAttestation salt.
   * @member {Uint8Array} salt
   * @memberof RemoteAttestation
   * @instance
   */
  RemoteAttestation.prototype.salt = $util.newBuffer([]);

  /**
   * RemoteAttestation signature.
   * @member {Uint8Array} signature
   * @memberof RemoteAttestation
   * @instance
   */
  RemoteAttestation.prototype.signature = $util.newBuffer([]);

  /**
   * Creates a new RemoteAttestation instance using the specified properties.
   * @function create
   * @memberof RemoteAttestation
   * @static
   * @param {IRemoteAttestation=} [properties] Properties to set
   * @returns {RemoteAttestation} RemoteAttestation instance
   */
  RemoteAttestation.create = function create(properties) {
    return new RemoteAttestation(properties);
  };

  /**
   * Encodes the specified RemoteAttestation message. Does not implicitly {@link RemoteAttestation.verify|verify} messages.
   * @function encode
   * @memberof RemoteAttestation
   * @static
   * @param {IRemoteAttestation} m RemoteAttestation message or plain object to encode
   * @param {$protobuf.Writer} [w] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  RemoteAttestation.encode = function encode(m, w) {
    if (!w) w = $Writer.create();
    if (m.certificate != null && Object.hasOwnProperty.call(m, 'certificate'))
      $root.EncryptedClientIdentification.encode(
        m.certificate,
        w.uint32(10).fork(),
      ).ldelim();
    if (m.salt != null && Object.hasOwnProperty.call(m, 'salt'))
      w.uint32(18).bytes(m.salt);
    if (m.signature != null && Object.hasOwnProperty.call(m, 'signature'))
      w.uint32(26).bytes(m.signature);
    return w;
  };

  /**
   * Encodes the specified RemoteAttestation message, length delimited. Does not implicitly {@link RemoteAttestation.verify|verify} messages.
   * @function encodeDelimited
   * @memberof RemoteAttestation
   * @static
   * @param {IRemoteAttestation} message RemoteAttestation message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  RemoteAttestation.encodeDelimited = function encodeDelimited(
    message,
    writer,
  ) {
    return this.encode(message, writer).ldelim();
  };

  /**
   * Decodes a RemoteAttestation message from the specified reader or buffer.
   * @function decode
   * @memberof RemoteAttestation
   * @static
   * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
   * @param {number} [l] Message length if known beforehand
   * @returns {RemoteAttestation} RemoteAttestation
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  RemoteAttestation.decode = function decode(r, l) {
    if (!(r instanceof $Reader)) r = $Reader.create(r);
    var c = l === undefined ? r.len : r.pos + l,
      m = new $root.RemoteAttestation();
    while (r.pos < c) {
      var t = r.uint32();
      switch (t >>> 3) {
        case 1: {
          m.certificate = $root.EncryptedClientIdentification.decode(
            r,
            r.uint32(),
          );
          break;
        }
        case 2: {
          m.salt = r.bytes();
          break;
        }
        case 3: {
          m.signature = r.bytes();
          break;
        }
        default:
          r.skipType(t & 7);
          break;
      }
    }
    return m;
  };

  /**
   * Decodes a RemoteAttestation message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof RemoteAttestation
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {RemoteAttestation} RemoteAttestation
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  RemoteAttestation.decodeDelimited = function decodeDelimited(reader) {
    if (!(reader instanceof $Reader)) reader = new $Reader(reader);
    return this.decode(reader, reader.uint32());
  };

  /**
   * Creates a RemoteAttestation message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof RemoteAttestation
   * @static
   * @param {Object.<string,*>} d Plain object
   * @returns {RemoteAttestation} RemoteAttestation
   */
  RemoteAttestation.fromObject = function fromObject(d) {
    if (d instanceof $root.RemoteAttestation) return d;
    var m = new $root.RemoteAttestation();
    if (d.certificate != null) {
      if (typeof d.certificate !== 'object')
        throw TypeError('.RemoteAttestation.certificate: object expected');
      m.certificate = $root.EncryptedClientIdentification.fromObject(
        d.certificate,
      );
    }
    if (d.salt != null) {
      if (typeof d.salt === 'string')
        $util.base64.decode(
          d.salt,
          (m.salt = $util.newBuffer($util.base64.length(d.salt))),
          0,
        );
      else if (d.salt.length >= 0) m.salt = d.salt;
    }
    if (d.signature != null) {
      if (typeof d.signature === 'string')
        $util.base64.decode(
          d.signature,
          (m.signature = $util.newBuffer($util.base64.length(d.signature))),
          0,
        );
      else if (d.signature.length >= 0) m.signature = d.signature;
    }
    return m;
  };

  /**
   * Creates a plain object from a RemoteAttestation message. Also converts values to other types if specified.
   * @function toObject
   * @memberof RemoteAttestation
   * @static
   * @param {RemoteAttestation} m RemoteAttestation
   * @param {$protobuf.IConversionOptions} [o] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  RemoteAttestation.toObject = function toObject(m, o) {
    if (!o) o = {};
    var d = {};
    if (o.defaults) {
      d.certificate = null;
      if (o.bytes === String) d.salt = '';
      else {
        d.salt = [];
        if (o.bytes !== Array) d.salt = $util.newBuffer(d.salt);
      }
      if (o.bytes === String) d.signature = '';
      else {
        d.signature = [];
        if (o.bytes !== Array) d.signature = $util.newBuffer(d.signature);
      }
    }
    if (m.certificate != null && m.hasOwnProperty('certificate')) {
      d.certificate = $root.EncryptedClientIdentification.toObject(
        m.certificate,
        o,
      );
    }
    if (m.salt != null && m.hasOwnProperty('salt')) {
      d.salt =
        o.bytes === String
          ? $util.base64.encode(m.salt, 0, m.salt.length)
          : o.bytes === Array
            ? Array.prototype.slice.call(m.salt)
            : m.salt;
    }
    if (m.signature != null && m.hasOwnProperty('signature')) {
      d.signature =
        o.bytes === String
          ? $util.base64.encode(m.signature, 0, m.signature.length)
          : o.bytes === Array
            ? Array.prototype.slice.call(m.signature)
            : m.signature;
    }
    return d;
  };

  /**
   * Converts this RemoteAttestation to JSON.
   * @function toJSON
   * @memberof RemoteAttestation
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  RemoteAttestation.prototype.toJSON = function toJSON() {
    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
  };

  /**
   * Gets the default type url for RemoteAttestation
   * @function getTypeUrl
   * @memberof RemoteAttestation
   * @static
   * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns {string} The default type url
   */
  RemoteAttestation.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
    if (typeUrlPrefix === undefined) {
      typeUrlPrefix = 'type.googleapis.com';
    }
    return typeUrlPrefix + '/RemoteAttestation';
  };

  return RemoteAttestation;
})());

export { $root as default };
