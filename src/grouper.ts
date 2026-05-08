/**
 * grouper.ts
 * Groups environment variables by a custom classifier function or by prefix segments.
 */

export type GroupKey = string;
export type EnvRecord = Record<string, string>;
export type GroupedEnv = Record<GroupKey, EnvRecord>;

/**
 * Groups env entries using a classifier function.
 * Entries for which the classifier returns null/undefined are placed in the "__ungrouped__" bucket.
 */
export function groupEnvBy(
  env: EnvRecord,
  classifier: (key: string, value: string) => GroupKey | null | undefined
): GroupedEnv {
  const result: GroupedEnv = {};

  for (const [key, value] of Object.entries(env)) {
    const group = classifier(key, value) ?? "__ungrouped__";
    if (!result[group]) {
      result[group] = {};
    }
    result[group][key] = value;
  }

  return result;
}

/**
 * Groups env entries by the first N segments of the key when split by a separator.
 * e.g. groupEnvBySegment({ DB_HOST: "...", DB_PORT: "...", APP_NAME: "..." }, "_", 1)
 *   => { DB: { DB_HOST, DB_PORT }, APP: { APP_NAME } }
 */
export function groupEnvBySegment(
  env: EnvRecord,
  separator: string = "_",
  depth: number = 1
): GroupedEnv {
  return groupEnvBy(env, (key) => {
    const parts = key.split(separator);
    if (parts.length <= depth) return key;
    return parts.slice(0, depth).join(separator);
  });
}

/**
 * Merges a GroupedEnv back into a flat EnvRecord.
 * Later groups overwrite earlier ones on key collision.
 */
export function flattenGrouped(grouped: GroupedEnv): EnvRecord {
  const result: EnvRecord = {};
  for (const group of Object.values(grouped)) {
    Object.assign(result, group);
  }
  return result;
}

/**
 * Returns the list of group keys present in a GroupedEnv.
 */
export function groupKeys(grouped: GroupedEnv): string[] {
  return Object.keys(grouped);
}
