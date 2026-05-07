import { describe, it, expect } from 'vitest';
import {
  compareEnvRecords,
  formatComparison,
  type ComparisonResult,
} from './comparator';

describe('compareEnvRecords', () => {
  it('reports added keys', () => {
    const result = compareEnvRecords({}, { NEW_KEY: 'hello' });
    expect(result.added).toHaveLength(1);
    expect(result.added[0]).toMatchObject({ key: 'NEW_KEY', changeType: 'added', newValue: 'hello' });
    expect(result.hasChanges).toBe(true);
  });

  it('reports removed keys', () => {
    const result = compareEnvRecords({ OLD_KEY: 'bye' }, {});
    expect(result.removed).toHaveLength(1);
    expect(result.removed[0]).toMatchObject({ key: 'OLD_KEY', changeType: 'removed', oldValue: 'bye' });
  });

  it('reports changed keys', () => {
    const result = compareEnvRecords({ PORT: '3000' }, { PORT: '4000' });
    expect(result.changed).toHaveLength(1);
    expect(result.changed[0]).toMatchObject({
      key: 'PORT',
      changeType: 'changed',
      oldValue: '3000',
      newValue: '4000',
    });
  });

  it('reports unchanged keys', () => {
    const result = compareEnvRecords({ HOST: 'localhost' }, { HOST: 'localhost' });
    expect(result.unchanged).toHaveLength(1);
    expect(result.unchanged[0].changeType).toBe('unchanged');
    expect(result.hasChanges).toBe(false);
  });

  it('handles mixed changes', () => {
    const base = { A: '1', B: '2', C: '3' };
    const next = { A: '1', B: '99', D: '4' };
    const result = compareEnvRecords(base, next);
    expect(result.unchanged).toHaveLength(1);
    expect(result.changed).toHaveLength(1);
    expect(result.removed).toHaveLength(1);
    expect(result.added).toHaveLength(1);
    expect(result.hasChanges).toBe(true);
  });

  it('returns keys in sorted order', () => {
    const result = compareEnvRecords({ Z: '1', A: '2' }, { Z: '1', A: '2' });
    const keys = result.changes.map(c => c.key);
    expect(keys).toEqual(['A', 'Z']);
  });

  it('returns no changes for identical records', () => {
    const env = { FOO: 'bar', BAZ: 'qux' };
    const result = compareEnvRecords(env, { ...env });
    expect(result.hasChanges).toBe(false);
    expect(result.changes).toHaveLength(2);
  });
});

describe('formatComparison', () => {
  it('returns message when no changes', () => {
    const result = compareEnvRecords({ A: '1' }, { A: '1' });
    expect(formatComparison(result)).toBe('No changes detected.');
  });

  it('formats added lines with +', () => {
    const result = compareEnvRecords({}, { NEW: 'val' });
    expect(formatComparison(result)).toContain('+ NEW=val');
  });

  it('formats removed lines with -', () => {
    const result = compareEnvRecords({ OLD: 'val' }, {});
    expect(formatComparison(result)).toContain('- OLD=val');
  });

  it('formats changed lines with ~', () => {
    const result = compareEnvRecords({ PORT: '3000' }, { PORT: '4000' });
    expect(formatComparison(result)).toContain('~ PORT: 3000 → 4000');
  });
});
