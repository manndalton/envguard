import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { watchEnvFile } from './watcher';
import { str, num, bool } from './schema';

const schema = {
  PORT: num(),
  DEBUG: bool({ default: false }),
  SERVICE: str(),
};

function tmpEnvPath(): string {
  return path.join(os.tmpdir(), `envguard-int-${Date.now()}.env`);
}

describe('watchEnvFile integration', () => {
  it('receives correctly typed values after file update', (done) => {
    const filePath = tmpEnvPath();
    fs.writeFileSync(filePath, 'PORT=8080\nDEBUG=true\nSERVICE=api', 'utf-8');

    const handle = watchEnvFile(schema, {
      filePath,
      debounceMs: 60,
      onReload: (env: any) => {
        handle.stop();
        fs.unlinkSync(filePath);
        expect(env.PORT).toBe(9090);
        expect(env.DEBUG).toBe(false);
        expect(env.SERVICE).toBe('gateway');
        done();
      },
      onError: (err) => {
        handle.stop();
        fs.unlinkSync(filePath);
        done(err);
      },
    });

    setTimeout(() => {
      fs.writeFileSync(filePath, 'PORT=9090\nDEBUG=false\nSERVICE=gateway', 'utf-8');
    }, 30);
  });

  it('handles multiple rapid writes with debounce', (done) => {
    const filePath = tmpEnvPath();
    fs.writeFileSync(filePath, 'PORT=1000\nSERVICE=init', 'utf-8');
    let reloadCount = 0;

    const handle = watchEnvFile(schema, {
      filePath,
      debounceMs: 100,
      onReload: () => { reloadCount++; },
      onError: done,
    });

    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        fs.writeFileSync(filePath, `PORT=${2000 + i}\nSERVICE=burst`, 'utf-8');
      }, i * 10);
    }

    setTimeout(() => {
      handle.stop();
      fs.unlinkSync(filePath);
      expect(reloadCount).toBeLessThanOrEqual(2);
      done();
    }, 400);
  });
});
