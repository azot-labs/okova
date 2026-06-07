import * as $protobuf from "protobufjs";
import Long = require("long");

/** LicenseType enum. */
export enum LicenseType {

    /** STREAMING value */
    STREAMING = 1,

    /** OFFLINE value */
    OFFLINE = 2,

    /** AUTOMATIC value */
    AUTOMATIC = 3
}

/** PlatformVerificationStatus enum. */
export enum PlatformVerificationStatus {

    /** PLATFORM_UNVERIFIED value */
    PLATFORM_UNVERIFIED = 0,

    /** PLATFORM_TAMPERED value */
    PLATFORM_TAMPERED = 1,

    /** PLATFORM_SOFTWARE_VERIFIED value */
    PLATFORM_SOFTWARE_VERIFIED = 2,

    /** PLATFORM_HARDWARE_VERIFIED value */
    PLATFORM_HARDWARE_VERIFIED = 3,

    /** PLATFORM_NO_VERIFICATION value */
    PLATFORM_NO_VERIFICATION = 4,

    /** PLATFORM_SECURE_STORAGE_SOFTWARE_VERIFIED value */
    PLATFORM_SECURE_STORAGE_SOFTWARE_VERIFIED = 5
}

/**
 * Properties of a LicenseIdentification.
 * @deprecated Use LicenseIdentification.$Properties instead.
 */
export interface ILicenseIdentification extends LicenseIdentification.$Properties {
}

/** Represents a LicenseIdentification. */
export class LicenseIdentification {

    /**
     * Constructs a new LicenseIdentification.
     * @param [properties] Properties to set
     */
    constructor(properties?: LicenseIdentification.$Properties);

    /** Unknown fields preserved while decoding */
    $unknowns?: Uint8Array[];

    /** LicenseIdentification requestId. */
    requestId: Uint8Array;

    /** LicenseIdentification sessionId. */
    sessionId: Uint8Array;

    /** LicenseIdentification purchaseId. */
    purchaseId: Uint8Array;

    /** LicenseIdentification type. */
    type: LicenseType;

    /** LicenseIdentification version. */
    version: number;

    /** LicenseIdentification providerSessionToken. */
    providerSessionToken: Uint8Array;

    /**
     * Creates a new LicenseIdentification instance using the specified properties.
     * @param [properties] Properties to set
     * @returns LicenseIdentification instance
     */
    static create(properties: LicenseIdentification.$Shape): LicenseIdentification & LicenseIdentification.$Shape;
    static create(properties?: LicenseIdentification.$Properties): LicenseIdentification;

    /**
     * Encodes the specified LicenseIdentification message. Does not implicitly {@link LicenseIdentification.verify|verify} messages.
     * @param message LicenseIdentification message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: LicenseIdentification.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified LicenseIdentification message, length delimited. Does not implicitly {@link LicenseIdentification.verify|verify} messages.
     * @param message LicenseIdentification message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: LicenseIdentification.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a LicenseIdentification message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {LicenseIdentification & LicenseIdentification.$Shape} LicenseIdentification
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LicenseIdentification & LicenseIdentification.$Shape;

    /**
     * Decodes a LicenseIdentification message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {LicenseIdentification & LicenseIdentification.$Shape} LicenseIdentification
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LicenseIdentification & LicenseIdentification.$Shape;

    /**
     * Verifies a LicenseIdentification message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a LicenseIdentification message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns LicenseIdentification
     */
    static fromObject(object: { [k: string]: any }): LicenseIdentification;

    /**
     * Creates a plain object from a LicenseIdentification message. Also converts values to other types if specified.
     * @param message LicenseIdentification
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: LicenseIdentification, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this LicenseIdentification to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for LicenseIdentification
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace LicenseIdentification {

    /** Properties of a LicenseIdentification. */
    interface $Properties {

        /** LicenseIdentification requestId */
        requestId?: (Uint8Array|null);

        /** LicenseIdentification sessionId */
        sessionId?: (Uint8Array|null);

        /** LicenseIdentification purchaseId */
        purchaseId?: (Uint8Array|null);

        /** LicenseIdentification type */
        type?: (LicenseType|null);

        /** LicenseIdentification version */
        version?: (number|null);

        /** LicenseIdentification providerSessionToken */
        providerSessionToken?: (Uint8Array|null);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a LicenseIdentification. */
    type $Shape = LicenseIdentification.$Properties;
}

/**
 * Properties of a License.
 * @deprecated Use License.$Properties instead.
 */
export interface ILicense extends License.$Properties {
}

/** Represents a License. */
export class License {

    /**
     * Constructs a new License.
     * @param [properties] Properties to set
     */
    constructor(properties?: License.$Properties);

    /** Unknown fields preserved while decoding */
    $unknowns?: Uint8Array[];

    /** License id. */
    id?: (LicenseIdentification.$Properties|null);

    /** License policy. */
    policy?: (License.Policy.$Properties|null);

    /** License key. */
    key: License.KeyContainer.$Properties[];

    /** License licenseStartTime. */
    licenseStartTime: (number|Long);

    /** License remoteAttestationVerified. */
    remoteAttestationVerified: boolean;

    /** License providerClientToken. */
    providerClientToken: Uint8Array;

    /** License protectionScheme. */
    protectionScheme: number;

    /** License srmRequirement. */
    srmRequirement: Uint8Array;

    /** License srmUpdate. */
    srmUpdate: Uint8Array;

    /** License platformVerificationStatus. */
    platformVerificationStatus: PlatformVerificationStatus;

    /** License groupIds. */
    groupIds: Uint8Array[];

    /**
     * Creates a new License instance using the specified properties.
     * @param [properties] Properties to set
     * @returns License instance
     */
    static create(properties: License.$Shape): License & License.$Shape;
    static create(properties?: License.$Properties): License;

    /**
     * Encodes the specified License message. Does not implicitly {@link License.verify|verify} messages.
     * @param message License message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: License.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified License message, length delimited. Does not implicitly {@link License.verify|verify} messages.
     * @param message License message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: License.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a License message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {License & License.$Shape} License
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): License & License.$Shape;

    /**
     * Decodes a License message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {License & License.$Shape} License
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): License & License.$Shape;

    /**
     * Verifies a License message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a License message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns License
     */
    static fromObject(object: { [k: string]: any }): License;

    /**
     * Creates a plain object from a License message. Also converts values to other types if specified.
     * @param message License
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: License, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this License to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for License
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace License {

    /** Properties of a License. */
    interface $Properties {

        /** License id */
        id?: (LicenseIdentification.$Properties|null);

        /** License policy */
        policy?: (License.Policy.$Properties|null);

        /** License key */
        key?: (License.KeyContainer.$Properties[]|null);

        /** License licenseStartTime */
        licenseStartTime?: (number|Long|null);

        /** License remoteAttestationVerified */
        remoteAttestationVerified?: (boolean|null);

        /** License providerClientToken */
        providerClientToken?: (Uint8Array|null);

        /** License protectionScheme */
        protectionScheme?: (number|null);

        /** License srmRequirement */
        srmRequirement?: (Uint8Array|null);

        /** License srmUpdate */
        srmUpdate?: (Uint8Array|null);

        /** License platformVerificationStatus */
        platformVerificationStatus?: (PlatformVerificationStatus|null);

        /** License groupIds */
        groupIds?: (Uint8Array[]|null);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a License. */
    type $Shape = License.$Properties;

    /**
     * Properties of a Policy.
     * @deprecated Use License.Policy.$Properties instead.
     */
    interface IPolicy extends License.Policy.$Properties {
    }

    /** Represents a Policy. */
    class Policy {

        /**
         * Constructs a new Policy.
         * @param [properties] Properties to set
         */
        constructor(properties?: License.Policy.$Properties);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];

        /** Policy canPlay. */
        canPlay: boolean;

        /** Policy canPersist. */
        canPersist: boolean;

        /** Policy canRenew. */
        canRenew: boolean;

        /** Policy rentalDurationSeconds. */
        rentalDurationSeconds: (number|Long);

        /** Policy playbackDurationSeconds. */
        playbackDurationSeconds: (number|Long);

        /** Policy licenseDurationSeconds. */
        licenseDurationSeconds: (number|Long);

        /** Policy renewalRecoveryDurationSeconds. */
        renewalRecoveryDurationSeconds: (number|Long);

        /** Policy renewalServerUrl. */
        renewalServerUrl: string;

        /** Policy renewalDelaySeconds. */
        renewalDelaySeconds: (number|Long);

        /** Policy renewalRetryIntervalSeconds. */
        renewalRetryIntervalSeconds: (number|Long);

        /** Policy renewWithUsage. */
        renewWithUsage: boolean;

        /** Policy alwaysIncludeClientId. */
        alwaysIncludeClientId: boolean;

        /** Policy playStartGracePeriodSeconds. */
        playStartGracePeriodSeconds: (number|Long);

        /** Policy softEnforcePlaybackDuration. */
        softEnforcePlaybackDuration: boolean;

        /** Policy softEnforceRentalDuration. */
        softEnforceRentalDuration: boolean;

        /**
         * Creates a new Policy instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Policy instance
         */
        static create(properties: License.Policy.$Shape): License.Policy & License.Policy.$Shape;
        static create(properties?: License.Policy.$Properties): License.Policy;

        /**
         * Encodes the specified Policy message. Does not implicitly {@link License.Policy.verify|verify} messages.
         * @param message Policy message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: License.Policy.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Policy message, length delimited. Does not implicitly {@link License.Policy.verify|verify} messages.
         * @param message Policy message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: License.Policy.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Policy message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {License.Policy & License.Policy.$Shape} Policy
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): License.Policy & License.Policy.$Shape;

        /**
         * Decodes a Policy message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {License.Policy & License.Policy.$Shape} Policy
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): License.Policy & License.Policy.$Shape;

        /**
         * Verifies a Policy message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Policy message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Policy
         */
        static fromObject(object: { [k: string]: any }): License.Policy;

        /**
         * Creates a plain object from a Policy message. Also converts values to other types if specified.
         * @param message Policy
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: License.Policy, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Policy to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for Policy
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace Policy {

        /** Properties of a Policy. */
        interface $Properties {

            /** Policy canPlay */
            canPlay?: (boolean|null);

            /** Policy canPersist */
            canPersist?: (boolean|null);

            /** Policy canRenew */
            canRenew?: (boolean|null);

            /** Policy rentalDurationSeconds */
            rentalDurationSeconds?: (number|Long|null);

            /** Policy playbackDurationSeconds */
            playbackDurationSeconds?: (number|Long|null);

            /** Policy licenseDurationSeconds */
            licenseDurationSeconds?: (number|Long|null);

            /** Policy renewalRecoveryDurationSeconds */
            renewalRecoveryDurationSeconds?: (number|Long|null);

            /** Policy renewalServerUrl */
            renewalServerUrl?: (string|null);

            /** Policy renewalDelaySeconds */
            renewalDelaySeconds?: (number|Long|null);

            /** Policy renewalRetryIntervalSeconds */
            renewalRetryIntervalSeconds?: (number|Long|null);

            /** Policy renewWithUsage */
            renewWithUsage?: (boolean|null);

            /** Policy alwaysIncludeClientId */
            alwaysIncludeClientId?: (boolean|null);

            /** Policy playStartGracePeriodSeconds */
            playStartGracePeriodSeconds?: (number|Long|null);

            /** Policy softEnforcePlaybackDuration */
            softEnforcePlaybackDuration?: (boolean|null);

            /** Policy softEnforceRentalDuration */
            softEnforceRentalDuration?: (boolean|null);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a Policy. */
        type $Shape = License.Policy.$Properties;
    }

    /**
     * Properties of a KeyContainer.
     * @deprecated Use License.KeyContainer.$Properties instead.
     */
    interface IKeyContainer extends License.KeyContainer.$Properties {
    }

    /** Represents a KeyContainer. */
    class KeyContainer {

        /**
         * Constructs a new KeyContainer.
         * @param [properties] Properties to set
         */
        constructor(properties?: License.KeyContainer.$Properties);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];

        /** KeyContainer id. */
        id: Uint8Array;

        /** KeyContainer iv. */
        iv: Uint8Array;

        /** KeyContainer key. */
        key: Uint8Array;

        /** KeyContainer type. */
        type: License.KeyContainer.KeyType;

        /** KeyContainer level. */
        level: License.KeyContainer.SecurityLevel;

        /** KeyContainer requiredProtection. */
        requiredProtection?: (License.KeyContainer.OutputProtection.$Properties|null);

        /** KeyContainer requestedProtection. */
        requestedProtection?: (License.KeyContainer.OutputProtection.$Properties|null);

        /** KeyContainer keyControl. */
        keyControl?: (License.KeyContainer.KeyControl.$Properties|null);

        /** KeyContainer operatorSessionKeyPermissions. */
        operatorSessionKeyPermissions?: (License.KeyContainer.OperatorSessionKeyPermissions.$Properties|null);

        /** KeyContainer videoResolutionConstraints. */
        videoResolutionConstraints: License.KeyContainer.VideoResolutionConstraint.$Properties[];

        /** KeyContainer antiRollbackUsageTable. */
        antiRollbackUsageTable: boolean;

        /** KeyContainer trackLabel. */
        trackLabel: string;

        /**
         * Creates a new KeyContainer instance using the specified properties.
         * @param [properties] Properties to set
         * @returns KeyContainer instance
         */
        static create(properties: License.KeyContainer.$Shape): License.KeyContainer & License.KeyContainer.$Shape;
        static create(properties?: License.KeyContainer.$Properties): License.KeyContainer;

        /**
         * Encodes the specified KeyContainer message. Does not implicitly {@link License.KeyContainer.verify|verify} messages.
         * @param message KeyContainer message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: License.KeyContainer.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified KeyContainer message, length delimited. Does not implicitly {@link License.KeyContainer.verify|verify} messages.
         * @param message KeyContainer message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: License.KeyContainer.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a KeyContainer message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {License.KeyContainer & License.KeyContainer.$Shape} KeyContainer
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): License.KeyContainer & License.KeyContainer.$Shape;

        /**
         * Decodes a KeyContainer message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {License.KeyContainer & License.KeyContainer.$Shape} KeyContainer
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): License.KeyContainer & License.KeyContainer.$Shape;

        /**
         * Verifies a KeyContainer message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a KeyContainer message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns KeyContainer
         */
        static fromObject(object: { [k: string]: any }): License.KeyContainer;

        /**
         * Creates a plain object from a KeyContainer message. Also converts values to other types if specified.
         * @param message KeyContainer
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: License.KeyContainer, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this KeyContainer to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for KeyContainer
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace KeyContainer {

        /** Properties of a KeyContainer. */
        interface $Properties {

