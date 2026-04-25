import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { watchEnvFile, WatcherHandle } from './watcher';
import { str, num } from './schema';

const schema = {
  PORT: num(),
  APP_NAME: str(),
};

function writeTempEnv(content: string): string {
  const tmpFile = path.join(os.tmpdir(), `envguard-test-${Date.now()}.env`);
  fs.writeFileSync(tmpFile, content, 'utf-8');
  return tmpFile;
}

describe('watchEnvFile', () => {
  let handle: WatcherHandle | null = null;
  let tmpFile: string | null = null;

  afterEach(() => {
    if (handle) handle.stop();
    if (tmpFile && fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  });

  it('calls onReload when file changes with valid env', (done) => {
    tmpFile = writeTempEnv('PORT=3000\nAPP_NAME=test');
    handle = watchEnvFile(schema, {
      filePath: tmpFile,
      debounceMs: 50,
      onReload: (env) => {
        expect(env).toBeDefined();
        done();
      },
      onError: done,
    });
    fs.writeFileSync(tmpFile, 'PORT=4000\nAPP_NAME=updated', 'utf-8');
  });

  it('calls onError when file changes with invalid env', (done) => {
    tmpFile = writeTempEnv('PORT=3000\nAPP_NAME=test');
    handle = watchEnvFile(schema, {
      filePath: tmpFile,
      debounceMs: 50,
      onReload: () => done(new Error('Should not succeed')),
      onError: (err) => {
        expect(err).toBeInstanceOf(Error);
        done();
      },
    });
    fs.writeFileSync(tmpFile, 'PORT=notanumber\nAPP_NAME=broken', 'utf-8');
  });

  it('stop() prevents further callbacks', (done) => {
    tmpFile = writeTempEnv('PORT=3000\nAPP_NAME=test');
    let callCount = 0;
    handle = watchEnvFile(schema, {
      filePath: tmpFile,
      debounceMs: 50,
      onReload: () => { callCount++; },
    });
    handle.stop();
    fs.writeFileSync(tmpFile, 'PORT=5000\nAPP_NAME=stopped', 'utf-8');
    setTimeout(() => {
      expect(callCount).toBe(0);
      done();
    }, 200);
  });
});
