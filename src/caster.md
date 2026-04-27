# caster

The `caster` module provides utilities to explicitly cast environment variable values to specific target types after they have been loaded and parsed.

## API

### `castValue(key, raw, target, options?)`

Casts a single raw value to the given `CastTarget`.

| Parameter | Type | Description |
|-----------|------|-------------|
| `key` | `string` | Variable name (used in error messages) |
| `raw` | `unknown` | The raw value to cast |
| `target` | `CastTarget` | One of `'string'`, `'number'`, `'boolean'`, `'json'` |
| `options` | `CastOptions` | Optional `fallback` and `strict` flag |

**Returns** the cast value, or `fallback` if provided and casting fails.

**Throws** `CastError` if casting fails and no `fallback` is defined.

### `castEnv(env, targets, options?)`

Casts multiple keys in an env record according to a targets map.

```ts
const result = castEnv(process.env, {
  PORT: 'number',
  DEBUG: 'boolean',
  CONFIG: 'json',
});
```

### `CastError`

Thrown when a value cannot be cast to the requested type.

```ts
try {
  castValue('PORT', 'abc', 'number');
} catch (err) {
  if (err instanceof CastError) {
    console.error(err.message); // Cannot cast key "PORT" ...
  }
}
```

## Supported targets

| Target | Truthy values | Notes |
|--------|--------------|-------|
| `string` | — | Converts via `String()` |
| `number` | — | Uses `Number()`, rejects `NaN` |
| `boolean` | `true/1/yes/on` → `true` | Case-insensitive |
| `json` | — | Uses `JSON.parse()` |
