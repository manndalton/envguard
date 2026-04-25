import { describe, it, expect } from 'vitest';
import {
  maskValue,
  maskEnv,
  DEFAULT_SENSITIVE_PATTERNS,
  MaskOptions,
} from './mask';

describe('maskValue', () => {
  it('masks entire value by default', () => {
    expect(maskValue('supersecret')).toBe('****');
  });

  it('respects minMaskLength', () => {
    expect(maskValue('hi', { minMaskLength: 6 })).toBe('******');
  });

  it('reveals start characters', () => {
    const result = maskValue('abcdefgh', { revealStart: 2 });
    expect(result).toBe('ab****');
  });

  it('reveals end characters', () => {
    const result = maskValue('abcdefgh', { revealEnd: 2 });
    expect(result).toBe('****gh');
  });

  it('reveals both start and end', () => {
    const result = maskValue('abcdefgh', { revealStart: 2, revealEnd: 2 });
    expect(result).toBe('ab****gh');
  });

  it('uses custom mask character', () => {
    const result = maskValue('secret', { maskChar: '#' });
    expect(result).toBe('####');
  });

  it('returns empty string unchanged', () => {
    expect(maskValue('')).toBe('');
  });

  it('handles short values gracefully', () => {
    const result = maskValue('ab', { revealStart: 1, revealEnd: 1 });
    expect(result).toBe('a****b');
  });
});

describe('maskEnv', () => {
  const env = {
    HOST: 'localhost',
    PORT: '3000',
    API_KEY: 'my-super-secret-key',
    DB_PASSWORD: 'hunter2',
    AUTH_TOKEN: 'tok_abc123',
    APP_NAME: 'envguard',
  };

  it('masks keys matching string patterns', () => {
    const result = maskEnv(env, ['API_KEY']);
    expect(result['API_KEY']).toBe('****');
    expect(result['HOST']).toBe('localhost');
  });

  it('masks keys matching regex patterns', () => {
    const result = maskEnv(env, [/password/i, /token/i]);
    expect(result['DB_PASSWORD']).toBe('****');
    expect(result['AUTH_TOKEN']).toBe('****');
    expect(result['HOST']).toBe('localhost');
  });

  it('does not mutate original env', () => {
    const original = { SECRET: 'abc' };
    maskEnv(original, ['SECRET']);
    expect(original['SECRET']).toBe('abc');
  });

  it('works with DEFAULT_SENSITIVE_PATTERNS', () => {
    const result = maskEnv(env, DEFAULT_SENSITIVE_PATTERNS);
    expect(result['API_KEY']).not.toBe('my-super-secret-key');
    expect(result['DB_PASSWORD']).not.toBe('hunter2');
    expect(result['AUTH_TOKEN']).not.toBe('tok_abc123');
    expect(result['APP_NAME']).toBe('envguard');
    expect(result['PORT']).toBe('3000');
  });
});
