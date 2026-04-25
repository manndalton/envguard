import {
  captureSnapshot,
  diffSnapshots,
  serializeSnapshot,
  deserializeSnapshot,
  type EnvSnapshot,
} from './snapshot';
import { str, num, bool } from './schema';

const schema = {
  PORT: num(),
  HOST: str(),
  DEBUG: bool(),
};

describe('captureSnapshot', () => {
  it('captures values for keys defined in schema', () => {
    const env = { PORT: '3000', HOST: 'localhost', DEBUG: 'true', EXTRA: 'ignored' };
    const snap = captureSnapshot(schema, env);
    expect(snap.values).toEqual({ PORT: '3000', HOST: 'localhost', DEBUG: 'true' });
    expect(typeof snap.timestamp).toBe('number');
  });

  it('captures undefined for missing keys', () => {
    const snap = captureSnapshot(schema, {});
    expect(snap.values).toEqual({ PORT: undefined, HOST: undefined, DEBUG: undefined });
  });
});

describe('diffSnapshots', () => {
  const makeSnap = (values: Record<string, string | undefined>): EnvSnapshot => ({
    timestamp: Date.now(),
    values,
  });

  it('returns empty array when snapshots are identical', () => {
    const a = makeSnap({ PORT: '3000', HOST: 'localhost' });
    const b = makeSnap({ PORT: '3000', HOST: 'localhost' });
    expect(diffSnapshots(a, b)).toEqual([]);
  });

  it('detects changed values', () => {
    const a = makeSnap({ PORT: '3000', HOST: 'localhost' });
    const b = makeSnap({ PORT: '4000', HOST: 'localhost' });
    expect(diffSnapshots(a, b)).toEqual(['PORT']);
  });

  it('detects newly added keys', () => {
    const a = makeSnap({ PORT: '3000' });
    const b = makeSnap({ PORT: '3000', HOST: 'localhost' });
    expect(diffSnapshots(a, b)).toContain('HOST');
  });

  it('detects removed keys (undefined vs value)', () => {
    const a = makeSnap({ PORT: '3000', HOST: 'localhost' });
    const b = makeSnap({ PORT: '3000', HOST: undefined });
    expect(diffSnapshots(a, b)).toEqual(['HOST']);
  });
});

describe('serializeSnapshot / deserializeSnapshot', () => {
  it('round-trips a snapshot correctly', () => {
    const snap = captureSnapshot(schema, { PORT: '8080', HOST: '0.0.0.0', DEBUG: 'false' });
    const raw = serializeSnapshot(snap);
    const restored = deserializeSnapshot(raw);
    expect(restored.values).toEqual(snap.values);
    expect(restored.timestamp).toBe(snap.timestamp);
  });

  it('throws on invalid snapshot JSON', () => {
    expect(() => deserializeSnapshot('{"bad":true}')).toThrow('Invalid snapshot format');
  });

  it('throws on non-object JSON', () => {
    expect(() => deserializeSnapshot('"just a string"')).toThrow('Invalid snapshot format');
  });
});