            /** KeyContainer id */
            id?: (Uint8Array|null);

            /** KeyContainer iv */
            iv?: (Uint8Array|null);

            /** KeyContainer key */
            key?: (Uint8Array|null);

            /** KeyContainer type */
            type?: (License.KeyContainer.KeyType|null);

            /** KeyContainer level */
            level?: (License.KeyContainer.SecurityLevel|null);

            /** KeyContainer requiredProtection */
            requiredProtection?: (License.KeyContainer.OutputProtection.$Properties|null);

            /** KeyContainer requestedProtection */
            requestedProtection?: (License.KeyContainer.OutputProtection.$Properties|null);

            /** KeyContainer keyControl */
            keyControl?: (License.KeyContainer.KeyControl.$Properties|null);

            /** KeyContainer operatorSessionKeyPermissions */
            operatorSessionKeyPermissions?: (License.KeyContainer.OperatorSessionKeyPermissions.$Properties|null);

            /** KeyContainer videoResolutionConstraints */
            videoResolutionConstraints?: (License.KeyContainer.VideoResolutionConstraint.$Properties[]|null);

            /** KeyContainer antiRollbackUsageTable */
            antiRollbackUsageTable?: (boolean|null);

            /** KeyContainer trackLabel */
            trackLabel?: (string|null);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a KeyContainer. */
        type $Shape = License.KeyContainer.$Properties;

        /** KeyType enum. */
        enum KeyType {

            /** SIGNING value */
            SIGNING = 1,

            /** CONTENT value */
            CONTENT = 2,

            /** KEY_CONTROL value */
            KEY_CONTROL = 3,

            /** OPERATOR_SESSION value */
            OPERATOR_SESSION = 4,

            /** ENTITLEMENT value */
            ENTITLEMENT = 5,

            /** OEM_CONTENT value */
            OEM_CONTENT = 6
        }

        /** SecurityLevel enum. */
        enum SecurityLevel {

            /** SW_SECURE_CRYPTO value */
            SW_SECURE_CRYPTO = 1,

            /** SW_SECURE_DECODE value */
            SW_SECURE_DECODE = 2,

            /** HW_SECURE_CRYPTO value */
            HW_SECURE_CRYPTO = 3,

            /** HW_SECURE_DECODE value */
            HW_SECURE_DECODE = 4,

            /** HW_SECURE_ALL value */
            HW_SECURE_ALL = 5
        }

        /**
         * Properties of a KeyControl.
         * @deprecated Use License.KeyContainer.KeyControl.$Properties instead.
         */
        interface IKeyControl extends License.KeyContainer.KeyControl.$Properties {
        }

        /** Represents a KeyControl. */
        class KeyControl {

            /**
             * Constructs a new KeyControl.
             * @param [properties] Properties to set
             */
            constructor(properties?: License.KeyContainer.KeyControl.$Properties);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];

            /** KeyControl keyControlBlock. */
            keyControlBlock: Uint8Array;

            /** KeyControl iv. */
            iv: Uint8Array;

            /**
             * Creates a new KeyControl instance using the specified properties.
             * @param [properties] Properties to set
             * @returns KeyControl instance
             */
            static create(properties: License.KeyContainer.KeyControl.$Shape): License.KeyContainer.KeyControl & License.KeyContainer.KeyControl.$Shape;
            static create(properties?: License.KeyContainer.KeyControl.$Properties): License.KeyContainer.KeyControl;

            /**
             * Encodes the specified KeyControl message. Does not implicitly {@link License.KeyContainer.KeyControl.verify|verify} messages.
             * @param message KeyControl message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: License.KeyContainer.KeyControl.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified KeyControl message, length delimited. Does not implicitly {@link License.KeyContainer.KeyControl.verify|verify} messages.
             * @param message KeyControl message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: License.KeyContainer.KeyControl.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a KeyControl message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {License.KeyContainer.KeyControl & License.KeyContainer.KeyControl.$Shape} KeyControl
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): License.KeyContainer.KeyControl & License.KeyContainer.KeyControl.$Shape;

            /**
             * Decodes a KeyControl message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {License.KeyContainer.KeyControl & License.KeyContainer.KeyControl.$Shape} KeyControl
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): License.KeyContainer.KeyControl & License.KeyContainer.KeyControl.$Shape;

            /**
             * Verifies a KeyControl message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a KeyControl message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns KeyControl
             */
            static fromObject(object: { [k: string]: any }): License.KeyContainer.KeyControl;

            /**
             * Creates a plain object from a KeyControl message. Also converts values to other types if specified.
             * @param message KeyControl
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: License.KeyContainer.KeyControl, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this KeyControl to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for KeyControl
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace KeyControl {

            /** Properties of a KeyControl. */
            interface $Properties {

                /** KeyControl keyControlBlock */
                keyControlBlock?: (Uint8Array|null);

                /** KeyControl iv */
                iv?: (Uint8Array|null);

                /** Unknown fields preserved while decoding */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a KeyControl. */
            type $Shape = License.KeyContainer.KeyControl.$Properties;
        }

        /**
         * Properties of an OutputProtection.
         * @deprecated Use License.KeyContainer.OutputProtection.$Properties instead.
         */
        interface IOutputProtection extends License.KeyContainer.OutputProtection.$Properties {
        }

        /** Represents an OutputProtection. */
        class OutputProtection {

            /**
             * Constructs a new OutputProtection.
             * @param [properties] Properties to set
             */
            constructor(properties?: License.KeyContainer.OutputProtection.$Properties);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];

            /** OutputProtection hdcp. */
            hdcp: License.KeyContainer.OutputProtection.HDCP;

            /** OutputProtection cgmsFlags. */
            cgmsFlags: License.KeyContainer.OutputProtection.CGMS;

            /** OutputProtection hdcpSrmRule. */
            hdcpSrmRule: License.KeyContainer.OutputProtection.HdcpSrmRule;

            /** OutputProtection disableAnalogOutput. */
            disableAnalogOutput: boolean;

            /** OutputProtection disableDigitalOutput. */
            disableDigitalOutput: boolean;

            /**
             * Creates a new OutputProtection instance using the specified properties.
             * @param [properties] Properties to set
             * @returns OutputProtection instance
             */
            static create(properties: License.KeyContainer.OutputProtection.$Shape): License.KeyContainer.OutputProtection & License.KeyContainer.OutputProtection.$Shape;
            static create(properties?: License.KeyContainer.OutputProtection.$Properties): License.KeyContainer.OutputProtection;

            /**
             * Encodes the specified OutputProtection message. Does not implicitly {@link License.KeyContainer.OutputProtection.verify|verify} messages.
             * @param message OutputProtection message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: License.KeyContainer.OutputProtection.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified OutputProtection message, length delimited. Does not implicitly {@link License.KeyContainer.OutputProtection.verify|verify} messages.
             * @param message OutputProtection message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: License.KeyContainer.OutputProtection.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an OutputProtection message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {License.KeyContainer.OutputProtection & License.KeyContainer.OutputProtection.$Shape} OutputProtection
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): License.KeyContainer.OutputProtection & License.KeyContainer.OutputProtection.$Shape;

            /**
             * Decodes an OutputProtection message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {License.KeyContainer.OutputProtection & License.KeyContainer.OutputProtection.$Shape} OutputProtection
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): License.KeyContainer.OutputProtection & License.KeyContainer.OutputProtection.$Shape;

            /**
             * Verifies an OutputProtection message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an OutputProtection message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns OutputProtection
             */
            static fromObject(object: { [k: string]: any }): License.KeyContainer.OutputProtection;

            /**
             * Creates a plain object from an OutputProtection message. Also converts values to other types if specified.
             * @param message OutputProtection
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: License.KeyContainer.OutputProtection, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this OutputProtection to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for OutputProtection
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace OutputProtection {

            /** Properties of an OutputProtection. */
            interface $Properties {

                /** OutputProtection hdcp */
                hdcp?: (License.KeyContainer.OutputProtection.HDCP|null);

                /** OutputProtection cgmsFlags */
                cgmsFlags?: (License.KeyContainer.OutputProtection.CGMS|null);

                /** OutputProtection hdcpSrmRule */
                hdcpSrmRule?: (License.KeyContainer.OutputProtection.HdcpSrmRule|null);

                /** OutputProtection disableAnalogOutput */
                disableAnalogOutput?: (boolean|null);

                /** OutputProtection disableDigitalOutput */
                disableDigitalOutput?: (boolean|null);

                /** Unknown fields preserved while decoding */
                $unknowns?: Uint8Array[];
            }

            /** Shape of an OutputProtection. */
            type $Shape = License.KeyContainer.OutputProtection.$Properties;

            /** HDCP enum. */
            enum HDCP {

                /** HDCP_NONE value */
                HDCP_NONE = 0,

                /** HDCP_V1 value */
                HDCP_V1 = 1,

                /** HDCP_V2 value */
                HDCP_V2 = 2,

                /** HDCP_V2_1 value */
                HDCP_V2_1 = 3,

                /** HDCP_V2_2 value */
                HDCP_V2_2 = 4,

                /** HDCP_V2_3 value */
                HDCP_V2_3 = 5,

                /** HDCP_NO_DIGITAL_OUTPUT value */
                HDCP_NO_DIGITAL_OUTPUT = 255
            }

            /** CGMS enum. */
            enum CGMS {

                /** CGMS_NONE value */
                CGMS_NONE = 42,

                /** COPY_FREE value */
                COPY_FREE = 0,

                /** COPY_ONCE value */
                COPY_ONCE = 2,

                /** COPY_NEVER value */
                COPY_NEVER = 3
            }

            /** HdcpSrmRule enum. */
            enum HdcpSrmRule {

                /** HDCP_SRM_RULE_NONE value */
                HDCP_SRM_RULE_NONE = 0,

                /** CURRENT_SRM value */
                CURRENT_SRM = 1
            }
        }

        /**
         * Properties of a VideoResolutionConstraint.
         * @deprecated Use License.KeyContainer.VideoResolutionConstraint.$Properties instead.
         */
        interface IVideoResolutionConstraint extends License.KeyContainer.VideoResolutionConstraint.$Properties {
        }

        /** Represents a VideoResolutionConstraint. */
        class VideoResolutionConstraint {

            /**
             * Constructs a new VideoResolutionConstraint.
             * @param [properties] Properties to set
             */
            constructor(properties?: License.KeyContainer.VideoResolutionConstraint.$Properties);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];

            /** VideoResolutionConstraint minResolutionPixels. */
            minResolutionPixels: number;

            /** VideoResolutionConstraint maxResolutionPixels. */
            maxResolutionPixels: number;

            /** VideoResolutionConstraint requiredProtection. */
            requiredProtection?: (License.KeyContainer.OutputProtection.$Properties|null);

            /**
             * Creates a new VideoResolutionConstraint instance using the specified properties.
             * @param [properties] Properties to set
             * @returns VideoResolutionConstraint instance
             */
            static create(properties: License.KeyContainer.VideoResolutionConstraint.$Shape): License.KeyContainer.VideoResolutionConstraint & License.KeyContainer.VideoResolutionConstraint.$Shape;
            static create(properties?: License.KeyContainer.VideoResolutionConstraint.$Properties): License.KeyContainer.VideoResolutionConstraint;

            /**
             * Encodes the specified VideoResolutionConstraint message. Does not implicitly {@link License.KeyContainer.VideoResolutionConstraint.verify|verify} messages.
             * @param message VideoResolutionConstraint message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: License.KeyContainer.VideoResolutionConstraint.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified VideoResolutionConstraint message, length delimited. Does not implicitly {@link License.KeyContainer.VideoResolutionConstraint.verify|verify} messages.
             * @param message VideoResolutionConstraint message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: License.KeyContainer.VideoResolutionConstraint.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a VideoResolutionConstraint message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {License.KeyContainer.VideoResolutionConstraint & License.KeyContainer.VideoResolutionConstraint.$Shape} VideoResolutionConstraint
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): License.KeyContainer.VideoResolutionConstraint & License.KeyContainer.VideoResolutionConstraint.$Shape;

            /**
             * Decodes a VideoResolutionConstraint message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {License.KeyContainer.VideoResolutionConstraint & License.KeyContainer.VideoResolutionConstraint.$Shape} VideoResolutionConstraint
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): License.KeyContainer.VideoResolutionConstraint & License.KeyContainer.VideoResolutionConstraint.$Shape;

            /**
             * Verifies a VideoResolutionConstraint message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a VideoResolutionConstraint message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns VideoResolutionConstraint
             */
            static fromObject(object: { [k: string]: any }): License.KeyContainer.VideoResolutionConstraint;

            /**
             * Creates a plain object from a VideoResolutionConstraint message. Also converts values to other types if specified.
             * @param message VideoResolutionConstraint
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: License.KeyContainer.VideoResolutionConstraint, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this VideoResolutionConstraint to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for VideoResolutionConstraint
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace VideoResolutionConstraint {

            /** Properties of a VideoResolutionConstraint. */
            interface $Properties {

                /** VideoResolutionConstraint minResolutionPixels */
                minResolutionPixels?: (number|null);

                /** VideoResolutionConstraint maxResolutionPixels */
                maxResolutionPixels?: (number|null);

                /** VideoResolutionConstraint requiredProtection */
                requiredProtection?: (License.KeyContainer.OutputProtection.$Properties|null);

                /** Unknown fields preserved while decoding */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a VideoResolutionConstraint. */
            type $Shape = License.KeyContainer.VideoResolutionConstraint.$Properties;
        }

        /**
         * Properties of an OperatorSessionKeyPermissions.
         * @deprecated Use License.KeyContainer.OperatorSessionKeyPermissions.$Properties instead.
         */
        interface IOperatorSessionKeyPermissions extends License.KeyContainer.OperatorSessionKeyPermissions.$Properties {
        }

        /** Represents an OperatorSessionKeyPermissions. */
        class OperatorSessionKeyPermissions {

            /**
             * Constructs a new OperatorSessionKeyPermissions.
             * @param [properties] Properties to set
             */
            constructor(properties?: License.KeyContainer.OperatorSessionKeyPermissions.$Properties);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];

            /** OperatorSessionKeyPermissions allowEncrypt. */
            allowEncrypt: boolean;

            /** OperatorSessionKeyPermissions allowDecrypt. */
            allowDecrypt: boolean;

            /** OperatorSessionKeyPermissions allowSign. */
            allowSign: boolean;

            /** OperatorSessionKeyPermissions allowSignatureVerify. */
            allowSignatureVerify: boolean;

