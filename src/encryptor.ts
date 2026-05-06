/**
 * encryptor.ts
 * Utilities for encrypting and decrypting sensitive environment variable values
 * using a symmetric key (AES-256-GCM via Node's built-in crypto module).
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const KEY_LENGTH = 32;
const TAG_LENGTH = 16;
const ENCODING = 'hex';

function deriveKey(secret: string, salt: Buffer): Buffer {
  return scryptSync(secret, salt, KEY_LENGTH) as Buffer;
}

/**
 * Encrypts a plain-text string value using the provided secret.
 * Returns a hex-encoded string: salt:iv:tag:ciphertext
 */
export function encryptValue(value: string, secret: string): string {
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);
  const key = deriveKey(secret, salt);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    salt.toString(ENCODING),
    iv.toString(ENCODING),
    tag.toString(ENCODING),
    encrypted.toString(ENCODING),
  ].join(':');
}

/**
 * Decrypts a value previously encrypted with encryptValue.
 * Throws if the secret is wrong or the payload is tampered.
 */
export function decryptValue(payload: string, secret: string): string {
  const parts = payload.split(':');
  if (parts.length !== 4) {
    throw new Error('encryptor: invalid encrypted payload format');
  }
  const [saltHex, ivHex, tagHex, dataHex] = parts;
  const salt = Buffer.from(saltHex, ENCODING);
  const iv = Buffer.from(ivHex, ENCODING);
  const tag = Buffer.from(tagHex, ENCODING);
  const data = Buffer.from(dataHex, ENCODING);

  if (tag.length !== TAG_LENGTH) {
    throw new Error('encryptor: invalid auth tag length');
  }

  const key = deriveKey(secret, salt);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}

/**
 * Encrypts all values in an env record whose keys match the provided set.
 */
export function encryptEnv(
  env: Record<string, string>,
  sensitiveKeys: Set<string>,
  secret: string,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    result[key] = sensitiveKeys.has(key) ? encryptValue(value, secret) : value;
  }
  return result;
}

/**
 * Decrypts all values in an env record whose keys match the provided set.
 */
export function decryptEnv(
  env: Record<string, string>,
  sensitiveKeys: Set<string>,
  secret: string,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    result[key] = sensitiveKeys.has(key) ? decryptValue(value, secret) : value;
  }
  return result;
}
