# encryptor

The `encryptor` module provides symmetric encryption and decryption of sensitive
environment variable values using **AES-256-GCM** (authenticated encryption),
backed by Node.js's built-in `crypto` module — no external dependencies required.

## API

### `encryptValue(value: string, secret: string): string`

Encrypts a single string value with the given secret. Returns a colon-delimited
hex string in the format `salt:iv:tag:ciphertext`. Each call produces a unique
ciphertext due to a randomly generated salt and IV.

### `decryptValue(payload: string, secret: string): string`

Decrypts a payload previously produced by `encryptValue`. Throws if the secret
is incorrect or the payload has been tampered with (GCM auth tag verification).

### `encryptEnv(env, sensitiveKeys, secret): Record<string, string>`

Encrypts all values in an env record whose keys are present in `sensitiveKeys`.
Non-sensitive keys are passed through unchanged.

### `decryptEnv(env, sensitiveKeys, secret): Record<string, string>`

Decrypts all values in an env record whose keys are present in `sensitiveKeys`.
Non-sensitive keys are passed through unchanged.

## Usage

```ts
import { encryptEnv, decryptEnv } from 'envguard/encryptor';

const secret = process.env.ENVGUARD_SECRET!;
const sensitive = new Set(['DB_PASSWORD', 'JWT_SECRET']);

// Encrypt before persisting to disk / a secrets store
const encrypted = encryptEnv(rawEnv, sensitive, secret);

// Decrypt at startup before validation
const decrypted = decryptEnv(encrypted, sensitive, secret);
```

## Security notes

- Keys are derived via **scrypt** (N=16384, r=8, p=1) with a random 16-byte salt
  per encryption call, making brute-force attacks expensive.
- AES-256-GCM provides both confidentiality and integrity; any tampering with
  the ciphertext or tag will cause `decryptValue` to throw.
- The `secret` should be a high-entropy string stored outside the env file
  (e.g. a KMS-managed key or a separate secrets manager entry).
