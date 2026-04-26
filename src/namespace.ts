/**
 * namespace.ts
 * Groups a validated env object into namespaced sub-objects by key prefix.
 *
 * Example:
 *   { DB_HOST: 'localhost', DB_PORT: 5432, APP_NAME: 'myapp' }
 *   => { DB: { HOST: 'localhost', PORT: 5432 }, APP: { NAME: 'myapp' } }
 */

export type Namespaced<T extends Record<string, unknown>> = {
  [NS in string]: Record<string, unknown>;
} & Record<string, Record<string, unknown>>;

export interface NamespaceOptions {
  /** Separator between namespace and key. Defaults to '_' */
  separator?: string;
  /** If true, keys with no separator are placed under a catch-all namespace */
  catchAll?: string;
}

/**
 * Groups flat env key/value pairs into namespaced buckets.
 *
 * @param env     - Flat record of env values (post-validation)
 * @param options - Optional configuration
 * @returns       A nested record keyed by namespace prefix
 */
export function namespaceEnv<T extends Record<string, unknown>>(
  env: T,
  options: NamespaceOptions = {}
): Record<string, Record<string, unknown>> {
  const sep = options.separator ?? '_';
  const catchAll = options.catchAll ?? '__root__';
  const result: Record<string, Record<string, unknown>> = {};

  for (const [rawKey, value] of Object.entries(env)) {
    const idx = rawKey.indexOf(sep);
    if (idx === -1) {
      // No separator — place in catch-all namespace
      if (!result[catchAll]) result[catchAll] = {};
      result[catchAll][rawKey] = value;
    } else {
      const ns = rawKey.slice(0, idx);
      const key = rawKey.slice(idx + sep.length);
      if (!result[ns]) result[ns] = {};
      result[ns][key] = value;
    }
  }

  return result;
}

/**
 * Retrieves a single namespace bucket from a grouped env object.
 * Returns an empty object if the namespace does not exist.
 */
export function getNamespace(
  grouped: Record<string, Record<string, unknown>>,
  ns: string
): Record<string, unknown> {
  return grouped[ns] ?? {};
}
