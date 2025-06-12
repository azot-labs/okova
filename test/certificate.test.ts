import { expect, test } from 'vitest';
import {
  parseCertificate,
  verifyCertificate,
} from '../src/lib/widevine/certificate';
import { parseSpkiFromCertificateKey } from '../src/lib/crypto';
import { fromBuffer } from '../src/lib/utils';

const SERVICE_CERTIFICATE = `CAUSxQUKvwIIAxIQKHA0VMAI9jYYredEPbbEyBiL5/mQBSKOAjCCAQoCggEBALUhErjQXQI/zF2V4sJRwcZJtBd82NK+7zVbsGdD3mYePSq8MYK3mUbVX9wI3+lUB4FemmJ0syKix/XgZ7tfCsB6idRa6pSyUW8HW2bvgR0NJuG5priU8rmFeWKqFxxPZmMNPkxgJxiJf14e+baq9a1Nuip+FBdt8TSh0xhbWiGKwFpMQfCB7/+Ao6BAxQsJu8dA7tzY8U1nWpGYD5LKfdxkagatrVEB90oOSYzAHwBTK6wheFC9kF6QkjZWt9/v70JIZ2fzPvYoPU9CVKtyWJOQvuVYCPHWaAgNRdiTwryi901goMDQoJk87wFgRwMzTDY4E5SGvJ2vJP1noH+a2UMCAwEAAToSc3RhZ2luZy5nb29nbGUuY29tEoADmD4wNSZ19AunFfwkm9rl1KxySaJmZSHkNlVzlSlyH/iA4KrvxeJ7yYDa6tq/P8OG0ISgLIJTeEjMdT/0l7ARp9qXeIoA4qprhM19ccB6SOv2FgLMpaPzIDCnKVww2pFbkdwYubyVk7jei7UPDe3BKTi46eA5zd4Y+oLoG7AyYw/pVdhaVmzhVDAL9tTBvRJpZjVrKH1lexjOY9Dv1F/FJp6X6rEctWPlVkOyb/SfEJwhAa/K81uDLyiPDZ1Flg4lnoX7XSTb0s+Cdkxd2b9yfvvpyGH4aTIfat4YkF9Nkvmm2mU224R1hx0WjocLsjA89wxul4TJPS3oRa2CYr5+DU4uSgdZzvgtEJ0lksckKfjAF0K64rPeytvDPD5fS69eFuy3Tq26/LfGcF96njtvOUA4P5xRFtICogySKe6WnCUZcYMDtQ0BMMM1LgawFNg4VA+KDCJ8ABHg9bOOTimO0sswHrRWSWX1XF15dXolCk65yEqz5lOfa2/fVomeopkU`;

test('parse spki from certificate key', async () => {
  const { drmCertificate } = await parseCertificate(SERVICE_CERTIFICATE);
  const publicKey = parseSpkiFromCertificateKey(drmCertificate.publicKey);
  const expectedPublicKey =
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtSESuNBdAj/MXZXiwlHB' +
    'xkm0F3zY0r7vNVuwZ0PeZh49KrwxgreZRtVf3Ajf6VQHgV6aYnSzIqLH9eBnu18K' +
    'wHqJ1FrqlLJRbwdbZu+BHQ0m4bmmuJTyuYV5YqoXHE9mYw0+TGAnGIl/Xh75tqr1' +
    'rU26Kn4UF23xNKHTGFtaIYrAWkxB8IHv/4CjoEDFCwm7x0Du3NjxTWdakZgPksp9' +
    '3GRqBq2tUQH3Sg5JjMAfAFMrrCF4UL2QXpCSNla33+/vQkhnZ/M+9ig9T0JUq3JY' +
    'k5C+5VgI8dZoCA1F2JPCvKL3TWCgwNCgmTzvAWBHAzNMNjgTlIa8na8k/Wegf5rZ' +
    'QwIDAQAB';
  expect(fromBuffer(publicKey).toBase64()).toBe(expectedPublicKey);
});

test('verify valid certificate', async () => {
  const { signedDrmCertificate } = await parseCertificate(SERVICE_CERTIFICATE);
  const isValid = await verifyCertificate(signedDrmCertificate);
  expect(isValid).toBe(true);
});
