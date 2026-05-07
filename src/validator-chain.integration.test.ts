import { createChain, applyChains } from './validator-chain';
import { parseDotEnv } from './loader';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

function writeTmp(content: string): string {
  const file = path.join(os.tmpdir(), `vc-integ-${Date.now()}.env`);
  fs.writeFileSync(file, content, 'utf8');
  return file;
}

describe('validator-chain integration', () => {
  it('validates parsed .env values end-to-end', () => {
    const file = writeTmp('PORT=3000\nNODE_ENV=production\nTIMEOUT=30\n');
    const raw = parseDotEnv(fs.readFileSync(file, 'utf8'));

    const chains = {
      PORT: createChain<unknown>().min(1024).max(65535),
      NODE_ENV: createChain<unknown>().oneOf(['development', 'production', 'test']),
      TIMEOUT: createChain<unknown>().min(1).max(120),
    };

    const errors = applyChains(raw as Record<string, unknown>, chains);
    expect(errors).toEqual({});

    fs.unlinkSync(file);
  });

  it('reports errors for out-of-range values from .env file', () => {
    const file = writeTmp('PORT=80\nNODE_ENV=staging\nTIMEOUT=999\n');
    const raw = parseDotEnv(fs.readFileSync(file, 'utf8'));

    const chains = {
      PORT: createChain<unknown>().min(1024),
      NODE_ENV: createChain<unknown>().oneOf(['development', 'production', 'test']),
      TIMEOUT: createChain<unknown>().max(120),
    };

    const errors = applyChains(raw as Record<string, unknown>, chains);
    expect(Object.keys(errors)).toContain('PORT');
    expect(Object.keys(errors)).toContain('NODE_ENV');
    expect(Object.keys(errors)).toContain('TIMEOUT');

    fs.unlinkSync(file);
  });

  it('handles missing keys gracefully (undefined value)', () => {
    const file = writeTmp('NODE_ENV=development\n');
    const raw = parseDotEnv(fs.readFileSync(file, 'utf8'));

    const chains = {
      PORT: createChain<unknown>().min(1024),
    };

    // undefined is NaN when cast to number; min/max treat NaN as passing
    const errors = applyChains(raw as Record<string, unknown>, chains);
    expect(errors).toEqual({});

    fs.unlinkSync(file);
  });
});
