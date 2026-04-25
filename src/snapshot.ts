/**
 * snapshot.ts
 * Captures and compares environment variable snapshots for drift detection.
 */

import type { EnvSchema } from './validate';

export interface EnvSnapshot {
  timestamp: number;
  values: Record<string, string | undefined>;
}

/**
 * Captures a snapshot of the current resolved environment values.
 */
export function captureSnapshot<T extends EnvSchema>(
  schema: T,
  env: Record<string, string | undefined> = process.env
): EnvSnapshot {
  const values: Record<string, string | undefined> = {};
  for (const key of Object.keys(schema)) {
    values[key] = env[key];
  }
  return {
    timestamp: Date.now(),
    values,
  };
}

/**
 * Compares two snapshots and returns the keys whose values have changed.
 */
export function diffSnapshots(
  previous: EnvSnapshot,
  current: EnvSnapshot
): string[] {
  const changedKeys: string[] = [];
  const allKeys = new Set([
    ...Object.keys(previous.values),
    ...Object.keys(current.values),
  ]);

  for (const key of allKeys) {
    if (previous.values[key] !== current.values[key]) {
      changedKeys.push(key);
    }
  }

  return changedKeys;
}

/**
 * Serializes a snapshot to a JSON string.
 */
export function serializeSnapshot(snapshot: EnvSnapshot): string {
  return JSON.stringify(snapshot);
}

/**
 * Deserializes a snapshot from a JSON string.
 */
export function deserializeSnapshot(raw: string): EnvSnapshot {
  const parsed = JSON.parse(raw);
  if (
    typeof parsed !== 'object' ||
    typeof parsed.timestamp !== 'number' ||
    typeof parsed.values !== 'object'
  ) {
    throw new Error('Invalid snapshot format');
  }
  return parsed as EnvSnapshot;
}
