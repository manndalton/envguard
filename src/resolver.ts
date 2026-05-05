/**
 * resolver.ts
 * Resolves environment variable values with a priority chain:
 * explicit overrides > process.env > defaults
 */

import { EnvSchema } from './validate';
import { applyTransforms } from './transformer';

export interface ResolverSource {
  /** A named source of key/value pairs */
  name: string;
  values: Record<string, string | undefined>;
  /** Higher priority wins; defaults to 0 */
  priority?: number;
}

export interface ResolvedEntry {
  key: string;
  value: string | undefined;
  source: string;
}

/**
 * Sorts sources by descending priority and returns the first defined value
 * for each key across all sources.
 */
export function resolveSources(
  keys: string[],
  sources: ResolverSource[]
): Record<string, ResolvedEntry> {
  const sorted = [...sources].sort(
    (a, b) => (b.priority ?? 0) - (a.priority ?? 0)
  );

  const result: Record<string, ResolvedEntry> = {};

  for (const key of keys) {
    let resolved: ResolvedEntry = { key, value: undefined, source: 'none' };

    for (const source of sorted) {
      if (source.values[key] !== undefined) {
        resolved = { key, value: source.values[key], source: source.name };
        break;
      }
    }

    result[key] = resolved;
  }

  return result;
}

/**
 * Builds a flat key/value map from resolved entries.
 */
export function flattenResolved(
  resolved: Record<string, ResolvedEntry>
): Record<string, string | undefined> {
  return Object.fromEntries(
    Object.values(resolved).map((e) => [e.key, e.value])
  );
}

/**
 * High-level helper: given a schema and an ordered list of sources,
 * returns a resolved flat env object ready for validation.
 */
export function resolveEnv<S extends EnvSchema>(
  schema: S,
  sources: ResolverSource[]
): Record<string, string | undefined> {
  const keys = Object.keys(schema);
  const resolved = resolveSources(keys, sources);
  return flattenResolved(resolved);
}