            /**
             * Creates a new OperatorSessionKeyPermissions instance using the specified properties.
             * @param [properties] Properties to set
             * @returns OperatorSessionKeyPermissions instance
             */
            static create(properties: License.KeyContainer.OperatorSessionKeyPermissions.$Shape): License.KeyContainer.OperatorSessionKeyPermissions & License.KeyContainer.OperatorSessionKeyPermissions.$Shape;
            static create(properties?: License.KeyContainer.OperatorSessionKeyPermissions.$Properties): License.KeyContainer.OperatorSessionKeyPermissions;

            /**
             * Encodes the specified OperatorSessionKeyPermissions message. Does not implicitly {@link License.KeyContainer.OperatorSessionKeyPermissions.verify|verify} messages.
             * @param message OperatorSessionKeyPermissions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: License.KeyContainer.OperatorSessionKeyPermissions.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified OperatorSessionKeyPermissions message, length delimited. Does not implicitly {@link License.KeyContainer.OperatorSessionKeyPermissions.verify|verify} messages.
             * @param message OperatorSessionKeyPermissions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: License.KeyContainer.OperatorSessionKeyPermissions.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an OperatorSessionKeyPermissions message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {License.KeyContainer.OperatorSessionKeyPermissions & License.KeyContainer.OperatorSessionKeyPermissions.$Shape} OperatorSessionKeyPermissions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): License.KeyContainer.OperatorSessionKeyPermissions & License.KeyContainer.OperatorSessionKeyPermissions.$Shape;

            /**
             * Decodes an OperatorSessionKeyPermissions message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {License.KeyContainer.OperatorSessionKeyPermissions & License.KeyContainer.OperatorSessionKeyPermissions.$Shape} OperatorSessionKeyPermissions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): License.KeyContainer.OperatorSessionKeyPermissions & License.KeyContainer.OperatorSessionKeyPermissions.$Shape;

            /**
             * Verifies an OperatorSessionKeyPermissions message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an OperatorSessionKeyPermissions message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns OperatorSessionKeyPermissions
             */
            static fromObject(object: { [k: string]: any }): License.KeyContainer.OperatorSessionKeyPermissions;

            /**
             * Creates a plain object from an OperatorSessionKeyPermissions message. Also converts values to other types if specified.
             * @param message OperatorSessionKeyPermissions
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: License.KeyContainer.OperatorSessionKeyPermissions, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this OperatorSessionKeyPermissions to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for OperatorSessionKeyPermissions
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace OperatorSessionKeyPermissions {

            /** Properties of an OperatorSessionKeyPermissions. */
            interface $Properties {

                /** OperatorSessionKeyPermissions allowEncrypt */
                allowEncrypt?: (boolean|null);

                /** OperatorSessionKeyPermissions allowDecrypt */
                allowDecrypt?: (boolean|null);

                /** OperatorSessionKeyPermissions allowSign */
                allowSign?: (boolean|null);

                /** OperatorSessionKeyPermissions allowSignatureVerify */
                allowSignatureVerify?: (boolean|null);

                /** Unknown fields preserved while decoding */
                $unknowns?: Uint8Array[];
            }

            /** Shape of an OperatorSessionKeyPermissions. */
            type $Shape = License.KeyContainer.OperatorSessionKeyPermissions.$Properties;
        }
    }
}

/** ProtocolVersion enum. */
export enum ProtocolVersion {

    /** VERSION_2_0 value */
    VERSION_2_0 = 20,

    /** VERSION_2_1 value */
    VERSION_2_1 = 21,

    /** VERSION_2_2 value */
    VERSION_2_2 = 22
}

/**
 * Properties of a LicenseRequest.
 * @deprecated Use LicenseRequest.$Properties instead.
 */
export interface ILicenseRequest extends LicenseRequest.$Properties {
}

/** Represents a LicenseRequest. */
export class LicenseRequest {

    /**
     * Constructs a new LicenseRequest.
     * @param [properties] Properties to set
     */
    constructor(properties?: LicenseRequest.$Properties);

    /** Unknown fields preserved while decoding */
    $unknowns?: Uint8Array[];

    /** LicenseRequest clientId. */
    clientId?: (ClientIdentification.$Properties|null);

    /** LicenseRequest contentId. */
    contentId?: (LicenseRequest.ContentIdentification.$Properties|null);

    /** LicenseRequest type. */
    type: LicenseRequest.RequestType;

    /** LicenseRequest requestTime. */
    requestTime: (number|Long);

    /** LicenseRequest keyControlNonceDeprecated. */
    keyControlNonceDeprecated: Uint8Array;

    /** LicenseRequest protocolVersion. */
    protocolVersion: ProtocolVersion;

    /** LicenseRequest keyControlNonce. */
    keyControlNonce: number;

    /** LicenseRequest encryptedClientId. */
    encryptedClientId?: (EncryptedClientIdentification.$Properties|null);

    /**
     * Creates a new LicenseRequest instance using the specified properties.
     * @param [properties] Properties to set
     * @returns LicenseRequest instance
     */
    static create(properties: LicenseRequest.$Shape): LicenseRequest & LicenseRequest.$Shape;
    static create(properties?: LicenseRequest.$Properties): LicenseRequest;

    /**
     * Encodes the specified LicenseRequest message. Does not implicitly {@link LicenseRequest.verify|verify} messages.
     * @param message LicenseRequest message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: LicenseRequest.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified LicenseRequest message, length delimited. Does not implicitly {@link LicenseRequest.verify|verify} messages.
     * @param message LicenseRequest message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: LicenseRequest.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a LicenseRequest message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {LicenseRequest & LicenseRequest.$Shape} LicenseRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LicenseRequest & LicenseRequest.$Shape;

    /**
     * Decodes a LicenseRequest message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {LicenseRequest & LicenseRequest.$Shape} LicenseRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LicenseRequest & LicenseRequest.$Shape;

    /**
     * Verifies a LicenseRequest message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a LicenseRequest message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns LicenseRequest
     */
    static fromObject(object: { [k: string]: any }): LicenseRequest;

    /**
     * Creates a plain object from a LicenseRequest message. Also converts values to other types if specified.
     * @param message LicenseRequest
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: LicenseRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this LicenseRequest to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for LicenseRequest
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace LicenseRequest {

    /** Properties of a LicenseRequest. */
    interface $Properties {

        /** LicenseRequest clientId */
        clientId?: (ClientIdentification.$Properties|null);

        /** LicenseRequest contentId */
        contentId?: (LicenseRequest.ContentIdentification.$Properties|null);

        /** LicenseRequest type */
        type?: (LicenseRequest.RequestType|null);

        /** LicenseRequest requestTime */
        requestTime?: (number|Long|null);

        /** LicenseRequest keyControlNonceDeprecated */
        keyControlNonceDeprecated?: (Uint8Array|null);

        /** LicenseRequest protocolVersion */
        protocolVersion?: (ProtocolVersion|null);

        /** LicenseRequest keyControlNonce */
        keyControlNonce?: (number|null);

        /** LicenseRequest encryptedClientId */
        encryptedClientId?: (EncryptedClientIdentification.$Properties|null);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a LicenseRequest. */
    type $Shape = {
      clientId?: ClientIdentification.$Shape|null;
      contentId?: LicenseRequest.ContentIdentification.$Shape|null;
      type?: LicenseRequest.RequestType|null;
      requestTime?: number|Long|null;
      keyControlNonceDeprecated?: Uint8Array|null;
      protocolVersion?: ProtocolVersion|null;
      keyControlNonce?: number|null;
      encryptedClientId?: EncryptedClientIdentification.$Shape|null;
      $unknowns?: Uint8Array[];
    };

    /**
     * Properties of a ContentIdentification.
     * @deprecated Use LicenseRequest.ContentIdentification.$Properties instead.
     */
    interface IContentIdentification extends LicenseRequest.ContentIdentification.$Properties {
    }

    /** Represents a ContentIdentification. */
    class ContentIdentification {

        /**
         * Constructs a new ContentIdentification.
         * @param [properties] Properties to set
         */
        constructor(properties?: LicenseRequest.ContentIdentification.$Properties);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];

        /** ContentIdentification widevinePsshData. */
        widevinePsshData?: (LicenseRequest.ContentIdentification.WidevinePsshData.$Properties|null);

        /** ContentIdentification webmKeyId. */
        webmKeyId?: (LicenseRequest.ContentIdentification.WebmKeyId.$Properties|null);

        /** ContentIdentification existingLicense. */
        existingLicense?: (LicenseRequest.ContentIdentification.ExistingLicense.$Properties|null);

        /** ContentIdentification initData. */
        initData?: (LicenseRequest.ContentIdentification.InitData.$Properties|null);

        /** ContentIdentification contentIdVariant. */
        contentIdVariant?: ("widevinePsshData"|"webmKeyId"|"existingLicense"|"initData");

        /**
         * Creates a new ContentIdentification instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ContentIdentification instance
         */
        static create(properties: LicenseRequest.ContentIdentification.$Shape): LicenseRequest.ContentIdentification & LicenseRequest.ContentIdentification.$Shape;
        static create(properties?: LicenseRequest.ContentIdentification.$Properties): LicenseRequest.ContentIdentification;

        /**
         * Encodes the specified ContentIdentification message. Does not implicitly {@link LicenseRequest.ContentIdentification.verify|verify} messages.
         * @param message ContentIdentification message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: LicenseRequest.ContentIdentification.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ContentIdentification message, length delimited. Does not implicitly {@link LicenseRequest.ContentIdentification.verify|verify} messages.
         * @param message ContentIdentification message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: LicenseRequest.ContentIdentification.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ContentIdentification message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {LicenseRequest.ContentIdentification & LicenseRequest.ContentIdentification.$Shape} ContentIdentification
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LicenseRequest.ContentIdentification & LicenseRequest.ContentIdentification.$Shape;

        /**
         * Decodes a ContentIdentification message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {LicenseRequest.ContentIdentification & LicenseRequest.ContentIdentification.$Shape} ContentIdentification
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LicenseRequest.ContentIdentification & LicenseRequest.ContentIdentification.$Shape;

        /**
         * Verifies a ContentIdentification message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ContentIdentification message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ContentIdentification
         */
        static fromObject(object: { [k: string]: any }): LicenseRequest.ContentIdentification;

        /**
         * Creates a plain object from a ContentIdentification message. Also converts values to other types if specified.
         * @param message ContentIdentification
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: LicenseRequest.ContentIdentification, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ContentIdentification to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for ContentIdentification
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace ContentIdentification {

        /** Properties of a ContentIdentification. */
        interface $Properties {

            /** ContentIdentification widevinePsshData */
            widevinePsshData?: (LicenseRequest.ContentIdentification.WidevinePsshData.$Properties|null);

            /** ContentIdentification webmKeyId */
            webmKeyId?: (LicenseRequest.ContentIdentification.WebmKeyId.$Properties|null);

            /** ContentIdentification existingLicense */
            existingLicense?: (LicenseRequest.ContentIdentification.ExistingLicense.$Properties|null);

            /** ContentIdentification initData */
            initData?: (LicenseRequest.ContentIdentification.InitData.$Properties|null);

            /** ContentIdentification contentIdVariant */
            contentIdVariant?: ("widevinePsshData"|"webmKeyId"|"existingLicense"|"initData");

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];
        }

        /** Narrowed shape of a ContentIdentification. */
        type $Shape = {
          widevinePsshData?: LicenseRequest.ContentIdentification.WidevinePsshData.$Shape|null;
          webmKeyId?: LicenseRequest.ContentIdentification.WebmKeyId.$Shape|null;
          existingLicense?: LicenseRequest.ContentIdentification.ExistingLicense.$Shape|null;
          initData?: LicenseRequest.ContentIdentification.InitData.$Shape|null;
          $unknowns?: Uint8Array[];
        } & (
          ({ contentIdVariant?: undefined; widevinePsshData?: null; webmKeyId?: null; existingLicense?: null; initData?: null }|{ contentIdVariant?: "widevinePsshData"; widevinePsshData: LicenseRequest.ContentIdentification.WidevinePsshData.$Shape; webmKeyId?: null; existingLicense?: null; initData?: null }|{ contentIdVariant?: "webmKeyId"; widevinePsshData?: null; webmKeyId: LicenseRequest.ContentIdentification.WebmKeyId.$Shape; existingLicense?: null; initData?: null }|{ contentIdVariant?: "existingLicense"; widevinePsshData?: null; webmKeyId?: null; existingLicense: LicenseRequest.ContentIdentification.ExistingLicense.$Shape; initData?: null }|{ contentIdVariant?: "initData"; widevinePsshData?: null; webmKeyId?: null; existingLicense?: null; initData: LicenseRequest.ContentIdentification.InitData.$Shape })
        );

        /**
         * Properties of a WidevinePsshData.
         * @deprecated Use LicenseRequest.ContentIdentification.WidevinePsshData.$Properties instead.
         */
        interface IWidevinePsshData extends LicenseRequest.ContentIdentification.WidevinePsshData.$Properties {
        }

        /** Represents a WidevinePsshData. */
        class WidevinePsshData {

            /**
             * Constructs a new WidevinePsshData.
             * @param [properties] Properties to set
             */
            constructor(properties?: LicenseRequest.ContentIdentification.WidevinePsshData.$Properties);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];

            /** WidevinePsshData psshData. */
            psshData: Uint8Array[];

            /** WidevinePsshData licenseType. */
            licenseType: LicenseType;

            /** WidevinePsshData requestId. */
            requestId: Uint8Array;

            /**
             * Creates a new WidevinePsshData instance using the specified properties.
             * @param [properties] Properties to set
             * @returns WidevinePsshData instance
             */
            static create(properties: LicenseRequest.ContentIdentification.WidevinePsshData.$Shape): LicenseRequest.ContentIdentification.WidevinePsshData & LicenseRequest.ContentIdentification.WidevinePsshData.$Shape;
            static create(properties?: LicenseRequest.ContentIdentification.WidevinePsshData.$Properties): LicenseRequest.ContentIdentification.WidevinePsshData;

