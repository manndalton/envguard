# exporter

Serialise a validated environment record to various output formats.

## API

### `exportEnv(env, options?): string`

Generic entry-point. Picks the right serialiser based on `options.format`.

```ts
import { exportEnv } from 'envguard';

const output = exportEnv(validatedEnv, { format: 'dotenv' });
console.log(output);
// APP_NAME="my app"
// PORT=3000
```

### Options

| Option  | Type           | Default     | Description                              |
|---------|----------------|-------------|------------------------------------------|
| format  | `ExportFormat` | `'dotenv'`  | Output format: `dotenv`, `json`, `shell` |
| keys    | `string[]`     | all keys    | Allowlist of keys to include             |

### Format examples

**dotenv**
```
APP_NAME="my app"
PORT=3000
DEBUG=true
```

**shell**
```sh
export APP_NAME="my app"
export PORT=3000
export DEBUG=true
```

**json**
```json
{
  "APP_NAME": "my app",
  "PORT": 3000,
  "DEBUG": true
}
```

## Low-level helpers

- `toDotEnv(env)` – `.env` file format
- `toJson(env, indent?)` – JSON string
- `toShell(env)` – `export KEY=VALUE` lines
