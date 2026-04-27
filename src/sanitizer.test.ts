import { describe, it, expect } from 'vitest';
import { sanitizeValue, sanitizeEnv } from './sanitizer';

describe('sanitizeValue', () => {
  it('trims whitespace by default', () => {
    expect(sanitizeValue('  hello  ')).toBe('hello');
  });

  it('strips double quotes by default', () => {
    expect(sanitizeValue('"my value"')).toBe('my value');
  });

  it('strips single quotes by default', () => {
    expect(sanitizeValue("'my value'")).toBe('my value');
  });

  it('does not strip mismatched quotes', () => {
    expect(sanitizeValue('"bad\')')).toBe('"bad\')');
  });

  it('does not strip quotes when stripQuotes is false', () => {
    expect(sanitizeValue('"keep"', { stripQuotes: false })).toBe('"keep"');
  });

  it('does not trim when trim is false', () => {
    expect(sanitizeValue('  spaced  ', { trim: false })).toBe('  spaced  ');
  });

  it('collapses internal whitespace when enabled', () => {
    expect(sanitizeValue('foo   bar  baz', { collapseWhitespace: true })).toBe(
      'foo bar baz'
    );
  });

  it('converts to lowercase', () => {
    expect(sanitizeValue('Hello World', { lowercase: true })).toBe(
      'hello world'
    );
  });

  it('converts to uppercase', () => {
    expect(sanitizeValue('hello world', { uppercase: true })).toBe(
      'HELLO WORLD'
    );
  });

  it('lowercase takes precedence over uppercase', () => {
    expect(
      sanitizeValue('Mixed', { lowercase: true, uppercase: true })
    ).toBe('mixed');
  });

  it('handles empty string', () => {
    expect(sanitizeValue('')).toBe('');
  });

  it('applies trim then stripQuotes in correct order', () => {
    expect(sanitizeValue('  "padded"  ')).toBe('padded');
  });
});

describe('sanitizeEnv', () => {
  it('sanitizes all values in a record', () => {
    const raw = {
      HOST: '  "localhost"  ',
      PORT: '  3000  ',
      DEBUG: '"true"',
    };
    expect(sanitizeEnv(raw)).toEqual({
      HOST: 'localhost',
      PORT: '3000',
      DEBUG: 'true',
    });
  });

  it('passes options to each value', () => {
    const raw = { NODE_ENV: 'Production', LOG_LEVEL: 'INFO' };
    expect(sanitizeEnv(raw, { lowercase: true })).toEqual({
      NODE_ENV: 'production',
      LOG_LEVEL: 'info',
    });
  });

  it('returns a new object without mutating the original', () => {
    const raw = { KEY: '  value  ' };
    const result = sanitizeEnv(raw);
    expect(raw.KEY).toBe('  value  ');
    expect(result.KEY).toBe('value');
  });

  it('handles an empty record', () => {
    expect(sanitizeEnv({})).toEqual({});
  });
});
