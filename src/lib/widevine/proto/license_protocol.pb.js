/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-mixed-operators, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars, default-case, jsdoc/require-param*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;
const $Object = $util.global.Object, $undefined = $util.global.undefined, $Error = $util.global.Error, $TypeError = $util.global.TypeError, $String = $util.global.String, $Array = $util.global.Array, $parseInt = $util.global.parseInt, $Boolean = $util.global.Boolean, $Number = $util.global.Number, $BigInt = $util.global.BigInt;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

/**
 * LicenseType enum.
 * @name LicenseType
 * @enum {number}
 * @property {number} STREAMING=1 STREAMING value
 * @property {number} OFFLINE=2 OFFLINE value
 * @property {number} AUTOMATIC=3 AUTOMATIC value
 */
export const LicenseType = $root.LicenseType = (() => {
    const valuesById = {}, values = $Object.create(valuesById);
    values[valuesById[1] = "STREAMING"] = 1;
    values[valuesById[2] = "OFFLINE"] = 2;
    values[valuesById[3] = "AUTOMATIC"] = 3;
    return values;
})();

/**
 * PlatformVerificationStatus enum.
 * @name PlatformVerificationStatus
 * @enum {number}
 * @property {number} PLATFORM_UNVERIFIED=0 PLATFORM_UNVERIFIED value
 * @property {number} PLATFORM_TAMPERED=1 PLATFORM_TAMPERED value
 * @property {number} PLATFORM_SOFTWARE_VERIFIED=2 PLATFORM_SOFTWARE_VERIFIED value
 * @property {number} PLATFORM_HARDWARE_VERIFIED=3 PLATFORM_HARDWARE_VERIFIED value
 * @property {number} PLATFORM_NO_VERIFICATION=4 PLATFORM_NO_VERIFICATION value
 * @property {number} PLATFORM_SECURE_STORAGE_SOFTWARE_VERIFIED=5 PLATFORM_SECURE_STORAGE_SOFTWARE_VERIFIED value
 */
export const PlatformVerificationStatus = $root.PlatformVerificationStatus = (() => {
    const valuesById = {}, values = $Object.create(valuesById);
    values[valuesById[0] = "PLATFORM_UNVERIFIED"] = 0;
    values[valuesById[1] = "PLATFORM_TAMPERED"] = 1;
    values[valuesById[2] = "PLATFORM_SOFTWARE_VERIFIED"] = 2;
    values[valuesById[3] = "PLATFORM_HARDWARE_VERIFIED"] = 3;
    values[valuesById[4] = "PLATFORM_NO_VERIFICATION"] = 4;
    values[valuesById[5] = "PLATFORM_SECURE_STORAGE_SOFTWARE_VERIFIED"] = 5;
    return values;
})();

export const LicenseIdentification = $root.LicenseIdentification = (() => {

    /**
     * Properties of a LicenseIdentification.
     * @typedef {Object} LicenseIdentification.$Properties
     * @property {Uint8Array|null} [requestId] LicenseIdentification requestId
     * @property {Uint8Array|null} [sessionId] LicenseIdentification sessionId
     * @property {Uint8Array|null} [purchaseId] LicenseIdentification purchaseId
     * @property {LicenseType|null} [type] LicenseIdentification type
     * @property {number|null} [version] LicenseIdentification version
     * @property {Uint8Array|null} [providerSessionToken] LicenseIdentification providerSessionToken
     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
     */

    /**
     * Properties of a LicenseIdentification.
     * @exports ILicenseIdentification
     * @interface ILicenseIdentification
     * @augments LicenseIdentification.$Properties
     * @deprecated Use LicenseIdentification.$Properties instead.
     */

    /**
     * Shape of a LicenseIdentification.
     * @typedef {LicenseIdentification.$Properties} LicenseIdentification.$Shape
     */

    /**
     * Constructs a new LicenseIdentification.
     * @exports LicenseIdentification
     * @classdesc Represents a LicenseIdentification.
     * @constructor
     * @param {LicenseIdentification.$Properties=} [properties] Properties to set
     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
     */
    const LicenseIdentification = function (properties) {
        if (properties)
            for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    };

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
     * @param {LicenseIdentification.$Properties=} [properties] Properties to set
     * @returns {LicenseIdentification} LicenseIdentification instance
     * @type {{
     *   (properties: LicenseIdentification.$Shape): LicenseIdentification & LicenseIdentification.$Shape;
     *   (properties?: LicenseIdentification.$Properties): LicenseIdentification;
     * }}
     */
    LicenseIdentification.create = function(properties) {
        return new LicenseIdentification(properties);
    };

    /**
     * Encodes the specified LicenseIdentification message. Does not implicitly {@link LicenseIdentification.verify|verify} messages.
     * @function encode
     * @memberof LicenseIdentification
     * @static
     * @param {LicenseIdentification.$Properties} message LicenseIdentification message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    LicenseIdentification.encode = function (message, writer, _depth) {
        if (!writer)
            writer = new $Writer();
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        if (message.requestId != null && $Object.hasOwnProperty.call(message, "requestId"))
            writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.requestId);
        if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId"))
            writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.sessionId);
        if (message.purchaseId != null && $Object.hasOwnProperty.call(message, "purchaseId"))
            writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.purchaseId);
        if (message.type != null && $Object.hasOwnProperty.call(message, "type"))
            writer.uint32(/* id 4, wireType 0 =*/32).int32(message.type);
        if (message.version != null && $Object.hasOwnProperty.call(message, "version"))
            writer.uint32(/* id 5, wireType 0 =*/40).int32(message.version);
        if (message.providerSessionToken != null && $Object.hasOwnProperty.call(message, "providerSessionToken"))
            writer.uint32(/* id 6, wireType 2 =*/50).bytes(message.providerSessionToken);
        if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    /**
     * Encodes the specified LicenseIdentification message, length delimited. Does not implicitly {@link LicenseIdentification.verify|verify} messages.
     * @function encodeDelimited
     * @memberof LicenseIdentification
     * @static
     * @param {LicenseIdentification.$Properties} message LicenseIdentification message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    LicenseIdentification.encodeDelimited = function(message, writer) {
        return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
    };

    /**
     * Decodes a LicenseIdentification message from the specified reader or buffer.
     * @function decode
     * @memberof LicenseIdentification
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {LicenseIdentification & LicenseIdentification.$Shape} LicenseIdentification
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    LicenseIdentification.decode = function (reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw $Error("max depth exceeded");
        let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.LicenseIdentification();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = $undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 2)
                        break;
                    message.requestId = reader.bytes();
                    continue;
                }
            case 2: {
                    if (wireType !== 2)
                        break;
                    message.sessionId = reader.bytes();
                    continue;
                }
            case 3: {
                    if (wireType !== 2)
                        break;
                    message.purchaseId = reader.bytes();
                    continue;
                }
            case 4: {
                    if (wireType !== 0)
                        break;
                    message.type = reader.int32();
                    continue;
                }
            case 5: {
                    if (wireType !== 0)
                        break;
                    message.version = reader.int32();
                    continue;
                }
            case 6: {
                    if (wireType !== 2)
                        break;
                    message.providerSessionToken = reader.bytes();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            if (!reader.discardUnknown) {
                $util.makeProp(message, "$unknowns", false);
                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
            }
        }
        if (_end !== $undefined)
            throw $Error("missing end group");
        return message;
    };

    /**
     * Decodes a LicenseIdentification message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof LicenseIdentification
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {LicenseIdentification & LicenseIdentification.$Shape} LicenseIdentification
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    LicenseIdentification.decodeDelimited = function(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a LicenseIdentification message.
     * @function verify
     * @memberof LicenseIdentification
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    LicenseIdentification.verify = function (message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (message.requestId != null && $Object.hasOwnProperty.call(message, "requestId"))
            if (!(message.requestId && typeof message.requestId.length === "number" || $util.isString(message.requestId)))
                return "requestId: buffer expected";
        if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId"))
            if (!(message.sessionId && typeof message.sessionId.length === "number" || $util.isString(message.sessionId)))
                return "sessionId: buffer expected";
        if (message.purchaseId != null && $Object.hasOwnProperty.call(message, "purchaseId"))
            if (!(message.purchaseId && typeof message.purchaseId.length === "number" || $util.isString(message.purchaseId)))
                return "purchaseId: buffer expected";
        if (message.type != null && $Object.hasOwnProperty.call(message, "type"))
            switch (message.type) {
            default:
                return "type: enum value expected";
            case 1:
            case 2:
            case 3:
                break;
            }
        if (message.version != null && $Object.hasOwnProperty.call(message, "version"))
            if (!$util.isInteger(message.version))
                return "version: integer expected";
        if (message.providerSessionToken != null && $Object.hasOwnProperty.call(message, "providerSessionToken"))
            if (!(message.providerSessionToken && typeof message.providerSessionToken.length === "number" || $util.isString(message.providerSessionToken)))
                return "providerSessionToken: buffer expected";
        return null;
    };

    /**
     * Creates a LicenseIdentification message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof LicenseIdentification
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {LicenseIdentification} LicenseIdentification
     */
    LicenseIdentification.fromObject = function (object, _depth) {
        if (object instanceof $root.LicenseIdentification)
            return object;
        if (!$util.isObject(object))
            throw $TypeError(".LicenseIdentification: object expected");
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        let message = new $root.LicenseIdentification();
        if (object.requestId != null)
            if (typeof object.requestId === "string")
                $util.base64.decode(object.requestId, message.requestId = $util.newBuffer($util.base64.length(object.requestId)), 0);
            else if (object.requestId.length >= 0)
                message.requestId = object.requestId;
        if (object.sessionId != null)
            if (typeof object.sessionId === "string")
                $util.base64.decode(object.sessionId, message.sessionId = $util.newBuffer($util.base64.length(object.sessionId)), 0);
            else if (object.sessionId.length >= 0)
                message.sessionId = object.sessionId;
        if (object.purchaseId != null)
            if (typeof object.purchaseId === "string")
                $util.base64.decode(object.purchaseId, message.purchaseId = $util.newBuffer($util.base64.length(object.purchaseId)), 0);
            else if (object.purchaseId.length >= 0)
                message.purchaseId = object.purchaseId;
        switch (object.type) {
        default:
            if (typeof object.type === "number") {
                message.type = object.type;
                break;
            }
            break;
        case "STREAMING":
        case 1:
            message.type = 1;
            break;
        case "OFFLINE":
        case 2:
            message.type = 2;
            break;
        case "AUTOMATIC":
        case 3:
            message.type = 3;
            break;
        }
        if (object.version != null)
            message.version = object.version | 0;
        if (object.providerSessionToken != null)
            if (typeof object.providerSessionToken === "string")
                $util.base64.decode(object.providerSessionToken, message.providerSessionToken = $util.newBuffer($util.base64.length(object.providerSessionToken)), 0);
            else if (object.providerSessionToken.length >= 0)
                message.providerSessionToken = object.providerSessionToken;
        return message;
    };

    /**
     * Creates a plain object from a LicenseIdentification message. Also converts values to other types if specified.
     * @function toObject
     * @memberof LicenseIdentification
     * @static
     * @param {LicenseIdentification} message LicenseIdentification
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    LicenseIdentification.toObject = function (message, options, _depth) {
        if (!options)
            options = {};
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        let object = {};
        if (options.defaults) {
            if (options.bytes === $String)
                object.requestId = "";
            else {
                object.requestId = [];
                if (options.bytes !== $Array)
                    object.requestId = $util.newBuffer(object.requestId);
            }
            if (options.bytes === $String)
                object.sessionId = "";
            else {
                object.sessionId = [];
                if (options.bytes !== $Array)
                    object.sessionId = $util.newBuffer(object.sessionId);
            }
            if (options.bytes === $String)
                object.purchaseId = "";
            else {
                object.purchaseId = [];
                if (options.bytes !== $Array)
                    object.purchaseId = $util.newBuffer(object.purchaseId);
            }
            object.type = options.enums === $String ? "STREAMING" : 1;
            object.version = 0;
            if (options.bytes === $String)
                object.providerSessionToken = "";
            else {
                object.providerSessionToken = [];
                if (options.bytes !== $Array)
                    object.providerSessionToken = $util.newBuffer(object.providerSessionToken);
            }
        }
        if (message.requestId != null && $Object.hasOwnProperty.call(message, "requestId"))
            object.requestId = options.bytes === $String ? $util.base64.encode(message.requestId, 0, message.requestId.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.requestId) : message.requestId;
        if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId"))
            object.sessionId = options.bytes === $String ? $util.base64.encode(message.sessionId, 0, message.sessionId.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.sessionId) : message.sessionId;
        if (message.purchaseId != null && $Object.hasOwnProperty.call(message, "purchaseId"))
            object.purchaseId = options.bytes === $String ? $util.base64.encode(message.purchaseId, 0, message.purchaseId.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.purchaseId) : message.purchaseId;
        if (message.type != null && $Object.hasOwnProperty.call(message, "type"))
            object.type = options.enums === $String ? $root.LicenseType[message.type] === $undefined ? message.type : $root.LicenseType[message.type] : message.type;
        if (message.version != null && $Object.hasOwnProperty.call(message, "version"))
            object.version = message.version;
        if (message.providerSessionToken != null && $Object.hasOwnProperty.call(message, "providerSessionToken"))
            object.providerSessionToken = options.bytes === $String ? $util.base64.encode(message.providerSessionToken, 0, message.providerSessionToken.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.providerSessionToken) : message.providerSessionToken;
        return object;
    };

    /**
     * Converts this LicenseIdentification to JSON.
     * @function toJSON
     * @memberof LicenseIdentification
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    LicenseIdentification.prototype.toJSON = function() {
        return LicenseIdentification.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the type url for LicenseIdentification
     * @function getTypeUrl
     * @memberof LicenseIdentification
     * @static
     * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns {string} The type url
     */
    LicenseIdentification.getTypeUrl = function(prefix) {
        if (prefix === $undefined)
            prefix = "type.googleapis.com";
        return prefix + "/LicenseIdentification";
    };

    return LicenseIdentification;
})();

export const License = $root.License = (() => {

    /**
     * Properties of a License.
     * @typedef {Object} License.$Properties
     * @property {LicenseIdentification.$Properties|null} [id] License id
     * @property {License.Policy.$Properties|null} [policy] License policy
     * @property {Array.<License.KeyContainer.$Properties>|null} [key] License key
     * @property {number|Long|null} [licenseStartTime] License licenseStartTime
     * @property {boolean|null} [remoteAttestationVerified] License remoteAttestationVerified
     * @property {Uint8Array|null} [providerClientToken] License providerClientToken
     * @property {number|null} [protectionScheme] License protectionScheme
     * @property {Uint8Array|null} [srmRequirement] License srmRequirement
     * @property {Uint8Array|null} [srmUpdate] License srmUpdate
     * @property {PlatformVerificationStatus|null} [platformVerificationStatus] License platformVerificationStatus
     * @property {Array.<Uint8Array>|null} [groupIds] License groupIds
     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
     */

    /**
     * Properties of a License.
     * @exports ILicense
     * @interface ILicense
     * @augments License.$Properties
     * @deprecated Use License.$Properties instead.
     */

    /**
     * Shape of a License.
     * @typedef {License.$Properties} License.$Shape
     */

    /**
     * Constructs a new License.
     * @exports License
     * @classdesc Represents a License.
     * @constructor
     * @param {License.$Properties=} [properties] Properties to set
     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
     */
    const License = function (properties) {
        this.key = [];
        this.groupIds = [];
        if (properties)
            for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    };

    /**
     * License id.
     * @member {LicenseIdentification.$Properties|null|undefined} id
     * @memberof License
     * @instance
     */
    License.prototype.id = null;

    /**
     * License policy.
     * @member {License.Policy.$Properties|null|undefined} policy
     * @memberof License
     * @instance
     */
    License.prototype.policy = null;

    /**
     * License key.
     * @member {Array.<License.KeyContainer.$Properties>} key
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
    License.prototype.licenseStartTime = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

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
     * @param {License.$Properties=} [properties] Properties to set
     * @returns {License} License instance
     * @type {{
     *   (properties: License.$Shape): License & License.$Shape;
     *   (properties?: License.$Properties): License;
     * }}
     */
    License.create = function(properties) {
        return new License(properties);
    };

    /**
     * Encodes the specified License message. Does not implicitly {@link License.verify|verify} messages.
     * @function encode
     * @memberof License
     * @static
     * @param {License.$Properties} message License message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    License.encode = function (message, writer, _depth) {
        if (!writer)
            writer = new $Writer();
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        if (message.id != null && $Object.hasOwnProperty.call(message, "id"))
            $root.LicenseIdentification.encode(message.id, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
        if (message.policy != null && $Object.hasOwnProperty.call(message, "policy"))
            $root.License.Policy.encode(message.policy, writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim();
        if (message.key != null && message.key.length)
            for (let i = 0; i < message.key.length; ++i)
                $root.License.KeyContainer.encode(message.key[i], writer.uint32(/* id 3, wireType 2 =*/26).fork(), _depth + 1).ldelim();
        if (message.licenseStartTime != null && $Object.hasOwnProperty.call(message, "licenseStartTime"))
            writer.uint32(/* id 4, wireType 0 =*/32).int64(message.licenseStartTime);
        if (message.remoteAttestationVerified != null && $Object.hasOwnProperty.call(message, "remoteAttestationVerified"))
            writer.uint32(/* id 5, wireType 0 =*/40).bool(message.remoteAttestationVerified);
        if (message.providerClientToken != null && $Object.hasOwnProperty.call(message, "providerClientToken"))
            writer.uint32(/* id 6, wireType 2 =*/50).bytes(message.providerClientToken);
        if (message.protectionScheme != null && $Object.hasOwnProperty.call(message, "protectionScheme"))
            writer.uint32(/* id 7, wireType 0 =*/56).uint32(message.protectionScheme);
        if (message.srmRequirement != null && $Object.hasOwnProperty.call(message, "srmRequirement"))
            writer.uint32(/* id 8, wireType 2 =*/66).bytes(message.srmRequirement);
        if (message.srmUpdate != null && $Object.hasOwnProperty.call(message, "srmUpdate"))
            writer.uint32(/* id 9, wireType 2 =*/74).bytes(message.srmUpdate);
        if (message.platformVerificationStatus != null && $Object.hasOwnProperty.call(message, "platformVerificationStatus"))
            writer.uint32(/* id 10, wireType 0 =*/80).int32(message.platformVerificationStatus);
        if (message.groupIds != null && message.groupIds.length)
            for (let i = 0; i < message.groupIds.length; ++i)
                writer.uint32(/* id 11, wireType 2 =*/90).bytes(message.groupIds[i]);
        if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    /**
     * Encodes the specified License message, length delimited. Does not implicitly {@link License.verify|verify} messages.
     * @function encodeDelimited
     * @memberof License
     * @static
     * @param {License.$Properties} message License message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    License.encodeDelimited = function(message, writer) {
        return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
    };

    /**
     * Decodes a License message from the specified reader or buffer.
     * @function decode
     * @memberof License
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {License & License.$Shape} License
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    License.decode = function (reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw $Error("max depth exceeded");
        let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.License();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = $undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 2)
                        break;
                    message.id = $root.LicenseIdentification.decode(reader, reader.uint32(), $undefined, _depth + 1, message.id);
                    continue;
                }
            case 2: {
                    if (wireType !== 2)
                        break;
                    message.policy = $root.License.Policy.decode(reader, reader.uint32(), $undefined, _depth + 1, message.policy);
                    continue;
                }
            case 3: {
                    if (wireType !== 2)
                        break;
                    if (!(message.key && message.key.length))
                        message.key = [];
                    message.key.push($root.License.KeyContainer.decode(reader, reader.uint32(), $undefined, _depth + 1));
                    continue;
                }
            case 4: {
                    if (wireType !== 0)
                        break;
                    message.licenseStartTime = reader.int64();
                    continue;
                }
            case 5: {
                    if (wireType !== 0)
                        break;
                    message.remoteAttestationVerified = reader.bool();
                    continue;
                }
            case 6: {
                    if (wireType !== 2)
                        break;
                    message.providerClientToken = reader.bytes();
                    continue;
                }
            case 7: {
                    if (wireType !== 0)
                        break;
                    message.protectionScheme = reader.uint32();
                    continue;
                }
            case 8: {
                    if (wireType !== 2)
                        break;
                    message.srmRequirement = reader.bytes();
                    continue;
                }
            case 9: {
                    if (wireType !== 2)
                        break;
                    message.srmUpdate = reader.bytes();
                    continue;
                }
            case 10: {
                    if (wireType !== 0)
                        break;
                    message.platformVerificationStatus = reader.int32();
                    continue;
                }
            case 11: {
                    if (wireType !== 2)
                        break;
                    if (!(message.groupIds && message.groupIds.length))
                        message.groupIds = [];
                    message.groupIds.push(reader.bytes());
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            if (!reader.discardUnknown) {
                $util.makeProp(message, "$unknowns", false);
                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
            }
        }
        if (_end !== $undefined)
            throw $Error("missing end group");
        return message;
    };

    /**
     * Decodes a License message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof License
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {License & License.$Shape} License
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    License.decodeDelimited = function(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a License message.
     * @function verify
     * @memberof License
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    License.verify = function (message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (message.id != null && $Object.hasOwnProperty.call(message, "id")) {
            let error = $root.LicenseIdentification.verify(message.id, _depth + 1);
            if (error)
                return "id." + error;
        }
        if (message.policy != null && $Object.hasOwnProperty.call(message, "policy")) {
            let error = $root.License.Policy.verify(message.policy, _depth + 1);
            if (error)
                return "policy." + error;
        }
        if (message.key != null && $Object.hasOwnProperty.call(message, "key")) {
            if (!$Array.isArray(message.key))
                return "key: array expected";
            for (let i = 0; i < message.key.length; ++i) {
                let error = $root.License.KeyContainer.verify(message.key[i], _depth + 1);
                if (error)
                    return "key." + error;
            }
        }
        if (message.licenseStartTime != null && $Object.hasOwnProperty.call(message, "licenseStartTime"))
            if (!$util.isInteger(message.licenseStartTime) && !(message.licenseStartTime && $util.isInteger(message.licenseStartTime.low) && $util.isInteger(message.licenseStartTime.high)))
                return "licenseStartTime: integer|Long expected";
        if (message.remoteAttestationVerified != null && $Object.hasOwnProperty.call(message, "remoteAttestationVerified"))
            if (typeof message.remoteAttestationVerified !== "boolean")
                return "remoteAttestationVerified: boolean expected";
        if (message.providerClientToken != null && $Object.hasOwnProperty.call(message, "providerClientToken"))
            if (!(message.providerClientToken && typeof message.providerClientToken.length === "number" || $util.isString(message.providerClientToken)))
                return "providerClientToken: buffer expected";
        if (message.protectionScheme != null && $Object.hasOwnProperty.call(message, "protectionScheme"))
            if (!$util.isInteger(message.protectionScheme))
                return "protectionScheme: integer expected";
        if (message.srmRequirement != null && $Object.hasOwnProperty.call(message, "srmRequirement"))
            if (!(message.srmRequirement && typeof message.srmRequirement.length === "number" || $util.isString(message.srmRequirement)))
                return "srmRequirement: buffer expected";
        if (message.srmUpdate != null && $Object.hasOwnProperty.call(message, "srmUpdate"))
            if (!(message.srmUpdate && typeof message.srmUpdate.length === "number" || $util.isString(message.srmUpdate)))
                return "srmUpdate: buffer expected";
        if (message.platformVerificationStatus != null && $Object.hasOwnProperty.call(message, "platformVerificationStatus"))
            switch (message.platformVerificationStatus) {
            default:
                return "platformVerificationStatus: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
                break;
            }
        if (message.groupIds != null && $Object.hasOwnProperty.call(message, "groupIds")) {
            if (!$Array.isArray(message.groupIds))
                return "groupIds: array expected";
            for (let i = 0; i < message.groupIds.length; ++i)
                if (!(message.groupIds[i] && typeof message.groupIds[i].length === "number" || $util.isString(message.groupIds[i])))
                    return "groupIds: buffer[] expected";
        }
        return null;
    };

    /**
     * Creates a License message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof License
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {License} License
     */
    License.fromObject = function (object, _depth) {
        if (object instanceof $root.License)
            return object;
        if (!$util.isObject(object))
            throw $TypeError(".License: object expected");
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        let message = new $root.License();
        if (object.id != null) {
            if (!$util.isObject(object.id))
                throw $TypeError(".License.id: object expected");
            message.id = $root.LicenseIdentification.fromObject(object.id, _depth + 1);
        }
        if (object.policy != null) {
            if (!$util.isObject(object.policy))
                throw $TypeError(".License.policy: object expected");
            message.policy = $root.License.Policy.fromObject(object.policy, _depth + 1);
        }
        if (object.key) {
            if (!$Array.isArray(object.key))
                throw $TypeError(".License.key: array expected");
            message.key = $Array(object.key.length);
            for (let i = 0; i < object.key.length; ++i) {
                if (!$util.isObject(object.key[i]))
                    throw $TypeError(".License.key: object expected");
                message.key[i] = $root.License.KeyContainer.fromObject(object.key[i], _depth + 1);
            }
        }
        if (object.licenseStartTime != null)
            if ($util.Long)
                message.licenseStartTime = $util.Long.fromValue(object.licenseStartTime, false);
            else if (typeof object.licenseStartTime === "string")
                message.licenseStartTime = $parseInt(object.licenseStartTime, 10);
            else if (typeof object.licenseStartTime === "number")
                message.licenseStartTime = object.licenseStartTime;
            else if (typeof object.licenseStartTime === "object")
                message.licenseStartTime = new $util.LongBits(object.licenseStartTime.low >>> 0, object.licenseStartTime.high >>> 0).toNumber();
        if (object.remoteAttestationVerified != null)
            message.remoteAttestationVerified = $Boolean(object.remoteAttestationVerified);
        if (object.providerClientToken != null)
            if (typeof object.providerClientToken === "string")
                $util.base64.decode(object.providerClientToken, message.providerClientToken = $util.newBuffer($util.base64.length(object.providerClientToken)), 0);
            else if (object.providerClientToken.length >= 0)
                message.providerClientToken = object.providerClientToken;
        if (object.protectionScheme != null)
            message.protectionScheme = object.protectionScheme >>> 0;
        if (object.srmRequirement != null)
            if (typeof object.srmRequirement === "string")
                $util.base64.decode(object.srmRequirement, message.srmRequirement = $util.newBuffer($util.base64.length(object.srmRequirement)), 0);
            else if (object.srmRequirement.length >= 0)
                message.srmRequirement = object.srmRequirement;
        if (object.srmUpdate != null)
            if (typeof object.srmUpdate === "string")
                $util.base64.decode(object.srmUpdate, message.srmUpdate = $util.newBuffer($util.base64.length(object.srmUpdate)), 0);
            else if (object.srmUpdate.length >= 0)
                message.srmUpdate = object.srmUpdate;
        switch (object.platformVerificationStatus) {
        case "PLATFORM_UNVERIFIED":
        case 0:
            message.platformVerificationStatus = 0;
            break;
        case "PLATFORM_TAMPERED":
        case 1:
            message.platformVerificationStatus = 1;
            break;
        case "PLATFORM_SOFTWARE_VERIFIED":
        case 2:
            message.platformVerificationStatus = 2;
            break;
        case "PLATFORM_HARDWARE_VERIFIED":
        case 3:
            message.platformVerificationStatus = 3;
            break;
        default:
            if (typeof object.platformVerificationStatus === "number") {
                message.platformVerificationStatus = object.platformVerificationStatus;
                break;
            }
            break;
        case "PLATFORM_NO_VERIFICATION":
        case 4:
            message.platformVerificationStatus = 4;
            break;
        case "PLATFORM_SECURE_STORAGE_SOFTWARE_VERIFIED":
        case 5:
            message.platformVerificationStatus = 5;
            break;
        }
        if (object.groupIds) {
            if (!$Array.isArray(object.groupIds))
                throw $TypeError(".License.groupIds: array expected");
            message.groupIds = $Array(object.groupIds.length);
            for (let i = 0; i < object.groupIds.length; ++i)
                if (typeof object.groupIds[i] === "string")
                    $util.base64.decode(object.groupIds[i], message.groupIds[i] = $util.newBuffer($util.base64.length(object.groupIds[i])), 0);
                else if (object.groupIds[i].length >= 0)
                    message.groupIds[i] = object.groupIds[i];
        }
        return message;
    };

    /**
     * Creates a plain object from a License message. Also converts values to other types if specified.
     * @function toObject
     * @memberof License
     * @static
     * @param {License} message License
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    License.toObject = function (message, options, _depth) {
        if (!options)
            options = {};
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        let object = {};
        if (options.arrays || options.defaults) {
            object.key = [];
            object.groupIds = [];
        }
        if (options.defaults) {
            object.id = null;
            object.policy = null;
            if ($util.Long) {
                let long = new $util.Long(0, 0, false);
                object.licenseStartTime = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
            } else
                object.licenseStartTime = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
            object.remoteAttestationVerified = false;
            if (options.bytes === $String)
                object.providerClientToken = "";
            else {
                object.providerClientToken = [];
                if (options.bytes !== $Array)
                    object.providerClientToken = $util.newBuffer(object.providerClientToken);
            }
            object.protectionScheme = 0;
            if (options.bytes === $String)
                object.srmRequirement = "";
            else {
                object.srmRequirement = [];
                if (options.bytes !== $Array)
                    object.srmRequirement = $util.newBuffer(object.srmRequirement);
            }
            if (options.bytes === $String)
                object.srmUpdate = "";
            else {
                object.srmUpdate = [];
                if (options.bytes !== $Array)
                    object.srmUpdate = $util.newBuffer(object.srmUpdate);
            }
            object.platformVerificationStatus = options.enums === $String ? "PLATFORM_NO_VERIFICATION" : 4;
        }
        if (message.id != null && $Object.hasOwnProperty.call(message, "id"))
            object.id = $root.LicenseIdentification.toObject(message.id, options, _depth + 1);
        if (message.policy != null && $Object.hasOwnProperty.call(message, "policy"))
            object.policy = $root.License.Policy.toObject(message.policy, options, _depth + 1);
        if (message.key && message.key.length) {
            object.key = $Array(message.key.length);
            for (let j = 0; j < message.key.length; ++j)
                object.key[j] = $root.License.KeyContainer.toObject(message.key[j], options, _depth + 1);
        }
        if (message.licenseStartTime != null && $Object.hasOwnProperty.call(message, "licenseStartTime"))
            if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                object.licenseStartTime = typeof message.licenseStartTime === "number" ? $BigInt(message.licenseStartTime) : $util.Long.fromBits(message.licenseStartTime.low >>> 0, message.licenseStartTime.high >>> 0, false).toBigInt();
            else if (typeof message.licenseStartTime === "number")
                object.licenseStartTime = options.longs === $String ? $String(message.licenseStartTime) : message.licenseStartTime;
            else
                object.licenseStartTime = options.longs === $String ? $util.Long.prototype.toString.call(message.licenseStartTime) : options.longs === $Number ? new $util.LongBits(message.licenseStartTime.low >>> 0, message.licenseStartTime.high >>> 0).toNumber() : message.licenseStartTime;
        if (message.remoteAttestationVerified != null && $Object.hasOwnProperty.call(message, "remoteAttestationVerified"))
            object.remoteAttestationVerified = message.remoteAttestationVerified;
        if (message.providerClientToken != null && $Object.hasOwnProperty.call(message, "providerClientToken"))
            object.providerClientToken = options.bytes === $String ? $util.base64.encode(message.providerClientToken, 0, message.providerClientToken.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.providerClientToken) : message.providerClientToken;
        if (message.protectionScheme != null && $Object.hasOwnProperty.call(message, "protectionScheme"))
            object.protectionScheme = message.protectionScheme;
        if (message.srmRequirement != null && $Object.hasOwnProperty.call(message, "srmRequirement"))
            object.srmRequirement = options.bytes === $String ? $util.base64.encode(message.srmRequirement, 0, message.srmRequirement.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.srmRequirement) : message.srmRequirement;
        if (message.srmUpdate != null && $Object.hasOwnProperty.call(message, "srmUpdate"))
            object.srmUpdate = options.bytes === $String ? $util.base64.encode(message.srmUpdate, 0, message.srmUpdate.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.srmUpdate) : message.srmUpdate;
        if (message.platformVerificationStatus != null && $Object.hasOwnProperty.call(message, "platformVerificationStatus"))
            object.platformVerificationStatus = options.enums === $String ? $root.PlatformVerificationStatus[message.platformVerificationStatus] === $undefined ? message.platformVerificationStatus : $root.PlatformVerificationStatus[message.platformVerificationStatus] : message.platformVerificationStatus;
        if (message.groupIds && message.groupIds.length) {
            object.groupIds = $Array(message.groupIds.length);
            for (let j = 0; j < message.groupIds.length; ++j)
                object.groupIds[j] = options.bytes === $String ? $util.base64.encode(message.groupIds[j], 0, message.groupIds[j].length) : options.bytes === $Array ? $Array.prototype.slice.call(message.groupIds[j]) : message.groupIds[j];
        }
        return object;
    };

    /**
     * Converts this License to JSON.
     * @function toJSON
     * @memberof License
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    License.prototype.toJSON = function() {
        return License.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the type url for License
     * @function getTypeUrl
     * @memberof License
     * @static
     * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns {string} The type url
     */
    License.getTypeUrl = function(prefix) {
        if (prefix === $undefined)
            prefix = "type.googleapis.com";
        return prefix + "/License";
    };

    License.Policy = (function() {

        /**
         * Properties of a Policy.
         * @typedef {Object} License.Policy.$Properties
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
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */

        /**
         * Properties of a Policy.
         * @memberof License
         * @interface IPolicy
         * @augments License.Policy.$Properties
         * @deprecated Use License.Policy.$Properties instead.
         */

        /**
         * Shape of a Policy.
         * @typedef {License.Policy.$Properties} License.Policy.$Shape
         */

        /**
         * Constructs a new Policy.
         * @memberof License
         * @classdesc Represents a Policy.
         * @constructor
         * @param {License.Policy.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */
        const Policy = function (properties) {
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

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
        Policy.prototype.rentalDurationSeconds = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Policy playbackDurationSeconds.
         * @member {number|Long} playbackDurationSeconds
         * @memberof License.Policy
         * @instance
         */
        Policy.prototype.playbackDurationSeconds = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Policy licenseDurationSeconds.
         * @member {number|Long} licenseDurationSeconds
         * @memberof License.Policy
         * @instance
         */
        Policy.prototype.licenseDurationSeconds = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Policy renewalRecoveryDurationSeconds.
         * @member {number|Long} renewalRecoveryDurationSeconds
         * @memberof License.Policy
         * @instance
         */
        Policy.prototype.renewalRecoveryDurationSeconds = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Policy renewalServerUrl.
         * @member {string} renewalServerUrl
         * @memberof License.Policy
         * @instance
         */
        Policy.prototype.renewalServerUrl = "";

        /**
         * Policy renewalDelaySeconds.
         * @member {number|Long} renewalDelaySeconds
         * @memberof License.Policy
         * @instance
         */
        Policy.prototype.renewalDelaySeconds = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Policy renewalRetryIntervalSeconds.
         * @member {number|Long} renewalRetryIntervalSeconds
         * @memberof License.Policy
         * @instance
         */
        Policy.prototype.renewalRetryIntervalSeconds = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

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
        Policy.prototype.playStartGracePeriodSeconds = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

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
         * @param {License.Policy.$Properties=} [properties] Properties to set
         * @returns {License.Policy} Policy instance
         * @type {{
         *   (properties: License.Policy.$Shape): License.Policy & License.Policy.$Shape;
         *   (properties?: License.Policy.$Properties): License.Policy;
         * }}
         */
        Policy.create = function(properties) {
            return new Policy(properties);
        };

        /**
         * Encodes the specified Policy message. Does not implicitly {@link License.Policy.verify|verify} messages.
         * @function encode
         * @memberof License.Policy
         * @static
         * @param {License.Policy.$Properties} message Policy message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Policy.encode = function (message, writer, _depth) {
            if (!writer)
                writer = new $Writer();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.canPlay != null && $Object.hasOwnProperty.call(message, "canPlay"))
                writer.uint32(/* id 1, wireType 0 =*/8).bool(message.canPlay);
            if (message.canPersist != null && $Object.hasOwnProperty.call(message, "canPersist"))
                writer.uint32(/* id 2, wireType 0 =*/16).bool(message.canPersist);
            if (message.canRenew != null && $Object.hasOwnProperty.call(message, "canRenew"))
                writer.uint32(/* id 3, wireType 0 =*/24).bool(message.canRenew);
            if (message.rentalDurationSeconds != null && $Object.hasOwnProperty.call(message, "rentalDurationSeconds"))
                writer.uint32(/* id 4, wireType 0 =*/32).int64(message.rentalDurationSeconds);
            if (message.playbackDurationSeconds != null && $Object.hasOwnProperty.call(message, "playbackDurationSeconds"))
                writer.uint32(/* id 5, wireType 0 =*/40).int64(message.playbackDurationSeconds);
            if (message.licenseDurationSeconds != null && $Object.hasOwnProperty.call(message, "licenseDurationSeconds"))
                writer.uint32(/* id 6, wireType 0 =*/48).int64(message.licenseDurationSeconds);
            if (message.renewalRecoveryDurationSeconds != null && $Object.hasOwnProperty.call(message, "renewalRecoveryDurationSeconds"))
                writer.uint32(/* id 7, wireType 0 =*/56).int64(message.renewalRecoveryDurationSeconds);
            if (message.renewalServerUrl != null && $Object.hasOwnProperty.call(message, "renewalServerUrl"))
                writer.uint32(/* id 8, wireType 2 =*/66).string(message.renewalServerUrl);
            if (message.renewalDelaySeconds != null && $Object.hasOwnProperty.call(message, "renewalDelaySeconds"))
                writer.uint32(/* id 9, wireType 0 =*/72).int64(message.renewalDelaySeconds);
            if (message.renewalRetryIntervalSeconds != null && $Object.hasOwnProperty.call(message, "renewalRetryIntervalSeconds"))
                writer.uint32(/* id 10, wireType 0 =*/80).int64(message.renewalRetryIntervalSeconds);
            if (message.renewWithUsage != null && $Object.hasOwnProperty.call(message, "renewWithUsage"))
                writer.uint32(/* id 11, wireType 0 =*/88).bool(message.renewWithUsage);
            if (message.alwaysIncludeClientId != null && $Object.hasOwnProperty.call(message, "alwaysIncludeClientId"))
                writer.uint32(/* id 12, wireType 0 =*/96).bool(message.alwaysIncludeClientId);
            if (message.playStartGracePeriodSeconds != null && $Object.hasOwnProperty.call(message, "playStartGracePeriodSeconds"))
                writer.uint32(/* id 13, wireType 0 =*/104).int64(message.playStartGracePeriodSeconds);
            if (message.softEnforcePlaybackDuration != null && $Object.hasOwnProperty.call(message, "softEnforcePlaybackDuration"))
                writer.uint32(/* id 14, wireType 0 =*/112).bool(message.softEnforcePlaybackDuration);
            if (message.softEnforceRentalDuration != null && $Object.hasOwnProperty.call(message, "softEnforceRentalDuration"))
                writer.uint32(/* id 15, wireType 0 =*/120).bool(message.softEnforceRentalDuration);
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified Policy message, length delimited. Does not implicitly {@link License.Policy.verify|verify} messages.
         * @function encodeDelimited
         * @memberof License.Policy
         * @static
         * @param {License.Policy.$Properties} message Policy message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Policy.encodeDelimited = function(message, writer) {
            return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
        };

        /**
         * Decodes a Policy message from the specified reader or buffer.
         * @function decode
         * @memberof License.Policy
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {License.Policy & License.Policy.$Shape} Policy
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Policy.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.License.Policy();
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 0)
                            break;
                        message.canPlay = reader.bool();
                        continue;
                    }
                case 2: {
                        if (wireType !== 0)
                            break;
                        message.canPersist = reader.bool();
                        continue;
                    }
                case 3: {
                        if (wireType !== 0)
                            break;
                        message.canRenew = reader.bool();
                        continue;
                    }
                case 4: {
                        if (wireType !== 0)
                            break;
                        message.rentalDurationSeconds = reader.int64();
                        continue;
                    }
                case 5: {
                        if (wireType !== 0)
                            break;
                        message.playbackDurationSeconds = reader.int64();
                        continue;
                    }
                case 6: {
                        if (wireType !== 0)
                            break;
                        message.licenseDurationSeconds = reader.int64();
                        continue;
                    }
                case 7: {
                        if (wireType !== 0)
                            break;
                        message.renewalRecoveryDurationSeconds = reader.int64();
                        continue;
                    }
                case 8: {
                        if (wireType !== 2)
                            break;
                        message.renewalServerUrl = reader.string();
                        continue;
                    }
                case 9: {
                        if (wireType !== 0)
                            break;
                        message.renewalDelaySeconds = reader.int64();
                        continue;
                    }
                case 10: {
                        if (wireType !== 0)
                            break;
                        message.renewalRetryIntervalSeconds = reader.int64();
                        continue;
                    }
                case 11: {
                        if (wireType !== 0)
                            break;
                        message.renewWithUsage = reader.bool();
                        continue;
                    }
                case 12: {
                        if (wireType !== 0)
                            break;
                        message.alwaysIncludeClientId = reader.bool();
                        continue;
                    }
                case 13: {
                        if (wireType !== 0)
                            break;
                        message.playStartGracePeriodSeconds = reader.int64();
                        continue;
                    }
                case 14: {
                        if (wireType !== 0)
                            break;
                        message.softEnforcePlaybackDuration = reader.bool();
                        continue;
                    }
                case 15: {
                        if (wireType !== 0)
                            break;
                        message.softEnforceRentalDuration = reader.bool();
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Decodes a Policy message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof License.Policy
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {License.Policy & License.Policy.$Shape} Policy
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Policy.decodeDelimited = function(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Policy message.
         * @function verify
         * @memberof License.Policy
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Policy.verify = function (message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (message.canPlay != null && $Object.hasOwnProperty.call(message, "canPlay"))
                if (typeof message.canPlay !== "boolean")
                    return "canPlay: boolean expected";
            if (message.canPersist != null && $Object.hasOwnProperty.call(message, "canPersist"))
                if (typeof message.canPersist !== "boolean")
                    return "canPersist: boolean expected";
            if (message.canRenew != null && $Object.hasOwnProperty.call(message, "canRenew"))
                if (typeof message.canRenew !== "boolean")
                    return "canRenew: boolean expected";
            if (message.rentalDurationSeconds != null && $Object.hasOwnProperty.call(message, "rentalDurationSeconds"))
                if (!$util.isInteger(message.rentalDurationSeconds) && !(message.rentalDurationSeconds && $util.isInteger(message.rentalDurationSeconds.low) && $util.isInteger(message.rentalDurationSeconds.high)))
                    return "rentalDurationSeconds: integer|Long expected";
            if (message.playbackDurationSeconds != null && $Object.hasOwnProperty.call(message, "playbackDurationSeconds"))
                if (!$util.isInteger(message.playbackDurationSeconds) && !(message.playbackDurationSeconds && $util.isInteger(message.playbackDurationSeconds.low) && $util.isInteger(message.playbackDurationSeconds.high)))
                    return "playbackDurationSeconds: integer|Long expected";
            if (message.licenseDurationSeconds != null && $Object.hasOwnProperty.call(message, "licenseDurationSeconds"))
                if (!$util.isInteger(message.licenseDurationSeconds) && !(message.licenseDurationSeconds && $util.isInteger(message.licenseDurationSeconds.low) && $util.isInteger(message.licenseDurationSeconds.high)))
                    return "licenseDurationSeconds: integer|Long expected";
            if (message.renewalRecoveryDurationSeconds != null && $Object.hasOwnProperty.call(message, "renewalRecoveryDurationSeconds"))
                if (!$util.isInteger(message.renewalRecoveryDurationSeconds) && !(message.renewalRecoveryDurationSeconds && $util.isInteger(message.renewalRecoveryDurationSeconds.low) && $util.isInteger(message.renewalRecoveryDurationSeconds.high)))
                    return "renewalRecoveryDurationSeconds: integer|Long expected";
            if (message.renewalServerUrl != null && $Object.hasOwnProperty.call(message, "renewalServerUrl"))
                if (!$util.isString(message.renewalServerUrl))
                    return "renewalServerUrl: string expected";
            if (message.renewalDelaySeconds != null && $Object.hasOwnProperty.call(message, "renewalDelaySeconds"))
                if (!$util.isInteger(message.renewalDelaySeconds) && !(message.renewalDelaySeconds && $util.isInteger(message.renewalDelaySeconds.low) && $util.isInteger(message.renewalDelaySeconds.high)))
                    return "renewalDelaySeconds: integer|Long expected";
            if (message.renewalRetryIntervalSeconds != null && $Object.hasOwnProperty.call(message, "renewalRetryIntervalSeconds"))
                if (!$util.isInteger(message.renewalRetryIntervalSeconds) && !(message.renewalRetryIntervalSeconds && $util.isInteger(message.renewalRetryIntervalSeconds.low) && $util.isInteger(message.renewalRetryIntervalSeconds.high)))
                    return "renewalRetryIntervalSeconds: integer|Long expected";
            if (message.renewWithUsage != null && $Object.hasOwnProperty.call(message, "renewWithUsage"))
                if (typeof message.renewWithUsage !== "boolean")
                    return "renewWithUsage: boolean expected";
            if (message.alwaysIncludeClientId != null && $Object.hasOwnProperty.call(message, "alwaysIncludeClientId"))
                if (typeof message.alwaysIncludeClientId !== "boolean")
                    return "alwaysIncludeClientId: boolean expected";
            if (message.playStartGracePeriodSeconds != null && $Object.hasOwnProperty.call(message, "playStartGracePeriodSeconds"))
                if (!$util.isInteger(message.playStartGracePeriodSeconds) && !(message.playStartGracePeriodSeconds && $util.isInteger(message.playStartGracePeriodSeconds.low) && $util.isInteger(message.playStartGracePeriodSeconds.high)))
                    return "playStartGracePeriodSeconds: integer|Long expected";
            if (message.softEnforcePlaybackDuration != null && $Object.hasOwnProperty.call(message, "softEnforcePlaybackDuration"))
                if (typeof message.softEnforcePlaybackDuration !== "boolean")
                    return "softEnforcePlaybackDuration: boolean expected";
            if (message.softEnforceRentalDuration != null && $Object.hasOwnProperty.call(message, "softEnforceRentalDuration"))
                if (typeof message.softEnforceRentalDuration !== "boolean")
                    return "softEnforceRentalDuration: boolean expected";
            return null;
        };

        /**
         * Creates a Policy message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof License.Policy
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {License.Policy} Policy
         */
        Policy.fromObject = function (object, _depth) {
            if (object instanceof $root.License.Policy)
                return object;
            if (!$util.isObject(object))
                throw $TypeError(".License.Policy: object expected");
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let message = new $root.License.Policy();
            if (object.canPlay != null)
                message.canPlay = $Boolean(object.canPlay);
            if (object.canPersist != null)
                message.canPersist = $Boolean(object.canPersist);
            if (object.canRenew != null)
                message.canRenew = $Boolean(object.canRenew);
            if (object.rentalDurationSeconds != null)
                if ($util.Long)
                    message.rentalDurationSeconds = $util.Long.fromValue(object.rentalDurationSeconds, false);
                else if (typeof object.rentalDurationSeconds === "string")
                    message.rentalDurationSeconds = $parseInt(object.rentalDurationSeconds, 10);
                else if (typeof object.rentalDurationSeconds === "number")
                    message.rentalDurationSeconds = object.rentalDurationSeconds;
                else if (typeof object.rentalDurationSeconds === "object")
                    message.rentalDurationSeconds = new $util.LongBits(object.rentalDurationSeconds.low >>> 0, object.rentalDurationSeconds.high >>> 0).toNumber();
            if (object.playbackDurationSeconds != null)
                if ($util.Long)
                    message.playbackDurationSeconds = $util.Long.fromValue(object.playbackDurationSeconds, false);
                else if (typeof object.playbackDurationSeconds === "string")
                    message.playbackDurationSeconds = $parseInt(object.playbackDurationSeconds, 10);
                else if (typeof object.playbackDurationSeconds === "number")
                    message.playbackDurationSeconds = object.playbackDurationSeconds;
                else if (typeof object.playbackDurationSeconds === "object")
                    message.playbackDurationSeconds = new $util.LongBits(object.playbackDurationSeconds.low >>> 0, object.playbackDurationSeconds.high >>> 0).toNumber();
            if (object.licenseDurationSeconds != null)
                if ($util.Long)
                    message.licenseDurationSeconds = $util.Long.fromValue(object.licenseDurationSeconds, false);
                else if (typeof object.licenseDurationSeconds === "string")
                    message.licenseDurationSeconds = $parseInt(object.licenseDurationSeconds, 10);
                else if (typeof object.licenseDurationSeconds === "number")
                    message.licenseDurationSeconds = object.licenseDurationSeconds;
                else if (typeof object.licenseDurationSeconds === "object")
                    message.licenseDurationSeconds = new $util.LongBits(object.licenseDurationSeconds.low >>> 0, object.licenseDurationSeconds.high >>> 0).toNumber();
            if (object.renewalRecoveryDurationSeconds != null)
                if ($util.Long)
                    message.renewalRecoveryDurationSeconds = $util.Long.fromValue(object.renewalRecoveryDurationSeconds, false);
                else if (typeof object.renewalRecoveryDurationSeconds === "string")
                    message.renewalRecoveryDurationSeconds = $parseInt(object.renewalRecoveryDurationSeconds, 10);
                else if (typeof object.renewalRecoveryDurationSeconds === "number")
                    message.renewalRecoveryDurationSeconds = object.renewalRecoveryDurationSeconds;
                else if (typeof object.renewalRecoveryDurationSeconds === "object")
                    message.renewalRecoveryDurationSeconds = new $util.LongBits(object.renewalRecoveryDurationSeconds.low >>> 0, object.renewalRecoveryDurationSeconds.high >>> 0).toNumber();
            if (object.renewalServerUrl != null)
                message.renewalServerUrl = $String(object.renewalServerUrl);
            if (object.renewalDelaySeconds != null)
                if ($util.Long)
                    message.renewalDelaySeconds = $util.Long.fromValue(object.renewalDelaySeconds, false);
                else if (typeof object.renewalDelaySeconds === "string")
                    message.renewalDelaySeconds = $parseInt(object.renewalDelaySeconds, 10);
                else if (typeof object.renewalDelaySeconds === "number")
                    message.renewalDelaySeconds = object.renewalDelaySeconds;
                else if (typeof object.renewalDelaySeconds === "object")
                    message.renewalDelaySeconds = new $util.LongBits(object.renewalDelaySeconds.low >>> 0, object.renewalDelaySeconds.high >>> 0).toNumber();
            if (object.renewalRetryIntervalSeconds != null)
                if ($util.Long)
                    message.renewalRetryIntervalSeconds = $util.Long.fromValue(object.renewalRetryIntervalSeconds, false);
                else if (typeof object.renewalRetryIntervalSeconds === "string")
                    message.renewalRetryIntervalSeconds = $parseInt(object.renewalRetryIntervalSeconds, 10);
                else if (typeof object.renewalRetryIntervalSeconds === "number")
                    message.renewalRetryIntervalSeconds = object.renewalRetryIntervalSeconds;
                else if (typeof object.renewalRetryIntervalSeconds === "object")
                    message.renewalRetryIntervalSeconds = new $util.LongBits(object.renewalRetryIntervalSeconds.low >>> 0, object.renewalRetryIntervalSeconds.high >>> 0).toNumber();
            if (object.renewWithUsage != null)
                message.renewWithUsage = $Boolean(object.renewWithUsage);
            if (object.alwaysIncludeClientId != null)
                message.alwaysIncludeClientId = $Boolean(object.alwaysIncludeClientId);
            if (object.playStartGracePeriodSeconds != null)
                if ($util.Long)
                    message.playStartGracePeriodSeconds = $util.Long.fromValue(object.playStartGracePeriodSeconds, false);
                else if (typeof object.playStartGracePeriodSeconds === "string")
                    message.playStartGracePeriodSeconds = $parseInt(object.playStartGracePeriodSeconds, 10);
                else if (typeof object.playStartGracePeriodSeconds === "number")
                    message.playStartGracePeriodSeconds = object.playStartGracePeriodSeconds;
                else if (typeof object.playStartGracePeriodSeconds === "object")
                    message.playStartGracePeriodSeconds = new $util.LongBits(object.playStartGracePeriodSeconds.low >>> 0, object.playStartGracePeriodSeconds.high >>> 0).toNumber();
            if (object.softEnforcePlaybackDuration != null)
                message.softEnforcePlaybackDuration = $Boolean(object.softEnforcePlaybackDuration);
            if (object.softEnforceRentalDuration != null)
                message.softEnforceRentalDuration = $Boolean(object.softEnforceRentalDuration);
            return message;
        };

        /**
         * Creates a plain object from a Policy message. Also converts values to other types if specified.
         * @function toObject
         * @memberof License.Policy
         * @static
         * @param {License.Policy} message Policy
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Policy.toObject = function (message, options, _depth) {
            if (!options)
                options = {};
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let object = {};
            if (options.defaults) {
                object.canPlay = false;
                object.canPersist = false;
                object.canRenew = false;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.rentalDurationSeconds = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                } else
                    object.rentalDurationSeconds = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.playbackDurationSeconds = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                } else
                    object.playbackDurationSeconds = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.licenseDurationSeconds = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                } else
                    object.licenseDurationSeconds = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.renewalRecoveryDurationSeconds = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                } else
                    object.renewalRecoveryDurationSeconds = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                object.renewalServerUrl = "";
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.renewalDelaySeconds = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                } else
                    object.renewalDelaySeconds = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.renewalRetryIntervalSeconds = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                } else
                    object.renewalRetryIntervalSeconds = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                object.renewWithUsage = false;
                object.alwaysIncludeClientId = false;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.playStartGracePeriodSeconds = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                } else
                    object.playStartGracePeriodSeconds = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                object.softEnforcePlaybackDuration = false;
                object.softEnforceRentalDuration = true;
            }
            if (message.canPlay != null && $Object.hasOwnProperty.call(message, "canPlay"))
                object.canPlay = message.canPlay;
            if (message.canPersist != null && $Object.hasOwnProperty.call(message, "canPersist"))
                object.canPersist = message.canPersist;
            if (message.canRenew != null && $Object.hasOwnProperty.call(message, "canRenew"))
                object.canRenew = message.canRenew;
            if (message.rentalDurationSeconds != null && $Object.hasOwnProperty.call(message, "rentalDurationSeconds"))
                if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                    object.rentalDurationSeconds = typeof message.rentalDurationSeconds === "number" ? $BigInt(message.rentalDurationSeconds) : $util.Long.fromBits(message.rentalDurationSeconds.low >>> 0, message.rentalDurationSeconds.high >>> 0, false).toBigInt();
                else if (typeof message.rentalDurationSeconds === "number")
                    object.rentalDurationSeconds = options.longs === $String ? $String(message.rentalDurationSeconds) : message.rentalDurationSeconds;
                else
                    object.rentalDurationSeconds = options.longs === $String ? $util.Long.prototype.toString.call(message.rentalDurationSeconds) : options.longs === $Number ? new $util.LongBits(message.rentalDurationSeconds.low >>> 0, message.rentalDurationSeconds.high >>> 0).toNumber() : message.rentalDurationSeconds;
            if (message.playbackDurationSeconds != null && $Object.hasOwnProperty.call(message, "playbackDurationSeconds"))
                if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                    object.playbackDurationSeconds = typeof message.playbackDurationSeconds === "number" ? $BigInt(message.playbackDurationSeconds) : $util.Long.fromBits(message.playbackDurationSeconds.low >>> 0, message.playbackDurationSeconds.high >>> 0, false).toBigInt();
                else if (typeof message.playbackDurationSeconds === "number")
                    object.playbackDurationSeconds = options.longs === $String ? $String(message.playbackDurationSeconds) : message.playbackDurationSeconds;
                else
                    object.playbackDurationSeconds = options.longs === $String ? $util.Long.prototype.toString.call(message.playbackDurationSeconds) : options.longs === $Number ? new $util.LongBits(message.playbackDurationSeconds.low >>> 0, message.playbackDurationSeconds.high >>> 0).toNumber() : message.playbackDurationSeconds;
            if (message.licenseDurationSeconds != null && $Object.hasOwnProperty.call(message, "licenseDurationSeconds"))
                if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                    object.licenseDurationSeconds = typeof message.licenseDurationSeconds === "number" ? $BigInt(message.licenseDurationSeconds) : $util.Long.fromBits(message.licenseDurationSeconds.low >>> 0, message.licenseDurationSeconds.high >>> 0, false).toBigInt();
                else if (typeof message.licenseDurationSeconds === "number")
                    object.licenseDurationSeconds = options.longs === $String ? $String(message.licenseDurationSeconds) : message.licenseDurationSeconds;
                else
                    object.licenseDurationSeconds = options.longs === $String ? $util.Long.prototype.toString.call(message.licenseDurationSeconds) : options.longs === $Number ? new $util.LongBits(message.licenseDurationSeconds.low >>> 0, message.licenseDurationSeconds.high >>> 0).toNumber() : message.licenseDurationSeconds;
            if (message.renewalRecoveryDurationSeconds != null && $Object.hasOwnProperty.call(message, "renewalRecoveryDurationSeconds"))
                if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                    object.renewalRecoveryDurationSeconds = typeof message.renewalRecoveryDurationSeconds === "number" ? $BigInt(message.renewalRecoveryDurationSeconds) : $util.Long.fromBits(message.renewalRecoveryDurationSeconds.low >>> 0, message.renewalRecoveryDurationSeconds.high >>> 0, false).toBigInt();
                else if (typeof message.renewalRecoveryDurationSeconds === "number")
                    object.renewalRecoveryDurationSeconds = options.longs === $String ? $String(message.renewalRecoveryDurationSeconds) : message.renewalRecoveryDurationSeconds;
                else
                    object.renewalRecoveryDurationSeconds = options.longs === $String ? $util.Long.prototype.toString.call(message.renewalRecoveryDurationSeconds) : options.longs === $Number ? new $util.LongBits(message.renewalRecoveryDurationSeconds.low >>> 0, message.renewalRecoveryDurationSeconds.high >>> 0).toNumber() : message.renewalRecoveryDurationSeconds;
            if (message.renewalServerUrl != null && $Object.hasOwnProperty.call(message, "renewalServerUrl"))
                object.renewalServerUrl = message.renewalServerUrl;
            if (message.renewalDelaySeconds != null && $Object.hasOwnProperty.call(message, "renewalDelaySeconds"))
                if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                    object.renewalDelaySeconds = typeof message.renewalDelaySeconds === "number" ? $BigInt(message.renewalDelaySeconds) : $util.Long.fromBits(message.renewalDelaySeconds.low >>> 0, message.renewalDelaySeconds.high >>> 0, false).toBigInt();
                else if (typeof message.renewalDelaySeconds === "number")
                    object.renewalDelaySeconds = options.longs === $String ? $String(message.renewalDelaySeconds) : message.renewalDelaySeconds;
                else
                    object.renewalDelaySeconds = options.longs === $String ? $util.Long.prototype.toString.call(message.renewalDelaySeconds) : options.longs === $Number ? new $util.LongBits(message.renewalDelaySeconds.low >>> 0, message.renewalDelaySeconds.high >>> 0).toNumber() : message.renewalDelaySeconds;
            if (message.renewalRetryIntervalSeconds != null && $Object.hasOwnProperty.call(message, "renewalRetryIntervalSeconds"))
                if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                    object.renewalRetryIntervalSeconds = typeof message.renewalRetryIntervalSeconds === "number" ? $BigInt(message.renewalRetryIntervalSeconds) : $util.Long.fromBits(message.renewalRetryIntervalSeconds.low >>> 0, message.renewalRetryIntervalSeconds.high >>> 0, false).toBigInt();
                else if (typeof message.renewalRetryIntervalSeconds === "number")
                    object.renewalRetryIntervalSeconds = options.longs === $String ? $String(message.renewalRetryIntervalSeconds) : message.renewalRetryIntervalSeconds;
                else
                    object.renewalRetryIntervalSeconds = options.longs === $String ? $util.Long.prototype.toString.call(message.renewalRetryIntervalSeconds) : options.longs === $Number ? new $util.LongBits(message.renewalRetryIntervalSeconds.low >>> 0, message.renewalRetryIntervalSeconds.high >>> 0).toNumber() : message.renewalRetryIntervalSeconds;
            if (message.renewWithUsage != null && $Object.hasOwnProperty.call(message, "renewWithUsage"))
                object.renewWithUsage = message.renewWithUsage;
            if (message.alwaysIncludeClientId != null && $Object.hasOwnProperty.call(message, "alwaysIncludeClientId"))
                object.alwaysIncludeClientId = message.alwaysIncludeClientId;
            if (message.playStartGracePeriodSeconds != null && $Object.hasOwnProperty.call(message, "playStartGracePeriodSeconds"))
                if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                    object.playStartGracePeriodSeconds = typeof message.playStartGracePeriodSeconds === "number" ? $BigInt(message.playStartGracePeriodSeconds) : $util.Long.fromBits(message.playStartGracePeriodSeconds.low >>> 0, message.playStartGracePeriodSeconds.high >>> 0, false).toBigInt();
                else if (typeof message.playStartGracePeriodSeconds === "number")
                    object.playStartGracePeriodSeconds = options.longs === $String ? $String(message.playStartGracePeriodSeconds) : message.playStartGracePeriodSeconds;
                else
                    object.playStartGracePeriodSeconds = options.longs === $String ? $util.Long.prototype.toString.call(message.playStartGracePeriodSeconds) : options.longs === $Number ? new $util.LongBits(message.playStartGracePeriodSeconds.low >>> 0, message.playStartGracePeriodSeconds.high >>> 0).toNumber() : message.playStartGracePeriodSeconds;
            if (message.softEnforcePlaybackDuration != null && $Object.hasOwnProperty.call(message, "softEnforcePlaybackDuration"))
                object.softEnforcePlaybackDuration = message.softEnforcePlaybackDuration;
            if (message.softEnforceRentalDuration != null && $Object.hasOwnProperty.call(message, "softEnforceRentalDuration"))
                object.softEnforceRentalDuration = message.softEnforceRentalDuration;
            return object;
        };

        /**
         * Converts this Policy to JSON.
         * @function toJSON
         * @memberof License.Policy
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Policy.prototype.toJSON = function() {
            return Policy.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for Policy
         * @function getTypeUrl
         * @memberof License.Policy
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        Policy.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/License.Policy";
        };

        return Policy;
    })();

    License.KeyContainer = (function() {

        /**
         * Properties of a KeyContainer.
         * @typedef {Object} License.KeyContainer.$Properties
         * @property {Uint8Array|null} [id] KeyContainer id
         * @property {Uint8Array|null} [iv] KeyContainer iv
         * @property {Uint8Array|null} [key] KeyContainer key
         * @property {License.KeyContainer.KeyType|null} [type] KeyContainer type
         * @property {License.KeyContainer.SecurityLevel|null} [level] KeyContainer level
         * @property {License.KeyContainer.OutputProtection.$Properties|null} [requiredProtection] KeyContainer requiredProtection
         * @property {License.KeyContainer.OutputProtection.$Properties|null} [requestedProtection] KeyContainer requestedProtection
         * @property {License.KeyContainer.KeyControl.$Properties|null} [keyControl] KeyContainer keyControl
         * @property {License.KeyContainer.OperatorSessionKeyPermissions.$Properties|null} [operatorSessionKeyPermissions] KeyContainer operatorSessionKeyPermissions
         * @property {Array.<License.KeyContainer.VideoResolutionConstraint.$Properties>|null} [videoResolutionConstraints] KeyContainer videoResolutionConstraints
         * @property {boolean|null} [antiRollbackUsageTable] KeyContainer antiRollbackUsageTable
         * @property {string|null} [trackLabel] KeyContainer trackLabel
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */

        /**
         * Properties of a KeyContainer.
         * @memberof License
         * @interface IKeyContainer
         * @augments License.KeyContainer.$Properties
         * @deprecated Use License.KeyContainer.$Properties instead.
         */

        /**
         * Shape of a KeyContainer.
         * @typedef {License.KeyContainer.$Properties} License.KeyContainer.$Shape
         */

        /**
         * Constructs a new KeyContainer.
         * @memberof License
         * @classdesc Represents a KeyContainer.
         * @constructor
         * @param {License.KeyContainer.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */
        const KeyContainer = function (properties) {
            this.videoResolutionConstraints = [];
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

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
         * @member {License.KeyContainer.OutputProtection.$Properties|null|undefined} requiredProtection
         * @memberof License.KeyContainer
         * @instance
         */
        KeyContainer.prototype.requiredProtection = null;

        /**
         * KeyContainer requestedProtection.
         * @member {License.KeyContainer.OutputProtection.$Properties|null|undefined} requestedProtection
         * @memberof License.KeyContainer
         * @instance
         */
        KeyContainer.prototype.requestedProtection = null;

        /**
         * KeyContainer keyControl.
         * @member {License.KeyContainer.KeyControl.$Properties|null|undefined} keyControl
         * @memberof License.KeyContainer
         * @instance
         */
        KeyContainer.prototype.keyControl = null;

        /**
         * KeyContainer operatorSessionKeyPermissions.
         * @member {License.KeyContainer.OperatorSessionKeyPermissions.$Properties|null|undefined} operatorSessionKeyPermissions
         * @memberof License.KeyContainer
         * @instance
         */
        KeyContainer.prototype.operatorSessionKeyPermissions = null;

        /**
         * KeyContainer videoResolutionConstraints.
         * @member {Array.<License.KeyContainer.VideoResolutionConstraint.$Properties>} videoResolutionConstraints
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
        KeyContainer.prototype.trackLabel = "";

        /**
         * Creates a new KeyContainer instance using the specified properties.
         * @function create
         * @memberof License.KeyContainer
         * @static
         * @param {License.KeyContainer.$Properties=} [properties] Properties to set
         * @returns {License.KeyContainer} KeyContainer instance
         * @type {{
         *   (properties: License.KeyContainer.$Shape): License.KeyContainer & License.KeyContainer.$Shape;
         *   (properties?: License.KeyContainer.$Properties): License.KeyContainer;
         * }}
         */
        KeyContainer.create = function(properties) {
            return new KeyContainer(properties);
        };

        /**
         * Encodes the specified KeyContainer message. Does not implicitly {@link License.KeyContainer.verify|verify} messages.
         * @function encode
         * @memberof License.KeyContainer
         * @static
         * @param {License.KeyContainer.$Properties} message KeyContainer message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        KeyContainer.encode = function (message, writer, _depth) {
            if (!writer)
                writer = new $Writer();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.id != null && $Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.id);
            if (message.iv != null && $Object.hasOwnProperty.call(message, "iv"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.iv);
            if (message.key != null && $Object.hasOwnProperty.call(message, "key"))
                writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.key);
            if (message.type != null && $Object.hasOwnProperty.call(message, "type"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.type);
            if (message.level != null && $Object.hasOwnProperty.call(message, "level"))
                writer.uint32(/* id 5, wireType 0 =*/40).int32(message.level);
            if (message.requiredProtection != null && $Object.hasOwnProperty.call(message, "requiredProtection"))
                $root.License.KeyContainer.OutputProtection.encode(message.requiredProtection, writer.uint32(/* id 6, wireType 2 =*/50).fork(), _depth + 1).ldelim();
            if (message.requestedProtection != null && $Object.hasOwnProperty.call(message, "requestedProtection"))
                $root.License.KeyContainer.OutputProtection.encode(message.requestedProtection, writer.uint32(/* id 7, wireType 2 =*/58).fork(), _depth + 1).ldelim();
            if (message.keyControl != null && $Object.hasOwnProperty.call(message, "keyControl"))
                $root.License.KeyContainer.KeyControl.encode(message.keyControl, writer.uint32(/* id 8, wireType 2 =*/66).fork(), _depth + 1).ldelim();
            if (message.operatorSessionKeyPermissions != null && $Object.hasOwnProperty.call(message, "operatorSessionKeyPermissions"))
                $root.License.KeyContainer.OperatorSessionKeyPermissions.encode(message.operatorSessionKeyPermissions, writer.uint32(/* id 9, wireType 2 =*/74).fork(), _depth + 1).ldelim();
            if (message.videoResolutionConstraints != null && message.videoResolutionConstraints.length)
                for (let i = 0; i < message.videoResolutionConstraints.length; ++i)
                    $root.License.KeyContainer.VideoResolutionConstraint.encode(message.videoResolutionConstraints[i], writer.uint32(/* id 10, wireType 2 =*/82).fork(), _depth + 1).ldelim();
            if (message.antiRollbackUsageTable != null && $Object.hasOwnProperty.call(message, "antiRollbackUsageTable"))
                writer.uint32(/* id 11, wireType 0 =*/88).bool(message.antiRollbackUsageTable);
            if (message.trackLabel != null && $Object.hasOwnProperty.call(message, "trackLabel"))
                writer.uint32(/* id 12, wireType 2 =*/98).string(message.trackLabel);
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified KeyContainer message, length delimited. Does not implicitly {@link License.KeyContainer.verify|verify} messages.
         * @function encodeDelimited
         * @memberof License.KeyContainer
         * @static
         * @param {License.KeyContainer.$Properties} message KeyContainer message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        KeyContainer.encodeDelimited = function(message, writer) {
            return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
        };

        /**
         * Decodes a KeyContainer message from the specified reader or buffer.
         * @function decode
         * @memberof License.KeyContainer
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {License.KeyContainer & License.KeyContainer.$Shape} KeyContainer
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        KeyContainer.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.License.KeyContainer();
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        message.id = reader.bytes();
                        continue;
                    }
                case 2: {
                        if (wireType !== 2)
                            break;
                        message.iv = reader.bytes();
                        continue;
                    }
                case 3: {
                        if (wireType !== 2)
                            break;
                        message.key = reader.bytes();
                        continue;
                    }
                case 4: {
                        if (wireType !== 0)
                            break;
                        message.type = reader.int32();
                        continue;
                    }
                case 5: {
                        if (wireType !== 0)
                            break;
                        message.level = reader.int32();
                        continue;
                    }
                case 6: {
                        if (wireType !== 2)
                            break;
                        message.requiredProtection = $root.License.KeyContainer.OutputProtection.decode(reader, reader.uint32(), $undefined, _depth + 1, message.requiredProtection);
                        continue;
                    }
                case 7: {
                        if (wireType !== 2)
                            break;
                        message.requestedProtection = $root.License.KeyContainer.OutputProtection.decode(reader, reader.uint32(), $undefined, _depth + 1, message.requestedProtection);
                        continue;
                    }
                case 8: {
                        if (wireType !== 2)
                            break;
                        message.keyControl = $root.License.KeyContainer.KeyControl.decode(reader, reader.uint32(), $undefined, _depth + 1, message.keyControl);
                        continue;
                    }
                case 9: {
                        if (wireType !== 2)
                            break;
                        message.operatorSessionKeyPermissions = $root.License.KeyContainer.OperatorSessionKeyPermissions.decode(reader, reader.uint32(), $undefined, _depth + 1, message.operatorSessionKeyPermissions);
                        continue;
                    }
                case 10: {
                        if (wireType !== 2)
                            break;
                        if (!(message.videoResolutionConstraints && message.videoResolutionConstraints.length))
                            message.videoResolutionConstraints = [];
                        message.videoResolutionConstraints.push($root.License.KeyContainer.VideoResolutionConstraint.decode(reader, reader.uint32(), $undefined, _depth + 1));
                        continue;
                    }
                case 11: {
                        if (wireType !== 0)
                            break;
                        message.antiRollbackUsageTable = reader.bool();
                        continue;
                    }
                case 12: {
                        if (wireType !== 2)
                            break;
                        message.trackLabel = reader.string();
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Decodes a KeyContainer message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof License.KeyContainer
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {License.KeyContainer & License.KeyContainer.$Shape} KeyContainer
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        KeyContainer.decodeDelimited = function(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a KeyContainer message.
         * @function verify
         * @memberof License.KeyContainer
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        KeyContainer.verify = function (message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (message.id != null && $Object.hasOwnProperty.call(message, "id"))
                if (!(message.id && typeof message.id.length === "number" || $util.isString(message.id)))
                    return "id: buffer expected";
            if (message.iv != null && $Object.hasOwnProperty.call(message, "iv"))
                if (!(message.iv && typeof message.iv.length === "number" || $util.isString(message.iv)))
                    return "iv: buffer expected";
            if (message.key != null && $Object.hasOwnProperty.call(message, "key"))
                if (!(message.key && typeof message.key.length === "number" || $util.isString(message.key)))
                    return "key: buffer expected";
            if (message.type != null && $Object.hasOwnProperty.call(message, "type"))
                switch (message.type) {
                default:
                    return "type: enum value expected";
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                    break;
                }
            if (message.level != null && $Object.hasOwnProperty.call(message, "level"))
                switch (message.level) {
                default:
                    return "level: enum value expected";
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                    break;
                }
            if (message.requiredProtection != null && $Object.hasOwnProperty.call(message, "requiredProtection")) {
                let error = $root.License.KeyContainer.OutputProtection.verify(message.requiredProtection, _depth + 1);
                if (error)
                    return "requiredProtection." + error;
            }
            if (message.requestedProtection != null && $Object.hasOwnProperty.call(message, "requestedProtection")) {
                let error = $root.License.KeyContainer.OutputProtection.verify(message.requestedProtection, _depth + 1);
                if (error)
                    return "requestedProtection." + error;
            }
            if (message.keyControl != null && $Object.hasOwnProperty.call(message, "keyControl")) {
                let error = $root.License.KeyContainer.KeyControl.verify(message.keyControl, _depth + 1);
                if (error)
                    return "keyControl." + error;
            }
            if (message.operatorSessionKeyPermissions != null && $Object.hasOwnProperty.call(message, "operatorSessionKeyPermissions")) {
                let error = $root.License.KeyContainer.OperatorSessionKeyPermissions.verify(message.operatorSessionKeyPermissions, _depth + 1);
                if (error)
                    return "operatorSessionKeyPermissions." + error;
            }
            if (message.videoResolutionConstraints != null && $Object.hasOwnProperty.call(message, "videoResolutionConstraints")) {
                if (!$Array.isArray(message.videoResolutionConstraints))
                    return "videoResolutionConstraints: array expected";
                for (let i = 0; i < message.videoResolutionConstraints.length; ++i) {
                    let error = $root.License.KeyContainer.VideoResolutionConstraint.verify(message.videoResolutionConstraints[i], _depth + 1);
                    if (error)
                        return "videoResolutionConstraints." + error;
                }
            }
            if (message.antiRollbackUsageTable != null && $Object.hasOwnProperty.call(message, "antiRollbackUsageTable"))
                if (typeof message.antiRollbackUsageTable !== "boolean")
                    return "antiRollbackUsageTable: boolean expected";
            if (message.trackLabel != null && $Object.hasOwnProperty.call(message, "trackLabel"))
                if (!$util.isString(message.trackLabel))
                    return "trackLabel: string expected";
            return null;
        };

        /**
         * Creates a KeyContainer message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof License.KeyContainer
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {License.KeyContainer} KeyContainer
         */
        KeyContainer.fromObject = function (object, _depth) {
            if (object instanceof $root.License.KeyContainer)
                return object;
            if (!$util.isObject(object))
                throw $TypeError(".License.KeyContainer: object expected");
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let message = new $root.License.KeyContainer();
            if (object.id != null)
                if (typeof object.id === "string")
                    $util.base64.decode(object.id, message.id = $util.newBuffer($util.base64.length(object.id)), 0);
                else if (object.id.length >= 0)
                    message.id = object.id;
            if (object.iv != null)
                if (typeof object.iv === "string")
                    $util.base64.decode(object.iv, message.iv = $util.newBuffer($util.base64.length(object.iv)), 0);
                else if (object.iv.length >= 0)
                    message.iv = object.iv;
            if (object.key != null)
                if (typeof object.key === "string")
                    $util.base64.decode(object.key, message.key = $util.newBuffer($util.base64.length(object.key)), 0);
                else if (object.key.length >= 0)
                    message.key = object.key;
            switch (object.type) {
            default:
                if (typeof object.type === "number") {
                    message.type = object.type;
                    break;
                }
                break;
            case "SIGNING":
            case 1:
                message.type = 1;
                break;
            case "CONTENT":
            case 2:
                message.type = 2;
                break;
            case "KEY_CONTROL":
            case 3:
                message.type = 3;
                break;
            case "OPERATOR_SESSION":
            case 4:
                message.type = 4;
                break;
            case "ENTITLEMENT":
            case 5:
                message.type = 5;
                break;
            case "OEM_CONTENT":
            case 6:
                message.type = 6;
                break;
            }
            switch (object.level) {
            default:
                if (typeof object.level === "number") {
                    message.level = object.level;
                    break;
                }
                break;
            case "SW_SECURE_CRYPTO":
            case 1:
                message.level = 1;
                break;
            case "SW_SECURE_DECODE":
            case 2:
                message.level = 2;
                break;
            case "HW_SECURE_CRYPTO":
            case 3:
                message.level = 3;
                break;
            case "HW_SECURE_DECODE":
            case 4:
                message.level = 4;
                break;
            case "HW_SECURE_ALL":
            case 5:
                message.level = 5;
                break;
            }
            if (object.requiredProtection != null) {
                if (!$util.isObject(object.requiredProtection))
                    throw $TypeError(".License.KeyContainer.requiredProtection: object expected");
                message.requiredProtection = $root.License.KeyContainer.OutputProtection.fromObject(object.requiredProtection, _depth + 1);
            }
            if (object.requestedProtection != null) {
                if (!$util.isObject(object.requestedProtection))
                    throw $TypeError(".License.KeyContainer.requestedProtection: object expected");
                message.requestedProtection = $root.License.KeyContainer.OutputProtection.fromObject(object.requestedProtection, _depth + 1);
            }
            if (object.keyControl != null) {
                if (!$util.isObject(object.keyControl))
                    throw $TypeError(".License.KeyContainer.keyControl: object expected");
                message.keyControl = $root.License.KeyContainer.KeyControl.fromObject(object.keyControl, _depth + 1);
            }
            if (object.operatorSessionKeyPermissions != null) {
                if (!$util.isObject(object.operatorSessionKeyPermissions))
                    throw $TypeError(".License.KeyContainer.operatorSessionKeyPermissions: object expected");
                message.operatorSessionKeyPermissions = $root.License.KeyContainer.OperatorSessionKeyPermissions.fromObject(object.operatorSessionKeyPermissions, _depth + 1);
            }
            if (object.videoResolutionConstraints) {
                if (!$Array.isArray(object.videoResolutionConstraints))
                    throw $TypeError(".License.KeyContainer.videoResolutionConstraints: array expected");
                message.videoResolutionConstraints = $Array(object.videoResolutionConstraints.length);
                for (let i = 0; i < object.videoResolutionConstraints.length; ++i) {
                    if (!$util.isObject(object.videoResolutionConstraints[i]))
                        throw $TypeError(".License.KeyContainer.videoResolutionConstraints: object expected");
                    message.videoResolutionConstraints[i] = $root.License.KeyContainer.VideoResolutionConstraint.fromObject(object.videoResolutionConstraints[i], _depth + 1);
                }
            }
            if (object.antiRollbackUsageTable != null)
                message.antiRollbackUsageTable = $Boolean(object.antiRollbackUsageTable);
            if (object.trackLabel != null)
                message.trackLabel = $String(object.trackLabel);
            return message;
        };

        /**
         * Creates a plain object from a KeyContainer message. Also converts values to other types if specified.
         * @function toObject
         * @memberof License.KeyContainer
         * @static
         * @param {License.KeyContainer} message KeyContainer
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        KeyContainer.toObject = function (message, options, _depth) {
            if (!options)
                options = {};
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let object = {};
            if (options.arrays || options.defaults)
                object.videoResolutionConstraints = [];
            if (options.defaults) {
                if (options.bytes === $String)
                    object.id = "";
                else {
                    object.id = [];
                    if (options.bytes !== $Array)
                        object.id = $util.newBuffer(object.id);
                }
                if (options.bytes === $String)
                    object.iv = "";
                else {
                    object.iv = [];
                    if (options.bytes !== $Array)
                        object.iv = $util.newBuffer(object.iv);
                }
                if (options.bytes === $String)
                    object.key = "";
                else {
                    object.key = [];
                    if (options.bytes !== $Array)
                        object.key = $util.newBuffer(object.key);
                }
                object.type = options.enums === $String ? "SIGNING" : 1;
                object.level = options.enums === $String ? "SW_SECURE_CRYPTO" : 1;
                object.requiredProtection = null;
                object.requestedProtection = null;
                object.keyControl = null;
                object.operatorSessionKeyPermissions = null;
                object.antiRollbackUsageTable = false;
                object.trackLabel = "";
            }
            if (message.id != null && $Object.hasOwnProperty.call(message, "id"))
                object.id = options.bytes === $String ? $util.base64.encode(message.id, 0, message.id.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.id) : message.id;
            if (message.iv != null && $Object.hasOwnProperty.call(message, "iv"))
                object.iv = options.bytes === $String ? $util.base64.encode(message.iv, 0, message.iv.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.iv) : message.iv;
            if (message.key != null && $Object.hasOwnProperty.call(message, "key"))
                object.key = options.bytes === $String ? $util.base64.encode(message.key, 0, message.key.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.key) : message.key;
            if (message.type != null && $Object.hasOwnProperty.call(message, "type"))
                object.type = options.enums === $String ? $root.License.KeyContainer.KeyType[message.type] === $undefined ? message.type : $root.License.KeyContainer.KeyType[message.type] : message.type;
            if (message.level != null && $Object.hasOwnProperty.call(message, "level"))
                object.level = options.enums === $String ? $root.License.KeyContainer.SecurityLevel[message.level] === $undefined ? message.level : $root.License.KeyContainer.SecurityLevel[message.level] : message.level;
            if (message.requiredProtection != null && $Object.hasOwnProperty.call(message, "requiredProtection"))
                object.requiredProtection = $root.License.KeyContainer.OutputProtection.toObject(message.requiredProtection, options, _depth + 1);
            if (message.requestedProtection != null && $Object.hasOwnProperty.call(message, "requestedProtection"))
                object.requestedProtection = $root.License.KeyContainer.OutputProtection.toObject(message.requestedProtection, options, _depth + 1);
            if (message.keyControl != null && $Object.hasOwnProperty.call(message, "keyControl"))
                object.keyControl = $root.License.KeyContainer.KeyControl.toObject(message.keyControl, options, _depth + 1);
            if (message.operatorSessionKeyPermissions != null && $Object.hasOwnProperty.call(message, "operatorSessionKeyPermissions"))
                object.operatorSessionKeyPermissions = $root.License.KeyContainer.OperatorSessionKeyPermissions.toObject(message.operatorSessionKeyPermissions, options, _depth + 1);
            if (message.videoResolutionConstraints && message.videoResolutionConstraints.length) {
                object.videoResolutionConstraints = $Array(message.videoResolutionConstraints.length);
                for (let j = 0; j < message.videoResolutionConstraints.length; ++j)
                    object.videoResolutionConstraints[j] = $root.License.KeyContainer.VideoResolutionConstraint.toObject(message.videoResolutionConstraints[j], options, _depth + 1);
            }
            if (message.antiRollbackUsageTable != null && $Object.hasOwnProperty.call(message, "antiRollbackUsageTable"))
                object.antiRollbackUsageTable = message.antiRollbackUsageTable;
            if (message.trackLabel != null && $Object.hasOwnProperty.call(message, "trackLabel"))
                object.trackLabel = message.trackLabel;
            return object;
        };

        /**
         * Converts this KeyContainer to JSON.
         * @function toJSON
         * @memberof License.KeyContainer
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        KeyContainer.prototype.toJSON = function() {
            return KeyContainer.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for KeyContainer
         * @function getTypeUrl
         * @memberof License.KeyContainer
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        KeyContainer.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/License.KeyContainer";
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
        KeyContainer.KeyType = (function() {
            const valuesById = {}, values = $Object.create(valuesById);
            values[valuesById[1] = "SIGNING"] = 1;
            values[valuesById[2] = "CONTENT"] = 2;
            values[valuesById[3] = "KEY_CONTROL"] = 3;
            values[valuesById[4] = "OPERATOR_SESSION"] = 4;
            values[valuesById[5] = "ENTITLEMENT"] = 5;
            values[valuesById[6] = "OEM_CONTENT"] = 6;
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
        KeyContainer.SecurityLevel = (function() {
            const valuesById = {}, values = $Object.create(valuesById);
            values[valuesById[1] = "SW_SECURE_CRYPTO"] = 1;
            values[valuesById[2] = "SW_SECURE_DECODE"] = 2;
            values[valuesById[3] = "HW_SECURE_CRYPTO"] = 3;
            values[valuesById[4] = "HW_SECURE_DECODE"] = 4;
            values[valuesById[5] = "HW_SECURE_ALL"] = 5;
            return values;
        })();

        KeyContainer.KeyControl = (function() {

            /**
             * Properties of a KeyControl.
             * @typedef {Object} License.KeyContainer.KeyControl.$Properties
             * @property {Uint8Array|null} [keyControlBlock] KeyControl keyControlBlock
             * @property {Uint8Array|null} [iv] KeyControl iv
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
             */

            /**
             * Properties of a KeyControl.
             * @memberof License.KeyContainer
             * @interface IKeyControl
             * @augments License.KeyContainer.KeyControl.$Properties
             * @deprecated Use License.KeyContainer.KeyControl.$Properties instead.
             */

            /**
             * Shape of a KeyControl.
             * @typedef {License.KeyContainer.KeyControl.$Properties} License.KeyContainer.KeyControl.$Shape
             */

            /**
             * Constructs a new KeyControl.
             * @memberof License.KeyContainer
             * @classdesc Represents a KeyControl.
             * @constructor
             * @param {License.KeyContainer.KeyControl.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
             */
            const KeyControl = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

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
             * @param {License.KeyContainer.KeyControl.$Properties=} [properties] Properties to set
             * @returns {License.KeyContainer.KeyControl} KeyControl instance
             * @type {{
             *   (properties: License.KeyContainer.KeyControl.$Shape): License.KeyContainer.KeyControl & License.KeyContainer.KeyControl.$Shape;
             *   (properties?: License.KeyContainer.KeyControl.$Properties): License.KeyContainer.KeyControl;
             * }}
             */
            KeyControl.create = function(properties) {
                return new KeyControl(properties);
            };

            /**
             * Encodes the specified KeyControl message. Does not implicitly {@link License.KeyContainer.KeyControl.verify|verify} messages.
             * @function encode
             * @memberof License.KeyContainer.KeyControl
             * @static
             * @param {License.KeyContainer.KeyControl.$Properties} message KeyControl message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            KeyControl.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = new $Writer();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.keyControlBlock != null && $Object.hasOwnProperty.call(message, "keyControlBlock"))
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.keyControlBlock);
                if (message.iv != null && $Object.hasOwnProperty.call(message, "iv"))
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.iv);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified KeyControl message, length delimited. Does not implicitly {@link License.KeyContainer.KeyControl.verify|verify} messages.
             * @function encodeDelimited
             * @memberof License.KeyContainer.KeyControl
             * @static
             * @param {License.KeyContainer.KeyControl.$Properties} message KeyControl message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            KeyControl.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a KeyControl message from the specified reader or buffer.
             * @function decode
             * @memberof License.KeyContainer.KeyControl
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {License.KeyContainer.KeyControl & License.KeyContainer.KeyControl.$Shape} KeyControl
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            KeyControl.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.License.KeyContainer.KeyControl();
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            message.keyControlBlock = reader.bytes();
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            message.iv = reader.bytes();
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes a KeyControl message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof License.KeyContainer.KeyControl
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {License.KeyContainer.KeyControl & License.KeyContainer.KeyControl.$Shape} KeyControl
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            KeyControl.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a KeyControl message.
             * @function verify
             * @memberof License.KeyContainer.KeyControl
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            KeyControl.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.keyControlBlock != null && $Object.hasOwnProperty.call(message, "keyControlBlock"))
                    if (!(message.keyControlBlock && typeof message.keyControlBlock.length === "number" || $util.isString(message.keyControlBlock)))
                        return "keyControlBlock: buffer expected";
                if (message.iv != null && $Object.hasOwnProperty.call(message, "iv"))
                    if (!(message.iv && typeof message.iv.length === "number" || $util.isString(message.iv)))
                        return "iv: buffer expected";
                return null;
            };

            /**
             * Creates a KeyControl message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof License.KeyContainer.KeyControl
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {License.KeyContainer.KeyControl} KeyControl
             */
            KeyControl.fromObject = function (object, _depth) {
                if (object instanceof $root.License.KeyContainer.KeyControl)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".License.KeyContainer.KeyControl: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.License.KeyContainer.KeyControl();
                if (object.keyControlBlock != null)
                    if (typeof object.keyControlBlock === "string")
                        $util.base64.decode(object.keyControlBlock, message.keyControlBlock = $util.newBuffer($util.base64.length(object.keyControlBlock)), 0);
                    else if (object.keyControlBlock.length >= 0)
                        message.keyControlBlock = object.keyControlBlock;
                if (object.iv != null)
                    if (typeof object.iv === "string")
                        $util.base64.decode(object.iv, message.iv = $util.newBuffer($util.base64.length(object.iv)), 0);
                    else if (object.iv.length >= 0)
                        message.iv = object.iv;
                return message;
            };

            /**
             * Creates a plain object from a KeyControl message. Also converts values to other types if specified.
             * @function toObject
             * @memberof License.KeyContainer.KeyControl
             * @static
             * @param {License.KeyContainer.KeyControl} message KeyControl
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            KeyControl.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    if (options.bytes === $String)
                        object.keyControlBlock = "";
                    else {
                        object.keyControlBlock = [];
                        if (options.bytes !== $Array)
                            object.keyControlBlock = $util.newBuffer(object.keyControlBlock);
                    }
                    if (options.bytes === $String)
                        object.iv = "";
                    else {
                        object.iv = [];
                        if (options.bytes !== $Array)
                            object.iv = $util.newBuffer(object.iv);
                    }
                }
                if (message.keyControlBlock != null && $Object.hasOwnProperty.call(message, "keyControlBlock"))
                    object.keyControlBlock = options.bytes === $String ? $util.base64.encode(message.keyControlBlock, 0, message.keyControlBlock.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.keyControlBlock) : message.keyControlBlock;
                if (message.iv != null && $Object.hasOwnProperty.call(message, "iv"))
                    object.iv = options.bytes === $String ? $util.base64.encode(message.iv, 0, message.iv.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.iv) : message.iv;
                return object;
            };

            /**
             * Converts this KeyControl to JSON.
             * @function toJSON
             * @memberof License.KeyContainer.KeyControl
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            KeyControl.prototype.toJSON = function() {
                return KeyControl.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for KeyControl
             * @function getTypeUrl
             * @memberof License.KeyContainer.KeyControl
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            KeyControl.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/License.KeyContainer.KeyControl";
            };

            return KeyControl;
        })();

        KeyContainer.OutputProtection = (function() {

            /**
             * Properties of an OutputProtection.
             * @typedef {Object} License.KeyContainer.OutputProtection.$Properties
             * @property {License.KeyContainer.OutputProtection.HDCP|null} [hdcp] OutputProtection hdcp
             * @property {License.KeyContainer.OutputProtection.CGMS|null} [cgmsFlags] OutputProtection cgmsFlags
             * @property {License.KeyContainer.OutputProtection.HdcpSrmRule|null} [hdcpSrmRule] OutputProtection hdcpSrmRule
             * @property {boolean|null} [disableAnalogOutput] OutputProtection disableAnalogOutput
             * @property {boolean|null} [disableDigitalOutput] OutputProtection disableDigitalOutput
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
             */

            /**
             * Properties of an OutputProtection.
             * @memberof License.KeyContainer
             * @interface IOutputProtection
             * @augments License.KeyContainer.OutputProtection.$Properties
             * @deprecated Use License.KeyContainer.OutputProtection.$Properties instead.
             */

            /**
             * Shape of an OutputProtection.
             * @typedef {License.KeyContainer.OutputProtection.$Properties} License.KeyContainer.OutputProtection.$Shape
             */

            /**
             * Constructs a new OutputProtection.
             * @memberof License.KeyContainer
             * @classdesc Represents an OutputProtection.
             * @constructor
             * @param {License.KeyContainer.OutputProtection.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
             */
            const OutputProtection = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

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
             * @param {License.KeyContainer.OutputProtection.$Properties=} [properties] Properties to set
             * @returns {License.KeyContainer.OutputProtection} OutputProtection instance
             * @type {{
             *   (properties: License.KeyContainer.OutputProtection.$Shape): License.KeyContainer.OutputProtection & License.KeyContainer.OutputProtection.$Shape;
             *   (properties?: License.KeyContainer.OutputProtection.$Properties): License.KeyContainer.OutputProtection;
             * }}
             */
            OutputProtection.create = function(properties) {
                return new OutputProtection(properties);
            };

            /**
             * Encodes the specified OutputProtection message. Does not implicitly {@link License.KeyContainer.OutputProtection.verify|verify} messages.
             * @function encode
             * @memberof License.KeyContainer.OutputProtection
             * @static
             * @param {License.KeyContainer.OutputProtection.$Properties} message OutputProtection message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            OutputProtection.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = new $Writer();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.hdcp != null && $Object.hasOwnProperty.call(message, "hdcp"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.hdcp);
                if (message.cgmsFlags != null && $Object.hasOwnProperty.call(message, "cgmsFlags"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int32(message.cgmsFlags);
                if (message.hdcpSrmRule != null && $Object.hasOwnProperty.call(message, "hdcpSrmRule"))
                    writer.uint32(/* id 3, wireType 0 =*/24).int32(message.hdcpSrmRule);
                if (message.disableAnalogOutput != null && $Object.hasOwnProperty.call(message, "disableAnalogOutput"))
                    writer.uint32(/* id 4, wireType 0 =*/32).bool(message.disableAnalogOutput);
                if (message.disableDigitalOutput != null && $Object.hasOwnProperty.call(message, "disableDigitalOutput"))
                    writer.uint32(/* id 5, wireType 0 =*/40).bool(message.disableDigitalOutput);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified OutputProtection message, length delimited. Does not implicitly {@link License.KeyContainer.OutputProtection.verify|verify} messages.
             * @function encodeDelimited
             * @memberof License.KeyContainer.OutputProtection
             * @static
             * @param {License.KeyContainer.OutputProtection.$Properties} message OutputProtection message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            OutputProtection.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes an OutputProtection message from the specified reader or buffer.
             * @function decode
             * @memberof License.KeyContainer.OutputProtection
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {License.KeyContainer.OutputProtection & License.KeyContainer.OutputProtection.$Shape} OutputProtection
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            OutputProtection.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.License.KeyContainer.OutputProtection();
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 0)
                                break;
                            message.hdcp = reader.int32();
                            continue;
                        }
                    case 2: {
                            if (wireType !== 0)
                                break;
                            message.cgmsFlags = reader.int32();
                            continue;
                        }
                    case 3: {
                            if (wireType !== 0)
                                break;
                            message.hdcpSrmRule = reader.int32();
                            continue;
                        }
                    case 4: {
                            if (wireType !== 0)
                                break;
                            message.disableAnalogOutput = reader.bool();
                            continue;
                        }
                    case 5: {
                            if (wireType !== 0)
                                break;
                            message.disableDigitalOutput = reader.bool();
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes an OutputProtection message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof License.KeyContainer.OutputProtection
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {License.KeyContainer.OutputProtection & License.KeyContainer.OutputProtection.$Shape} OutputProtection
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            OutputProtection.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an OutputProtection message.
             * @function verify
             * @memberof License.KeyContainer.OutputProtection
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            OutputProtection.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.hdcp != null && $Object.hasOwnProperty.call(message, "hdcp"))
                    switch (message.hdcp) {
                    default:
                        return "hdcp: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 255:
                        break;
                    }
                if (message.cgmsFlags != null && $Object.hasOwnProperty.call(message, "cgmsFlags"))
                    switch (message.cgmsFlags) {
                    default:
                        return "cgmsFlags: enum value expected";
                    case 42:
                    case 0:
                    case 2:
                    case 3:
                        break;
                    }
                if (message.hdcpSrmRule != null && $Object.hasOwnProperty.call(message, "hdcpSrmRule"))
                    switch (message.hdcpSrmRule) {
                    default:
                        return "hdcpSrmRule: enum value expected";
                    case 0:
                    case 1:
                        break;
                    }
                if (message.disableAnalogOutput != null && $Object.hasOwnProperty.call(message, "disableAnalogOutput"))
                    if (typeof message.disableAnalogOutput !== "boolean")
                        return "disableAnalogOutput: boolean expected";
                if (message.disableDigitalOutput != null && $Object.hasOwnProperty.call(message, "disableDigitalOutput"))
                    if (typeof message.disableDigitalOutput !== "boolean")
                        return "disableDigitalOutput: boolean expected";
                return null;
            };

            /**
             * Creates an OutputProtection message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof License.KeyContainer.OutputProtection
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {License.KeyContainer.OutputProtection} OutputProtection
             */
            OutputProtection.fromObject = function (object, _depth) {
                if (object instanceof $root.License.KeyContainer.OutputProtection)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".License.KeyContainer.OutputProtection: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.License.KeyContainer.OutputProtection();
                switch (object.hdcp) {
                default:
                    if (typeof object.hdcp === "number") {
                        message.hdcp = object.hdcp;
                        break;
                    }
                    break;
                case "HDCP_NONE":
                case 0:
                    message.hdcp = 0;
                    break;
                case "HDCP_V1":
                case 1:
                    message.hdcp = 1;
                    break;
                case "HDCP_V2":
                case 2:
                    message.hdcp = 2;
                    break;
                case "HDCP_V2_1":
                case 3:
                    message.hdcp = 3;
                    break;
                case "HDCP_V2_2":
                case 4:
                    message.hdcp = 4;
                    break;
                case "HDCP_V2_3":
                case 5:
                    message.hdcp = 5;
                    break;
                case "HDCP_NO_DIGITAL_OUTPUT":
                case 255:
                    message.hdcp = 255;
                    break;
                }
                switch (object.cgmsFlags) {
                default:
                    if (typeof object.cgmsFlags === "number") {
                        message.cgmsFlags = object.cgmsFlags;
                        break;
                    }
                    break;
                case "CGMS_NONE":
                case 42:
                    message.cgmsFlags = 42;
                    break;
                case "COPY_FREE":
                case 0:
                    message.cgmsFlags = 0;
                    break;
                case "COPY_ONCE":
                case 2:
                    message.cgmsFlags = 2;
                    break;
                case "COPY_NEVER":
                case 3:
                    message.cgmsFlags = 3;
                    break;
                }
                switch (object.hdcpSrmRule) {
                default:
                    if (typeof object.hdcpSrmRule === "number") {
                        message.hdcpSrmRule = object.hdcpSrmRule;
                        break;
                    }
                    break;
                case "HDCP_SRM_RULE_NONE":
                case 0:
                    message.hdcpSrmRule = 0;
                    break;
                case "CURRENT_SRM":
                case 1:
                    message.hdcpSrmRule = 1;
                    break;
                }
                if (object.disableAnalogOutput != null)
                    message.disableAnalogOutput = $Boolean(object.disableAnalogOutput);
                if (object.disableDigitalOutput != null)
                    message.disableDigitalOutput = $Boolean(object.disableDigitalOutput);
                return message;
            };

            /**
             * Creates a plain object from an OutputProtection message. Also converts values to other types if specified.
             * @function toObject
             * @memberof License.KeyContainer.OutputProtection
             * @static
             * @param {License.KeyContainer.OutputProtection} message OutputProtection
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            OutputProtection.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.hdcp = options.enums === $String ? "HDCP_NONE" : 0;
                    object.cgmsFlags = options.enums === $String ? "CGMS_NONE" : 42;
                    object.hdcpSrmRule = options.enums === $String ? "HDCP_SRM_RULE_NONE" : 0;
                    object.disableAnalogOutput = false;
                    object.disableDigitalOutput = false;
                }
                if (message.hdcp != null && $Object.hasOwnProperty.call(message, "hdcp"))
                    object.hdcp = options.enums === $String ? $root.License.KeyContainer.OutputProtection.HDCP[message.hdcp] === $undefined ? message.hdcp : $root.License.KeyContainer.OutputProtection.HDCP[message.hdcp] : message.hdcp;
                if (message.cgmsFlags != null && $Object.hasOwnProperty.call(message, "cgmsFlags"))
                    object.cgmsFlags = options.enums === $String ? $root.License.KeyContainer.OutputProtection.CGMS[message.cgmsFlags] === $undefined ? message.cgmsFlags : $root.License.KeyContainer.OutputProtection.CGMS[message.cgmsFlags] : message.cgmsFlags;
                if (message.hdcpSrmRule != null && $Object.hasOwnProperty.call(message, "hdcpSrmRule"))
                    object.hdcpSrmRule = options.enums === $String ? $root.License.KeyContainer.OutputProtection.HdcpSrmRule[message.hdcpSrmRule] === $undefined ? message.hdcpSrmRule : $root.License.KeyContainer.OutputProtection.HdcpSrmRule[message.hdcpSrmRule] : message.hdcpSrmRule;
                if (message.disableAnalogOutput != null && $Object.hasOwnProperty.call(message, "disableAnalogOutput"))
                    object.disableAnalogOutput = message.disableAnalogOutput;
                if (message.disableDigitalOutput != null && $Object.hasOwnProperty.call(message, "disableDigitalOutput"))
                    object.disableDigitalOutput = message.disableDigitalOutput;
                return object;
            };

            /**
             * Converts this OutputProtection to JSON.
             * @function toJSON
             * @memberof License.KeyContainer.OutputProtection
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            OutputProtection.prototype.toJSON = function() {
                return OutputProtection.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for OutputProtection
             * @function getTypeUrl
             * @memberof License.KeyContainer.OutputProtection
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            OutputProtection.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/License.KeyContainer.OutputProtection";
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
            OutputProtection.HDCP = (function() {
                const valuesById = {}, values = $Object.create(valuesById);
                values[valuesById[0] = "HDCP_NONE"] = 0;
                values[valuesById[1] = "HDCP_V1"] = 1;
                values[valuesById[2] = "HDCP_V2"] = 2;
                values[valuesById[3] = "HDCP_V2_1"] = 3;
                values[valuesById[4] = "HDCP_V2_2"] = 4;
                values[valuesById[5] = "HDCP_V2_3"] = 5;
                values[valuesById[255] = "HDCP_NO_DIGITAL_OUTPUT"] = 255;
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
            OutputProtection.CGMS = (function() {
                const valuesById = {}, values = $Object.create(valuesById);
                values[valuesById[42] = "CGMS_NONE"] = 42;
                values[valuesById[0] = "COPY_FREE"] = 0;
                values[valuesById[2] = "COPY_ONCE"] = 2;
                values[valuesById[3] = "COPY_NEVER"] = 3;
                return values;
            })();

            /**
             * HdcpSrmRule enum.
             * @name License.KeyContainer.OutputProtection.HdcpSrmRule
             * @enum {number}
             * @property {number} HDCP_SRM_RULE_NONE=0 HDCP_SRM_RULE_NONE value
             * @property {number} CURRENT_SRM=1 CURRENT_SRM value
             */
            OutputProtection.HdcpSrmRule = (function() {
                const valuesById = {}, values = $Object.create(valuesById);
                values[valuesById[0] = "HDCP_SRM_RULE_NONE"] = 0;
                values[valuesById[1] = "CURRENT_SRM"] = 1;
                return values;
            })();

            return OutputProtection;
        })();

        KeyContainer.VideoResolutionConstraint = (function() {

            /**
             * Properties of a VideoResolutionConstraint.
             * @typedef {Object} License.KeyContainer.VideoResolutionConstraint.$Properties
             * @property {number|null} [minResolutionPixels] VideoResolutionConstraint minResolutionPixels
             * @property {number|null} [maxResolutionPixels] VideoResolutionConstraint maxResolutionPixels
             * @property {License.KeyContainer.OutputProtection.$Properties|null} [requiredProtection] VideoResolutionConstraint requiredProtection
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
             */

            /**
             * Properties of a VideoResolutionConstraint.
             * @memberof License.KeyContainer
             * @interface IVideoResolutionConstraint
             * @augments License.KeyContainer.VideoResolutionConstraint.$Properties
             * @deprecated Use License.KeyContainer.VideoResolutionConstraint.$Properties instead.
             */

            /**
             * Shape of a VideoResolutionConstraint.
             * @typedef {License.KeyContainer.VideoResolutionConstraint.$Properties} License.KeyContainer.VideoResolutionConstraint.$Shape
             */

            /**
             * Constructs a new VideoResolutionConstraint.
             * @memberof License.KeyContainer
             * @classdesc Represents a VideoResolutionConstraint.
             * @constructor
             * @param {License.KeyContainer.VideoResolutionConstraint.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
             */
            const VideoResolutionConstraint = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

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
             * @member {License.KeyContainer.OutputProtection.$Properties|null|undefined} requiredProtection
             * @memberof License.KeyContainer.VideoResolutionConstraint
             * @instance
             */
            VideoResolutionConstraint.prototype.requiredProtection = null;

            /**
             * Creates a new VideoResolutionConstraint instance using the specified properties.
             * @function create
             * @memberof License.KeyContainer.VideoResolutionConstraint
             * @static
             * @param {License.KeyContainer.VideoResolutionConstraint.$Properties=} [properties] Properties to set
             * @returns {License.KeyContainer.VideoResolutionConstraint} VideoResolutionConstraint instance
             * @type {{
             *   (properties: License.KeyContainer.VideoResolutionConstraint.$Shape): License.KeyContainer.VideoResolutionConstraint & License.KeyContainer.VideoResolutionConstraint.$Shape;
             *   (properties?: License.KeyContainer.VideoResolutionConstraint.$Properties): License.KeyContainer.VideoResolutionConstraint;
             * }}
             */
            VideoResolutionConstraint.create = function(properties) {
                return new VideoResolutionConstraint(properties);
            };

            /**
             * Encodes the specified VideoResolutionConstraint message. Does not implicitly {@link License.KeyContainer.VideoResolutionConstraint.verify|verify} messages.
             * @function encode
             * @memberof License.KeyContainer.VideoResolutionConstraint
             * @static
             * @param {License.KeyContainer.VideoResolutionConstraint.$Properties} message VideoResolutionConstraint message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            VideoResolutionConstraint.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = new $Writer();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.minResolutionPixels != null && $Object.hasOwnProperty.call(message, "minResolutionPixels"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.minResolutionPixels);
                if (message.maxResolutionPixels != null && $Object.hasOwnProperty.call(message, "maxResolutionPixels"))
                    writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.maxResolutionPixels);
                if (message.requiredProtection != null && $Object.hasOwnProperty.call(message, "requiredProtection"))
                    $root.License.KeyContainer.OutputProtection.encode(message.requiredProtection, writer.uint32(/* id 3, wireType 2 =*/26).fork(), _depth + 1).ldelim();
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified VideoResolutionConstraint message, length delimited. Does not implicitly {@link License.KeyContainer.VideoResolutionConstraint.verify|verify} messages.
             * @function encodeDelimited
             * @memberof License.KeyContainer.VideoResolutionConstraint
             * @static
             * @param {License.KeyContainer.VideoResolutionConstraint.$Properties} message VideoResolutionConstraint message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            VideoResolutionConstraint.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a VideoResolutionConstraint message from the specified reader or buffer.
             * @function decode
             * @memberof License.KeyContainer.VideoResolutionConstraint
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {License.KeyContainer.VideoResolutionConstraint & License.KeyContainer.VideoResolutionConstraint.$Shape} VideoResolutionConstraint
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            VideoResolutionConstraint.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.License.KeyContainer.VideoResolutionConstraint();
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 0)
                                break;
                            message.minResolutionPixels = reader.uint32();
                            continue;
                        }
                    case 2: {
                            if (wireType !== 0)
                                break;
                            message.maxResolutionPixels = reader.uint32();
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            message.requiredProtection = $root.License.KeyContainer.OutputProtection.decode(reader, reader.uint32(), $undefined, _depth + 1, message.requiredProtection);
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes a VideoResolutionConstraint message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof License.KeyContainer.VideoResolutionConstraint
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {License.KeyContainer.VideoResolutionConstraint & License.KeyContainer.VideoResolutionConstraint.$Shape} VideoResolutionConstraint
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            VideoResolutionConstraint.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a VideoResolutionConstraint message.
             * @function verify
             * @memberof License.KeyContainer.VideoResolutionConstraint
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            VideoResolutionConstraint.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.minResolutionPixels != null && $Object.hasOwnProperty.call(message, "minResolutionPixels"))
                    if (!$util.isInteger(message.minResolutionPixels))
                        return "minResolutionPixels: integer expected";
                if (message.maxResolutionPixels != null && $Object.hasOwnProperty.call(message, "maxResolutionPixels"))
                    if (!$util.isInteger(message.maxResolutionPixels))
                        return "maxResolutionPixels: integer expected";
                if (message.requiredProtection != null && $Object.hasOwnProperty.call(message, "requiredProtection")) {
                    let error = $root.License.KeyContainer.OutputProtection.verify(message.requiredProtection, _depth + 1);
                    if (error)
                        return "requiredProtection." + error;
                }
                return null;
            };

            /**
             * Creates a VideoResolutionConstraint message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof License.KeyContainer.VideoResolutionConstraint
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {License.KeyContainer.VideoResolutionConstraint} VideoResolutionConstraint
             */
            VideoResolutionConstraint.fromObject = function (object, _depth) {
                if (object instanceof $root.License.KeyContainer.VideoResolutionConstraint)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".License.KeyContainer.VideoResolutionConstraint: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.License.KeyContainer.VideoResolutionConstraint();
                if (object.minResolutionPixels != null)
                    message.minResolutionPixels = object.minResolutionPixels >>> 0;
                if (object.maxResolutionPixels != null)
                    message.maxResolutionPixels = object.maxResolutionPixels >>> 0;
                if (object.requiredProtection != null) {
                    if (!$util.isObject(object.requiredProtection))
                        throw $TypeError(".License.KeyContainer.VideoResolutionConstraint.requiredProtection: object expected");
                    message.requiredProtection = $root.License.KeyContainer.OutputProtection.fromObject(object.requiredProtection, _depth + 1);
                }
                return message;
            };

            /**
             * Creates a plain object from a VideoResolutionConstraint message. Also converts values to other types if specified.
             * @function toObject
             * @memberof License.KeyContainer.VideoResolutionConstraint
             * @static
             * @param {License.KeyContainer.VideoResolutionConstraint} message VideoResolutionConstraint
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            VideoResolutionConstraint.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.minResolutionPixels = 0;
                    object.maxResolutionPixels = 0;
                    object.requiredProtection = null;
                }
                if (message.minResolutionPixels != null && $Object.hasOwnProperty.call(message, "minResolutionPixels"))
                    object.minResolutionPixels = message.minResolutionPixels;
                if (message.maxResolutionPixels != null && $Object.hasOwnProperty.call(message, "maxResolutionPixels"))
                    object.maxResolutionPixels = message.maxResolutionPixels;
                if (message.requiredProtection != null && $Object.hasOwnProperty.call(message, "requiredProtection"))
                    object.requiredProtection = $root.License.KeyContainer.OutputProtection.toObject(message.requiredProtection, options, _depth + 1);
                return object;
            };

            /**
             * Converts this VideoResolutionConstraint to JSON.
             * @function toJSON
             * @memberof License.KeyContainer.VideoResolutionConstraint
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            VideoResolutionConstraint.prototype.toJSON = function() {
                return VideoResolutionConstraint.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for VideoResolutionConstraint
             * @function getTypeUrl
             * @memberof License.KeyContainer.VideoResolutionConstraint
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            VideoResolutionConstraint.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/License.KeyContainer.VideoResolutionConstraint";
            };

            return VideoResolutionConstraint;
        })();

        KeyContainer.OperatorSessionKeyPermissions = (function() {

            /**
             * Properties of an OperatorSessionKeyPermissions.
             * @typedef {Object} License.KeyContainer.OperatorSessionKeyPermissions.$Properties
             * @property {boolean|null} [allowEncrypt] OperatorSessionKeyPermissions allowEncrypt
             * @property {boolean|null} [allowDecrypt] OperatorSessionKeyPermissions allowDecrypt
             * @property {boolean|null} [allowSign] OperatorSessionKeyPermissions allowSign
             * @property {boolean|null} [allowSignatureVerify] OperatorSessionKeyPermissions allowSignatureVerify
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
             */

            /**
             * Properties of an OperatorSessionKeyPermissions.
             * @memberof License.KeyContainer
             * @interface IOperatorSessionKeyPermissions
             * @augments License.KeyContainer.OperatorSessionKeyPermissions.$Properties
             * @deprecated Use License.KeyContainer.OperatorSessionKeyPermissions.$Properties instead.
             */

            /**
             * Shape of an OperatorSessionKeyPermissions.
             * @typedef {License.KeyContainer.OperatorSessionKeyPermissions.$Properties} License.KeyContainer.OperatorSessionKeyPermissions.$Shape
             */

            /**
             * Constructs a new OperatorSessionKeyPermissions.
             * @memberof License.KeyContainer
             * @classdesc Represents an OperatorSessionKeyPermissions.
             * @constructor
             * @param {License.KeyContainer.OperatorSessionKeyPermissions.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
             */
            const OperatorSessionKeyPermissions = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

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
             * @param {License.KeyContainer.OperatorSessionKeyPermissions.$Properties=} [properties] Properties to set
             * @returns {License.KeyContainer.OperatorSessionKeyPermissions} OperatorSessionKeyPermissions instance
             * @type {{
             *   (properties: License.KeyContainer.OperatorSessionKeyPermissions.$Shape): License.KeyContainer.OperatorSessionKeyPermissions & License.KeyContainer.OperatorSessionKeyPermissions.$Shape;
             *   (properties?: License.KeyContainer.OperatorSessionKeyPermissions.$Properties): License.KeyContainer.OperatorSessionKeyPermissions;
             * }}
             */
            OperatorSessionKeyPermissions.create = function(properties) {
                return new OperatorSessionKeyPermissions(properties);
            };

            /**
             * Encodes the specified OperatorSessionKeyPermissions message. Does not implicitly {@link License.KeyContainer.OperatorSessionKeyPermissions.verify|verify} messages.
             * @function encode
             * @memberof License.KeyContainer.OperatorSessionKeyPermissions
             * @static
             * @param {License.KeyContainer.OperatorSessionKeyPermissions.$Properties} message OperatorSessionKeyPermissions message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            OperatorSessionKeyPermissions.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = new $Writer();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.allowEncrypt != null && $Object.hasOwnProperty.call(message, "allowEncrypt"))
                    writer.uint32(/* id 1, wireType 0 =*/8).bool(message.allowEncrypt);
                if (message.allowDecrypt != null && $Object.hasOwnProperty.call(message, "allowDecrypt"))
                    writer.uint32(/* id 2, wireType 0 =*/16).bool(message.allowDecrypt);
                if (message.allowSign != null && $Object.hasOwnProperty.call(message, "allowSign"))
                    writer.uint32(/* id 3, wireType 0 =*/24).bool(message.allowSign);
                if (message.allowSignatureVerify != null && $Object.hasOwnProperty.call(message, "allowSignatureVerify"))
                    writer.uint32(/* id 4, wireType 0 =*/32).bool(message.allowSignatureVerify);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified OperatorSessionKeyPermissions message, length delimited. Does not implicitly {@link License.KeyContainer.OperatorSessionKeyPermissions.verify|verify} messages.
             * @function encodeDelimited
             * @memberof License.KeyContainer.OperatorSessionKeyPermissions
             * @static
             * @param {License.KeyContainer.OperatorSessionKeyPermissions.$Properties} message OperatorSessionKeyPermissions message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            OperatorSessionKeyPermissions.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes an OperatorSessionKeyPermissions message from the specified reader or buffer.
             * @function decode
             * @memberof License.KeyContainer.OperatorSessionKeyPermissions
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {License.KeyContainer.OperatorSessionKeyPermissions & License.KeyContainer.OperatorSessionKeyPermissions.$Shape} OperatorSessionKeyPermissions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            OperatorSessionKeyPermissions.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.License.KeyContainer.OperatorSessionKeyPermissions();
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 0)
                                break;
                            message.allowEncrypt = reader.bool();
                            continue;
                        }
                    case 2: {
                            if (wireType !== 0)
                                break;
                            message.allowDecrypt = reader.bool();
                            continue;
                        }
                    case 3: {
                            if (wireType !== 0)
                                break;
                            message.allowSign = reader.bool();
                            continue;
                        }
                    case 4: {
                            if (wireType !== 0)
                                break;
                            message.allowSignatureVerify = reader.bool();
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes an OperatorSessionKeyPermissions message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof License.KeyContainer.OperatorSessionKeyPermissions
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {License.KeyContainer.OperatorSessionKeyPermissions & License.KeyContainer.OperatorSessionKeyPermissions.$Shape} OperatorSessionKeyPermissions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            OperatorSessionKeyPermissions.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an OperatorSessionKeyPermissions message.
             * @function verify
             * @memberof License.KeyContainer.OperatorSessionKeyPermissions
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            OperatorSessionKeyPermissions.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.allowEncrypt != null && $Object.hasOwnProperty.call(message, "allowEncrypt"))
                    if (typeof message.allowEncrypt !== "boolean")
                        return "allowEncrypt: boolean expected";
                if (message.allowDecrypt != null && $Object.hasOwnProperty.call(message, "allowDecrypt"))
                    if (typeof message.allowDecrypt !== "boolean")
                        return "allowDecrypt: boolean expected";
                if (message.allowSign != null && $Object.hasOwnProperty.call(message, "allowSign"))
                    if (typeof message.allowSign !== "boolean")
                        return "allowSign: boolean expected";
                if (message.allowSignatureVerify != null && $Object.hasOwnProperty.call(message, "allowSignatureVerify"))
                    if (typeof message.allowSignatureVerify !== "boolean")
                        return "allowSignatureVerify: boolean expected";
                return null;
            };

            /**
             * Creates an OperatorSessionKeyPermissions message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof License.KeyContainer.OperatorSessionKeyPermissions
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {License.KeyContainer.OperatorSessionKeyPermissions} OperatorSessionKeyPermissions
             */
            OperatorSessionKeyPermissions.fromObject = function (object, _depth) {
                if (object instanceof $root.License.KeyContainer.OperatorSessionKeyPermissions)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".License.KeyContainer.OperatorSessionKeyPermissions: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.License.KeyContainer.OperatorSessionKeyPermissions();
                if (object.allowEncrypt != null)
                    message.allowEncrypt = $Boolean(object.allowEncrypt);
                if (object.allowDecrypt != null)
                    message.allowDecrypt = $Boolean(object.allowDecrypt);
                if (object.allowSign != null)
                    message.allowSign = $Boolean(object.allowSign);
                if (object.allowSignatureVerify != null)
                    message.allowSignatureVerify = $Boolean(object.allowSignatureVerify);
                return message;
            };

            /**
             * Creates a plain object from an OperatorSessionKeyPermissions message. Also converts values to other types if specified.
             * @function toObject
             * @memberof License.KeyContainer.OperatorSessionKeyPermissions
             * @static
             * @param {License.KeyContainer.OperatorSessionKeyPermissions} message OperatorSessionKeyPermissions
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            OperatorSessionKeyPermissions.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.allowEncrypt = false;
                    object.allowDecrypt = false;
                    object.allowSign = false;
                    object.allowSignatureVerify = false;
                }
                if (message.allowEncrypt != null && $Object.hasOwnProperty.call(message, "allowEncrypt"))
                    object.allowEncrypt = message.allowEncrypt;
                if (message.allowDecrypt != null && $Object.hasOwnProperty.call(message, "allowDecrypt"))
                    object.allowDecrypt = message.allowDecrypt;
                if (message.allowSign != null && $Object.hasOwnProperty.call(message, "allowSign"))
                    object.allowSign = message.allowSign;
                if (message.allowSignatureVerify != null && $Object.hasOwnProperty.call(message, "allowSignatureVerify"))
                    object.allowSignatureVerify = message.allowSignatureVerify;
                return object;
            };

            /**
             * Converts this OperatorSessionKeyPermissions to JSON.
             * @function toJSON
             * @memberof License.KeyContainer.OperatorSessionKeyPermissions
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            OperatorSessionKeyPermissions.prototype.toJSON = function() {
                return OperatorSessionKeyPermissions.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for OperatorSessionKeyPermissions
             * @function getTypeUrl
             * @memberof License.KeyContainer.OperatorSessionKeyPermissions
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            OperatorSessionKeyPermissions.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/License.KeyContainer.OperatorSessionKeyPermissions";
            };

            return OperatorSessionKeyPermissions;
        })();

        return KeyContainer;
    })();

    return License;
})();

/**
 * ProtocolVersion enum.
 * @name ProtocolVersion
 * @enum {number}
 * @property {number} VERSION_2_0=20 VERSION_2_0 value
 * @property {number} VERSION_2_1=21 VERSION_2_1 value
 * @property {number} VERSION_2_2=22 VERSION_2_2 value
 */
export const ProtocolVersion = $root.ProtocolVersion = (() => {
    const valuesById = {}, values = $Object.create(valuesById);
    values[valuesById[20] = "VERSION_2_0"] = 20;
    values[valuesById[21] = "VERSION_2_1"] = 21;
    values[valuesById[22] = "VERSION_2_2"] = 22;
    return values;
})();

export const LicenseRequest = $root.LicenseRequest = (() => {

    /**
     * Properties of a LicenseRequest.
     * @typedef {Object} LicenseRequest.$Properties
     * @property {ClientIdentification.$Properties|null} [clientId] LicenseRequest clientId
     * @property {LicenseRequest.ContentIdentification.$Properties|null} [contentId] LicenseRequest contentId
     * @property {LicenseRequest.RequestType|null} [type] LicenseRequest type
     * @property {number|Long|null} [requestTime] LicenseRequest requestTime
     * @property {Uint8Array|null} [keyControlNonceDeprecated] LicenseRequest keyControlNonceDeprecated
     * @property {ProtocolVersion|null} [protocolVersion] LicenseRequest protocolVersion
     * @property {number|null} [keyControlNonce] LicenseRequest keyControlNonce
     * @property {EncryptedClientIdentification.$Properties|null} [encryptedClientId] LicenseRequest encryptedClientId
     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
     */

    /**
     * Properties of a LicenseRequest.
     * @exports ILicenseRequest
     * @interface ILicenseRequest
     * @augments LicenseRequest.$Properties
     * @deprecated Use LicenseRequest.$Properties instead.
     */

    /**
     * Shape of a LicenseRequest.
     * @typedef {{
     *   clientId?: ClientIdentification.$Shape|null;
     *   contentId?: LicenseRequest.ContentIdentification.$Shape|null;
     *   type?: LicenseRequest.RequestType|null;
     *   requestTime?: number|Long|null;
     *   keyControlNonceDeprecated?: Uint8Array|null;
     *   protocolVersion?: ProtocolVersion|null;
     *   keyControlNonce?: number|null;
     *   encryptedClientId?: EncryptedClientIdentification.$Shape|null;
     *   $unknowns?: Array.<Uint8Array>;
     * }} LicenseRequest.$Shape
     */

    /**
     * Constructs a new LicenseRequest.
     * @exports LicenseRequest
     * @classdesc Represents a LicenseRequest.
     * @constructor
     * @param {LicenseRequest.$Properties=} [properties] Properties to set
     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
     */
    const LicenseRequest = function (properties) {
        if (properties)
            for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    };

    /**
     * LicenseRequest clientId.
     * @member {ClientIdentification.$Properties|null|undefined} clientId
     * @memberof LicenseRequest
     * @instance
     */
    LicenseRequest.prototype.clientId = null;

    /**
     * LicenseRequest contentId.
     * @member {LicenseRequest.ContentIdentification.$Properties|null|undefined} contentId
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
    LicenseRequest.prototype.requestTime = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

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
     * @member {EncryptedClientIdentification.$Properties|null|undefined} encryptedClientId
     * @memberof LicenseRequest
     * @instance
     */
    LicenseRequest.prototype.encryptedClientId = null;

    /**
     * Creates a new LicenseRequest instance using the specified properties.
     * @function create
     * @memberof LicenseRequest
     * @static
     * @param {LicenseRequest.$Properties=} [properties] Properties to set
     * @returns {LicenseRequest} LicenseRequest instance
     * @type {{
     *   (properties: LicenseRequest.$Shape): LicenseRequest & LicenseRequest.$Shape;
     *   (properties?: LicenseRequest.$Properties): LicenseRequest;
     * }}
     */
    LicenseRequest.create = function(properties) {
        return new LicenseRequest(properties);
    };

    /**
     * Encodes the specified LicenseRequest message. Does not implicitly {@link LicenseRequest.verify|verify} messages.
     * @function encode
     * @memberof LicenseRequest
     * @static
     * @param {LicenseRequest.$Properties} message LicenseRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    LicenseRequest.encode = function (message, writer, _depth) {
        if (!writer)
            writer = new $Writer();
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        if (message.clientId != null && $Object.hasOwnProperty.call(message, "clientId"))
            $root.ClientIdentification.encode(message.clientId, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
        if (message.contentId != null && $Object.hasOwnProperty.call(message, "contentId"))
            $root.LicenseRequest.ContentIdentification.encode(message.contentId, writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim();
        if (message.type != null && $Object.hasOwnProperty.call(message, "type"))
            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.type);
        if (message.requestTime != null && $Object.hasOwnProperty.call(message, "requestTime"))
            writer.uint32(/* id 4, wireType 0 =*/32).int64(message.requestTime);
        if (message.keyControlNonceDeprecated != null && $Object.hasOwnProperty.call(message, "keyControlNonceDeprecated"))
            writer.uint32(/* id 5, wireType 2 =*/42).bytes(message.keyControlNonceDeprecated);
        if (message.protocolVersion != null && $Object.hasOwnProperty.call(message, "protocolVersion"))
            writer.uint32(/* id 6, wireType 0 =*/48).int32(message.protocolVersion);
        if (message.keyControlNonce != null && $Object.hasOwnProperty.call(message, "keyControlNonce"))
            writer.uint32(/* id 7, wireType 0 =*/56).uint32(message.keyControlNonce);
        if (message.encryptedClientId != null && $Object.hasOwnProperty.call(message, "encryptedClientId"))
            $root.EncryptedClientIdentification.encode(message.encryptedClientId, writer.uint32(/* id 8, wireType 2 =*/66).fork(), _depth + 1).ldelim();
        if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    /**
     * Encodes the specified LicenseRequest message, length delimited. Does not implicitly {@link LicenseRequest.verify|verify} messages.
     * @function encodeDelimited
     * @memberof LicenseRequest
     * @static
     * @param {LicenseRequest.$Properties} message LicenseRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    LicenseRequest.encodeDelimited = function(message, writer) {
        return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
    };

    /**
     * Decodes a LicenseRequest message from the specified reader or buffer.
     * @function decode
     * @memberof LicenseRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {LicenseRequest & LicenseRequest.$Shape} LicenseRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    LicenseRequest.decode = function (reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw $Error("max depth exceeded");
        let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.LicenseRequest();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = $undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 2)
                        break;
                    message.clientId = $root.ClientIdentification.decode(reader, reader.uint32(), $undefined, _depth + 1, message.clientId);
                    continue;
                }
            case 2: {
                    if (wireType !== 2)
                        break;
                    message.contentId = $root.LicenseRequest.ContentIdentification.decode(reader, reader.uint32(), $undefined, _depth + 1, message.contentId);
                    continue;
                }
            case 3: {
                    if (wireType !== 0)
                        break;
                    message.type = reader.int32();
                    continue;
                }
            case 4: {
                    if (wireType !== 0)
                        break;
                    message.requestTime = reader.int64();
                    continue;
                }
            case 5: {
                    if (wireType !== 2)
                        break;
                    message.keyControlNonceDeprecated = reader.bytes();
                    continue;
                }
            case 6: {
                    if (wireType !== 0)
                        break;
                    message.protocolVersion = reader.int32();
                    continue;
                }
            case 7: {
                    if (wireType !== 0)
                        break;
                    message.keyControlNonce = reader.uint32();
                    continue;
                }
            case 8: {
                    if (wireType !== 2)
                        break;
                    message.encryptedClientId = $root.EncryptedClientIdentification.decode(reader, reader.uint32(), $undefined, _depth + 1, message.encryptedClientId);
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            if (!reader.discardUnknown) {
                $util.makeProp(message, "$unknowns", false);
                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
            }
        }
        if (_end !== $undefined)
            throw $Error("missing end group");
        return message;
    };

    /**
     * Decodes a LicenseRequest message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof LicenseRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {LicenseRequest & LicenseRequest.$Shape} LicenseRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    LicenseRequest.decodeDelimited = function(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a LicenseRequest message.
     * @function verify
     * @memberof LicenseRequest
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    LicenseRequest.verify = function (message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (message.clientId != null && $Object.hasOwnProperty.call(message, "clientId")) {
            let error = $root.ClientIdentification.verify(message.clientId, _depth + 1);
            if (error)
                return "clientId." + error;
        }
        if (message.contentId != null && $Object.hasOwnProperty.call(message, "contentId")) {
            let error = $root.LicenseRequest.ContentIdentification.verify(message.contentId, _depth + 1);
            if (error)
                return "contentId." + error;
        }
        if (message.type != null && $Object.hasOwnProperty.call(message, "type"))
            switch (message.type) {
            default:
                return "type: enum value expected";
            case 1:
            case 2:
            case 3:
                break;
            }
        if (message.requestTime != null && $Object.hasOwnProperty.call(message, "requestTime"))
            if (!$util.isInteger(message.requestTime) && !(message.requestTime && $util.isInteger(message.requestTime.low) && $util.isInteger(message.requestTime.high)))
                return "requestTime: integer|Long expected";
        if (message.keyControlNonceDeprecated != null && $Object.hasOwnProperty.call(message, "keyControlNonceDeprecated"))
            if (!(message.keyControlNonceDeprecated && typeof message.keyControlNonceDeprecated.length === "number" || $util.isString(message.keyControlNonceDeprecated)))
                return "keyControlNonceDeprecated: buffer expected";
        if (message.protocolVersion != null && $Object.hasOwnProperty.call(message, "protocolVersion"))
            switch (message.protocolVersion) {
            default:
                return "protocolVersion: enum value expected";
            case 20:
            case 21:
            case 22:
                break;
            }
        if (message.keyControlNonce != null && $Object.hasOwnProperty.call(message, "keyControlNonce"))
            if (!$util.isInteger(message.keyControlNonce))
                return "keyControlNonce: integer expected";
        if (message.encryptedClientId != null && $Object.hasOwnProperty.call(message, "encryptedClientId")) {
            let error = $root.EncryptedClientIdentification.verify(message.encryptedClientId, _depth + 1);
            if (error)
                return "encryptedClientId." + error;
        }
        return null;
    };

    /**
     * Creates a LicenseRequest message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof LicenseRequest
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {LicenseRequest} LicenseRequest
     */
    LicenseRequest.fromObject = function (object, _depth) {
        if (object instanceof $root.LicenseRequest)
            return object;
        if (!$util.isObject(object))
            throw $TypeError(".LicenseRequest: object expected");
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        let message = new $root.LicenseRequest();
        if (object.clientId != null) {
            if (!$util.isObject(object.clientId))
                throw $TypeError(".LicenseRequest.clientId: object expected");
            message.clientId = $root.ClientIdentification.fromObject(object.clientId, _depth + 1);
        }
        if (object.contentId != null) {
            if (!$util.isObject(object.contentId))
                throw $TypeError(".LicenseRequest.contentId: object expected");
            message.contentId = $root.LicenseRequest.ContentIdentification.fromObject(object.contentId, _depth + 1);
        }
        switch (object.type) {
        default:
            if (typeof object.type === "number") {
                message.type = object.type;
                break;
            }
            break;
        case "NEW":
        case 1:
            message.type = 1;
            break;
        case "RENEWAL":
        case 2:
            message.type = 2;
            break;
        case "RELEASE":
        case 3:
            message.type = 3;
            break;
        }
        if (object.requestTime != null)
            if ($util.Long)
                message.requestTime = $util.Long.fromValue(object.requestTime, false);
            else if (typeof object.requestTime === "string")
                message.requestTime = $parseInt(object.requestTime, 10);
            else if (typeof object.requestTime === "number")
                message.requestTime = object.requestTime;
            else if (typeof object.requestTime === "object")
                message.requestTime = new $util.LongBits(object.requestTime.low >>> 0, object.requestTime.high >>> 0).toNumber();
        if (object.keyControlNonceDeprecated != null)
            if (typeof object.keyControlNonceDeprecated === "string")
                $util.base64.decode(object.keyControlNonceDeprecated, message.keyControlNonceDeprecated = $util.newBuffer($util.base64.length(object.keyControlNonceDeprecated)), 0);
            else if (object.keyControlNonceDeprecated.length >= 0)
                message.keyControlNonceDeprecated = object.keyControlNonceDeprecated;
        switch (object.protocolVersion) {
        default:
            if (typeof object.protocolVersion === "number") {
                message.protocolVersion = object.protocolVersion;
                break;
            }
            break;
        case "VERSION_2_0":
        case 20:
            message.protocolVersion = 20;
            break;
        case "VERSION_2_1":
        case 21:
            message.protocolVersion = 21;
            break;
        case "VERSION_2_2":
        case 22:
            message.protocolVersion = 22;
            break;
        }
        if (object.keyControlNonce != null)
            message.keyControlNonce = object.keyControlNonce >>> 0;
        if (object.encryptedClientId != null) {
            if (!$util.isObject(object.encryptedClientId))
                throw $TypeError(".LicenseRequest.encryptedClientId: object expected");
            message.encryptedClientId = $root.EncryptedClientIdentification.fromObject(object.encryptedClientId, _depth + 1);
        }
        return message;
    };

    /**
     * Creates a plain object from a LicenseRequest message. Also converts values to other types if specified.
     * @function toObject
     * @memberof LicenseRequest
     * @static
     * @param {LicenseRequest} message LicenseRequest
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    LicenseRequest.toObject = function (message, options, _depth) {
        if (!options)
            options = {};
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        let object = {};
        if (options.defaults) {
            object.clientId = null;
            object.contentId = null;
            object.type = options.enums === $String ? "NEW" : 1;
            if ($util.Long) {
                let long = new $util.Long(0, 0, false);
                object.requestTime = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
            } else
                object.requestTime = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
            if (options.bytes === $String)
                object.keyControlNonceDeprecated = "";
            else {
                object.keyControlNonceDeprecated = [];
                if (options.bytes !== $Array)
                    object.keyControlNonceDeprecated = $util.newBuffer(object.keyControlNonceDeprecated);
            }
            object.protocolVersion = options.enums === $String ? "VERSION_2_0" : 20;
            object.keyControlNonce = 0;
            object.encryptedClientId = null;
        }
        if (message.clientId != null && $Object.hasOwnProperty.call(message, "clientId"))
            object.clientId = $root.ClientIdentification.toObject(message.clientId, options, _depth + 1);
        if (message.contentId != null && $Object.hasOwnProperty.call(message, "contentId"))
            object.contentId = $root.LicenseRequest.ContentIdentification.toObject(message.contentId, options, _depth + 1);
        if (message.type != null && $Object.hasOwnProperty.call(message, "type"))
            object.type = options.enums === $String ? $root.LicenseRequest.RequestType[message.type] === $undefined ? message.type : $root.LicenseRequest.RequestType[message.type] : message.type;
        if (message.requestTime != null && $Object.hasOwnProperty.call(message, "requestTime"))
            if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                object.requestTime = typeof message.requestTime === "number" ? $BigInt(message.requestTime) : $util.Long.fromBits(message.requestTime.low >>> 0, message.requestTime.high >>> 0, false).toBigInt();
            else if (typeof message.requestTime === "number")
                object.requestTime = options.longs === $String ? $String(message.requestTime) : message.requestTime;
            else
                object.requestTime = options.longs === $String ? $util.Long.prototype.toString.call(message.requestTime) : options.longs === $Number ? new $util.LongBits(message.requestTime.low >>> 0, message.requestTime.high >>> 0).toNumber() : message.requestTime;
        if (message.keyControlNonceDeprecated != null && $Object.hasOwnProperty.call(message, "keyControlNonceDeprecated"))
            object.keyControlNonceDeprecated = options.bytes === $String ? $util.base64.encode(message.keyControlNonceDeprecated, 0, message.keyControlNonceDeprecated.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.keyControlNonceDeprecated) : message.keyControlNonceDeprecated;
        if (message.protocolVersion != null && $Object.hasOwnProperty.call(message, "protocolVersion"))
            object.protocolVersion = options.enums === $String ? $root.ProtocolVersion[message.protocolVersion] === $undefined ? message.protocolVersion : $root.ProtocolVersion[message.protocolVersion] : message.protocolVersion;
        if (message.keyControlNonce != null && $Object.hasOwnProperty.call(message, "keyControlNonce"))
            object.keyControlNonce = message.keyControlNonce;
        if (message.encryptedClientId != null && $Object.hasOwnProperty.call(message, "encryptedClientId"))
            object.encryptedClientId = $root.EncryptedClientIdentification.toObject(message.encryptedClientId, options, _depth + 1);
        return object;
    };

    /**
     * Converts this LicenseRequest to JSON.
     * @function toJSON
     * @memberof LicenseRequest
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    LicenseRequest.prototype.toJSON = function() {
        return LicenseRequest.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the type url for LicenseRequest
     * @function getTypeUrl
     * @memberof LicenseRequest
     * @static
     * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns {string} The type url
     */
    LicenseRequest.getTypeUrl = function(prefix) {
        if (prefix === $undefined)
            prefix = "type.googleapis.com";
        return prefix + "/LicenseRequest";
    };

    LicenseRequest.ContentIdentification = (function() {

        /**
         * Properties of a ContentIdentification.
         * @typedef {Object} LicenseRequest.ContentIdentification.$Properties
         * @property {LicenseRequest.ContentIdentification.WidevinePsshData.$Properties|null} [widevinePsshData] ContentIdentification widevinePsshData
         * @property {LicenseRequest.ContentIdentification.WebmKeyId.$Properties|null} [webmKeyId] ContentIdentification webmKeyId
         * @property {LicenseRequest.ContentIdentification.ExistingLicense.$Properties|null} [existingLicense] ContentIdentification existingLicense
         * @property {LicenseRequest.ContentIdentification.InitData.$Properties|null} [initData] ContentIdentification initData
         * @property {"widevinePsshData"|"webmKeyId"|"existingLicense"|"initData"} [contentIdVariant] ContentIdentification contentIdVariant
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */

        /**
         * Properties of a ContentIdentification.
         * @memberof LicenseRequest
         * @interface IContentIdentification
         * @augments LicenseRequest.ContentIdentification.$Properties
         * @deprecated Use LicenseRequest.ContentIdentification.$Properties instead.
         */

        /**
         * Narrowed shape of a ContentIdentification.
         * @typedef {{
         *   widevinePsshData?: LicenseRequest.ContentIdentification.WidevinePsshData.$Shape|null;
         *   webmKeyId?: LicenseRequest.ContentIdentification.WebmKeyId.$Shape|null;
         *   existingLicense?: LicenseRequest.ContentIdentification.ExistingLicense.$Shape|null;
         *   initData?: LicenseRequest.ContentIdentification.InitData.$Shape|null;
         *   $unknowns?: Array.<Uint8Array>;
         * } & (
         *   ({ contentIdVariant?: undefined; widevinePsshData?: null; webmKeyId?: null; existingLicense?: null; initData?: null }|{ contentIdVariant?: "widevinePsshData"; widevinePsshData: LicenseRequest.ContentIdentification.WidevinePsshData.$Shape; webmKeyId?: null; existingLicense?: null; initData?: null }|{ contentIdVariant?: "webmKeyId"; widevinePsshData?: null; webmKeyId: LicenseRequest.ContentIdentification.WebmKeyId.$Shape; existingLicense?: null; initData?: null }|{ contentIdVariant?: "existingLicense"; widevinePsshData?: null; webmKeyId?: null; existingLicense: LicenseRequest.ContentIdentification.ExistingLicense.$Shape; initData?: null }|{ contentIdVariant?: "initData"; widevinePsshData?: null; webmKeyId?: null; existingLicense?: null; initData: LicenseRequest.ContentIdentification.InitData.$Shape })
         * )} LicenseRequest.ContentIdentification.$Shape
         */

        /**
         * Constructs a new ContentIdentification.
         * @memberof LicenseRequest
         * @classdesc Represents a ContentIdentification.
         * @constructor
         * @param {LicenseRequest.ContentIdentification.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */
        const ContentIdentification = function (properties) {
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * ContentIdentification widevinePsshData.
         * @member {LicenseRequest.ContentIdentification.WidevinePsshData.$Properties|null|undefined} widevinePsshData
         * @memberof LicenseRequest.ContentIdentification
         * @instance
         */
        ContentIdentification.prototype.widevinePsshData = null;

        /**
         * ContentIdentification webmKeyId.
         * @member {LicenseRequest.ContentIdentification.WebmKeyId.$Properties|null|undefined} webmKeyId
         * @memberof LicenseRequest.ContentIdentification
         * @instance
         */
        ContentIdentification.prototype.webmKeyId = null;

        /**
         * ContentIdentification existingLicense.
         * @member {LicenseRequest.ContentIdentification.ExistingLicense.$Properties|null|undefined} existingLicense
         * @memberof LicenseRequest.ContentIdentification
         * @instance
         */
        ContentIdentification.prototype.existingLicense = null;

        /**
         * ContentIdentification initData.
         * @member {LicenseRequest.ContentIdentification.InitData.$Properties|null|undefined} initData
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
        $Object.defineProperty(ContentIdentification.prototype, "contentIdVariant", {
            get: $util.oneOfGetter($oneOfFields = ["widevinePsshData", "webmKeyId", "existingLicense", "initData"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new ContentIdentification instance using the specified properties.
         * @function create
         * @memberof LicenseRequest.ContentIdentification
         * @static
         * @param {LicenseRequest.ContentIdentification.$Properties=} [properties] Properties to set
         * @returns {LicenseRequest.ContentIdentification} ContentIdentification instance
         * @type {{
         *   (properties: LicenseRequest.ContentIdentification.$Shape): LicenseRequest.ContentIdentification & LicenseRequest.ContentIdentification.$Shape;
         *   (properties?: LicenseRequest.ContentIdentification.$Properties): LicenseRequest.ContentIdentification;
         * }}
         */
        ContentIdentification.create = function(properties) {
            return new ContentIdentification(properties);
        };

        /**
         * Encodes the specified ContentIdentification message. Does not implicitly {@link LicenseRequest.ContentIdentification.verify|verify} messages.
         * @function encode
         * @memberof LicenseRequest.ContentIdentification
         * @static
         * @param {LicenseRequest.ContentIdentification.$Properties} message ContentIdentification message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ContentIdentification.encode = function (message, writer, _depth) {
            if (!writer)
                writer = new $Writer();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.widevinePsshData != null && $Object.hasOwnProperty.call(message, "widevinePsshData"))
                $root.LicenseRequest.ContentIdentification.WidevinePsshData.encode(message.widevinePsshData, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
            if (message.webmKeyId != null && $Object.hasOwnProperty.call(message, "webmKeyId"))
                $root.LicenseRequest.ContentIdentification.WebmKeyId.encode(message.webmKeyId, writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim();
            if (message.existingLicense != null && $Object.hasOwnProperty.call(message, "existingLicense"))
                $root.LicenseRequest.ContentIdentification.ExistingLicense.encode(message.existingLicense, writer.uint32(/* id 3, wireType 2 =*/26).fork(), _depth + 1).ldelim();
            if (message.initData != null && $Object.hasOwnProperty.call(message, "initData"))
                $root.LicenseRequest.ContentIdentification.InitData.encode(message.initData, writer.uint32(/* id 4, wireType 2 =*/34).fork(), _depth + 1).ldelim();
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified ContentIdentification message, length delimited. Does not implicitly {@link LicenseRequest.ContentIdentification.verify|verify} messages.
         * @function encodeDelimited
         * @memberof LicenseRequest.ContentIdentification
         * @static
         * @param {LicenseRequest.ContentIdentification.$Properties} message ContentIdentification message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ContentIdentification.encodeDelimited = function(message, writer) {
            return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
        };

        /**
         * Decodes a ContentIdentification message from the specified reader or buffer.
         * @function decode
         * @memberof LicenseRequest.ContentIdentification
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {LicenseRequest.ContentIdentification & LicenseRequest.ContentIdentification.$Shape} ContentIdentification
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ContentIdentification.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.LicenseRequest.ContentIdentification();
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        message.widevinePsshData = $root.LicenseRequest.ContentIdentification.WidevinePsshData.decode(reader, reader.uint32(), $undefined, _depth + 1, message.widevinePsshData);
                        message.contentIdVariant = "widevinePsshData";
                        continue;
                    }
                case 2: {
                        if (wireType !== 2)
                            break;
                        message.webmKeyId = $root.LicenseRequest.ContentIdentification.WebmKeyId.decode(reader, reader.uint32(), $undefined, _depth + 1, message.webmKeyId);
                        message.contentIdVariant = "webmKeyId";
                        continue;
                    }
                case 3: {
                        if (wireType !== 2)
                            break;
                        message.existingLicense = $root.LicenseRequest.ContentIdentification.ExistingLicense.decode(reader, reader.uint32(), $undefined, _depth + 1, message.existingLicense);
                        message.contentIdVariant = "existingLicense";
                        continue;
                    }
                case 4: {
                        if (wireType !== 2)
                            break;
                        message.initData = $root.LicenseRequest.ContentIdentification.InitData.decode(reader, reader.uint32(), $undefined, _depth + 1, message.initData);
                        message.contentIdVariant = "initData";
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Decodes a ContentIdentification message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof LicenseRequest.ContentIdentification
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {LicenseRequest.ContentIdentification & LicenseRequest.ContentIdentification.$Shape} ContentIdentification
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ContentIdentification.decodeDelimited = function(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ContentIdentification message.
         * @function verify
         * @memberof LicenseRequest.ContentIdentification
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ContentIdentification.verify = function (message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            let properties = {};
            if (message.widevinePsshData != null && $Object.hasOwnProperty.call(message, "widevinePsshData")) {
                properties.contentIdVariant = 1;
                {
                    let error = $root.LicenseRequest.ContentIdentification.WidevinePsshData.verify(message.widevinePsshData, _depth + 1);
                    if (error)
                        return "widevinePsshData." + error;
                }
            }
            if (message.webmKeyId != null && $Object.hasOwnProperty.call(message, "webmKeyId")) {
                if (properties.contentIdVariant === 1)
                    return "contentIdVariant: multiple values";
                properties.contentIdVariant = 1;
                {
                    let error = $root.LicenseRequest.ContentIdentification.WebmKeyId.verify(message.webmKeyId, _depth + 1);
                    if (error)
                        return "webmKeyId." + error;
                }
            }
            if (message.existingLicense != null && $Object.hasOwnProperty.call(message, "existingLicense")) {
                if (properties.contentIdVariant === 1)
                    return "contentIdVariant: multiple values";
                properties.contentIdVariant = 1;
                {
                    let error = $root.LicenseRequest.ContentIdentification.ExistingLicense.verify(message.existingLicense, _depth + 1);
                    if (error)
                        return "existingLicense." + error;
                }
            }
            if (message.initData != null && $Object.hasOwnProperty.call(message, "initData")) {
                if (properties.contentIdVariant === 1)
                    return "contentIdVariant: multiple values";
                properties.contentIdVariant = 1;
                {
                    let error = $root.LicenseRequest.ContentIdentification.InitData.verify(message.initData, _depth + 1);
                    if (error)
                        return "initData." + error;
                }
            }
            return null;
        };

        /**
         * Creates a ContentIdentification message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof LicenseRequest.ContentIdentification
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {LicenseRequest.ContentIdentification} ContentIdentification
         */
        ContentIdentification.fromObject = function (object, _depth) {
            if (object instanceof $root.LicenseRequest.ContentIdentification)
                return object;
            if (!$util.isObject(object))
                throw $TypeError(".LicenseRequest.ContentIdentification: object expected");
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let message = new $root.LicenseRequest.ContentIdentification();
            if (object.widevinePsshData != null) {
                if (!$util.isObject(object.widevinePsshData))
                    throw $TypeError(".LicenseRequest.ContentIdentification.widevinePsshData: object expected");
                message.widevinePsshData = $root.LicenseRequest.ContentIdentification.WidevinePsshData.fromObject(object.widevinePsshData, _depth + 1);
            }
            if (object.webmKeyId != null) {
                if (!$util.isObject(object.webmKeyId))
                    throw $TypeError(".LicenseRequest.ContentIdentification.webmKeyId: object expected");
                message.webmKeyId = $root.LicenseRequest.ContentIdentification.WebmKeyId.fromObject(object.webmKeyId, _depth + 1);
            }
            if (object.existingLicense != null) {
                if (!$util.isObject(object.existingLicense))
                    throw $TypeError(".LicenseRequest.ContentIdentification.existingLicense: object expected");
                message.existingLicense = $root.LicenseRequest.ContentIdentification.ExistingLicense.fromObject(object.existingLicense, _depth + 1);
            }
            if (object.initData != null) {
                if (!$util.isObject(object.initData))
                    throw $TypeError(".LicenseRequest.ContentIdentification.initData: object expected");
                message.initData = $root.LicenseRequest.ContentIdentification.InitData.fromObject(object.initData, _depth + 1);
            }
            return message;
        };

        /**
         * Creates a plain object from a ContentIdentification message. Also converts values to other types if specified.
         * @function toObject
         * @memberof LicenseRequest.ContentIdentification
         * @static
         * @param {LicenseRequest.ContentIdentification} message ContentIdentification
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ContentIdentification.toObject = function (message, options, _depth) {
            if (!options)
                options = {};
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let object = {};
            if (message.widevinePsshData != null && $Object.hasOwnProperty.call(message, "widevinePsshData")) {
                object.widevinePsshData = $root.LicenseRequest.ContentIdentification.WidevinePsshData.toObject(message.widevinePsshData, options, _depth + 1);
                if (options.oneofs)
                    object.contentIdVariant = "widevinePsshData";
            }
            if (message.webmKeyId != null && $Object.hasOwnProperty.call(message, "webmKeyId")) {
                object.webmKeyId = $root.LicenseRequest.ContentIdentification.WebmKeyId.toObject(message.webmKeyId, options, _depth + 1);
                if (options.oneofs)
                    object.contentIdVariant = "webmKeyId";
            }
            if (message.existingLicense != null && $Object.hasOwnProperty.call(message, "existingLicense")) {
                object.existingLicense = $root.LicenseRequest.ContentIdentification.ExistingLicense.toObject(message.existingLicense, options, _depth + 1);
                if (options.oneofs)
                    object.contentIdVariant = "existingLicense";
            }
            if (message.initData != null && $Object.hasOwnProperty.call(message, "initData")) {
                object.initData = $root.LicenseRequest.ContentIdentification.InitData.toObject(message.initData, options, _depth + 1);
                if (options.oneofs)
                    object.contentIdVariant = "initData";
            }
            return object;
        };

        /**
         * Converts this ContentIdentification to JSON.
         * @function toJSON
         * @memberof LicenseRequest.ContentIdentification
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ContentIdentification.prototype.toJSON = function() {
            return ContentIdentification.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for ContentIdentification
         * @function getTypeUrl
         * @memberof LicenseRequest.ContentIdentification
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        ContentIdentification.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/LicenseRequest.ContentIdentification";
        };

        ContentIdentification.WidevinePsshData = (function() {

            /**
             * Properties of a WidevinePsshData.
             * @typedef {Object} LicenseRequest.ContentIdentification.WidevinePsshData.$Properties
             * @property {Array.<Uint8Array>|null} [psshData] WidevinePsshData psshData
             * @property {LicenseType|null} [licenseType] WidevinePsshData licenseType
             * @property {Uint8Array|null} [requestId] WidevinePsshData requestId
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
             */

            /**
             * Properties of a WidevinePsshData.
             * @memberof LicenseRequest.ContentIdentification
             * @interface IWidevinePsshData
             * @augments LicenseRequest.ContentIdentification.WidevinePsshData.$Properties
             * @deprecated Use LicenseRequest.ContentIdentification.WidevinePsshData.$Properties instead.
             */

            /**
             * Shape of a WidevinePsshData.
             * @typedef {LicenseRequest.ContentIdentification.WidevinePsshData.$Properties} LicenseRequest.ContentIdentification.WidevinePsshData.$Shape
             */

            /**
             * Constructs a new WidevinePsshData.
             * @memberof LicenseRequest.ContentIdentification
             * @classdesc Represents a WidevinePsshData.
             * @constructor
             * @param {LicenseRequest.ContentIdentification.WidevinePsshData.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
             */
            const WidevinePsshData = function (properties) {
                this.psshData = [];
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

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
             * @param {LicenseRequest.ContentIdentification.WidevinePsshData.$Properties=} [properties] Properties to set
             * @returns {LicenseRequest.ContentIdentification.WidevinePsshData} WidevinePsshData instance
             * @type {{
             *   (properties: LicenseRequest.ContentIdentification.WidevinePsshData.$Shape): LicenseRequest.ContentIdentification.WidevinePsshData & LicenseRequest.ContentIdentification.WidevinePsshData.$Shape;
             *   (properties?: LicenseRequest.ContentIdentification.WidevinePsshData.$Properties): LicenseRequest.ContentIdentification.WidevinePsshData;
             * }}
             */
            WidevinePsshData.create = function(properties) {
                return new WidevinePsshData(properties);
            };

            /**
             * Encodes the specified WidevinePsshData message. Does not implicitly {@link LicenseRequest.ContentIdentification.WidevinePsshData.verify|verify} messages.
             * @function encode
             * @memberof LicenseRequest.ContentIdentification.WidevinePsshData
             * @static
             * @param {LicenseRequest.ContentIdentification.WidevinePsshData.$Properties} message WidevinePsshData message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            WidevinePsshData.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = new $Writer();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.psshData != null && message.psshData.length)
                    for (let i = 0; i < message.psshData.length; ++i)
                        writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.psshData[i]);
                if (message.licenseType != null && $Object.hasOwnProperty.call(message, "licenseType"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int32(message.licenseType);
                if (message.requestId != null && $Object.hasOwnProperty.call(message, "requestId"))
                    writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.requestId);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified WidevinePsshData message, length delimited. Does not implicitly {@link LicenseRequest.ContentIdentification.WidevinePsshData.verify|verify} messages.
             * @function encodeDelimited
             * @memberof LicenseRequest.ContentIdentification.WidevinePsshData
             * @static
             * @param {LicenseRequest.ContentIdentification.WidevinePsshData.$Properties} message WidevinePsshData message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            WidevinePsshData.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a WidevinePsshData message from the specified reader or buffer.
             * @function decode
             * @memberof LicenseRequest.ContentIdentification.WidevinePsshData
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {LicenseRequest.ContentIdentification.WidevinePsshData & LicenseRequest.ContentIdentification.WidevinePsshData.$Shape} WidevinePsshData
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            WidevinePsshData.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.LicenseRequest.ContentIdentification.WidevinePsshData();
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if (!(message.psshData && message.psshData.length))
                                message.psshData = [];
                            message.psshData.push(reader.bytes());
                            continue;
                        }
                    case 2: {
                            if (wireType !== 0)
                                break;
                            message.licenseType = reader.int32();
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            message.requestId = reader.bytes();
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes a WidevinePsshData message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof LicenseRequest.ContentIdentification.WidevinePsshData
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {LicenseRequest.ContentIdentification.WidevinePsshData & LicenseRequest.ContentIdentification.WidevinePsshData.$Shape} WidevinePsshData
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            WidevinePsshData.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a WidevinePsshData message.
             * @function verify
             * @memberof LicenseRequest.ContentIdentification.WidevinePsshData
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            WidevinePsshData.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.psshData != null && $Object.hasOwnProperty.call(message, "psshData")) {
                    if (!$Array.isArray(message.psshData))
                        return "psshData: array expected";
                    for (let i = 0; i < message.psshData.length; ++i)
                        if (!(message.psshData[i] && typeof message.psshData[i].length === "number" || $util.isString(message.psshData[i])))
                            return "psshData: buffer[] expected";
                }
                if (message.licenseType != null && $Object.hasOwnProperty.call(message, "licenseType"))
                    switch (message.licenseType) {
                    default:
                        return "licenseType: enum value expected";
                    case 1:
                    case 2:
                    case 3:
                        break;
                    }
                if (message.requestId != null && $Object.hasOwnProperty.call(message, "requestId"))
                    if (!(message.requestId && typeof message.requestId.length === "number" || $util.isString(message.requestId)))
                        return "requestId: buffer expected";
                return null;
            };

            /**
             * Creates a WidevinePsshData message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof LicenseRequest.ContentIdentification.WidevinePsshData
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {LicenseRequest.ContentIdentification.WidevinePsshData} WidevinePsshData
             */
            WidevinePsshData.fromObject = function (object, _depth) {
                if (object instanceof $root.LicenseRequest.ContentIdentification.WidevinePsshData)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".LicenseRequest.ContentIdentification.WidevinePsshData: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.LicenseRequest.ContentIdentification.WidevinePsshData();
                if (object.psshData) {
                    if (!$Array.isArray(object.psshData))
                        throw $TypeError(".LicenseRequest.ContentIdentification.WidevinePsshData.psshData: array expected");
                    message.psshData = $Array(object.psshData.length);
                    for (let i = 0; i < object.psshData.length; ++i)
                        if (typeof object.psshData[i] === "string")
                            $util.base64.decode(object.psshData[i], message.psshData[i] = $util.newBuffer($util.base64.length(object.psshData[i])), 0);
                        else if (object.psshData[i].length >= 0)
                            message.psshData[i] = object.psshData[i];
                }
                switch (object.licenseType) {
                default:
                    if (typeof object.licenseType === "number") {
                        message.licenseType = object.licenseType;
                        break;
                    }
                    break;
                case "STREAMING":
                case 1:
                    message.licenseType = 1;
                    break;
                case "OFFLINE":
                case 2:
                    message.licenseType = 2;
                    break;
                case "AUTOMATIC":
                case 3:
                    message.licenseType = 3;
                    break;
                }
                if (object.requestId != null)
                    if (typeof object.requestId === "string")
                        $util.base64.decode(object.requestId, message.requestId = $util.newBuffer($util.base64.length(object.requestId)), 0);
                    else if (object.requestId.length >= 0)
                        message.requestId = object.requestId;
                return message;
            };

            /**
             * Creates a plain object from a WidevinePsshData message. Also converts values to other types if specified.
             * @function toObject
             * @memberof LicenseRequest.ContentIdentification.WidevinePsshData
             * @static
             * @param {LicenseRequest.ContentIdentification.WidevinePsshData} message WidevinePsshData
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            WidevinePsshData.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.arrays || options.defaults)
                    object.psshData = [];
                if (options.defaults) {
                    object.licenseType = options.enums === $String ? "STREAMING" : 1;
                    if (options.bytes === $String)
                        object.requestId = "";
                    else {
                        object.requestId = [];
                        if (options.bytes !== $Array)
                            object.requestId = $util.newBuffer(object.requestId);
                    }
                }
                if (message.psshData && message.psshData.length) {
                    object.psshData = $Array(message.psshData.length);
                    for (let j = 0; j < message.psshData.length; ++j)
                        object.psshData[j] = options.bytes === $String ? $util.base64.encode(message.psshData[j], 0, message.psshData[j].length) : options.bytes === $Array ? $Array.prototype.slice.call(message.psshData[j]) : message.psshData[j];
                }
                if (message.licenseType != null && $Object.hasOwnProperty.call(message, "licenseType"))
                    object.licenseType = options.enums === $String ? $root.LicenseType[message.licenseType] === $undefined ? message.licenseType : $root.LicenseType[message.licenseType] : message.licenseType;
                if (message.requestId != null && $Object.hasOwnProperty.call(message, "requestId"))
                    object.requestId = options.bytes === $String ? $util.base64.encode(message.requestId, 0, message.requestId.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.requestId) : message.requestId;
                return object;
            };

            /**
             * Converts this WidevinePsshData to JSON.
             * @function toJSON
             * @memberof LicenseRequest.ContentIdentification.WidevinePsshData
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            WidevinePsshData.prototype.toJSON = function() {
                return WidevinePsshData.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for WidevinePsshData
             * @function getTypeUrl
             * @memberof LicenseRequest.ContentIdentification.WidevinePsshData
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            WidevinePsshData.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/LicenseRequest.ContentIdentification.WidevinePsshData";
            };

            return WidevinePsshData;
        })();

        ContentIdentification.WebmKeyId = (function() {

            /**
             * Properties of a WebmKeyId.
             * @typedef {Object} LicenseRequest.ContentIdentification.WebmKeyId.$Properties
             * @property {Uint8Array|null} [header] WebmKeyId header
             * @property {LicenseType|null} [licenseType] WebmKeyId licenseType
             * @property {Uint8Array|null} [requestId] WebmKeyId requestId
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
             */

            /**
             * Properties of a WebmKeyId.
             * @memberof LicenseRequest.ContentIdentification
             * @interface IWebmKeyId
             * @augments LicenseRequest.ContentIdentification.WebmKeyId.$Properties
             * @deprecated Use LicenseRequest.ContentIdentification.WebmKeyId.$Properties instead.
             */

            /**
             * Shape of a WebmKeyId.
             * @typedef {LicenseRequest.ContentIdentification.WebmKeyId.$Properties} LicenseRequest.ContentIdentification.WebmKeyId.$Shape
             */

            /**
             * Constructs a new WebmKeyId.
             * @memberof LicenseRequest.ContentIdentification
             * @classdesc Represents a WebmKeyId.
             * @constructor
             * @param {LicenseRequest.ContentIdentification.WebmKeyId.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
             */
            const WebmKeyId = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

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
             * @param {LicenseRequest.ContentIdentification.WebmKeyId.$Properties=} [properties] Properties to set
             * @returns {LicenseRequest.ContentIdentification.WebmKeyId} WebmKeyId instance
             * @type {{
             *   (properties: LicenseRequest.ContentIdentification.WebmKeyId.$Shape): LicenseRequest.ContentIdentification.WebmKeyId & LicenseRequest.ContentIdentification.WebmKeyId.$Shape;
             *   (properties?: LicenseRequest.ContentIdentification.WebmKeyId.$Properties): LicenseRequest.ContentIdentification.WebmKeyId;
             * }}
             */
            WebmKeyId.create = function(properties) {
                return new WebmKeyId(properties);
            };

            /**
             * Encodes the specified WebmKeyId message. Does not implicitly {@link LicenseRequest.ContentIdentification.WebmKeyId.verify|verify} messages.
             * @function encode
             * @memberof LicenseRequest.ContentIdentification.WebmKeyId
             * @static
             * @param {LicenseRequest.ContentIdentification.WebmKeyId.$Properties} message WebmKeyId message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            WebmKeyId.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = new $Writer();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.header != null && $Object.hasOwnProperty.call(message, "header"))
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.header);
                if (message.licenseType != null && $Object.hasOwnProperty.call(message, "licenseType"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int32(message.licenseType);
                if (message.requestId != null && $Object.hasOwnProperty.call(message, "requestId"))
                    writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.requestId);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified WebmKeyId message, length delimited. Does not implicitly {@link LicenseRequest.ContentIdentification.WebmKeyId.verify|verify} messages.
             * @function encodeDelimited
             * @memberof LicenseRequest.ContentIdentification.WebmKeyId
             * @static
             * @param {LicenseRequest.ContentIdentification.WebmKeyId.$Properties} message WebmKeyId message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            WebmKeyId.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a WebmKeyId message from the specified reader or buffer.
             * @function decode
             * @memberof LicenseRequest.ContentIdentification.WebmKeyId
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {LicenseRequest.ContentIdentification.WebmKeyId & LicenseRequest.ContentIdentification.WebmKeyId.$Shape} WebmKeyId
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            WebmKeyId.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.LicenseRequest.ContentIdentification.WebmKeyId();
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            message.header = reader.bytes();
                            continue;
                        }
                    case 2: {
                            if (wireType !== 0)
                                break;
                            message.licenseType = reader.int32();
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            message.requestId = reader.bytes();
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes a WebmKeyId message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof LicenseRequest.ContentIdentification.WebmKeyId
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {LicenseRequest.ContentIdentification.WebmKeyId & LicenseRequest.ContentIdentification.WebmKeyId.$Shape} WebmKeyId
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            WebmKeyId.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a WebmKeyId message.
             * @function verify
             * @memberof LicenseRequest.ContentIdentification.WebmKeyId
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            WebmKeyId.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.header != null && $Object.hasOwnProperty.call(message, "header"))
                    if (!(message.header && typeof message.header.length === "number" || $util.isString(message.header)))
                        return "header: buffer expected";
                if (message.licenseType != null && $Object.hasOwnProperty.call(message, "licenseType"))
                    switch (message.licenseType) {
                    default:
                        return "licenseType: enum value expected";
                    case 1:
                    case 2:
                    case 3:
                        break;
                    }
                if (message.requestId != null && $Object.hasOwnProperty.call(message, "requestId"))
                    if (!(message.requestId && typeof message.requestId.length === "number" || $util.isString(message.requestId)))
                        return "requestId: buffer expected";
                return null;
            };

            /**
             * Creates a WebmKeyId message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof LicenseRequest.ContentIdentification.WebmKeyId
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {LicenseRequest.ContentIdentification.WebmKeyId} WebmKeyId
             */
            WebmKeyId.fromObject = function (object, _depth) {
                if (object instanceof $root.LicenseRequest.ContentIdentification.WebmKeyId)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".LicenseRequest.ContentIdentification.WebmKeyId: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.LicenseRequest.ContentIdentification.WebmKeyId();
                if (object.header != null)
                    if (typeof object.header === "string")
                        $util.base64.decode(object.header, message.header = $util.newBuffer($util.base64.length(object.header)), 0);
                    else if (object.header.length >= 0)
                        message.header = object.header;
                switch (object.licenseType) {
                default:
                    if (typeof object.licenseType === "number") {
                        message.licenseType = object.licenseType;
                        break;
                    }
                    break;
                case "STREAMING":
                case 1:
                    message.licenseType = 1;
                    break;
                case "OFFLINE":
                case 2:
                    message.licenseType = 2;
                    break;
                case "AUTOMATIC":
                case 3:
                    message.licenseType = 3;
                    break;
                }
                if (object.requestId != null)
                    if (typeof object.requestId === "string")
                        $util.base64.decode(object.requestId, message.requestId = $util.newBuffer($util.base64.length(object.requestId)), 0);
                    else if (object.requestId.length >= 0)
                        message.requestId = object.requestId;
                return message;
            };

            /**
             * Creates a plain object from a WebmKeyId message. Also converts values to other types if specified.
             * @function toObject
             * @memberof LicenseRequest.ContentIdentification.WebmKeyId
             * @static
             * @param {LicenseRequest.ContentIdentification.WebmKeyId} message WebmKeyId
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            WebmKeyId.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    if (options.bytes === $String)
                        object.header = "";
                    else {
                        object.header = [];
                        if (options.bytes !== $Array)
                            object.header = $util.newBuffer(object.header);
                    }
                    object.licenseType = options.enums === $String ? "STREAMING" : 1;
                    if (options.bytes === $String)
                        object.requestId = "";
                    else {
                        object.requestId = [];
                        if (options.bytes !== $Array)
                            object.requestId = $util.newBuffer(object.requestId);
                    }
                }
                if (message.header != null && $Object.hasOwnProperty.call(message, "header"))
                    object.header = options.bytes === $String ? $util.base64.encode(message.header, 0, message.header.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.header) : message.header;
                if (message.licenseType != null && $Object.hasOwnProperty.call(message, "licenseType"))
                    object.licenseType = options.enums === $String ? $root.LicenseType[message.licenseType] === $undefined ? message.licenseType : $root.LicenseType[message.licenseType] : message.licenseType;
                if (message.requestId != null && $Object.hasOwnProperty.call(message, "requestId"))
                    object.requestId = options.bytes === $String ? $util.base64.encode(message.requestId, 0, message.requestId.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.requestId) : message.requestId;
                return object;
            };

            /**
             * Converts this WebmKeyId to JSON.
             * @function toJSON
             * @memberof LicenseRequest.ContentIdentification.WebmKeyId
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            WebmKeyId.prototype.toJSON = function() {
                return WebmKeyId.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for WebmKeyId
             * @function getTypeUrl
             * @memberof LicenseRequest.ContentIdentification.WebmKeyId
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            WebmKeyId.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/LicenseRequest.ContentIdentification.WebmKeyId";
            };

            return WebmKeyId;
        })();

        ContentIdentification.ExistingLicense = (function() {

            /**
             * Properties of an ExistingLicense.
             * @typedef {Object} LicenseRequest.ContentIdentification.ExistingLicense.$Properties
             * @property {LicenseIdentification.$Properties|null} [licenseId] ExistingLicense licenseId
             * @property {number|Long|null} [secondsSinceStarted] ExistingLicense secondsSinceStarted
             * @property {number|Long|null} [secondsSinceLastPlayed] ExistingLicense secondsSinceLastPlayed
             * @property {Uint8Array|null} [sessionUsageTableEntry] ExistingLicense sessionUsageTableEntry
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
             */

            /**
             * Properties of an ExistingLicense.
             * @memberof LicenseRequest.ContentIdentification
             * @interface IExistingLicense
             * @augments LicenseRequest.ContentIdentification.ExistingLicense.$Properties
             * @deprecated Use LicenseRequest.ContentIdentification.ExistingLicense.$Properties instead.
             */

            /**
             * Shape of an ExistingLicense.
             * @typedef {LicenseRequest.ContentIdentification.ExistingLicense.$Properties} LicenseRequest.ContentIdentification.ExistingLicense.$Shape
             */

            /**
             * Constructs a new ExistingLicense.
             * @memberof LicenseRequest.ContentIdentification
             * @classdesc Represents an ExistingLicense.
             * @constructor
             * @param {LicenseRequest.ContentIdentification.ExistingLicense.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
             */
            const ExistingLicense = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * ExistingLicense licenseId.
             * @member {LicenseIdentification.$Properties|null|undefined} licenseId
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
            ExistingLicense.prototype.secondsSinceStarted = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * ExistingLicense secondsSinceLastPlayed.
             * @member {number|Long} secondsSinceLastPlayed
             * @memberof LicenseRequest.ContentIdentification.ExistingLicense
             * @instance
             */
            ExistingLicense.prototype.secondsSinceLastPlayed = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

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
             * @param {LicenseRequest.ContentIdentification.ExistingLicense.$Properties=} [properties] Properties to set
             * @returns {LicenseRequest.ContentIdentification.ExistingLicense} ExistingLicense instance
             * @type {{
             *   (properties: LicenseRequest.ContentIdentification.ExistingLicense.$Shape): LicenseRequest.ContentIdentification.ExistingLicense & LicenseRequest.ContentIdentification.ExistingLicense.$Shape;
             *   (properties?: LicenseRequest.ContentIdentification.ExistingLicense.$Properties): LicenseRequest.ContentIdentification.ExistingLicense;
             * }}
             */
            ExistingLicense.create = function(properties) {
                return new ExistingLicense(properties);
            };

            /**
             * Encodes the specified ExistingLicense message. Does not implicitly {@link LicenseRequest.ContentIdentification.ExistingLicense.verify|verify} messages.
             * @function encode
             * @memberof LicenseRequest.ContentIdentification.ExistingLicense
             * @static
             * @param {LicenseRequest.ContentIdentification.ExistingLicense.$Properties} message ExistingLicense message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ExistingLicense.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = new $Writer();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.licenseId != null && $Object.hasOwnProperty.call(message, "licenseId"))
                    $root.LicenseIdentification.encode(message.licenseId, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                if (message.secondsSinceStarted != null && $Object.hasOwnProperty.call(message, "secondsSinceStarted"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int64(message.secondsSinceStarted);
                if (message.secondsSinceLastPlayed != null && $Object.hasOwnProperty.call(message, "secondsSinceLastPlayed"))
                    writer.uint32(/* id 3, wireType 0 =*/24).int64(message.secondsSinceLastPlayed);
                if (message.sessionUsageTableEntry != null && $Object.hasOwnProperty.call(message, "sessionUsageTableEntry"))
                    writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.sessionUsageTableEntry);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified ExistingLicense message, length delimited. Does not implicitly {@link LicenseRequest.ContentIdentification.ExistingLicense.verify|verify} messages.
             * @function encodeDelimited
             * @memberof LicenseRequest.ContentIdentification.ExistingLicense
             * @static
             * @param {LicenseRequest.ContentIdentification.ExistingLicense.$Properties} message ExistingLicense message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ExistingLicense.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes an ExistingLicense message from the specified reader or buffer.
             * @function decode
             * @memberof LicenseRequest.ContentIdentification.ExistingLicense
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {LicenseRequest.ContentIdentification.ExistingLicense & LicenseRequest.ContentIdentification.ExistingLicense.$Shape} ExistingLicense
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ExistingLicense.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.LicenseRequest.ContentIdentification.ExistingLicense();
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            message.licenseId = $root.LicenseIdentification.decode(reader, reader.uint32(), $undefined, _depth + 1, message.licenseId);
                            continue;
                        }
                    case 2: {
                            if (wireType !== 0)
                                break;
                            message.secondsSinceStarted = reader.int64();
                            continue;
                        }
                    case 3: {
                            if (wireType !== 0)
                                break;
                            message.secondsSinceLastPlayed = reader.int64();
                            continue;
                        }
                    case 4: {
                            if (wireType !== 2)
                                break;
                            message.sessionUsageTableEntry = reader.bytes();
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes an ExistingLicense message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof LicenseRequest.ContentIdentification.ExistingLicense
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {LicenseRequest.ContentIdentification.ExistingLicense & LicenseRequest.ContentIdentification.ExistingLicense.$Shape} ExistingLicense
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ExistingLicense.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an ExistingLicense message.
             * @function verify
             * @memberof LicenseRequest.ContentIdentification.ExistingLicense
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ExistingLicense.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.licenseId != null && $Object.hasOwnProperty.call(message, "licenseId")) {
                    let error = $root.LicenseIdentification.verify(message.licenseId, _depth + 1);
                    if (error)
                        return "licenseId." + error;
                }
                if (message.secondsSinceStarted != null && $Object.hasOwnProperty.call(message, "secondsSinceStarted"))
                    if (!$util.isInteger(message.secondsSinceStarted) && !(message.secondsSinceStarted && $util.isInteger(message.secondsSinceStarted.low) && $util.isInteger(message.secondsSinceStarted.high)))
                        return "secondsSinceStarted: integer|Long expected";
                if (message.secondsSinceLastPlayed != null && $Object.hasOwnProperty.call(message, "secondsSinceLastPlayed"))
                    if (!$util.isInteger(message.secondsSinceLastPlayed) && !(message.secondsSinceLastPlayed && $util.isInteger(message.secondsSinceLastPlayed.low) && $util.isInteger(message.secondsSinceLastPlayed.high)))
                        return "secondsSinceLastPlayed: integer|Long expected";
                if (message.sessionUsageTableEntry != null && $Object.hasOwnProperty.call(message, "sessionUsageTableEntry"))
                    if (!(message.sessionUsageTableEntry && typeof message.sessionUsageTableEntry.length === "number" || $util.isString(message.sessionUsageTableEntry)))
                        return "sessionUsageTableEntry: buffer expected";
                return null;
            };

            /**
             * Creates an ExistingLicense message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof LicenseRequest.ContentIdentification.ExistingLicense
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {LicenseRequest.ContentIdentification.ExistingLicense} ExistingLicense
             */
            ExistingLicense.fromObject = function (object, _depth) {
                if (object instanceof $root.LicenseRequest.ContentIdentification.ExistingLicense)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".LicenseRequest.ContentIdentification.ExistingLicense: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.LicenseRequest.ContentIdentification.ExistingLicense();
                if (object.licenseId != null) {
                    if (!$util.isObject(object.licenseId))
                        throw $TypeError(".LicenseRequest.ContentIdentification.ExistingLicense.licenseId: object expected");
                    message.licenseId = $root.LicenseIdentification.fromObject(object.licenseId, _depth + 1);
                }
                if (object.secondsSinceStarted != null)
                    if ($util.Long)
                        message.secondsSinceStarted = $util.Long.fromValue(object.secondsSinceStarted, false);
                    else if (typeof object.secondsSinceStarted === "string")
                        message.secondsSinceStarted = $parseInt(object.secondsSinceStarted, 10);
                    else if (typeof object.secondsSinceStarted === "number")
                        message.secondsSinceStarted = object.secondsSinceStarted;
                    else if (typeof object.secondsSinceStarted === "object")
                        message.secondsSinceStarted = new $util.LongBits(object.secondsSinceStarted.low >>> 0, object.secondsSinceStarted.high >>> 0).toNumber();
                if (object.secondsSinceLastPlayed != null)
                    if ($util.Long)
                        message.secondsSinceLastPlayed = $util.Long.fromValue(object.secondsSinceLastPlayed, false);
                    else if (typeof object.secondsSinceLastPlayed === "string")
                        message.secondsSinceLastPlayed = $parseInt(object.secondsSinceLastPlayed, 10);
                    else if (typeof object.secondsSinceLastPlayed === "number")
                        message.secondsSinceLastPlayed = object.secondsSinceLastPlayed;
                    else if (typeof object.secondsSinceLastPlayed === "object")
                        message.secondsSinceLastPlayed = new $util.LongBits(object.secondsSinceLastPlayed.low >>> 0, object.secondsSinceLastPlayed.high >>> 0).toNumber();
                if (object.sessionUsageTableEntry != null)
                    if (typeof object.sessionUsageTableEntry === "string")
                        $util.base64.decode(object.sessionUsageTableEntry, message.sessionUsageTableEntry = $util.newBuffer($util.base64.length(object.sessionUsageTableEntry)), 0);
                    else if (object.sessionUsageTableEntry.length >= 0)
                        message.sessionUsageTableEntry = object.sessionUsageTableEntry;
                return message;
            };

            /**
             * Creates a plain object from an ExistingLicense message. Also converts values to other types if specified.
             * @function toObject
             * @memberof LicenseRequest.ContentIdentification.ExistingLicense
             * @static
             * @param {LicenseRequest.ContentIdentification.ExistingLicense} message ExistingLicense
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ExistingLicense.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.licenseId = null;
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, false);
                        object.secondsSinceStarted = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                    } else
                        object.secondsSinceStarted = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, false);
                        object.secondsSinceLastPlayed = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                    } else
                        object.secondsSinceLastPlayed = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                    if (options.bytes === $String)
                        object.sessionUsageTableEntry = "";
                    else {
                        object.sessionUsageTableEntry = [];
                        if (options.bytes !== $Array)
                            object.sessionUsageTableEntry = $util.newBuffer(object.sessionUsageTableEntry);
                    }
                }
                if (message.licenseId != null && $Object.hasOwnProperty.call(message, "licenseId"))
                    object.licenseId = $root.LicenseIdentification.toObject(message.licenseId, options, _depth + 1);
                if (message.secondsSinceStarted != null && $Object.hasOwnProperty.call(message, "secondsSinceStarted"))
                    if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                        object.secondsSinceStarted = typeof message.secondsSinceStarted === "number" ? $BigInt(message.secondsSinceStarted) : $util.Long.fromBits(message.secondsSinceStarted.low >>> 0, message.secondsSinceStarted.high >>> 0, false).toBigInt();
                    else if (typeof message.secondsSinceStarted === "number")
                        object.secondsSinceStarted = options.longs === $String ? $String(message.secondsSinceStarted) : message.secondsSinceStarted;
                    else
                        object.secondsSinceStarted = options.longs === $String ? $util.Long.prototype.toString.call(message.secondsSinceStarted) : options.longs === $Number ? new $util.LongBits(message.secondsSinceStarted.low >>> 0, message.secondsSinceStarted.high >>> 0).toNumber() : message.secondsSinceStarted;
                if (message.secondsSinceLastPlayed != null && $Object.hasOwnProperty.call(message, "secondsSinceLastPlayed"))
                    if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                        object.secondsSinceLastPlayed = typeof message.secondsSinceLastPlayed === "number" ? $BigInt(message.secondsSinceLastPlayed) : $util.Long.fromBits(message.secondsSinceLastPlayed.low >>> 0, message.secondsSinceLastPlayed.high >>> 0, false).toBigInt();
                    else if (typeof message.secondsSinceLastPlayed === "number")
                        object.secondsSinceLastPlayed = options.longs === $String ? $String(message.secondsSinceLastPlayed) : message.secondsSinceLastPlayed;
                    else
                        object.secondsSinceLastPlayed = options.longs === $String ? $util.Long.prototype.toString.call(message.secondsSinceLastPlayed) : options.longs === $Number ? new $util.LongBits(message.secondsSinceLastPlayed.low >>> 0, message.secondsSinceLastPlayed.high >>> 0).toNumber() : message.secondsSinceLastPlayed;
                if (message.sessionUsageTableEntry != null && $Object.hasOwnProperty.call(message, "sessionUsageTableEntry"))
                    object.sessionUsageTableEntry = options.bytes === $String ? $util.base64.encode(message.sessionUsageTableEntry, 0, message.sessionUsageTableEntry.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.sessionUsageTableEntry) : message.sessionUsageTableEntry;
                return object;
            };

            /**
             * Converts this ExistingLicense to JSON.
             * @function toJSON
             * @memberof LicenseRequest.ContentIdentification.ExistingLicense
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ExistingLicense.prototype.toJSON = function() {
                return ExistingLicense.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for ExistingLicense
             * @function getTypeUrl
             * @memberof LicenseRequest.ContentIdentification.ExistingLicense
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            ExistingLicense.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/LicenseRequest.ContentIdentification.ExistingLicense";
            };

            return ExistingLicense;
        })();

        ContentIdentification.InitData = (function() {

            /**
             * Properties of an InitData.
             * @typedef {Object} LicenseRequest.ContentIdentification.InitData.$Properties
             * @property {LicenseRequest.ContentIdentification.InitData.InitDataType|null} [initDataType] InitData initDataType
             * @property {Uint8Array|null} [initData] InitData initData
             * @property {LicenseType|null} [licenseType] InitData licenseType
             * @property {Uint8Array|null} [requestId] InitData requestId
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
             */

            /**
             * Properties of an InitData.
             * @memberof LicenseRequest.ContentIdentification
             * @interface IInitData
             * @augments LicenseRequest.ContentIdentification.InitData.$Properties
             * @deprecated Use LicenseRequest.ContentIdentification.InitData.$Properties instead.
             */

            /**
             * Shape of an InitData.
             * @typedef {LicenseRequest.ContentIdentification.InitData.$Properties} LicenseRequest.ContentIdentification.InitData.$Shape
             */

            /**
             * Constructs a new InitData.
             * @memberof LicenseRequest.ContentIdentification
             * @classdesc Represents an InitData.
             * @constructor
             * @param {LicenseRequest.ContentIdentification.InitData.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
             */
            const InitData = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

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
             * @param {LicenseRequest.ContentIdentification.InitData.$Properties=} [properties] Properties to set
             * @returns {LicenseRequest.ContentIdentification.InitData} InitData instance
             * @type {{
             *   (properties: LicenseRequest.ContentIdentification.InitData.$Shape): LicenseRequest.ContentIdentification.InitData & LicenseRequest.ContentIdentification.InitData.$Shape;
             *   (properties?: LicenseRequest.ContentIdentification.InitData.$Properties): LicenseRequest.ContentIdentification.InitData;
             * }}
             */
            InitData.create = function(properties) {
                return new InitData(properties);
            };

            /**
             * Encodes the specified InitData message. Does not implicitly {@link LicenseRequest.ContentIdentification.InitData.verify|verify} messages.
             * @function encode
             * @memberof LicenseRequest.ContentIdentification.InitData
             * @static
             * @param {LicenseRequest.ContentIdentification.InitData.$Properties} message InitData message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            InitData.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = new $Writer();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.initDataType != null && $Object.hasOwnProperty.call(message, "initDataType"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.initDataType);
                if (message.initData != null && $Object.hasOwnProperty.call(message, "initData"))
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.initData);
                if (message.licenseType != null && $Object.hasOwnProperty.call(message, "licenseType"))
                    writer.uint32(/* id 3, wireType 0 =*/24).int32(message.licenseType);
                if (message.requestId != null && $Object.hasOwnProperty.call(message, "requestId"))
                    writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.requestId);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified InitData message, length delimited. Does not implicitly {@link LicenseRequest.ContentIdentification.InitData.verify|verify} messages.
             * @function encodeDelimited
             * @memberof LicenseRequest.ContentIdentification.InitData
             * @static
             * @param {LicenseRequest.ContentIdentification.InitData.$Properties} message InitData message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            InitData.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes an InitData message from the specified reader or buffer.
             * @function decode
             * @memberof LicenseRequest.ContentIdentification.InitData
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {LicenseRequest.ContentIdentification.InitData & LicenseRequest.ContentIdentification.InitData.$Shape} InitData
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            InitData.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.LicenseRequest.ContentIdentification.InitData();
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 0)
                                break;
                            message.initDataType = reader.int32();
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            message.initData = reader.bytes();
                            continue;
                        }
                    case 3: {
                            if (wireType !== 0)
                                break;
                            message.licenseType = reader.int32();
                            continue;
                        }
                    case 4: {
                            if (wireType !== 2)
                                break;
                            message.requestId = reader.bytes();
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes an InitData message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof LicenseRequest.ContentIdentification.InitData
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {LicenseRequest.ContentIdentification.InitData & LicenseRequest.ContentIdentification.InitData.$Shape} InitData
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            InitData.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an InitData message.
             * @function verify
             * @memberof LicenseRequest.ContentIdentification.InitData
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            InitData.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.initDataType != null && $Object.hasOwnProperty.call(message, "initDataType"))
                    switch (message.initDataType) {
                    default:
                        return "initDataType: enum value expected";
                    case 1:
                    case 2:
                        break;
                    }
                if (message.initData != null && $Object.hasOwnProperty.call(message, "initData"))
                    if (!(message.initData && typeof message.initData.length === "number" || $util.isString(message.initData)))
                        return "initData: buffer expected";
                if (message.licenseType != null && $Object.hasOwnProperty.call(message, "licenseType"))
                    switch (message.licenseType) {
                    default:
                        return "licenseType: enum value expected";
                    case 1:
                    case 2:
                    case 3:
                        break;
                    }
                if (message.requestId != null && $Object.hasOwnProperty.call(message, "requestId"))
                    if (!(message.requestId && typeof message.requestId.length === "number" || $util.isString(message.requestId)))
                        return "requestId: buffer expected";
                return null;
            };

            /**
             * Creates an InitData message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof LicenseRequest.ContentIdentification.InitData
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {LicenseRequest.ContentIdentification.InitData} InitData
             */
            InitData.fromObject = function (object, _depth) {
                if (object instanceof $root.LicenseRequest.ContentIdentification.InitData)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".LicenseRequest.ContentIdentification.InitData: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.LicenseRequest.ContentIdentification.InitData();
                switch (object.initDataType) {
                default:
                    if (typeof object.initDataType === "number") {
                        message.initDataType = object.initDataType;
                        break;
                    }
                    break;
                case "CENC":
                case 1:
                    message.initDataType = 1;
                    break;
                case "WEBM":
                case 2:
                    message.initDataType = 2;
                    break;
                }
                if (object.initData != null)
                    if (typeof object.initData === "string")
                        $util.base64.decode(object.initData, message.initData = $util.newBuffer($util.base64.length(object.initData)), 0);
                    else if (object.initData.length >= 0)
                        message.initData = object.initData;
                switch (object.licenseType) {
                default:
                    if (typeof object.licenseType === "number") {
                        message.licenseType = object.licenseType;
                        break;
                    }
                    break;
                case "STREAMING":
                case 1:
                    message.licenseType = 1;
                    break;
                case "OFFLINE":
                case 2:
                    message.licenseType = 2;
                    break;
                case "AUTOMATIC":
                case 3:
                    message.licenseType = 3;
                    break;
                }
                if (object.requestId != null)
                    if (typeof object.requestId === "string")
                        $util.base64.decode(object.requestId, message.requestId = $util.newBuffer($util.base64.length(object.requestId)), 0);
                    else if (object.requestId.length >= 0)
                        message.requestId = object.requestId;
                return message;
            };

            /**
             * Creates a plain object from an InitData message. Also converts values to other types if specified.
             * @function toObject
             * @memberof LicenseRequest.ContentIdentification.InitData
             * @static
             * @param {LicenseRequest.ContentIdentification.InitData} message InitData
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            InitData.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.initDataType = options.enums === $String ? "CENC" : 1;
                    if (options.bytes === $String)
                        object.initData = "";
                    else {
                        object.initData = [];
                        if (options.bytes !== $Array)
                            object.initData = $util.newBuffer(object.initData);
                    }
                    object.licenseType = options.enums === $String ? "STREAMING" : 1;
                    if (options.bytes === $String)
                        object.requestId = "";
                    else {
                        object.requestId = [];
                        if (options.bytes !== $Array)
                            object.requestId = $util.newBuffer(object.requestId);
                    }
                }
                if (message.initDataType != null && $Object.hasOwnProperty.call(message, "initDataType"))
                    object.initDataType = options.enums === $String ? $root.LicenseRequest.ContentIdentification.InitData.InitDataType[message.initDataType] === $undefined ? message.initDataType : $root.LicenseRequest.ContentIdentification.InitData.InitDataType[message.initDataType] : message.initDataType;
                if (message.initData != null && $Object.hasOwnProperty.call(message, "initData"))
                    object.initData = options.bytes === $String ? $util.base64.encode(message.initData, 0, message.initData.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.initData) : message.initData;
                if (message.licenseType != null && $Object.hasOwnProperty.call(message, "licenseType"))
                    object.licenseType = options.enums === $String ? $root.LicenseType[message.licenseType] === $undefined ? message.licenseType : $root.LicenseType[message.licenseType] : message.licenseType;
                if (message.requestId != null && $Object.hasOwnProperty.call(message, "requestId"))
                    object.requestId = options.bytes === $String ? $util.base64.encode(message.requestId, 0, message.requestId.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.requestId) : message.requestId;
                return object;
            };

            /**
             * Converts this InitData to JSON.
             * @function toJSON
             * @memberof LicenseRequest.ContentIdentification.InitData
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            InitData.prototype.toJSON = function() {
                return InitData.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for InitData
             * @function getTypeUrl
             * @memberof LicenseRequest.ContentIdentification.InitData
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            InitData.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/LicenseRequest.ContentIdentification.InitData";
            };

            /**
             * InitDataType enum.
             * @name LicenseRequest.ContentIdentification.InitData.InitDataType
             * @enum {number}
             * @property {number} CENC=1 CENC value
             * @property {number} WEBM=2 WEBM value
             */
            InitData.InitDataType = (function() {
                const valuesById = {}, values = $Object.create(valuesById);
                values[valuesById[1] = "CENC"] = 1;
                values[valuesById[2] = "WEBM"] = 2;
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
    LicenseRequest.RequestType = (function() {
        const valuesById = {}, values = $Object.create(valuesById);
        values[valuesById[1] = "NEW"] = 1;
        values[valuesById[2] = "RENEWAL"] = 2;
        values[valuesById[3] = "RELEASE"] = 3;
        return values;
    })();

    return LicenseRequest;
})();

export const MetricData = $root.MetricData = (() => {

    /**
     * Properties of a MetricData.
     * @typedef {Object} MetricData.$Properties
     * @property {string|null} [stageName] MetricData stageName
     * @property {Array.<MetricData.TypeValue.$Properties>|null} [metricData] MetricData metricData
     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
     */

    /**
     * Properties of a MetricData.
     * @exports IMetricData
     * @interface IMetricData
     * @augments MetricData.$Properties
     * @deprecated Use MetricData.$Properties instead.
     */

    /**
     * Shape of a MetricData.
     * @typedef {MetricData.$Properties} MetricData.$Shape
     */

    /**
     * Constructs a new MetricData.
     * @exports MetricData
     * @classdesc Represents a MetricData.
     * @constructor
     * @param {MetricData.$Properties=} [properties] Properties to set
     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
     */
    const MetricData = function (properties) {
        this.metricData = [];
        if (properties)
            for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    };

    /**
     * MetricData stageName.
     * @member {string} stageName
     * @memberof MetricData
     * @instance
     */
    MetricData.prototype.stageName = "";

    /**
     * MetricData metricData.
     * @member {Array.<MetricData.TypeValue.$Properties>} metricData
     * @memberof MetricData
     * @instance
     */
    MetricData.prototype.metricData = $util.emptyArray;

    /**
     * Creates a new MetricData instance using the specified properties.
     * @function create
     * @memberof MetricData
     * @static
     * @param {MetricData.$Properties=} [properties] Properties to set
     * @returns {MetricData} MetricData instance
     * @type {{
     *   (properties: MetricData.$Shape): MetricData & MetricData.$Shape;
     *   (properties?: MetricData.$Properties): MetricData;
     * }}
     */
    MetricData.create = function(properties) {
        return new MetricData(properties);
    };

    /**
     * Encodes the specified MetricData message. Does not implicitly {@link MetricData.verify|verify} messages.
     * @function encode
     * @memberof MetricData
     * @static
     * @param {MetricData.$Properties} message MetricData message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    MetricData.encode = function (message, writer, _depth) {
        if (!writer)
            writer = new $Writer();
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        if (message.stageName != null && $Object.hasOwnProperty.call(message, "stageName"))
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.stageName);
        if (message.metricData != null && message.metricData.length)
            for (let i = 0; i < message.metricData.length; ++i)
                $root.MetricData.TypeValue.encode(message.metricData[i], writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim();
        if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    /**
     * Encodes the specified MetricData message, length delimited. Does not implicitly {@link MetricData.verify|verify} messages.
     * @function encodeDelimited
     * @memberof MetricData
     * @static
     * @param {MetricData.$Properties} message MetricData message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    MetricData.encodeDelimited = function(message, writer) {
        return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
    };

    /**
     * Decodes a MetricData message from the specified reader or buffer.
     * @function decode
     * @memberof MetricData
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {MetricData & MetricData.$Shape} MetricData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    MetricData.decode = function (reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw $Error("max depth exceeded");
        let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.MetricData();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = $undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 2)
                        break;
                    message.stageName = reader.string();
                    continue;
                }
            case 2: {
                    if (wireType !== 2)
                        break;
                    if (!(message.metricData && message.metricData.length))
                        message.metricData = [];
                    message.metricData.push($root.MetricData.TypeValue.decode(reader, reader.uint32(), $undefined, _depth + 1));
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            if (!reader.discardUnknown) {
                $util.makeProp(message, "$unknowns", false);
                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
            }
        }
        if (_end !== $undefined)
            throw $Error("missing end group");
        return message;
    };

    /**
     * Decodes a MetricData message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof MetricData
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {MetricData & MetricData.$Shape} MetricData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    MetricData.decodeDelimited = function(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a MetricData message.
     * @function verify
     * @memberof MetricData
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    MetricData.verify = function (message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (message.stageName != null && $Object.hasOwnProperty.call(message, "stageName"))
            if (!$util.isString(message.stageName))
                return "stageName: string expected";
        if (message.metricData != null && $Object.hasOwnProperty.call(message, "metricData")) {
            if (!$Array.isArray(message.metricData))
                return "metricData: array expected";
            for (let i = 0; i < message.metricData.length; ++i) {
                let error = $root.MetricData.TypeValue.verify(message.metricData[i], _depth + 1);
                if (error)
                    return "metricData." + error;
            }
        }
        return null;
    };

    /**
     * Creates a MetricData message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof MetricData
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {MetricData} MetricData
     */
    MetricData.fromObject = function (object, _depth) {
        if (object instanceof $root.MetricData)
            return object;
        if (!$util.isObject(object))
            throw $TypeError(".MetricData: object expected");
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        let message = new $root.MetricData();
        if (object.stageName != null)
            message.stageName = $String(object.stageName);
        if (object.metricData) {
            if (!$Array.isArray(object.metricData))
                throw $TypeError(".MetricData.metricData: array expected");
            message.metricData = $Array(object.metricData.length);
            for (let i = 0; i < object.metricData.length; ++i) {
                if (!$util.isObject(object.metricData[i]))
                    throw $TypeError(".MetricData.metricData: object expected");
                message.metricData[i] = $root.MetricData.TypeValue.fromObject(object.metricData[i], _depth + 1);
            }
        }
        return message;
    };

    /**
     * Creates a plain object from a MetricData message. Also converts values to other types if specified.
     * @function toObject
     * @memberof MetricData
     * @static
     * @param {MetricData} message MetricData
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    MetricData.toObject = function (message, options, _depth) {
        if (!options)
            options = {};
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        let object = {};
        if (options.arrays || options.defaults)
            object.metricData = [];
        if (options.defaults)
            object.stageName = "";
        if (message.stageName != null && $Object.hasOwnProperty.call(message, "stageName"))
            object.stageName = message.stageName;
        if (message.metricData && message.metricData.length) {
            object.metricData = $Array(message.metricData.length);
            for (let j = 0; j < message.metricData.length; ++j)
                object.metricData[j] = $root.MetricData.TypeValue.toObject(message.metricData[j], options, _depth + 1);
        }
        return object;
    };

    /**
     * Converts this MetricData to JSON.
     * @function toJSON
     * @memberof MetricData
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    MetricData.prototype.toJSON = function() {
        return MetricData.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the type url for MetricData
     * @function getTypeUrl
     * @memberof MetricData
     * @static
     * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns {string} The type url
     */
    MetricData.getTypeUrl = function(prefix) {
        if (prefix === $undefined)
            prefix = "type.googleapis.com";
        return prefix + "/MetricData";
    };

    /**
     * MetricType enum.
     * @name MetricData.MetricType
     * @enum {number}
     * @property {number} LATENCY=1 LATENCY value
     * @property {number} TIMESTAMP=2 TIMESTAMP value
     */
    MetricData.MetricType = (function() {
        const valuesById = {}, values = $Object.create(valuesById);
        values[valuesById[1] = "LATENCY"] = 1;
        values[valuesById[2] = "TIMESTAMP"] = 2;
        return values;
    })();

    MetricData.TypeValue = (function() {

        /**
         * Properties of a TypeValue.
         * @typedef {Object} MetricData.TypeValue.$Properties
         * @property {MetricData.MetricType|null} [type] TypeValue type
         * @property {number|Long|null} [value] TypeValue value
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */

        /**
         * Properties of a TypeValue.
         * @memberof MetricData
         * @interface ITypeValue
         * @augments MetricData.TypeValue.$Properties
         * @deprecated Use MetricData.TypeValue.$Properties instead.
         */

        /**
         * Shape of a TypeValue.
         * @typedef {MetricData.TypeValue.$Properties} MetricData.TypeValue.$Shape
         */

        /**
         * Constructs a new TypeValue.
         * @memberof MetricData
         * @classdesc Represents a TypeValue.
         * @constructor
         * @param {MetricData.TypeValue.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */
        const TypeValue = function (properties) {
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

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
        TypeValue.prototype.value = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Creates a new TypeValue instance using the specified properties.
         * @function create
         * @memberof MetricData.TypeValue
         * @static
         * @param {MetricData.TypeValue.$Properties=} [properties] Properties to set
         * @returns {MetricData.TypeValue} TypeValue instance
         * @type {{
         *   (properties: MetricData.TypeValue.$Shape): MetricData.TypeValue & MetricData.TypeValue.$Shape;
         *   (properties?: MetricData.TypeValue.$Properties): MetricData.TypeValue;
         * }}
         */
        TypeValue.create = function(properties) {
            return new TypeValue(properties);
        };

        /**
         * Encodes the specified TypeValue message. Does not implicitly {@link MetricData.TypeValue.verify|verify} messages.
         * @function encode
         * @memberof MetricData.TypeValue
         * @static
         * @param {MetricData.TypeValue.$Properties} message TypeValue message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TypeValue.encode = function (message, writer, _depth) {
            if (!writer)
                writer = new $Writer();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.type != null && $Object.hasOwnProperty.call(message, "type"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.type);
            if (message.value != null && $Object.hasOwnProperty.call(message, "value"))
                writer.uint32(/* id 2, wireType 0 =*/16).int64(message.value);
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified TypeValue message, length delimited. Does not implicitly {@link MetricData.TypeValue.verify|verify} messages.
         * @function encodeDelimited
         * @memberof MetricData.TypeValue
         * @static
         * @param {MetricData.TypeValue.$Properties} message TypeValue message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TypeValue.encodeDelimited = function(message, writer) {
            return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
        };

        /**
         * Decodes a TypeValue message from the specified reader or buffer.
         * @function decode
         * @memberof MetricData.TypeValue
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {MetricData.TypeValue & MetricData.TypeValue.$Shape} TypeValue
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TypeValue.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.MetricData.TypeValue();
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 0)
                            break;
                        message.type = reader.int32();
                        continue;
                    }
                case 2: {
                        if (wireType !== 0)
                            break;
                        message.value = reader.int64();
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Decodes a TypeValue message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof MetricData.TypeValue
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {MetricData.TypeValue & MetricData.TypeValue.$Shape} TypeValue
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TypeValue.decodeDelimited = function(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a TypeValue message.
         * @function verify
         * @memberof MetricData.TypeValue
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        TypeValue.verify = function (message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (message.type != null && $Object.hasOwnProperty.call(message, "type"))
                switch (message.type) {
                default:
                    return "type: enum value expected";
                case 1:
                case 2:
                    break;
                }
            if (message.value != null && $Object.hasOwnProperty.call(message, "value"))
                if (!$util.isInteger(message.value) && !(message.value && $util.isInteger(message.value.low) && $util.isInteger(message.value.high)))
                    return "value: integer|Long expected";
            return null;
        };

        /**
         * Creates a TypeValue message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof MetricData.TypeValue
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {MetricData.TypeValue} TypeValue
         */
        TypeValue.fromObject = function (object, _depth) {
            if (object instanceof $root.MetricData.TypeValue)
                return object;
            if (!$util.isObject(object))
                throw $TypeError(".MetricData.TypeValue: object expected");
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let message = new $root.MetricData.TypeValue();
            switch (object.type) {
            default:
                if (typeof object.type === "number") {
                    message.type = object.type;
                    break;
                }
                break;
            case "LATENCY":
            case 1:
                message.type = 1;
                break;
            case "TIMESTAMP":
            case 2:
                message.type = 2;
                break;
            }
            if (object.value != null)
                if ($util.Long)
                    message.value = $util.Long.fromValue(object.value, false);
                else if (typeof object.value === "string")
                    message.value = $parseInt(object.value, 10);
                else if (typeof object.value === "number")
                    message.value = object.value;
                else if (typeof object.value === "object")
                    message.value = new $util.LongBits(object.value.low >>> 0, object.value.high >>> 0).toNumber();
            return message;
        };

        /**
         * Creates a plain object from a TypeValue message. Also converts values to other types if specified.
         * @function toObject
         * @memberof MetricData.TypeValue
         * @static
         * @param {MetricData.TypeValue} message TypeValue
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        TypeValue.toObject = function (message, options, _depth) {
            if (!options)
                options = {};
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let object = {};
            if (options.defaults) {
                object.type = options.enums === $String ? "LATENCY" : 1;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.value = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                } else
                    object.value = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
            }
            if (message.type != null && $Object.hasOwnProperty.call(message, "type"))
                object.type = options.enums === $String ? $root.MetricData.MetricType[message.type] === $undefined ? message.type : $root.MetricData.MetricType[message.type] : message.type;
            if (message.value != null && $Object.hasOwnProperty.call(message, "value"))
                if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                    object.value = typeof message.value === "number" ? $BigInt(message.value) : $util.Long.fromBits(message.value.low >>> 0, message.value.high >>> 0, false).toBigInt();
                else if (typeof message.value === "number")
                    object.value = options.longs === $String ? $String(message.value) : message.value;
                else
                    object.value = options.longs === $String ? $util.Long.prototype.toString.call(message.value) : options.longs === $Number ? new $util.LongBits(message.value.low >>> 0, message.value.high >>> 0).toNumber() : message.value;
            return object;
        };

        /**
         * Converts this TypeValue to JSON.
         * @function toJSON
         * @memberof MetricData.TypeValue
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        TypeValue.prototype.toJSON = function() {
            return TypeValue.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for TypeValue
         * @function getTypeUrl
         * @memberof MetricData.TypeValue
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        TypeValue.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/MetricData.TypeValue";
        };

        return TypeValue;
    })();

    return MetricData;
})();

export const VersionInfo = $root.VersionInfo = (() => {

    /**
     * Properties of a VersionInfo.
     * @typedef {Object} VersionInfo.$Properties
     * @property {string|null} [licenseSdkVersion] VersionInfo licenseSdkVersion
     * @property {string|null} [licenseServiceVersion] VersionInfo licenseServiceVersion
     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
     */

    /**
     * Properties of a VersionInfo.
     * @exports IVersionInfo
     * @interface IVersionInfo
     * @augments VersionInfo.$Properties
     * @deprecated Use VersionInfo.$Properties instead.
     */

    /**
     * Shape of a VersionInfo.
     * @typedef {VersionInfo.$Properties} VersionInfo.$Shape
     */

    /**
     * Constructs a new VersionInfo.
     * @exports VersionInfo
     * @classdesc Represents a VersionInfo.
     * @constructor
     * @param {VersionInfo.$Properties=} [properties] Properties to set
     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
     */
    const VersionInfo = function (properties) {
        if (properties)
            for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    };

    /**
     * VersionInfo licenseSdkVersion.
     * @member {string} licenseSdkVersion
     * @memberof VersionInfo
     * @instance
     */
    VersionInfo.prototype.licenseSdkVersion = "";

    /**
     * VersionInfo licenseServiceVersion.
     * @member {string} licenseServiceVersion
     * @memberof VersionInfo
     * @instance
     */
    VersionInfo.prototype.licenseServiceVersion = "";

    /**
     * Creates a new VersionInfo instance using the specified properties.
     * @function create
     * @memberof VersionInfo
     * @static
     * @param {VersionInfo.$Properties=} [properties] Properties to set
     * @returns {VersionInfo} VersionInfo instance
     * @type {{
     *   (properties: VersionInfo.$Shape): VersionInfo & VersionInfo.$Shape;
     *   (properties?: VersionInfo.$Properties): VersionInfo;
     * }}
     */
    VersionInfo.create = function(properties) {
        return new VersionInfo(properties);
    };

    /**
     * Encodes the specified VersionInfo message. Does not implicitly {@link VersionInfo.verify|verify} messages.
     * @function encode
     * @memberof VersionInfo
     * @static
     * @param {VersionInfo.$Properties} message VersionInfo message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    VersionInfo.encode = function (message, writer, _depth) {
        if (!writer)
            writer = new $Writer();
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        if (message.licenseSdkVersion != null && $Object.hasOwnProperty.call(message, "licenseSdkVersion"))
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.licenseSdkVersion);
        if (message.licenseServiceVersion != null && $Object.hasOwnProperty.call(message, "licenseServiceVersion"))
            writer.uint32(/* id 2, wireType 2 =*/18).string(message.licenseServiceVersion);
        if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    /**
     * Encodes the specified VersionInfo message, length delimited. Does not implicitly {@link VersionInfo.verify|verify} messages.
     * @function encodeDelimited
     * @memberof VersionInfo
     * @static
     * @param {VersionInfo.$Properties} message VersionInfo message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    VersionInfo.encodeDelimited = function(message, writer) {
        return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
    };

    /**
     * Decodes a VersionInfo message from the specified reader or buffer.
     * @function decode
     * @memberof VersionInfo
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {VersionInfo & VersionInfo.$Shape} VersionInfo
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    VersionInfo.decode = function (reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw $Error("max depth exceeded");
        let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.VersionInfo();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = $undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 2)
                        break;
                    message.licenseSdkVersion = reader.string();
                    continue;
                }
            case 2: {
                    if (wireType !== 2)
                        break;
                    message.licenseServiceVersion = reader.string();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            if (!reader.discardUnknown) {
                $util.makeProp(message, "$unknowns", false);
                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
            }
        }
        if (_end !== $undefined)
            throw $Error("missing end group");
        return message;
    };

    /**
     * Decodes a VersionInfo message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof VersionInfo
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {VersionInfo & VersionInfo.$Shape} VersionInfo
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    VersionInfo.decodeDelimited = function(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a VersionInfo message.
     * @function verify
     * @memberof VersionInfo
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    VersionInfo.verify = function (message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (message.licenseSdkVersion != null && $Object.hasOwnProperty.call(message, "licenseSdkVersion"))
            if (!$util.isString(message.licenseSdkVersion))
                return "licenseSdkVersion: string expected";
        if (message.licenseServiceVersion != null && $Object.hasOwnProperty.call(message, "licenseServiceVersion"))
            if (!$util.isString(message.licenseServiceVersion))
                return "licenseServiceVersion: string expected";
        return null;
    };

    /**
     * Creates a VersionInfo message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof VersionInfo
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {VersionInfo} VersionInfo
     */
    VersionInfo.fromObject = function (object, _depth) {
        if (object instanceof $root.VersionInfo)
            return object;
        if (!$util.isObject(object))
            throw $TypeError(".VersionInfo: object expected");
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        let message = new $root.VersionInfo();
        if (object.licenseSdkVersion != null)
            message.licenseSdkVersion = $String(object.licenseSdkVersion);
        if (object.licenseServiceVersion != null)
            message.licenseServiceVersion = $String(object.licenseServiceVersion);
        return message;
    };

    /**
     * Creates a plain object from a VersionInfo message. Also converts values to other types if specified.
     * @function toObject
     * @memberof VersionInfo
     * @static
     * @param {VersionInfo} message VersionInfo
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    VersionInfo.toObject = function (message, options, _depth) {
        if (!options)
            options = {};
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        let object = {};
        if (options.defaults) {
            object.licenseSdkVersion = "";
            object.licenseServiceVersion = "";
        }
        if (message.licenseSdkVersion != null && $Object.hasOwnProperty.call(message, "licenseSdkVersion"))
            object.licenseSdkVersion = message.licenseSdkVersion;
        if (message.licenseServiceVersion != null && $Object.hasOwnProperty.call(message, "licenseServiceVersion"))
            object.licenseServiceVersion = message.licenseServiceVersion;
        return object;
    };

    /**
     * Converts this VersionInfo to JSON.
     * @function toJSON
     * @memberof VersionInfo
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    VersionInfo.prototype.toJSON = function() {
        return VersionInfo.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the type url for VersionInfo
     * @function getTypeUrl
     * @memberof VersionInfo
     * @static
     * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns {string} The type url
     */
    VersionInfo.getTypeUrl = function(prefix) {
        if (prefix === $undefined)
            prefix = "type.googleapis.com";
        return prefix + "/VersionInfo";
    };

    return VersionInfo;
})();

export const SignedMessage = $root.SignedMessage = (() => {

    /**
     * Properties of a SignedMessage.
     * @typedef {Object} SignedMessage.$Properties
     * @property {SignedMessage.MessageType|null} [type] SignedMessage type
     * @property {Uint8Array|null} [msg] SignedMessage msg
     * @property {Uint8Array|null} [signature] SignedMessage signature
     * @property {Uint8Array|null} [sessionKey] SignedMessage sessionKey
     * @property {Uint8Array|null} [remoteAttestation] SignedMessage remoteAttestation
     * @property {Array.<MetricData.$Properties>|null} [metricData] SignedMessage metricData
     * @property {VersionInfo.$Properties|null} [serviceVersionInfo] SignedMessage serviceVersionInfo
     * @property {SignedMessage.SessionKeyType|null} [sessionKeyType] SignedMessage sessionKeyType
     * @property {Uint8Array|null} [oemcryptoCoreMessage] SignedMessage oemcryptoCoreMessage
     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
     */

    /**
     * Properties of a SignedMessage.
     * @exports ISignedMessage
     * @interface ISignedMessage
     * @augments SignedMessage.$Properties
     * @deprecated Use SignedMessage.$Properties instead.
     */

    /**
     * Shape of a SignedMessage.
     * @typedef {SignedMessage.$Properties} SignedMessage.$Shape
     */

    /**
     * Constructs a new SignedMessage.
     * @exports SignedMessage
     * @classdesc Represents a SignedMessage.
     * @constructor
     * @param {SignedMessage.$Properties=} [properties] Properties to set
     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
     */
    const SignedMessage = function (properties) {
        this.metricData = [];
        if (properties)
            for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    };

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
     * @member {Array.<MetricData.$Properties>} metricData
     * @memberof SignedMessage
     * @instance
     */
    SignedMessage.prototype.metricData = $util.emptyArray;

    /**
     * SignedMessage serviceVersionInfo.
     * @member {VersionInfo.$Properties|null|undefined} serviceVersionInfo
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
     * @param {SignedMessage.$Properties=} [properties] Properties to set
     * @returns {SignedMessage} SignedMessage instance
     * @type {{
     *   (properties: SignedMessage.$Shape): SignedMessage & SignedMessage.$Shape;
     *   (properties?: SignedMessage.$Properties): SignedMessage;
     * }}
     */
    SignedMessage.create = function(properties) {
        return new SignedMessage(properties);
    };

    /**
     * Encodes the specified SignedMessage message. Does not implicitly {@link SignedMessage.verify|verify} messages.
     * @function encode
     * @memberof SignedMessage
     * @static
     * @param {SignedMessage.$Properties} message SignedMessage message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    SignedMessage.encode = function (message, writer, _depth) {
        if (!writer)
            writer = new $Writer();
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        if (message.type != null && $Object.hasOwnProperty.call(message, "type"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.type);
        if (message.msg != null && $Object.hasOwnProperty.call(message, "msg"))
            writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.msg);
        if (message.signature != null && $Object.hasOwnProperty.call(message, "signature"))
            writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.signature);
        if (message.sessionKey != null && $Object.hasOwnProperty.call(message, "sessionKey"))
            writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.sessionKey);
        if (message.remoteAttestation != null && $Object.hasOwnProperty.call(message, "remoteAttestation"))
            writer.uint32(/* id 5, wireType 2 =*/42).bytes(message.remoteAttestation);
        if (message.metricData != null && message.metricData.length)
            for (let i = 0; i < message.metricData.length; ++i)
                $root.MetricData.encode(message.metricData[i], writer.uint32(/* id 6, wireType 2 =*/50).fork(), _depth + 1).ldelim();
        if (message.serviceVersionInfo != null && $Object.hasOwnProperty.call(message, "serviceVersionInfo"))
            $root.VersionInfo.encode(message.serviceVersionInfo, writer.uint32(/* id 7, wireType 2 =*/58).fork(), _depth + 1).ldelim();
        if (message.sessionKeyType != null && $Object.hasOwnProperty.call(message, "sessionKeyType"))
            writer.uint32(/* id 8, wireType 0 =*/64).int32(message.sessionKeyType);
        if (message.oemcryptoCoreMessage != null && $Object.hasOwnProperty.call(message, "oemcryptoCoreMessage"))
            writer.uint32(/* id 9, wireType 2 =*/74).bytes(message.oemcryptoCoreMessage);
        if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    /**
     * Encodes the specified SignedMessage message, length delimited. Does not implicitly {@link SignedMessage.verify|verify} messages.
     * @function encodeDelimited
     * @memberof SignedMessage
     * @static
     * @param {SignedMessage.$Properties} message SignedMessage message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    SignedMessage.encodeDelimited = function(message, writer) {
        return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
    };

    /**
     * Decodes a SignedMessage message from the specified reader or buffer.
     * @function decode
     * @memberof SignedMessage
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {SignedMessage & SignedMessage.$Shape} SignedMessage
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    SignedMessage.decode = function (reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw $Error("max depth exceeded");
        let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.SignedMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = $undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.type = reader.int32();
                    continue;
                }
            case 2: {
                    if (wireType !== 2)
                        break;
                    message.msg = reader.bytes();
                    continue;
                }
            case 3: {
                    if (wireType !== 2)
                        break;
                    message.signature = reader.bytes();
                    continue;
                }
            case 4: {
                    if (wireType !== 2)
                        break;
                    message.sessionKey = reader.bytes();
                    continue;
                }
            case 5: {
                    if (wireType !== 2)
                        break;
                    message.remoteAttestation = reader.bytes();
                    continue;
                }
            case 6: {
                    if (wireType !== 2)
                        break;
                    if (!(message.metricData && message.metricData.length))
                        message.metricData = [];
                    message.metricData.push($root.MetricData.decode(reader, reader.uint32(), $undefined, _depth + 1));
                    continue;
                }
            case 7: {
                    if (wireType !== 2)
                        break;
                    message.serviceVersionInfo = $root.VersionInfo.decode(reader, reader.uint32(), $undefined, _depth + 1, message.serviceVersionInfo);
                    continue;
                }
            case 8: {
                    if (wireType !== 0)
                        break;
                    message.sessionKeyType = reader.int32();
                    continue;
                }
            case 9: {
                    if (wireType !== 2)
                        break;
                    message.oemcryptoCoreMessage = reader.bytes();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            if (!reader.discardUnknown) {
                $util.makeProp(message, "$unknowns", false);
                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
            }
        }
        if (_end !== $undefined)
            throw $Error("missing end group");
        return message;
    };

    /**
     * Decodes a SignedMessage message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof SignedMessage
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {SignedMessage & SignedMessage.$Shape} SignedMessage
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    SignedMessage.decodeDelimited = function(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a SignedMessage message.
     * @function verify
     * @memberof SignedMessage
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    SignedMessage.verify = function (message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (message.type != null && $Object.hasOwnProperty.call(message, "type"))
            switch (message.type) {
            default:
                return "type: enum value expected";
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
            case 10:
                break;
            }
        if (message.msg != null && $Object.hasOwnProperty.call(message, "msg"))
            if (!(message.msg && typeof message.msg.length === "number" || $util.isString(message.msg)))
                return "msg: buffer expected";
        if (message.signature != null && $Object.hasOwnProperty.call(message, "signature"))
            if (!(message.signature && typeof message.signature.length === "number" || $util.isString(message.signature)))
                return "signature: buffer expected";
        if (message.sessionKey != null && $Object.hasOwnProperty.call(message, "sessionKey"))
            if (!(message.sessionKey && typeof message.sessionKey.length === "number" || $util.isString(message.sessionKey)))
                return "sessionKey: buffer expected";
        if (message.remoteAttestation != null && $Object.hasOwnProperty.call(message, "remoteAttestation"))
            if (!(message.remoteAttestation && typeof message.remoteAttestation.length === "number" || $util.isString(message.remoteAttestation)))
                return "remoteAttestation: buffer expected";
        if (message.metricData != null && $Object.hasOwnProperty.call(message, "metricData")) {
            if (!$Array.isArray(message.metricData))
                return "metricData: array expected";
            for (let i = 0; i < message.metricData.length; ++i) {
                let error = $root.MetricData.verify(message.metricData[i], _depth + 1);
                if (error)
                    return "metricData." + error;
            }
        }
        if (message.serviceVersionInfo != null && $Object.hasOwnProperty.call(message, "serviceVersionInfo")) {
            let error = $root.VersionInfo.verify(message.serviceVersionInfo, _depth + 1);
            if (error)
                return "serviceVersionInfo." + error;
        }
        if (message.sessionKeyType != null && $Object.hasOwnProperty.call(message, "sessionKeyType"))
            switch (message.sessionKeyType) {
            default:
                return "sessionKeyType: enum value expected";
            case 0:
            case 1:
            case 2:
                break;
            }
        if (message.oemcryptoCoreMessage != null && $Object.hasOwnProperty.call(message, "oemcryptoCoreMessage"))
            if (!(message.oemcryptoCoreMessage && typeof message.oemcryptoCoreMessage.length === "number" || $util.isString(message.oemcryptoCoreMessage)))
                return "oemcryptoCoreMessage: buffer expected";
        return null;
    };

    /**
     * Creates a SignedMessage message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof SignedMessage
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {SignedMessage} SignedMessage
     */
    SignedMessage.fromObject = function (object, _depth) {
        if (object instanceof $root.SignedMessage)
            return object;
        if (!$util.isObject(object))
            throw $TypeError(".SignedMessage: object expected");
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        let message = new $root.SignedMessage();
        switch (object.type) {
        default:
            if (typeof object.type === "number") {
                message.type = object.type;
                break;
            }
            break;
        case "LICENSE_REQUEST":
        case 1:
            message.type = 1;
            break;
        case "LICENSE":
        case 2:
            message.type = 2;
            break;
        case "ERROR_RESPONSE":
        case 3:
            message.type = 3;
            break;
        case "SERVICE_CERTIFICATE_REQUEST":
        case 4:
            message.type = 4;
            break;
        case "SERVICE_CERTIFICATE":
        case 5:
            message.type = 5;
            break;
        case "SUB_LICENSE":
        case 6:
            message.type = 6;
            break;
        case "CAS_LICENSE_REQUEST":
        case 7:
            message.type = 7;
            break;
        case "CAS_LICENSE":
        case 8:
            message.type = 8;
            break;
        case "EXTERNAL_LICENSE_REQUEST":
        case 9:
            message.type = 9;
            break;
        case "EXTERNAL_LICENSE":
        case 10:
            message.type = 10;
            break;
        }
        if (object.msg != null)
            if (typeof object.msg === "string")
                $util.base64.decode(object.msg, message.msg = $util.newBuffer($util.base64.length(object.msg)), 0);
            else if (object.msg.length >= 0)
                message.msg = object.msg;
        if (object.signature != null)
            if (typeof object.signature === "string")
                $util.base64.decode(object.signature, message.signature = $util.newBuffer($util.base64.length(object.signature)), 0);
            else if (object.signature.length >= 0)
                message.signature = object.signature;
        if (object.sessionKey != null)
            if (typeof object.sessionKey === "string")
                $util.base64.decode(object.sessionKey, message.sessionKey = $util.newBuffer($util.base64.length(object.sessionKey)), 0);
            else if (object.sessionKey.length >= 0)
                message.sessionKey = object.sessionKey;
        if (object.remoteAttestation != null)
            if (typeof object.remoteAttestation === "string")
                $util.base64.decode(object.remoteAttestation, message.remoteAttestation = $util.newBuffer($util.base64.length(object.remoteAttestation)), 0);
            else if (object.remoteAttestation.length >= 0)
                message.remoteAttestation = object.remoteAttestation;
        if (object.metricData) {
            if (!$Array.isArray(object.metricData))
                throw $TypeError(".SignedMessage.metricData: array expected");
            message.metricData = $Array(object.metricData.length);
            for (let i = 0; i < object.metricData.length; ++i) {
                if (!$util.isObject(object.metricData[i]))
                    throw $TypeError(".SignedMessage.metricData: object expected");
                message.metricData[i] = $root.MetricData.fromObject(object.metricData[i], _depth + 1);
            }
        }
        if (object.serviceVersionInfo != null) {
            if (!$util.isObject(object.serviceVersionInfo))
                throw $TypeError(".SignedMessage.serviceVersionInfo: object expected");
            message.serviceVersionInfo = $root.VersionInfo.fromObject(object.serviceVersionInfo, _depth + 1);
        }
        switch (object.sessionKeyType) {
        case "UNDEFINED":
        case 0:
            message.sessionKeyType = 0;
            break;
        default:
            if (typeof object.sessionKeyType === "number") {
                message.sessionKeyType = object.sessionKeyType;
                break;
            }
            break;
        case "WRAPPED_AES_KEY":
        case 1:
            message.sessionKeyType = 1;
            break;
        case "EPHERMERAL_ECC_PUBLIC_KEY":
        case 2:
            message.sessionKeyType = 2;
            break;
        }
        if (object.oemcryptoCoreMessage != null)
            if (typeof object.oemcryptoCoreMessage === "string")
                $util.base64.decode(object.oemcryptoCoreMessage, message.oemcryptoCoreMessage = $util.newBuffer($util.base64.length(object.oemcryptoCoreMessage)), 0);
            else if (object.oemcryptoCoreMessage.length >= 0)
                message.oemcryptoCoreMessage = object.oemcryptoCoreMessage;
        return message;
    };

    /**
     * Creates a plain object from a SignedMessage message. Also converts values to other types if specified.
     * @function toObject
     * @memberof SignedMessage
     * @static
     * @param {SignedMessage} message SignedMessage
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    SignedMessage.toObject = function (message, options, _depth) {
        if (!options)
            options = {};
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        let object = {};
        if (options.arrays || options.defaults)
            object.metricData = [];
        if (options.defaults) {
            object.type = options.enums === $String ? "LICENSE_REQUEST" : 1;
            if (options.bytes === $String)
                object.msg = "";
            else {
                object.msg = [];
                if (options.bytes !== $Array)
                    object.msg = $util.newBuffer(object.msg);
            }
            if (options.bytes === $String)
                object.signature = "";
            else {
                object.signature = [];
                if (options.bytes !== $Array)
                    object.signature = $util.newBuffer(object.signature);
            }
            if (options.bytes === $String)
                object.sessionKey = "";
            else {
                object.sessionKey = [];
                if (options.bytes !== $Array)
                    object.sessionKey = $util.newBuffer(object.sessionKey);
            }
            if (options.bytes === $String)
                object.remoteAttestation = "";
            else {
                object.remoteAttestation = [];
                if (options.bytes !== $Array)
                    object.remoteAttestation = $util.newBuffer(object.remoteAttestation);
            }
            object.serviceVersionInfo = null;
            object.sessionKeyType = options.enums === $String ? "WRAPPED_AES_KEY" : 1;
            if (options.bytes === $String)
                object.oemcryptoCoreMessage = "";
            else {
                object.oemcryptoCoreMessage = [];
                if (options.bytes !== $Array)
                    object.oemcryptoCoreMessage = $util.newBuffer(object.oemcryptoCoreMessage);
            }
        }
        if (message.type != null && $Object.hasOwnProperty.call(message, "type"))
            object.type = options.enums === $String ? $root.SignedMessage.MessageType[message.type] === $undefined ? message.type : $root.SignedMessage.MessageType[message.type] : message.type;
        if (message.msg != null && $Object.hasOwnProperty.call(message, "msg"))
            object.msg = options.bytes === $String ? $util.base64.encode(message.msg, 0, message.msg.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.msg) : message.msg;
        if (message.signature != null && $Object.hasOwnProperty.call(message, "signature"))
            object.signature = options.bytes === $String ? $util.base64.encode(message.signature, 0, message.signature.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.signature) : message.signature;
        if (message.sessionKey != null && $Object.hasOwnProperty.call(message, "sessionKey"))
            object.sessionKey = options.bytes === $String ? $util.base64.encode(message.sessionKey, 0, message.sessionKey.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.sessionKey) : message.sessionKey;
        if (message.remoteAttestation != null && $Object.hasOwnProperty.call(message, "remoteAttestation"))
            object.remoteAttestation = options.bytes === $String ? $util.base64.encode(message.remoteAttestation, 0, message.remoteAttestation.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.remoteAttestation) : message.remoteAttestation;
        if (message.metricData && message.metricData.length) {
            object.metricData = $Array(message.metricData.length);
            for (let j = 0; j < message.metricData.length; ++j)
                object.metricData[j] = $root.MetricData.toObject(message.metricData[j], options, _depth + 1);
        }
        if (message.serviceVersionInfo != null && $Object.hasOwnProperty.call(message, "serviceVersionInfo"))
            object.serviceVersionInfo = $root.VersionInfo.toObject(message.serviceVersionInfo, options, _depth + 1);
        if (message.sessionKeyType != null && $Object.hasOwnProperty.call(message, "sessionKeyType"))
            object.sessionKeyType = options.enums === $String ? $root.SignedMessage.SessionKeyType[message.sessionKeyType] === $undefined ? message.sessionKeyType : $root.SignedMessage.SessionKeyType[message.sessionKeyType] : message.sessionKeyType;
        if (message.oemcryptoCoreMessage != null && $Object.hasOwnProperty.call(message, "oemcryptoCoreMessage"))
            object.oemcryptoCoreMessage = options.bytes === $String ? $util.base64.encode(message.oemcryptoCoreMessage, 0, message.oemcryptoCoreMessage.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.oemcryptoCoreMessage) : message.oemcryptoCoreMessage;
        return object;
    };

    /**
     * Converts this SignedMessage to JSON.
     * @function toJSON
     * @memberof SignedMessage
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    SignedMessage.prototype.toJSON = function() {
        return SignedMessage.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the type url for SignedMessage
     * @function getTypeUrl
     * @memberof SignedMessage
     * @static
     * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns {string} The type url
     */
    SignedMessage.getTypeUrl = function(prefix) {
        if (prefix === $undefined)
            prefix = "type.googleapis.com";
        return prefix + "/SignedMessage";
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
    SignedMessage.MessageType = (function() {
        const valuesById = {}, values = $Object.create(valuesById);
        values[valuesById[1] = "LICENSE_REQUEST"] = 1;
        values[valuesById[2] = "LICENSE"] = 2;
        values[valuesById[3] = "ERROR_RESPONSE"] = 3;
        values[valuesById[4] = "SERVICE_CERTIFICATE_REQUEST"] = 4;
        values[valuesById[5] = "SERVICE_CERTIFICATE"] = 5;
        values[valuesById[6] = "SUB_LICENSE"] = 6;
        values[valuesById[7] = "CAS_LICENSE_REQUEST"] = 7;
        values[valuesById[8] = "CAS_LICENSE"] = 8;
        values[valuesById[9] = "EXTERNAL_LICENSE_REQUEST"] = 9;
        values[valuesById[10] = "EXTERNAL_LICENSE"] = 10;
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
    SignedMessage.SessionKeyType = (function() {
        const valuesById = {}, values = $Object.create(valuesById);
        values[valuesById[0] = "UNDEFINED"] = 0;
        values[valuesById[1] = "WRAPPED_AES_KEY"] = 1;
        values[valuesById[2] = "EPHERMERAL_ECC_PUBLIC_KEY"] = 2;
        return values;
    })();

    return SignedMessage;
})();

/**
 * HashAlgorithmProto enum.
 * @name HashAlgorithmProto
 * @enum {number}
 * @property {number} HASH_ALGORITHM_UNSPECIFIED=0 HASH_ALGORITHM_UNSPECIFIED value
 * @property {number} HASH_ALGORITHM_SHA_1=1 HASH_ALGORITHM_SHA_1 value
 * @property {number} HASH_ALGORITHM_SHA_256=2 HASH_ALGORITHM_SHA_256 value
 * @property {number} HASH_ALGORITHM_SHA_384=3 HASH_ALGORITHM_SHA_384 value
 */
export const HashAlgorithmProto = $root.HashAlgorithmProto = (() => {
    const valuesById = {}, values = $Object.create(valuesById);
    values[valuesById[0] = "HASH_ALGORITHM_UNSPECIFIED"] = 0;
    values[valuesById[1] = "HASH_ALGORITHM_SHA_1"] = 1;
    values[valuesById[2] = "HASH_ALGORITHM_SHA_256"] = 2;
    values[valuesById[3] = "HASH_ALGORITHM_SHA_384"] = 3;
    return values;
})();

export const ClientIdentification = $root.ClientIdentification = (() => {

    /**
     * Properties of a ClientIdentification.
     * @typedef {Object} ClientIdentification.$Properties
     * @property {ClientIdentification.TokenType|null} [type] ClientIdentification type
     * @property {Uint8Array|null} [token] ClientIdentification token
     * @property {Array.<ClientIdentification.NameValue.$Properties>|null} [clientInfo] ClientIdentification clientInfo
     * @property {Uint8Array|null} [providerClientToken] ClientIdentification providerClientToken
     * @property {number|null} [licenseCounter] ClientIdentification licenseCounter
     * @property {ClientIdentification.ClientCapabilities.$Properties|null} [clientCapabilities] ClientIdentification clientCapabilities
     * @property {Uint8Array|null} [vmpData] ClientIdentification vmpData
     * @property {Array.<ClientIdentification.ClientCredentials.$Properties>|null} [deviceCredentials] ClientIdentification deviceCredentials
     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
     */

    /**
     * Properties of a ClientIdentification.
     * @exports IClientIdentification
     * @interface IClientIdentification
     * @augments ClientIdentification.$Properties
     * @deprecated Use ClientIdentification.$Properties instead.
     */

    /**
     * Shape of a ClientIdentification.
     * @typedef {ClientIdentification.$Properties} ClientIdentification.$Shape
     */

    /**
     * Constructs a new ClientIdentification.
     * @exports ClientIdentification
     * @classdesc Represents a ClientIdentification.
     * @constructor
     * @param {ClientIdentification.$Properties=} [properties] Properties to set
     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
     */
    const ClientIdentification = function (properties) {
        this.clientInfo = [];
        this.deviceCredentials = [];
        if (properties)
            for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    };

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
     * @member {Array.<ClientIdentification.NameValue.$Properties>} clientInfo
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
     * @member {ClientIdentification.ClientCapabilities.$Properties|null|undefined} clientCapabilities
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
     * @member {Array.<ClientIdentification.ClientCredentials.$Properties>} deviceCredentials
     * @memberof ClientIdentification
     * @instance
     */
    ClientIdentification.prototype.deviceCredentials = $util.emptyArray;

    /**
     * Creates a new ClientIdentification instance using the specified properties.
     * @function create
     * @memberof ClientIdentification
     * @static
     * @param {ClientIdentification.$Properties=} [properties] Properties to set
     * @returns {ClientIdentification} ClientIdentification instance
     * @type {{
     *   (properties: ClientIdentification.$Shape): ClientIdentification & ClientIdentification.$Shape;
     *   (properties?: ClientIdentification.$Properties): ClientIdentification;
     * }}
     */
    ClientIdentification.create = function(properties) {
        return new ClientIdentification(properties);
    };

    /**
     * Encodes the specified ClientIdentification message. Does not implicitly {@link ClientIdentification.verify|verify} messages.
     * @function encode
     * @memberof ClientIdentification
     * @static
     * @param {ClientIdentification.$Properties} message ClientIdentification message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ClientIdentification.encode = function (message, writer, _depth) {
        if (!writer)
            writer = new $Writer();
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        if (message.type != null && $Object.hasOwnProperty.call(message, "type"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.type);
        if (message.token != null && $Object.hasOwnProperty.call(message, "token"))
            writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.token);
        if (message.clientInfo != null && message.clientInfo.length)
            for (let i = 0; i < message.clientInfo.length; ++i)
                $root.ClientIdentification.NameValue.encode(message.clientInfo[i], writer.uint32(/* id 3, wireType 2 =*/26).fork(), _depth + 1).ldelim();
        if (message.providerClientToken != null && $Object.hasOwnProperty.call(message, "providerClientToken"))
            writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.providerClientToken);
        if (message.licenseCounter != null && $Object.hasOwnProperty.call(message, "licenseCounter"))
            writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.licenseCounter);
        if (message.clientCapabilities != null && $Object.hasOwnProperty.call(message, "clientCapabilities"))
            $root.ClientIdentification.ClientCapabilities.encode(message.clientCapabilities, writer.uint32(/* id 6, wireType 2 =*/50).fork(), _depth + 1).ldelim();
        if (message.vmpData != null && $Object.hasOwnProperty.call(message, "vmpData"))
            writer.uint32(/* id 7, wireType 2 =*/58).bytes(message.vmpData);
        if (message.deviceCredentials != null && message.deviceCredentials.length)
            for (let i = 0; i < message.deviceCredentials.length; ++i)
                $root.ClientIdentification.ClientCredentials.encode(message.deviceCredentials[i], writer.uint32(/* id 8, wireType 2 =*/66).fork(), _depth + 1).ldelim();
        if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    /**
     * Encodes the specified ClientIdentification message, length delimited. Does not implicitly {@link ClientIdentification.verify|verify} messages.
     * @function encodeDelimited
     * @memberof ClientIdentification
     * @static
     * @param {ClientIdentification.$Properties} message ClientIdentification message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ClientIdentification.encodeDelimited = function(message, writer) {
        return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
    };

    /**
     * Decodes a ClientIdentification message from the specified reader or buffer.
     * @function decode
     * @memberof ClientIdentification
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {ClientIdentification & ClientIdentification.$Shape} ClientIdentification
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ClientIdentification.decode = function (reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw $Error("max depth exceeded");
        let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.ClientIdentification();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = $undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.type = reader.int32();
                    continue;
                }
            case 2: {
                    if (wireType !== 2)
                        break;
                    message.token = reader.bytes();
                    continue;
                }
            case 3: {
                    if (wireType !== 2)
                        break;
                    if (!(message.clientInfo && message.clientInfo.length))
                        message.clientInfo = [];
                    message.clientInfo.push($root.ClientIdentification.NameValue.decode(reader, reader.uint32(), $undefined, _depth + 1));
                    continue;
                }
            case 4: {
                    if (wireType !== 2)
                        break;
                    message.providerClientToken = reader.bytes();
                    continue;
                }
            case 5: {
                    if (wireType !== 0)
                        break;
                    message.licenseCounter = reader.uint32();
                    continue;
                }
            case 6: {
                    if (wireType !== 2)
                        break;
                    message.clientCapabilities = $root.ClientIdentification.ClientCapabilities.decode(reader, reader.uint32(), $undefined, _depth + 1, message.clientCapabilities);
                    continue;
                }
            case 7: {
                    if (wireType !== 2)
                        break;
                    message.vmpData = reader.bytes();
                    continue;
                }
            case 8: {
                    if (wireType !== 2)
                        break;
                    if (!(message.deviceCredentials && message.deviceCredentials.length))
                        message.deviceCredentials = [];
                    message.deviceCredentials.push($root.ClientIdentification.ClientCredentials.decode(reader, reader.uint32(), $undefined, _depth + 1));
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            if (!reader.discardUnknown) {
                $util.makeProp(message, "$unknowns", false);
                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
            }
        }
        if (_end !== $undefined)
            throw $Error("missing end group");
        return message;
    };

    /**
     * Decodes a ClientIdentification message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof ClientIdentification
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {ClientIdentification & ClientIdentification.$Shape} ClientIdentification
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ClientIdentification.decodeDelimited = function(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a ClientIdentification message.
     * @function verify
     * @memberof ClientIdentification
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    ClientIdentification.verify = function (message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (message.type != null && $Object.hasOwnProperty.call(message, "type"))
            switch (message.type) {
            default:
                return "type: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
                break;
            }
        if (message.token != null && $Object.hasOwnProperty.call(message, "token"))
            if (!(message.token && typeof message.token.length === "number" || $util.isString(message.token)))
                return "token: buffer expected";
        if (message.clientInfo != null && $Object.hasOwnProperty.call(message, "clientInfo")) {
            if (!$Array.isArray(message.clientInfo))
                return "clientInfo: array expected";
            for (let i = 0; i < message.clientInfo.length; ++i) {
                let error = $root.ClientIdentification.NameValue.verify(message.clientInfo[i], _depth + 1);
                if (error)
                    return "clientInfo." + error;
            }
        }
        if (message.providerClientToken != null && $Object.hasOwnProperty.call(message, "providerClientToken"))
            if (!(message.providerClientToken && typeof message.providerClientToken.length === "number" || $util.isString(message.providerClientToken)))
                return "providerClientToken: buffer expected";
        if (message.licenseCounter != null && $Object.hasOwnProperty.call(message, "licenseCounter"))
            if (!$util.isInteger(message.licenseCounter))
                return "licenseCounter: integer expected";
        if (message.clientCapabilities != null && $Object.hasOwnProperty.call(message, "clientCapabilities")) {
            let error = $root.ClientIdentification.ClientCapabilities.verify(message.clientCapabilities, _depth + 1);
            if (error)
                return "clientCapabilities." + error;
        }
        if (message.vmpData != null && $Object.hasOwnProperty.call(message, "vmpData"))
            if (!(message.vmpData && typeof message.vmpData.length === "number" || $util.isString(message.vmpData)))
                return "vmpData: buffer expected";
        if (message.deviceCredentials != null && $Object.hasOwnProperty.call(message, "deviceCredentials")) {
            if (!$Array.isArray(message.deviceCredentials))
                return "deviceCredentials: array expected";
            for (let i = 0; i < message.deviceCredentials.length; ++i) {
                let error = $root.ClientIdentification.ClientCredentials.verify(message.deviceCredentials[i], _depth + 1);
                if (error)
                    return "deviceCredentials." + error;
            }
        }
        return null;
    };

    /**
     * Creates a ClientIdentification message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof ClientIdentification
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {ClientIdentification} ClientIdentification
     */
    ClientIdentification.fromObject = function (object, _depth) {
        if (object instanceof $root.ClientIdentification)
            return object;
        if (!$util.isObject(object))
            throw $TypeError(".ClientIdentification: object expected");
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        let message = new $root.ClientIdentification();
        switch (object.type) {
        default:
            if (typeof object.type === "number") {
                message.type = object.type;
                break;
            }
            break;
        case "KEYBOX":
        case 0:
            message.type = 0;
            break;
        case "DRM_DEVICE_CERTIFICATE":
        case 1:
            message.type = 1;
            break;
        case "REMOTE_ATTESTATION_CERTIFICATE":
        case 2:
            message.type = 2;
            break;
        case "OEM_DEVICE_CERTIFICATE":
        case 3:
            message.type = 3;
            break;
        }
        if (object.token != null)
            if (typeof object.token === "string")
                $util.base64.decode(object.token, message.token = $util.newBuffer($util.base64.length(object.token)), 0);
            else if (object.token.length >= 0)
                message.token = object.token;
        if (object.clientInfo) {
            if (!$Array.isArray(object.clientInfo))
                throw $TypeError(".ClientIdentification.clientInfo: array expected");
            message.clientInfo = $Array(object.clientInfo.length);
            for (let i = 0; i < object.clientInfo.length; ++i) {
                if (!$util.isObject(object.clientInfo[i]))
                    throw $TypeError(".ClientIdentification.clientInfo: object expected");
                message.clientInfo[i] = $root.ClientIdentification.NameValue.fromObject(object.clientInfo[i], _depth + 1);
            }
        }
        if (object.providerClientToken != null)
            if (typeof object.providerClientToken === "string")
                $util.base64.decode(object.providerClientToken, message.providerClientToken = $util.newBuffer($util.base64.length(object.providerClientToken)), 0);
            else if (object.providerClientToken.length >= 0)
                message.providerClientToken = object.providerClientToken;
        if (object.licenseCounter != null)
            message.licenseCounter = object.licenseCounter >>> 0;
        if (object.clientCapabilities != null) {
            if (!$util.isObject(object.clientCapabilities))
                throw $TypeError(".ClientIdentification.clientCapabilities: object expected");
            message.clientCapabilities = $root.ClientIdentification.ClientCapabilities.fromObject(object.clientCapabilities, _depth + 1);
        }
        if (object.vmpData != null)
            if (typeof object.vmpData === "string")
                $util.base64.decode(object.vmpData, message.vmpData = $util.newBuffer($util.base64.length(object.vmpData)), 0);
            else if (object.vmpData.length >= 0)
                message.vmpData = object.vmpData;
        if (object.deviceCredentials) {
            if (!$Array.isArray(object.deviceCredentials))
                throw $TypeError(".ClientIdentification.deviceCredentials: array expected");
            message.deviceCredentials = $Array(object.deviceCredentials.length);
            for (let i = 0; i < object.deviceCredentials.length; ++i) {
                if (!$util.isObject(object.deviceCredentials[i]))
                    throw $TypeError(".ClientIdentification.deviceCredentials: object expected");
                message.deviceCredentials[i] = $root.ClientIdentification.ClientCredentials.fromObject(object.deviceCredentials[i], _depth + 1);
            }
        }
        return message;
    };

    /**
     * Creates a plain object from a ClientIdentification message. Also converts values to other types if specified.
     * @function toObject
     * @memberof ClientIdentification
     * @static
     * @param {ClientIdentification} message ClientIdentification
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    ClientIdentification.toObject = function (message, options, _depth) {
        if (!options)
            options = {};
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        let object = {};
        if (options.arrays || options.defaults) {
            object.clientInfo = [];
            object.deviceCredentials = [];
        }
        if (options.defaults) {
            object.type = options.enums === $String ? "KEYBOX" : 0;
            if (options.bytes === $String)
                object.token = "";
            else {
                object.token = [];
                if (options.bytes !== $Array)
                    object.token = $util.newBuffer(object.token);
            }
            if (options.bytes === $String)
                object.providerClientToken = "";
            else {
                object.providerClientToken = [];
                if (options.bytes !== $Array)
                    object.providerClientToken = $util.newBuffer(object.providerClientToken);
            }
            object.licenseCounter = 0;
            object.clientCapabilities = null;
            if (options.bytes === $String)
                object.vmpData = "";
            else {
                object.vmpData = [];
                if (options.bytes !== $Array)
                    object.vmpData = $util.newBuffer(object.vmpData);
            }
        }
        if (message.type != null && $Object.hasOwnProperty.call(message, "type"))
            object.type = options.enums === $String ? $root.ClientIdentification.TokenType[message.type] === $undefined ? message.type : $root.ClientIdentification.TokenType[message.type] : message.type;
        if (message.token != null && $Object.hasOwnProperty.call(message, "token"))
            object.token = options.bytes === $String ? $util.base64.encode(message.token, 0, message.token.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.token) : message.token;
        if (message.clientInfo && message.clientInfo.length) {
            object.clientInfo = $Array(message.clientInfo.length);
            for (let j = 0; j < message.clientInfo.length; ++j)
                object.clientInfo[j] = $root.ClientIdentification.NameValue.toObject(message.clientInfo[j], options, _depth + 1);
        }
        if (message.providerClientToken != null && $Object.hasOwnProperty.call(message, "providerClientToken"))
            object.providerClientToken = options.bytes === $String ? $util.base64.encode(message.providerClientToken, 0, message.providerClientToken.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.providerClientToken) : message.providerClientToken;
        if (message.licenseCounter != null && $Object.hasOwnProperty.call(message, "licenseCounter"))
            object.licenseCounter = message.licenseCounter;
        if (message.clientCapabilities != null && $Object.hasOwnProperty.call(message, "clientCapabilities"))
            object.clientCapabilities = $root.ClientIdentification.ClientCapabilities.toObject(message.clientCapabilities, options, _depth + 1);
        if (message.vmpData != null && $Object.hasOwnProperty.call(message, "vmpData"))
            object.vmpData = options.bytes === $String ? $util.base64.encode(message.vmpData, 0, message.vmpData.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.vmpData) : message.vmpData;
        if (message.deviceCredentials && message.deviceCredentials.length) {
            object.deviceCredentials = $Array(message.deviceCredentials.length);
            for (let j = 0; j < message.deviceCredentials.length; ++j)
                object.deviceCredentials[j] = $root.ClientIdentification.ClientCredentials.toObject(message.deviceCredentials[j], options, _depth + 1);
        }
        return object;
    };

    /**
     * Converts this ClientIdentification to JSON.
     * @function toJSON
     * @memberof ClientIdentification
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    ClientIdentification.prototype.toJSON = function() {
        return ClientIdentification.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the type url for ClientIdentification
     * @function getTypeUrl
     * @memberof ClientIdentification
     * @static
     * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns {string} The type url
     */
    ClientIdentification.getTypeUrl = function(prefix) {
        if (prefix === $undefined)
            prefix = "type.googleapis.com";
        return prefix + "/ClientIdentification";
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
    ClientIdentification.TokenType = (function() {
        const valuesById = {}, values = $Object.create(valuesById);
        values[valuesById[0] = "KEYBOX"] = 0;
        values[valuesById[1] = "DRM_DEVICE_CERTIFICATE"] = 1;
        values[valuesById[2] = "REMOTE_ATTESTATION_CERTIFICATE"] = 2;
        values[valuesById[3] = "OEM_DEVICE_CERTIFICATE"] = 3;
        return values;
    })();

    ClientIdentification.NameValue = (function() {

        /**
         * Properties of a NameValue.
         * @typedef {Object} ClientIdentification.NameValue.$Properties
         * @property {string|null} [name] NameValue name
         * @property {string|null} [value] NameValue value
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */

        /**
         * Properties of a NameValue.
         * @memberof ClientIdentification
         * @interface INameValue
         * @augments ClientIdentification.NameValue.$Properties
         * @deprecated Use ClientIdentification.NameValue.$Properties instead.
         */

        /**
         * Shape of a NameValue.
         * @typedef {ClientIdentification.NameValue.$Properties} ClientIdentification.NameValue.$Shape
         */

        /**
         * Constructs a new NameValue.
         * @memberof ClientIdentification
         * @classdesc Represents a NameValue.
         * @constructor
         * @param {ClientIdentification.NameValue.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */
        const NameValue = function (properties) {
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * NameValue name.
         * @member {string} name
         * @memberof ClientIdentification.NameValue
         * @instance
         */
        NameValue.prototype.name = "";

        /**
         * NameValue value.
         * @member {string} value
         * @memberof ClientIdentification.NameValue
         * @instance
         */
        NameValue.prototype.value = "";

        /**
         * Creates a new NameValue instance using the specified properties.
         * @function create
         * @memberof ClientIdentification.NameValue
         * @static
         * @param {ClientIdentification.NameValue.$Properties=} [properties] Properties to set
         * @returns {ClientIdentification.NameValue} NameValue instance
         * @type {{
         *   (properties: ClientIdentification.NameValue.$Shape): ClientIdentification.NameValue & ClientIdentification.NameValue.$Shape;
         *   (properties?: ClientIdentification.NameValue.$Properties): ClientIdentification.NameValue;
         * }}
         */
        NameValue.create = function(properties) {
            return new NameValue(properties);
        };

        /**
         * Encodes the specified NameValue message. Does not implicitly {@link ClientIdentification.NameValue.verify|verify} messages.
         * @function encode
         * @memberof ClientIdentification.NameValue
         * @static
         * @param {ClientIdentification.NameValue.$Properties} message NameValue message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        NameValue.encode = function (message, writer, _depth) {
            if (!writer)
                writer = new $Writer();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.name != null && $Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
            if (message.value != null && $Object.hasOwnProperty.call(message, "value"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.value);
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified NameValue message, length delimited. Does not implicitly {@link ClientIdentification.NameValue.verify|verify} messages.
         * @function encodeDelimited
         * @memberof ClientIdentification.NameValue
         * @static
         * @param {ClientIdentification.NameValue.$Properties} message NameValue message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        NameValue.encodeDelimited = function(message, writer) {
            return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
        };

        /**
         * Decodes a NameValue message from the specified reader or buffer.
         * @function decode
         * @memberof ClientIdentification.NameValue
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {ClientIdentification.NameValue & ClientIdentification.NameValue.$Shape} NameValue
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        NameValue.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.ClientIdentification.NameValue();
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        message.name = reader.string();
                        continue;
                    }
                case 2: {
                        if (wireType !== 2)
                            break;
                        message.value = reader.string();
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Decodes a NameValue message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof ClientIdentification.NameValue
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {ClientIdentification.NameValue & ClientIdentification.NameValue.$Shape} NameValue
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        NameValue.decodeDelimited = function(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a NameValue message.
         * @function verify
         * @memberof ClientIdentification.NameValue
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        NameValue.verify = function (message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (message.name != null && $Object.hasOwnProperty.call(message, "name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.value != null && $Object.hasOwnProperty.call(message, "value"))
                if (!$util.isString(message.value))
                    return "value: string expected";
            return null;
        };

        /**
         * Creates a NameValue message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof ClientIdentification.NameValue
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {ClientIdentification.NameValue} NameValue
         */
        NameValue.fromObject = function (object, _depth) {
            if (object instanceof $root.ClientIdentification.NameValue)
                return object;
            if (!$util.isObject(object))
                throw $TypeError(".ClientIdentification.NameValue: object expected");
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let message = new $root.ClientIdentification.NameValue();
            if (object.name != null)
                message.name = $String(object.name);
            if (object.value != null)
                message.value = $String(object.value);
            return message;
        };

        /**
         * Creates a plain object from a NameValue message. Also converts values to other types if specified.
         * @function toObject
         * @memberof ClientIdentification.NameValue
         * @static
         * @param {ClientIdentification.NameValue} message NameValue
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        NameValue.toObject = function (message, options, _depth) {
            if (!options)
                options = {};
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let object = {};
            if (options.defaults) {
                object.name = "";
                object.value = "";
            }
            if (message.name != null && $Object.hasOwnProperty.call(message, "name"))
                object.name = message.name;
            if (message.value != null && $Object.hasOwnProperty.call(message, "value"))
                object.value = message.value;
            return object;
        };

        /**
         * Converts this NameValue to JSON.
         * @function toJSON
         * @memberof ClientIdentification.NameValue
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        NameValue.prototype.toJSON = function() {
            return NameValue.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for NameValue
         * @function getTypeUrl
         * @memberof ClientIdentification.NameValue
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        NameValue.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/ClientIdentification.NameValue";
        };

        return NameValue;
    })();

    ClientIdentification.ClientCapabilities = (function() {

        /**
         * Properties of a ClientCapabilities.
         * @typedef {Object} ClientIdentification.ClientCapabilities.$Properties
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
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */

        /**
         * Properties of a ClientCapabilities.
         * @memberof ClientIdentification
         * @interface IClientCapabilities
         * @augments ClientIdentification.ClientCapabilities.$Properties
         * @deprecated Use ClientIdentification.ClientCapabilities.$Properties instead.
         */

        /**
         * Shape of a ClientCapabilities.
         * @typedef {ClientIdentification.ClientCapabilities.$Properties} ClientIdentification.ClientCapabilities.$Shape
         */

        /**
         * Constructs a new ClientCapabilities.
         * @memberof ClientIdentification
         * @classdesc Represents a ClientCapabilities.
         * @constructor
         * @param {ClientIdentification.ClientCapabilities.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */
        const ClientCapabilities = function (properties) {
            this.supportedCertificateKeyType = [];
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

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
         * @param {ClientIdentification.ClientCapabilities.$Properties=} [properties] Properties to set
         * @returns {ClientIdentification.ClientCapabilities} ClientCapabilities instance
         * @type {{
         *   (properties: ClientIdentification.ClientCapabilities.$Shape): ClientIdentification.ClientCapabilities & ClientIdentification.ClientCapabilities.$Shape;
         *   (properties?: ClientIdentification.ClientCapabilities.$Properties): ClientIdentification.ClientCapabilities;
         * }}
         */
        ClientCapabilities.create = function(properties) {
            return new ClientCapabilities(properties);
        };

        /**
         * Encodes the specified ClientCapabilities message. Does not implicitly {@link ClientIdentification.ClientCapabilities.verify|verify} messages.
         * @function encode
         * @memberof ClientIdentification.ClientCapabilities
         * @static
         * @param {ClientIdentification.ClientCapabilities.$Properties} message ClientCapabilities message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ClientCapabilities.encode = function (message, writer, _depth) {
            if (!writer)
                writer = new $Writer();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.clientToken != null && $Object.hasOwnProperty.call(message, "clientToken"))
                writer.uint32(/* id 1, wireType 0 =*/8).bool(message.clientToken);
            if (message.sessionToken != null && $Object.hasOwnProperty.call(message, "sessionToken"))
                writer.uint32(/* id 2, wireType 0 =*/16).bool(message.sessionToken);
            if (message.videoResolutionConstraints != null && $Object.hasOwnProperty.call(message, "videoResolutionConstraints"))
                writer.uint32(/* id 3, wireType 0 =*/24).bool(message.videoResolutionConstraints);
            if (message.maxHdcpVersion != null && $Object.hasOwnProperty.call(message, "maxHdcpVersion"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.maxHdcpVersion);
            if (message.oemCryptoApiVersion != null && $Object.hasOwnProperty.call(message, "oemCryptoApiVersion"))
                writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.oemCryptoApiVersion);
            if (message.antiRollbackUsageTable != null && $Object.hasOwnProperty.call(message, "antiRollbackUsageTable"))
                writer.uint32(/* id 6, wireType 0 =*/48).bool(message.antiRollbackUsageTable);
            if (message.srmVersion != null && $Object.hasOwnProperty.call(message, "srmVersion"))
                writer.uint32(/* id 7, wireType 0 =*/56).uint32(message.srmVersion);
            if (message.canUpdateSrm != null && $Object.hasOwnProperty.call(message, "canUpdateSrm"))
                writer.uint32(/* id 8, wireType 0 =*/64).bool(message.canUpdateSrm);
            if (message.supportedCertificateKeyType != null && message.supportedCertificateKeyType.length)
                for (let i = 0; i < message.supportedCertificateKeyType.length; ++i)
                    writer.uint32(/* id 9, wireType 0 =*/72).int32(message.supportedCertificateKeyType[i]);
            if (message.analogOutputCapabilities != null && $Object.hasOwnProperty.call(message, "analogOutputCapabilities"))
                writer.uint32(/* id 10, wireType 0 =*/80).int32(message.analogOutputCapabilities);
            if (message.canDisableAnalogOutput != null && $Object.hasOwnProperty.call(message, "canDisableAnalogOutput"))
                writer.uint32(/* id 11, wireType 0 =*/88).bool(message.canDisableAnalogOutput);
            if (message.resourceRatingTier != null && $Object.hasOwnProperty.call(message, "resourceRatingTier"))
                writer.uint32(/* id 12, wireType 0 =*/96).uint32(message.resourceRatingTier);
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified ClientCapabilities message, length delimited. Does not implicitly {@link ClientIdentification.ClientCapabilities.verify|verify} messages.
         * @function encodeDelimited
         * @memberof ClientIdentification.ClientCapabilities
         * @static
         * @param {ClientIdentification.ClientCapabilities.$Properties} message ClientCapabilities message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ClientCapabilities.encodeDelimited = function(message, writer) {
            return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
        };

        /**
         * Decodes a ClientCapabilities message from the specified reader or buffer.
         * @function decode
         * @memberof ClientIdentification.ClientCapabilities
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {ClientIdentification.ClientCapabilities & ClientIdentification.ClientCapabilities.$Shape} ClientCapabilities
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ClientCapabilities.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.ClientIdentification.ClientCapabilities();
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 0)
                            break;
                        message.clientToken = reader.bool();
                        continue;
                    }
                case 2: {
                        if (wireType !== 0)
                            break;
                        message.sessionToken = reader.bool();
                        continue;
                    }
                case 3: {
                        if (wireType !== 0)
                            break;
                        message.videoResolutionConstraints = reader.bool();
                        continue;
                    }
                case 4: {
                        if (wireType !== 0)
                            break;
                        message.maxHdcpVersion = reader.int32();
                        continue;
                    }
                case 5: {
                        if (wireType !== 0)
                            break;
                        message.oemCryptoApiVersion = reader.uint32();
                        continue;
                    }
                case 6: {
                        if (wireType !== 0)
                            break;
                        message.antiRollbackUsageTable = reader.bool();
                        continue;
                    }
                case 7: {
                        if (wireType !== 0)
                            break;
                        message.srmVersion = reader.uint32();
                        continue;
                    }
                case 8: {
                        if (wireType !== 0)
                            break;
                        message.canUpdateSrm = reader.bool();
                        continue;
                    }
                case 9: {
                        if (wireType === 2) {
                            if (!(message.supportedCertificateKeyType && message.supportedCertificateKeyType.length))
                                message.supportedCertificateKeyType = [];
                            let end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.supportedCertificateKeyType.push(reader.int32());
                            continue;
                        }
                        if (wireType !== 0)
                            break;
                        if (!(message.supportedCertificateKeyType && message.supportedCertificateKeyType.length))
                            message.supportedCertificateKeyType = [];
                        message.supportedCertificateKeyType.push(reader.int32());
                        continue;
                    }
                case 10: {
                        if (wireType !== 0)
                            break;
                        message.analogOutputCapabilities = reader.int32();
                        continue;
                    }
                case 11: {
                        if (wireType !== 0)
                            break;
                        message.canDisableAnalogOutput = reader.bool();
                        continue;
                    }
                case 12: {
                        if (wireType !== 0)
                            break;
                        message.resourceRatingTier = reader.uint32();
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Decodes a ClientCapabilities message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof ClientIdentification.ClientCapabilities
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {ClientIdentification.ClientCapabilities & ClientIdentification.ClientCapabilities.$Shape} ClientCapabilities
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ClientCapabilities.decodeDelimited = function(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ClientCapabilities message.
         * @function verify
         * @memberof ClientIdentification.ClientCapabilities
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ClientCapabilities.verify = function (message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (message.clientToken != null && $Object.hasOwnProperty.call(message, "clientToken"))
                if (typeof message.clientToken !== "boolean")
                    return "clientToken: boolean expected";
            if (message.sessionToken != null && $Object.hasOwnProperty.call(message, "sessionToken"))
                if (typeof message.sessionToken !== "boolean")
                    return "sessionToken: boolean expected";
            if (message.videoResolutionConstraints != null && $Object.hasOwnProperty.call(message, "videoResolutionConstraints"))
                if (typeof message.videoResolutionConstraints !== "boolean")
                    return "videoResolutionConstraints: boolean expected";
            if (message.maxHdcpVersion != null && $Object.hasOwnProperty.call(message, "maxHdcpVersion"))
                switch (message.maxHdcpVersion) {
                default:
                    return "maxHdcpVersion: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 255:
                    break;
                }
            if (message.oemCryptoApiVersion != null && $Object.hasOwnProperty.call(message, "oemCryptoApiVersion"))
                if (!$util.isInteger(message.oemCryptoApiVersion))
                    return "oemCryptoApiVersion: integer expected";
            if (message.antiRollbackUsageTable != null && $Object.hasOwnProperty.call(message, "antiRollbackUsageTable"))
                if (typeof message.antiRollbackUsageTable !== "boolean")
                    return "antiRollbackUsageTable: boolean expected";
            if (message.srmVersion != null && $Object.hasOwnProperty.call(message, "srmVersion"))
                if (!$util.isInteger(message.srmVersion))
                    return "srmVersion: integer expected";
            if (message.canUpdateSrm != null && $Object.hasOwnProperty.call(message, "canUpdateSrm"))
                if (typeof message.canUpdateSrm !== "boolean")
                    return "canUpdateSrm: boolean expected";
            if (message.supportedCertificateKeyType != null && $Object.hasOwnProperty.call(message, "supportedCertificateKeyType")) {
                if (!$Array.isArray(message.supportedCertificateKeyType))
                    return "supportedCertificateKeyType: array expected";
                for (let i = 0; i < message.supportedCertificateKeyType.length; ++i)
                    switch (message.supportedCertificateKeyType[i]) {
                    default:
                        return "supportedCertificateKeyType: enum value[] expected";
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                        break;
                    }
            }
            if (message.analogOutputCapabilities != null && $Object.hasOwnProperty.call(message, "analogOutputCapabilities"))
                switch (message.analogOutputCapabilities) {
                default:
                    return "analogOutputCapabilities: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                    break;
                }
            if (message.canDisableAnalogOutput != null && $Object.hasOwnProperty.call(message, "canDisableAnalogOutput"))
                if (typeof message.canDisableAnalogOutput !== "boolean")
                    return "canDisableAnalogOutput: boolean expected";
            if (message.resourceRatingTier != null && $Object.hasOwnProperty.call(message, "resourceRatingTier"))
                if (!$util.isInteger(message.resourceRatingTier))
                    return "resourceRatingTier: integer expected";
            return null;
        };

        /**
         * Creates a ClientCapabilities message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof ClientIdentification.ClientCapabilities
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {ClientIdentification.ClientCapabilities} ClientCapabilities
         */
        ClientCapabilities.fromObject = function (object, _depth) {
            if (object instanceof $root.ClientIdentification.ClientCapabilities)
                return object;
            if (!$util.isObject(object))
                throw $TypeError(".ClientIdentification.ClientCapabilities: object expected");
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let message = new $root.ClientIdentification.ClientCapabilities();
            if (object.clientToken != null)
                message.clientToken = $Boolean(object.clientToken);
            if (object.sessionToken != null)
                message.sessionToken = $Boolean(object.sessionToken);
            if (object.videoResolutionConstraints != null)
                message.videoResolutionConstraints = $Boolean(object.videoResolutionConstraints);
            switch (object.maxHdcpVersion) {
            default:
                if (typeof object.maxHdcpVersion === "number") {
                    message.maxHdcpVersion = object.maxHdcpVersion;
                    break;
                }
                break;
            case "HDCP_NONE":
            case 0:
                message.maxHdcpVersion = 0;
                break;
            case "HDCP_V1":
            case 1:
                message.maxHdcpVersion = 1;
                break;
            case "HDCP_V2":
            case 2:
                message.maxHdcpVersion = 2;
                break;
            case "HDCP_V2_1":
            case 3:
                message.maxHdcpVersion = 3;
                break;
            case "HDCP_V2_2":
            case 4:
                message.maxHdcpVersion = 4;
                break;
            case "HDCP_V2_3":
            case 5:
                message.maxHdcpVersion = 5;
                break;
            case "HDCP_NO_DIGITAL_OUTPUT":
            case 255:
                message.maxHdcpVersion = 255;
                break;
            }
            if (object.oemCryptoApiVersion != null)
                message.oemCryptoApiVersion = object.oemCryptoApiVersion >>> 0;
            if (object.antiRollbackUsageTable != null)
                message.antiRollbackUsageTable = $Boolean(object.antiRollbackUsageTable);
            if (object.srmVersion != null)
                message.srmVersion = object.srmVersion >>> 0;
            if (object.canUpdateSrm != null)
                message.canUpdateSrm = $Boolean(object.canUpdateSrm);
            if (object.supportedCertificateKeyType) {
                if (!$Array.isArray(object.supportedCertificateKeyType))
                    throw $TypeError(".ClientIdentification.ClientCapabilities.supportedCertificateKeyType: array expected");
                message.supportedCertificateKeyType = $Array(object.supportedCertificateKeyType.length);
                for (let i = 0; i < object.supportedCertificateKeyType.length; ++i)
                    switch (object.supportedCertificateKeyType[i]) {
                    default:
                        if (typeof object.supportedCertificateKeyType[i] === "number") {
                            message.supportedCertificateKeyType[i] = object.supportedCertificateKeyType[i];
                            break;
                        }
                    case "RSA_2048":
                    case 0:
                        message.supportedCertificateKeyType[i] = 0;
                        break;
                    case "RSA_3072":
                    case 1:
                        message.supportedCertificateKeyType[i] = 1;
                        break;
                    case "ECC_SECP256R1":
                    case 2:
                        message.supportedCertificateKeyType[i] = 2;
                        break;
                    case "ECC_SECP384R1":
                    case 3:
                        message.supportedCertificateKeyType[i] = 3;
                        break;
                    case "ECC_SECP521R1":
                    case 4:
                        message.supportedCertificateKeyType[i] = 4;
                        break;
                    }
            }
            switch (object.analogOutputCapabilities) {
            default:
                if (typeof object.analogOutputCapabilities === "number") {
                    message.analogOutputCapabilities = object.analogOutputCapabilities;
                    break;
                }
                break;
            case "ANALOG_OUTPUT_UNKNOWN":
            case 0:
                message.analogOutputCapabilities = 0;
                break;
            case "ANALOG_OUTPUT_NONE":
            case 1:
                message.analogOutputCapabilities = 1;
                break;
            case "ANALOG_OUTPUT_SUPPORTED":
            case 2:
                message.analogOutputCapabilities = 2;
                break;
            case "ANALOG_OUTPUT_SUPPORTS_CGMS_A":
            case 3:
                message.analogOutputCapabilities = 3;
                break;
            }
            if (object.canDisableAnalogOutput != null)
                message.canDisableAnalogOutput = $Boolean(object.canDisableAnalogOutput);
            if (object.resourceRatingTier != null)
                message.resourceRatingTier = object.resourceRatingTier >>> 0;
            return message;
        };

        /**
         * Creates a plain object from a ClientCapabilities message. Also converts values to other types if specified.
         * @function toObject
         * @memberof ClientIdentification.ClientCapabilities
         * @static
         * @param {ClientIdentification.ClientCapabilities} message ClientCapabilities
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ClientCapabilities.toObject = function (message, options, _depth) {
            if (!options)
                options = {};
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let object = {};
            if (options.arrays || options.defaults)
                object.supportedCertificateKeyType = [];
            if (options.defaults) {
                object.clientToken = false;
                object.sessionToken = false;
                object.videoResolutionConstraints = false;
                object.maxHdcpVersion = options.enums === $String ? "HDCP_NONE" : 0;
                object.oemCryptoApiVersion = 0;
                object.antiRollbackUsageTable = false;
                object.srmVersion = 0;
                object.canUpdateSrm = false;
                object.analogOutputCapabilities = options.enums === $String ? "ANALOG_OUTPUT_UNKNOWN" : 0;
                object.canDisableAnalogOutput = false;
                object.resourceRatingTier = 0;
            }
            if (message.clientToken != null && $Object.hasOwnProperty.call(message, "clientToken"))
                object.clientToken = message.clientToken;
            if (message.sessionToken != null && $Object.hasOwnProperty.call(message, "sessionToken"))
                object.sessionToken = message.sessionToken;
            if (message.videoResolutionConstraints != null && $Object.hasOwnProperty.call(message, "videoResolutionConstraints"))
                object.videoResolutionConstraints = message.videoResolutionConstraints;
            if (message.maxHdcpVersion != null && $Object.hasOwnProperty.call(message, "maxHdcpVersion"))
                object.maxHdcpVersion = options.enums === $String ? $root.ClientIdentification.ClientCapabilities.HdcpVersion[message.maxHdcpVersion] === $undefined ? message.maxHdcpVersion : $root.ClientIdentification.ClientCapabilities.HdcpVersion[message.maxHdcpVersion] : message.maxHdcpVersion;
            if (message.oemCryptoApiVersion != null && $Object.hasOwnProperty.call(message, "oemCryptoApiVersion"))
                object.oemCryptoApiVersion = message.oemCryptoApiVersion;
            if (message.antiRollbackUsageTable != null && $Object.hasOwnProperty.call(message, "antiRollbackUsageTable"))
                object.antiRollbackUsageTable = message.antiRollbackUsageTable;
            if (message.srmVersion != null && $Object.hasOwnProperty.call(message, "srmVersion"))
                object.srmVersion = message.srmVersion;
            if (message.canUpdateSrm != null && $Object.hasOwnProperty.call(message, "canUpdateSrm"))
                object.canUpdateSrm = message.canUpdateSrm;
            if (message.supportedCertificateKeyType && message.supportedCertificateKeyType.length) {
                object.supportedCertificateKeyType = $Array(message.supportedCertificateKeyType.length);
                for (let j = 0; j < message.supportedCertificateKeyType.length; ++j)
                    object.supportedCertificateKeyType[j] = options.enums === $String ? $root.ClientIdentification.ClientCapabilities.CertificateKeyType[message.supportedCertificateKeyType[j]] === $undefined ? message.supportedCertificateKeyType[j] : $root.ClientIdentification.ClientCapabilities.CertificateKeyType[message.supportedCertificateKeyType[j]] : message.supportedCertificateKeyType[j];
            }
            if (message.analogOutputCapabilities != null && $Object.hasOwnProperty.call(message, "analogOutputCapabilities"))
                object.analogOutputCapabilities = options.enums === $String ? $root.ClientIdentification.ClientCapabilities.AnalogOutputCapabilities[message.analogOutputCapabilities] === $undefined ? message.analogOutputCapabilities : $root.ClientIdentification.ClientCapabilities.AnalogOutputCapabilities[message.analogOutputCapabilities] : message.analogOutputCapabilities;
            if (message.canDisableAnalogOutput != null && $Object.hasOwnProperty.call(message, "canDisableAnalogOutput"))
                object.canDisableAnalogOutput = message.canDisableAnalogOutput;
            if (message.resourceRatingTier != null && $Object.hasOwnProperty.call(message, "resourceRatingTier"))
                object.resourceRatingTier = message.resourceRatingTier;
            return object;
        };

        /**
         * Converts this ClientCapabilities to JSON.
         * @function toJSON
         * @memberof ClientIdentification.ClientCapabilities
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ClientCapabilities.prototype.toJSON = function() {
            return ClientCapabilities.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for ClientCapabilities
         * @function getTypeUrl
         * @memberof ClientIdentification.ClientCapabilities
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        ClientCapabilities.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/ClientIdentification.ClientCapabilities";
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
        ClientCapabilities.HdcpVersion = (function() {
            const valuesById = {}, values = $Object.create(valuesById);
            values[valuesById[0] = "HDCP_NONE"] = 0;
            values[valuesById[1] = "HDCP_V1"] = 1;
            values[valuesById[2] = "HDCP_V2"] = 2;
            values[valuesById[3] = "HDCP_V2_1"] = 3;
            values[valuesById[4] = "HDCP_V2_2"] = 4;
            values[valuesById[5] = "HDCP_V2_3"] = 5;
            values[valuesById[255] = "HDCP_NO_DIGITAL_OUTPUT"] = 255;
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
        ClientCapabilities.CertificateKeyType = (function() {
            const valuesById = {}, values = $Object.create(valuesById);
            values[valuesById[0] = "RSA_2048"] = 0;
            values[valuesById[1] = "RSA_3072"] = 1;
            values[valuesById[2] = "ECC_SECP256R1"] = 2;
            values[valuesById[3] = "ECC_SECP384R1"] = 3;
            values[valuesById[4] = "ECC_SECP521R1"] = 4;
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
        ClientCapabilities.AnalogOutputCapabilities = (function() {
            const valuesById = {}, values = $Object.create(valuesById);
            values[valuesById[0] = "ANALOG_OUTPUT_UNKNOWN"] = 0;
            values[valuesById[1] = "ANALOG_OUTPUT_NONE"] = 1;
            values[valuesById[2] = "ANALOG_OUTPUT_SUPPORTED"] = 2;
            values[valuesById[3] = "ANALOG_OUTPUT_SUPPORTS_CGMS_A"] = 3;
            return values;
        })();

        return ClientCapabilities;
    })();

    ClientIdentification.ClientCredentials = (function() {

        /**
         * Properties of a ClientCredentials.
         * @typedef {Object} ClientIdentification.ClientCredentials.$Properties
         * @property {ClientIdentification.TokenType|null} [type] ClientCredentials type
         * @property {Uint8Array|null} [token] ClientCredentials token
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */

        /**
         * Properties of a ClientCredentials.
         * @memberof ClientIdentification
         * @interface IClientCredentials
         * @augments ClientIdentification.ClientCredentials.$Properties
         * @deprecated Use ClientIdentification.ClientCredentials.$Properties instead.
         */

        /**
         * Shape of a ClientCredentials.
         * @typedef {ClientIdentification.ClientCredentials.$Properties} ClientIdentification.ClientCredentials.$Shape
         */

        /**
         * Constructs a new ClientCredentials.
         * @memberof ClientIdentification
         * @classdesc Represents a ClientCredentials.
         * @constructor
         * @param {ClientIdentification.ClientCredentials.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */
        const ClientCredentials = function (properties) {
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

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
         * @param {ClientIdentification.ClientCredentials.$Properties=} [properties] Properties to set
         * @returns {ClientIdentification.ClientCredentials} ClientCredentials instance
         * @type {{
         *   (properties: ClientIdentification.ClientCredentials.$Shape): ClientIdentification.ClientCredentials & ClientIdentification.ClientCredentials.$Shape;
         *   (properties?: ClientIdentification.ClientCredentials.$Properties): ClientIdentification.ClientCredentials;
         * }}
         */
        ClientCredentials.create = function(properties) {
            return new ClientCredentials(properties);
        };

        /**
         * Encodes the specified ClientCredentials message. Does not implicitly {@link ClientIdentification.ClientCredentials.verify|verify} messages.
         * @function encode
         * @memberof ClientIdentification.ClientCredentials
         * @static
         * @param {ClientIdentification.ClientCredentials.$Properties} message ClientCredentials message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ClientCredentials.encode = function (message, writer, _depth) {
            if (!writer)
                writer = new $Writer();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.type != null && $Object.hasOwnProperty.call(message, "type"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.type);
            if (message.token != null && $Object.hasOwnProperty.call(message, "token"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.token);
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified ClientCredentials message, length delimited. Does not implicitly {@link ClientIdentification.ClientCredentials.verify|verify} messages.
         * @function encodeDelimited
         * @memberof ClientIdentification.ClientCredentials
         * @static
         * @param {ClientIdentification.ClientCredentials.$Properties} message ClientCredentials message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ClientCredentials.encodeDelimited = function(message, writer) {
            return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
        };

        /**
         * Decodes a ClientCredentials message from the specified reader or buffer.
         * @function decode
         * @memberof ClientIdentification.ClientCredentials
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {ClientIdentification.ClientCredentials & ClientIdentification.ClientCredentials.$Shape} ClientCredentials
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ClientCredentials.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.ClientIdentification.ClientCredentials();
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 0)
                            break;
                        message.type = reader.int32();
                        continue;
                    }
                case 2: {
                        if (wireType !== 2)
                            break;
                        message.token = reader.bytes();
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Decodes a ClientCredentials message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof ClientIdentification.ClientCredentials
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {ClientIdentification.ClientCredentials & ClientIdentification.ClientCredentials.$Shape} ClientCredentials
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ClientCredentials.decodeDelimited = function(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ClientCredentials message.
         * @function verify
         * @memberof ClientIdentification.ClientCredentials
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ClientCredentials.verify = function (message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (message.type != null && $Object.hasOwnProperty.call(message, "type"))
                switch (message.type) {
                default:
                    return "type: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                    break;
                }
            if (message.token != null && $Object.hasOwnProperty.call(message, "token"))
                if (!(message.token && typeof message.token.length === "number" || $util.isString(message.token)))
                    return "token: buffer expected";
            return null;
        };

        /**
         * Creates a ClientCredentials message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof ClientIdentification.ClientCredentials
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {ClientIdentification.ClientCredentials} ClientCredentials
         */
        ClientCredentials.fromObject = function (object, _depth) {
            if (object instanceof $root.ClientIdentification.ClientCredentials)
                return object;
            if (!$util.isObject(object))
                throw $TypeError(".ClientIdentification.ClientCredentials: object expected");
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let message = new $root.ClientIdentification.ClientCredentials();
            switch (object.type) {
            default:
                if (typeof object.type === "number") {
                    message.type = object.type;
                    break;
                }
                break;
            case "KEYBOX":
            case 0:
                message.type = 0;
                break;
            case "DRM_DEVICE_CERTIFICATE":
            case 1:
                message.type = 1;
                break;
            case "REMOTE_ATTESTATION_CERTIFICATE":
            case 2:
                message.type = 2;
                break;
            case "OEM_DEVICE_CERTIFICATE":
            case 3:
                message.type = 3;
                break;
            }
            if (object.token != null)
                if (typeof object.token === "string")
                    $util.base64.decode(object.token, message.token = $util.newBuffer($util.base64.length(object.token)), 0);
                else if (object.token.length >= 0)
                    message.token = object.token;
            return message;
        };

        /**
         * Creates a plain object from a ClientCredentials message. Also converts values to other types if specified.
         * @function toObject
         * @memberof ClientIdentification.ClientCredentials
         * @static
         * @param {ClientIdentification.ClientCredentials} message ClientCredentials
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ClientCredentials.toObject = function (message, options, _depth) {
            if (!options)
                options = {};
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let object = {};
            if (options.defaults) {
                object.type = options.enums === $String ? "KEYBOX" : 0;
                if (options.bytes === $String)
                    object.token = "";
                else {
                    object.token = [];
                    if (options.bytes !== $Array)
                        object.token = $util.newBuffer(object.token);
                }
            }
            if (message.type != null && $Object.hasOwnProperty.call(message, "type"))
                object.type = options.enums === $String ? $root.ClientIdentification.TokenType[message.type] === $undefined ? message.type : $root.ClientIdentification.TokenType[message.type] : message.type;
            if (message.token != null && $Object.hasOwnProperty.call(message, "token"))
                object.token = options.bytes === $String ? $util.base64.encode(message.token, 0, message.token.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.token) : message.token;
            return object;
        };

        /**
         * Converts this ClientCredentials to JSON.
         * @function toJSON
         * @memberof ClientIdentification.ClientCredentials
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ClientCredentials.prototype.toJSON = function() {
            return ClientCredentials.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for ClientCredentials
         * @function getTypeUrl
         * @memberof ClientIdentification.ClientCredentials
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        ClientCredentials.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/ClientIdentification.ClientCredentials";
        };

        return ClientCredentials;
    })();

    return ClientIdentification;
})();

export const EncryptedClientIdentification = $root.EncryptedClientIdentification = (() => {

    /**
     * Properties of an EncryptedClientIdentification.
     * @typedef {Object} EncryptedClientIdentification.$Properties
     * @property {string|null} [providerId] EncryptedClientIdentification providerId
     * @property {Uint8Array|null} [serviceCertificateSerialNumber] EncryptedClientIdentification serviceCertificateSerialNumber
     * @property {Uint8Array|null} [encryptedClientId] EncryptedClientIdentification encryptedClientId
     * @property {Uint8Array|null} [encryptedClientIdIv] EncryptedClientIdentification encryptedClientIdIv
     * @property {Uint8Array|null} [encryptedPrivacyKey] EncryptedClientIdentification encryptedPrivacyKey
     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
     */

    /**
     * Properties of an EncryptedClientIdentification.
     * @exports IEncryptedClientIdentification
     * @interface IEncryptedClientIdentification
     * @augments EncryptedClientIdentification.$Properties
     * @deprecated Use EncryptedClientIdentification.$Properties instead.
     */

    /**
     * Shape of an EncryptedClientIdentification.
     * @typedef {EncryptedClientIdentification.$Properties} EncryptedClientIdentification.$Shape
     */

    /**
     * Constructs a new EncryptedClientIdentification.
     * @exports EncryptedClientIdentification
     * @classdesc Represents an EncryptedClientIdentification.
     * @constructor
     * @param {EncryptedClientIdentification.$Properties=} [properties] Properties to set
     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
     */
    const EncryptedClientIdentification = function (properties) {
        if (properties)
            for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    };

    /**
     * EncryptedClientIdentification providerId.
     * @member {string} providerId
     * @memberof EncryptedClientIdentification
     * @instance
     */
    EncryptedClientIdentification.prototype.providerId = "";

    /**
     * EncryptedClientIdentification serviceCertificateSerialNumber.
     * @member {Uint8Array} serviceCertificateSerialNumber
     * @memberof EncryptedClientIdentification
     * @instance
     */
    EncryptedClientIdentification.prototype.serviceCertificateSerialNumber = $util.newBuffer([]);

    /**
     * EncryptedClientIdentification encryptedClientId.
     * @member {Uint8Array} encryptedClientId
     * @memberof EncryptedClientIdentification
     * @instance
     */
    EncryptedClientIdentification.prototype.encryptedClientId = $util.newBuffer([]);

    /**
     * EncryptedClientIdentification encryptedClientIdIv.
     * @member {Uint8Array} encryptedClientIdIv
     * @memberof EncryptedClientIdentification
     * @instance
     */
    EncryptedClientIdentification.prototype.encryptedClientIdIv = $util.newBuffer([]);

    /**
     * EncryptedClientIdentification encryptedPrivacyKey.
     * @member {Uint8Array} encryptedPrivacyKey
     * @memberof EncryptedClientIdentification
     * @instance
     */
    EncryptedClientIdentification.prototype.encryptedPrivacyKey = $util.newBuffer([]);

    /**
     * Creates a new EncryptedClientIdentification instance using the specified properties.
     * @function create
     * @memberof EncryptedClientIdentification
     * @static
     * @param {EncryptedClientIdentification.$Properties=} [properties] Properties to set
     * @returns {EncryptedClientIdentification} EncryptedClientIdentification instance
     * @type {{
     *   (properties: EncryptedClientIdentification.$Shape): EncryptedClientIdentification & EncryptedClientIdentification.$Shape;
     *   (properties?: EncryptedClientIdentification.$Properties): EncryptedClientIdentification;
     * }}
     */
    EncryptedClientIdentification.create = function(properties) {
        return new EncryptedClientIdentification(properties);
    };

    /**
     * Encodes the specified EncryptedClientIdentification message. Does not implicitly {@link EncryptedClientIdentification.verify|verify} messages.
     * @function encode
     * @memberof EncryptedClientIdentification
     * @static
     * @param {EncryptedClientIdentification.$Properties} message EncryptedClientIdentification message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    EncryptedClientIdentification.encode = function (message, writer, _depth) {
        if (!writer)
            writer = new $Writer();
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        if (message.providerId != null && $Object.hasOwnProperty.call(message, "providerId"))
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.providerId);
        if (message.serviceCertificateSerialNumber != null && $Object.hasOwnProperty.call(message, "serviceCertificateSerialNumber"))
            writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.serviceCertificateSerialNumber);
        if (message.encryptedClientId != null && $Object.hasOwnProperty.call(message, "encryptedClientId"))
            writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.encryptedClientId);
        if (message.encryptedClientIdIv != null && $Object.hasOwnProperty.call(message, "encryptedClientIdIv"))
            writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.encryptedClientIdIv);
        if (message.encryptedPrivacyKey != null && $Object.hasOwnProperty.call(message, "encryptedPrivacyKey"))
            writer.uint32(/* id 5, wireType 2 =*/42).bytes(message.encryptedPrivacyKey);
        if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    /**
     * Encodes the specified EncryptedClientIdentification message, length delimited. Does not implicitly {@link EncryptedClientIdentification.verify|verify} messages.
     * @function encodeDelimited
     * @memberof EncryptedClientIdentification
     * @static
     * @param {EncryptedClientIdentification.$Properties} message EncryptedClientIdentification message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    EncryptedClientIdentification.encodeDelimited = function(message, writer) {
        return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
    };

    /**
     * Decodes an EncryptedClientIdentification message from the specified reader or buffer.
     * @function decode
     * @memberof EncryptedClientIdentification
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {EncryptedClientIdentification & EncryptedClientIdentification.$Shape} EncryptedClientIdentification
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    EncryptedClientIdentification.decode = function (reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw $Error("max depth exceeded");
        let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.EncryptedClientIdentification();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = $undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 2)
                        break;
                    message.providerId = reader.string();
                    continue;
                }
            case 2: {
                    if (wireType !== 2)
                        break;
                    message.serviceCertificateSerialNumber = reader.bytes();
                    continue;
                }
            case 3: {
                    if (wireType !== 2)
                        break;
                    message.encryptedClientId = reader.bytes();
                    continue;
                }
            case 4: {
                    if (wireType !== 2)
                        break;
                    message.encryptedClientIdIv = reader.bytes();
                    continue;
                }
            case 5: {
                    if (wireType !== 2)
                        break;
                    message.encryptedPrivacyKey = reader.bytes();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            if (!reader.discardUnknown) {
                $util.makeProp(message, "$unknowns", false);
                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
            }
        }
        if (_end !== $undefined)
            throw $Error("missing end group");
        return message;
    };

    /**
     * Decodes an EncryptedClientIdentification message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof EncryptedClientIdentification
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {EncryptedClientIdentification & EncryptedClientIdentification.$Shape} EncryptedClientIdentification
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    EncryptedClientIdentification.decodeDelimited = function(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies an EncryptedClientIdentification message.
     * @function verify
     * @memberof EncryptedClientIdentification
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    EncryptedClientIdentification.verify = function (message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (message.providerId != null && $Object.hasOwnProperty.call(message, "providerId"))
            if (!$util.isString(message.providerId))
                return "providerId: string expected";
        if (message.serviceCertificateSerialNumber != null && $Object.hasOwnProperty.call(message, "serviceCertificateSerialNumber"))
            if (!(message.serviceCertificateSerialNumber && typeof message.serviceCertificateSerialNumber.length === "number" || $util.isString(message.serviceCertificateSerialNumber)))
                return "serviceCertificateSerialNumber: buffer expected";
        if (message.encryptedClientId != null && $Object.hasOwnProperty.call(message, "encryptedClientId"))
            if (!(message.encryptedClientId && typeof message.encryptedClientId.length === "number" || $util.isString(message.encryptedClientId)))
                return "encryptedClientId: buffer expected";
        if (message.encryptedClientIdIv != null && $Object.hasOwnProperty.call(message, "encryptedClientIdIv"))
            if (!(message.encryptedClientIdIv && typeof message.encryptedClientIdIv.length === "number" || $util.isString(message.encryptedClientIdIv)))
                return "encryptedClientIdIv: buffer expected";
        if (message.encryptedPrivacyKey != null && $Object.hasOwnProperty.call(message, "encryptedPrivacyKey"))
            if (!(message.encryptedPrivacyKey && typeof message.encryptedPrivacyKey.length === "number" || $util.isString(message.encryptedPrivacyKey)))
                return "encryptedPrivacyKey: buffer expected";
        return null;
    };

    /**
     * Creates an EncryptedClientIdentification message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof EncryptedClientIdentification
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {EncryptedClientIdentification} EncryptedClientIdentification
     */
    EncryptedClientIdentification.fromObject = function (object, _depth) {
        if (object instanceof $root.EncryptedClientIdentification)
            return object;
        if (!$util.isObject(object))
            throw $TypeError(".EncryptedClientIdentification: object expected");
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        let message = new $root.EncryptedClientIdentification();
        if (object.providerId != null)
            message.providerId = $String(object.providerId);
        if (object.serviceCertificateSerialNumber != null)
            if (typeof object.serviceCertificateSerialNumber === "string")
                $util.base64.decode(object.serviceCertificateSerialNumber, message.serviceCertificateSerialNumber = $util.newBuffer($util.base64.length(object.serviceCertificateSerialNumber)), 0);
            else if (object.serviceCertificateSerialNumber.length >= 0)
                message.serviceCertificateSerialNumber = object.serviceCertificateSerialNumber;
        if (object.encryptedClientId != null)
            if (typeof object.encryptedClientId === "string")
                $util.base64.decode(object.encryptedClientId, message.encryptedClientId = $util.newBuffer($util.base64.length(object.encryptedClientId)), 0);
            else if (object.encryptedClientId.length >= 0)
                message.encryptedClientId = object.encryptedClientId;
        if (object.encryptedClientIdIv != null)
            if (typeof object.encryptedClientIdIv === "string")
                $util.base64.decode(object.encryptedClientIdIv, message.encryptedClientIdIv = $util.newBuffer($util.base64.length(object.encryptedClientIdIv)), 0);
            else if (object.encryptedClientIdIv.length >= 0)
                message.encryptedClientIdIv = object.encryptedClientIdIv;
        if (object.encryptedPrivacyKey != null)
            if (typeof object.encryptedPrivacyKey === "string")
                $util.base64.decode(object.encryptedPrivacyKey, message.encryptedPrivacyKey = $util.newBuffer($util.base64.length(object.encryptedPrivacyKey)), 0);
            else if (object.encryptedPrivacyKey.length >= 0)
                message.encryptedPrivacyKey = object.encryptedPrivacyKey;
        return message;
    };

    /**
     * Creates a plain object from an EncryptedClientIdentification message. Also converts values to other types if specified.
     * @function toObject
     * @memberof EncryptedClientIdentification
     * @static
     * @param {EncryptedClientIdentification} message EncryptedClientIdentification
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    EncryptedClientIdentification.toObject = function (message, options, _depth) {
        if (!options)
            options = {};
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        let object = {};
        if (options.defaults) {
            object.providerId = "";
            if (options.bytes === $String)
                object.serviceCertificateSerialNumber = "";
            else {
                object.serviceCertificateSerialNumber = [];
                if (options.bytes !== $Array)
                    object.serviceCertificateSerialNumber = $util.newBuffer(object.serviceCertificateSerialNumber);
            }
            if (options.bytes === $String)
                object.encryptedClientId = "";
            else {
                object.encryptedClientId = [];
                if (options.bytes !== $Array)
                    object.encryptedClientId = $util.newBuffer(object.encryptedClientId);
            }
            if (options.bytes === $String)
                object.encryptedClientIdIv = "";
            else {
                object.encryptedClientIdIv = [];
                if (options.bytes !== $Array)
                    object.encryptedClientIdIv = $util.newBuffer(object.encryptedClientIdIv);
            }
            if (options.bytes === $String)
                object.encryptedPrivacyKey = "";
            else {
                object.encryptedPrivacyKey = [];
                if (options.bytes !== $Array)
                    object.encryptedPrivacyKey = $util.newBuffer(object.encryptedPrivacyKey);
            }
        }
        if (message.providerId != null && $Object.hasOwnProperty.call(message, "providerId"))
            object.providerId = message.providerId;
        if (message.serviceCertificateSerialNumber != null && $Object.hasOwnProperty.call(message, "serviceCertificateSerialNumber"))
            object.serviceCertificateSerialNumber = options.bytes === $String ? $util.base64.encode(message.serviceCertificateSerialNumber, 0, message.serviceCertificateSerialNumber.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.serviceCertificateSerialNumber) : message.serviceCertificateSerialNumber;
        if (message.encryptedClientId != null && $Object.hasOwnProperty.call(message, "encryptedClientId"))
            object.encryptedClientId = options.bytes === $String ? $util.base64.encode(message.encryptedClientId, 0, message.encryptedClientId.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.encryptedClientId) : message.encryptedClientId;
        if (message.encryptedClientIdIv != null && $Object.hasOwnProperty.call(message, "encryptedClientIdIv"))
            object.encryptedClientIdIv = options.bytes === $String ? $util.base64.encode(message.encryptedClientIdIv, 0, message.encryptedClientIdIv.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.encryptedClientIdIv) : message.encryptedClientIdIv;
        if (message.encryptedPrivacyKey != null && $Object.hasOwnProperty.call(message, "encryptedPrivacyKey"))
            object.encryptedPrivacyKey = options.bytes === $String ? $util.base64.encode(message.encryptedPrivacyKey, 0, message.encryptedPrivacyKey.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.encryptedPrivacyKey) : message.encryptedPrivacyKey;
        return object;
    };

    /**
     * Converts this EncryptedClientIdentification to JSON.
     * @function toJSON
     * @memberof EncryptedClientIdentification
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    EncryptedClientIdentification.prototype.toJSON = function() {
        return EncryptedClientIdentification.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the type url for EncryptedClientIdentification
     * @function getTypeUrl
     * @memberof EncryptedClientIdentification
     * @static
     * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns {string} The type url
     */
    EncryptedClientIdentification.getTypeUrl = function(prefix) {
        if (prefix === $undefined)
            prefix = "type.googleapis.com";
        return prefix + "/EncryptedClientIdentification";
    };

    return EncryptedClientIdentification;
})();

export const LicenseError = $root.LicenseError = (() => {

    /**
     * Properties of a LicenseError.
     * @typedef {Object} LicenseError.$Properties
     * @property {LicenseError.Error|null} [errorCode] LicenseError errorCode
     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
     */

    /**
     * Properties of a LicenseError.
     * @exports ILicenseError
     * @interface ILicenseError
     * @augments LicenseError.$Properties
     * @deprecated Use LicenseError.$Properties instead.
     */

    /**
     * Shape of a LicenseError.
     * @typedef {LicenseError.$Properties} LicenseError.$Shape
     */

    /**
     * Constructs a new LicenseError.
     * @exports LicenseError
     * @classdesc Represents a LicenseError.
     * @constructor
     * @param {LicenseError.$Properties=} [properties] Properties to set
     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
     */
    const LicenseError = function (properties) {
        if (properties)
            for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    };

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
     * @param {LicenseError.$Properties=} [properties] Properties to set
     * @returns {LicenseError} LicenseError instance
     * @type {{
     *   (properties: LicenseError.$Shape): LicenseError & LicenseError.$Shape;
     *   (properties?: LicenseError.$Properties): LicenseError;
     * }}
     */
    LicenseError.create = function(properties) {
        return new LicenseError(properties);
    };

    /**
     * Encodes the specified LicenseError message. Does not implicitly {@link LicenseError.verify|verify} messages.
     * @function encode
     * @memberof LicenseError
     * @static
     * @param {LicenseError.$Properties} message LicenseError message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    LicenseError.encode = function (message, writer, _depth) {
        if (!writer)
            writer = new $Writer();
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        if (message.errorCode != null && $Object.hasOwnProperty.call(message, "errorCode"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.errorCode);
        if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    /**
     * Encodes the specified LicenseError message, length delimited. Does not implicitly {@link LicenseError.verify|verify} messages.
     * @function encodeDelimited
     * @memberof LicenseError
     * @static
     * @param {LicenseError.$Properties} message LicenseError message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    LicenseError.encodeDelimited = function(message, writer) {
        return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
    };

    /**
     * Decodes a LicenseError message from the specified reader or buffer.
     * @function decode
     * @memberof LicenseError
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {LicenseError & LicenseError.$Shape} LicenseError
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    LicenseError.decode = function (reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw $Error("max depth exceeded");
        let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.LicenseError();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = $undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.errorCode = reader.int32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            if (!reader.discardUnknown) {
                $util.makeProp(message, "$unknowns", false);
                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
            }
        }
        if (_end !== $undefined)
            throw $Error("missing end group");
        return message;
    };

    /**
     * Decodes a LicenseError message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof LicenseError
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {LicenseError & LicenseError.$Shape} LicenseError
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    LicenseError.decodeDelimited = function(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a LicenseError message.
     * @function verify
     * @memberof LicenseError
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    LicenseError.verify = function (message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (message.errorCode != null && $Object.hasOwnProperty.call(message, "errorCode"))
            switch (message.errorCode) {
            default:
                return "errorCode: enum value expected";
            case 1:
            case 2:
            case 3:
                break;
            }
        return null;
    };

    /**
     * Creates a LicenseError message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof LicenseError
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {LicenseError} LicenseError
     */
    LicenseError.fromObject = function (object, _depth) {
        if (object instanceof $root.LicenseError)
            return object;
        if (!$util.isObject(object))
            throw $TypeError(".LicenseError: object expected");
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        let message = new $root.LicenseError();
        switch (object.errorCode) {
        default:
            if (typeof object.errorCode === "number") {
                message.errorCode = object.errorCode;
                break;
            }
            break;
        case "INVALID_DEVICE_CERTIFICATE":
        case 1:
            message.errorCode = 1;
            break;
        case "REVOKED_DEVICE_CERTIFICATE":
        case 2:
            message.errorCode = 2;
            break;
        case "SERVICE_UNAVAILABLE":
        case 3:
            message.errorCode = 3;
            break;
        }
        return message;
    };

    /**
     * Creates a plain object from a LicenseError message. Also converts values to other types if specified.
     * @function toObject
     * @memberof LicenseError
     * @static
     * @param {LicenseError} message LicenseError
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    LicenseError.toObject = function (message, options, _depth) {
        if (!options)
            options = {};
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        let object = {};
        if (options.defaults)
            object.errorCode = options.enums === $String ? "INVALID_DEVICE_CERTIFICATE" : 1;
        if (message.errorCode != null && $Object.hasOwnProperty.call(message, "errorCode"))
            object.errorCode = options.enums === $String ? $root.LicenseError.Error[message.errorCode] === $undefined ? message.errorCode : $root.LicenseError.Error[message.errorCode] : message.errorCode;
        return object;
    };

    /**
     * Converts this LicenseError to JSON.
     * @function toJSON
     * @memberof LicenseError
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    LicenseError.prototype.toJSON = function() {
        return LicenseError.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the type url for LicenseError
     * @function getTypeUrl
     * @memberof LicenseError
     * @static
     * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns {string} The type url
     */
    LicenseError.getTypeUrl = function(prefix) {
        if (prefix === $undefined)
            prefix = "type.googleapis.com";
        return prefix + "/LicenseError";
    };

    /**
     * Error enum.
     * @name LicenseError.Error
     * @enum {number}
     * @property {number} INVALID_DEVICE_CERTIFICATE=1 INVALID_DEVICE_CERTIFICATE value
     * @property {number} REVOKED_DEVICE_CERTIFICATE=2 REVOKED_DEVICE_CERTIFICATE value
     * @property {number} SERVICE_UNAVAILABLE=3 SERVICE_UNAVAILABLE value
     */
    LicenseError.Error = (function() {
        const valuesById = {}, values = $Object.create(valuesById);
        values[valuesById[1] = "INVALID_DEVICE_CERTIFICATE"] = 1;
        values[valuesById[2] = "REVOKED_DEVICE_CERTIFICATE"] = 2;
        values[valuesById[3] = "SERVICE_UNAVAILABLE"] = 3;
        return values;
    })();

    return LicenseError;
})();

export const DrmCertificate = $root.DrmCertificate = (() => {

    /**
     * Properties of a DrmCertificate.
     * @typedef {Object} DrmCertificate.$Properties
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
     * @property {DrmCertificate.EncryptionKey.$Properties|null} [encryptionKey] DrmCertificate encryptionKey
     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
     */

    /**
     * Properties of a DrmCertificate.
     * @exports IDrmCertificate
     * @interface IDrmCertificate
     * @augments DrmCertificate.$Properties
     * @deprecated Use DrmCertificate.$Properties instead.
     */

    /**
     * Shape of a DrmCertificate.
     * @typedef {DrmCertificate.$Properties} DrmCertificate.$Shape
     */

    /**
     * Constructs a new DrmCertificate.
     * @exports DrmCertificate
     * @classdesc Represents a DrmCertificate.
     * @constructor
     * @param {DrmCertificate.$Properties=} [properties] Properties to set
     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
     */
    const DrmCertificate = function (properties) {
        this.serviceTypes = [];
        if (properties)
            for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    };

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
    DrmCertificate.prototype.providerId = "";

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
     * @member {DrmCertificate.EncryptionKey.$Properties|null|undefined} encryptionKey
     * @memberof DrmCertificate
     * @instance
     */
    DrmCertificate.prototype.encryptionKey = null;

    /**
     * Creates a new DrmCertificate instance using the specified properties.
     * @function create
     * @memberof DrmCertificate
     * @static
     * @param {DrmCertificate.$Properties=} [properties] Properties to set
     * @returns {DrmCertificate} DrmCertificate instance
     * @type {{
     *   (properties: DrmCertificate.$Shape): DrmCertificate & DrmCertificate.$Shape;
     *   (properties?: DrmCertificate.$Properties): DrmCertificate;
     * }}
     */
    DrmCertificate.create = function(properties) {
        return new DrmCertificate(properties);
    };

    /**
     * Encodes the specified DrmCertificate message. Does not implicitly {@link DrmCertificate.verify|verify} messages.
     * @function encode
     * @memberof DrmCertificate
     * @static
     * @param {DrmCertificate.$Properties} message DrmCertificate message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    DrmCertificate.encode = function (message, writer, _depth) {
        if (!writer)
            writer = new $Writer();
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        if (message.type != null && $Object.hasOwnProperty.call(message, "type"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.type);
        if (message.serialNumber != null && $Object.hasOwnProperty.call(message, "serialNumber"))
            writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.serialNumber);
        if (message.creationTimeSeconds != null && $Object.hasOwnProperty.call(message, "creationTimeSeconds"))
            writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.creationTimeSeconds);
        if (message.publicKey != null && $Object.hasOwnProperty.call(message, "publicKey"))
            writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.publicKey);
        if (message.systemId != null && $Object.hasOwnProperty.call(message, "systemId"))
            writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.systemId);
        if (message.testDeviceDeprecated != null && $Object.hasOwnProperty.call(message, "testDeviceDeprecated"))
            writer.uint32(/* id 6, wireType 0 =*/48).bool(message.testDeviceDeprecated);
        if (message.providerId != null && $Object.hasOwnProperty.call(message, "providerId"))
            writer.uint32(/* id 7, wireType 2 =*/58).string(message.providerId);
        if (message.serviceTypes != null && message.serviceTypes.length)
            for (let i = 0; i < message.serviceTypes.length; ++i)
                writer.uint32(/* id 8, wireType 0 =*/64).int32(message.serviceTypes[i]);
        if (message.algorithm != null && $Object.hasOwnProperty.call(message, "algorithm"))
            writer.uint32(/* id 9, wireType 0 =*/72).int32(message.algorithm);
        if (message.rotId != null && $Object.hasOwnProperty.call(message, "rotId"))
            writer.uint32(/* id 10, wireType 2 =*/82).bytes(message.rotId);
        if (message.encryptionKey != null && $Object.hasOwnProperty.call(message, "encryptionKey"))
            $root.DrmCertificate.EncryptionKey.encode(message.encryptionKey, writer.uint32(/* id 11, wireType 2 =*/90).fork(), _depth + 1).ldelim();
        if (message.expirationTimeSeconds != null && $Object.hasOwnProperty.call(message, "expirationTimeSeconds"))
            writer.uint32(/* id 12, wireType 0 =*/96).uint32(message.expirationTimeSeconds);
        if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    /**
     * Encodes the specified DrmCertificate message, length delimited. Does not implicitly {@link DrmCertificate.verify|verify} messages.
     * @function encodeDelimited
     * @memberof DrmCertificate
     * @static
     * @param {DrmCertificate.$Properties} message DrmCertificate message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    DrmCertificate.encodeDelimited = function(message, writer) {
        return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
    };

    /**
     * Decodes a DrmCertificate message from the specified reader or buffer.
     * @function decode
     * @memberof DrmCertificate
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {DrmCertificate & DrmCertificate.$Shape} DrmCertificate
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    DrmCertificate.decode = function (reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw $Error("max depth exceeded");
        let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.DrmCertificate();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = $undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.type = reader.int32();
                    continue;
                }
            case 2: {
                    if (wireType !== 2)
                        break;
                    message.serialNumber = reader.bytes();
                    continue;
                }
            case 3: {
                    if (wireType !== 0)
                        break;
                    message.creationTimeSeconds = reader.uint32();
                    continue;
                }
            case 12: {
                    if (wireType !== 0)
                        break;
                    message.expirationTimeSeconds = reader.uint32();
                    continue;
                }
            case 4: {
                    if (wireType !== 2)
                        break;
                    message.publicKey = reader.bytes();
                    continue;
                }
            case 5: {
                    if (wireType !== 0)
                        break;
                    message.systemId = reader.uint32();
                    continue;
                }
            case 6: {
                    if (wireType !== 0)
                        break;
                    message.testDeviceDeprecated = reader.bool();
                    continue;
                }
            case 7: {
                    if (wireType !== 2)
                        break;
                    message.providerId = reader.string();
                    continue;
                }
            case 8: {
                    if (wireType === 2) {
                        if (!(message.serviceTypes && message.serviceTypes.length))
                            message.serviceTypes = [];
                        let end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2)
                            message.serviceTypes.push(reader.int32());
                        continue;
                    }
                    if (wireType !== 0)
                        break;
                    if (!(message.serviceTypes && message.serviceTypes.length))
                        message.serviceTypes = [];
                    message.serviceTypes.push(reader.int32());
                    continue;
                }
            case 9: {
                    if (wireType !== 0)
                        break;
                    message.algorithm = reader.int32();
                    continue;
                }
            case 10: {
                    if (wireType !== 2)
                        break;
                    message.rotId = reader.bytes();
                    continue;
                }
            case 11: {
                    if (wireType !== 2)
                        break;
                    message.encryptionKey = $root.DrmCertificate.EncryptionKey.decode(reader, reader.uint32(), $undefined, _depth + 1, message.encryptionKey);
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            if (!reader.discardUnknown) {
                $util.makeProp(message, "$unknowns", false);
                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
            }
        }
        if (_end !== $undefined)
            throw $Error("missing end group");
        return message;
    };

    /**
     * Decodes a DrmCertificate message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof DrmCertificate
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {DrmCertificate & DrmCertificate.$Shape} DrmCertificate
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    DrmCertificate.decodeDelimited = function(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a DrmCertificate message.
     * @function verify
     * @memberof DrmCertificate
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    DrmCertificate.verify = function (message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (message.type != null && $Object.hasOwnProperty.call(message, "type"))
            switch (message.type) {
            default:
                return "type: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
                break;
            }
        if (message.serialNumber != null && $Object.hasOwnProperty.call(message, "serialNumber"))
            if (!(message.serialNumber && typeof message.serialNumber.length === "number" || $util.isString(message.serialNumber)))
                return "serialNumber: buffer expected";
        if (message.creationTimeSeconds != null && $Object.hasOwnProperty.call(message, "creationTimeSeconds"))
            if (!$util.isInteger(message.creationTimeSeconds))
                return "creationTimeSeconds: integer expected";
        if (message.expirationTimeSeconds != null && $Object.hasOwnProperty.call(message, "expirationTimeSeconds"))
            if (!$util.isInteger(message.expirationTimeSeconds))
                return "expirationTimeSeconds: integer expected";
        if (message.publicKey != null && $Object.hasOwnProperty.call(message, "publicKey"))
            if (!(message.publicKey && typeof message.publicKey.length === "number" || $util.isString(message.publicKey)))
                return "publicKey: buffer expected";
        if (message.systemId != null && $Object.hasOwnProperty.call(message, "systemId"))
            if (!$util.isInteger(message.systemId))
                return "systemId: integer expected";
        if (message.testDeviceDeprecated != null && $Object.hasOwnProperty.call(message, "testDeviceDeprecated"))
            if (typeof message.testDeviceDeprecated !== "boolean")
                return "testDeviceDeprecated: boolean expected";
        if (message.providerId != null && $Object.hasOwnProperty.call(message, "providerId"))
            if (!$util.isString(message.providerId))
                return "providerId: string expected";
        if (message.serviceTypes != null && $Object.hasOwnProperty.call(message, "serviceTypes")) {
            if (!$Array.isArray(message.serviceTypes))
                return "serviceTypes: array expected";
            for (let i = 0; i < message.serviceTypes.length; ++i)
                switch (message.serviceTypes[i]) {
                default:
                    return "serviceTypes: enum value[] expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                    break;
                }
        }
        if (message.algorithm != null && $Object.hasOwnProperty.call(message, "algorithm"))
            switch (message.algorithm) {
            default:
                return "algorithm: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
                break;
            }
        if (message.rotId != null && $Object.hasOwnProperty.call(message, "rotId"))
            if (!(message.rotId && typeof message.rotId.length === "number" || $util.isString(message.rotId)))
                return "rotId: buffer expected";
        if (message.encryptionKey != null && $Object.hasOwnProperty.call(message, "encryptionKey")) {
            let error = $root.DrmCertificate.EncryptionKey.verify(message.encryptionKey, _depth + 1);
            if (error)
                return "encryptionKey." + error;
        }
        return null;
    };

    /**
     * Creates a DrmCertificate message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof DrmCertificate
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {DrmCertificate} DrmCertificate
     */
    DrmCertificate.fromObject = function (object, _depth) {
        if (object instanceof $root.DrmCertificate)
            return object;
        if (!$util.isObject(object))
            throw $TypeError(".DrmCertificate: object expected");
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        let message = new $root.DrmCertificate();
        switch (object.type) {
        default:
            if (typeof object.type === "number") {
                message.type = object.type;
                break;
            }
            break;
        case "ROOT":
        case 0:
            message.type = 0;
            break;
        case "DEVICE_MODEL":
        case 1:
            message.type = 1;
            break;
        case "DEVICE":
        case 2:
            message.type = 2;
            break;
        case "SERVICE":
        case 3:
            message.type = 3;
            break;
        case "PROVISIONER":
        case 4:
            message.type = 4;
            break;
        }
        if (object.serialNumber != null)
            if (typeof object.serialNumber === "string")
                $util.base64.decode(object.serialNumber, message.serialNumber = $util.newBuffer($util.base64.length(object.serialNumber)), 0);
            else if (object.serialNumber.length >= 0)
                message.serialNumber = object.serialNumber;
        if (object.creationTimeSeconds != null)
            message.creationTimeSeconds = object.creationTimeSeconds >>> 0;
        if (object.expirationTimeSeconds != null)
            message.expirationTimeSeconds = object.expirationTimeSeconds >>> 0;
        if (object.publicKey != null)
            if (typeof object.publicKey === "string")
                $util.base64.decode(object.publicKey, message.publicKey = $util.newBuffer($util.base64.length(object.publicKey)), 0);
            else if (object.publicKey.length >= 0)
                message.publicKey = object.publicKey;
        if (object.systemId != null)
            message.systemId = object.systemId >>> 0;
        if (object.testDeviceDeprecated != null)
            message.testDeviceDeprecated = $Boolean(object.testDeviceDeprecated);
        if (object.providerId != null)
            message.providerId = $String(object.providerId);
        if (object.serviceTypes) {
            if (!$Array.isArray(object.serviceTypes))
                throw $TypeError(".DrmCertificate.serviceTypes: array expected");
            message.serviceTypes = $Array(object.serviceTypes.length);
            for (let i = 0; i < object.serviceTypes.length; ++i)
                switch (object.serviceTypes[i]) {
                default:
                    if (typeof object.serviceTypes[i] === "number") {
                        message.serviceTypes[i] = object.serviceTypes[i];
                        break;
                    }
                case "UNKNOWN_SERVICE_TYPE":
                case 0:
                    message.serviceTypes[i] = 0;
                    break;
                case "LICENSE_SERVER_SDK":
                case 1:
                    message.serviceTypes[i] = 1;
                    break;
                case "LICENSE_SERVER_PROXY_SDK":
                case 2:
                    message.serviceTypes[i] = 2;
                    break;
                case "PROVISIONING_SDK":
                case 3:
                    message.serviceTypes[i] = 3;
                    break;
                case "CAS_PROXY_SDK":
                case 4:
                    message.serviceTypes[i] = 4;
                    break;
                }
        }
        switch (object.algorithm) {
        case "UNKNOWN_ALGORITHM":
        case 0:
            message.algorithm = 0;
            break;
        default:
            if (typeof object.algorithm === "number") {
                message.algorithm = object.algorithm;
                break;
            }
            break;
        case "RSA":
        case 1:
            message.algorithm = 1;
            break;
        case "ECC_SECP256R1":
        case 2:
            message.algorithm = 2;
            break;
        case "ECC_SECP384R1":
        case 3:
            message.algorithm = 3;
            break;
        case "ECC_SECP521R1":
        case 4:
            message.algorithm = 4;
            break;
        }
        if (object.rotId != null)
            if (typeof object.rotId === "string")
                $util.base64.decode(object.rotId, message.rotId = $util.newBuffer($util.base64.length(object.rotId)), 0);
            else if (object.rotId.length >= 0)
                message.rotId = object.rotId;
        if (object.encryptionKey != null) {
            if (!$util.isObject(object.encryptionKey))
                throw $TypeError(".DrmCertificate.encryptionKey: object expected");
            message.encryptionKey = $root.DrmCertificate.EncryptionKey.fromObject(object.encryptionKey, _depth + 1);
        }
        return message;
    };

    /**
     * Creates a plain object from a DrmCertificate message. Also converts values to other types if specified.
     * @function toObject
     * @memberof DrmCertificate
     * @static
     * @param {DrmCertificate} message DrmCertificate
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    DrmCertificate.toObject = function (message, options, _depth) {
        if (!options)
            options = {};
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        let object = {};
        if (options.arrays || options.defaults)
            object.serviceTypes = [];
        if (options.defaults) {
            object.type = options.enums === $String ? "ROOT" : 0;
            if (options.bytes === $String)
                object.serialNumber = "";
            else {
                object.serialNumber = [];
                if (options.bytes !== $Array)
                    object.serialNumber = $util.newBuffer(object.serialNumber);
            }
            object.creationTimeSeconds = 0;
            if (options.bytes === $String)
                object.publicKey = "";
            else {
                object.publicKey = [];
                if (options.bytes !== $Array)
                    object.publicKey = $util.newBuffer(object.publicKey);
            }
            object.systemId = 0;
            object.testDeviceDeprecated = false;
            object.providerId = "";
            object.algorithm = options.enums === $String ? "RSA" : 1;
            if (options.bytes === $String)
                object.rotId = "";
            else {
                object.rotId = [];
                if (options.bytes !== $Array)
                    object.rotId = $util.newBuffer(object.rotId);
            }
            object.encryptionKey = null;
            object.expirationTimeSeconds = 0;
        }
        if (message.type != null && $Object.hasOwnProperty.call(message, "type"))
            object.type = options.enums === $String ? $root.DrmCertificate.Type[message.type] === $undefined ? message.type : $root.DrmCertificate.Type[message.type] : message.type;
        if (message.serialNumber != null && $Object.hasOwnProperty.call(message, "serialNumber"))
            object.serialNumber = options.bytes === $String ? $util.base64.encode(message.serialNumber, 0, message.serialNumber.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.serialNumber) : message.serialNumber;
        if (message.creationTimeSeconds != null && $Object.hasOwnProperty.call(message, "creationTimeSeconds"))
            object.creationTimeSeconds = message.creationTimeSeconds;
        if (message.publicKey != null && $Object.hasOwnProperty.call(message, "publicKey"))
            object.publicKey = options.bytes === $String ? $util.base64.encode(message.publicKey, 0, message.publicKey.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.publicKey) : message.publicKey;
        if (message.systemId != null && $Object.hasOwnProperty.call(message, "systemId"))
            object.systemId = message.systemId;
        if (message.testDeviceDeprecated != null && $Object.hasOwnProperty.call(message, "testDeviceDeprecated"))
            object.testDeviceDeprecated = message.testDeviceDeprecated;
        if (message.providerId != null && $Object.hasOwnProperty.call(message, "providerId"))
            object.providerId = message.providerId;
        if (message.serviceTypes && message.serviceTypes.length) {
            object.serviceTypes = $Array(message.serviceTypes.length);
            for (let j = 0; j < message.serviceTypes.length; ++j)
                object.serviceTypes[j] = options.enums === $String ? $root.DrmCertificate.ServiceType[message.serviceTypes[j]] === $undefined ? message.serviceTypes[j] : $root.DrmCertificate.ServiceType[message.serviceTypes[j]] : message.serviceTypes[j];
        }
        if (message.algorithm != null && $Object.hasOwnProperty.call(message, "algorithm"))
            object.algorithm = options.enums === $String ? $root.DrmCertificate.Algorithm[message.algorithm] === $undefined ? message.algorithm : $root.DrmCertificate.Algorithm[message.algorithm] : message.algorithm;
        if (message.rotId != null && $Object.hasOwnProperty.call(message, "rotId"))
            object.rotId = options.bytes === $String ? $util.base64.encode(message.rotId, 0, message.rotId.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.rotId) : message.rotId;
        if (message.encryptionKey != null && $Object.hasOwnProperty.call(message, "encryptionKey"))
            object.encryptionKey = $root.DrmCertificate.EncryptionKey.toObject(message.encryptionKey, options, _depth + 1);
        if (message.expirationTimeSeconds != null && $Object.hasOwnProperty.call(message, "expirationTimeSeconds"))
            object.expirationTimeSeconds = message.expirationTimeSeconds;
        return object;
    };

    /**
     * Converts this DrmCertificate to JSON.
     * @function toJSON
     * @memberof DrmCertificate
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    DrmCertificate.prototype.toJSON = function() {
        return DrmCertificate.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the type url for DrmCertificate
     * @function getTypeUrl
     * @memberof DrmCertificate
     * @static
     * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns {string} The type url
     */
    DrmCertificate.getTypeUrl = function(prefix) {
        if (prefix === $undefined)
            prefix = "type.googleapis.com";
        return prefix + "/DrmCertificate";
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
    DrmCertificate.Type = (function() {
        const valuesById = {}, values = $Object.create(valuesById);
        values[valuesById[0] = "ROOT"] = 0;
        values[valuesById[1] = "DEVICE_MODEL"] = 1;
        values[valuesById[2] = "DEVICE"] = 2;
        values[valuesById[3] = "SERVICE"] = 3;
        values[valuesById[4] = "PROVISIONER"] = 4;
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
    DrmCertificate.ServiceType = (function() {
        const valuesById = {}, values = $Object.create(valuesById);
        values[valuesById[0] = "UNKNOWN_SERVICE_TYPE"] = 0;
        values[valuesById[1] = "LICENSE_SERVER_SDK"] = 1;
        values[valuesById[2] = "LICENSE_SERVER_PROXY_SDK"] = 2;
        values[valuesById[3] = "PROVISIONING_SDK"] = 3;
        values[valuesById[4] = "CAS_PROXY_SDK"] = 4;
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
    DrmCertificate.Algorithm = (function() {
        const valuesById = {}, values = $Object.create(valuesById);
        values[valuesById[0] = "UNKNOWN_ALGORITHM"] = 0;
        values[valuesById[1] = "RSA"] = 1;
        values[valuesById[2] = "ECC_SECP256R1"] = 2;
        values[valuesById[3] = "ECC_SECP384R1"] = 3;
        values[valuesById[4] = "ECC_SECP521R1"] = 4;
        return values;
    })();

    DrmCertificate.EncryptionKey = (function() {

        /**
         * Properties of an EncryptionKey.
         * @typedef {Object} DrmCertificate.EncryptionKey.$Properties
         * @property {Uint8Array|null} [publicKey] EncryptionKey publicKey
         * @property {DrmCertificate.Algorithm|null} [algorithm] EncryptionKey algorithm
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */

        /**
         * Properties of an EncryptionKey.
         * @memberof DrmCertificate
         * @interface IEncryptionKey
         * @augments DrmCertificate.EncryptionKey.$Properties
         * @deprecated Use DrmCertificate.EncryptionKey.$Properties instead.
         */

        /**
         * Shape of an EncryptionKey.
         * @typedef {DrmCertificate.EncryptionKey.$Properties} DrmCertificate.EncryptionKey.$Shape
         */

        /**
         * Constructs a new EncryptionKey.
         * @memberof DrmCertificate
         * @classdesc Represents an EncryptionKey.
         * @constructor
         * @param {DrmCertificate.EncryptionKey.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */
        const EncryptionKey = function (properties) {
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

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
         * @param {DrmCertificate.EncryptionKey.$Properties=} [properties] Properties to set
         * @returns {DrmCertificate.EncryptionKey} EncryptionKey instance
         * @type {{
         *   (properties: DrmCertificate.EncryptionKey.$Shape): DrmCertificate.EncryptionKey & DrmCertificate.EncryptionKey.$Shape;
         *   (properties?: DrmCertificate.EncryptionKey.$Properties): DrmCertificate.EncryptionKey;
         * }}
         */
        EncryptionKey.create = function(properties) {
            return new EncryptionKey(properties);
        };

        /**
         * Encodes the specified EncryptionKey message. Does not implicitly {@link DrmCertificate.EncryptionKey.verify|verify} messages.
         * @function encode
         * @memberof DrmCertificate.EncryptionKey
         * @static
         * @param {DrmCertificate.EncryptionKey.$Properties} message EncryptionKey message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        EncryptionKey.encode = function (message, writer, _depth) {
            if (!writer)
                writer = new $Writer();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.publicKey != null && $Object.hasOwnProperty.call(message, "publicKey"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.publicKey);
            if (message.algorithm != null && $Object.hasOwnProperty.call(message, "algorithm"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.algorithm);
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified EncryptionKey message, length delimited. Does not implicitly {@link DrmCertificate.EncryptionKey.verify|verify} messages.
         * @function encodeDelimited
         * @memberof DrmCertificate.EncryptionKey
         * @static
         * @param {DrmCertificate.EncryptionKey.$Properties} message EncryptionKey message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        EncryptionKey.encodeDelimited = function(message, writer) {
            return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
        };

        /**
         * Decodes an EncryptionKey message from the specified reader or buffer.
         * @function decode
         * @memberof DrmCertificate.EncryptionKey
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {DrmCertificate.EncryptionKey & DrmCertificate.EncryptionKey.$Shape} EncryptionKey
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        EncryptionKey.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.DrmCertificate.EncryptionKey();
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        message.publicKey = reader.bytes();
                        continue;
                    }
                case 2: {
                        if (wireType !== 0)
                            break;
                        message.algorithm = reader.int32();
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Decodes an EncryptionKey message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof DrmCertificate.EncryptionKey
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {DrmCertificate.EncryptionKey & DrmCertificate.EncryptionKey.$Shape} EncryptionKey
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        EncryptionKey.decodeDelimited = function(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an EncryptionKey message.
         * @function verify
         * @memberof DrmCertificate.EncryptionKey
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        EncryptionKey.verify = function (message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (message.publicKey != null && $Object.hasOwnProperty.call(message, "publicKey"))
                if (!(message.publicKey && typeof message.publicKey.length === "number" || $util.isString(message.publicKey)))
                    return "publicKey: buffer expected";
            if (message.algorithm != null && $Object.hasOwnProperty.call(message, "algorithm"))
                switch (message.algorithm) {
                default:
                    return "algorithm: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                    break;
                }
            return null;
        };

        /**
         * Creates an EncryptionKey message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof DrmCertificate.EncryptionKey
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {DrmCertificate.EncryptionKey} EncryptionKey
         */
        EncryptionKey.fromObject = function (object, _depth) {
            if (object instanceof $root.DrmCertificate.EncryptionKey)
                return object;
            if (!$util.isObject(object))
                throw $TypeError(".DrmCertificate.EncryptionKey: object expected");
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let message = new $root.DrmCertificate.EncryptionKey();
            if (object.publicKey != null)
                if (typeof object.publicKey === "string")
                    $util.base64.decode(object.publicKey, message.publicKey = $util.newBuffer($util.base64.length(object.publicKey)), 0);
                else if (object.publicKey.length >= 0)
                    message.publicKey = object.publicKey;
            switch (object.algorithm) {
            case "UNKNOWN_ALGORITHM":
            case 0:
                message.algorithm = 0;
                break;
            default:
                if (typeof object.algorithm === "number") {
                    message.algorithm = object.algorithm;
                    break;
                }
                break;
            case "RSA":
            case 1:
                message.algorithm = 1;
                break;
            case "ECC_SECP256R1":
            case 2:
                message.algorithm = 2;
                break;
            case "ECC_SECP384R1":
            case 3:
                message.algorithm = 3;
                break;
            case "ECC_SECP521R1":
            case 4:
                message.algorithm = 4;
                break;
            }
            return message;
        };

        /**
         * Creates a plain object from an EncryptionKey message. Also converts values to other types if specified.
         * @function toObject
         * @memberof DrmCertificate.EncryptionKey
         * @static
         * @param {DrmCertificate.EncryptionKey} message EncryptionKey
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        EncryptionKey.toObject = function (message, options, _depth) {
            if (!options)
                options = {};
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let object = {};
            if (options.defaults) {
                if (options.bytes === $String)
                    object.publicKey = "";
                else {
                    object.publicKey = [];
                    if (options.bytes !== $Array)
                        object.publicKey = $util.newBuffer(object.publicKey);
                }
                object.algorithm = options.enums === $String ? "RSA" : 1;
            }
            if (message.publicKey != null && $Object.hasOwnProperty.call(message, "publicKey"))
                object.publicKey = options.bytes === $String ? $util.base64.encode(message.publicKey, 0, message.publicKey.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.publicKey) : message.publicKey;
            if (message.algorithm != null && $Object.hasOwnProperty.call(message, "algorithm"))
                object.algorithm = options.enums === $String ? $root.DrmCertificate.Algorithm[message.algorithm] === $undefined ? message.algorithm : $root.DrmCertificate.Algorithm[message.algorithm] : message.algorithm;
            return object;
        };

        /**
         * Converts this EncryptionKey to JSON.
         * @function toJSON
         * @memberof DrmCertificate.EncryptionKey
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        EncryptionKey.prototype.toJSON = function() {
            return EncryptionKey.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for EncryptionKey
         * @function getTypeUrl
         * @memberof DrmCertificate.EncryptionKey
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        EncryptionKey.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/DrmCertificate.EncryptionKey";
        };

        return EncryptionKey;
    })();

    return DrmCertificate;
})();

export const SignedDrmCertificate = $root.SignedDrmCertificate = (() => {

    /**
     * Properties of a SignedDrmCertificate.
     * @typedef {Object} SignedDrmCertificate.$Properties
     * @property {Uint8Array|null} [drmCertificate] SignedDrmCertificate drmCertificate
     * @property {Uint8Array|null} [signature] SignedDrmCertificate signature
     * @property {SignedDrmCertificate.$Properties|null} [signer] SignedDrmCertificate signer
     * @property {HashAlgorithmProto|null} [hashAlgorithm] SignedDrmCertificate hashAlgorithm
     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
     */

    /**
     * Properties of a SignedDrmCertificate.
     * @exports ISignedDrmCertificate
     * @interface ISignedDrmCertificate
     * @augments SignedDrmCertificate.$Properties
     * @deprecated Use SignedDrmCertificate.$Properties instead.
     */

    /**
     * Shape of a SignedDrmCertificate.
     * @typedef {SignedDrmCertificate.$Properties} SignedDrmCertificate.$Shape
     */

    /**
     * Constructs a new SignedDrmCertificate.
     * @exports SignedDrmCertificate
     * @classdesc Represents a SignedDrmCertificate.
     * @constructor
     * @param {SignedDrmCertificate.$Properties=} [properties] Properties to set
     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
     */
    const SignedDrmCertificate = function (properties) {
        if (properties)
            for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    };

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
     * @member {SignedDrmCertificate.$Properties|null|undefined} signer
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
     * @param {SignedDrmCertificate.$Properties=} [properties] Properties to set
     * @returns {SignedDrmCertificate} SignedDrmCertificate instance
     * @type {{
     *   (properties: SignedDrmCertificate.$Shape): SignedDrmCertificate & SignedDrmCertificate.$Shape;
     *   (properties?: SignedDrmCertificate.$Properties): SignedDrmCertificate;
     * }}
     */
    SignedDrmCertificate.create = function(properties) {
        return new SignedDrmCertificate(properties);
    };

    /**
     * Encodes the specified SignedDrmCertificate message. Does not implicitly {@link SignedDrmCertificate.verify|verify} messages.
     * @function encode
     * @memberof SignedDrmCertificate
     * @static
     * @param {SignedDrmCertificate.$Properties} message SignedDrmCertificate message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    SignedDrmCertificate.encode = function (message, writer, _depth) {
        if (!writer)
            writer = new $Writer();
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        if (message.drmCertificate != null && $Object.hasOwnProperty.call(message, "drmCertificate"))
            writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.drmCertificate);
        if (message.signature != null && $Object.hasOwnProperty.call(message, "signature"))
            writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.signature);
        if (message.signer != null && $Object.hasOwnProperty.call(message, "signer"))
            $root.SignedDrmCertificate.encode(message.signer, writer.uint32(/* id 3, wireType 2 =*/26).fork(), _depth + 1).ldelim();
        if (message.hashAlgorithm != null && $Object.hasOwnProperty.call(message, "hashAlgorithm"))
            writer.uint32(/* id 4, wireType 0 =*/32).int32(message.hashAlgorithm);
        if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    /**
     * Encodes the specified SignedDrmCertificate message, length delimited. Does not implicitly {@link SignedDrmCertificate.verify|verify} messages.
     * @function encodeDelimited
     * @memberof SignedDrmCertificate
     * @static
     * @param {SignedDrmCertificate.$Properties} message SignedDrmCertificate message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    SignedDrmCertificate.encodeDelimited = function(message, writer) {
        return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
    };

    /**
     * Decodes a SignedDrmCertificate message from the specified reader or buffer.
     * @function decode
     * @memberof SignedDrmCertificate
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {SignedDrmCertificate & SignedDrmCertificate.$Shape} SignedDrmCertificate
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    SignedDrmCertificate.decode = function (reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw $Error("max depth exceeded");
        let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.SignedDrmCertificate();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = $undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 2)
                        break;
                    message.drmCertificate = reader.bytes();
                    continue;
                }
            case 2: {
                    if (wireType !== 2)
                        break;
                    message.signature = reader.bytes();
                    continue;
                }
            case 3: {
                    if (wireType !== 2)
                        break;
                    message.signer = $root.SignedDrmCertificate.decode(reader, reader.uint32(), $undefined, _depth + 1, message.signer);
                    continue;
                }
            case 4: {
                    if (wireType !== 0)
                        break;
                    message.hashAlgorithm = reader.int32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            if (!reader.discardUnknown) {
                $util.makeProp(message, "$unknowns", false);
                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
            }
        }
        if (_end !== $undefined)
            throw $Error("missing end group");
        return message;
    };

    /**
     * Decodes a SignedDrmCertificate message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof SignedDrmCertificate
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {SignedDrmCertificate & SignedDrmCertificate.$Shape} SignedDrmCertificate
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    SignedDrmCertificate.decodeDelimited = function(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a SignedDrmCertificate message.
     * @function verify
     * @memberof SignedDrmCertificate
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    SignedDrmCertificate.verify = function (message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (message.drmCertificate != null && $Object.hasOwnProperty.call(message, "drmCertificate"))
            if (!(message.drmCertificate && typeof message.drmCertificate.length === "number" || $util.isString(message.drmCertificate)))
                return "drmCertificate: buffer expected";
        if (message.signature != null && $Object.hasOwnProperty.call(message, "signature"))
            if (!(message.signature && typeof message.signature.length === "number" || $util.isString(message.signature)))
                return "signature: buffer expected";
        if (message.signer != null && $Object.hasOwnProperty.call(message, "signer")) {
            let error = $root.SignedDrmCertificate.verify(message.signer, _depth + 1);
            if (error)
                return "signer." + error;
        }
        if (message.hashAlgorithm != null && $Object.hasOwnProperty.call(message, "hashAlgorithm"))
            switch (message.hashAlgorithm) {
            default:
                return "hashAlgorithm: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
                break;
            }
        return null;
    };

    /**
     * Creates a SignedDrmCertificate message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof SignedDrmCertificate
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {SignedDrmCertificate} SignedDrmCertificate
     */
    SignedDrmCertificate.fromObject = function (object, _depth) {
        if (object instanceof $root.SignedDrmCertificate)
            return object;
        if (!$util.isObject(object))
            throw $TypeError(".SignedDrmCertificate: object expected");
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        let message = new $root.SignedDrmCertificate();
        if (object.drmCertificate != null)
            if (typeof object.drmCertificate === "string")
                $util.base64.decode(object.drmCertificate, message.drmCertificate = $util.newBuffer($util.base64.length(object.drmCertificate)), 0);
            else if (object.drmCertificate.length >= 0)
                message.drmCertificate = object.drmCertificate;
        if (object.signature != null)
            if (typeof object.signature === "string")
                $util.base64.decode(object.signature, message.signature = $util.newBuffer($util.base64.length(object.signature)), 0);
            else if (object.signature.length >= 0)
                message.signature = object.signature;
        if (object.signer != null) {
            if (!$util.isObject(object.signer))
                throw $TypeError(".SignedDrmCertificate.signer: object expected");
            message.signer = $root.SignedDrmCertificate.fromObject(object.signer, _depth + 1);
        }
        switch (object.hashAlgorithm) {
        default:
            if (typeof object.hashAlgorithm === "number") {
                message.hashAlgorithm = object.hashAlgorithm;
                break;
            }
            break;
        case "HASH_ALGORITHM_UNSPECIFIED":
        case 0:
            message.hashAlgorithm = 0;
            break;
        case "HASH_ALGORITHM_SHA_1":
        case 1:
            message.hashAlgorithm = 1;
            break;
        case "HASH_ALGORITHM_SHA_256":
        case 2:
            message.hashAlgorithm = 2;
            break;
        case "HASH_ALGORITHM_SHA_384":
        case 3:
            message.hashAlgorithm = 3;
            break;
        }
        return message;
    };

    /**
     * Creates a plain object from a SignedDrmCertificate message. Also converts values to other types if specified.
     * @function toObject
     * @memberof SignedDrmCertificate
     * @static
     * @param {SignedDrmCertificate} message SignedDrmCertificate
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    SignedDrmCertificate.toObject = function (message, options, _depth) {
        if (!options)
            options = {};
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        let object = {};
        if (options.defaults) {
            if (options.bytes === $String)
                object.drmCertificate = "";
            else {
                object.drmCertificate = [];
                if (options.bytes !== $Array)
                    object.drmCertificate = $util.newBuffer(object.drmCertificate);
            }
            if (options.bytes === $String)
                object.signature = "";
            else {
                object.signature = [];
                if (options.bytes !== $Array)
                    object.signature = $util.newBuffer(object.signature);
            }
            object.signer = null;
            object.hashAlgorithm = options.enums === $String ? "HASH_ALGORITHM_UNSPECIFIED" : 0;
        }
        if (message.drmCertificate != null && $Object.hasOwnProperty.call(message, "drmCertificate"))
            object.drmCertificate = options.bytes === $String ? $util.base64.encode(message.drmCertificate, 0, message.drmCertificate.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.drmCertificate) : message.drmCertificate;
        if (message.signature != null && $Object.hasOwnProperty.call(message, "signature"))
            object.signature = options.bytes === $String ? $util.base64.encode(message.signature, 0, message.signature.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.signature) : message.signature;
        if (message.signer != null && $Object.hasOwnProperty.call(message, "signer"))
            object.signer = $root.SignedDrmCertificate.toObject(message.signer, options, _depth + 1);
        if (message.hashAlgorithm != null && $Object.hasOwnProperty.call(message, "hashAlgorithm"))
            object.hashAlgorithm = options.enums === $String ? $root.HashAlgorithmProto[message.hashAlgorithm] === $undefined ? message.hashAlgorithm : $root.HashAlgorithmProto[message.hashAlgorithm] : message.hashAlgorithm;
        return object;
    };

    /**
     * Converts this SignedDrmCertificate to JSON.
     * @function toJSON
     * @memberof SignedDrmCertificate
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    SignedDrmCertificate.prototype.toJSON = function() {
        return SignedDrmCertificate.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the type url for SignedDrmCertificate
     * @function getTypeUrl
     * @memberof SignedDrmCertificate
     * @static
     * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns {string} The type url
     */
    SignedDrmCertificate.getTypeUrl = function(prefix) {
        if (prefix === $undefined)
            prefix = "type.googleapis.com";
        return prefix + "/SignedDrmCertificate";
    };

    return SignedDrmCertificate;
})();

export const WidevinePsshData = $root.WidevinePsshData = (() => {

    /**
     * Properties of a WidevinePsshData.
     * @typedef {Object} WidevinePsshData.$Properties
     * @property {Array.<Uint8Array>|null} [keyIds] WidevinePsshData keyIds
     * @property {Uint8Array|null} [contentId] WidevinePsshData contentId
     * @property {number|null} [cryptoPeriodIndex] WidevinePsshData cryptoPeriodIndex
     * @property {number|null} [protectionScheme] WidevinePsshData protectionScheme
     * @property {number|null} [cryptoPeriodSeconds] WidevinePsshData cryptoPeriodSeconds
     * @property {WidevinePsshData.Type|null} [type] WidevinePsshData type
     * @property {number|null} [keySequence] WidevinePsshData keySequence
     * @property {Array.<Uint8Array>|null} [groupIds] WidevinePsshData groupIds
     * @property {Array.<WidevinePsshData.EntitledKey.$Properties>|null} [entitledKeys] WidevinePsshData entitledKeys
     * @property {string|null} [videoFeature] WidevinePsshData videoFeature
     * @property {WidevinePsshData.Algorithm|null} [algorithm] WidevinePsshData algorithm
     * @property {string|null} [provider] WidevinePsshData provider
     * @property {string|null} [trackType] WidevinePsshData trackType
     * @property {string|null} [policy] WidevinePsshData policy
     * @property {Uint8Array|null} [groupedLicense] WidevinePsshData groupedLicense
     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
     */

    /**
     * Properties of a WidevinePsshData.
     * @exports IWidevinePsshData
     * @interface IWidevinePsshData
     * @augments WidevinePsshData.$Properties
     * @deprecated Use WidevinePsshData.$Properties instead.
     */

    /**
     * Shape of a WidevinePsshData.
     * @typedef {WidevinePsshData.$Properties} WidevinePsshData.$Shape
     */

    /**
     * Constructs a new WidevinePsshData.
     * @exports WidevinePsshData
     * @classdesc Represents a WidevinePsshData.
     * @constructor
     * @param {WidevinePsshData.$Properties=} [properties] Properties to set
     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
     */
    const WidevinePsshData = function (properties) {
        this.keyIds = [];
        this.groupIds = [];
        this.entitledKeys = [];
        if (properties)
            for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    };

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
     * @member {Array.<WidevinePsshData.EntitledKey.$Properties>} entitledKeys
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
    WidevinePsshData.prototype.videoFeature = "";

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
    WidevinePsshData.prototype.provider = "";

    /**
     * WidevinePsshData trackType.
     * @member {string} trackType
     * @memberof WidevinePsshData
     * @instance
     */
    WidevinePsshData.prototype.trackType = "";

    /**
     * WidevinePsshData policy.
     * @member {string} policy
     * @memberof WidevinePsshData
     * @instance
     */
    WidevinePsshData.prototype.policy = "";

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
     * @param {WidevinePsshData.$Properties=} [properties] Properties to set
     * @returns {WidevinePsshData} WidevinePsshData instance
     * @type {{
     *   (properties: WidevinePsshData.$Shape): WidevinePsshData & WidevinePsshData.$Shape;
     *   (properties?: WidevinePsshData.$Properties): WidevinePsshData;
     * }}
     */
    WidevinePsshData.create = function(properties) {
        return new WidevinePsshData(properties);
    };

    /**
     * Encodes the specified WidevinePsshData message. Does not implicitly {@link WidevinePsshData.verify|verify} messages.
     * @function encode
     * @memberof WidevinePsshData
     * @static
     * @param {WidevinePsshData.$Properties} message WidevinePsshData message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    WidevinePsshData.encode = function (message, writer, _depth) {
        if (!writer)
            writer = new $Writer();
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        if (message.algorithm != null && $Object.hasOwnProperty.call(message, "algorithm"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.algorithm);
        if (message.keyIds != null && message.keyIds.length)
            for (let i = 0; i < message.keyIds.length; ++i)
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.keyIds[i]);
        if (message.provider != null && $Object.hasOwnProperty.call(message, "provider"))
            writer.uint32(/* id 3, wireType 2 =*/26).string(message.provider);
        if (message.contentId != null && $Object.hasOwnProperty.call(message, "contentId"))
            writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.contentId);
        if (message.trackType != null && $Object.hasOwnProperty.call(message, "trackType"))
            writer.uint32(/* id 5, wireType 2 =*/42).string(message.trackType);
        if (message.policy != null && $Object.hasOwnProperty.call(message, "policy"))
            writer.uint32(/* id 6, wireType 2 =*/50).string(message.policy);
        if (message.cryptoPeriodIndex != null && $Object.hasOwnProperty.call(message, "cryptoPeriodIndex"))
            writer.uint32(/* id 7, wireType 0 =*/56).uint32(message.cryptoPeriodIndex);
        if (message.groupedLicense != null && $Object.hasOwnProperty.call(message, "groupedLicense"))
            writer.uint32(/* id 8, wireType 2 =*/66).bytes(message.groupedLicense);
        if (message.protectionScheme != null && $Object.hasOwnProperty.call(message, "protectionScheme"))
            writer.uint32(/* id 9, wireType 0 =*/72).uint32(message.protectionScheme);
        if (message.cryptoPeriodSeconds != null && $Object.hasOwnProperty.call(message, "cryptoPeriodSeconds"))
            writer.uint32(/* id 10, wireType 0 =*/80).uint32(message.cryptoPeriodSeconds);
        if (message.type != null && $Object.hasOwnProperty.call(message, "type"))
            writer.uint32(/* id 11, wireType 0 =*/88).int32(message.type);
        if (message.keySequence != null && $Object.hasOwnProperty.call(message, "keySequence"))
            writer.uint32(/* id 12, wireType 0 =*/96).uint32(message.keySequence);
        if (message.groupIds != null && message.groupIds.length)
            for (let i = 0; i < message.groupIds.length; ++i)
                writer.uint32(/* id 13, wireType 2 =*/106).bytes(message.groupIds[i]);
        if (message.entitledKeys != null && message.entitledKeys.length)
            for (let i = 0; i < message.entitledKeys.length; ++i)
                $root.WidevinePsshData.EntitledKey.encode(message.entitledKeys[i], writer.uint32(/* id 14, wireType 2 =*/114).fork(), _depth + 1).ldelim();
        if (message.videoFeature != null && $Object.hasOwnProperty.call(message, "videoFeature"))
            writer.uint32(/* id 15, wireType 2 =*/122).string(message.videoFeature);
        if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    /**
     * Encodes the specified WidevinePsshData message, length delimited. Does not implicitly {@link WidevinePsshData.verify|verify} messages.
     * @function encodeDelimited
     * @memberof WidevinePsshData
     * @static
     * @param {WidevinePsshData.$Properties} message WidevinePsshData message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    WidevinePsshData.encodeDelimited = function(message, writer) {
        return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
    };

    /**
     * Decodes a WidevinePsshData message from the specified reader or buffer.
     * @function decode
     * @memberof WidevinePsshData
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {WidevinePsshData & WidevinePsshData.$Shape} WidevinePsshData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    WidevinePsshData.decode = function (reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw $Error("max depth exceeded");
        let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.WidevinePsshData();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = $undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 2: {
                    if (wireType !== 2)
                        break;
                    if (!(message.keyIds && message.keyIds.length))
                        message.keyIds = [];
                    message.keyIds.push(reader.bytes());
                    continue;
                }
            case 4: {
                    if (wireType !== 2)
                        break;
                    message.contentId = reader.bytes();
                    continue;
                }
            case 7: {
                    if (wireType !== 0)
                        break;
                    message.cryptoPeriodIndex = reader.uint32();
                    continue;
                }
            case 9: {
                    if (wireType !== 0)
                        break;
                    message.protectionScheme = reader.uint32();
                    continue;
                }
            case 10: {
                    if (wireType !== 0)
                        break;
                    message.cryptoPeriodSeconds = reader.uint32();
                    continue;
                }
            case 11: {
                    if (wireType !== 0)
                        break;
                    message.type = reader.int32();
                    continue;
                }
            case 12: {
                    if (wireType !== 0)
                        break;
                    message.keySequence = reader.uint32();
                    continue;
                }
            case 13: {
                    if (wireType !== 2)
                        break;
                    if (!(message.groupIds && message.groupIds.length))
                        message.groupIds = [];
                    message.groupIds.push(reader.bytes());
                    continue;
                }
            case 14: {
                    if (wireType !== 2)
                        break;
                    if (!(message.entitledKeys && message.entitledKeys.length))
                        message.entitledKeys = [];
                    message.entitledKeys.push($root.WidevinePsshData.EntitledKey.decode(reader, reader.uint32(), $undefined, _depth + 1));
                    continue;
                }
            case 15: {
                    if (wireType !== 2)
                        break;
                    message.videoFeature = reader.string();
                    continue;
                }
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.algorithm = reader.int32();
                    continue;
                }
            case 3: {
                    if (wireType !== 2)
                        break;
                    message.provider = reader.string();
                    continue;
                }
            case 5: {
                    if (wireType !== 2)
                        break;
                    message.trackType = reader.string();
                    continue;
                }
            case 6: {
                    if (wireType !== 2)
                        break;
                    message.policy = reader.string();
                    continue;
                }
            case 8: {
                    if (wireType !== 2)
                        break;
                    message.groupedLicense = reader.bytes();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            if (!reader.discardUnknown) {
                $util.makeProp(message, "$unknowns", false);
                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
            }
        }
        if (_end !== $undefined)
            throw $Error("missing end group");
        return message;
    };

    /**
     * Decodes a WidevinePsshData message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof WidevinePsshData
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {WidevinePsshData & WidevinePsshData.$Shape} WidevinePsshData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    WidevinePsshData.decodeDelimited = function(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a WidevinePsshData message.
     * @function verify
     * @memberof WidevinePsshData
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    WidevinePsshData.verify = function (message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (message.keyIds != null && $Object.hasOwnProperty.call(message, "keyIds")) {
            if (!$Array.isArray(message.keyIds))
                return "keyIds: array expected";
            for (let i = 0; i < message.keyIds.length; ++i)
                if (!(message.keyIds[i] && typeof message.keyIds[i].length === "number" || $util.isString(message.keyIds[i])))
                    return "keyIds: buffer[] expected";
        }
        if (message.contentId != null && $Object.hasOwnProperty.call(message, "contentId"))
            if (!(message.contentId && typeof message.contentId.length === "number" || $util.isString(message.contentId)))
                return "contentId: buffer expected";
        if (message.cryptoPeriodIndex != null && $Object.hasOwnProperty.call(message, "cryptoPeriodIndex"))
            if (!$util.isInteger(message.cryptoPeriodIndex))
                return "cryptoPeriodIndex: integer expected";
        if (message.protectionScheme != null && $Object.hasOwnProperty.call(message, "protectionScheme"))
            if (!$util.isInteger(message.protectionScheme))
                return "protectionScheme: integer expected";
        if (message.cryptoPeriodSeconds != null && $Object.hasOwnProperty.call(message, "cryptoPeriodSeconds"))
            if (!$util.isInteger(message.cryptoPeriodSeconds))
                return "cryptoPeriodSeconds: integer expected";
        if (message.type != null && $Object.hasOwnProperty.call(message, "type"))
            switch (message.type) {
            default:
                return "type: enum value expected";
            case 0:
            case 1:
            case 2:
                break;
            }
        if (message.keySequence != null && $Object.hasOwnProperty.call(message, "keySequence"))
            if (!$util.isInteger(message.keySequence))
                return "keySequence: integer expected";
        if (message.groupIds != null && $Object.hasOwnProperty.call(message, "groupIds")) {
            if (!$Array.isArray(message.groupIds))
                return "groupIds: array expected";
            for (let i = 0; i < message.groupIds.length; ++i)
                if (!(message.groupIds[i] && typeof message.groupIds[i].length === "number" || $util.isString(message.groupIds[i])))
                    return "groupIds: buffer[] expected";
        }
        if (message.entitledKeys != null && $Object.hasOwnProperty.call(message, "entitledKeys")) {
            if (!$Array.isArray(message.entitledKeys))
                return "entitledKeys: array expected";
            for (let i = 0; i < message.entitledKeys.length; ++i) {
                let error = $root.WidevinePsshData.EntitledKey.verify(message.entitledKeys[i], _depth + 1);
                if (error)
                    return "entitledKeys." + error;
            }
        }
        if (message.videoFeature != null && $Object.hasOwnProperty.call(message, "videoFeature"))
            if (!$util.isString(message.videoFeature))
                return "videoFeature: string expected";
        if (message.algorithm != null && $Object.hasOwnProperty.call(message, "algorithm"))
            switch (message.algorithm) {
            default:
                return "algorithm: enum value expected";
            case 0:
            case 1:
                break;
            }
        if (message.provider != null && $Object.hasOwnProperty.call(message, "provider"))
            if (!$util.isString(message.provider))
                return "provider: string expected";
        if (message.trackType != null && $Object.hasOwnProperty.call(message, "trackType"))
            if (!$util.isString(message.trackType))
                return "trackType: string expected";
        if (message.policy != null && $Object.hasOwnProperty.call(message, "policy"))
            if (!$util.isString(message.policy))
                return "policy: string expected";
        if (message.groupedLicense != null && $Object.hasOwnProperty.call(message, "groupedLicense"))
            if (!(message.groupedLicense && typeof message.groupedLicense.length === "number" || $util.isString(message.groupedLicense)))
                return "groupedLicense: buffer expected";
        return null;
    };

    /**
     * Creates a WidevinePsshData message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof WidevinePsshData
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {WidevinePsshData} WidevinePsshData
     */
    WidevinePsshData.fromObject = function (object, _depth) {
        if (object instanceof $root.WidevinePsshData)
            return object;
        if (!$util.isObject(object))
            throw $TypeError(".WidevinePsshData: object expected");
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        let message = new $root.WidevinePsshData();
        if (object.keyIds) {
            if (!$Array.isArray(object.keyIds))
                throw $TypeError(".WidevinePsshData.keyIds: array expected");
            message.keyIds = $Array(object.keyIds.length);
            for (let i = 0; i < object.keyIds.length; ++i)
                if (typeof object.keyIds[i] === "string")
                    $util.base64.decode(object.keyIds[i], message.keyIds[i] = $util.newBuffer($util.base64.length(object.keyIds[i])), 0);
                else if (object.keyIds[i].length >= 0)
                    message.keyIds[i] = object.keyIds[i];
        }
        if (object.contentId != null)
            if (typeof object.contentId === "string")
                $util.base64.decode(object.contentId, message.contentId = $util.newBuffer($util.base64.length(object.contentId)), 0);
            else if (object.contentId.length >= 0)
                message.contentId = object.contentId;
        if (object.cryptoPeriodIndex != null)
            message.cryptoPeriodIndex = object.cryptoPeriodIndex >>> 0;
        if (object.protectionScheme != null)
            message.protectionScheme = object.protectionScheme >>> 0;
        if (object.cryptoPeriodSeconds != null)
            message.cryptoPeriodSeconds = object.cryptoPeriodSeconds >>> 0;
        switch (object.type) {
        default:
            if (typeof object.type === "number") {
                message.type = object.type;
                break;
            }
            break;
        case "SINGLE":
        case 0:
            message.type = 0;
            break;
        case "ENTITLEMENT":
        case 1:
            message.type = 1;
            break;
        case "ENTITLED_KEY":
        case 2:
            message.type = 2;
            break;
        }
        if (object.keySequence != null)
            message.keySequence = object.keySequence >>> 0;
        if (object.groupIds) {
            if (!$Array.isArray(object.groupIds))
                throw $TypeError(".WidevinePsshData.groupIds: array expected");
            message.groupIds = $Array(object.groupIds.length);
            for (let i = 0; i < object.groupIds.length; ++i)
                if (typeof object.groupIds[i] === "string")
                    $util.base64.decode(object.groupIds[i], message.groupIds[i] = $util.newBuffer($util.base64.length(object.groupIds[i])), 0);
                else if (object.groupIds[i].length >= 0)
                    message.groupIds[i] = object.groupIds[i];
        }
        if (object.entitledKeys) {
            if (!$Array.isArray(object.entitledKeys))
                throw $TypeError(".WidevinePsshData.entitledKeys: array expected");
            message.entitledKeys = $Array(object.entitledKeys.length);
            for (let i = 0; i < object.entitledKeys.length; ++i) {
                if (!$util.isObject(object.entitledKeys[i]))
                    throw $TypeError(".WidevinePsshData.entitledKeys: object expected");
                message.entitledKeys[i] = $root.WidevinePsshData.EntitledKey.fromObject(object.entitledKeys[i], _depth + 1);
            }
        }
        if (object.videoFeature != null)
            message.videoFeature = $String(object.videoFeature);
        switch (object.algorithm) {
        default:
            if (typeof object.algorithm === "number") {
                message.algorithm = object.algorithm;
                break;
            }
            break;
        case "UNENCRYPTED":
        case 0:
            message.algorithm = 0;
            break;
        case "AESCTR":
        case 1:
            message.algorithm = 1;
            break;
        }
        if (object.provider != null)
            message.provider = $String(object.provider);
        if (object.trackType != null)
            message.trackType = $String(object.trackType);
        if (object.policy != null)
            message.policy = $String(object.policy);
        if (object.groupedLicense != null)
            if (typeof object.groupedLicense === "string")
                $util.base64.decode(object.groupedLicense, message.groupedLicense = $util.newBuffer($util.base64.length(object.groupedLicense)), 0);
            else if (object.groupedLicense.length >= 0)
                message.groupedLicense = object.groupedLicense;
        return message;
    };

    /**
     * Creates a plain object from a WidevinePsshData message. Also converts values to other types if specified.
     * @function toObject
     * @memberof WidevinePsshData
     * @static
     * @param {WidevinePsshData} message WidevinePsshData
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    WidevinePsshData.toObject = function (message, options, _depth) {
        if (!options)
            options = {};
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        let object = {};
        if (options.arrays || options.defaults) {
            object.keyIds = [];
            object.groupIds = [];
            object.entitledKeys = [];
        }
        if (options.defaults) {
            object.algorithm = options.enums === $String ? "UNENCRYPTED" : 0;
            object.provider = "";
            if (options.bytes === $String)
                object.contentId = "";
            else {
                object.contentId = [];
                if (options.bytes !== $Array)
                    object.contentId = $util.newBuffer(object.contentId);
            }
            object.trackType = "";
            object.policy = "";
            object.cryptoPeriodIndex = 0;
            if (options.bytes === $String)
                object.groupedLicense = "";
            else {
                object.groupedLicense = [];
                if (options.bytes !== $Array)
                    object.groupedLicense = $util.newBuffer(object.groupedLicense);
            }
            object.protectionScheme = 0;
            object.cryptoPeriodSeconds = 0;
            object.type = options.enums === $String ? "SINGLE" : 0;
            object.keySequence = 0;
            object.videoFeature = "";
        }
        if (message.algorithm != null && $Object.hasOwnProperty.call(message, "algorithm"))
            object.algorithm = options.enums === $String ? $root.WidevinePsshData.Algorithm[message.algorithm] === $undefined ? message.algorithm : $root.WidevinePsshData.Algorithm[message.algorithm] : message.algorithm;
        if (message.keyIds && message.keyIds.length) {
            object.keyIds = $Array(message.keyIds.length);
            for (let j = 0; j < message.keyIds.length; ++j)
                object.keyIds[j] = options.bytes === $String ? $util.base64.encode(message.keyIds[j], 0, message.keyIds[j].length) : options.bytes === $Array ? $Array.prototype.slice.call(message.keyIds[j]) : message.keyIds[j];
        }
        if (message.provider != null && $Object.hasOwnProperty.call(message, "provider"))
            object.provider = message.provider;
        if (message.contentId != null && $Object.hasOwnProperty.call(message, "contentId"))
            object.contentId = options.bytes === $String ? $util.base64.encode(message.contentId, 0, message.contentId.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.contentId) : message.contentId;
        if (message.trackType != null && $Object.hasOwnProperty.call(message, "trackType"))
            object.trackType = message.trackType;
        if (message.policy != null && $Object.hasOwnProperty.call(message, "policy"))
            object.policy = message.policy;
        if (message.cryptoPeriodIndex != null && $Object.hasOwnProperty.call(message, "cryptoPeriodIndex"))
            object.cryptoPeriodIndex = message.cryptoPeriodIndex;
        if (message.groupedLicense != null && $Object.hasOwnProperty.call(message, "groupedLicense"))
            object.groupedLicense = options.bytes === $String ? $util.base64.encode(message.groupedLicense, 0, message.groupedLicense.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.groupedLicense) : message.groupedLicense;
        if (message.protectionScheme != null && $Object.hasOwnProperty.call(message, "protectionScheme"))
            object.protectionScheme = message.protectionScheme;
        if (message.cryptoPeriodSeconds != null && $Object.hasOwnProperty.call(message, "cryptoPeriodSeconds"))
            object.cryptoPeriodSeconds = message.cryptoPeriodSeconds;
        if (message.type != null && $Object.hasOwnProperty.call(message, "type"))
            object.type = options.enums === $String ? $root.WidevinePsshData.Type[message.type] === $undefined ? message.type : $root.WidevinePsshData.Type[message.type] : message.type;
        if (message.keySequence != null && $Object.hasOwnProperty.call(message, "keySequence"))
            object.keySequence = message.keySequence;
        if (message.groupIds && message.groupIds.length) {
            object.groupIds = $Array(message.groupIds.length);
            for (let j = 0; j < message.groupIds.length; ++j)
                object.groupIds[j] = options.bytes === $String ? $util.base64.encode(message.groupIds[j], 0, message.groupIds[j].length) : options.bytes === $Array ? $Array.prototype.slice.call(message.groupIds[j]) : message.groupIds[j];
        }
        if (message.entitledKeys && message.entitledKeys.length) {
            object.entitledKeys = $Array(message.entitledKeys.length);
            for (let j = 0; j < message.entitledKeys.length; ++j)
                object.entitledKeys[j] = $root.WidevinePsshData.EntitledKey.toObject(message.entitledKeys[j], options, _depth + 1);
        }
        if (message.videoFeature != null && $Object.hasOwnProperty.call(message, "videoFeature"))
            object.videoFeature = message.videoFeature;
        return object;
    };

    /**
     * Converts this WidevinePsshData to JSON.
     * @function toJSON
     * @memberof WidevinePsshData
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    WidevinePsshData.prototype.toJSON = function() {
        return WidevinePsshData.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the type url for WidevinePsshData
     * @function getTypeUrl
     * @memberof WidevinePsshData
     * @static
     * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns {string} The type url
     */
    WidevinePsshData.getTypeUrl = function(prefix) {
        if (prefix === $undefined)
            prefix = "type.googleapis.com";
        return prefix + "/WidevinePsshData";
    };

    /**
     * Type enum.
     * @name WidevinePsshData.Type
     * @enum {number}
     * @property {number} SINGLE=0 SINGLE value
     * @property {number} ENTITLEMENT=1 ENTITLEMENT value
     * @property {number} ENTITLED_KEY=2 ENTITLED_KEY value
     */
    WidevinePsshData.Type = (function() {
        const valuesById = {}, values = $Object.create(valuesById);
        values[valuesById[0] = "SINGLE"] = 0;
        values[valuesById[1] = "ENTITLEMENT"] = 1;
        values[valuesById[2] = "ENTITLED_KEY"] = 2;
        return values;
    })();

    WidevinePsshData.EntitledKey = (function() {

        /**
         * Properties of an EntitledKey.
         * @typedef {Object} WidevinePsshData.EntitledKey.$Properties
         * @property {Uint8Array|null} [entitlementKeyId] EntitledKey entitlementKeyId
         * @property {Uint8Array|null} [keyId] EntitledKey keyId
         * @property {Uint8Array|null} [key] EntitledKey key
         * @property {Uint8Array|null} [iv] EntitledKey iv
         * @property {number|null} [entitlementKeySizeBytes] EntitledKey entitlementKeySizeBytes
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */

        /**
         * Properties of an EntitledKey.
         * @memberof WidevinePsshData
         * @interface IEntitledKey
         * @augments WidevinePsshData.EntitledKey.$Properties
         * @deprecated Use WidevinePsshData.EntitledKey.$Properties instead.
         */

        /**
         * Shape of an EntitledKey.
         * @typedef {WidevinePsshData.EntitledKey.$Properties} WidevinePsshData.EntitledKey.$Shape
         */

        /**
         * Constructs a new EntitledKey.
         * @memberof WidevinePsshData
         * @classdesc Represents an EntitledKey.
         * @constructor
         * @param {WidevinePsshData.EntitledKey.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */
        const EntitledKey = function (properties) {
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

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
         * @param {WidevinePsshData.EntitledKey.$Properties=} [properties] Properties to set
         * @returns {WidevinePsshData.EntitledKey} EntitledKey instance
         * @type {{
         *   (properties: WidevinePsshData.EntitledKey.$Shape): WidevinePsshData.EntitledKey & WidevinePsshData.EntitledKey.$Shape;
         *   (properties?: WidevinePsshData.EntitledKey.$Properties): WidevinePsshData.EntitledKey;
         * }}
         */
        EntitledKey.create = function(properties) {
            return new EntitledKey(properties);
        };

        /**
         * Encodes the specified EntitledKey message. Does not implicitly {@link WidevinePsshData.EntitledKey.verify|verify} messages.
         * @function encode
         * @memberof WidevinePsshData.EntitledKey
         * @static
         * @param {WidevinePsshData.EntitledKey.$Properties} message EntitledKey message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        EntitledKey.encode = function (message, writer, _depth) {
            if (!writer)
                writer = new $Writer();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.entitlementKeyId != null && $Object.hasOwnProperty.call(message, "entitlementKeyId"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.entitlementKeyId);
            if (message.keyId != null && $Object.hasOwnProperty.call(message, "keyId"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.keyId);
            if (message.key != null && $Object.hasOwnProperty.call(message, "key"))
                writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.key);
            if (message.iv != null && $Object.hasOwnProperty.call(message, "iv"))
                writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.iv);
            if (message.entitlementKeySizeBytes != null && $Object.hasOwnProperty.call(message, "entitlementKeySizeBytes"))
                writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.entitlementKeySizeBytes);
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified EntitledKey message, length delimited. Does not implicitly {@link WidevinePsshData.EntitledKey.verify|verify} messages.
         * @function encodeDelimited
         * @memberof WidevinePsshData.EntitledKey
         * @static
         * @param {WidevinePsshData.EntitledKey.$Properties} message EntitledKey message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        EntitledKey.encodeDelimited = function(message, writer) {
            return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
        };

        /**
         * Decodes an EntitledKey message from the specified reader or buffer.
         * @function decode
         * @memberof WidevinePsshData.EntitledKey
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {WidevinePsshData.EntitledKey & WidevinePsshData.EntitledKey.$Shape} EntitledKey
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        EntitledKey.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.WidevinePsshData.EntitledKey();
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        message.entitlementKeyId = reader.bytes();
                        continue;
                    }
                case 2: {
                        if (wireType !== 2)
                            break;
                        message.keyId = reader.bytes();
                        continue;
                    }
                case 3: {
                        if (wireType !== 2)
                            break;
                        message.key = reader.bytes();
                        continue;
                    }
                case 4: {
                        if (wireType !== 2)
                            break;
                        message.iv = reader.bytes();
                        continue;
                    }
                case 5: {
                        if (wireType !== 0)
                            break;
                        message.entitlementKeySizeBytes = reader.uint32();
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Decodes an EntitledKey message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof WidevinePsshData.EntitledKey
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {WidevinePsshData.EntitledKey & WidevinePsshData.EntitledKey.$Shape} EntitledKey
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        EntitledKey.decodeDelimited = function(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an EntitledKey message.
         * @function verify
         * @memberof WidevinePsshData.EntitledKey
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        EntitledKey.verify = function (message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (message.entitlementKeyId != null && $Object.hasOwnProperty.call(message, "entitlementKeyId"))
                if (!(message.entitlementKeyId && typeof message.entitlementKeyId.length === "number" || $util.isString(message.entitlementKeyId)))
                    return "entitlementKeyId: buffer expected";
            if (message.keyId != null && $Object.hasOwnProperty.call(message, "keyId"))
                if (!(message.keyId && typeof message.keyId.length === "number" || $util.isString(message.keyId)))
                    return "keyId: buffer expected";
            if (message.key != null && $Object.hasOwnProperty.call(message, "key"))
                if (!(message.key && typeof message.key.length === "number" || $util.isString(message.key)))
                    return "key: buffer expected";
            if (message.iv != null && $Object.hasOwnProperty.call(message, "iv"))
                if (!(message.iv && typeof message.iv.length === "number" || $util.isString(message.iv)))
                    return "iv: buffer expected";
            if (message.entitlementKeySizeBytes != null && $Object.hasOwnProperty.call(message, "entitlementKeySizeBytes"))
                if (!$util.isInteger(message.entitlementKeySizeBytes))
                    return "entitlementKeySizeBytes: integer expected";
            return null;
        };

        /**
         * Creates an EntitledKey message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof WidevinePsshData.EntitledKey
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {WidevinePsshData.EntitledKey} EntitledKey
         */
        EntitledKey.fromObject = function (object, _depth) {
            if (object instanceof $root.WidevinePsshData.EntitledKey)
                return object;
            if (!$util.isObject(object))
                throw $TypeError(".WidevinePsshData.EntitledKey: object expected");
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let message = new $root.WidevinePsshData.EntitledKey();
            if (object.entitlementKeyId != null)
                if (typeof object.entitlementKeyId === "string")
                    $util.base64.decode(object.entitlementKeyId, message.entitlementKeyId = $util.newBuffer($util.base64.length(object.entitlementKeyId)), 0);
                else if (object.entitlementKeyId.length >= 0)
                    message.entitlementKeyId = object.entitlementKeyId;
            if (object.keyId != null)
                if (typeof object.keyId === "string")
                    $util.base64.decode(object.keyId, message.keyId = $util.newBuffer($util.base64.length(object.keyId)), 0);
                else if (object.keyId.length >= 0)
                    message.keyId = object.keyId;
            if (object.key != null)
                if (typeof object.key === "string")
                    $util.base64.decode(object.key, message.key = $util.newBuffer($util.base64.length(object.key)), 0);
                else if (object.key.length >= 0)
                    message.key = object.key;
            if (object.iv != null)
                if (typeof object.iv === "string")
                    $util.base64.decode(object.iv, message.iv = $util.newBuffer($util.base64.length(object.iv)), 0);
                else if (object.iv.length >= 0)
                    message.iv = object.iv;
            if (object.entitlementKeySizeBytes != null)
                message.entitlementKeySizeBytes = object.entitlementKeySizeBytes >>> 0;
            return message;
        };

        /**
         * Creates a plain object from an EntitledKey message. Also converts values to other types if specified.
         * @function toObject
         * @memberof WidevinePsshData.EntitledKey
         * @static
         * @param {WidevinePsshData.EntitledKey} message EntitledKey
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        EntitledKey.toObject = function (message, options, _depth) {
            if (!options)
                options = {};
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let object = {};
            if (options.defaults) {
                if (options.bytes === $String)
                    object.entitlementKeyId = "";
                else {
                    object.entitlementKeyId = [];
                    if (options.bytes !== $Array)
                        object.entitlementKeyId = $util.newBuffer(object.entitlementKeyId);
                }
                if (options.bytes === $String)
                    object.keyId = "";
                else {
                    object.keyId = [];
                    if (options.bytes !== $Array)
                        object.keyId = $util.newBuffer(object.keyId);
                }
                if (options.bytes === $String)
                    object.key = "";
                else {
                    object.key = [];
                    if (options.bytes !== $Array)
                        object.key = $util.newBuffer(object.key);
                }
                if (options.bytes === $String)
                    object.iv = "";
                else {
                    object.iv = [];
                    if (options.bytes !== $Array)
                        object.iv = $util.newBuffer(object.iv);
                }
                object.entitlementKeySizeBytes = 32;
            }
            if (message.entitlementKeyId != null && $Object.hasOwnProperty.call(message, "entitlementKeyId"))
                object.entitlementKeyId = options.bytes === $String ? $util.base64.encode(message.entitlementKeyId, 0, message.entitlementKeyId.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.entitlementKeyId) : message.entitlementKeyId;
            if (message.keyId != null && $Object.hasOwnProperty.call(message, "keyId"))
                object.keyId = options.bytes === $String ? $util.base64.encode(message.keyId, 0, message.keyId.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.keyId) : message.keyId;
            if (message.key != null && $Object.hasOwnProperty.call(message, "key"))
                object.key = options.bytes === $String ? $util.base64.encode(message.key, 0, message.key.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.key) : message.key;
            if (message.iv != null && $Object.hasOwnProperty.call(message, "iv"))
                object.iv = options.bytes === $String ? $util.base64.encode(message.iv, 0, message.iv.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.iv) : message.iv;
            if (message.entitlementKeySizeBytes != null && $Object.hasOwnProperty.call(message, "entitlementKeySizeBytes"))
                object.entitlementKeySizeBytes = message.entitlementKeySizeBytes;
            return object;
        };

        /**
         * Converts this EntitledKey to JSON.
         * @function toJSON
         * @memberof WidevinePsshData.EntitledKey
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        EntitledKey.prototype.toJSON = function() {
            return EntitledKey.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for EntitledKey
         * @function getTypeUrl
         * @memberof WidevinePsshData.EntitledKey
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        EntitledKey.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/WidevinePsshData.EntitledKey";
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
    WidevinePsshData.Algorithm = (function() {
        const valuesById = {}, values = $Object.create(valuesById);
        values[valuesById[0] = "UNENCRYPTED"] = 0;
        values[valuesById[1] = "AESCTR"] = 1;
        return values;
    })();

    return WidevinePsshData;
})();

export const FileHashes = $root.FileHashes = (() => {

    /**
     * Properties of a FileHashes.
     * @typedef {Object} FileHashes.$Properties
     * @property {Uint8Array|null} [signer] FileHashes signer
     * @property {Array.<FileHashes.Signature.$Properties>|null} [signatures] FileHashes signatures
     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
     */

    /**
     * Properties of a FileHashes.
     * @exports IFileHashes
     * @interface IFileHashes
     * @augments FileHashes.$Properties
     * @deprecated Use FileHashes.$Properties instead.
     */

    /**
     * Shape of a FileHashes.
     * @typedef {FileHashes.$Properties} FileHashes.$Shape
     */

    /**
     * Constructs a new FileHashes.
     * @exports FileHashes
     * @classdesc Represents a FileHashes.
     * @constructor
     * @param {FileHashes.$Properties=} [properties] Properties to set
     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
     */
    const FileHashes = function (properties) {
        this.signatures = [];
        if (properties)
            for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    };

    /**
     * FileHashes signer.
     * @member {Uint8Array} signer
     * @memberof FileHashes
     * @instance
     */
    FileHashes.prototype.signer = $util.newBuffer([]);

    /**
     * FileHashes signatures.
     * @member {Array.<FileHashes.Signature.$Properties>} signatures
     * @memberof FileHashes
     * @instance
     */
    FileHashes.prototype.signatures = $util.emptyArray;

    /**
     * Creates a new FileHashes instance using the specified properties.
     * @function create
     * @memberof FileHashes
     * @static
     * @param {FileHashes.$Properties=} [properties] Properties to set
     * @returns {FileHashes} FileHashes instance
     * @type {{
     *   (properties: FileHashes.$Shape): FileHashes & FileHashes.$Shape;
     *   (properties?: FileHashes.$Properties): FileHashes;
     * }}
     */
    FileHashes.create = function(properties) {
        return new FileHashes(properties);
    };

    /**
     * Encodes the specified FileHashes message. Does not implicitly {@link FileHashes.verify|verify} messages.
     * @function encode
     * @memberof FileHashes
     * @static
     * @param {FileHashes.$Properties} message FileHashes message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    FileHashes.encode = function (message, writer, _depth) {
        if (!writer)
            writer = new $Writer();
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        if (message.signer != null && $Object.hasOwnProperty.call(message, "signer"))
            writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.signer);
        if (message.signatures != null && message.signatures.length)
            for (let i = 0; i < message.signatures.length; ++i)
                $root.FileHashes.Signature.encode(message.signatures[i], writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim();
        if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    /**
     * Encodes the specified FileHashes message, length delimited. Does not implicitly {@link FileHashes.verify|verify} messages.
     * @function encodeDelimited
     * @memberof FileHashes
     * @static
     * @param {FileHashes.$Properties} message FileHashes message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    FileHashes.encodeDelimited = function(message, writer) {
        return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
    };

    /**
     * Decodes a FileHashes message from the specified reader or buffer.
     * @function decode
     * @memberof FileHashes
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {FileHashes & FileHashes.$Shape} FileHashes
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    FileHashes.decode = function (reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw $Error("max depth exceeded");
        let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.FileHashes();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = $undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 2)
                        break;
                    message.signer = reader.bytes();
                    continue;
                }
            case 2: {
                    if (wireType !== 2)
                        break;
                    if (!(message.signatures && message.signatures.length))
                        message.signatures = [];
                    message.signatures.push($root.FileHashes.Signature.decode(reader, reader.uint32(), $undefined, _depth + 1));
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            if (!reader.discardUnknown) {
                $util.makeProp(message, "$unknowns", false);
                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
            }
        }
        if (_end !== $undefined)
            throw $Error("missing end group");
        return message;
    };

    /**
     * Decodes a FileHashes message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof FileHashes
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {FileHashes & FileHashes.$Shape} FileHashes
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    FileHashes.decodeDelimited = function(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a FileHashes message.
     * @function verify
     * @memberof FileHashes
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    FileHashes.verify = function (message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (message.signer != null && $Object.hasOwnProperty.call(message, "signer"))
            if (!(message.signer && typeof message.signer.length === "number" || $util.isString(message.signer)))
                return "signer: buffer expected";
        if (message.signatures != null && $Object.hasOwnProperty.call(message, "signatures")) {
            if (!$Array.isArray(message.signatures))
                return "signatures: array expected";
            for (let i = 0; i < message.signatures.length; ++i) {
                let error = $root.FileHashes.Signature.verify(message.signatures[i], _depth + 1);
                if (error)
                    return "signatures." + error;
            }
        }
        return null;
    };

    /**
     * Creates a FileHashes message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof FileHashes
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {FileHashes} FileHashes
     */
    FileHashes.fromObject = function (object, _depth) {
        if (object instanceof $root.FileHashes)
            return object;
        if (!$util.isObject(object))
            throw $TypeError(".FileHashes: object expected");
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        let message = new $root.FileHashes();
        if (object.signer != null)
            if (typeof object.signer === "string")
                $util.base64.decode(object.signer, message.signer = $util.newBuffer($util.base64.length(object.signer)), 0);
            else if (object.signer.length >= 0)
                message.signer = object.signer;
        if (object.signatures) {
            if (!$Array.isArray(object.signatures))
                throw $TypeError(".FileHashes.signatures: array expected");
            message.signatures = $Array(object.signatures.length);
            for (let i = 0; i < object.signatures.length; ++i) {
                if (!$util.isObject(object.signatures[i]))
                    throw $TypeError(".FileHashes.signatures: object expected");
                message.signatures[i] = $root.FileHashes.Signature.fromObject(object.signatures[i], _depth + 1);
            }
        }
        return message;
    };

    /**
     * Creates a plain object from a FileHashes message. Also converts values to other types if specified.
     * @function toObject
     * @memberof FileHashes
     * @static
     * @param {FileHashes} message FileHashes
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    FileHashes.toObject = function (message, options, _depth) {
        if (!options)
            options = {};
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        let object = {};
        if (options.arrays || options.defaults)
            object.signatures = [];
        if (options.defaults)
            if (options.bytes === $String)
                object.signer = "";
            else {
                object.signer = [];
                if (options.bytes !== $Array)
                    object.signer = $util.newBuffer(object.signer);
            }
        if (message.signer != null && $Object.hasOwnProperty.call(message, "signer"))
            object.signer = options.bytes === $String ? $util.base64.encode(message.signer, 0, message.signer.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.signer) : message.signer;
        if (message.signatures && message.signatures.length) {
            object.signatures = $Array(message.signatures.length);
            for (let j = 0; j < message.signatures.length; ++j)
                object.signatures[j] = $root.FileHashes.Signature.toObject(message.signatures[j], options, _depth + 1);
        }
        return object;
    };

    /**
     * Converts this FileHashes to JSON.
     * @function toJSON
     * @memberof FileHashes
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    FileHashes.prototype.toJSON = function() {
        return FileHashes.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the type url for FileHashes
     * @function getTypeUrl
     * @memberof FileHashes
     * @static
     * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns {string} The type url
     */
    FileHashes.getTypeUrl = function(prefix) {
        if (prefix === $undefined)
            prefix = "type.googleapis.com";
        return prefix + "/FileHashes";
    };

    FileHashes.Signature = (function() {

        /**
         * Properties of a Signature.
         * @typedef {Object} FileHashes.Signature.$Properties
         * @property {string|null} [filename] Signature filename
         * @property {boolean|null} [testSigning] Signature testSigning
         * @property {Uint8Array|null} [SHA512Hash] Signature SHA512Hash
         * @property {boolean|null} [mainExe] Signature mainExe
         * @property {Uint8Array|null} [signature] Signature signature
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */

        /**
         * Properties of a Signature.
         * @memberof FileHashes
         * @interface ISignature
         * @augments FileHashes.Signature.$Properties
         * @deprecated Use FileHashes.Signature.$Properties instead.
         */

        /**
         * Shape of a Signature.
         * @typedef {FileHashes.Signature.$Properties} FileHashes.Signature.$Shape
         */

        /**
         * Constructs a new Signature.
         * @memberof FileHashes
         * @classdesc Represents a Signature.
         * @constructor
         * @param {FileHashes.Signature.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */
        const Signature = function (properties) {
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * Signature filename.
         * @member {string} filename
         * @memberof FileHashes.Signature
         * @instance
         */
        Signature.prototype.filename = "";

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
         * @param {FileHashes.Signature.$Properties=} [properties] Properties to set
         * @returns {FileHashes.Signature} Signature instance
         * @type {{
         *   (properties: FileHashes.Signature.$Shape): FileHashes.Signature & FileHashes.Signature.$Shape;
         *   (properties?: FileHashes.Signature.$Properties): FileHashes.Signature;
         * }}
         */
        Signature.create = function(properties) {
            return new Signature(properties);
        };

        /**
         * Encodes the specified Signature message. Does not implicitly {@link FileHashes.Signature.verify|verify} messages.
         * @function encode
         * @memberof FileHashes.Signature
         * @static
         * @param {FileHashes.Signature.$Properties} message Signature message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Signature.encode = function (message, writer, _depth) {
            if (!writer)
                writer = new $Writer();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.filename != null && $Object.hasOwnProperty.call(message, "filename"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.filename);
            if (message.testSigning != null && $Object.hasOwnProperty.call(message, "testSigning"))
                writer.uint32(/* id 2, wireType 0 =*/16).bool(message.testSigning);
            if (message.SHA512Hash != null && $Object.hasOwnProperty.call(message, "SHA512Hash"))
                writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.SHA512Hash);
            if (message.mainExe != null && $Object.hasOwnProperty.call(message, "mainExe"))
                writer.uint32(/* id 4, wireType 0 =*/32).bool(message.mainExe);
            if (message.signature != null && $Object.hasOwnProperty.call(message, "signature"))
                writer.uint32(/* id 5, wireType 2 =*/42).bytes(message.signature);
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified Signature message, length delimited. Does not implicitly {@link FileHashes.Signature.verify|verify} messages.
         * @function encodeDelimited
         * @memberof FileHashes.Signature
         * @static
         * @param {FileHashes.Signature.$Properties} message Signature message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Signature.encodeDelimited = function(message, writer) {
            return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
        };

        /**
         * Decodes a Signature message from the specified reader or buffer.
         * @function decode
         * @memberof FileHashes.Signature
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {FileHashes.Signature & FileHashes.Signature.$Shape} Signature
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Signature.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.FileHashes.Signature();
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        message.filename = reader.string();
                        continue;
                    }
                case 2: {
                        if (wireType !== 0)
                            break;
                        message.testSigning = reader.bool();
                        continue;
                    }
                case 3: {
                        if (wireType !== 2)
                            break;
                        message.SHA512Hash = reader.bytes();
                        continue;
                    }
                case 4: {
                        if (wireType !== 0)
                            break;
                        message.mainExe = reader.bool();
                        continue;
                    }
                case 5: {
                        if (wireType !== 2)
                            break;
                        message.signature = reader.bytes();
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Decodes a Signature message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof FileHashes.Signature
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {FileHashes.Signature & FileHashes.Signature.$Shape} Signature
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Signature.decodeDelimited = function(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Signature message.
         * @function verify
         * @memberof FileHashes.Signature
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Signature.verify = function (message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (message.filename != null && $Object.hasOwnProperty.call(message, "filename"))
                if (!$util.isString(message.filename))
                    return "filename: string expected";
            if (message.testSigning != null && $Object.hasOwnProperty.call(message, "testSigning"))
                if (typeof message.testSigning !== "boolean")
                    return "testSigning: boolean expected";
            if (message.SHA512Hash != null && $Object.hasOwnProperty.call(message, "SHA512Hash"))
                if (!(message.SHA512Hash && typeof message.SHA512Hash.length === "number" || $util.isString(message.SHA512Hash)))
                    return "SHA512Hash: buffer expected";
            if (message.mainExe != null && $Object.hasOwnProperty.call(message, "mainExe"))
                if (typeof message.mainExe !== "boolean")
                    return "mainExe: boolean expected";
            if (message.signature != null && $Object.hasOwnProperty.call(message, "signature"))
                if (!(message.signature && typeof message.signature.length === "number" || $util.isString(message.signature)))
                    return "signature: buffer expected";
            return null;
        };

        /**
         * Creates a Signature message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof FileHashes.Signature
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {FileHashes.Signature} Signature
         */
        Signature.fromObject = function (object, _depth) {
            if (object instanceof $root.FileHashes.Signature)
                return object;
            if (!$util.isObject(object))
                throw $TypeError(".FileHashes.Signature: object expected");
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let message = new $root.FileHashes.Signature();
            if (object.filename != null)
                message.filename = $String(object.filename);
            if (object.testSigning != null)
                message.testSigning = $Boolean(object.testSigning);
            if (object.SHA512Hash != null)
                if (typeof object.SHA512Hash === "string")
                    $util.base64.decode(object.SHA512Hash, message.SHA512Hash = $util.newBuffer($util.base64.length(object.SHA512Hash)), 0);
                else if (object.SHA512Hash.length >= 0)
                    message.SHA512Hash = object.SHA512Hash;
            if (object.mainExe != null)
                message.mainExe = $Boolean(object.mainExe);
            if (object.signature != null)
                if (typeof object.signature === "string")
                    $util.base64.decode(object.signature, message.signature = $util.newBuffer($util.base64.length(object.signature)), 0);
                else if (object.signature.length >= 0)
                    message.signature = object.signature;
            return message;
        };

        /**
         * Creates a plain object from a Signature message. Also converts values to other types if specified.
         * @function toObject
         * @memberof FileHashes.Signature
         * @static
         * @param {FileHashes.Signature} message Signature
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Signature.toObject = function (message, options, _depth) {
            if (!options)
                options = {};
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let object = {};
            if (options.defaults) {
                object.filename = "";
                object.testSigning = false;
                if (options.bytes === $String)
                    object.SHA512Hash = "";
                else {
                    object.SHA512Hash = [];
                    if (options.bytes !== $Array)
                        object.SHA512Hash = $util.newBuffer(object.SHA512Hash);
                }
                object.mainExe = false;
                if (options.bytes === $String)
                    object.signature = "";
                else {
                    object.signature = [];
                    if (options.bytes !== $Array)
                        object.signature = $util.newBuffer(object.signature);
                }
            }
            if (message.filename != null && $Object.hasOwnProperty.call(message, "filename"))
                object.filename = message.filename;
            if (message.testSigning != null && $Object.hasOwnProperty.call(message, "testSigning"))
                object.testSigning = message.testSigning;
            if (message.SHA512Hash != null && $Object.hasOwnProperty.call(message, "SHA512Hash"))
                object.SHA512Hash = options.bytes === $String ? $util.base64.encode(message.SHA512Hash, 0, message.SHA512Hash.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.SHA512Hash) : message.SHA512Hash;
            if (message.mainExe != null && $Object.hasOwnProperty.call(message, "mainExe"))
                object.mainExe = message.mainExe;
            if (message.signature != null && $Object.hasOwnProperty.call(message, "signature"))
                object.signature = options.bytes === $String ? $util.base64.encode(message.signature, 0, message.signature.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.signature) : message.signature;
            return object;
        };

        /**
         * Converts this Signature to JSON.
         * @function toJSON
         * @memberof FileHashes.Signature
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Signature.prototype.toJSON = function() {
            return Signature.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for Signature
         * @function getTypeUrl
         * @memberof FileHashes.Signature
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        Signature.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/FileHashes.Signature";
        };

        return Signature;
    })();

    return FileHashes;
})();

export const RemoteAttestation = $root.RemoteAttestation = (() => {

    /**
     * Properties of a RemoteAttestation.
     * @typedef {Object} RemoteAttestation.$Properties
     * @property {EncryptedClientIdentification.$Properties|null} [certificate] RemoteAttestation certificate
     * @property {Uint8Array|null} [salt] RemoteAttestation salt
     * @property {Uint8Array|null} [signature] RemoteAttestation signature
     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
     */

    /**
     * Properties of a RemoteAttestation.
     * @exports IRemoteAttestation
     * @interface IRemoteAttestation
     * @augments RemoteAttestation.$Properties
     * @deprecated Use RemoteAttestation.$Properties instead.
     */

    /**
     * Shape of a RemoteAttestation.
     * @typedef {RemoteAttestation.$Properties} RemoteAttestation.$Shape
     */

    /**
     * Constructs a new RemoteAttestation.
     * @exports RemoteAttestation
     * @classdesc Represents a RemoteAttestation.
     * @constructor
     * @param {RemoteAttestation.$Properties=} [properties] Properties to set
     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
     */
    const RemoteAttestation = function (properties) {
        if (properties)
            for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    };

    /**
     * RemoteAttestation certificate.
     * @member {EncryptedClientIdentification.$Properties|null|undefined} certificate
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
     * @param {RemoteAttestation.$Properties=} [properties] Properties to set
     * @returns {RemoteAttestation} RemoteAttestation instance
     * @type {{
     *   (properties: RemoteAttestation.$Shape): RemoteAttestation & RemoteAttestation.$Shape;
     *   (properties?: RemoteAttestation.$Properties): RemoteAttestation;
     * }}
     */
    RemoteAttestation.create = function(properties) {
        return new RemoteAttestation(properties);
    };

    /**
     * Encodes the specified RemoteAttestation message. Does not implicitly {@link RemoteAttestation.verify|verify} messages.
     * @function encode
     * @memberof RemoteAttestation
     * @static
     * @param {RemoteAttestation.$Properties} message RemoteAttestation message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    RemoteAttestation.encode = function (message, writer, _depth) {
        if (!writer)
            writer = new $Writer();
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        if (message.certificate != null && $Object.hasOwnProperty.call(message, "certificate"))
            $root.EncryptedClientIdentification.encode(message.certificate, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
        if (message.salt != null && $Object.hasOwnProperty.call(message, "salt"))
            writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.salt);
        if (message.signature != null && $Object.hasOwnProperty.call(message, "signature"))
            writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.signature);
        if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    /**
     * Encodes the specified RemoteAttestation message, length delimited. Does not implicitly {@link RemoteAttestation.verify|verify} messages.
     * @function encodeDelimited
     * @memberof RemoteAttestation
     * @static
     * @param {RemoteAttestation.$Properties} message RemoteAttestation message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    RemoteAttestation.encodeDelimited = function(message, writer) {
        return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
    };

    /**
     * Decodes a RemoteAttestation message from the specified reader or buffer.
     * @function decode
     * @memberof RemoteAttestation
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {RemoteAttestation & RemoteAttestation.$Shape} RemoteAttestation
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    RemoteAttestation.decode = function (reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw $Error("max depth exceeded");
        let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.RemoteAttestation();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = $undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 2)
                        break;
                    message.certificate = $root.EncryptedClientIdentification.decode(reader, reader.uint32(), $undefined, _depth + 1, message.certificate);
                    continue;
                }
            case 2: {
                    if (wireType !== 2)
                        break;
                    message.salt = reader.bytes();
                    continue;
                }
            case 3: {
                    if (wireType !== 2)
                        break;
                    message.signature = reader.bytes();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            if (!reader.discardUnknown) {
                $util.makeProp(message, "$unknowns", false);
                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
            }
        }
        if (_end !== $undefined)
            throw $Error("missing end group");
        return message;
    };

    /**
     * Decodes a RemoteAttestation message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof RemoteAttestation
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {RemoteAttestation & RemoteAttestation.$Shape} RemoteAttestation
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    RemoteAttestation.decodeDelimited = function(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a RemoteAttestation message.
     * @function verify
     * @memberof RemoteAttestation
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    RemoteAttestation.verify = function (message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (message.certificate != null && $Object.hasOwnProperty.call(message, "certificate")) {
            let error = $root.EncryptedClientIdentification.verify(message.certificate, _depth + 1);
            if (error)
                return "certificate." + error;
        }
        if (message.salt != null && $Object.hasOwnProperty.call(message, "salt"))
            if (!(message.salt && typeof message.salt.length === "number" || $util.isString(message.salt)))
                return "salt: buffer expected";
        if (message.signature != null && $Object.hasOwnProperty.call(message, "signature"))
            if (!(message.signature && typeof message.signature.length === "number" || $util.isString(message.signature)))
                return "signature: buffer expected";
        return null;
    };

    /**
     * Creates a RemoteAttestation message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof RemoteAttestation
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {RemoteAttestation} RemoteAttestation
     */
    RemoteAttestation.fromObject = function (object, _depth) {
        if (object instanceof $root.RemoteAttestation)
            return object;
        if (!$util.isObject(object))
            throw $TypeError(".RemoteAttestation: object expected");
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        let message = new $root.RemoteAttestation();
        if (object.certificate != null) {
            if (!$util.isObject(object.certificate))
                throw $TypeError(".RemoteAttestation.certificate: object expected");
            message.certificate = $root.EncryptedClientIdentification.fromObject(object.certificate, _depth + 1);
        }
        if (object.salt != null)
            if (typeof object.salt === "string")
                $util.base64.decode(object.salt, message.salt = $util.newBuffer($util.base64.length(object.salt)), 0);
            else if (object.salt.length >= 0)
                message.salt = object.salt;
        if (object.signature != null)
            if (typeof object.signature === "string")
                $util.base64.decode(object.signature, message.signature = $util.newBuffer($util.base64.length(object.signature)), 0);
            else if (object.signature.length >= 0)
                message.signature = object.signature;
        return message;
    };

    /**
     * Creates a plain object from a RemoteAttestation message. Also converts values to other types if specified.
     * @function toObject
     * @memberof RemoteAttestation
     * @static
     * @param {RemoteAttestation} message RemoteAttestation
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    RemoteAttestation.toObject = function (message, options, _depth) {
        if (!options)
            options = {};
        if (_depth === $undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw $Error("max depth exceeded");
        let object = {};
        if (options.defaults) {
            object.certificate = null;
            if (options.bytes === $String)
                object.salt = "";
            else {
                object.salt = [];
                if (options.bytes !== $Array)
                    object.salt = $util.newBuffer(object.salt);
            }
            if (options.bytes === $String)
                object.signature = "";
            else {
                object.signature = [];
                if (options.bytes !== $Array)
                    object.signature = $util.newBuffer(object.signature);
            }
        }
        if (message.certificate != null && $Object.hasOwnProperty.call(message, "certificate"))
            object.certificate = $root.EncryptedClientIdentification.toObject(message.certificate, options, _depth + 1);
        if (message.salt != null && $Object.hasOwnProperty.call(message, "salt"))
            object.salt = options.bytes === $String ? $util.base64.encode(message.salt, 0, message.salt.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.salt) : message.salt;
        if (message.signature != null && $Object.hasOwnProperty.call(message, "signature"))
            object.signature = options.bytes === $String ? $util.base64.encode(message.signature, 0, message.signature.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.signature) : message.signature;
        return object;
    };

    /**
     * Converts this RemoteAttestation to JSON.
     * @function toJSON
     * @memberof RemoteAttestation
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    RemoteAttestation.prototype.toJSON = function() {
        return RemoteAttestation.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the type url for RemoteAttestation
     * @function getTypeUrl
     * @memberof RemoteAttestation
     * @static
     * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns {string} The type url
     */
    RemoteAttestation.getTypeUrl = function(prefix) {
        if (prefix === $undefined)
            prefix = "type.googleapis.com";
        return prefix + "/RemoteAttestation";
    };

    return RemoteAttestation;
})();

export {
  $root as default
};
