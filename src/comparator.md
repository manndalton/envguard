# comparator

Compare two environment variable records and produce a structured diff.

## API

### `compareEnvRecords(base, next): ComparisonResult`

Compares two `Record<string, string>` objects and returns a `ComparisonResult` containing categorised changes.

```ts
import { compareEnvRecords } from './comparator';

const result = compareEnvRecords(
  { PORT: '3000', HOST: 'localhost' },
  { PORT: '4000', HOST: 'localhost', DEBUG: 'true' }
);

console.log(result.added);    // [{ key: 'DEBUG', changeType: 'added', newValue: 'true' }]
console.log(result.changed);  // [{ key: 'PORT', changeType: 'changed', oldValue: '3000', newValue: '4000' }]
console.log(result.unchanged);// [{ key: 'HOST', changeType: 'unchanged', ... }]
console.log(result.hasChanges); // true
```

### `formatComparison(result): string`

Formats a `ComparisonResult` as a human-readable diff string.

```ts
import { compareEnvRecords, formatComparison } from './comparator';

const result = compareEnvRecords(oldEnv, newEnv);
console.log(formatComparison(result));
// + DEBUG=true
// ~ PORT: 3000 → 4000
```

## Change Types

| Type        | Description                          |
|-------------|--------------------------------------|
| `added`     | Key exists in `next` but not `base`  |
| `removed`   | Key exists in `base` but not `next`  |
| `changed`   | Key exists in both with different values |
| `unchanged` | Key exists in both with same value   |

## Use Cases

- Auditing environment changes between deployments
- Detecting config drift between environments
- Logging what changed when a `.env` file is reloaded at runtime
