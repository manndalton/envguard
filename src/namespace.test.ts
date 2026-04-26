import { namespaceEnv, getNamespace } from './namespace';

describe('namespaceEnv', () => {
  const flat = {
    DB_HOST: 'localhost',
    DB_PORT: 5432,
    DB_NAME: 'mydb',
    APP_NAME: 'envguard',
    APP_DEBUG: true,
    PORT: 3000,
  };

  it('groups keys by their prefix', () => {
    const grouped = namespaceEnv(flat);
    expect(grouped['DB']).toEqual({ HOST: 'localhost', PORT: 5432, NAME: 'mydb' });
    expect(grouped['APP']).toEqual({ NAME: 'envguard', DEBUG: true });
  });

  it('places keys without a separator into the catch-all namespace', () => {
    const grouped = namespaceEnv(flat);
    expect(grouped['__root__']).toEqual({ PORT: 3000 });
  });

  it('respects a custom separator', () => {
    const env = { 'DB.HOST': 'localhost', 'DB.PORT': 5432, STANDALONE: 'yes' };
    const grouped = namespaceEnv(env, { separator: '.' });
    expect(grouped['DB']).toEqual({ HOST: 'localhost', PORT: 5432 });
    expect(grouped['__root__']).toEqual({ STANDALONE: 'yes' });
  });

  it('respects a custom catchAll namespace name', () => {
    const grouped = namespaceEnv(flat, { catchAll: 'ROOT' });
    expect(grouped['ROOT']).toEqual({ PORT: 3000 });
    expect(grouped['__root__']).toBeUndefined();
  });

  it('returns an empty object for an empty input', () => {
    expect(namespaceEnv({})).toEqual({});
  });

  it('handles multiple underscores — only splits on the first', () => {
    const env = { DB_PRIMARY_HOST: 'db1' };
    const grouped = namespaceEnv(env);
    expect(grouped['DB']).toEqual({ PRIMARY_HOST: 'db1' });
  });
});

describe('getNamespace', () => {
  const grouped = namespaceEnv({
    DB_HOST: 'localhost',
    APP_NAME: 'envguard',
  });

  it('returns the correct namespace bucket', () => {
    expect(getNamespace(grouped, 'DB')).toEqual({ HOST: 'localhost' });
  });

  it('returns an empty object for a missing namespace', () => {
    expect(getNamespace(grouped, 'MISSING')).toEqual({});
  });
});
