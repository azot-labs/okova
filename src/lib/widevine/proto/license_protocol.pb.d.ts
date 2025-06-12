import * as $protobuf from 'protobufjs';
import Long = require('long');
/** LicenseType enum. */
export enum LicenseType {
  STREAMING = 1,
  OFFLINE = 2,
  AUTOMATIC = 3,
}

/** PlatformVerificationStatus enum. */
export enum PlatformVerificationStatus {
  PLATFORM_UNVERIFIED = 0,
  PLATFORM_TAMPERED = 1,
  PLATFORM_SOFTWARE_VERIFIED = 2,
  PLATFORM_HARDWARE_VERIFIED = 3,
  PLATFORM_NO_VERIFICATION = 4,
  PLATFORM_SECURE_STORAGE_SOFTWARE_VERIFIED = 5,
}

/** Represents a LicenseIdentification. */
export class LicenseIdentification implements ILicenseIdentification {
  /**
   * Constructs a new LicenseIdentification.
   * @param [p] Properties to set
   */
  constructor(p?: ILicenseIdentification);

  /** LicenseIdentification requestId. */
  public requestId: Uint8Array;

  /** LicenseIdentification sessionId. */
  public sessionId: Uint8Array;

  /** LicenseIdentification purchaseId. */
  public purchaseId: Uint8Array;

  /** LicenseIdentification type. */
  public type: LicenseType;

  /** LicenseIdentification version. */
  public version: number;

  /** LicenseIdentification providerSessionToken. */
  public providerSessionToken: Uint8Array;

  /**
   * Creates a new LicenseIdentification instance using the specified properties.
   * @param [properties] Properties to set
   * @returns LicenseIdentification instance
   */
  public static create(
    properties?: ILicenseIdentification,
  ): LicenseIdentification;

  /**
   * Encodes the specified LicenseIdentification message. Does not implicitly {@link LicenseIdentification.verify|verify} messages.
   * @param m LicenseIdentification message or plain object to encode
   * @param [w] Writer to encode to
   * @returns Writer
   */
  public static encode(
    m: ILicenseIdentification,
    w?: $protobuf.Writer,
  ): $protobuf.Writer;

  /**
   * Encodes the specified LicenseIdentification message, length delimited. Does not implicitly {@link LicenseIdentification.verify|verify} messages.
   * @param message LicenseIdentification message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(
    message: ILicenseIdentification,
    writer?: $protobuf.Writer,
  ): $protobuf.Writer;

  /**
   * Decodes a LicenseIdentification message from the specified reader or buffer.
   * @param r Reader or buffer to decode from
   * @param [l] Message length if known beforehand
   * @returns LicenseIdentification
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(
    r: $protobuf.Reader | Uint8Array,
    l?: number,
  ): LicenseIdentification;

  /**
   * Decodes a LicenseIdentification message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns LicenseIdentification
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(
    reader: $protobuf.Reader | Uint8Array,
  ): LicenseIdentification;

  /**
   * Creates a LicenseIdentification message from a plain object. Also converts values to their respective internal types.
   * @param d Plain object
   * @returns LicenseIdentification
   */
  public static fromObject(d: { [k: string]: any }): LicenseIdentification;

  /**
   * Creates a plain object from a LicenseIdentification message. Also converts values to other types if specified.
   * @param m LicenseIdentification
   * @param [o] Conversion options
   * @returns Plain object
   */
  public static toObject(
    m: LicenseIdentification,
    o?: $protobuf.IConversionOptions,
  ): { [k: string]: any };

  /**
   * Converts this LicenseIdentification to JSON.
   * @returns JSON object
   */
  public toJSON(): { [k: string]: any };

  /**
   * Gets the default type url for LicenseIdentification
   * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns The default type url
   */
  public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a License. */
export class License implements ILicense {
  /**
   * Constructs a new License.
   * @param [p] Properties to set
   */
  constructor(p?: ILicense);

  /** License id. */
  public id?: ILicenseIdentification | null;

  /** License policy. */
  public policy?: License.IPolicy | null;

  /** License key. */
  public key: License.IKeyContainer[];

  /** License licenseStartTime. */
  public licenseStartTime: number | Long;

  /** License remoteAttestationVerified. */
  public remoteAttestationVerified: boolean;

  /** License providerClientToken. */
  public providerClientToken: Uint8Array;

  /** License protectionScheme. */
  public protectionScheme: number;

  /** License srmRequirement. */
  public srmRequirement: Uint8Array;

  /** License srmUpdate. */
  public srmUpdate: Uint8Array;

  /** License platformVerificationStatus. */
  public platformVerificationStatus: PlatformVerificationStatus;

  /** License groupIds. */
  public groupIds: Uint8Array[];

  /**
   * Creates a new License instance using the specified properties.
   * @param [properties] Properties to set
   * @returns License instance
   */
  public static create(properties?: ILicense): License;

  /**
   * Encodes the specified License message. Does not implicitly {@link License.verify|verify} messages.
   * @param m License message or plain object to encode
   * @param [w] Writer to encode to
   * @returns Writer
   */
  public static encode(m: ILicense, w?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Encodes the specified License message, length delimited. Does not implicitly {@link License.verify|verify} messages.
   * @param message License message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(
    message: ILicense,
    writer?: $protobuf.Writer,
  ): $protobuf.Writer;

  /**
   * Decodes a License message from the specified reader or buffer.
   * @param r Reader or buffer to decode from
   * @param [l] Message length if known beforehand
   * @returns License
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(r: $protobuf.Reader | Uint8Array, l?: number): License;

  /**
   * Decodes a License message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns License
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): License;

  /**
   * Creates a License message from a plain object. Also converts values to their respective internal types.
   * @param d Plain object
   * @returns License
   */
  public static fromObject(d: { [k: string]: any }): License;

  /**
   * Creates a plain object from a License message. Also converts values to other types if specified.
   * @param m License
   * @param [o] Conversion options
   * @returns Plain object
   */
  public static toObject(
    m: License,
    o?: $protobuf.IConversionOptions,
  ): { [k: string]: any };

  /**
   * Converts this License to JSON.
   * @returns JSON object
   */
  public toJSON(): { [k: string]: any };

  /**
   * Gets the default type url for License
   * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns The default type url
   */
  public static getTypeUrl(typeUrlPrefix?: string): string;
}

export namespace License {
  /** Properties of a Policy. */
  interface IPolicy {
    /** Policy canPlay */
    canPlay?: boolean | null;

    /** Policy canPersist */
    canPersist?: boolean | null;

    /** Policy canRenew */
    canRenew?: boolean | null;

    /** Policy rentalDurationSeconds */
    rentalDurationSeconds?: number | Long | null;

    /** Policy playbackDurationSeconds */
    playbackDurationSeconds?: number | Long | null;

    /** Policy licenseDurationSeconds */
    licenseDurationSeconds?: number | Long | null;

    /** Policy renewalRecoveryDurationSeconds */
    renewalRecoveryDurationSeconds?: number | Long | null;

    /** Policy renewalServerUrl */
    renewalServerUrl?: string | null;

    /** Policy renewalDelaySeconds */
    renewalDelaySeconds?: number | Long | null;

    /** Policy renewalRetryIntervalSeconds */
    renewalRetryIntervalSeconds?: number | Long | null;

    /** Policy renewWithUsage */
    renewWithUsage?: boolean | null;

    /** Policy alwaysIncludeClientId */
    alwaysIncludeClientId?: boolean | null;

    /** Policy playStartGracePeriodSeconds */
    playStartGracePeriodSeconds?: number | Long | null;

    /** Policy softEnforcePlaybackDuration */
    softEnforcePlaybackDuration?: boolean | null;

    /** Policy softEnforceRentalDuration */
    softEnforceRentalDuration?: boolean | null;
  }

  /** Represents a Policy. */
  class Policy implements IPolicy {
    /**
     * Constructs a new Policy.
     * @param [p] Properties to set
     */
    constructor(p?: License.IPolicy);

    /** Policy canPlay. */
    public canPlay: boolean;

    /** Policy canPersist. */
    public canPersist: boolean;

    /** Policy canRenew. */
    public canRenew: boolean;

    /** Policy rentalDurationSeconds. */
    public rentalDurationSeconds: number | Long;

    /** Policy playbackDurationSeconds. */
    public playbackDurationSeconds: number | Long;

    /** Policy licenseDurationSeconds. */
    public licenseDurationSeconds: number | Long;

    /** Policy renewalRecoveryDurationSeconds. */
    public renewalRecoveryDurationSeconds: number | Long;

    /** Policy renewalServerUrl. */
    public renewalServerUrl: string;

    /** Policy renewalDelaySeconds. */
    public renewalDelaySeconds: number | Long;

    /** Policy renewalRetryIntervalSeconds. */
    public renewalRetryIntervalSeconds: number | Long;

    /** Policy renewWithUsage. */
    public renewWithUsage: boolean;

    /** Policy alwaysIncludeClientId. */
    public alwaysIncludeClientId: boolean;

    /** Policy playStartGracePeriodSeconds. */
    public playStartGracePeriodSeconds: number | Long;

    /** Policy softEnforcePlaybackDuration. */
    public softEnforcePlaybackDuration: boolean;

    /** Policy softEnforceRentalDuration. */
    public softEnforceRentalDuration: boolean;

    /**
     * Creates a new Policy instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Policy instance
     */
    public static create(properties?: License.IPolicy): License.Policy;

    /**
     * Encodes the specified Policy message. Does not implicitly {@link License.Policy.verify|verify} messages.
     * @param m Policy message or plain object to encode
     * @param [w] Writer to encode to
     * @returns Writer
     */
    public static encode(
      m: License.IPolicy,
      w?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Encodes the specified Policy message, length delimited. Does not implicitly {@link License.Policy.verify|verify} messages.
     * @param message Policy message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: License.IPolicy,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a Policy message from the specified reader or buffer.
     * @param r Reader or buffer to decode from
     * @param [l] Message length if known beforehand
     * @returns Policy
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      r: $protobuf.Reader | Uint8Array,
      l?: number,
    ): License.Policy;

    /**
     * Decodes a Policy message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Policy
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array,
    ): License.Policy;

    /**
     * Creates a Policy message from a plain object. Also converts values to their respective internal types.
     * @param d Plain object
     * @returns Policy
     */
    public static fromObject(d: { [k: string]: any }): License.Policy;

    /**
     * Creates a plain object from a Policy message. Also converts values to other types if specified.
     * @param m Policy
     * @param [o] Conversion options
     * @returns Plain object
     */
    public static toObject(
      m: License.Policy,
      o?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this Policy to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for Policy
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
  }

  /** Properties of a KeyContainer. */
  interface IKeyContainer {
    /** KeyContainer id */
    id?: Uint8Array | null;

    /** KeyContainer iv */
    iv?: Uint8Array | null;

    /** KeyContainer key */
    key?: Uint8Array | null;

    /** KeyContainer type */
    type?: License.KeyContainer.KeyType | null;

    /** KeyContainer level */
    level?: License.KeyContainer.SecurityLevel | null;

    /** KeyContainer requiredProtection */
    requiredProtection?: License.KeyContainer.IOutputProtection | null;

    /** KeyContainer requestedProtection */
    requestedProtection?: License.KeyContainer.IOutputProtection | null;

    /** KeyContainer keyControl */
    keyControl?: License.KeyContainer.IKeyControl | null;

    /** KeyContainer operatorSessionKeyPermissions */
    operatorSessionKeyPermissions?: License.KeyContainer.IOperatorSessionKeyPermissions | null;

    /** KeyContainer videoResolutionConstraints */
    videoResolutionConstraints?:
      | License.KeyContainer.IVideoResolutionConstraint[]
      | null;

    /** KeyContainer antiRollbackUsageTable */
    antiRollbackUsageTable?: boolean | null;

    /** KeyContainer trackLabel */
    trackLabel?: string | null;
  }

  /** Represents a KeyContainer. */
  class KeyContainer implements IKeyContainer {
    /**
     * Constructs a new KeyContainer.
     * @param [p] Properties to set
     */
    constructor(p?: License.IKeyContainer);

    /** KeyContainer id. */
    public id: Uint8Array;

    /** KeyContainer iv. */
    public iv: Uint8Array;

    /** KeyContainer key. */
    public key: Uint8Array;

    /** KeyContainer type. */
    public type: License.KeyContainer.KeyType;

    /** KeyContainer level. */
    public level: License.KeyContainer.SecurityLevel;

    /** KeyContainer requiredProtection. */
    public requiredProtection?: License.KeyContainer.IOutputProtection | null;

