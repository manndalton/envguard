import { describe, it, expect } from 'vitest';
import { diffEnvRecords, hasDifferences } from './differ';

describe('diffEnvRecords', () => {
  it('detects added keys', () => {
    const before = { FOO: 'bar' };
    const after = { FOO: 'bar', BAZ: 'qux' };
    const diff = diffEnvRecords(before, after);
    expect(diff.added).toEqual(['BAZ']);
    expect(diff.removed).toEqual([]);
    expect(diff.changed).toEqual([]);
  });

  it('detects removed keys', () => {
    const before = { FOO: 'bar', BAZ: 'qux' };
    const after = { FOO: 'bar' };
    const diff = diffEnvRecords(before, after);
    expect(diff.removed).toEqual(['BAZ']);
    expect(diff.added).toEqual([]);
  });

  it('detects changed values', () => {
    const before = { FOO: 'bar' };
    const after = { FOO: 'baz' };
    const diff = diffEnvRecords(before, after);
    expect(diff.changed).toEqual(['FOO']);
    const entry = diff.entries.find(e => e.key === 'FOO')!;
    expect(entry.before).toBe('bar');
    expect(entry.after).toBe('baz');
  });

  it('marks unchanged keys', () => {
    const before = { FOO: 'bar', PORT: '3000' };
    const after = { FOO: 'bar', PORT: '3000' };
    const diff = diffEnvRecords(before, after);
    expect(diff.unchanged).toEqual(['FOO', 'PORT']);
    expect(hasDifferences(diff)).toBe(false);
  });

  it('handles empty records', () => {
    const diff = diffEnvRecords({}, {});
    expect(diff.entries).toHaveLength(0);
    expect(hasDifferences(diff)).toBe(false);
  });

  it('sorts entries by key', () => {
    const before = { Z: '1', A: '2' };
    const after = { Z: '1', A: '2' };
    const diff = diffEnvRecords(before, after);
    expect(diff.entries.map(e => e.key)).toEqual(['A', 'Z']);
  });

  it('handles mixed changes', () => {
    const before = { A: '1', B: '2', C: '3' };
    const after = { A: '1', B: '99', D: '4' };
    const diff = diffEnvRecords(before, after);
    expect(diff.added).toEqual(['D']);
    expect(diff.removed).toEqual(['C']);
    expect(diff.changed).toEqual(['B']);
    expect(diff.unchanged).toEqual(['A']);
    expect(hasDifferences(diff)).toBe(true);
  });
});

describe('hasDifferences', () => {
  it('returns false when nothing changed', () => {
    const diff = diffEnvRecords({ X: '1' }, { X: '1' });
    expect(hasDifferences(diff)).toBe(false);
  });

  it('returns true when something changed', () => {
    const diff = diffEnvRecords({ X: '1' }, { X: '2' });
    expect(hasDifferences(diff)).toBe(true);
  });
});
