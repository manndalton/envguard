# Watcher Module

The `watcher` module provides live-reload support for `.env` files during development.
It watches a file for changes and re-validates the environment against a schema.

## API

### `watchEnvFile<T>(schema, options): WatcherHandle`

Starts watching an env file and re-validates it on change.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `schema` | `EnvSchema` | The schema to validate against |
| `options.filePath` | `string` | Path to the `.env` file to watch |
| `options.debounceMs` | `number` | Debounce delay in ms (default: `300`) |
| `options.onReload` | `(env) => void` | Called with new env on successful reload |
| `options.onError` | `(err: Error) => void` | Called when reload fails validation |

**Returns:** A `WatcherHandle` with a `stop()` method.

## Example

```ts
import { watchEnvFile } from 'envguard';
import { str, num } from 'envguard';

const handle = watchEnvFile(
  { PORT: num(), HOST: str() },
  {
    filePath: '.env',
    debounceMs: 200,
    onReload: (env) => console.log('Env reloaded:', env),
    onError: (err) => console.error('Reload failed:', err.message),
  }
);

// Later, to stop watching:
handle.stop();
```

## Notes

- Uses Node.js `fs.watch` under the hood.
- Only intended for development use; do not use in production.
- Changes are debounced to avoid rapid re-validation on rapid writes.
