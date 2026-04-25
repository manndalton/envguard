# defaults

The `defaults` module provides utilities to supply fallback values for environment variables that may not be present at runtime.

## API

### `applyDefaults(env, defaults)`

Merges a `DefaultsMap` into a raw environment record. Keys that are `undefined` or empty strings in `env` will be filled in from `defaults`.

```ts
import { applyDefaults } from './defaults';

const env = applyDefaults(process.env, {
  PORT: '3000',
  HOST: 'localhost',
  DEBUG: 'false',
});
```

### `findMissingWithoutDefaults(env, schema, defaults)`

Returns an array of schema keys that have no value in `env` and no fallback in `defaults`. Useful for early detection of required-but-uncovered variables before full validation.

```ts
import { findMissingWithoutDefaults } from './defaults';
import { str, num } from './schema';

const schema = { HOST: str(), PORT: num(), SECRET: str() };
const missing = findMissingWithoutDefaults(process.env, schema, { PORT: '3000' });
// missing => ['SECRET'] if SECRET is not in process.env
```

## Integration with `envguard`

Pass the result of `applyDefaults` as the `env` option when calling `createEnv` to ensure defaults are applied before validation:

```ts
import { createEnv } from './envguard';
import { applyDefaults } from './defaults';
import { str, num } from './schema';

const env = createEnv(
  { HOST: str(), PORT: num() },
  { env: applyDefaults(process.env, { HOST: 'localhost', PORT: '3000' }) }
);
```

## Notes

- `applyDefaults` does **not** mutate the original `env` object.
- Empty string values (`''`) are treated as missing and will be replaced by defaults.
