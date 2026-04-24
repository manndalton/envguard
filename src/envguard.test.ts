import { createEnvGuard } from './envguard';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('createEnvGuard', () => {
  let tmpDir: string;
  let envFile: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envguard-eg-'));
    envFile = path.join(tmpDir, '.env');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
    delete process.env['EG_PORT'];
    delete process.env['EG_HOST'];
    delete process.env['EG_DEBUG'];
  });

  it('returns valid result when all required vars are present', () => {
    fs.writeFileSync(envFile, 'EG_PORT=3000\nEG_HOST=localhost');

    const result = createEnvGuard(
      {
        EG_PORT: { type: 'number', required: true },
        EG_HOST: { type: 'string', required: true },
      },
      { envPath: envFile, strict: false }
    );

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.env['EG_PORT']).toBe(3000);
    expect(result.env['EG_HOST']).toBe('localhost');
  });

  it('returns invalid result when required var is missing (strict=false)', () => {
    fs.writeFileSync(envFile, 'EG_HOST=localhost');

    const result = createEnvGuard(
      {
        EG_PORT: { type: 'number', required: true },
        EG_HOST: { type: 'string', required: true },
      },
      { envPath: envFile, strict: false }
    );

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('throws when validation fails in strict mode', () => {
    fs.writeFileSync(envFile, 'EG_HOST=localhost');

    expect(() =>
      createEnvGuard(
        { EG_PORT: { type: 'number', required: true } },
        { envPath: envFile, strict: true }
      )
    ).toThrow('[envguard] Environment validation failed');
  });

  it('uses default values when variable is missing', () => {
    fs.writeFileSync(envFile, '');

    const result = createEnvGuard(
      {
        EG_DEBUG: { type: 'boolean', required: false, default: false },
      },
      { envPath: envFile, strict: false }
    );

    expect(result.valid).toBe(true);
    expect(result.env['EG_DEBUG']).toBe(false);
  });
});