            /**
             * Encodes the specified WidevinePsshData message. Does not implicitly {@link LicenseRequest.ContentIdentification.WidevinePsshData.verify|verify} messages.
             * @param message WidevinePsshData message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: LicenseRequest.ContentIdentification.WidevinePsshData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified WidevinePsshData message, length delimited. Does not implicitly {@link LicenseRequest.ContentIdentification.WidevinePsshData.verify|verify} messages.
             * @param message WidevinePsshData message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: LicenseRequest.ContentIdentification.WidevinePsshData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a WidevinePsshData message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {LicenseRequest.ContentIdentification.WidevinePsshData & LicenseRequest.ContentIdentification.WidevinePsshData.$Shape} WidevinePsshData
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LicenseRequest.ContentIdentification.WidevinePsshData & LicenseRequest.ContentIdentification.WidevinePsshData.$Shape;

            /**
             * Decodes a WidevinePsshData message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {LicenseRequest.ContentIdentification.WidevinePsshData & LicenseRequest.ContentIdentification.WidevinePsshData.$Shape} WidevinePsshData
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LicenseRequest.ContentIdentification.WidevinePsshData & LicenseRequest.ContentIdentification.WidevinePsshData.$Shape;

            /**
             * Verifies a WidevinePsshData message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a WidevinePsshData message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns WidevinePsshData
             */
            static fromObject(object: { [k: string]: any }): LicenseRequest.ContentIdentification.WidevinePsshData;

            /**
             * Creates a plain object from a WidevinePsshData message. Also converts values to other types if specified.
             * @param message WidevinePsshData
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: LicenseRequest.ContentIdentification.WidevinePsshData, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this WidevinePsshData to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for WidevinePsshData
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace WidevinePsshData {

            /** Properties of a WidevinePsshData. */
            interface $Properties {

                /** WidevinePsshData psshData */
                psshData?: (Uint8Array[]|null);

                /** WidevinePsshData licenseType */
                licenseType?: (LicenseType|null);

                /** WidevinePsshData requestId */
                requestId?: (Uint8Array|null);

                /** Unknown fields preserved while decoding */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a WidevinePsshData. */
            type $Shape = LicenseRequest.ContentIdentification.WidevinePsshData.$Properties;
        }

        /**
         * Properties of a WebmKeyId.
         * @deprecated Use LicenseRequest.ContentIdentification.WebmKeyId.$Properties instead.
         */
        interface IWebmKeyId extends LicenseRequest.ContentIdentification.WebmKeyId.$Properties {
        }

        /** Represents a WebmKeyId. */
        class WebmKeyId {

            /**
             * Constructs a new WebmKeyId.
             * @param [properties] Properties to set
             */
            constructor(properties?: LicenseRequest.ContentIdentification.WebmKeyId.$Properties);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];

            /** WebmKeyId header. */
            header: Uint8Array;

            /** WebmKeyId licenseType. */
            licenseType: LicenseType;

            /** WebmKeyId requestId. */
            requestId: Uint8Array;

            /**
             * Creates a new WebmKeyId instance using the specified properties.
             * @param [properties] Properties to set
             * @returns WebmKeyId instance
             */
            static create(properties: LicenseRequest.ContentIdentification.WebmKeyId.$Shape): LicenseRequest.ContentIdentification.WebmKeyId & LicenseRequest.ContentIdentification.WebmKeyId.$Shape;
            static create(properties?: LicenseRequest.ContentIdentification.WebmKeyId.$Properties): LicenseRequest.ContentIdentification.WebmKeyId;

            /**
             * Encodes the specified WebmKeyId message. Does not implicitly {@link LicenseRequest.ContentIdentification.WebmKeyId.verify|verify} messages.
             * @param message WebmKeyId message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: LicenseRequest.ContentIdentification.WebmKeyId.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified WebmKeyId message, length delimited. Does not implicitly {@link LicenseRequest.ContentIdentification.WebmKeyId.verify|verify} messages.
             * @param message WebmKeyId message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: LicenseRequest.ContentIdentification.WebmKeyId.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a WebmKeyId message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {LicenseRequest.ContentIdentification.WebmKeyId & LicenseRequest.ContentIdentification.WebmKeyId.$Shape} WebmKeyId
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LicenseRequest.ContentIdentification.WebmKeyId & LicenseRequest.ContentIdentification.WebmKeyId.$Shape;

            /**
             * Decodes a WebmKeyId message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {LicenseRequest.ContentIdentification.WebmKeyId & LicenseRequest.ContentIdentification.WebmKeyId.$Shape} WebmKeyId
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LicenseRequest.ContentIdentification.WebmKeyId & LicenseRequest.ContentIdentification.WebmKeyId.$Shape;

            /**
             * Verifies a WebmKeyId message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a WebmKeyId message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns WebmKeyId
             */
            static fromObject(object: { [k: string]: any }): LicenseRequest.ContentIdentification.WebmKeyId;

            /**
             * Creates a plain object from a WebmKeyId message. Also converts values to other types if specified.
             * @param message WebmKeyId
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: LicenseRequest.ContentIdentification.WebmKeyId, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this WebmKeyId to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for WebmKeyId
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace WebmKeyId {

            /** Properties of a WebmKeyId. */
            interface $Properties {

                /** WebmKeyId header */
                header?: (Uint8Array|null);

                /** WebmKeyId licenseType */
                licenseType?: (LicenseType|null);

                /** WebmKeyId requestId */
                requestId?: (Uint8Array|null);

                /** Unknown fields preserved while decoding */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a WebmKeyId. */
            type $Shape = LicenseRequest.ContentIdentification.WebmKeyId.$Properties;
        }

        /**
         * Properties of an ExistingLicense.
         * @deprecated Use LicenseRequest.ContentIdentification.ExistingLicense.$Properties instead.
         */
        interface IExistingLicense extends LicenseRequest.ContentIdentification.ExistingLicense.$Properties {
        }

        /** Represents an ExistingLicense. */
        class ExistingLicense {

            /**
             * Constructs a new ExistingLicense.
             * @param [properties] Properties to set
             */
            constructor(properties?: LicenseRequest.ContentIdentification.ExistingLicense.$Properties);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];

            /** ExistingLicense licenseId. */
            licenseId?: (LicenseIdentification.$Properties|null);

            /** ExistingLicense secondsSinceStarted. */
            secondsSinceStarted: (number|Long);

            /** ExistingLicense secondsSinceLastPlayed. */
            secondsSinceLastPlayed: (number|Long);

            /** ExistingLicense sessionUsageTableEntry. */
            sessionUsageTableEntry: Uint8Array;

            /**
             * Creates a new ExistingLicense instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ExistingLicense instance
             */
            static create(properties: LicenseRequest.ContentIdentification.ExistingLicense.$Shape): LicenseRequest.ContentIdentification.ExistingLicense & LicenseRequest.ContentIdentification.ExistingLicense.$Shape;
            static create(properties?: LicenseRequest.ContentIdentification.ExistingLicense.$Properties): LicenseRequest.ContentIdentification.ExistingLicense;

            /**
             * Encodes the specified ExistingLicense message. Does not implicitly {@link LicenseRequest.ContentIdentification.ExistingLicense.verify|verify} messages.
             * @param message ExistingLicense message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: LicenseRequest.ContentIdentification.ExistingLicense.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ExistingLicense message, length delimited. Does not implicitly {@link LicenseRequest.ContentIdentification.ExistingLicense.verify|verify} messages.
             * @param message ExistingLicense message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: LicenseRequest.ContentIdentification.ExistingLicense.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an ExistingLicense message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {LicenseRequest.ContentIdentification.ExistingLicense & LicenseRequest.ContentIdentification.ExistingLicense.$Shape} ExistingLicense
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LicenseRequest.ContentIdentification.ExistingLicense & LicenseRequest.ContentIdentification.ExistingLicense.$Shape;

            /**
             * Decodes an ExistingLicense message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {LicenseRequest.ContentIdentification.ExistingLicense & LicenseRequest.ContentIdentification.ExistingLicense.$Shape} ExistingLicense
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LicenseRequest.ContentIdentification.ExistingLicense & LicenseRequest.ContentIdentification.ExistingLicense.$Shape;

            /**
             * Verifies an ExistingLicense message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an ExistingLicense message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ExistingLicense
             */
            static fromObject(object: { [k: string]: any }): LicenseRequest.ContentIdentification.ExistingLicense;

            /**
             * Creates a plain object from an ExistingLicense message. Also converts values to other types if specified.
             * @param message ExistingLicense
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: LicenseRequest.ContentIdentification.ExistingLicense, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ExistingLicense to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for ExistingLicense
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace ExistingLicense {

            /** Properties of an ExistingLicense. */
            interface $Properties {

                /** ExistingLicense licenseId */
                licenseId?: (LicenseIdentification.$Properties|null);

                /** ExistingLicense secondsSinceStarted */
                secondsSinceStarted?: (number|Long|null);

                /** ExistingLicense secondsSinceLastPlayed */
                secondsSinceLastPlayed?: (number|Long|null);

                /** ExistingLicense sessionUsageTableEntry */
                sessionUsageTableEntry?: (Uint8Array|null);

                /** Unknown fields preserved while decoding */
                $unknowns?: Uint8Array[];
            }

            /** Shape of an ExistingLicense. */
            type $Shape = LicenseRequest.ContentIdentification.ExistingLicense.$Properties;
        }

        /**
         * Properties of an InitData.
         * @deprecated Use LicenseRequest.ContentIdentification.InitData.$Properties instead.
         */
        interface IInitData extends LicenseRequest.ContentIdentification.InitData.$Properties {
        }

        /** Represents an InitData. */
        class InitData {

            /**
             * Constructs a new InitData.
             * @param [properties] Properties to set
             */
            constructor(properties?: LicenseRequest.ContentIdentification.InitData.$Properties);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];

            /** InitData initDataType. */
            initDataType: LicenseRequest.ContentIdentification.InitData.InitDataType;

            /** InitData initData. */
            initData: Uint8Array;

            /** InitData licenseType. */
            licenseType: LicenseType;

            /** InitData requestId. */
            requestId: Uint8Array;

            /**
             * Creates a new InitData instance using the specified properties.
             * @param [properties] Properties to set
             * @returns InitData instance
             */
            static create(properties: LicenseRequest.ContentIdentification.InitData.$Shape): LicenseRequest.ContentIdentification.InitData & LicenseRequest.ContentIdentification.InitData.$Shape;
            static create(properties?: LicenseRequest.ContentIdentification.InitData.$Properties): LicenseRequest.ContentIdentification.InitData;

            /**
             * Encodes the specified InitData message. Does not implicitly {@link LicenseRequest.ContentIdentification.InitData.verify|verify} messages.
             * @param message InitData message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: LicenseRequest.ContentIdentification.InitData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified InitData message, length delimited. Does not implicitly {@link LicenseRequest.ContentIdentification.InitData.verify|verify} messages.
             * @param message InitData message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: LicenseRequest.ContentIdentification.InitData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an InitData message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {LicenseRequest.ContentIdentification.InitData & LicenseRequest.ContentIdentification.InitData.$Shape} InitData
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LicenseRequest.ContentIdentification.InitData & LicenseRequest.ContentIdentification.InitData.$Shape;

            /**
             * Decodes an InitData message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {LicenseRequest.ContentIdentification.InitData & LicenseRequest.ContentIdentification.InitData.$Shape} InitData
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LicenseRequest.ContentIdentification.InitData & LicenseRequest.ContentIdentification.InitData.$Shape;

            /**
             * Verifies an InitData message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an InitData message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns InitData
             */
            static fromObject(object: { [k: string]: any }): LicenseRequest.ContentIdentification.InitData;

            /**
             * Creates a plain object from an InitData message. Also converts values to other types if specified.
             * @param message InitData
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: LicenseRequest.ContentIdentification.InitData, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this InitData to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for InitData
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace InitData {

            /** Properties of an InitData. */
            interface $Properties {

                /** InitData initDataType */
                initDataType?: (LicenseRequest.ContentIdentification.InitData.InitDataType|null);

                /** InitData initData */
                initData?: (Uint8Array|null);

                /** InitData licenseType */
                licenseType?: (LicenseType|null);

                /** InitData requestId */
                requestId?: (Uint8Array|null);

                /** Unknown fields preserved while decoding */
                $unknowns?: Uint8Array[];
            }

            /** Shape of an InitData. */
            type $Shape = LicenseRequest.ContentIdentification.InitData.$Properties;

            /** InitDataType enum. */
            enum InitDataType {

                /** CENC value */
                CENC = 1,

                /** WEBM value */
                WEBM = 2
            }
        }
    }

    /** RequestType enum. */
    enum RequestType {

        /** NEW value */
        NEW = 1,

        /** RENEWAL value */
        RENEWAL = 2,

        /** RELEASE value */
        RELEASE = 3
    }
}

/**
 * Properties of a MetricData.
 * @deprecated Use MetricData.$Properties instead.
 */
export interface IMetricData extends MetricData.$Properties {
}

/** Represents a MetricData. */
export class MetricData {

    /**
     * Constructs a new MetricData.
     * @param [properties] Properties to set
     */
    constructor(properties?: MetricData.$Properties);

    /** Unknown fields preserved while decoding */
    $unknowns?: Uint8Array[];

    /** MetricData stageName. */
    stageName: string;

    /** MetricData metricData. */
    metricData: MetricData.TypeValue.$Properties[];

    /**
     * Creates a new MetricData instance using the specified properties.
     * @param [properties] Properties to set
     * @returns MetricData instance
     */
    static create(properties: MetricData.$Shape): MetricData & MetricData.$Shape;
    static create(properties?: MetricData.$Properties): MetricData;

    /**
     * Encodes the specified MetricData message. Does not implicitly {@link MetricData.verify|verify} messages.
     * @param message MetricData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: MetricData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified MetricData message, length delimited. Does not implicitly {@link MetricData.verify|verify} messages.
     * @param message MetricData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: MetricData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a MetricData message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {MetricData & MetricData.$Shape} MetricData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): MetricData & MetricData.$Shape;

    /**
     * Decodes a MetricData message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {MetricData & MetricData.$Shape} MetricData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): MetricData & MetricData.$Shape;

    /**
     * Verifies a MetricData message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a MetricData message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns MetricData
     */
    static fromObject(object: { [k: string]: any }): MetricData;

    /**
     * Creates a plain object from a MetricData message. Also converts values to other types if specified.
     * @param message MetricData
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: MetricData, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this MetricData to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for MetricData
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace MetricData {

    /** Properties of a MetricData. */
    interface $Properties {

        /** MetricData stageName */
        stageName?: (string|null);

        /** MetricData metricData */
        metricData?: (MetricData.TypeValue.$Properties[]|null);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a MetricData. */
    type $Shape = MetricData.$Properties;

    /** MetricType enum. */
    enum MetricType {

        /** LATENCY value */
        LATENCY = 1,

        /** TIMESTAMP value */
        TIMESTAMP = 2
    }

    /**
     * Properties of a TypeValue.
     * @deprecated Use MetricData.TypeValue.$Properties instead.
     */
    interface ITypeValue extends MetricData.TypeValue.$Properties {
    }

    /** Represents a TypeValue. */
    class TypeValue {

        /**
         * Constructs a new TypeValue.
         * @param [properties] Properties to set
         */
        constructor(properties?: MetricData.TypeValue.$Properties);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];

