import { describe, it, expect } from 'vitest';
import {
  coerceString,
  coerceNumber,
  coerceBoolean,
  coerce,
  defaultCoercers,
} from './coercer';

describe('coerceString', () => {
  it('trims whitespace', () => {
    expect(coerceString('  hello  ')).toBe('hello');
  });

  it('returns empty string when blank', () => {
    expect(coerceString('   ')).toBe('');
  });
});

describe('coerceNumber', () => {
  it('parses integer strings', () => {
    expect(coerceNumber('42')).toBe(42);
  });

  it('parses float strings', () => {
    expect(coerceNumber('3.14')).toBeCloseTo(3.14);
  });

  it('trims whitespace before parsing', () => {
    expect(coerceNumber('  7  ')).toBe(7);
  });

  it('throws on non-numeric string', () => {
    expect(() => coerceNumber('abc')).toThrow(TypeError);
  });

  it('throws on empty string', () => {
    expect(() => coerceNumber('')).toThrow(TypeError);
  });
});

describe('coerceBoolean', () => {
  it.each(['true', '1', 'yes', 'on', 'TRUE', 'YES'])(
    'coerces "%s" to true',
    (val) => {
      expect(coerceBoolean(val)).toBe(true);
    }
  );

  it.each(['false', '0', 'no', 'off', 'FALSE', 'NO'])(
    'coerces "%s" to false',
    (val) => {
      expect(coerceBoolean(val)).toBe(false);
    }
  );

  it('throws on unrecognised value', () => {
    expect(() => coerceBoolean('maybe')).toThrow(TypeError);
  });
});

describe('coerce', () => {
  it('uses the correct coercer for known types', () => {
    expect(coerce<number>('99', 'number')).toBe(99);
    expect(coerce<boolean>('yes', 'boolean')).toBe(true);
    expect(coerce<string>('  hi  ', 'string')).toBe('hi');
  });

  it('falls back to string coercer for unknown type', () => {
    expect(coerce('  test  ', 'unknown')).toBe('test');
  });

  it('accepts a custom coercer map', () => {
    const custom = {
      ...defaultCoercers,
      json: (raw: string) => JSON.parse(raw),
    };
    expect(coerce<{ a: number }>('{"a":1}', 'json', custom)).toEqual({ a: 1 });
  });
});
