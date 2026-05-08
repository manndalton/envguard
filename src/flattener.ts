/**
 * flattener.ts
 * Flatten nested environment variable objects into dot-notation key-value records,
 * and expand flat dot-notation records back into nested objects.
 */

export type FlatRecord = Record<string, string>;
export type NestedRecord = Record<string, unknown>;

/**
 * Flatten a nested object into a flat record using dot-notation keys.
 * e.g. { db: { host: 'localhost', port: '5432' } } => { 'db.host': 'localhost', 'db.port': '5432' }
 */
export function flattenEnv(
  obj: NestedRecord,
  prefix = '',
  separator = '.'
): FlatRecord {
  const result: FlatRecord = {};

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}${separator}${key}` : key;

    if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      const nested = flattenEnv(value as NestedRecord, fullKey, separator);
      Object.assign(result, nested);
    } else {
      result[fullKey] = String(value ?? '');
    }
  }

  return result;
}

/**
 * Expand a flat dot-notation record into a nested object.
 * e.g. { 'db.host': 'localhost', 'db.port': '5432' } => { db: { host: 'localhost', port: '5432' } }
 */
export function expandEnv(
  flat: FlatRecord,
  separator = '.'
): NestedRecord {
  const result: NestedRecord = {};

  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split(separator);
    let current = result;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (current[part] === undefined || typeof current[part] !== 'object') {
        current[part] = {};
      }
      current = current[part] as NestedRecord;
    }

    current[parts[parts.length - 1]] = value;
  }

  return result;
}

/**
 * Returns true if the given flat record contains any dot-notation keys.
 */
export function hasNestedKeys(flat: FlatRecord, separator = '.'): boolean {
  return Object.keys(flat).some((k) => k.includes(separator));
}