        /** TypeValue type. */
        type: MetricData.MetricType;

        /** TypeValue value. */
        value: (number|Long);

        /**
         * Creates a new TypeValue instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TypeValue instance
         */
        static create(properties: MetricData.TypeValue.$Shape): MetricData.TypeValue & MetricData.TypeValue.$Shape;
        static create(properties?: MetricData.TypeValue.$Properties): MetricData.TypeValue;

        /**
         * Encodes the specified TypeValue message. Does not implicitly {@link MetricData.TypeValue.verify|verify} messages.
         * @param message TypeValue message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: MetricData.TypeValue.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified TypeValue message, length delimited. Does not implicitly {@link MetricData.TypeValue.verify|verify} messages.
         * @param message TypeValue message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: MetricData.TypeValue.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TypeValue message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {MetricData.TypeValue & MetricData.TypeValue.$Shape} TypeValue
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): MetricData.TypeValue & MetricData.TypeValue.$Shape;

        /**
         * Decodes a TypeValue message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {MetricData.TypeValue & MetricData.TypeValue.$Shape} TypeValue
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): MetricData.TypeValue & MetricData.TypeValue.$Shape;

        /**
         * Verifies a TypeValue message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a TypeValue message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns TypeValue
         */
        static fromObject(object: { [k: string]: any }): MetricData.TypeValue;

        /**
         * Creates a plain object from a TypeValue message. Also converts values to other types if specified.
         * @param message TypeValue
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: MetricData.TypeValue, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this TypeValue to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for TypeValue
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace TypeValue {

        /** Properties of a TypeValue. */
        interface $Properties {

            /** TypeValue type */
            type?: (MetricData.MetricType|null);

            /** TypeValue value */
            value?: (number|Long|null);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a TypeValue. */
        type $Shape = MetricData.TypeValue.$Properties;
    }
}

/**
 * Properties of a VersionInfo.
 * @deprecated Use VersionInfo.$Properties instead.
 */
export interface IVersionInfo extends VersionInfo.$Properties {
}

/** Represents a VersionInfo. */
export class VersionInfo {

    /**
     * Constructs a new VersionInfo.
     * @param [properties] Properties to set
     */
    constructor(properties?: VersionInfo.$Properties);

    /** Unknown fields preserved while decoding */
    $unknowns?: Uint8Array[];

    /** VersionInfo licenseSdkVersion. */
    licenseSdkVersion: string;

    /** VersionInfo licenseServiceVersion. */
    licenseServiceVersion: string;

    /**
     * Creates a new VersionInfo instance using the specified properties.
     * @param [properties] Properties to set
     * @returns VersionInfo instance
     */
    static create(properties: VersionInfo.$Shape): VersionInfo & VersionInfo.$Shape;
    static create(properties?: VersionInfo.$Properties): VersionInfo;

    /**
     * Encodes the specified VersionInfo message. Does not implicitly {@link VersionInfo.verify|verify} messages.
     * @param message VersionInfo message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: VersionInfo.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified VersionInfo message, length delimited. Does not implicitly {@link VersionInfo.verify|verify} messages.
     * @param message VersionInfo message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: VersionInfo.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a VersionInfo message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {VersionInfo & VersionInfo.$Shape} VersionInfo
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): VersionInfo & VersionInfo.$Shape;

    /**
     * Decodes a VersionInfo message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {VersionInfo & VersionInfo.$Shape} VersionInfo
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): VersionInfo & VersionInfo.$Shape;

    /**
     * Verifies a VersionInfo message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a VersionInfo message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns VersionInfo
     */
    static fromObject(object: { [k: string]: any }): VersionInfo;

    /**
     * Creates a plain object from a VersionInfo message. Also converts values to other types if specified.
     * @param message VersionInfo
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: VersionInfo, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this VersionInfo to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for VersionInfo
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace VersionInfo {

    /** Properties of a VersionInfo. */
    interface $Properties {

        /** VersionInfo licenseSdkVersion */
        licenseSdkVersion?: (string|null);

        /** VersionInfo licenseServiceVersion */
        licenseServiceVersion?: (string|null);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a VersionInfo. */
    type $Shape = VersionInfo.$Properties;
}

/**
 * Properties of a SignedMessage.
 * @deprecated Use SignedMessage.$Properties instead.
 */
export interface ISignedMessage extends SignedMessage.$Properties {
}

/** Represents a SignedMessage. */
export class SignedMessage {

    /**
     * Constructs a new SignedMessage.
     * @param [properties] Properties to set
     */
    constructor(properties?: SignedMessage.$Properties);

    /** Unknown fields preserved while decoding */
    $unknowns?: Uint8Array[];

    /** SignedMessage type. */
    type: SignedMessage.MessageType;

    /** SignedMessage msg. */
    msg: Uint8Array;

    /** SignedMessage signature. */
    signature: Uint8Array;

    /** SignedMessage sessionKey. */
    sessionKey: Uint8Array;

    /** SignedMessage remoteAttestation. */
    remoteAttestation: Uint8Array;

    /** SignedMessage metricData. */
    metricData: MetricData.$Properties[];

    /** SignedMessage serviceVersionInfo. */
    serviceVersionInfo?: (VersionInfo.$Properties|null);

    /** SignedMessage sessionKeyType. */
    sessionKeyType: SignedMessage.SessionKeyType;

    /** SignedMessage oemcryptoCoreMessage. */
    oemcryptoCoreMessage: Uint8Array;

    /**
     * Creates a new SignedMessage instance using the specified properties.
     * @param [properties] Properties to set
     * @returns SignedMessage instance
     */
    static create(properties: SignedMessage.$Shape): SignedMessage & SignedMessage.$Shape;
    static create(properties?: SignedMessage.$Properties): SignedMessage;

    /**
     * Encodes the specified SignedMessage message. Does not implicitly {@link SignedMessage.verify|verify} messages.
     * @param message SignedMessage message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: SignedMessage.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified SignedMessage message, length delimited. Does not implicitly {@link SignedMessage.verify|verify} messages.
     * @param message SignedMessage message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: SignedMessage.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a SignedMessage message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {SignedMessage & SignedMessage.$Shape} SignedMessage
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): SignedMessage & SignedMessage.$Shape;

    /**
     * Decodes a SignedMessage message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {SignedMessage & SignedMessage.$Shape} SignedMessage
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): SignedMessage & SignedMessage.$Shape;

    /**
     * Verifies a SignedMessage message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a SignedMessage message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns SignedMessage
     */
    static fromObject(object: { [k: string]: any }): SignedMessage;

    /**
     * Creates a plain object from a SignedMessage message. Also converts values to other types if specified.
     * @param message SignedMessage
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: SignedMessage, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this SignedMessage to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for SignedMessage
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace SignedMessage {

    /** Properties of a SignedMessage. */
    interface $Properties {

        /** SignedMessage type */
        type?: (SignedMessage.MessageType|null);

        /** SignedMessage msg */
        msg?: (Uint8Array|null);

        /** SignedMessage signature */
        signature?: (Uint8Array|null);

        /** SignedMessage sessionKey */
        sessionKey?: (Uint8Array|null);

        /** SignedMessage remoteAttestation */
        remoteAttestation?: (Uint8Array|null);

        /** SignedMessage metricData */
        metricData?: (MetricData.$Properties[]|null);

        /** SignedMessage serviceVersionInfo */
        serviceVersionInfo?: (VersionInfo.$Properties|null);

        /** SignedMessage sessionKeyType */
        sessionKeyType?: (SignedMessage.SessionKeyType|null);

        /** SignedMessage oemcryptoCoreMessage */
        oemcryptoCoreMessage?: (Uint8Array|null);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a SignedMessage. */
    type $Shape = SignedMessage.$Properties;

    /** MessageType enum. */
    enum MessageType {

        /** LICENSE_REQUEST value */
        LICENSE_REQUEST = 1,

        /** LICENSE value */
        LICENSE = 2,

        /** ERROR_RESPONSE value */
        ERROR_RESPONSE = 3,

        /** SERVICE_CERTIFICATE_REQUEST value */
        SERVICE_CERTIFICATE_REQUEST = 4,

        /** SERVICE_CERTIFICATE value */
        SERVICE_CERTIFICATE = 5,

        /** SUB_LICENSE value */
        SUB_LICENSE = 6,

        /** CAS_LICENSE_REQUEST value */
        CAS_LICENSE_REQUEST = 7,

        /** CAS_LICENSE value */
        CAS_LICENSE = 8,

        /** EXTERNAL_LICENSE_REQUEST value */
        EXTERNAL_LICENSE_REQUEST = 9,

        /** EXTERNAL_LICENSE value */
        EXTERNAL_LICENSE = 10
    }

    /** SessionKeyType enum. */
    enum SessionKeyType {

        /** UNDEFINED value */
        UNDEFINED = 0,

        /** WRAPPED_AES_KEY value */
        WRAPPED_AES_KEY = 1,

        /** EPHERMERAL_ECC_PUBLIC_KEY value */
        EPHERMERAL_ECC_PUBLIC_KEY = 2
    }
}

/** HashAlgorithmProto enum. */
export enum HashAlgorithmProto {

    /** HASH_ALGORITHM_UNSPECIFIED value */
    HASH_ALGORITHM_UNSPECIFIED = 0,

    /** HASH_ALGORITHM_SHA_1 value */
    HASH_ALGORITHM_SHA_1 = 1,

    /** HASH_ALGORITHM_SHA_256 value */
    HASH_ALGORITHM_SHA_256 = 2,

    /** HASH_ALGORITHM_SHA_384 value */
    HASH_ALGORITHM_SHA_384 = 3
}

/**
 * Properties of a ClientIdentification.
 * @deprecated Use ClientIdentification.$Properties instead.
 */
export interface IClientIdentification extends ClientIdentification.$Properties {
}

/** Represents a ClientIdentification. */
export class ClientIdentification {

    /**
     * Constructs a new ClientIdentification.
     * @param [properties] Properties to set
     */
    constructor(properties?: ClientIdentification.$Properties);

    /** Unknown fields preserved while decoding */
    $unknowns?: Uint8Array[];

    /** ClientIdentification type. */
    type: ClientIdentification.TokenType;

    /** ClientIdentification token. */
    token: Uint8Array;

    /** ClientIdentification clientInfo. */
    clientInfo: ClientIdentification.NameValue.$Properties[];

    /** ClientIdentification providerClientToken. */
    providerClientToken: Uint8Array;

    /** ClientIdentification licenseCounter. */
    licenseCounter: number;

    /** ClientIdentification clientCapabilities. */
    clientCapabilities?: (ClientIdentification.ClientCapabilities.$Properties|null);

    /** ClientIdentification vmpData. */
    vmpData: Uint8Array;

    /** ClientIdentification deviceCredentials. */
    deviceCredentials: ClientIdentification.ClientCredentials.$Properties[];

    /**
     * Creates a new ClientIdentification instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ClientIdentification instance
     */
    static create(properties: ClientIdentification.$Shape): ClientIdentification & ClientIdentification.$Shape;
    static create(properties?: ClientIdentification.$Properties): ClientIdentification;

    /**
     * Encodes the specified ClientIdentification message. Does not implicitly {@link ClientIdentification.verify|verify} messages.
     * @param message ClientIdentification message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: ClientIdentification.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ClientIdentification message, length delimited. Does not implicitly {@link ClientIdentification.verify|verify} messages.
     * @param message ClientIdentification message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: ClientIdentification.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a ClientIdentification message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {ClientIdentification & ClientIdentification.$Shape} ClientIdentification
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ClientIdentification & ClientIdentification.$Shape;

    /**
     * Decodes a ClientIdentification message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {ClientIdentification & ClientIdentification.$Shape} ClientIdentification
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ClientIdentification & ClientIdentification.$Shape;

    /**
     * Verifies a ClientIdentification message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a ClientIdentification message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ClientIdentification
     */
    static fromObject(object: { [k: string]: any }): ClientIdentification;

    /**
     * Creates a plain object from a ClientIdentification message. Also converts values to other types if specified.
     * @param message ClientIdentification
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: ClientIdentification, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this ClientIdentification to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for ClientIdentification
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace ClientIdentification {

    /** Properties of a ClientIdentification. */
    interface $Properties {

        /** ClientIdentification type */
        type?: (ClientIdentification.TokenType|null);

        /** ClientIdentification token */
        token?: (Uint8Array|null);

        /** ClientIdentification clientInfo */
        clientInfo?: (ClientIdentification.NameValue.$Properties[]|null);

        /** ClientIdentification providerClientToken */
        providerClientToken?: (Uint8Array|null);

        /** ClientIdentification licenseCounter */
        licenseCounter?: (number|null);

        /** ClientIdentification clientCapabilities */
        clientCapabilities?: (ClientIdentification.ClientCapabilities.$Properties|null);

        /** ClientIdentification vmpData */
        vmpData?: (Uint8Array|null);

        /** ClientIdentification deviceCredentials */
        deviceCredentials?: (ClientIdentification.ClientCredentials.$Properties[]|null);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a ClientIdentification. */
    type $Shape = ClientIdentification.$Properties;

    /** TokenType enum. */
    enum TokenType {

        /** KEYBOX value */
        KEYBOX = 0,

        /** DRM_DEVICE_CERTIFICATE value */
        DRM_DEVICE_CERTIFICATE = 1,

        /** REMOTE_ATTESTATION_CERTIFICATE value */
        REMOTE_ATTESTATION_CERTIFICATE = 2,

        /** OEM_DEVICE_CERTIFICATE value */
        OEM_DEVICE_CERTIFICATE = 3
    }

    /**
     * Properties of a NameValue.
     * @deprecated Use ClientIdentification.NameValue.$Properties instead.
     */
    interface INameValue extends ClientIdentification.NameValue.$Properties {
    }

    /** Represents a NameValue. */
    class NameValue {

        /**
         * Constructs a new NameValue.
         * @param [properties] Properties to set
         */
        constructor(properties?: ClientIdentification.NameValue.$Properties);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];

        /** NameValue name. */
        name: string;

        /** NameValue value. */
        value: string;

        /**
         * Creates a new NameValue instance using the specified properties.
         * @param [properties] Properties to set
         * @returns NameValue instance
         */
        static create(properties: ClientIdentification.NameValue.$Shape): ClientIdentification.NameValue & ClientIdentification.NameValue.$Shape;
        static create(properties?: ClientIdentification.NameValue.$Properties): ClientIdentification.NameValue;

