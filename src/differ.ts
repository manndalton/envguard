import type { EnvSchema } from './validate';
import type { EnvSnapshot } from './snapshot';

export type DiffKind = 'added' | 'removed' | 'changed' | 'unchanged';

export interface DiffEntry {
  key: string;
  kind: DiffKind;
  before?: string;
  after?: string;
}

export interface EnvDiff {
  entries: DiffEntry[];
  added: string[];
  removed: string[];
  changed: string[];
  unchanged: string[];
}

/**
 * Compute a detailed diff between two flat env records.
 */
export function diffEnvRecords(
  before: Record<string, string>,
  after: Record<string, string>
): EnvDiff {
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const entries: DiffEntry[] = [];

  for (const key of allKeys) {
    const hasBefore = Object.prototype.hasOwnProperty.call(before, key);
    const hasAfter = Object.prototype.hasOwnProperty.call(after, key);

    if (!hasBefore && hasAfter) {
      entries.push({ key, kind: 'added', after: after[key] });
    } else if (hasBefore && !hasAfter) {
      entries.push({ key, kind: 'removed', before: before[key] });
    } else if (before[key] !== after[key]) {
      entries.push({ key, kind: 'changed', before: before[key], after: after[key] });
    } else {
      entries.push({ key, kind: 'unchanged', before: before[key], after: after[key] });
    }
  }

  entries.sort((a, b) => a.key.localeCompare(b.key));

  return {
    entries,
    added: entries.filter(e => e.kind === 'added').map(e => e.key),
    removed: entries.filter(e => e.kind === 'removed').map(e => e.key),
    changed: entries.filter(e => e.kind === 'changed').map(e => e.key),
    unchanged: entries.filter(e => e.kind === 'unchanged').map(e => e.key),
  };
}

/**
 * Diff two EnvSnapshot objects directly.
 */
export function diffSnapshots<S extends EnvSchema>(
  before: EnvSnapshot<S>,
  after: EnvSnapshot<S>
): EnvDiff {
  const toRecord = (snap: EnvSnapshot<S>): Record<string, string> =>
    Object.fromEntries(
      Object.entries(snap.values as Record<string, unknown>).map(([k, v]) => [k, String(v)])
    );
  return diffEnvRecords(toRecord(before), toRecord(after));
}

/**
 * Returns true if the diff contains any meaningful changes.
 */
export function hasDifferences(diff: EnvDiff): boolean {
  return diff.added.length > 0 || diff.removed.length > 0 || diff.changed.length > 0;
}
