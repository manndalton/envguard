/**
 * merger.ts
 * Merge multiple env sources with priority ordering.
 * Later sources override earlier ones.
 */

import { EnvSchema } from './validate';

export type EnvSource = Record<string, string | undefined>;

export interface MergeOptions {
  /**
   * If true, skip keys with undefined values when merging.
   * Defaults to true.
   */
  skipUndefined?: boolean;
}

/**
 * Merge multiple env sources into a single record.
 * Sources are applied left-to-right; later sources win.
 */
export function mergeSources(
  sources: EnvSource[],
  options: MergeOptions = {}
): Record<string, string> {
  const { skipUndefined = true } = options;
  const result: Record<string, string> = {};

  for (const source of sources) {
    for (const [key, value] of Object.entries(source)) {
      if (skipUndefined && value === undefined) continue;
      if (value !== undefined) {
        result[key] = value;
      }
    }
  }

  return result;
}

/**
 * Build a merged env source from process.env plus additional overrides.
 * Priority (highest last): process.env < fileSources < overrides
 */
export function buildMergedEnv(
  fileSources: EnvSource[],
  overrides: EnvSource = {},
  options: MergeOptions = {}
): Record<string, string> {
  return mergeSources(
    [process.env as EnvSource, ...fileSources, overrides],
    options
  );
}

/**
 * Pick only the keys declared in a schema from a merged env record.
 */
export function pickSchemaKeys<S extends EnvSchema>(
  env: Record<string, string>,
  schema: S
): Partial<Record<keyof S, string>> {
  const result: Partial<Record<keyof S, string>> = {};
  for (const key of Object.keys(schema) as Array<keyof S>) {
    if (key in env) {
      result[key] = env[key as string];
    }
  }
  return result;
}