        /**
         * Encodes the specified NameValue message. Does not implicitly {@link ClientIdentification.NameValue.verify|verify} messages.
         * @param message NameValue message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: ClientIdentification.NameValue.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified NameValue message, length delimited. Does not implicitly {@link ClientIdentification.NameValue.verify|verify} messages.
         * @param message NameValue message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: ClientIdentification.NameValue.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a NameValue message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {ClientIdentification.NameValue & ClientIdentification.NameValue.$Shape} NameValue
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ClientIdentification.NameValue & ClientIdentification.NameValue.$Shape;

        /**
         * Decodes a NameValue message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {ClientIdentification.NameValue & ClientIdentification.NameValue.$Shape} NameValue
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ClientIdentification.NameValue & ClientIdentification.NameValue.$Shape;

        /**
         * Verifies a NameValue message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a NameValue message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns NameValue
         */
        static fromObject(object: { [k: string]: any }): ClientIdentification.NameValue;

        /**
         * Creates a plain object from a NameValue message. Also converts values to other types if specified.
         * @param message NameValue
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: ClientIdentification.NameValue, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this NameValue to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for NameValue
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace NameValue {

        /** Properties of a NameValue. */
        interface $Properties {

            /** NameValue name */
            name?: (string|null);

            /** NameValue value */
            value?: (string|null);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a NameValue. */
        type $Shape = ClientIdentification.NameValue.$Properties;
    }

    /**
     * Properties of a ClientCapabilities.
     * @deprecated Use ClientIdentification.ClientCapabilities.$Properties instead.
     */
    interface IClientCapabilities extends ClientIdentification.ClientCapabilities.$Properties {
    }

    /** Represents a ClientCapabilities. */
    class ClientCapabilities {

        /**
         * Constructs a new ClientCapabilities.
         * @param [properties] Properties to set
         */
        constructor(properties?: ClientIdentification.ClientCapabilities.$Properties);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];

        /** ClientCapabilities clientToken. */
        clientToken: boolean;

        /** ClientCapabilities sessionToken. */
        sessionToken: boolean;

        /** ClientCapabilities videoResolutionConstraints. */
        videoResolutionConstraints: boolean;

        /** ClientCapabilities maxHdcpVersion. */
        maxHdcpVersion: ClientIdentification.ClientCapabilities.HdcpVersion;

        /** ClientCapabilities oemCryptoApiVersion. */
        oemCryptoApiVersion: number;

        /** ClientCapabilities antiRollbackUsageTable. */
        antiRollbackUsageTable: boolean;

        /** ClientCapabilities srmVersion. */
        srmVersion: number;

        /** ClientCapabilities canUpdateSrm. */
        canUpdateSrm: boolean;

        /** ClientCapabilities supportedCertificateKeyType. */
        supportedCertificateKeyType: ClientIdentification.ClientCapabilities.CertificateKeyType[];

        /** ClientCapabilities analogOutputCapabilities. */
        analogOutputCapabilities: ClientIdentification.ClientCapabilities.AnalogOutputCapabilities;

        /** ClientCapabilities canDisableAnalogOutput. */
        canDisableAnalogOutput: boolean;

        /** ClientCapabilities resourceRatingTier. */
        resourceRatingTier: number;

        /**
         * Creates a new ClientCapabilities instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ClientCapabilities instance
         */
        static create(properties: ClientIdentification.ClientCapabilities.$Shape): ClientIdentification.ClientCapabilities & ClientIdentification.ClientCapabilities.$Shape;
        static create(properties?: ClientIdentification.ClientCapabilities.$Properties): ClientIdentification.ClientCapabilities;

        /**
         * Encodes the specified ClientCapabilities message. Does not implicitly {@link ClientIdentification.ClientCapabilities.verify|verify} messages.
         * @param message ClientCapabilities message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: ClientIdentification.ClientCapabilities.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ClientCapabilities message, length delimited. Does not implicitly {@link ClientIdentification.ClientCapabilities.verify|verify} messages.
         * @param message ClientCapabilities message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: ClientIdentification.ClientCapabilities.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ClientCapabilities message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {ClientIdentification.ClientCapabilities & ClientIdentification.ClientCapabilities.$Shape} ClientCapabilities
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ClientIdentification.ClientCapabilities & ClientIdentification.ClientCapabilities.$Shape;

        /**
         * Decodes a ClientCapabilities message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {ClientIdentification.ClientCapabilities & ClientIdentification.ClientCapabilities.$Shape} ClientCapabilities
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ClientIdentification.ClientCapabilities & ClientIdentification.ClientCapabilities.$Shape;

        /**
         * Verifies a ClientCapabilities message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ClientCapabilities message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ClientCapabilities
         */
        static fromObject(object: { [k: string]: any }): ClientIdentification.ClientCapabilities;

        /**
         * Creates a plain object from a ClientCapabilities message. Also converts values to other types if specified.
         * @param message ClientCapabilities
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: ClientIdentification.ClientCapabilities, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ClientCapabilities to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for ClientCapabilities
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace ClientCapabilities {

        /** Properties of a ClientCapabilities. */
        interface $Properties {

            /** ClientCapabilities clientToken */
            clientToken?: (boolean|null);

            /** ClientCapabilities sessionToken */
            sessionToken?: (boolean|null);

            /** ClientCapabilities videoResolutionConstraints */
            videoResolutionConstraints?: (boolean|null);

            /** ClientCapabilities maxHdcpVersion */
            maxHdcpVersion?: (ClientIdentification.ClientCapabilities.HdcpVersion|null);

            /** ClientCapabilities oemCryptoApiVersion */
            oemCryptoApiVersion?: (number|null);

            /** ClientCapabilities antiRollbackUsageTable */
            antiRollbackUsageTable?: (boolean|null);

            /** ClientCapabilities srmVersion */
            srmVersion?: (number|null);

            /** ClientCapabilities canUpdateSrm */
            canUpdateSrm?: (boolean|null);

            /** ClientCapabilities supportedCertificateKeyType */
            supportedCertificateKeyType?: (ClientIdentification.ClientCapabilities.CertificateKeyType[]|null);

            /** ClientCapabilities analogOutputCapabilities */
            analogOutputCapabilities?: (ClientIdentification.ClientCapabilities.AnalogOutputCapabilities|null);

            /** ClientCapabilities canDisableAnalogOutput */
            canDisableAnalogOutput?: (boolean|null);

            /** ClientCapabilities resourceRatingTier */
            resourceRatingTier?: (number|null);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a ClientCapabilities. */
        type $Shape = ClientIdentification.ClientCapabilities.$Properties;

        /** HdcpVersion enum. */
        enum HdcpVersion {

            /** HDCP_NONE value */
            HDCP_NONE = 0,

            /** HDCP_V1 value */
            HDCP_V1 = 1,

            /** HDCP_V2 value */
            HDCP_V2 = 2,

            /** HDCP_V2_1 value */
            HDCP_V2_1 = 3,

            /** HDCP_V2_2 value */
            HDCP_V2_2 = 4,

            /** HDCP_V2_3 value */
            HDCP_V2_3 = 5,

            /** HDCP_NO_DIGITAL_OUTPUT value */
            HDCP_NO_DIGITAL_OUTPUT = 255
        }

        /** CertificateKeyType enum. */
        enum CertificateKeyType {

            /** RSA_2048 value */
            RSA_2048 = 0,

            /** RSA_3072 value */
            RSA_3072 = 1,

            /** ECC_SECP256R1 value */
            ECC_SECP256R1 = 2,

            /** ECC_SECP384R1 value */
            ECC_SECP384R1 = 3,

            /** ECC_SECP521R1 value */
            ECC_SECP521R1 = 4
        }

        /** AnalogOutputCapabilities enum. */
        enum AnalogOutputCapabilities {

            /** ANALOG_OUTPUT_UNKNOWN value */
            ANALOG_OUTPUT_UNKNOWN = 0,

            /** ANALOG_OUTPUT_NONE value */
            ANALOG_OUTPUT_NONE = 1,

            /** ANALOG_OUTPUT_SUPPORTED value */
            ANALOG_OUTPUT_SUPPORTED = 2,

            /** ANALOG_OUTPUT_SUPPORTS_CGMS_A value */
            ANALOG_OUTPUT_SUPPORTS_CGMS_A = 3
        }
    }

    /**
     * Properties of a ClientCredentials.
     * @deprecated Use ClientIdentification.ClientCredentials.$Properties instead.
     */
    interface IClientCredentials extends ClientIdentification.ClientCredentials.$Properties {
    }

    /** Represents a ClientCredentials. */
    class ClientCredentials {

        /**
         * Constructs a new ClientCredentials.
         * @param [properties] Properties to set
         */
        constructor(properties?: ClientIdentification.ClientCredentials.$Properties);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];

        /** ClientCredentials type. */
        type: ClientIdentification.TokenType;

        /** ClientCredentials token. */
        token: Uint8Array;

        /**
         * Creates a new ClientCredentials instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ClientCredentials instance
         */
        static create(properties: ClientIdentification.ClientCredentials.$Shape): ClientIdentification.ClientCredentials & ClientIdentification.ClientCredentials.$Shape;
        static create(properties?: ClientIdentification.ClientCredentials.$Properties): ClientIdentification.ClientCredentials;

        /**
         * Encodes the specified ClientCredentials message. Does not implicitly {@link ClientIdentification.ClientCredentials.verify|verify} messages.
         * @param message ClientCredentials message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: ClientIdentification.ClientCredentials.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ClientCredentials message, length delimited. Does not implicitly {@link ClientIdentification.ClientCredentials.verify|verify} messages.
         * @param message ClientCredentials message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: ClientIdentification.ClientCredentials.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ClientCredentials message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {ClientIdentification.ClientCredentials & ClientIdentification.ClientCredentials.$Shape} ClientCredentials
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ClientIdentification.ClientCredentials & ClientIdentification.ClientCredentials.$Shape;

        /**
         * Decodes a ClientCredentials message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {ClientIdentification.ClientCredentials & ClientIdentification.ClientCredentials.$Shape} ClientCredentials
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ClientIdentification.ClientCredentials & ClientIdentification.ClientCredentials.$Shape;

        /**
         * Verifies a ClientCredentials message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ClientCredentials message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ClientCredentials
         */
        static fromObject(object: { [k: string]: any }): ClientIdentification.ClientCredentials;

        /**
         * Creates a plain object from a ClientCredentials message. Also converts values to other types if specified.
         * @param message ClientCredentials
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: ClientIdentification.ClientCredentials, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ClientCredentials to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for ClientCredentials
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace ClientCredentials {

        /** Properties of a ClientCredentials. */
        interface $Properties {

            /** ClientCredentials type */
            type?: (ClientIdentification.TokenType|null);

            /** ClientCredentials token */
            token?: (Uint8Array|null);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a ClientCredentials. */
        type $Shape = ClientIdentification.ClientCredentials.$Properties;
    }
}

/**
 * Properties of an EncryptedClientIdentification.
 * @deprecated Use EncryptedClientIdentification.$Properties instead.
 */
export interface IEncryptedClientIdentification extends EncryptedClientIdentification.$Properties {
}

/** Represents an EncryptedClientIdentification. */
export class EncryptedClientIdentification {

    /**
     * Constructs a new EncryptedClientIdentification.
     * @param [properties] Properties to set
     */
    constructor(properties?: EncryptedClientIdentification.$Properties);

    /** Unknown fields preserved while decoding */
    $unknowns?: Uint8Array[];

    /** EncryptedClientIdentification providerId. */
    providerId: string;

    /** EncryptedClientIdentification serviceCertificateSerialNumber. */
    serviceCertificateSerialNumber: Uint8Array;

    /** EncryptedClientIdentification encryptedClientId. */
    encryptedClientId: Uint8Array;

    /** EncryptedClientIdentification encryptedClientIdIv. */
    encryptedClientIdIv: Uint8Array;

    /** EncryptedClientIdentification encryptedPrivacyKey. */
    encryptedPrivacyKey: Uint8Array;

    /**
     * Creates a new EncryptedClientIdentification instance using the specified properties.
     * @param [properties] Properties to set
     * @returns EncryptedClientIdentification instance
     */
    static create(properties: EncryptedClientIdentification.$Shape): EncryptedClientIdentification & EncryptedClientIdentification.$Shape;
    static create(properties?: EncryptedClientIdentification.$Properties): EncryptedClientIdentification;

    /**
     * Encodes the specified EncryptedClientIdentification message. Does not implicitly {@link EncryptedClientIdentification.verify|verify} messages.
     * @param message EncryptedClientIdentification message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: EncryptedClientIdentification.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified EncryptedClientIdentification message, length delimited. Does not implicitly {@link EncryptedClientIdentification.verify|verify} messages.
     * @param message EncryptedClientIdentification message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: EncryptedClientIdentification.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes an EncryptedClientIdentification message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {EncryptedClientIdentification & EncryptedClientIdentification.$Shape} EncryptedClientIdentification
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): EncryptedClientIdentification & EncryptedClientIdentification.$Shape;

    /**
     * Decodes an EncryptedClientIdentification message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {EncryptedClientIdentification & EncryptedClientIdentification.$Shape} EncryptedClientIdentification
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): EncryptedClientIdentification & EncryptedClientIdentification.$Shape;

    /**
     * Verifies an EncryptedClientIdentification message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates an EncryptedClientIdentification message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns EncryptedClientIdentification
     */
    static fromObject(object: { [k: string]: any }): EncryptedClientIdentification;

    /**
     * Creates a plain object from an EncryptedClientIdentification message. Also converts values to other types if specified.
     * @param message EncryptedClientIdentification
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: EncryptedClientIdentification, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this EncryptedClientIdentification to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for EncryptedClientIdentification
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace EncryptedClientIdentification {

    /** Properties of an EncryptedClientIdentification. */
    interface $Properties {

        /** EncryptedClientIdentification providerId */
        providerId?: (string|null);

        /** EncryptedClientIdentification serviceCertificateSerialNumber */
        serviceCertificateSerialNumber?: (Uint8Array|null);

        /** EncryptedClientIdentification encryptedClientId */
        encryptedClientId?: (Uint8Array|null);

        /** EncryptedClientIdentification encryptedClientIdIv */
        encryptedClientIdIv?: (Uint8Array|null);

        /** EncryptedClientIdentification encryptedPrivacyKey */
        encryptedPrivacyKey?: (Uint8Array|null);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];
    }

    /** Shape of an EncryptedClientIdentification. */
    type $Shape = EncryptedClientIdentification.$Properties;
}

/**
 * Properties of a LicenseError.
 * @deprecated Use LicenseError.$Properties instead.
 */
export interface ILicenseError extends LicenseError.$Properties {
}

/** Represents a LicenseError. */
export class LicenseError {