    /** KeyContainer requestedProtection. */
    public requestedProtection?: License.KeyContainer.IOutputProtection | null;

    /** KeyContainer keyControl. */
    public keyControl?: License.KeyContainer.IKeyControl | null;

    /** KeyContainer operatorSessionKeyPermissions. */
    public operatorSessionKeyPermissions?: License.KeyContainer.IOperatorSessionKeyPermissions | null;

    /** KeyContainer videoResolutionConstraints. */
    public videoResolutionConstraints: License.KeyContainer.IVideoResolutionConstraint[];

    /** KeyContainer antiRollbackUsageTable. */
    public antiRollbackUsageTable: boolean;

    /** KeyContainer trackLabel. */
    public trackLabel: string;

    /**
     * Creates a new KeyContainer instance using the specified properties.
     * @param [properties] Properties to set
     * @returns KeyContainer instance
     */
    public static create(
      properties?: License.IKeyContainer,
    ): License.KeyContainer;

    /**
     * Encodes the specified KeyContainer message. Does not implicitly {@link License.KeyContainer.verify|verify} messages.
     * @param m KeyContainer message or plain object to encode
     * @param [w] Writer to encode to
     * @returns Writer
     */
    public static encode(
      m: License.IKeyContainer,
      w?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Encodes the specified KeyContainer message, length delimited. Does not implicitly {@link License.KeyContainer.verify|verify} messages.
     * @param message KeyContainer message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: License.IKeyContainer,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a KeyContainer message from the specified reader or buffer.
     * @param r Reader or buffer to decode from
     * @param [l] Message length if known beforehand
     * @returns KeyContainer
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      r: $protobuf.Reader | Uint8Array,
      l?: number,
    ): License.KeyContainer;

    /**
     * Decodes a KeyContainer message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns KeyContainer
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array,
    ): License.KeyContainer;

    /**
     * Creates a KeyContainer message from a plain object. Also converts values to their respective internal types.
     * @param d Plain object
     * @returns KeyContainer
     */
    public static fromObject(d: { [k: string]: any }): License.KeyContainer;

    /**
     * Creates a plain object from a KeyContainer message. Also converts values to other types if specified.
     * @param m KeyContainer
     * @param [o] Conversion options
     * @returns Plain object
     */
    public static toObject(
      m: License.KeyContainer,
      o?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this KeyContainer to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for KeyContainer
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
  }

  namespace KeyContainer {
    /** KeyType enum. */
    enum KeyType {
      SIGNING = 1,
      CONTENT = 2,
      KEY_CONTROL = 3,
      OPERATOR_SESSION = 4,
      ENTITLEMENT = 5,
      OEM_CONTENT = 6,
    }

    /** SecurityLevel enum. */
    enum SecurityLevel {
      SW_SECURE_CRYPTO = 1,
      SW_SECURE_DECODE = 2,
      HW_SECURE_CRYPTO = 3,
      HW_SECURE_DECODE = 4,
      HW_SECURE_ALL = 5,
    }

    /** Properties of a KeyControl. */
    interface IKeyControl {
      /** KeyControl keyControlBlock */
      keyControlBlock?: Uint8Array | null;

      /** KeyControl iv */
      iv?: Uint8Array | null;
    }

    /** Represents a KeyControl. */
    class KeyControl implements IKeyControl {
      /**
       * Constructs a new KeyControl.
       * @param [p] Properties to set
       */
      constructor(p?: License.KeyContainer.IKeyControl);

      /** KeyControl keyControlBlock. */
      public keyControlBlock: Uint8Array;

      /** KeyControl iv. */
      public iv: Uint8Array;

      /**
       * Creates a new KeyControl instance using the specified properties.
       * @param [properties] Properties to set
       * @returns KeyControl instance
       */
      public static create(
        properties?: License.KeyContainer.IKeyControl,
      ): License.KeyContainer.KeyControl;

      /**
       * Encodes the specified KeyControl message. Does not implicitly {@link License.KeyContainer.KeyControl.verify|verify} messages.
       * @param m KeyControl message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: License.KeyContainer.IKeyControl,
        w?: $protobuf.Writer,
      ): $protobuf.Writer;

      /**
       * Encodes the specified KeyControl message, length delimited. Does not implicitly {@link License.KeyContainer.KeyControl.verify|verify} messages.
       * @param message KeyControl message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: License.KeyContainer.IKeyControl,
        writer?: $protobuf.Writer,
      ): $protobuf.Writer;

      /**
       * Decodes a KeyControl message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns KeyControl
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number,
      ): License.KeyContainer.KeyControl;

      /**
       * Decodes a KeyControl message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns KeyControl
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array,
      ): License.KeyContainer.KeyControl;

      /**
       * Creates a KeyControl message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns KeyControl
       */
      public static fromObject(d: {
        [k: string]: any;
      }): License.KeyContainer.KeyControl;

      /**
       * Creates a plain object from a KeyControl message. Also converts values to other types if specified.
       * @param m KeyControl
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: License.KeyContainer.KeyControl,
        o?: $protobuf.IConversionOptions,
      ): { [k: string]: any };

      /**
       * Converts this KeyControl to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for KeyControl
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an OutputProtection. */
    interface IOutputProtection {
      /** OutputProtection hdcp */
      hdcp?: License.KeyContainer.OutputProtection.HDCP | null;

      /** OutputProtection cgmsFlags */
      cgmsFlags?: License.KeyContainer.OutputProtection.CGMS | null;

      /** OutputProtection hdcpSrmRule */
      hdcpSrmRule?: License.KeyContainer.OutputProtection.HdcpSrmRule | null;

      /** OutputProtection disableAnalogOutput */
      disableAnalogOutput?: boolean | null;

      /** OutputProtection disableDigitalOutput */
      disableDigitalOutput?: boolean | null;
    }

    /** Represents an OutputProtection. */
    class OutputProtection implements IOutputProtection {
      /**
       * Constructs a new OutputProtection.
       * @param [p] Properties to set
       */
      constructor(p?: License.KeyContainer.IOutputProtection);

      /** OutputProtection hdcp. */
      public hdcp: License.KeyContainer.OutputProtection.HDCP;

      /** OutputProtection cgmsFlags. */
      public cgmsFlags: License.KeyContainer.OutputProtection.CGMS;

      /** OutputProtection hdcpSrmRule. */
      public hdcpSrmRule: License.KeyContainer.OutputProtection.HdcpSrmRule;

      /** OutputProtection disableAnalogOutput. */
      public disableAnalogOutput: boolean;

      /** OutputProtection disableDigitalOutput. */
      public disableDigitalOutput: boolean;

      /**
       * Creates a new OutputProtection instance using the specified properties.
       * @param [properties] Properties to set
       * @returns OutputProtection instance
       */
      public static create(
        properties?: License.KeyContainer.IOutputProtection,
      ): License.KeyContainer.OutputProtection;

      /**
       * Encodes the specified OutputProtection message. Does not implicitly {@link License.KeyContainer.OutputProtection.verify|verify} messages.
       * @param m OutputProtection message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: License.KeyContainer.IOutputProtection,
        w?: $protobuf.Writer,
      ): $protobuf.Writer;

      /**
       * Encodes the specified OutputProtection message, length delimited. Does not implicitly {@link License.KeyContainer.OutputProtection.verify|verify} messages.
       * @param message OutputProtection message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: License.KeyContainer.IOutputProtection,
        writer?: $protobuf.Writer,
      ): $protobuf.Writer;

      /**
       * Decodes an OutputProtection message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns OutputProtection
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number,
      ): License.KeyContainer.OutputProtection;

      /**
       * Decodes an OutputProtection message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns OutputProtection
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array,
      ): License.KeyContainer.OutputProtection;

      /**
       * Creates an OutputProtection message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns OutputProtection
       */
      public static fromObject(d: {
        [k: string]: any;
      }): License.KeyContainer.OutputProtection;

      /**
       * Creates a plain object from an OutputProtection message. Also converts values to other types if specified.
       * @param m OutputProtection
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: License.KeyContainer.OutputProtection,
        o?: $protobuf.IConversionOptions,
      ): { [k: string]: any };

      /**
       * Converts this OutputProtection to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for OutputProtection
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    namespace OutputProtection {
      /** HDCP enum. */
      enum HDCP {
        HDCP_NONE = 0,
        HDCP_V1 = 1,
        HDCP_V2 = 2,
        HDCP_V2_1 = 3,
        HDCP_V2_2 = 4,
        HDCP_V2_3 = 5,
        HDCP_NO_DIGITAL_OUTPUT = 255,
      }

      /** CGMS enum. */
      enum CGMS {
        CGMS_NONE = 42,
        COPY_FREE = 0,
        COPY_ONCE = 2,
        COPY_NEVER = 3,
      }

      /** HdcpSrmRule enum. */
      enum HdcpSrmRule {
        HDCP_SRM_RULE_NONE = 0,
        CURRENT_SRM = 1,
      }
    }

    /** Properties of a VideoResolutionConstraint. */
    interface IVideoResolutionConstraint {
      /** VideoResolutionConstraint minResolutionPixels */
      minResolutionPixels?: number | null;

      /** VideoResolutionConstraint maxResolutionPixels */
      maxResolutionPixels?: number | null;

      /** VideoResolutionConstraint requiredProtection */
      requiredProtection?: License.KeyContainer.IOutputProtection | null;
    }

    /** Represents a VideoResolutionConstraint. */
    class VideoResolutionConstraint implements IVideoResolutionConstraint {
      /**
       * Constructs a new VideoResolutionConstraint.
       * @param [p] Properties to set
       */
      constructor(p?: License.KeyContainer.IVideoResolutionConstraint);

      /** VideoResolutionConstraint minResolutionPixels. */
      public minResolutionPixels: number;

      /** VideoResolutionConstraint maxResolutionPixels. */
      public maxResolutionPixels: number;

      /** VideoResolutionConstraint requiredProtection. */
      public requiredProtection?: License.KeyContainer.IOutputProtection | null;

      /**
       * Creates a new VideoResolutionConstraint instance using the specified properties.
       * @param [properties] Properties to set
       * @returns VideoResolutionConstraint instance
       */
      public static create(
        properties?: License.KeyContainer.IVideoResolutionConstraint,
      ): License.KeyContainer.VideoResolutionConstraint;

      /**
       * Encodes the specified VideoResolutionConstraint message. Does not implicitly {@link License.KeyContainer.VideoResolutionConstraint.verify|verify} messages.
       * @param m VideoResolutionConstraint message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: License.KeyContainer.IVideoResolutionConstraint,
        w?: $protobuf.Writer,
      ): $protobuf.Writer;

      /**
       * Encodes the specified VideoResolutionConstraint message, length delimited. Does not implicitly {@link License.KeyContainer.VideoResolutionConstraint.verify|verify} messages.
       * @param message VideoResolutionConstraint message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: License.KeyContainer.IVideoResolutionConstraint,
        writer?: $protobuf.Writer,
      ): $protobuf.Writer;

      /**
       * Decodes a VideoResolutionConstraint message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns VideoResolutionConstraint
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number,
      ): License.KeyContainer.VideoResolutionConstraint;

      /**
       * Decodes a VideoResolutionConstraint message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns VideoResolutionConstraint
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array,
      ): License.KeyContainer.VideoResolutionConstraint;

      /**
       * Creates a VideoResolutionConstraint message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns VideoResolutionConstraint
       */
      public static fromObject(d: {
        [k: string]: any;
      }): License.KeyContainer.VideoResolutionConstraint;

      /**
       * Creates a plain object from a VideoResolutionConstraint message. Also converts values to other types if specified.
       * @param m VideoResolutionConstraint
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: License.KeyContainer.VideoResolutionConstraint,
        o?: $protobuf.IConversionOptions,
      ): { [k: string]: any };

      /**
       * Converts this VideoResolutionConstraint to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for VideoResolutionConstraint
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an OperatorSessionKeyPermissions. */
    interface IOperatorSessionKeyPermissions {
      /** OperatorSessionKeyPermissions allowEncrypt */
      allowEncrypt?: boolean | null;

      /** OperatorSessionKeyPermissions allowDecrypt */
      allowDecrypt?: boolean | null;

      /** OperatorSessionKeyPermissions allowSign */
      allowSign?: boolean | null;

      /** OperatorSessionKeyPermissions allowSignatureVerify */
      allowSignatureVerify?: boolean | null;
    }

