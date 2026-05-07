/**
 * sorter.ts — Sort and order environment variable records by key or value.
 */

export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  order?: SortOrder;
  priorityKeys?: string[];
  caseInsensitive?: boolean;
}

/**
 * Sort a flat env record by key.
 */
export function sortEnvByKey(
  env: Record<string, string>,
  options: SortOptions = {}
): Record<string, string> {
  const { order = 'asc', priorityKeys = [], caseInsensitive = true } = options;

  const compare = (a: string, b: string): number => {
    const ka = caseInsensitive ? a.toLowerCase() : a;
    const kb = caseInsensitive ? b.toLowerCase() : b;
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  };

  const keys = Object.keys(env);

  const priority = keys.filter((k) => priorityKeys.includes(k));
  const rest = keys.filter((k) => !priorityKeys.includes(k));

  const sortedRest = rest.sort((a, b) =>
    order === 'asc' ? compare(a, b) : compare(b, a)
  );

  const orderedKeys = [...priority, ...sortedRest];

  return orderedKeys.reduce<Record<string, string>>((acc, key) => {
    acc[key] = env[key];
    return acc;
  }, {});
}

/**
 * Sort a flat env record by value (lexicographic).
 */
export function sortEnvByValue(
  env: Record<string, string>,
  options: Pick<SortOptions, 'order' | 'caseInsensitive'> = {}
): Record<string, string> {
  const { order = 'asc', caseInsensitive = true } = options;

  const compare = (a: string, b: string): number => {
    const va = caseInsensitive ? a.toLowerCase() : a;
    const vb = caseInsensitive ? b.toLowerCase() : b;
    return va < vb ? -1 : va > vb ? 1 : 0;
  };

  const sorted = Object.entries(env).sort(([, va], [, vb]) =>
    order === 'asc' ? compare(va, vb) : compare(vb, va)
  );

  return Object.fromEntries(sorted);
}

/**
 * Group env keys by a common prefix segment (e.g. "DB_", "APP_").
 */
export function groupEnvByPrefix(
  env: Record<string, string>
): Record<string, Record<string, string>> {
  const groups: Record<string, Record<string, string>> = {};

  for (const [key, value] of Object.entries(env)) {
    const underscoreIdx = key.indexOf('_');
    const prefix = underscoreIdx > 0 ? key.slice(0, underscoreIdx) : '__UNGROUPED__';
    if (!groups[prefix]) groups[prefix] = {};
    groups[prefix][key] = value;
  }

  return groups;
}
