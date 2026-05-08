import { resolveSources, flattenResolved, resolveEnv } from './resolver';
import { str, num } from './schema';

describe('resolveSources', () => {
  const fileSource = {
    name: 'file',
    priority: 1,
    values: { PORT: '3000', HOST: 'localhost' },
  };
  const envSource = {
    name: 'process.env',
    priority: 2,
    values: { PORT: '8080' },
  };
  const defaultSource = {
    name: 'defaults',
    priority: 0,
    values: { PORT: '80', HOST: '0.0.0.0', DEBUG: 'false' },
  };

  it('picks the highest-priority source for each key', () => {
    const result = resolveSources(['PORT', 'HOST'], [fileSource, envSource, defaultSource]);
    expect(result['PORT'].value).toBe('8080');
    expect(result['PORT'].source).toBe('process.env');
    expect(result['HOST'].value).toBe('localhost');
    expect(result['HOST'].source).toBe('file');
  });

  it('falls back to lower-priority source when higher has no value', () => {
    const result = resolveSources(['DEBUG'], [fileSource, envSource, defaultSource]);
    expect(result['DEBUG'].value).toBe('false');
    expect(result['DEBUG'].source).toBe('defaults');
  });

  it('returns undefined source "none" when no source has the key', () => {
    const result = resolveSources(['MISSING'], [fileSource, envSource]);
    expect(result['MISSING'].value).toBeUndefined();
    expect(result['MISSING'].source).toBe('none');
  });

  it('handles empty sources array gracefully', () => {
    const result = resolveSources(['PORT'], []);
    expect(result['PORT'].source).toBe('none');
  });

  it('handles sources without explicit priority (defaults to 0)', () => {
    const a = { name: 'a', values: { X: 'from-a' } };
    const b = { name: 'b', priority: 1, values: { X: 'from-b' } };
    const result = resolveSources(['X'], [a, b]);
    expect(result['X'].value).toBe('from-b');
  });

  it('handles multiple keys in a single call', () => {
    const result = resolveSources(
      ['PORT', 'HOST', 'DEBUG'],
      [fileSource, envSource, defaultSource]
    );
    expect(Object.keys(result)).toEqual(expect.arrayContaining(['PORT', 'HOST', 'DEBUG']));
    expect(result['PORT'].value).toBe('8080');
    expect(result['HOST'].value).toBe('localhost');
    expect(result['DEBUG'].value).toBe('false');
  });
});

describe('flattenResolved', () => {
  it('converts resolved entries to a plain key/value map', () => {
    const resolved = {
      PORT: { key: 'PORT', value: '3000', source: 'file' },
      HOST: { key: 'HOST', value: undefined, source: 'none' },
    };
    const flat = flattenResolved(resolved);
    expect(flat).toEqual({ PORT: '3000', HOST: undefined });
  });
});

describe('resolveEnv', () => {
  const schema = { PORT: num(), APP_NAME: str() };

  it('returns only keys defined in the schema', () => {
    const sources = [
      { name: 'env', priority: 1, values: { PORT: '4000', APP_NAME: 'myapp', EXTRA: 'ignored' } },
    ];
    const result = resolveEnv(schema, sources);
    expect(Object.keys(result)).toEqual(expect.arrayContaining(['PORT', 'APP_NAME']));
    expect(result['EXTRA']).toBeUndefined();
  });

  it('integrates multiple sources correctly', () => {
    const sources = [
      { name: 'defaults', priority: 0, values: { PORT: '80', APP_NAME: 'default-app' } },
      { name: 'env', priority: 1, values: { PORT: '9000' } },
    ];
    const result = resolveEnv(schema, sources);
    expect(result['PORT']).toBe('9000');
    // APP_NAME should fall back to the defaults source
    expect(result['APP_NAME']).toBe('default-app');
  });
});