    /**
     * Constructs a new LicenseError.
     * @param [properties] Properties to set
     */
    constructor(properties?: LicenseError.$Properties);

    /** Unknown fields preserved while decoding */
    $unknowns?: Uint8Array[];

    /** LicenseError errorCode. */
    errorCode: LicenseError.Error;

    /**
     * Creates a new LicenseError instance using the specified properties.
     * @param [properties] Properties to set
     * @returns LicenseError instance
     */
    static create(properties: LicenseError.$Shape): LicenseError & LicenseError.$Shape;
    static create(properties?: LicenseError.$Properties): LicenseError;

    /**
     * Encodes the specified LicenseError message. Does not implicitly {@link LicenseError.verify|verify} messages.
     * @param message LicenseError message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: LicenseError.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified LicenseError message, length delimited. Does not implicitly {@link LicenseError.verify|verify} messages.
     * @param message LicenseError message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: LicenseError.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a LicenseError message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {LicenseError & LicenseError.$Shape} LicenseError
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LicenseError & LicenseError.$Shape;

    /**
     * Decodes a LicenseError message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {LicenseError & LicenseError.$Shape} LicenseError
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LicenseError & LicenseError.$Shape;

    /**
     * Verifies a LicenseError message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a LicenseError message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns LicenseError
     */
    static fromObject(object: { [k: string]: any }): LicenseError;

    /**
     * Creates a plain object from a LicenseError message. Also converts values to other types if specified.
     * @param message LicenseError
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: LicenseError, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this LicenseError to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for LicenseError
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace LicenseError {

    /** Properties of a LicenseError. */
    interface $Properties {

        /** LicenseError errorCode */
        errorCode?: (LicenseError.Error|null);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a LicenseError. */
    type $Shape = LicenseError.$Properties;

    /** Error enum. */
    enum Error {

        /** INVALID_DEVICE_CERTIFICATE value */
        INVALID_DEVICE_CERTIFICATE = 1,

        /** REVOKED_DEVICE_CERTIFICATE value */
        REVOKED_DEVICE_CERTIFICATE = 2,

        /** SERVICE_UNAVAILABLE value */
        SERVICE_UNAVAILABLE = 3
    }
}

/**
 * Properties of a DrmCertificate.
 * @deprecated Use DrmCertificate.$Properties instead.
 */
export interface IDrmCertificate extends DrmCertificate.$Properties {
}

/** Represents a DrmCertificate. */
export class DrmCertificate {

    /**
     * Constructs a new DrmCertificate.
     * @param [properties] Properties to set
     */
    constructor(properties?: DrmCertificate.$Properties);

    /** Unknown fields preserved while decoding */
    $unknowns?: Uint8Array[];

    /** DrmCertificate type. */
    type: DrmCertificate.Type;

    /** DrmCertificate serialNumber. */
    serialNumber: Uint8Array;

    /** DrmCertificate creationTimeSeconds. */
    creationTimeSeconds: number;

    /** DrmCertificate expirationTimeSeconds. */
    expirationTimeSeconds: number;

    /** DrmCertificate publicKey. */
    publicKey: Uint8Array;

    /** DrmCertificate systemId. */
    systemId: number;

    /** DrmCertificate testDeviceDeprecated. */
    testDeviceDeprecated: boolean;

    /** DrmCertificate providerId. */
    providerId: string;

    /** DrmCertificate serviceTypes. */
    serviceTypes: DrmCertificate.ServiceType[];

    /** DrmCertificate algorithm. */
    algorithm: DrmCertificate.Algorithm;

    /** DrmCertificate rotId. */
    rotId: Uint8Array;

    /** DrmCertificate encryptionKey. */
    encryptionKey?: (DrmCertificate.EncryptionKey.$Properties|null);

    /**
     * Creates a new DrmCertificate instance using the specified properties.
     * @param [properties] Properties to set
     * @returns DrmCertificate instance
     */
    static create(properties: DrmCertificate.$Shape): DrmCertificate & DrmCertificate.$Shape;
    static create(properties?: DrmCertificate.$Properties): DrmCertificate;

    /**
     * Encodes the specified DrmCertificate message. Does not implicitly {@link DrmCertificate.verify|verify} messages.
     * @param message DrmCertificate message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: DrmCertificate.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified DrmCertificate message, length delimited. Does not implicitly {@link DrmCertificate.verify|verify} messages.
     * @param message DrmCertificate message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: DrmCertificate.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a DrmCertificate message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {DrmCertificate & DrmCertificate.$Shape} DrmCertificate
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): DrmCertificate & DrmCertificate.$Shape;

    /**
     * Decodes a DrmCertificate message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {DrmCertificate & DrmCertificate.$Shape} DrmCertificate
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): DrmCertificate & DrmCertificate.$Shape;

    /**
     * Verifies a DrmCertificate message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a DrmCertificate message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns DrmCertificate
     */
    static fromObject(object: { [k: string]: any }): DrmCertificate;

    /**
     * Creates a plain object from a DrmCertificate message. Also converts values to other types if specified.
     * @param message DrmCertificate
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: DrmCertificate, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this DrmCertificate to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for DrmCertificate
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace DrmCertificate {

    /** Properties of a DrmCertificate. */
    interface $Properties {

        /** DrmCertificate type */
        type?: (DrmCertificate.Type|null);

        /** DrmCertificate serialNumber */
        serialNumber?: (Uint8Array|null);

        /** DrmCertificate creationTimeSeconds */
        creationTimeSeconds?: (number|null);

        /** DrmCertificate expirationTimeSeconds */
        expirationTimeSeconds?: (number|null);

        /** DrmCertificate publicKey */
        publicKey?: (Uint8Array|null);

        /** DrmCertificate systemId */
        systemId?: (number|null);

        /** DrmCertificate testDeviceDeprecated */
        testDeviceDeprecated?: (boolean|null);

        /** DrmCertificate providerId */
        providerId?: (string|null);

        /** DrmCertificate serviceTypes */
        serviceTypes?: (DrmCertificate.ServiceType[]|null);

        /** DrmCertificate algorithm */
        algorithm?: (DrmCertificate.Algorithm|null);

        /** DrmCertificate rotId */
        rotId?: (Uint8Array|null);

        /** DrmCertificate encryptionKey */
        encryptionKey?: (DrmCertificate.EncryptionKey.$Properties|null);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a DrmCertificate. */
    type $Shape = DrmCertificate.$Properties;

    /** Type enum. */
    enum Type {

        /** ROOT value */
        ROOT = 0,

        /** DEVICE_MODEL value */
        DEVICE_MODEL = 1,

        /** DEVICE value */
        DEVICE = 2,

        /** SERVICE value */
        SERVICE = 3,

        /** PROVISIONER value */
        PROVISIONER = 4
    }

    /** ServiceType enum. */
    enum ServiceType {

        /** UNKNOWN_SERVICE_TYPE value */
        UNKNOWN_SERVICE_TYPE = 0,

        /** LICENSE_SERVER_SDK value */
        LICENSE_SERVER_SDK = 1,

        /** LICENSE_SERVER_PROXY_SDK value */
        LICENSE_SERVER_PROXY_SDK = 2,

        /** PROVISIONING_SDK value */
        PROVISIONING_SDK = 3,

        /** CAS_PROXY_SDK value */
        CAS_PROXY_SDK = 4
    }

    /** Algorithm enum. */
    enum Algorithm {

        /** UNKNOWN_ALGORITHM value */
        UNKNOWN_ALGORITHM = 0,

        /** RSA value */
        RSA = 1,

        /** ECC_SECP256R1 value */
        ECC_SECP256R1 = 2,

        /** ECC_SECP384R1 value */
        ECC_SECP384R1 = 3,

        /** ECC_SECP521R1 value */
        ECC_SECP521R1 = 4
    }

    /**
     * Properties of an EncryptionKey.
     * @deprecated Use DrmCertificate.EncryptionKey.$Properties instead.
     */
    interface IEncryptionKey extends DrmCertificate.EncryptionKey.$Properties {
    }

    /** Represents an EncryptionKey. */
    class EncryptionKey {

        /**
         * Constructs a new EncryptionKey.
         * @param [properties] Properties to set
         */
        constructor(properties?: DrmCertificate.EncryptionKey.$Properties);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];

        /** EncryptionKey publicKey. */
        publicKey: Uint8Array;

        /** EncryptionKey algorithm. */
        algorithm: DrmCertificate.Algorithm;

        /**
         * Creates a new EncryptionKey instance using the specified properties.
         * @param [properties] Properties to set
         * @returns EncryptionKey instance
         */
        static create(properties: DrmCertificate.EncryptionKey.$Shape): DrmCertificate.EncryptionKey & DrmCertificate.EncryptionKey.$Shape;
        static create(properties?: DrmCertificate.EncryptionKey.$Properties): DrmCertificate.EncryptionKey;

        /**
         * Encodes the specified EncryptionKey message. Does not implicitly {@link DrmCertificate.EncryptionKey.verify|verify} messages.
         * @param message EncryptionKey message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: DrmCertificate.EncryptionKey.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified EncryptionKey message, length delimited. Does not implicitly {@link DrmCertificate.EncryptionKey.verify|verify} messages.
         * @param message EncryptionKey message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: DrmCertificate.EncryptionKey.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an EncryptionKey message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {DrmCertificate.EncryptionKey & DrmCertificate.EncryptionKey.$Shape} EncryptionKey
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): DrmCertificate.EncryptionKey & DrmCertificate.EncryptionKey.$Shape;

        /**
         * Decodes an EncryptionKey message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {DrmCertificate.EncryptionKey & DrmCertificate.EncryptionKey.$Shape} EncryptionKey
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): DrmCertificate.EncryptionKey & DrmCertificate.EncryptionKey.$Shape;

        /**
         * Verifies an EncryptionKey message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an EncryptionKey message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns EncryptionKey
         */
        static fromObject(object: { [k: string]: any }): DrmCertificate.EncryptionKey;

        /**
         * Creates a plain object from an EncryptionKey message. Also converts values to other types if specified.
         * @param message EncryptionKey
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: DrmCertificate.EncryptionKey, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this EncryptionKey to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for EncryptionKey
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace EncryptionKey {

        /** Properties of an EncryptionKey. */
        interface $Properties {

            /** EncryptionKey publicKey */
            publicKey?: (Uint8Array|null);

            /** EncryptionKey algorithm */
            algorithm?: (DrmCertificate.Algorithm|null);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];
        }

        /** Shape of an EncryptionKey. */
        type $Shape = DrmCertificate.EncryptionKey.$Properties;
    }
}

/**
 * Properties of a SignedDrmCertificate.
 * @deprecated Use SignedDrmCertificate.$Properties instead.
 */
export interface ISignedDrmCertificate extends SignedDrmCertificate.$Properties {
}

/** Represents a SignedDrmCertificate. */
export class SignedDrmCertificate {

    /**
     * Constructs a new SignedDrmCertificate.
     * @param [properties] Properties to set
     */
    constructor(properties?: SignedDrmCertificate.$Properties);

    /** Unknown fields preserved while decoding */
    $unknowns?: Uint8Array[];

    /** SignedDrmCertificate drmCertificate. */
    drmCertificate: Uint8Array;

    /** SignedDrmCertificate signature. */
    signature: Uint8Array;

    /** SignedDrmCertificate signer. */
    signer?: (SignedDrmCertificate.$Properties|null);

    /** SignedDrmCertificate hashAlgorithm. */
    hashAlgorithm: HashAlgorithmProto;

    /**
     * Creates a new SignedDrmCertificate instance using the specified properties.
     * @param [properties] Properties to set
     * @returns SignedDrmCertificate instance
     */
    static create(properties: SignedDrmCertificate.$Shape): SignedDrmCertificate & SignedDrmCertificate.$Shape;
    static create(properties?: SignedDrmCertificate.$Properties): SignedDrmCertificate;

    /**
     * Encodes the specified SignedDrmCertificate message. Does not implicitly {@link SignedDrmCertificate.verify|verify} messages.
     * @param message SignedDrmCertificate message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: SignedDrmCertificate.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified SignedDrmCertificate message, length delimited. Does not implicitly {@link SignedDrmCertificate.verify|verify} messages.
     * @param message SignedDrmCertificate message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: SignedDrmCertificate.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a SignedDrmCertificate message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {SignedDrmCertificate & SignedDrmCertificate.$Shape} SignedDrmCertificate
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): SignedDrmCertificate & SignedDrmCertificate.$Shape;

    /**
     * Decodes a SignedDrmCertificate message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {SignedDrmCertificate & SignedDrmCertificate.$Shape} SignedDrmCertificate
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): SignedDrmCertificate & SignedDrmCertificate.$Shape;

    /**
     * Verifies a SignedDrmCertificate message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a SignedDrmCertificate message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns SignedDrmCertificate
     */
    static fromObject(object: { [k: string]: any }): SignedDrmCertificate;

    /**
     * Creates a plain object from a SignedDrmCertificate message. Also converts values to other types if specified.
     * @param message SignedDrmCertificate
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: SignedDrmCertificate, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this SignedDrmCertificate to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for SignedDrmCertificate
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace SignedDrmCertificate {

    /** Properties of a SignedDrmCertificate. */
    interface $Properties {

        /** SignedDrmCertificate drmCertificate */
        drmCertificate?: (Uint8Array|null);

        /** SignedDrmCertificate signature */
        signature?: (Uint8Array|null);

        /** SignedDrmCertificate signer */
        signer?: (SignedDrmCertificate.$Properties|null);

        /** SignedDrmCertificate hashAlgorithm */
        hashAlgorithm?: (HashAlgorithmProto|null);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a SignedDrmCertificate. */
    type $Shape = SignedDrmCertificate.$Properties;
}

/**
 * Properties of a WidevinePsshData.
 * @deprecated Use WidevinePsshData.$Properties instead.
 */
export interface IWidevinePsshData extends WidevinePsshData.$Properties {
}

/** Represents a WidevinePsshData. */
export class WidevinePsshData {

    /**
     * Constructs a new WidevinePsshData.
     * @param [properties] Properties to set
     */
    constructor(properties?: WidevinePsshData.$Properties);

    /** Unknown fields preserved while decoding */
    $unknowns?: Uint8Array[];

    /** WidevinePsshData keyIds. */
    keyIds: Uint8Array[];

    /** WidevinePsshData contentId. */
    contentId: Uint8Array;

    /** WidevinePsshData cryptoPeriodIndex. */
    cryptoPeriodIndex: number;

    /** WidevinePsshData protectionScheme. */
    protectionScheme: number;

    /** WidevinePsshData cryptoPeriodSeconds. */
    cryptoPeriodSeconds: number;

