# differ

The `differ` module provides utilities for computing detailed diffs between two environment variable records or snapshots.

## API

### `diffEnvRecords(before, after): EnvDiff`

Compares two flat `Record<string, string>` objects and returns a structured `EnvDiff`.

```ts
import { diffEnvRecords } from 'envguard/differ';

const diff = diffEnvRecords(
  { PORT: '3000', DEBUG: 'true' },
  { PORT: '4000', NODE_ENV: 'production' }
);

console.log(diff.added);    // ['NODE_ENV']
console.log(diff.removed);  // ['DEBUG']
console.log(diff.changed);  // ['PORT']
```

### `diffSnapshots(before, after): EnvDiff`

Diffs two typed `EnvSnapshot` objects produced by the `snapshot` module.

```ts
import { diffSnapshots } from 'envguard/differ';

const diff = diffSnapshots(snapshotA, snapshotB);
```

### `hasDifferences(diff): boolean`

Returns `true` if the diff contains any added, removed, or changed keys.

```ts
if (hasDifferences(diff)) {
  console.warn('Environment has changed since last snapshot!');
}
```

## DiffEntry

Each entry in `diff.entries` has the shape:

```ts
{
  key: string;
  kind: 'added' | 'removed' | 'changed' | 'unchanged';
  before?: string;
  after?: string;
}
```

Entries are sorted alphabetically by key for deterministic output.
