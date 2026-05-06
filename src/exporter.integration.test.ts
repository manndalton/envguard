import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { exportEnv } from './exporter';
import { parseDotEnv } from './loader';

const sample: Record<string, unknown> = {
  SERVICE: 'api',
  PORT: 8080,
  VERBOSE: false,
};

function writeTmp(content: string): string {
  const file = path.join(os.tmpdir(), `envguard-export-${Date.now()}.env`);
  fs.writeFileSync(file, content, 'utf8');
  return file;
}

afterEach(() => {
  // cleanup handled per test
});

describe('exporter round-trip (dotenv)', () => {
  it('can be re-parsed by parseDotEnv', () => {
    const dotenvStr = exportEnv(sample, { format: 'dotenv' });
    const file = writeTmp(dotenvStr);

    try {
      const parsed = parseDotEnv(fs.readFileSync(file, 'utf8'));
      expect(parsed['SERVICE']).toBe('api');
      expect(parsed['PORT']).toBe('8080');
      expect(parsed['VERBOSE']).toBe('false');
    } finally {
      fs.unlinkSync(file);
    }
  });
});

describe('exporter round-trip (json)', () => {
  it('can be re-parsed by JSON.parse', () => {
    const jsonStr = exportEnv(sample, { format: 'json' });
    const parsed = JSON.parse(jsonStr);
    expect(parsed.PORT).toBe(8080);
    expect(parsed.VERBOSE).toBe(false);
  });
});

describe('key filtering', () => {
  it('only writes requested keys to disk', () => {
    const dotenvStr = exportEnv(sample, { format: 'dotenv', keys: ['PORT'] });
    const file = writeTmp(dotenvStr);

    try {
      const content = fs.readFileSync(file, 'utf8');
      expect(content).toContain('PORT=8080');
      expect(content).not.toContain('SERVICE');
    } finally {
      fs.unlinkSync(file);
    }
  });
});
