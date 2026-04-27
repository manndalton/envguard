import { describe, it, expect } from 'vitest';
import { castValue, castEnv, CastError } from './caster';

describe('castValue', () => {
  describe('string', () => {
    it('returns string as-is', () => {
      expect(castValue('K', 'hello', 'string')).toBe('hello');
    });

    it('converts number to string', () => {
      expect(castValue('K', 42, 'string')).toBe('42');
    });
  });

  describe('number', () => {
    it('parses valid numeric string', () => {
      expect(castValue('K', '3.14', 'number')).toBe(3.14);
    });

    it('throws CastError for non-numeric string', () => {
      expect(() => castValue('K', 'abc', 'number')).toThrow(CastError);
    });

    it('returns fallback for non-numeric string when fallback provided', () => {
      expect(castValue('K', 'abc', 'number', { fallback: 0 })).toBe(0);
    });
  });

  describe('boolean', () => {
    it.each([['true'], ['1'], ['yes'], ['on']])('casts %s to true', (val) => {
      expect(castValue('K', val, 'boolean')).toBe(true);
    });

    it.each([['false'], ['0'], ['no'], ['off']])('casts %s to false', (val) => {
      expect(castValue('K', val, 'boolean')).toBe(false);
    });

    it('throws CastError for unknown boolean string', () => {
      expect(() => castValue('K', 'maybe', 'boolean')).toThrow(CastError);
    });

    it('returns fallback for unknown boolean string', () => {
      expect(castValue('K', 'maybe', 'boolean', { fallback: false })).toBe(false);
    });
  });

  describe('json', () => {
    it('parses valid JSON string', () => {
      expect(castValue('K', '{"a":1}', 'json')).toEqual({ a: 1 });
    });

    it('throws CastError for invalid JSON', () => {
      expect(() => castValue('K', '{bad}', 'json')).toThrow(CastError);
    });

    it('returns fallback for invalid JSON when fallback provided', () => {
      expect(castValue('K', '{bad}', 'json', { fallback: {} })).toEqual({});
    });
  });

  describe('empty / missing values', () => {
    it('returns fallback when raw is empty string', () => {
      expect(castValue('K', '', 'number', { fallback: -1 })).toBe(-1);
    });

    it('returns raw when empty and no fallback and not strict', () => {
      expect(castValue('K', '', 'number')).toBe('');
    });

    it('throws when empty, strict mode, no fallback', () => {
      expect(() => castValue('K', '', 'number', { strict: true })).toThrow(CastError);
    });
  });
});

describe('castEnv', () => {
  it('casts multiple keys according to targets map', () => {
    const env = { PORT: '8080', DEBUG: 'true', RATIO: '0.5' };
    const result = castEnv(env, { PORT: 'number', DEBUG: 'boolean', RATIO: 'number' });
    expect(result).toEqual({ PORT: 8080, DEBUG: true, RATIO: 0.5 });
  });

  it('leaves untargeted keys unchanged', () => {
    const env = { NAME: 'app', PORT: '3000' };
    const result = castEnv(env, { PORT: 'number' });
    expect(result.NAME).toBe('app');
  });

  it('propagates CastError for invalid values', () => {
    const env = { PORT: 'not-a-number' };
    expect(() => castEnv(env, { PORT: 'number' })).toThrow(CastError);
  });
});