    /** WidevinePsshData type. */
    type: WidevinePsshData.Type;

    /** WidevinePsshData keySequence. */
    keySequence: number;

    /** WidevinePsshData groupIds. */
    groupIds: Uint8Array[];

    /** WidevinePsshData entitledKeys. */
    entitledKeys: WidevinePsshData.EntitledKey.$Properties[];

    /** WidevinePsshData videoFeature. */
    videoFeature: string;

    /** WidevinePsshData algorithm. */
    algorithm: WidevinePsshData.Algorithm;

    /** WidevinePsshData provider. */
    provider: string;

    /** WidevinePsshData trackType. */
    trackType: string;

    /** WidevinePsshData policy. */
    policy: string;

    /** WidevinePsshData groupedLicense. */
    groupedLicense: Uint8Array;

    /**
     * Creates a new WidevinePsshData instance using the specified properties.
     * @param [properties] Properties to set
     * @returns WidevinePsshData instance
     */
    static create(properties: WidevinePsshData.$Shape): WidevinePsshData & WidevinePsshData.$Shape;
    static create(properties?: WidevinePsshData.$Properties): WidevinePsshData;

    /**
     * Encodes the specified WidevinePsshData message. Does not implicitly {@link WidevinePsshData.verify|verify} messages.
     * @param message WidevinePsshData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: WidevinePsshData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified WidevinePsshData message, length delimited. Does not implicitly {@link WidevinePsshData.verify|verify} messages.
     * @param message WidevinePsshData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: WidevinePsshData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a WidevinePsshData message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {WidevinePsshData & WidevinePsshData.$Shape} WidevinePsshData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): WidevinePsshData & WidevinePsshData.$Shape;

    /**
     * Decodes a WidevinePsshData message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {WidevinePsshData & WidevinePsshData.$Shape} WidevinePsshData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): WidevinePsshData & WidevinePsshData.$Shape;

    /**
     * Verifies a WidevinePsshData message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a WidevinePsshData message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns WidevinePsshData
     */
    static fromObject(object: { [k: string]: any }): WidevinePsshData;

    /**
     * Creates a plain object from a WidevinePsshData message. Also converts values to other types if specified.
     * @param message WidevinePsshData
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: WidevinePsshData, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this WidevinePsshData to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for WidevinePsshData
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace WidevinePsshData {

    /** Properties of a WidevinePsshData. */
    interface $Properties {

        /** WidevinePsshData keyIds */
        keyIds?: (Uint8Array[]|null);

        /** WidevinePsshData contentId */
        contentId?: (Uint8Array|null);

        /** WidevinePsshData cryptoPeriodIndex */
        cryptoPeriodIndex?: (number|null);

        /** WidevinePsshData protectionScheme */
        protectionScheme?: (number|null);

        /** WidevinePsshData cryptoPeriodSeconds */
        cryptoPeriodSeconds?: (number|null);

        /** WidevinePsshData type */
        type?: (WidevinePsshData.Type|null);

        /** WidevinePsshData keySequence */
        keySequence?: (number|null);

        /** WidevinePsshData groupIds */
        groupIds?: (Uint8Array[]|null);

        /** WidevinePsshData entitledKeys */
        entitledKeys?: (WidevinePsshData.EntitledKey.$Properties[]|null);

        /** WidevinePsshData videoFeature */
        videoFeature?: (string|null);

        /** WidevinePsshData algorithm */
        algorithm?: (WidevinePsshData.Algorithm|null);

        /** WidevinePsshData provider */
        provider?: (string|null);

        /** WidevinePsshData trackType */
        trackType?: (string|null);

        /** WidevinePsshData policy */
        policy?: (string|null);

        /** WidevinePsshData groupedLicense */
        groupedLicense?: (Uint8Array|null);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a WidevinePsshData. */
    type $Shape = WidevinePsshData.$Properties;

    /** Type enum. */
    enum Type {

        /** SINGLE value */
        SINGLE = 0,

        /** ENTITLEMENT value */
        ENTITLEMENT = 1,

        /** ENTITLED_KEY value */
        ENTITLED_KEY = 2
    }

    /**
     * Properties of an EntitledKey.
     * @deprecated Use WidevinePsshData.EntitledKey.$Properties instead.
     */
    interface IEntitledKey extends WidevinePsshData.EntitledKey.$Properties {
    }

    /** Represents an EntitledKey. */
    class EntitledKey {

        /**
         * Constructs a new EntitledKey.
         * @param [properties] Properties to set
         */
        constructor(properties?: WidevinePsshData.EntitledKey.$Properties);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];

        /** EntitledKey entitlementKeyId. */
        entitlementKeyId: Uint8Array;

        /** EntitledKey keyId. */
        keyId: Uint8Array;

        /** EntitledKey key. */
        key: Uint8Array;

        /** EntitledKey iv. */
        iv: Uint8Array;

        /** EntitledKey entitlementKeySizeBytes. */
        entitlementKeySizeBytes: number;

        /**
         * Creates a new EntitledKey instance using the specified properties.
         * @param [properties] Properties to set
         * @returns EntitledKey instance
         */
        static create(properties: WidevinePsshData.EntitledKey.$Shape): WidevinePsshData.EntitledKey & WidevinePsshData.EntitledKey.$Shape;
        static create(properties?: WidevinePsshData.EntitledKey.$Properties): WidevinePsshData.EntitledKey;

        /**
         * Encodes the specified EntitledKey message. Does not implicitly {@link WidevinePsshData.EntitledKey.verify|verify} messages.
         * @param message EntitledKey message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: WidevinePsshData.EntitledKey.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified EntitledKey message, length delimited. Does not implicitly {@link WidevinePsshData.EntitledKey.verify|verify} messages.
         * @param message EntitledKey message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: WidevinePsshData.EntitledKey.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an EntitledKey message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {WidevinePsshData.EntitledKey & WidevinePsshData.EntitledKey.$Shape} EntitledKey
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): WidevinePsshData.EntitledKey & WidevinePsshData.EntitledKey.$Shape;

        /**
         * Decodes an EntitledKey message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {WidevinePsshData.EntitledKey & WidevinePsshData.EntitledKey.$Shape} EntitledKey
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): WidevinePsshData.EntitledKey & WidevinePsshData.EntitledKey.$Shape;

        /**
         * Verifies an EntitledKey message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an EntitledKey message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns EntitledKey
         */
        static fromObject(object: { [k: string]: any }): WidevinePsshData.EntitledKey;

        /**
         * Creates a plain object from an EntitledKey message. Also converts values to other types if specified.
         * @param message EntitledKey
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: WidevinePsshData.EntitledKey, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this EntitledKey to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for EntitledKey
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace EntitledKey {

        /** Properties of an EntitledKey. */
        interface $Properties {

            /** EntitledKey entitlementKeyId */
            entitlementKeyId?: (Uint8Array|null);

            /** EntitledKey keyId */
            keyId?: (Uint8Array|null);

            /** EntitledKey key */
            key?: (Uint8Array|null);

            /** EntitledKey iv */
            iv?: (Uint8Array|null);

            /** EntitledKey entitlementKeySizeBytes */
            entitlementKeySizeBytes?: (number|null);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];
        }

        /** Shape of an EntitledKey. */
        type $Shape = WidevinePsshData.EntitledKey.$Properties;
    }

    /** Deprecated Fields  //////////////////////////// */
    enum Algorithm {

        /** UNENCRYPTED value */
        UNENCRYPTED = 0,

        /** AESCTR value */
        AESCTR = 1
    }
}

/**
 * Properties of a FileHashes.
 * @deprecated Use FileHashes.$Properties instead.
 */
export interface IFileHashes extends FileHashes.$Properties {
}

/** Represents a FileHashes. */
export class FileHashes {

    /**
     * Constructs a new FileHashes.
     * @param [properties] Properties to set
     */
    constructor(properties?: FileHashes.$Properties);

    /** Unknown fields preserved while decoding */
    $unknowns?: Uint8Array[];

    /** FileHashes signer. */
    signer: Uint8Array;

    /** FileHashes signatures. */
    signatures: FileHashes.Signature.$Properties[];

    /**
     * Creates a new FileHashes instance using the specified properties.
     * @param [properties] Properties to set
     * @returns FileHashes instance
     */
    static create(properties: FileHashes.$Shape): FileHashes & FileHashes.$Shape;
    static create(properties?: FileHashes.$Properties): FileHashes;

    /**
     * Encodes the specified FileHashes message. Does not implicitly {@link FileHashes.verify|verify} messages.
     * @param message FileHashes message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: FileHashes.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified FileHashes message, length delimited. Does not implicitly {@link FileHashes.verify|verify} messages.
     * @param message FileHashes message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: FileHashes.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a FileHashes message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {FileHashes & FileHashes.$Shape} FileHashes
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): FileHashes & FileHashes.$Shape;

    /**
     * Decodes a FileHashes message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {FileHashes & FileHashes.$Shape} FileHashes
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): FileHashes & FileHashes.$Shape;

    /**
     * Verifies a FileHashes message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a FileHashes message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns FileHashes
     */
    static fromObject(object: { [k: string]: any }): FileHashes;

    /**
     * Creates a plain object from a FileHashes message. Also converts values to other types if specified.
     * @param message FileHashes
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: FileHashes, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this FileHashes to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for FileHashes
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace FileHashes {

    /** Properties of a FileHashes. */
    interface $Properties {

        /** FileHashes signer */
        signer?: (Uint8Array|null);

        /** FileHashes signatures */
        signatures?: (FileHashes.Signature.$Properties[]|null);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a FileHashes. */
    type $Shape = FileHashes.$Properties;

    /**
     * Properties of a Signature.
     * @deprecated Use FileHashes.Signature.$Properties instead.
     */
    interface ISignature extends FileHashes.Signature.$Properties {
    }

    /** Represents a Signature. */
    class Signature {

        /**
         * Constructs a new Signature.
         * @param [properties] Properties to set
         */
        constructor(properties?: FileHashes.Signature.$Properties);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];

        /** Signature filename. */
        filename: string;

        /** Signature testSigning. */
        testSigning: boolean;

        /** Signature SHA512Hash. */
        SHA512Hash: Uint8Array;

        /** Signature mainExe. */
        mainExe: boolean;

        /** Signature signature. */
        signature: Uint8Array;

        /**
         * Creates a new Signature instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Signature instance
         */
        static create(properties: FileHashes.Signature.$Shape): FileHashes.Signature & FileHashes.Signature.$Shape;
        static create(properties?: FileHashes.Signature.$Properties): FileHashes.Signature;

        /**
         * Encodes the specified Signature message. Does not implicitly {@link FileHashes.Signature.verify|verify} messages.
         * @param message Signature message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: FileHashes.Signature.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Signature message, length delimited. Does not implicitly {@link FileHashes.Signature.verify|verify} messages.
         * @param message Signature message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: FileHashes.Signature.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Signature message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {FileHashes.Signature & FileHashes.Signature.$Shape} Signature
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): FileHashes.Signature & FileHashes.Signature.$Shape;

        /**
         * Decodes a Signature message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {FileHashes.Signature & FileHashes.Signature.$Shape} Signature
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): FileHashes.Signature & FileHashes.Signature.$Shape;

        /**
         * Verifies a Signature message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Signature message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Signature
         */
        static fromObject(object: { [k: string]: any }): FileHashes.Signature;

        /**
         * Creates a plain object from a Signature message. Also converts values to other types if specified.
         * @param message Signature
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: FileHashes.Signature, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Signature to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for Signature
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace Signature {

        /** Properties of a Signature. */
        interface $Properties {

            /** Signature filename */
            filename?: (string|null);

            /** Signature testSigning */
            testSigning?: (boolean|null);

            /** Signature SHA512Hash */
            SHA512Hash?: (Uint8Array|null);

            /** Signature mainExe */
            mainExe?: (boolean|null);

            /** Signature signature */
            signature?: (Uint8Array|null);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a Signature. */
        type $Shape = FileHashes.Signature.$Properties;
    }
}

/**
 * Properties of a RemoteAttestation.
 * @deprecated Use RemoteAttestation.$Properties instead.
 */
export interface IRemoteAttestation extends RemoteAttestation.$Properties {
}

/** Represents a RemoteAttestation. */
export class RemoteAttestation {

    /**
     * Constructs a new RemoteAttestation.
     * @param [properties] Properties to set
     */
    constructor(properties?: RemoteAttestation.$Properties);

    /** Unknown fields preserved while decoding */
    $unknowns?: Uint8Array[];

    /** RemoteAttestation certificate. */
    certificate?: (EncryptedClientIdentification.$Properties|null);

    /** RemoteAttestation salt. */
    salt: Uint8Array;

    /** RemoteAttestation signature. */
    signature: Uint8Array;

    /**
     * Creates a new RemoteAttestation instance using the specified properties.
     * @param [properties] Properties to set
     * @returns RemoteAttestation instance
     */
    static create(properties: RemoteAttestation.$Shape): RemoteAttestation & RemoteAttestation.$Shape;
    static create(properties?: RemoteAttestation.$Properties): RemoteAttestation;

    /**
     * Encodes the specified RemoteAttestation message. Does not implicitly {@link RemoteAttestation.verify|verify} messages.
     * @param message RemoteAttestation message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: RemoteAttestation.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified RemoteAttestation message, length delimited. Does not implicitly {@link RemoteAttestation.verify|verify} messages.
     * @param message RemoteAttestation message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: RemoteAttestation.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a RemoteAttestation message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {RemoteAttestation & RemoteAttestation.$Shape} RemoteAttestation
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): RemoteAttestation & RemoteAttestation.$Shape;

    /**
     * Decodes a RemoteAttestation message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {RemoteAttestation & RemoteAttestation.$Shape} RemoteAttestation
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): RemoteAttestation & RemoteAttestation.$Shape;

    /**
     * Verifies a RemoteAttestation message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a RemoteAttestation message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns RemoteAttestation
     */
    static fromObject(object: { [k: string]: any }): RemoteAttestation;

    /**
     * Creates a plain object from a RemoteAttestation message. Also converts values to other types if specified.
     * @param message RemoteAttestation
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: RemoteAttestation, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this RemoteAttestation to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for RemoteAttestation
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace RemoteAttestation {

    /** Properties of a RemoteAttestation. */
    interface $Properties {

        /** RemoteAttestation certificate */
        certificate?: (EncryptedClientIdentification.$Properties|null);

        /** RemoteAttestation salt */
        salt?: (Uint8Array|null);

        /** RemoteAttestation signature */
        signature?: (Uint8Array|null);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a RemoteAttestation. */
    type $Shape = RemoteAttestation.$Properties;
}
