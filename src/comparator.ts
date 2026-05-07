/**
 * comparator.ts
 * Compare two env records and produce a structured diff with change types.
 */

export type ChangeType = 'added' | 'removed' | 'changed' | 'unchanged';

export interface EnvChange {
  key: string;
  changeType: ChangeType;
  oldValue?: string;
  newValue?: string;
}

export interface ComparisonResult {
  changes: EnvChange[];
  added: EnvChange[];
  removed: EnvChange[];
  changed: EnvChange[];
  unchanged: EnvChange[];
  hasChanges: boolean;
}

export function compareEnvRecords(
  base: Record<string, string>,
  next: Record<string, string>
): ComparisonResult {
  const allKeys = new Set([...Object.keys(base), ...Object.keys(next)]);
  const changes: EnvChange[] = [];

  for (const key of Array.from(allKeys).sort()) {
    const oldValue = base[key];
    const newValue = next[key];

    if (oldValue === undefined) {
      changes.push({ key, changeType: 'added', newValue });
    } else if (newValue === undefined) {
      changes.push({ key, changeType: 'removed', oldValue });
    } else if (oldValue !== newValue) {
      changes.push({ key, changeType: 'changed', oldValue, newValue });
    } else {
      changes.push({ key, changeType: 'unchanged', oldValue, newValue });
    }
  }

  return {
    changes,
    added: changes.filter(c => c.changeType === 'added'),
    removed: changes.filter(c => c.changeType === 'removed'),
    changed: changes.filter(c => c.changeType === 'changed'),
    unchanged: changes.filter(c => c.changeType === 'unchanged'),
    hasChanges: changes.some(c => c.changeType !== 'unchanged'),
  };
}

export function formatComparison(result: ComparisonResult): string {
  if (!result.hasChanges) return 'No changes detected.';

  const lines: string[] = [];
  for (const change of result.changes) {
    if (change.changeType === 'added') {
      lines.push(`+ ${change.key}=${change.newValue}`);
    } else if (change.changeType === 'removed') {
      lines.push(`- ${change.key}=${change.oldValue}`);
    } else if (change.changeType === 'changed') {
      lines.push(`~ ${change.key}: ${change.oldValue} → ${change.newValue}`);
    }
  }
  return lines.join('\n');
}
