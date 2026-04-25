# mask

The `mask` module provides utilities to **redact sensitive environment variable values** before they are logged, reported, or serialized — preventing accidental secret leakage.

## API

### `maskValue(value, options?)`

Masks a single string value.

```ts
import { maskValue } from './mask';

maskValue('supersecret');                          // '****'
maskValue('sk-abc123', { revealStart: 3 });        // 'sk-****'
maskValue('tok_xyz789', { revealEnd: 3 });         // '****789'
maskValue('abcdefgh', { revealStart: 2, revealEnd: 2 }); // 'ab****gh'
```

#### Options

| Option | Default | Description |
|---|---|---|
| `revealStart` | `0` | Characters to show at the beginning |
| `revealEnd` | `0` | Characters to show at the end |
| `maskChar` | `'*'` | Character used for masking |
| `minMaskLength` | `4` | Minimum length of the masked segment |

---

### `maskEnv(env, sensitiveKeys, options?)`

Masks all matching keys in an environment record.

```ts
import { maskEnv, DEFAULT_SENSITIVE_PATTERNS } from './mask';

const safe = maskEnv(process.env as Record<string, string>, DEFAULT_SENSITIVE_PATTERNS);
console.log(safe);
// { HOST: 'localhost', PORT: '3000', API_KEY: '****', DB_PASSWORD: '****' }
```

`sensitiveKeys` accepts both exact strings and regular expressions.

---

### `DEFAULT_SENSITIVE_PATTERNS`

A built-in array of `RegExp` patterns that match common secret variable names:

- `password`, `secret`, `token`, `api_key`, `private_key`, `auth`, `credential`

---

## Integration with Reporter

Pass masked env values to `formatReport` or `buildReport` to avoid leaking secrets in error output:

```ts
import { maskEnv, DEFAULT_SENSITIVE_PATTERNS } from './mask';
import { buildReport } from './reporter';

const safeEnv = maskEnv(rawEnv, DEFAULT_SENSITIVE_PATTERNS);
const report = buildReport(schema, safeEnv);
```
