# profiler

The `profiler` module tracks timing and success/failure data for each key processed during an `envguard` validation run. It is useful for diagnosing slow schema validators or identifying which keys fail most frequently in large configurations.

## API

### `startRun(): void`

Marks the beginning of a profiling session and clears any previous entries.

### `recordEntry(key: string, durationMs: number, success: boolean): void`

Records timing and outcome data for a single environment key.

### `endRun(): ProfileReport`

Finalises the session and returns a `ProfileReport` containing:

| Field          | Type              | Description                              |
|----------------|-------------------|------------------------------------------|
| `totalMs`      | `number`          | Wall-clock time for the whole run        |
| `entries`      | `ProfileEntry[]`  | Per-key timing records                   |
| `slowestKey`   | `string \| null`  | Key with the longest individual duration |
| `failureCount` | `number`          | Number of keys that did not validate     |

### `resetProfiler(): void`

Clears all state — useful between tests.

### `formatProfileReport(report: ProfileReport): string`

Returns a human-readable summary suitable for logging at startup.

## Example

```ts
import { startRun, recordEntry, endRun, formatProfileReport } from 'envguard/profiler';

startRun();
for (const [key, validator] of Object.entries(schema)) {
  const t0 = performance.now();
  const ok = validator.safeParse(process.env[key]).success;
  recordEntry(key, performance.now() - t0, ok);
}
const report = endRun();
console.log(formatProfileReport(report));
```
