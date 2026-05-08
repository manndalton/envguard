import { describe, it, expect } from 'vitest';
import { normalizeKey, normalizeValue, normalizeEnv } from './normalizer';

describe('normalizeKey', () => {
  it('trims surrounding whitespace', () => {
    expect(normalizeKey('  MY_VAR  ')).toBe('MY_VAR');
  });

  it('uppercases keys by default', () => {
    expect(normalizeKey('database_host')).toBe('DATABASE_HOST');
  });

  it('preserves case when uppercaseKeys is false', () => {
    expect(normalizeKey('database_host', { uppercaseKeys: false })).toBe('database_host');
  });

  it('handles already-uppercase keys', () => {
    expect(normalizeKey('PORT')).toBe('PORT');
  });
});

describe('normalizeValue', () => {
  it('trims surrounding whitespace by default', () => {
    expect(normalizeValue('  hello world  ')).toBe('hello world');
  });

  it('does not trim when trimValues is false', () => {
    expect(normalizeValue('  hello  ', { trimValues: false })).toBe('  hello  ');
  });

  it('collapses internal whitespace when option is set', () => {
    expect(normalizeValue('hello   world', { collapseWhitespace: true })).toBe('hello world');
  });

  it('does not collapse whitespace by default', () => {
    expect(normalizeValue('hello   world')).toBe('hello   world');
  });

  it('trims AND collapses when both options active', () => {
    expect(normalizeValue('  foo   bar  ', { trimValues: true, collapseWhitespace: true })).toBe('foo bar');
  });
});

describe('normalizeEnv', () => {
  it('normalises all keys and values', () => {
    const raw = { '  db_host  ': '  localhost  ', '  db_port  ': '  5432  ' };
    expect(normalizeEnv(raw)).toEqual({ DB_HOST: 'localhost', DB_PORT: '5432' });
  });

  it('last value wins for duplicate normalised keys', () => {
    const raw = { db_host: 'first', DB_HOST: 'second' };
    expect(normalizeEnv(raw)).toEqual({ DB_HOST: 'second' });
  });

  it('respects collapseWhitespace option', () => {
    const raw = { LOG_MSG: 'hello   world' };
    expect(normalizeEnv(raw, { collapseWhitespace: true })).toEqual({ LOG_MSG: 'hello world' });
  });

  it('preserves key case when uppercaseKeys is false', () => {
    const raw = { api_key: 'abc123' };
    expect(normalizeEnv(raw, { uppercaseKeys: false })).toEqual({ api_key: 'abc123' });
  });

  it('returns empty object for empty input', () => {
    expect(normalizeEnv({})).toEqual({});
  });
});
