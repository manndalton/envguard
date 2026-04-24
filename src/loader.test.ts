import { parseDotEnv, loadEnvFile } from './loader';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('parseDotEnv', () => {
  it('parses simple key=value pairs', () => {
    const result = parseDotEnv('FOO=bar\nBAZ=qux');
    expect(result).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  it('ignores comment lines', () => {
    const result = parseDotEnv('# comment\nFOO=bar');
    expect(result).toEqual({ FOO: 'bar' });
  });

  it('ignores empty lines', () => {
    const result = parseDotEnv('\nFOO=bar\n\n');
    expect(result).toEqual({ FOO: 'bar' });
  });

  it('strips double quotes from values', () => {
    const result = parseDotEnv('FOO="hello world"');
    expect(result).toEqual({ FOO: 'hello world' });
  });

  it('strips single quotes from values', () => {
    const result = parseDotEnv("FOO='hello world'");
    expect(result).toEqual({ FOO: 'hello world' });
  });

  it('handles values with equals signs', () => {
    const result = parseDotEnv('FOO=a=b=c');
    expect(result).toEqual({ FOO: 'a=b=c' });
  });

  it('ignores lines without equals sign', () => {
    const result = parseDotEnv('INVALID_LINE\nFOO=bar');
    expect(result).toEqual({ FOO: 'bar' });
  });
});

describe('loadEnvFile', () => {
  let tmpDir: string;
  let envFile: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envguard-'));
    envFile = path.join(tmpDir, '.env');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  it('returns empty object if file does not exist', () => {
    const result = loadEnvFile({ envPath: path.join(tmpDir, '.env.missing') });
    expect(result).toEqual({});
  });

  it('loads variables into process.env', () => {
    fs.writeFileSync(envFile, 'TEST_LOAD_VAR=loaded_value');
    loadEnvFile({ envPath: envFile });
    expect(process.env['TEST_LOAD_VAR']).toBe('loaded_value');
    delete process.env['TEST_LOAD_VAR'];
  });

  it('does not override existing process.env by default', () => {
    process.env['TEST_NO_OVERRIDE'] = 'original';
    fs.writeFileSync(envFile, 'TEST_NO_OVERRIDE=new_value');
    loadEnvFile({ envPath: envFile });
    expect(process.env['TEST_NO_OVERRIDE']).toBe('original');
    delete process.env['TEST_NO_OVERRIDE'];
  });

  it('overrides existing process.env when override=true', () => {
    process.env['TEST_OVERRIDE'] = 'original';
    fs.writeFileSync(envFile, 'TEST_OVERRIDE=overridden');
    loadEnvFile({ envPath: envFile, override: true });
    expect(process.env['TEST_OVERRIDE']).toBe('overridden');
    delete process.env['TEST_OVERRIDE'];
  });
});
