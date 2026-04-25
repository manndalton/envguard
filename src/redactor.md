# Redactor

The `redactor` module provides utilities to **redact sensitive environment variable values** before they are logged, reported, or serialized. This prevents accidental exposure of secrets in output.

## API

### `shouldRedact(key, options?): boolean`

Returns `true` if the given key should be redacted based on the configured options.

```ts
import { shouldRedact } from "./redactor";

shouldRedact("DB_PASSWORD"); // true
shouldRedact("APP_PORT");    // false
```

### `redactValue(key, value, options?): string`

Returns the original value, or a placeholder string if the key is considered sensitive.

```ts
import { redactValue } from "./redactor";

redactValue("API_KEY", "abc123");              // "[REDACTED]"
redactValue("APP_PORT", "3000");               // "3000"
redactValue("API_KEY", "abc123", { placeholder: "***" }); // "***"
```

### `redactEnv(env, options?): Record<string, string>`

Applies redaction to all keys in an environment record.

```ts
import { redactEnv } from "./redactor";

const safe = redactEnv(process.env as Record<string, string>);
console.log(safe); // sensitive keys replaced with "[REDACTED]"
```

## Options

| Option        | Type       | Default                          | Description                              |
|---------------|------------|----------------------------------|------------------------------------------|
| `keys`        | `string[]` | `[]`                             | Exact key names to always redact         |
| `patterns`    | `RegExp[]` | Built-in sensitive patterns      | Regex patterns matched against key names |
| `placeholder` | `string`   | `"[REDACTED]"`                   | Replacement string for redacted values   |

## Default Sensitive Patterns

The following patterns are matched by default (case-insensitive):

- `secret`, `password`, `passwd`, `token`
- `api_key`, `apikey`, `private_key`
- `auth`, `credential`