    /** Represents an OperatorSessionKeyPermissions. */
    class OperatorSessionKeyPermissions
      implements IOperatorSessionKeyPermissions
    {
      /**
       * Constructs a new OperatorSessionKeyPermissions.
       * @param [p] Properties to set
       */
      constructor(p?: License.KeyContainer.IOperatorSessionKeyPermissions);

      /** OperatorSessionKeyPermissions allowEncrypt. */
      public allowEncrypt: boolean;

      /** OperatorSessionKeyPermissions allowDecrypt. */
      public allowDecrypt: boolean;

      /** OperatorSessionKeyPermissions allowSign. */
      public allowSign: boolean;

      /** OperatorSessionKeyPermissions allowSignatureVerify. */
      public allowSignatureVerify: boolean;

      /**
       * Creates a new OperatorSessionKeyPermissions instance using the specified properties.
       * @param [properties] Properties to set
       * @returns OperatorSessionKeyPermissions instance
       */
      public static create(
        properties?: License.KeyContainer.IOperatorSessionKeyPermissions,
      ): License.KeyContainer.OperatorSessionKeyPermissions;

      /**
       * Encodes the specified OperatorSessionKeyPermissions message. Does not implicitly {@link License.KeyContainer.OperatorSessionKeyPermissions.verify|verify} messages.
       * @param m OperatorSessionKeyPermissions message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: License.KeyContainer.IOperatorSessionKeyPermissions,
        w?: $protobuf.Writer,
      ): $protobuf.Writer;

      /**
       * Encodes the specified OperatorSessionKeyPermissions message, length delimited. Does not implicitly {@link License.KeyContainer.OperatorSessionKeyPermissions.verify|verify} messages.
       * @param message OperatorSessionKeyPermissions message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: License.KeyContainer.IOperatorSessionKeyPermissions,
        writer?: $protobuf.Writer,
      ): $protobuf.Writer;

      /**
       * Decodes an OperatorSessionKeyPermissions message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns OperatorSessionKeyPermissions
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number,
      ): License.KeyContainer.OperatorSessionKeyPermissions;

      /**
       * Decodes an OperatorSessionKeyPermissions message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns OperatorSessionKeyPermissions
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array,
      ): License.KeyContainer.OperatorSessionKeyPermissions;

      /**
       * Creates an OperatorSessionKeyPermissions message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns OperatorSessionKeyPermissions
       */
      public static fromObject(d: {
        [k: string]: any;
      }): License.KeyContainer.OperatorSessionKeyPermissions;

      /**
       * Creates a plain object from an OperatorSessionKeyPermissions message. Also converts values to other types if specified.
       * @param m OperatorSessionKeyPermissions
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: License.KeyContainer.OperatorSessionKeyPermissions,
        o?: $protobuf.IConversionOptions,
      ): { [k: string]: any };

      /**
       * Converts this OperatorSessionKeyPermissions to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for OperatorSessionKeyPermissions
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }
  }
}

/** ProtocolVersion enum. */
export enum ProtocolVersion {
  VERSION_2_0 = 20,
  VERSION_2_1 = 21,
  VERSION_2_2 = 22,
}

/** Represents a LicenseRequest. */
export class LicenseRequest implements ILicenseRequest {
  /**
   * Constructs a new LicenseRequest.
   * @param [p] Properties to set
   */
  constructor(p?: ILicenseRequest);

  /** LicenseRequest clientId. */
  public clientId?: IClientIdentification | null;

  /** LicenseRequest contentId. */
  public contentId?: LicenseRequest.IContentIdentification | null;

  /** LicenseRequest type. */
  public type: LicenseRequest.RequestType;

  /** LicenseRequest requestTime. */
  public requestTime: number | Long;

  /** LicenseRequest keyControlNonceDeprecated. */
  public keyControlNonceDeprecated: Uint8Array;

  /** LicenseRequest protocolVersion. */
  public protocolVersion: ProtocolVersion;

  /** LicenseRequest keyControlNonce. */
  public keyControlNonce: number;

  /** LicenseRequest encryptedClientId. */
  public encryptedClientId?: IEncryptedClientIdentification | null;

  /**
   * Creates a new LicenseRequest instance using the specified properties.
   * @param [properties] Properties to set
   * @returns LicenseRequest instance
   */
  public static create(properties?: ILicenseRequest): LicenseRequest;

  /**
   * Encodes the specified LicenseRequest message. Does not implicitly {@link LicenseRequest.verify|verify} messages.
   * @param m LicenseRequest message or plain object to encode
   * @param [w] Writer to encode to
   * @returns Writer
   */
  public static encode(
    m: ILicenseRequest,
    w?: $protobuf.Writer,
  ): $protobuf.Writer;

  /**
   * Encodes the specified LicenseRequest message, length delimited. Does not implicitly {@link LicenseRequest.verify|verify} messages.
   * @param message LicenseRequest message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(
    message: ILicenseRequest,
    writer?: $protobuf.Writer,
  ): $protobuf.Writer;

  /**
   * Decodes a LicenseRequest message from the specified reader or buffer.
   * @param r Reader or buffer to decode from
   * @param [l] Message length if known beforehand
   * @returns LicenseRequest
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(
    r: $protobuf.Reader | Uint8Array,
    l?: number,
  ): LicenseRequest;

  /**
   * Decodes a LicenseRequest message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns LicenseRequest
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(
    reader: $protobuf.Reader | Uint8Array,
  ): LicenseRequest;

  /**
   * Creates a LicenseRequest message from a plain object. Also converts values to their respective internal types.
   * @param d Plain object
   * @returns LicenseRequest
   */
  public static fromObject(d: { [k: string]: any }): LicenseRequest;

  /**
   * Creates a plain object from a LicenseRequest message. Also converts values to other types if specified.
   * @param m LicenseRequest
   * @param [o] Conversion options
   * @returns Plain object
   */
  public static toObject(
    m: LicenseRequest,
    o?: $protobuf.IConversionOptions,
  ): { [k: string]: any };

  /**
   * Converts this LicenseRequest to JSON.
   * @returns JSON object
   */
  public toJSON(): { [k: string]: any };

  /**
   * Gets the default type url for LicenseRequest
   * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns The default type url
   */
  public static getTypeUrl(typeUrlPrefix?: string): string;
}

export namespace LicenseRequest {
  /** Properties of a ContentIdentification. */
  interface IContentIdentification {
    /** ContentIdentification widevinePsshData */
    widevinePsshData?: LicenseRequest.ContentIdentification.IWidevinePsshData | null;

    /** ContentIdentification webmKeyId */
    webmKeyId?: LicenseRequest.ContentIdentification.IWebmKeyId | null;

    /** ContentIdentification existingLicense */
    existingLicense?: LicenseRequest.ContentIdentification.IExistingLicense | null;

    /** ContentIdentification initData */
    initData?: LicenseRequest.ContentIdentification.IInitData | null;
  }

  /** Represents a ContentIdentification. */
  class ContentIdentification implements IContentIdentification {
    /**
     * Constructs a new ContentIdentification.
     * @param [p] Properties to set
     */
    constructor(p?: LicenseRequest.IContentIdentification);

    /** ContentIdentification widevinePsshData. */
    public widevinePsshData?: LicenseRequest.ContentIdentification.IWidevinePsshData | null;

    /** ContentIdentification webmKeyId. */
    public webmKeyId?: LicenseRequest.ContentIdentification.IWebmKeyId | null;

    /** ContentIdentification existingLicense. */
    public existingLicense?: LicenseRequest.ContentIdentification.IExistingLicense | null;

    /** ContentIdentification initData. */
    public initData?: LicenseRequest.ContentIdentification.IInitData | null;

    /** ContentIdentification contentIdVariant. */
    public contentIdVariant?:
      | 'widevinePsshData'
      | 'webmKeyId'
      | 'existingLicense'
      | 'initData';

    /**
     * Creates a new ContentIdentification instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ContentIdentification instance
     */
    public static create(
      properties?: LicenseRequest.IContentIdentification,
    ): LicenseRequest.ContentIdentification;

    /**
     * Encodes the specified ContentIdentification message. Does not implicitly {@link LicenseRequest.ContentIdentification.verify|verify} messages.
     * @param m ContentIdentification message or plain object to encode
     * @param [w] Writer to encode to
     * @returns Writer
     */
    public static encode(
      m: LicenseRequest.IContentIdentification,
      w?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Encodes the specified ContentIdentification message, length delimited. Does not implicitly {@link LicenseRequest.ContentIdentification.verify|verify} messages.
     * @param message ContentIdentification message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: LicenseRequest.IContentIdentification,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a ContentIdentification message from the specified reader or buffer.
     * @param r Reader or buffer to decode from
     * @param [l] Message length if known beforehand
     * @returns ContentIdentification
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      r: $protobuf.Reader | Uint8Array,
      l?: number,
    ): LicenseRequest.ContentIdentification;

    /**
     * Decodes a ContentIdentification message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ContentIdentification
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array,
    ): LicenseRequest.ContentIdentification;

    /**
     * Creates a ContentIdentification message from a plain object. Also converts values to their respective internal types.
     * @param d Plain object
     * @returns ContentIdentification
     */
    public static fromObject(d: {
      [k: string]: any;
    }): LicenseRequest.ContentIdentification;

    /**
     * Creates a plain object from a ContentIdentification message. Also converts values to other types if specified.
     * @param m ContentIdentification
     * @param [o] Conversion options
     * @returns Plain object
     */
    public static toObject(
      m: LicenseRequest.ContentIdentification,
      o?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this ContentIdentification to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for ContentIdentification
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
  }

  namespace ContentIdentification {
    /** Properties of a WidevinePsshData. */
    interface IWidevinePsshData {
      /** WidevinePsshData psshData */
      psshData?: Uint8Array[] | null;

      /** WidevinePsshData licenseType */
      licenseType?: LicenseType | null;

      /** WidevinePsshData requestId */
      requestId?: Uint8Array | null;
    }

    /** Represents a WidevinePsshData. */
    class WidevinePsshData implements IWidevinePsshData {
      /**
       * Constructs a new WidevinePsshData.
       * @param [p] Properties to set
       */
      constructor(p?: LicenseRequest.ContentIdentification.IWidevinePsshData);

      /** WidevinePsshData psshData. */
      public psshData: Uint8Array[];

      /** WidevinePsshData licenseType. */
      public licenseType: LicenseType;

      /** WidevinePsshData requestId. */
      public requestId: Uint8Array;

      /**
       * Creates a new WidevinePsshData instance using the specified properties.
       * @param [properties] Properties to set
       * @returns WidevinePsshData instance
       */
      public static create(
        properties?: LicenseRequest.ContentIdentification.IWidevinePsshData,
      ): LicenseRequest.ContentIdentification.WidevinePsshData;

      /**
       * Encodes the specified WidevinePsshData message. Does not implicitly {@link LicenseRequest.ContentIdentification.WidevinePsshData.verify|verify} messages.
       * @param m WidevinePsshData message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: LicenseRequest.ContentIdentification.IWidevinePsshData,
        w?: $protobuf.Writer,
      ): $protobuf.Writer;

      /**
       * Encodes the specified WidevinePsshData message, length delimited. Does not implicitly {@link LicenseRequest.ContentIdentification.WidevinePsshData.verify|verify} messages.
       * @param message WidevinePsshData message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: LicenseRequest.ContentIdentification.IWidevinePsshData,
        writer?: $protobuf.Writer,
      ): $protobuf.Writer;

      /**
       * Decodes a WidevinePsshData message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns WidevinePsshData
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number,
      ): LicenseRequest.ContentIdentification.WidevinePsshData;

      /**
       * Decodes a WidevinePsshData message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns WidevinePsshData
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array,
      ): LicenseRequest.ContentIdentification.WidevinePsshData;

      /**
       * Creates a WidevinePsshData message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns WidevinePsshData
       */
      public static fromObject(d: {
        [k: string]: any;
      }): LicenseRequest.ContentIdentification.WidevinePsshData;

      /**
       * Creates a plain object from a WidevinePsshData message. Also converts values to other types if specified.
       * @param m WidevinePsshData
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: LicenseRequest.ContentIdentification.WidevinePsshData,
        o?: $protobuf.IConversionOptions,
      ): { [k: string]: any };

      /**
       * Converts this WidevinePsshData to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for WidevinePsshData
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a WebmKeyId. */
    interface IWebmKeyId {
      /** WebmKeyId header */
      header?: Uint8Array | null;

      /** WebmKeyId licenseType */
      licenseType?: LicenseType | null;

      /** WebmKeyId requestId */
      requestId?: Uint8Array | null;
    }

    /** Represents a WebmKeyId. */
    class WebmKeyId implements IWebmKeyId {
      /**
       * Constructs a new WebmKeyId.
       * @param [p] Properties to set
       */
      constructor(p?: LicenseRequest.ContentIdentification.IWebmKeyId);

      /** WebmKeyId header. */
      public header: Uint8Array;

      /** WebmKeyId licenseType. */
      public licenseType: LicenseType;

      /** WebmKeyId requestId. */
      public requestId: Uint8Array;

      /**
       * Creates a new WebmKeyId instance using the specified properties.
       * @param [properties] Properties to set
       * @returns WebmKeyId instance
       */
      public static create(
        properties?: LicenseRequest.ContentIdentification.IWebmKeyId,
      ): LicenseRequest.ContentIdentification.WebmKeyId;

      /**
       * Encodes the specified WebmKeyId message. Does not implicitly {@link LicenseRequest.ContentIdentification.WebmKeyId.verify|verify} messages.
       * @param m WebmKeyId message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: LicenseRequest.ContentIdentification.IWebmKeyId,
        w?: $protobuf.Writer,
      ): $protobuf.Writer;

      /**
       * Encodes the specified WebmKeyId message, length delimited. Does not implicitly {@link LicenseRequest.ContentIdentification.WebmKeyId.verify|verify} messages.
       * @param message WebmKeyId message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: LicenseRequest.ContentIdentification.IWebmKeyId,
        writer?: $protobuf.Writer,
      ): $protobuf.Writer;

      /**
       * Decodes a WebmKeyId message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns WebmKeyId
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number,
      ): LicenseRequest.ContentIdentification.WebmKeyId;

      /**
       * Decodes a WebmKeyId message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns WebmKeyId
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array,
      ): LicenseRequest.ContentIdentification.WebmKeyId;

      /**
       * Creates a WebmKeyId message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns WebmKeyId
       */
      public static fromObject(d: {
        [k: string]: any;
      }): LicenseRequest.ContentIdentification.WebmKeyId;

      /**
       * Creates a plain object from a WebmKeyId message. Also converts values to other types if specified.
       * @param m WebmKeyId
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: LicenseRequest.ContentIdentification.WebmKeyId,
        o?: $protobuf.IConversionOptions,
      ): { [k: string]: any };

      /**
       * Converts this WebmKeyId to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for WebmKeyId
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an ExistingLicense. */
    interface IExistingLicense {
      /** ExistingLicense licenseId */
      licenseId?: ILicenseIdentification | null;

      /** ExistingLicense secondsSinceStarted */
      secondsSinceStarted?: number | Long | null;

      /** ExistingLicense secondsSinceLastPlayed */
      secondsSinceLastPlayed?: number | Long | null;

      /** ExistingLicense sessionUsageTableEntry */
      sessionUsageTableEntry?: Uint8Array | null;
    }

    /** Represents an ExistingLicense. */
    class ExistingLicense implements IExistingLicense {
      /**
       * Constructs a new ExistingLicense.
       * @param [p] Properties to set
       */
      constructor(p?: LicenseRequest.ContentIdentification.IExistingLicense);

      /** ExistingLicense licenseId. */
      public licenseId?: ILicenseIdentification | null;

      /** ExistingLicense secondsSinceStarted. */
      public secondsSinceStarted: number | Long;

      /** ExistingLicense secondsSinceLastPlayed. */
      public secondsSinceLastPlayed: number | Long;

      /** ExistingLicense sessionUsageTableEntry. */
      public sessionUsageTableEntry: Uint8Array;

      /**
       * Creates a new ExistingLicense instance using the specified properties.
       * @param [properties] Properties to set
       * @returns ExistingLicense instance
       */
      public static create(
        properties?: LicenseRequest.ContentIdentification.IExistingLicense,
      ): LicenseRequest.ContentIdentification.ExistingLicense;

      /**
       * Encodes the specified ExistingLicense message. Does not implicitly {@link LicenseRequest.ContentIdentification.ExistingLicense.verify|verify} messages.
       * @param m ExistingLicense message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: LicenseRequest.ContentIdentification.IExistingLicense,
        w?: $protobuf.Writer,
      ): $protobuf.Writer;

      /**
       * Encodes the specified ExistingLicense message, length delimited. Does not implicitly {@link LicenseRequest.ContentIdentification.ExistingLicense.verify|verify} messages.
       * @param message ExistingLicense message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: LicenseRequest.ContentIdentification.IExistingLicense,
        writer?: $protobuf.Writer,
      ): $protobuf.Writer;

      /**
       * Decodes an ExistingLicense message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns ExistingLicense
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number,
      ): LicenseRequest.ContentIdentification.ExistingLicense;

      /**
       * Decodes an ExistingLicense message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns ExistingLicense
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array,
      ): LicenseRequest.ContentIdentification.ExistingLicense;

      /**
       * Creates an ExistingLicense message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns ExistingLicense
       */
      public static fromObject(d: {
        [k: string]: any;
      }): LicenseRequest.ContentIdentification.ExistingLicense;

      /**
       * Creates a plain object from an ExistingLicense message. Also converts values to other types if specified.
       * @param m ExistingLicense
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: LicenseRequest.ContentIdentification.ExistingLicense,
        o?: $protobuf.IConversionOptions,
      ): { [k: string]: any };

      /**
       * Converts this ExistingLicense to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for ExistingLicense
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an InitData. */
    interface IInitData {
      /** InitData initDataType */
      initDataType?: LicenseRequest.ContentIdentification.InitData.InitDataType | null;

      /** InitData initData */
      initData?: Uint8Array | null;

      /** InitData licenseType */
      licenseType?: LicenseType | null;

      /** InitData requestId */
      requestId?: Uint8Array | null;
    }

    /** Represents an InitData. */
    class InitData implements IInitData {
      /**
       * Constructs a new InitData.
       * @param [p] Properties to set
       */
      constructor(p?: LicenseRequest.ContentIdentification.IInitData);

      /** InitData initDataType. */
      public initDataType: LicenseRequest.ContentIdentification.InitData.InitDataType;

      /** InitData initData. */
      public initData: Uint8Array;

      /** InitData licenseType. */
      public licenseType: LicenseType;

      /** InitData requestId. */
      public requestId: Uint8Array;

      /**
       * Creates a new InitData instance using the specified properties.
       * @param [properties] Properties to set
       * @returns InitData instance
       */
      public static create(
        properties?: LicenseRequest.ContentIdentification.IInitData,
      ): LicenseRequest.ContentIdentification.InitData;

      /**
       * Encodes the specified InitData message. Does not implicitly {@link LicenseRequest.ContentIdentification.InitData.verify|verify} messages.
       * @param m InitData message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: LicenseRequest.ContentIdentification.IInitData,
        w?: $protobuf.Writer,
      ): $protobuf.Writer;

      /**
       * Encodes the specified InitData message, length delimited. Does not implicitly {@link LicenseRequest.ContentIdentification.InitData.verify|verify} messages.
       * @param message InitData message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: LicenseRequest.ContentIdentification.IInitData,
        writer?: $protobuf.Writer,
      ): $protobuf.Writer;

      /**
       * Decodes an InitData message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns InitData
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number,
      ): LicenseRequest.ContentIdentification.InitData;

      /**
       * Decodes an InitData message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns InitData
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array,
      ): LicenseRequest.ContentIdentification.InitData;

      /**
       * Creates an InitData message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns InitData
       */
      public static fromObject(d: {
        [k: string]: any;
      }): LicenseRequest.ContentIdentification.InitData;

      /**
       * Creates a plain object from an InitData message. Also converts values to other types if specified.
       * @param m InitData
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: LicenseRequest.ContentIdentification.InitData,
        o?: $protobuf.IConversionOptions,
      ): { [k: string]: any };

      /**
       * Converts this InitData to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for InitData
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    namespace InitData {
      /** InitDataType enum. */
      enum InitDataType {
        CENC = 1,
        WEBM = 2,
      }
    }
  }

  /** RequestType enum. */
  enum RequestType {
    NEW = 1,
    RENEWAL = 2,
    RELEASE = 3,
  }
}

/** Represents a MetricData. */
export class MetricData implements IMetricData {
  /**
   * Constructs a new MetricData.
   * @param [p] Properties to set
   */
  constructor(p?: IMetricData);

  /** MetricData stageName. */
  public stageName: string;

  /** MetricData metricData. */
  public metricData: MetricData.ITypeValue[];

  /**
   * Creates a new MetricData instance using the specified properties.
   * @param [properties] Properties to set
   * @returns MetricData instance
   */
  public static create(properties?: IMetricData): MetricData;

  /**
   * Encodes the specified MetricData message. Does not implicitly {@link MetricData.verify|verify} messages.
   * @param m MetricData message or plain object to encode
   * @param [w] Writer to encode to
   * @returns Writer
   */
  public static encode(m: IMetricData, w?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Encodes the specified MetricData message, length delimited. Does not implicitly {@link MetricData.verify|verify} messages.
   * @param message MetricData message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(
    message: IMetricData,
    writer?: $protobuf.Writer,
  ): $protobuf.Writer;

  /**
   * Decodes a MetricData message from the specified reader or buffer.
   * @param r Reader or buffer to decode from
   * @param [l] Message length if known beforehand
   * @returns MetricData
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(
    r: $protobuf.Reader | Uint8Array,
    l?: number,
  ): MetricData;

  /**
   * Decodes a MetricData message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns MetricData
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(
    reader: $protobuf.Reader | Uint8Array,
  ): MetricData;

  /**
   * Creates a MetricData message from a plain object. Also converts values to their respective internal types.
   * @param d Plain object
   * @returns MetricData
   */
  public static fromObject(d: { [k: string]: any }): MetricData;

  /**
   * Creates a plain object from a MetricData message. Also converts values to other types if specified.
   * @param m MetricData
   * @param [o] Conversion options
   * @returns Plain object
   */
  public static toObject(
    m: MetricData,
    o?: $protobuf.IConversionOptions,
  ): { [k: string]: any };

  /**
   * Converts this MetricData to JSON.
   * @returns JSON object
   */
  public toJSON(): { [k: string]: any };

  /**
   * Gets the default type url for MetricData
   * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns The default type url
   */
  public static getTypeUrl(typeUrlPrefix?: string): string;
}

export namespace MetricData {
  /** MetricType enum. */
  enum MetricType {
    LATENCY = 1,
    TIMESTAMP = 2,
  }

  /** Properties of a TypeValue. */
  interface ITypeValue {
    /** TypeValue type */
    type?: MetricData.MetricType | null;

    /** TypeValue value */
    value?: number | Long | null;
  }

  /** Represents a TypeValue. */
  class TypeValue implements ITypeValue {
    /**
     * Constructs a new TypeValue.
     * @param [p] Properties to set
     */
    constructor(p?: MetricData.ITypeValue);

    /** TypeValue type. */
    public type: MetricData.MetricType;

    /** TypeValue value. */
    public value: number | Long;

    /**
     * Creates a new TypeValue instance using the specified properties.
     * @param [properties] Properties to set
     * @returns TypeValue instance
     */
    public static create(
      properties?: MetricData.ITypeValue,
    ): MetricData.TypeValue;

    /**
     * Encodes the specified TypeValue message. Does not implicitly {@link MetricData.TypeValue.verify|verify} messages.
     * @param m TypeValue message or plain object to encode
     * @param [w] Writer to encode to
     * @returns Writer
     */
    public static encode(
      m: MetricData.ITypeValue,
      w?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Encodes the specified TypeValue message, length delimited. Does not implicitly {@link MetricData.TypeValue.verify|verify} messages.
     * @param message TypeValue message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: MetricData.ITypeValue,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a TypeValue message from the specified reader or buffer.
     * @param r Reader or buffer to decode from
     * @param [l] Message length if known beforehand
     * @returns TypeValue
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      r: $protobuf.Reader | Uint8Array,
      l?: number,
    ): MetricData.TypeValue;

    /**
     * Decodes a TypeValue message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns TypeValue
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array,
    ): MetricData.TypeValue;

    /**
     * Creates a TypeValue message from a plain object. Also converts values to their respective internal types.
     * @param d Plain object
     * @returns TypeValue
     */
    public static fromObject(d: { [k: string]: any }): MetricData.TypeValue;

    /**
     * Creates a plain object from a TypeValue message. Also converts values to other types if specified.
     * @param m TypeValue
     * @param [o] Conversion options
     * @returns Plain object
     */
    public static toObject(
      m: MetricData.TypeValue,
      o?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this TypeValue to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for TypeValue
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
  }
}

/** Represents a VersionInfo. */
export class VersionInfo implements IVersionInfo {
  /**
   * Constructs a new VersionInfo.
   * @param [p] Properties to set
   */
  constructor(p?: IVersionInfo);

  /** VersionInfo licenseSdkVersion. */
  public licenseSdkVersion: string;

  /** VersionInfo licenseServiceVersion. */
  public licenseServiceVersion: string;

  /**
   * Creates a new VersionInfo instance using the specified properties.
   * @param [properties] Properties to set
   * @returns VersionInfo instance
   */
  public static create(properties?: IVersionInfo): VersionInfo;

  /**
   * Encodes the specified VersionInfo message. Does not implicitly {@link VersionInfo.verify|verify} messages.
   * @param m VersionInfo message or plain object to encode
   * @param [w] Writer to encode to
   * @returns Writer
   */
  public static encode(m: IVersionInfo, w?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Encodes the specified VersionInfo message, length delimited. Does not implicitly {@link VersionInfo.verify|verify} messages.
   * @param message VersionInfo message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(
    message: IVersionInfo,
    writer?: $protobuf.Writer,
  ): $protobuf.Writer;

  /**
   * Decodes a VersionInfo message from the specified reader or buffer.
   * @param r Reader or buffer to decode from
   * @param [l] Message length if known beforehand
   * @returns VersionInfo
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(
    r: $protobuf.Reader | Uint8Array,
    l?: number,
  ): VersionInfo;

  /**
   * Decodes a VersionInfo message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns VersionInfo
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(
    reader: $protobuf.Reader | Uint8Array,
  ): VersionInfo;

  /**
   * Creates a VersionInfo message from a plain object. Also converts values to their respective internal types.
   * @param d Plain object
   * @returns VersionInfo
   */
  public static fromObject(d: { [k: string]: any }): VersionInfo;

  /**
   * Creates a plain object from a VersionInfo message. Also converts values to other types if specified.
   * @param m VersionInfo
   * @param [o] Conversion options
   * @returns Plain object
   */
  public static toObject(
    m: VersionInfo,
    o?: $protobuf.IConversionOptions,
  ): { [k: string]: any };

  /**
   * Converts this VersionInfo to JSON.
   * @returns JSON object
   */
  public toJSON(): { [k: string]: any };

  /**
   * Gets the default type url for VersionInfo
   * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns The default type url
   */
  public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a SignedMessage. */
export class SignedMessage implements ISignedMessage {
  /**
   * Constructs a new SignedMessage.
   * @param [p] Properties to set
   */
  constructor(p?: ISignedMessage);

  /** SignedMessage type. */
  public type: SignedMessage.MessageType;

  /** SignedMessage msg. */
  public msg: Uint8Array;

  /** SignedMessage signature. */
  public signature: Uint8Array;

  /** SignedMessage sessionKey. */
  public sessionKey: Uint8Array;

  /** SignedMessage remoteAttestation. */
  public remoteAttestation: Uint8Array;

  /** SignedMessage metricData. */
  public metricData: IMetricData[];

  /** SignedMessage serviceVersionInfo. */
  public serviceVersionInfo?: IVersionInfo | null;

  /** SignedMessage sessionKeyType. */
  public sessionKeyType: SignedMessage.SessionKeyType;

  /** SignedMessage oemcryptoCoreMessage. */
  public oemcryptoCoreMessage: Uint8Array;

  /**
   * Creates a new SignedMessage instance using the specified properties.
   * @param [properties] Properties to set
   * @returns SignedMessage instance
   */
  public static create(properties?: ISignedMessage): SignedMessage;

  /**
   * Encodes the specified SignedMessage message. Does not implicitly {@link SignedMessage.verify|verify} messages.
   * @param m SignedMessage message or plain object to encode
   * @param [w] Writer to encode to
   * @returns Writer
   */
  public static encode(
    m: ISignedMessage,
    w?: $protobuf.Writer,
  ): $protobuf.Writer;

  /**
   * Encodes the specified SignedMessage message, length delimited. Does not implicitly {@link SignedMessage.verify|verify} messages.
   * @param message SignedMessage message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(
    message: ISignedMessage,
    writer?: $protobuf.Writer,
  ): $protobuf.Writer;

  /**
   * Decodes a SignedMessage message from the specified reader or buffer.
   * @param r Reader or buffer to decode from
   * @param [l] Message length if known beforehand
   * @returns SignedMessage
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(
    r: $protobuf.Reader | Uint8Array,
    l?: number,
  ): SignedMessage;

  /**
   * Decodes a SignedMessage message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns SignedMessage
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(
    reader: $protobuf.Reader | Uint8Array,
  ): SignedMessage;

  /**
   * Creates a SignedMessage message from a plain object. Also converts values to their respective internal types.
   * @param d Plain object
   * @returns SignedMessage
   */
  public static fromObject(d: { [k: string]: any }): SignedMessage;

  /**
   * Creates a plain object from a SignedMessage message. Also converts values to other types if specified.
   * @param m SignedMessage
   * @param [o] Conversion options
   * @returns Plain object
   */
  public static toObject(
    m: SignedMessage,
    o?: $protobuf.IConversionOptions,
  ): { [k: string]: any };

  /**
   * Converts this SignedMessage to JSON.
   * @returns JSON object
   */
  public toJSON(): { [k: string]: any };

  /**
   * Gets the default type url for SignedMessage
   * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns The default type url
   */
  public static getTypeUrl(typeUrlPrefix?: string): string;
}

export namespace SignedMessage {
  /** MessageType enum. */
  enum MessageType {
    LICENSE_REQUEST = 1,
    LICENSE = 2,
    ERROR_RESPONSE = 3,
    SERVICE_CERTIFICATE_REQUEST = 4,
    SERVICE_CERTIFICATE = 5,
    SUB_LICENSE = 6,
    CAS_LICENSE_REQUEST = 7,
    CAS_LICENSE = 8,
    EXTERNAL_LICENSE_REQUEST = 9,
    EXTERNAL_LICENSE = 10,
  }

  /** SessionKeyType enum. */
  enum SessionKeyType {
    UNDEFINED = 0,
    WRAPPED_AES_KEY = 1,
    EPHERMERAL_ECC_PUBLIC_KEY = 2,
  }
}

/** HashAlgorithmProto enum. */
export enum HashAlgorithmProto {
  HASH_ALGORITHM_UNSPECIFIED = 0,
  HASH_ALGORITHM_SHA_1 = 1,
  HASH_ALGORITHM_SHA_256 = 2,
  HASH_ALGORITHM_SHA_384 = 3,
}

/** Represents a ClientIdentification. */
export class ClientIdentification implements IClientIdentification {
  /**
   * Constructs a new ClientIdentification.
   * @param [p] Properties to set
   */
  constructor(p?: IClientIdentification);

  /** ClientIdentification type. */
  public type: ClientIdentification.TokenType;

  /** ClientIdentification token. */
  public token: Uint8Array;

  /** ClientIdentification clientInfo. */
  public clientInfo: ClientIdentification.INameValue[];

  /** ClientIdentification providerClientToken. */
  public providerClientToken: Uint8Array;

  /** ClientIdentification licenseCounter. */
  public licenseCounter: number;

  /** ClientIdentification clientCapabilities. */
  public clientCapabilities?: ClientIdentification.IClientCapabilities | null;

  /** ClientIdentification vmpData. */
  public vmpData: Uint8Array;

  /** ClientIdentification deviceCredentials. */
  public deviceCredentials: ClientIdentification.IClientCredentials[];

  /**
   * Creates a new ClientIdentification instance using the specified properties.
   * @param [properties] Properties to set
   * @returns ClientIdentification instance
   */
  public static create(
    properties?: IClientIdentification,
  ): ClientIdentification;

  /**
   * Encodes the specified ClientIdentification message. Does not implicitly {@link ClientIdentification.verify|verify} messages.
   * @param m ClientIdentification message or plain object to encode
   * @param [w] Writer to encode to
   * @returns Writer
   */
  public static encode(
    m: IClientIdentification,
    w?: $protobuf.Writer,
  ): $protobuf.Writer;

  /**
   * Encodes the specified ClientIdentification message, length delimited. Does not implicitly {@link ClientIdentification.verify|verify} messages.
   * @param message ClientIdentification message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(
    message: IClientIdentification,
    writer?: $protobuf.Writer,
  ): $protobuf.Writer;

  /**
   * Decodes a ClientIdentification message from the specified reader or buffer.
   * @param r Reader or buffer to decode from
   * @param [l] Message length if known beforehand
   * @returns ClientIdentification
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(
    r: $protobuf.Reader | Uint8Array,
    l?: number,
  ): ClientIdentification;

  /**
   * Decodes a ClientIdentification message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns ClientIdentification
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(
    reader: $protobuf.Reader | Uint8Array,
  ): ClientIdentification;

  /**
   * Creates a ClientIdentification message from a plain object. Also converts values to their respective internal types.
   * @param d Plain object
   * @returns ClientIdentification
   */
  public static fromObject(d: { [k: string]: any }): ClientIdentification;

  /**
   * Creates a plain object from a ClientIdentification message. Also converts values to other types if specified.
   * @param m ClientIdentification
   * @param [o] Conversion options
   * @returns Plain object
   */
  public static toObject(
    m: ClientIdentification,
    o?: $protobuf.IConversionOptions,
  ): { [k: string]: any };

  /**
   * Converts this ClientIdentification to JSON.
   * @returns JSON object
   */
  public toJSON(): { [k: string]: any };

  /**
   * Gets the default type url for ClientIdentification
   * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns The default type url
   */
  public static getTypeUrl(typeUrlPrefix?: string): string;
}

export namespace ClientIdentification {
  /** TokenType enum. */
  enum TokenType {
    KEYBOX = 0,
    DRM_DEVICE_CERTIFICATE = 1,
    REMOTE_ATTESTATION_CERTIFICATE = 2,
    OEM_DEVICE_CERTIFICATE = 3,
  }

  /** Properties of a NameValue. */
  interface INameValue {
    /** NameValue name */
    name?: string | null;

    /** NameValue value */
    value?: string | null;
  }

  /** Represents a NameValue. */
  class NameValue implements INameValue {
    /**
     * Constructs a new NameValue.
     * @param [p] Properties to set
     */
    constructor(p?: ClientIdentification.INameValue);

    /** NameValue name. */
    public name: string;

    /** NameValue value. */
    public value: string;

    /**
     * Creates a new NameValue instance using the specified properties.
     * @param [properties] Properties to set
     * @returns NameValue instance
     */
    public static create(
      properties?: ClientIdentification.INameValue,
    ): ClientIdentification.NameValue;

    /**
     * Encodes the specified NameValue message. Does not implicitly {@link ClientIdentification.NameValue.verify|verify} messages.
     * @param m NameValue message or plain object to encode
     * @param [w] Writer to encode to
     * @returns Writer
     */
    public static encode(
      m: ClientIdentification.INameValue,
      w?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Encodes the specified NameValue message, length delimited. Does not implicitly {@link ClientIdentification.NameValue.verify|verify} messages.
     * @param message NameValue message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: ClientIdentification.INameValue,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a NameValue message from the specified reader or buffer.
     * @param r Reader or buffer to decode from
     * @param [l] Message length if known beforehand
     * @returns NameValue
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      r: $protobuf.Reader | Uint8Array,
      l?: number,
    ): ClientIdentification.NameValue;

    /**
     * Decodes a NameValue message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns NameValue
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array,
    ): ClientIdentification.NameValue;

    /**
     * Creates a NameValue message from a plain object. Also converts values to their respective internal types.
     * @param d Plain object
     * @returns NameValue
     */
    public static fromObject(d: {
      [k: string]: any;
    }): ClientIdentification.NameValue;

    /**
     * Creates a plain object from a NameValue message. Also converts values to other types if specified.
     * @param m NameValue
     * @param [o] Conversion options
     * @returns Plain object
     */
    public static toObject(
      m: ClientIdentification.NameValue,
      o?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this NameValue to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for NameValue
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
  }

  /** Properties of a ClientCapabilities. */
  interface IClientCapabilities {
    /** ClientCapabilities clientToken */
    clientToken?: boolean | null;

    /** ClientCapabilities sessionToken */
    sessionToken?: boolean | null;

    /** ClientCapabilities videoResolutionConstraints */
    videoResolutionConstraints?: boolean | null;

    /** ClientCapabilities maxHdcpVersion */
    maxHdcpVersion?: ClientIdentification.ClientCapabilities.HdcpVersion | null;

    /** ClientCapabilities oemCryptoApiVersion */
    oemCryptoApiVersion?: number | null;

    /** ClientCapabilities antiRollbackUsageTable */
    antiRollbackUsageTable?: boolean | null;

    /** ClientCapabilities srmVersion */
    srmVersion?: number | null;

    /** ClientCapabilities canUpdateSrm */
    canUpdateSrm?: boolean | null;

    /** ClientCapabilities supportedCertificateKeyType */
    supportedCertificateKeyType?:
      | ClientIdentification.ClientCapabilities.CertificateKeyType[]
      | null;

    /** ClientCapabilities analogOutputCapabilities */
    analogOutputCapabilities?: ClientIdentification.ClientCapabilities.AnalogOutputCapabilities | null;

    /** ClientCapabilities canDisableAnalogOutput */
    canDisableAnalogOutput?: boolean | null;

    /** ClientCapabilities resourceRatingTier */
    resourceRatingTier?: number | null;
  }

  /** Represents a ClientCapabilities. */
  class ClientCapabilities implements IClientCapabilities {
    /**
     * Constructs a new ClientCapabilities.
     * @param [p] Properties to set
     */
    constructor(p?: ClientIdentification.IClientCapabilities);

    /** ClientCapabilities clientToken. */
    public clientToken: boolean;

    /** ClientCapabilities sessionToken. */
    public sessionToken: boolean;

    /** ClientCapabilities videoResolutionConstraints. */
    public videoResolutionConstraints: boolean;

    /** ClientCapabilities maxHdcpVersion. */
    public maxHdcpVersion: ClientIdentification.ClientCapabilities.HdcpVersion;

    /** ClientCapabilities oemCryptoApiVersion. */
    public oemCryptoApiVersion: number;

    /** ClientCapabilities antiRollbackUsageTable. */
    public antiRollbackUsageTable: boolean;

    /** ClientCapabilities srmVersion. */
    public srmVersion: number;

    /** ClientCapabilities canUpdateSrm. */
    public canUpdateSrm: boolean;

    /** ClientCapabilities supportedCertificateKeyType. */
    public supportedCertificateKeyType: ClientIdentification.ClientCapabilities.CertificateKeyType[];

    /** ClientCapabilities analogOutputCapabilities. */
    public analogOutputCapabilities: ClientIdentification.ClientCapabilities.AnalogOutputCapabilities;

    /** ClientCapabilities canDisableAnalogOutput. */
    public canDisableAnalogOutput: boolean;

    /** ClientCapabilities resourceRatingTier. */
    public resourceRatingTier: number;

    /**
     * Creates a new ClientCapabilities instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ClientCapabilities instance
     */
    public static create(
      properties?: ClientIdentification.IClientCapabilities,
    ): ClientIdentification.ClientCapabilities;

    /**
     * Encodes the specified ClientCapabilities message. Does not implicitly {@link ClientIdentification.ClientCapabilities.verify|verify} messages.
     * @param m ClientCapabilities message or plain object to encode
     * @param [w] Writer to encode to
     * @returns Writer
     */
    public static encode(
      m: ClientIdentification.IClientCapabilities,
      w?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Encodes the specified ClientCapabilities message, length delimited. Does not implicitly {@link ClientIdentification.ClientCapabilities.verify|verify} messages.
     * @param message ClientCapabilities message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: ClientIdentification.IClientCapabilities,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a ClientCapabilities message from the specified reader or buffer.
     * @param r Reader or buffer to decode from
     * @param [l] Message length if known beforehand
     * @returns ClientCapabilities
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      r: $protobuf.Reader | Uint8Array,
      l?: number,
    ): ClientIdentification.ClientCapabilities;

    /**
     * Decodes a ClientCapabilities message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ClientCapabilities
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array,
    ): ClientIdentification.ClientCapabilities;

    /**
     * Creates a ClientCapabilities message from a plain object. Also converts values to their respective internal types.
     * @param d Plain object
     * @returns ClientCapabilities
     */
    public static fromObject(d: {
      [k: string]: any;
    }): ClientIdentification.ClientCapabilities;

    /**
     * Creates a plain object from a ClientCapabilities message. Also converts values to other types if specified.
     * @param m ClientCapabilities
     * @param [o] Conversion options
     * @returns Plain object
     */
    public static toObject(
      m: ClientIdentification.ClientCapabilities,
      o?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this ClientCapabilities to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for ClientCapabilities
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
  }

  namespace ClientCapabilities {
    /** HdcpVersion enum. */
    enum HdcpVersion {
      HDCP_NONE = 0,
      HDCP_V1 = 1,
      HDCP_V2 = 2,
      HDCP_V2_1 = 3,
      HDCP_V2_2 = 4,
      HDCP_V2_3 = 5,
      HDCP_NO_DIGITAL_OUTPUT = 255,
    }

    /** CertificateKeyType enum. */
    enum CertificateKeyType {
      RSA_2048 = 0,
      RSA_3072 = 1,
      ECC_SECP256R1 = 2,
      ECC_SECP384R1 = 3,
      ECC_SECP521R1 = 4,
    }

    /** AnalogOutputCapabilities enum. */
    enum AnalogOutputCapabilities {
      ANALOG_OUTPUT_UNKNOWN = 0,
      ANALOG_OUTPUT_NONE = 1,
      ANALOG_OUTPUT_SUPPORTED = 2,
      ANALOG_OUTPUT_SUPPORTS_CGMS_A = 3,
    }
  }

  /** Properties of a ClientCredentials. */
  interface IClientCredentials {
    /** ClientCredentials type */
    type?: ClientIdentification.TokenType | null;

    /** ClientCredentials token */
    token?: Uint8Array | null;
  }

  /** Represents a ClientCredentials. */
  class ClientCredentials implements IClientCredentials {
    /**
     * Constructs a new ClientCredentials.
     * @param [p] Properties to set
     */
    constructor(p?: ClientIdentification.IClientCredentials);

    /** ClientCredentials type. */
    public type: ClientIdentification.TokenType;

    /** ClientCredentials token. */
    public token: Uint8Array;

    /**
     * Creates a new ClientCredentials instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ClientCredentials instance
     */
    public static create(
      properties?: ClientIdentification.IClientCredentials,
    ): ClientIdentification.ClientCredentials;

    /**
     * Encodes the specified ClientCredentials message. Does not implicitly {@link ClientIdentification.ClientCredentials.verify|verify} messages.
     * @param m ClientCredentials message or plain object to encode
     * @param [w] Writer to encode to
     * @returns Writer
     */
    public static encode(
      m: ClientIdentification.IClientCredentials,
      w?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Encodes the specified ClientCredentials message, length delimited. Does not implicitly {@link ClientIdentification.ClientCredentials.verify|verify} messages.
     * @param message ClientCredentials message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: ClientIdentification.IClientCredentials,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a ClientCredentials message from the specified reader or buffer.
     * @param r Reader or buffer to decode from
     * @param [l] Message length if known beforehand
     * @returns ClientCredentials
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      r: $protobuf.Reader | Uint8Array,
      l?: number,
    ): ClientIdentification.ClientCredentials;

    /**
     * Decodes a ClientCredentials message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ClientCredentials
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array,
    ): ClientIdentification.ClientCredentials;

    /**
     * Creates a ClientCredentials message from a plain object. Also converts values to their respective internal types.
     * @param d Plain object
     * @returns ClientCredentials
     */
    public static fromObject(d: {
      [k: string]: any;
    }): ClientIdentification.ClientCredentials;

    /**
     * Creates a plain object from a ClientCredentials message. Also converts values to other types if specified.
     * @param m ClientCredentials
     * @param [o] Conversion options
     * @returns Plain object
     */
    public static toObject(
      m: ClientIdentification.ClientCredentials,
      o?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this ClientCredentials to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for ClientCredentials
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
  }
}

/** Represents an EncryptedClientIdentification. */
export class EncryptedClientIdentification
  implements IEncryptedClientIdentification
{
  /**
   * Constructs a new EncryptedClientIdentification.
   * @param [p] Properties to set
   */
  constructor(p?: IEncryptedClientIdentification);

  /** EncryptedClientIdentification providerId. */
  public providerId: string;

  /** EncryptedClientIdentification serviceCertificateSerialNumber. */
  public serviceCertificateSerialNumber: Uint8Array;

  /** EncryptedClientIdentification encryptedClientId. */
  public encryptedClientId: Uint8Array;

  /** EncryptedClientIdentification encryptedClientIdIv. */
  public encryptedClientIdIv: Uint8Array;

  /** EncryptedClientIdentification encryptedPrivacyKey. */
  public encryptedPrivacyKey: Uint8Array;

  /**
   * Creates a new EncryptedClientIdentification instance using the specified properties.
   * @param [properties] Properties to set
   * @returns EncryptedClientIdentification instance
   */
  public static create(
    properties?: IEncryptedClientIdentification,
  ): EncryptedClientIdentification;

  /**
   * Encodes the specified EncryptedClientIdentification message. Does not implicitly {@link EncryptedClientIdentification.verify|verify} messages.
   * @param m EncryptedClientIdentification message or plain object to encode
   * @param [w] Writer to encode to
   * @returns Writer
   */
  public static encode(
    m: IEncryptedClientIdentification,
    w?: $protobuf.Writer,
  ): $protobuf.Writer;

  /**
   * Encodes the specified EncryptedClientIdentification message, length delimited. Does not implicitly {@link EncryptedClientIdentification.verify|verify} messages.
   * @param message EncryptedClientIdentification message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(
    message: IEncryptedClientIdentification,
    writer?: $protobuf.Writer,
  ): $protobuf.Writer;

  /**
   * Decodes an EncryptedClientIdentification message from the specified reader or buffer.
   * @param r Reader or buffer to decode from
   * @param [l] Message length if known beforehand
   * @returns EncryptedClientIdentification
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(
    r: $protobuf.Reader | Uint8Array,
    l?: number,
  ): EncryptedClientIdentification;

  /**
   * Decodes an EncryptedClientIdentification message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns EncryptedClientIdentification
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(
    reader: $protobuf.Reader | Uint8Array,
  ): EncryptedClientIdentification;

  /**
   * Creates an EncryptedClientIdentification message from a plain object. Also converts values to their respective internal types.
   * @param d Plain object
   * @returns EncryptedClientIdentification
   */
  public static fromObject(d: {
    [k: string]: any;
  }): EncryptedClientIdentification;

  /**
   * Creates a plain object from an EncryptedClientIdentification message. Also converts values to other types if specified.
   * @param m EncryptedClientIdentification
   * @param [o] Conversion options
   * @returns Plain object
   */
  public static toObject(
    m: EncryptedClientIdentification,
    o?: $protobuf.IConversionOptions,
  ): { [k: string]: any };

  /**
   * Converts this EncryptedClientIdentification to JSON.
   * @returns JSON object
   */
  public toJSON(): { [k: string]: any };

  /**
   * Gets the default type url for EncryptedClientIdentification
   * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns The default type url
   */
  public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a LicenseError. */
export class LicenseError implements ILicenseError {
  /**
   * Constructs a new LicenseError.
   * @param [p] Properties to set
   */
  constructor(p?: ILicenseError);

  /** LicenseError errorCode. */
  public errorCode: LicenseError.Error;

  /**
   * Creates a new LicenseError instance using the specified properties.
   * @param [properties] Properties to set
   * @returns LicenseError instance
   */
  public static create(properties?: ILicenseError): LicenseError;

  /**
   * Encodes the specified LicenseError message. Does not implicitly {@link LicenseError.verify|verify} messages.
   * @param m LicenseError message or plain object to encode
   * @param [w] Writer to encode to
   * @returns Writer
   */
  public static encode(
    m: ILicenseError,
    w?: $protobuf.Writer,
  ): $protobuf.Writer;

  /**
   * Encodes the specified LicenseError message, length delimited. Does not implicitly {@link LicenseError.verify|verify} messages.
   * @param message LicenseError message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(
    message: ILicenseError,
    writer?: $protobuf.Writer,
  ): $protobuf.Writer;

  /**
   * Decodes a LicenseError message from the specified reader or buffer.
   * @param r Reader or buffer to decode from
   * @param [l] Message length if known beforehand
   * @returns LicenseError
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(
    r: $protobuf.Reader | Uint8Array,
    l?: number,
  ): LicenseError;

  /**
   * Decodes a LicenseError message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns LicenseError
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(
    reader: $protobuf.Reader | Uint8Array,
  ): LicenseError;

  /**
   * Creates a LicenseError message from a plain object. Also converts values to their respective internal types.
   * @param d Plain object
   * @returns LicenseError
   */
  public static fromObject(d: { [k: string]: any }): LicenseError;

  /**
   * Creates a plain object from a LicenseError message. Also converts values to other types if specified.
   * @param m LicenseError
   * @param [o] Conversion options
   * @returns Plain object
   */
  public static toObject(
    m: LicenseError,
    o?: $protobuf.IConversionOptions,
  ): { [k: string]: any };

  /**
   * Converts this LicenseError to JSON.
   * @returns JSON object
   */
  public toJSON(): { [k: string]: any };

  /**
   * Gets the default type url for LicenseError
   * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns The default type url
   */
  public static getTypeUrl(typeUrlPrefix?: string): string;
}

export namespace LicenseError {
  /** Error enum. */
  enum Error {
    INVALID_DEVICE_CERTIFICATE = 1,
    REVOKED_DEVICE_CERTIFICATE = 2,
    SERVICE_UNAVAILABLE = 3,
  }
}

/** Represents a DrmCertificate. */
export class DrmCertificate implements IDrmCertificate {
  /**
   * Constructs a new DrmCertificate.
   * @param [p] Properties to set
   */
  constructor(p?: IDrmCertificate);

  /** DrmCertificate type. */
  public type: DrmCertificate.Type;

  /** DrmCertificate serialNumber. */
  public serialNumber: Uint8Array;

  /** DrmCertificate creationTimeSeconds. */
  public creationTimeSeconds: number;

  /** DrmCertificate expirationTimeSeconds. */
  public expirationTimeSeconds: number;

  /** DrmCertificate publicKey. */
  public publicKey: Uint8Array;

  /** DrmCertificate systemId. */
  public systemId: number;

  /** DrmCertificate testDeviceDeprecated. */
  public testDeviceDeprecated: boolean;

  /** DrmCertificate providerId. */
  public providerId: string;

  /** DrmCertificate serviceTypes. */
  public serviceTypes: DrmCertificate.ServiceType[];

  /** DrmCertificate algorithm. */
  public algorithm: DrmCertificate.Algorithm;

  /** DrmCertificate rotId. */
  public rotId: Uint8Array;

  /** DrmCertificate encryptionKey. */
  public encryptionKey?: DrmCertificate.IEncryptionKey | null;

  /**
   * Creates a new DrmCertificate instance using the specified properties.
   * @param [properties] Properties to set
   * @returns DrmCertificate instance
   */
  public static create(properties?: IDrmCertificate): DrmCertificate;

  /**
   * Encodes the specified DrmCertificate message. Does not implicitly {@link DrmCertificate.verify|verify} messages.
   * @param m DrmCertificate message or plain object to encode
   * @param [w] Writer to encode to
   * @returns Writer
   */
  public static encode(
    m: IDrmCertificate,
    w?: $protobuf.Writer,
  ): $protobuf.Writer;

  /**
   * Encodes the specified DrmCertificate message, length delimited. Does not implicitly {@link DrmCertificate.verify|verify} messages.
   * @param message DrmCertificate message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(
    message: IDrmCertificate,
    writer?: $protobuf.Writer,
  ): $protobuf.Writer;

  /**
   * Decodes a DrmCertificate message from the specified reader or buffer.
   * @param r Reader or buffer to decode from
   * @param [l] Message length if known beforehand
   * @returns DrmCertificate
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(
    r: $protobuf.Reader | Uint8Array,
    l?: number,
  ): DrmCertificate;

  /**
   * Decodes a DrmCertificate message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns DrmCertificate
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(
    reader: $protobuf.Reader | Uint8Array,
  ): DrmCertificate;

  /**
   * Creates a DrmCertificate message from a plain object. Also converts values to their respective internal types.
   * @param d Plain object
   * @returns DrmCertificate
   */
  public static fromObject(d: { [k: string]: any }): DrmCertificate;

  /**
   * Creates a plain object from a DrmCertificate message. Also converts values to other types if specified.
   * @param m DrmCertificate
   * @param [o] Conversion options
   * @returns Plain object
   */
  public static toObject(
    m: DrmCertificate,
    o?: $protobuf.IConversionOptions,
  ): { [k: string]: any };

  /**
   * Converts this DrmCertificate to JSON.
   * @returns JSON object
   */
  public toJSON(): { [k: string]: any };

  /**
   * Gets the default type url for DrmCertificate
   * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns The default type url
   */
  public static getTypeUrl(typeUrlPrefix?: string): string;
}

export namespace DrmCertificate {
  /** Type enum. */
  enum Type {
    ROOT = 0,
    DEVICE_MODEL = 1,
    DEVICE = 2,
    SERVICE = 3,
    PROVISIONER = 4,
  }

  /** ServiceType enum. */
  enum ServiceType {
    UNKNOWN_SERVICE_TYPE = 0,
    LICENSE_SERVER_SDK = 1,
    LICENSE_SERVER_PROXY_SDK = 2,
    PROVISIONING_SDK = 3,
    CAS_PROXY_SDK = 4,
  }

  /** Algorithm enum. */
  enum Algorithm {
    UNKNOWN_ALGORITHM = 0,
    RSA = 1,
    ECC_SECP256R1 = 2,
    ECC_SECP384R1 = 3,
    ECC_SECP521R1 = 4,
  }

  /** Properties of an EncryptionKey. */
  interface IEncryptionKey {
    /** EncryptionKey publicKey */
    publicKey?: Uint8Array | null;

    /** EncryptionKey algorithm */
    algorithm?: DrmCertificate.Algorithm | null;
  }

  /** Represents an EncryptionKey. */
  class EncryptionKey implements IEncryptionKey {
    /**
     * Constructs a new EncryptionKey.
     * @param [p] Properties to set
     */
    constructor(p?: DrmCertificate.IEncryptionKey);

    /** EncryptionKey publicKey. */
    public publicKey: Uint8Array;

    /** EncryptionKey algorithm. */
    public algorithm: DrmCertificate.Algorithm;

    /**
     * Creates a new EncryptionKey instance using the specified properties.
     * @param [properties] Properties to set
     * @returns EncryptionKey instance
     */
    public static create(
      properties?: DrmCertificate.IEncryptionKey,
    ): DrmCertificate.EncryptionKey;

    /**
     * Encodes the specified EncryptionKey message. Does not implicitly {@link DrmCertificate.EncryptionKey.verify|verify} messages.
     * @param m EncryptionKey message or plain object to encode
     * @param [w] Writer to encode to
     * @returns Writer
     */
    public static encode(
      m: DrmCertificate.IEncryptionKey,
      w?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Encodes the specified EncryptionKey message, length delimited. Does not implicitly {@link DrmCertificate.EncryptionKey.verify|verify} messages.
     * @param message EncryptionKey message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: DrmCertificate.IEncryptionKey,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes an EncryptionKey message from the specified reader or buffer.
     * @param r Reader or buffer to decode from
     * @param [l] Message length if known beforehand
     * @returns EncryptionKey
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      r: $protobuf.Reader | Uint8Array,
      l?: number,
    ): DrmCertificate.EncryptionKey;

    /**
     * Decodes an EncryptionKey message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns EncryptionKey
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array,
    ): DrmCertificate.EncryptionKey;

    /**
     * Creates an EncryptionKey message from a plain object. Also converts values to their respective internal types.
     * @param d Plain object
     * @returns EncryptionKey
     */
    public static fromObject(d: {
      [k: string]: any;
    }): DrmCertificate.EncryptionKey;

    /**
     * Creates a plain object from an EncryptionKey message. Also converts values to other types if specified.
     * @param m EncryptionKey
     * @param [o] Conversion options
     * @returns Plain object
     */
    public static toObject(
      m: DrmCertificate.EncryptionKey,
      o?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this EncryptionKey to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for EncryptionKey
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
  }
}

/** Represents a SignedDrmCertificate. */
export class SignedDrmCertificate implements ISignedDrmCertificate {
  /**
   * Constructs a new SignedDrmCertificate.
   * @param [p] Properties to set
   */
  constructor(p?: ISignedDrmCertificate);

  /** SignedDrmCertificate drmCertificate. */
  public drmCertificate: Uint8Array;

  /** SignedDrmCertificate signature. */
  public signature: Uint8Array;

  /** SignedDrmCertificate signer. */
  public signer?: ISignedDrmCertificate | null;

  /** SignedDrmCertificate hashAlgorithm. */
  public hashAlgorithm: HashAlgorithmProto;

  /**
   * Creates a new SignedDrmCertificate instance using the specified properties.
   * @param [properties] Properties to set
   * @returns SignedDrmCertificate instance
   */
  public static create(
    properties?: ISignedDrmCertificate,
  ): SignedDrmCertificate;

  /**
   * Encodes the specified SignedDrmCertificate message. Does not implicitly {@link SignedDrmCertificate.verify|verify} messages.
   * @param m SignedDrmCertificate message or plain object to encode
   * @param [w] Writer to encode to
   * @returns Writer
   */
  public static encode(
    m: ISignedDrmCertificate,
    w?: $protobuf.Writer,
  ): $protobuf.Writer;

  /**
   * Encodes the specified SignedDrmCertificate message, length delimited. Does not implicitly {@link SignedDrmCertificate.verify|verify} messages.
   * @param message SignedDrmCertificate message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(
    message: ISignedDrmCertificate,
    writer?: $protobuf.Writer,
  ): $protobuf.Writer;

  /**
   * Decodes a SignedDrmCertificate message from the specified reader or buffer.
   * @param r Reader or buffer to decode from
   * @param [l] Message length if known beforehand
   * @returns SignedDrmCertificate
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(
    r: $protobuf.Reader | Uint8Array,
    l?: number,
  ): SignedDrmCertificate;

  /**
   * Decodes a SignedDrmCertificate message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns SignedDrmCertificate
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(
    reader: $protobuf.Reader | Uint8Array,
  ): SignedDrmCertificate;

  /**
   * Creates a SignedDrmCertificate message from a plain object. Also converts values to their respective internal types.
   * @param d Plain object
   * @returns SignedDrmCertificate
   */
  public static fromObject(d: { [k: string]: any }): SignedDrmCertificate;

  /**
   * Creates a plain object from a SignedDrmCertificate message. Also converts values to other types if specified.
   * @param m SignedDrmCertificate
   * @param [o] Conversion options
   * @returns Plain object
   */
  public static toObject(
    m: SignedDrmCertificate,
    o?: $protobuf.IConversionOptions,
  ): { [k: string]: any };

  /**
   * Converts this SignedDrmCertificate to JSON.
   * @returns JSON object
   */
  public toJSON(): { [k: string]: any };

  /**
   * Gets the default type url for SignedDrmCertificate
   * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns The default type url
   */
  public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a WidevinePsshData. */
export class WidevinePsshData implements IWidevinePsshData {
  /**
   * Constructs a new WidevinePsshData.
   * @param [p] Properties to set
   */
  constructor(p?: IWidevinePsshData);

  /** WidevinePsshData keyIds. */
  public keyIds: Uint8Array[];

  /** WidevinePsshData contentId. */
  public contentId: Uint8Array;

  /** WidevinePsshData cryptoPeriodIndex. */
  public cryptoPeriodIndex: number;

  /** WidevinePsshData protectionScheme. */
  public protectionScheme: number;

  /** WidevinePsshData cryptoPeriodSeconds. */
  public cryptoPeriodSeconds: number;

  /** WidevinePsshData type. */
  public type: WidevinePsshData.Type;

  /** WidevinePsshData keySequence. */
  public keySequence: number;

  /** WidevinePsshData groupIds. */
  public groupIds: Uint8Array[];

  /** WidevinePsshData entitledKeys. */
  public entitledKeys: WidevinePsshData.IEntitledKey[];

  /** WidevinePsshData videoFeature. */
  public videoFeature: string;

  /** WidevinePsshData algorithm. */
  public algorithm: WidevinePsshData.Algorithm;

  /** WidevinePsshData provider. */
  public provider: string;

  /** WidevinePsshData trackType. */
  public trackType: string;

  /** WidevinePsshData policy. */
  public policy: string;

  /** WidevinePsshData groupedLicense. */
  public groupedLicense: Uint8Array;

  /**
   * Creates a new WidevinePsshData instance using the specified properties.
   * @param [properties] Properties to set
   * @returns WidevinePsshData instance
   */
  public static create(properties?: IWidevinePsshData): WidevinePsshData;

  /**
   * Encodes the specified WidevinePsshData message. Does not implicitly {@link WidevinePsshData.verify|verify} messages.
   * @param m WidevinePsshData message or plain object to encode
   * @param [w] Writer to encode to
   * @returns Writer
   */
  public static encode(
    m: IWidevinePsshData,
    w?: $protobuf.Writer,
  ): $protobuf.Writer;

  /**
   * Encodes the specified WidevinePsshData message, length delimited. Does not implicitly {@link WidevinePsshData.verify|verify} messages.
   * @param message WidevinePsshData message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(
    message: IWidevinePsshData,
    writer?: $protobuf.Writer,
  ): $protobuf.Writer;

  /**
   * Decodes a WidevinePsshData message from the specified reader or buffer.
   * @param r Reader or buffer to decode from
   * @param [l] Message length if known beforehand
   * @returns WidevinePsshData
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(
    r: $protobuf.Reader | Uint8Array,
    l?: number,
  ): WidevinePsshData;

  /**
   * Decodes a WidevinePsshData message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns WidevinePsshData
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(
    reader: $protobuf.Reader | Uint8Array,
  ): WidevinePsshData;

  /**
   * Creates a WidevinePsshData message from a plain object. Also converts values to their respective internal types.
   * @param d Plain object
   * @returns WidevinePsshData
   */
  public static fromObject(d: { [k: string]: any }): WidevinePsshData;

  /**
   * Creates a plain object from a WidevinePsshData message. Also converts values to other types if specified.
   * @param m WidevinePsshData
   * @param [o] Conversion options
   * @returns Plain object
   */
  public static toObject(
    m: WidevinePsshData,
    o?: $protobuf.IConversionOptions,
  ): { [k: string]: any };

  /**
   * Converts this WidevinePsshData to JSON.
   * @returns JSON object
   */
  public toJSON(): { [k: string]: any };

  /**
   * Gets the default type url for WidevinePsshData
   * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns The default type url
   */
  public static getTypeUrl(typeUrlPrefix?: string): string;
}

export namespace WidevinePsshData {
  /** Type enum. */
  enum Type {
    SINGLE = 0,
    ENTITLEMENT = 1,
    ENTITLED_KEY = 2,
  }

  /** Properties of an EntitledKey. */
  interface IEntitledKey {
    /** EntitledKey entitlementKeyId */
    entitlementKeyId?: Uint8Array | null;

    /** EntitledKey keyId */
    keyId?: Uint8Array | null;

    /** EntitledKey key */
    key?: Uint8Array | null;

    /** EntitledKey iv */
    iv?: Uint8Array | null;

    /** EntitledKey entitlementKeySizeBytes */
    entitlementKeySizeBytes?: number | null;
  }

  /** Represents an EntitledKey. */
  class EntitledKey implements IEntitledKey {
    /**
     * Constructs a new EntitledKey.
     * @param [p] Properties to set
     */
    constructor(p?: WidevinePsshData.IEntitledKey);

    /** EntitledKey entitlementKeyId. */
    public entitlementKeyId: Uint8Array;

    /** EntitledKey keyId. */
    public keyId: Uint8Array;

    /** EntitledKey key. */
    public key: Uint8Array;

    /** EntitledKey iv. */
    public iv: Uint8Array;

    /** EntitledKey entitlementKeySizeBytes. */
    public entitlementKeySizeBytes: number;

    /**
     * Creates a new EntitledKey instance using the specified properties.
     * @param [properties] Properties to set
     * @returns EntitledKey instance
     */
    public static create(
      properties?: WidevinePsshData.IEntitledKey,
    ): WidevinePsshData.EntitledKey;

    /**
     * Encodes the specified EntitledKey message. Does not implicitly {@link WidevinePsshData.EntitledKey.verify|verify} messages.
     * @param m EntitledKey message or plain object to encode
     * @param [w] Writer to encode to
     * @returns Writer
     */
    public static encode(
      m: WidevinePsshData.IEntitledKey,
      w?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Encodes the specified EntitledKey message, length delimited. Does not implicitly {@link WidevinePsshData.EntitledKey.verify|verify} messages.
     * @param message EntitledKey message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: WidevinePsshData.IEntitledKey,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes an EntitledKey message from the specified reader or buffer.
     * @param r Reader or buffer to decode from
     * @param [l] Message length if known beforehand
     * @returns EntitledKey
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      r: $protobuf.Reader | Uint8Array,
      l?: number,
    ): WidevinePsshData.EntitledKey;

    /**
     * Decodes an EntitledKey message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns EntitledKey
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array,
    ): WidevinePsshData.EntitledKey;

    /**
     * Creates an EntitledKey message from a plain object. Also converts values to their respective internal types.
     * @param d Plain object
     * @returns EntitledKey
     */
    public static fromObject(d: {
      [k: string]: any;
    }): WidevinePsshData.EntitledKey;

    /**
     * Creates a plain object from an EntitledKey message. Also converts values to other types if specified.
     * @param m EntitledKey
     * @param [o] Conversion options
     * @returns Plain object
     */
    public static toObject(
      m: WidevinePsshData.EntitledKey,
      o?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this EntitledKey to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for EntitledKey
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
  }

  /** Deprecated Fields  //////////////////////////// */
  enum Algorithm {
    UNENCRYPTED = 0,
    AESCTR = 1,
  }
}

/** Represents a FileHashes. */
export class FileHashes implements IFileHashes {
  /**
   * Constructs a new FileHashes.
   * @param [p] Properties to set
   */
  constructor(p?: IFileHashes);

  /** FileHashes signer. */
  public signer: Uint8Array;

  /** FileHashes signatures. */
  public signatures: FileHashes.ISignature[];

  /**
   * Creates a new FileHashes instance using the specified properties.
   * @param [properties] Properties to set
   * @returns FileHashes instance
   */
  public static create(properties?: IFileHashes): FileHashes;

  /**
   * Encodes the specified FileHashes message. Does not implicitly {@link FileHashes.verify|verify} messages.
   * @param m FileHashes message or plain object to encode
   * @param [w] Writer to encode to
   * @returns Writer
   */
  public static encode(m: IFileHashes, w?: $protobuf.Writer): $protobuf.Writer;

  /**
   * Encodes the specified FileHashes message, length delimited. Does not implicitly {@link FileHashes.verify|verify} messages.
   * @param message FileHashes message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(
    message: IFileHashes,
    writer?: $protobuf.Writer,
  ): $protobuf.Writer;

  /**
   * Decodes a FileHashes message from the specified reader or buffer.
   * @param r Reader or buffer to decode from
   * @param [l] Message length if known beforehand
   * @returns FileHashes
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(
    r: $protobuf.Reader | Uint8Array,
    l?: number,
  ): FileHashes;

  /**
   * Decodes a FileHashes message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns FileHashes
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(
    reader: $protobuf.Reader | Uint8Array,
  ): FileHashes;

  /**
   * Creates a FileHashes message from a plain object. Also converts values to their respective internal types.
   * @param d Plain object
   * @returns FileHashes
   */
  public static fromObject(d: { [k: string]: any }): FileHashes;

  /**
   * Creates a plain object from a FileHashes message. Also converts values to other types if specified.
   * @param m FileHashes
   * @param [o] Conversion options
   * @returns Plain object
   */
  public static toObject(
    m: FileHashes,
    o?: $protobuf.IConversionOptions,
  ): { [k: string]: any };

  /**
   * Converts this FileHashes to JSON.
   * @returns JSON object
   */
  public toJSON(): { [k: string]: any };

  /**
   * Gets the default type url for FileHashes
   * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns The default type url
   */
  public static getTypeUrl(typeUrlPrefix?: string): string;
}

export namespace FileHashes {
  /** Properties of a Signature. */
  interface ISignature {
    /** Signature filename */
    filename?: string | null;

    /** Signature testSigning */
    testSigning?: boolean | null;

    /** Signature SHA512Hash */
    SHA512Hash?: Uint8Array | null;

    /** Signature mainExe */
    mainExe?: boolean | null;

    /** Signature signature */
    signature?: Uint8Array | null;
  }

  /** Represents a Signature. */
  class Signature implements ISignature {
    /**
     * Constructs a new Signature.
     * @param [p] Properties to set
     */
    constructor(p?: FileHashes.ISignature);

    /** Signature filename. */
    public filename: string;

    /** Signature testSigning. */
    public testSigning: boolean;

    /** Signature SHA512Hash. */
    public SHA512Hash: Uint8Array;

    /** Signature mainExe. */
    public mainExe: boolean;

    /** Signature signature. */
    public signature: Uint8Array;

    /**
     * Creates a new Signature instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Signature instance
     */
    public static create(
      properties?: FileHashes.ISignature,
    ): FileHashes.Signature;

    /**
     * Encodes the specified Signature message. Does not implicitly {@link FileHashes.Signature.verify|verify} messages.
     * @param m Signature message or plain object to encode
     * @param [w] Writer to encode to
     * @returns Writer
     */
    public static encode(
      m: FileHashes.ISignature,
      w?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Encodes the specified Signature message, length delimited. Does not implicitly {@link FileHashes.Signature.verify|verify} messages.
     * @param message Signature message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: FileHashes.ISignature,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a Signature message from the specified reader or buffer.
     * @param r Reader or buffer to decode from
     * @param [l] Message length if known beforehand
     * @returns Signature
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      r: $protobuf.Reader | Uint8Array,
      l?: number,
    ): FileHashes.Signature;

    /**
     * Decodes a Signature message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Signature
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array,
    ): FileHashes.Signature;

    /**
     * Creates a Signature message from a plain object. Also converts values to their respective internal types.
     * @param d Plain object
     * @returns Signature
     */
    public static fromObject(d: { [k: string]: any }): FileHashes.Signature;

    /**
     * Creates a plain object from a Signature message. Also converts values to other types if specified.
     * @param m Signature
     * @param [o] Conversion options
     * @returns Plain object
     */
    public static toObject(
      m: FileHashes.Signature,
      o?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this Signature to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for Signature
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
  }
}

/** Represents a RemoteAttestation. */
export class RemoteAttestation implements IRemoteAttestation {
  /**
   * Constructs a new RemoteAttestation.
   * @param [p] Properties to set
   */
  constructor(p?: IRemoteAttestation);

  /** RemoteAttestation certificate. */
  public certificate?: IEncryptedClientIdentification | null;

  /** RemoteAttestation salt. */
  public salt: Uint8Array;

  /** RemoteAttestation signature. */
  public signature: Uint8Array;

  /**
   * Creates a new RemoteAttestation instance using the specified properties.
   * @param [properties] Properties to set
   * @returns RemoteAttestation instance
   */
  public static create(properties?: IRemoteAttestation): RemoteAttestation;

  /**
   * Encodes the specified RemoteAttestation message. Does not implicitly {@link RemoteAttestation.verify|verify} messages.
   * @param m RemoteAttestation message or plain object to encode
   * @param [w] Writer to encode to
   * @returns Writer
   */
  public static encode(
    m: IRemoteAttestation,
    w?: $protobuf.Writer,
  ): $protobuf.Writer;

  /**
   * Encodes the specified RemoteAttestation message, length delimited. Does not implicitly {@link RemoteAttestation.verify|verify} messages.
   * @param message RemoteAttestation message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(
    message: IRemoteAttestation,
    writer?: $protobuf.Writer,
  ): $protobuf.Writer;

  /**
   * Decodes a RemoteAttestation message from the specified reader or buffer.
   * @param r Reader or buffer to decode from
   * @param [l] Message length if known beforehand
   * @returns RemoteAttestation
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(
    r: $protobuf.Reader | Uint8Array,
    l?: number,
  ): RemoteAttestation;

  /**
   * Decodes a RemoteAttestation message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns RemoteAttestation
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(
    reader: $protobuf.Reader | Uint8Array,
  ): RemoteAttestation;

  /**
   * Creates a RemoteAttestation message from a plain object. Also converts values to their respective internal types.
   * @param d Plain object
   * @returns RemoteAttestation
   */
  public static fromObject(d: { [k: string]: any }): RemoteAttestation;

  /**
   * Creates a plain object from a RemoteAttestation message. Also converts values to other types if specified.
   * @param m RemoteAttestation
   * @param [o] Conversion options
   * @returns Plain object
   */
  public static toObject(
    m: RemoteAttestation,
    o?: $protobuf.IConversionOptions,
  ): { [k: string]: any };

  /**
   * Converts this RemoteAttestation to JSON.
   * @returns JSON object
   */
  public toJSON(): { [k: string]: any };

  /**
   * Gets the default type url for RemoteAttestation
   * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns The default type url
   */
  public static getTypeUrl(typeUrlPrefix?: string): string;
}
