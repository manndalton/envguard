/**
 * normalizer.ts
 * Normalise raw environment variable keys and values before processing.
 * - Keys: trim whitespace, optionally convert to UPPER_SNAKE_CASE
 * - Values: trim surrounding whitespace, collapse internal whitespace
 */

export interface NormalizeOptions {
  /** Convert all keys to UPPER_SNAKE_CASE (default: true) */
  uppercaseKeys?: boolean;
  /** Trim leading/trailing whitespace from values (default: true) */
  trimValues?: boolean;
  /** Collapse consecutive internal whitespace in values to a single space (default: false) */
  collapseWhitespace?: boolean;
}

const DEFAULT_OPTIONS: Required<NormalizeOptions> = {
  uppercaseKeys: true,
  trimValues: true,
  collapseWhitespace: false,
};

/**
 * Normalise a single key according to the provided options.
 */
export function normalizeKey(key: string, options: NormalizeOptions = {}): string {
  const { uppercaseKeys } = { ...DEFAULT_OPTIONS, ...options };
  const trimmed = key.trim();
  return uppercaseKeys ? trimmed.toUpperCase() : trimmed;
}

/**
 * Normalise a single value according to the provided options.
 */
export function normalizeValue(value: string, options: NormalizeOptions = {}): string {
  const { trimValues, collapseWhitespace } = { ...DEFAULT_OPTIONS, ...options };
  let result = trimValues ? value.trim() : value;
  if (collapseWhitespace) {
    result = result.replace(/\s+/g, ' ');
  }
  return result;
}

/**
 * Normalise an entire record of environment variables.
 * Duplicate keys (after normalisation) are resolved by keeping the last value.
 */
export function normalizeEnv(
  env: Record<string, string>,
  options: NormalizeOptions = {},
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [rawKey, rawValue] of Object.entries(env)) {
    const key = normalizeKey(rawKey, options);
    const value = normalizeValue(rawValue, options);
    result[key] = value;
  }
  return result;
}
