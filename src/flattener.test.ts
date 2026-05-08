import { describe, it, expect } from 'vitest';
import { flattenEnv, expandEnv, hasNestedKeys } from './flattener';

describe('flattenEnv', () => {
  it('flattens a shallow nested object', () => {
    const input = { db: { host: 'localhost', port: '5432' } };
    expect(flattenEnv(input)).toEqual({
      'db.host': 'localhost',
      'db.port': '5432',
    });
  });

  it('flattens a deeply nested object', () => {
    const input = { a: { b: { c: 'deep' } } };
    expect(flattenEnv(input)).toEqual({ 'a.b.c': 'deep' });
  });

  it('leaves flat keys unchanged', () => {
    const input = { HOST: 'localhost', PORT: '3000' };
    expect(flattenEnv(input)).toEqual({ HOST: 'localhost', PORT: '3000' });
  });

  it('converts non-string primitives to strings', () => {
    const input = { port: 3000 as unknown as string, flag: true as unknown as string };
    const result = flattenEnv(input as never);
    expect(result['port']).toBe('3000');
    expect(result['flag']).toBe('true');
  });

  it('supports a custom separator', () => {
    const input = { db: { host: 'localhost' } };
    expect(flattenEnv(input, '', '_')).toEqual({ db_host: 'localhost' });
  });

  it('handles null values as empty string', () => {
    const input = { key: null };
    expect(flattenEnv(input as never)).toEqual({ key: '' });
  });
});

describe('expandEnv', () => {
  it('expands dot-notation keys into nested objects', () => {
    const input = { 'db.host': 'localhost', 'db.port': '5432' };
    expect(expandEnv(input)).toEqual({ db: { host: 'localhost', port: '5432' } });
  });

  it('expands deeply nested keys', () => {
    const input = { 'a.b.c': 'deep' };
    expect(expandEnv(input)).toEqual({ a: { b: { c: 'deep' } } });
  });

  it('leaves non-nested keys at the root', () => {
    const input = { HOST: 'localhost', PORT: '3000' };
    expect(expandEnv(input)).toEqual({ HOST: 'localhost', PORT: '3000' });
  });

  it('supports a custom separator', () => {
    const input = { db_host: 'localhost' };
    expect(expandEnv(input, '_')).toEqual({ db: { host: 'localhost' } });
  });

  it('merges sibling keys under the same parent', () => {
    const input = { 'app.name': 'envguard', 'app.version': '1.0.0' };
    const result = expandEnv(input);
    expect(result).toEqual({ app: { name: 'envguard', version: '1.0.0' } });
  });
});

describe('hasNestedKeys', () => {
  it('returns true when at least one key contains a separator', () => {
    expect(hasNestedKeys({ 'db.host': 'x' })).toBe(true);
  });

  it('returns false when no keys contain a separator', () => {
    expect(hasNestedKeys({ HOST: 'x', PORT: '3000' })).toBe(false);
  });

  it('respects custom separator', () => {
    expect(hasNestedKeys({ db_host: 'x' }, '_')).toBe(true);
    expect(hasNestedKeys({ 'db.host': 'x' }, '_')).toBe(false);
  });
});
