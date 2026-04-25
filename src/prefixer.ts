/**
 * prefixer.ts
 * Utilities for scoping environment variable lookups by namespace prefix.
 */

export interface PrefixOptions {
  /** The prefix string, e.g. "APP_" */
  prefix: string;
  /** If true, strip the prefix from keys in the returned object. Default: true */
  strip?: boolean;
}

/**
 * Filter a raw env record to only keys that start with the given prefix.
 * Optionally strips the prefix from returned keys.
 */
export function filterByPrefix(
  env: Record<string, string | undefined>,
  options: PrefixOptions
): Record<string, string | undefined> {
  const { prefix, strip = true } = options;
  const result: Record<string, string | undefined> = {};

  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith(prefix)) {
      const outKey = strip ? key.slice(prefix.length) : key;
      result[outKey] = value;
    }
  }

  return result;
}

/**
 * Add a prefix to every key in an env record.
 */
export function addPrefix(
  env: Record<string, string | undefined>,
  prefix: string
): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(env)) {
    result[`${prefix}${key}`] = value;
  }
  return result;
}

/**
 * Normalise a prefix: ensure it ends with "_" if it contains word characters
 * and does not already end with a separator.
 */
export function normalisePrefix(prefix: string): string {
  if (prefix.length === 0) return prefix;
  if (prefix.endsWith("_") || prefix.endsWith(".") || prefix.endsWith("-")) {
    return prefix;
  }
  return `${prefix}_`;
}
