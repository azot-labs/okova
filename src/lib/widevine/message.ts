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
  } catch (e) {
    console.error('Failed to parse message as SignedMessage', e);
    // console.debug(messageBuffer.toString());
  }
};
