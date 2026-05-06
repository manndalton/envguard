import { describe, it, expect } from 'vitest';
import {
  encryptValue,
  decryptValue,
  encryptEnv,
  decryptEnv,
} from './encryptor';

const SECRET = 'super-secret-test-key-123';

describe('encryptValue / decryptValue', () => {
  it('round-trips a plain string', () => {
    const original = 'my-database-password';
    const encrypted = encryptValue(original, SECRET);
    expect(encrypted).not.toBe(original);
    expect(decryptValue(encrypted, SECRET)).toBe(original);
  });

  it('produces different ciphertext on each call (random IV + salt)', () => {
    const a = encryptValue('hello', SECRET);
    const b = encryptValue('hello', SECRET);
    expect(a).not.toBe(b);
  });

  it('round-trips an empty string', () => {
    const encrypted = encryptValue('', SECRET);
    expect(decryptValue(encrypted, SECRET)).toBe('');
  });

  it('round-trips a unicode string', () => {
    const original = '🔑 pässwörد';
    expect(decryptValue(encryptValue(original, SECRET), SECRET)).toBe(original);
  });

  it('throws on wrong secret', () => {
    const encrypted = encryptValue('secret-value', SECRET);
    expect(() => decryptValue(encrypted, 'wrong-secret')).toThrow();
  });

  it('throws on tampered payload', () => {
    const encrypted = encryptValue('value', SECRET);
    const tampered = encrypted.slice(0, -4) + 'ffff';
    expect(() => decryptValue(tampered, SECRET)).toThrow();
  });

  it('throws on malformed payload', () => {
    expect(() => decryptValue('notvalid', SECRET)).toThrow(
      'invalid encrypted payload format',
    );
  });
});

describe('encryptEnv / decryptEnv', () => {
  const env = {
    APP_NAME: 'envguard',
    DB_PASSWORD: 'hunter2',
    API_KEY: 'abc123',
    PORT: '3000',
  };
  const sensitiveKeys = new Set(['DB_PASSWORD', 'API_KEY']);

  it('encrypts only sensitive keys', () => {
    const encrypted = encryptEnv(env, sensitiveKeys, SECRET);
    expect(encrypted.APP_NAME).toBe('envguard');
    expect(encrypted.PORT).toBe('3000');
    expect(encrypted.DB_PASSWORD).not.toBe('hunter2');
    expect(encrypted.API_KEY).not.toBe('abc123');
  });

  it('decrypts only sensitive keys', () => {
    const encrypted = encryptEnv(env, sensitiveKeys, SECRET);
    const decrypted = decryptEnv(encrypted, sensitiveKeys, SECRET);
    expect(decrypted).toEqual(env);
  });

  it('handles empty sensitive key set', () => {
    const encrypted = encryptEnv(env, new Set(), SECRET);
    expect(encrypted).toEqual(env);
  });

  it('handles empty env record', () => {
    const encrypted = encryptEnv({}, sensitiveKeys, SECRET);
    expect(encrypted).toEqual({});
  });
});
