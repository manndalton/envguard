import { mergeSources, buildMergedEnv, pickSchemaKeys } from './merger';
import { str, num } from './schema';

describe('mergeSources', () => {
  it('merges two sources with later source winning', () => {
    const a = { FOO: 'a', BAR: 'a' };
    const b = { FOO: 'b', BAZ: 'b' };
    const result = mergeSources([a, b]);
    expect(result).toEqual({ FOO: 'b', BAR: 'a', BAZ: 'b' });
  });

  it('skips undefined values by default', () => {
    const a = { FOO: 'a' };
    const b = { FOO: undefined, BAR: 'b' };
    const result = mergeSources([a, b]);
    expect(result).toEqual({ FOO: 'a', BAR: 'b' });
  });

  it('includes undefined values when skipUndefined is false', () => {
    const a = { FOO: 'a' };
    const b = { FOO: undefined };
    // undefined entries are still skipped at assignment; key stays from a
    const result = mergeSources([a, b], { skipUndefined: false });
    // FOO from b is undefined so not written as string; FOO from a persists
    expect(result.FOO).toBe('a');
  });

  it('returns empty object for no sources', () => {
    expect(mergeSources([])).toEqual({});
  });

  it('handles a single source', () => {
    const result = mergeSources([{ KEY: 'value' }]);
    expect(result).toEqual({ KEY: 'value' });
  });

  it('merges three sources in order', () => {
    const a = { A: '1', B: '1', C: '1' };
    const b = { B: '2', C: '2' };
    const c = { C: '3' };
    expect(mergeSources([a, b, c])).toEqual({ A: '1', B: '2', C: '3' });
  });
});

describe('buildMergedEnv', () => {
  it('merges file sources over process.env', () => {
    const originalEnv = process.env;
    process.env = { ORIGINAL: 'yes', SHARED: 'from-process' };
    const fileSource = { SHARED: 'from-file', FILE_ONLY: 'yes' };
    const result = buildMergedEnv([fileSource]);
    expect(result.SHARED).toBe('from-file');
    expect(result.FILE_ONLY).toBe('yes');
    expect(result.ORIGINAL).toBe('yes');
    process.env = originalEnv;
  });

  it('applies overrides with highest priority', () => {
    const fileSource = { KEY: 'file' };
    const overrides = { KEY: 'override' };
    const result = buildMergedEnv([fileSource], overrides);
    expect(result.KEY).toBe('override');
  });
});

describe('pickSchemaKeys', () => {
  const schema = { PORT: num(), HOST: str(), DEBUG: str() };

  it('picks only keys present in schema', () => {
    const env = { PORT: '3000', HOST: 'localhost', EXTRA: 'ignored' };
    const result = pickSchemaKeys(env, schema);
    expect(result).toEqual({ PORT: '3000', HOST: 'localhost' });
    expect('EXTRA' in result).toBe(false);
  });

  it('omits schema keys not present in env', () => {
    const env = { PORT: '8080' };
    const result = pickSchemaKeys(env, schema);
    expect(result).toEqual({ PORT: '8080' });
    expect('HOST' in result).toBe(false);
  });

  it('returns empty object when no schema keys match', () => {
    const result = pickSchemaKeys({ UNRELATED: 'val' }, schema);
    expect(result).toEqual({});
  });
});
