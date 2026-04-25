# freeze

The `freeze` module provides utilities to make validated environment objects
immutable at runtime, preventing accidental mutation after startup.

## API

### `deepFreeze<T>(obj: T): Frozen<T>`

Recursively freezes an object and all of its nested object properties using
`Object.freeze`. Primitives are left unchanged.

```ts
import { deepFreeze } from "./freeze";

const env = deepFreeze({ PORT: 3000, db: { host: "localhost" } });
// env.PORT = 9999        // ❌ throws in strict mode
// env.db.host = "other" // ❌ also throws
```

### `freezeEnv<T>(env: T): Frozen<T>`

A safe wrapper around `deepFreeze` that validates the input is a plain object
before freezing. Throws a `TypeError` for arrays or `null`.

```ts
import { freezeEnv } from "./freeze";

const env = freezeEnv({ NODE_ENV: "production", PORT: "8080" });
```

### `isFrozen(obj: object): boolean`

Returns `true` if the given object is frozen (shallow check via `Object.isFrozen`).

## Integration with `envguard`

Pass the validated env object through `freezeEnv` before exporting it from your
app configuration module:

```ts
import { createEnv } from "./envguard";
import { freezeEnv } from "./freeze";
import { str, num } from "./schema";

const raw = createEnv({ PORT: num(), NODE_ENV: str() });
export const env = freezeEnv(raw);
```

This ensures that no downstream code can silently overwrite environment values
after the app has started.
