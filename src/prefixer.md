# prefixer

The `prefixer` module provides utilities for scoping environment variable lookups by a namespace prefix. This is useful when multiple services or modules share a single `.env` file and each uses a distinct prefix such as `APP_`, `DB_`, or `CACHE_`.

## API

### `filterByPrefix(env, options)`

Filters a raw environment record to only the keys that begin with `options.prefix`.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `prefix` | `string` | — | The prefix to match, e.g. `"APP_"` |
| `strip` | `boolean` | `true` | Remove the prefix from returned keys |

```ts
import { filterByPrefix } from "envguard/prefixer";

const scoped = filterByPrefix(process.env, { prefix: "APP_" });
// { PORT: "3000", HOST: "localhost" }
```

### `addPrefix(env, prefix)`

Prepends `prefix` to every key in the supplied record. Useful when serialising a validated config back to a namespaced form.

```ts
import { addPrefix } from "envguard/prefixer";

const namespaced = addPrefix({ PORT: "3000" }, "APP_");
// { APP_PORT: "3000" }
```

### `normalisePrefix(prefix)`

Ensures a prefix string ends with a recognised separator (`_`, `.`, or `-`). If the prefix already ends with one of these characters it is returned unchanged; otherwise `_` is appended.

```ts
import { normalisePrefix } from "envguard/prefixer";

normalisePrefix("APP");  // "APP_"
normalisePrefix("APP_"); // "APP_"
normalisePrefix("app."); // "app."
```

## Usage with `validateEnv`

```ts
import { validateEnv } from "envguard";
import { filterByPrefix, normalisePrefix } from "envguard/prefixer";
import { str, num } from "envguard/schema";

const prefix = normalisePrefix("APP");
const scoped = filterByPrefix(process.env, { prefix });

const config = validateEnv(scoped, {
  PORT: num(),
  HOST: str(),
});
```
