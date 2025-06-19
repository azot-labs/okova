class PlayreadyException extends Error {
  constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class TooManySessions extends PlayreadyException {
  constructor(message = 'Too many Sessions are open.') {
    super(message);
  }
}

export class InvalidSession extends PlayreadyException {
  constructor(message = 'No Session is open with the specified identifier.') {
    super(message);
  }
}

export class InvalidPssh extends PlayreadyException {
  constructor(message = 'The Playready PSSH is invalid or empty.') {
    super(message);
  }
}

export class InvalidInitData extends PlayreadyException {
  constructor(message = 'The Playready Cenc Header Data is invalid or empty.') {
    super(message);
  }
}

export class DeviceMismatch extends PlayreadyException {
  constructor(
    message = 'The Remote CDMs Device information and the APIs Device information did not match.',
  ) {
    super(message);
  }
}

export class InvalidLicense extends PlayreadyException {
  constructor(message = 'Unable to parse XMR License.') {
    super(message);
  }
}

export class InvalidCertificate extends PlayreadyException {
  constructor(message = 'The BCert is not correctly formatted.') {
    super(message);
  }
}

export class InvalidCertificateChain extends PlayreadyException {
  constructor(message = 'The BCertChain is not correctly formatted.') {
    super(message);
  }
}

export class OutdatedDevice extends PlayreadyException {
  constructor(
    message = 'The PlayReady Device is outdated and does not support a specific operation.',
  ) {
    super(message);
  }
}

export class ServerException extends PlayreadyException {
  constructor(
    message = 'Recasted on the client if found in license response.',
  ) {
    super(message);
  }
}
