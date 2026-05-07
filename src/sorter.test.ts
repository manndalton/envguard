import { describe, it, expect } from 'vitest';
import { sortEnvByKey, sortEnvByValue, groupEnvByPrefix } from './sorter';

const sampleEnv: Record<string, string> = {
  ZEBRA: 'last',
  APP_NAME: 'myapp',
  DB_HOST: 'localhost',
  APP_PORT: '3000',
  ALPHA: 'first',
};

describe('sortEnvByKey', () => {
  it('sorts keys in ascending order by default', () => {
    const result = sortEnvByKey(sampleEnv);
    const keys = Object.keys(result);
    expect(keys).toEqual([...keys].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())));
  });

  it('sorts keys in descending order', () => {
    const result = sortEnvByKey(sampleEnv, { order: 'desc' });
    const keys = Object.keys(result);
    const expected = [...Object.keys(sampleEnv)].sort((a, b) =>
      b.toLowerCase().localeCompare(a.toLowerCase())
    );
    expect(keys).toEqual(expected);
  });

  it('places priority keys first', () => {
    const result = sortEnvByKey(sampleEnv, { priorityKeys: ['ZEBRA', 'ALPHA'] });
    const keys = Object.keys(result);
    expect(keys[0]).toBe('ZEBRA');
    expect(keys[1]).toBe('ALPHA');
  });

  it('preserves all keys', () => {
    const result = sortEnvByKey(sampleEnv);
    expect(Object.keys(result)).toHaveLength(Object.keys(sampleEnv).length);
  });

  it('preserves values', () => {
    const result = sortEnvByKey(sampleEnv);
    for (const [k, v] of Object.entries(sampleEnv)) {
      expect(result[k]).toBe(v);
    }
  });
});

describe('sortEnvByValue', () => {
  it('sorts by value ascending', () => {
    const result = sortEnvByValue(sampleEnv);
    const values = Object.values(result);
    const sorted = [...values].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    expect(values).toEqual(sorted);
  });

  it('sorts by value descending', () => {
    const result = sortEnvByValue(sampleEnv, { order: 'desc' });
    const values = Object.values(result);
    const sorted = [...values].sort((a, b) => b.toLowerCase().localeCompare(a.toLowerCase()));
    expect(values).toEqual(sorted);
  });

  it('preserves all entries', () => {
    const result = sortEnvByValue(sampleEnv);
    expect(Object.keys(result)).toHaveLength(Object.keys(sampleEnv).length);
  });
});

describe('groupEnvByPrefix', () => {
  it('groups keys by prefix', () => {
    const result = groupEnvByPrefix(sampleEnv);
    expect(result['APP']).toBeDefined();
    expect(result['DB']).toBeDefined();
    expect(Object.keys(result['APP'])).toContain('APP_NAME');
    expect(Object.keys(result['APP'])).toContain('APP_PORT');
    expect(Object.keys(result['DB'])).toContain('DB_HOST');
  });

  it('places keys without underscore into __UNGROUPED__', () => {
    const result = groupEnvByPrefix(sampleEnv);
    expect(result['__UNGROUPED__']).toBeDefined();
    expect(Object.keys(result['__UNGROUPED__'])).toContain('ZEBRA');
    expect(Object.keys(result['__UNGROUPED__'])).toContain('ALPHA');
  });

  it('returns empty object for empty input', () => {
    expect(groupEnvByPrefix({})).toEqual({});
  });
});
