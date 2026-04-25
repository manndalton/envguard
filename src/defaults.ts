/**
 * defaults.ts
 * Provides utilities to merge default values into environment schemas.
 * Defaults are applied when a key is missing or undefined in the environment.
 */

import { EnvSchema } from './validate';

export type DefaultsMap<T extends EnvSchema> = {
  [K in keyof T]?: string;
};

/**
 * Merges provided defaults into a raw env record.
 * Only fills in keys that are absent or empty in the source.
 */
export function applyDefaults<T extends EnvSchema>(
  env: Record<string, string | undefined>,
  defaults: DefaultsMap<T>
): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = { ...env };

  for (const key in defaults) {
    if (
      Object.prototype.hasOwnProperty.call(defaults, key) &&
      (result[key] === undefined || result[key] === '')
    ) {
      result[key] = defaults[key];
    }
  }

  return result;
}

/**
 * Extracts keys from the schema that have no corresponding value
 * in the env record and no default provided.
 */
export function findMissingWithoutDefaults<T extends EnvSchema>(
  env: Record<string, string | undefined>,
  schema: T,
  defaults: DefaultsMap<T>
): (keyof T)[] {
  return (Object.keys(schema) as (keyof T)[]).filter((key) => {
    const k = key as string;
    const hasValue = env[k] !== undefined && env[k] !== '';
    const hasDefault =
      defaults[key] !== undefined && defaults[key] !== '';
    return !hasValue && !hasDefault;
  });
}
