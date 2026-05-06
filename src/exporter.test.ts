import { toDotEnv, toJson, toShell, exportEnv } from './exporter';

const sample: Record<string, unknown> = {
  APP_NAME: 'my app',
  PORT: 3000,
  DEBUG: true,
  DB_URL: 'postgres://localhost/db',
};

describe('toDotEnv', () => {
  it('quotes values that contain spaces', () => {
    const out = toDotEnv(sample);
    expect(out).toContain('APP_NAME="my app"');
  });

  it('does not quote values without spaces', () => {
    const out = toDotEnv(sample);
    expect(out).toContain('DB_URL=postgres://localhost/db');
  });

  it('converts numbers and booleans to strings', () => {
    const out = toDotEnv(sample);
    expect(out).toContain('PORT=3000');
    expect(out).toContain('DEBUG=true');
  });
});

describe('toJson', () => {
  it('returns valid JSON', () => {
    const out = toJson(sample);
    expect(() => JSON.parse(out)).not.toThrow();
  });

  it('preserves types', () => {
    const parsed = JSON.parse(toJson(sample));
    expect(parsed.PORT).toBe(3000);
    expect(parsed.DEBUG).toBe(true);
  });
});

describe('toShell', () => {
  it('prefixes each line with export', () => {
    const out = toShell(sample);
    out.split('\n').forEach((line) => {
      expect(line.startsWith('export ')).toBe(true);
    });
  });
});

describe('exportEnv', () => {
  it('defaults to dotenv format', () => {
    const out = exportEnv(sample);
    expect(out).toContain('PORT=3000');
    expect(out).not.toContain('export ');
  });

  it('respects format option', () => {
    const out = exportEnv(sample, { format: 'shell' });
    expect(out).toContain('export PORT=3000');
  });

  it('filters keys when keys option is provided', () => {
    const out = exportEnv(sample, { keys: ['PORT', 'DEBUG'] });
    expect(out).toContain('PORT=3000');
    expect(out).not.toContain('APP_NAME');
  });

  it('produces valid JSON via json format', () => {
    const out = exportEnv(sample, { format: 'json' });
    const parsed = JSON.parse(out);
    expect(parsed.PORT).toBe(3000);
  });
});
