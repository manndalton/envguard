import { applyDefaults, findMissingWithoutDefaults } from './defaults';
import { str, num, bool } from './schema';

const schema = {
  HOST: str(),
  PORT: num(),
  DEBUG: bool(),
  SECRET: str(),
};

describe('applyDefaults', () => {
  it('fills in missing keys from defaults', () => {
    const env = { HOST: 'localhost' };
    const defaults = { PORT: '3000', DEBUG: 'false' };
    const result = applyDefaults(env, defaults);
    expect(result.PORT).toBe('3000');
    expect(result.DEBUG).toBe('false');
    expect(result.HOST).toBe('localhost');
  });

  it('does not overwrite existing values', () => {
    const env = { HOST: 'myhost', PORT: '8080' };
    const defaults = { PORT: '3000' };
    const result = applyDefaults(env, defaults);
    expect(result.PORT).toBe('8080');
  });

  it('fills in keys with empty string values', () => {
    const env = { HOST: '' };
    const defaults = { HOST: 'fallback' };
    const result = applyDefaults(env, defaults);
    expect(result.HOST).toBe('fallback');
  });

  it('does not mutate the original env object', () => {
    const env = { HOST: 'localhost' };
    const defaults = { PORT: '3000' };
    applyDefaults(env, defaults);
    expect((env as Record<string, string | undefined>).PORT).toBeUndefined();
  });

  it('returns env unchanged when defaults is empty', () => {
    const env = { HOST: 'localhost', PORT: '8080' };
    const result = applyDefaults(env, {});
    expect(result).toEqual(env);
  });
});

describe('findMissingWithoutDefaults', () => {
  it('returns keys missing from both env and defaults', () => {
    const env = { HOST: 'localhost' };
    const defaults = { PORT: '3000' };
    const missing = findMissingWithoutDefaults(env, schema, defaults);
    expect(missing).toContain('DEBUG');
    expect(missing).toContain('SECRET');
    expect(missing).not.toContain('HOST');
    expect(missing).not.toContain('PORT');
  });

  it('returns empty array when all keys are covered', () => {
    const env = { HOST: 'localhost', PORT: '3000', DEBUG: 'true', SECRET: 'abc' };
    const missing = findMissingWithoutDefaults(env, schema, {});
    expect(missing).toHaveLength(0);
  });

  it('treats empty string env values as missing', () => {
    const env = { HOST: '', PORT: '3000', DEBUG: 'true', SECRET: 'x' };
    const missing = findMissingWithoutDefaults(env, schema, {});
    expect(missing).toContain('HOST');
  });
});
