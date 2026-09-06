import { SignedMessage } from './proto';

export const MESSAGE_TYPES = {
  'license-request': 0,
  'license-renewal': 1,
  'license-release': 2,
  'individualization-request': 3,
};

export type MessageType = keyof typeof MESSAGE_TYPES;

export const getMessageType = (messageBuffer: Uint8Array) => {
  try {
    const message = SignedMessage.decode(messageBuffer);
    return message.type;
  } catch (error) {
    throw new Error('Failed to parse message as SignedMessage', { cause: error });
  }
};

/** Classify certificates without rejecting opaque remote license responses. */
export const isServiceCertificate = (response: Uint8Array) => {
  try {
    return getMessageType(response) === SignedMessage.MessageType.SERVICE_CERTIFICATE;
  } catch {
    return false;
  }
};
