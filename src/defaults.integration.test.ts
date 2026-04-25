/**
 * Integration test: defaults + validate pipeline
 * Ensures that applyDefaults feeds correctly into the validation layer.
 */
import { applyDefaults } from './defaults';
import { validateEnv } from './validate';
import { str, num, bool } from './schema';

const schema = {
  HOST: str(),
  PORT: num(),
  DEBUG: bool(),
};

describe('defaults → validate integration', () => {
  it('validates successfully when all keys are covered by defaults', () => {
    const raw: Record<string, string | undefined> = {};
    const withDefaults = applyDefaults(raw, {
      HOST: 'localhost',
      PORT: '4000',
      DEBUG: 'true',
    });
    const { result, errors } = validateEnv(schema, withDefaults);
    expect(errors).toHaveLength(0);
    expect(result?.HOST).toBe('localhost');
    expect(result?.PORT).toBe(4000);
    expect(result?.DEBUG).toBe(true);
  });

  it('env values take precedence over defaults', () => {
    const raw: Record<string, string | undefined> = { PORT: '9000' };
    const withDefaults = applyDefaults(raw, {
      HOST: 'localhost',
      PORT: '4000',
      DEBUG: 'false',
    });
    const { result, errors } = validateEnv(schema, withDefaults);
    expect(errors).toHaveLength(0);
    expect(result?.PORT).toBe(9000);
  });

  it('produces validation errors when required keys lack env and defaults', () => {
    const raw: Record<string, string | undefined> = { HOST: 'localhost' };
    const withDefaults = applyDefaults(raw, { DEBUG: 'false' });
    const { errors } = validateEnv(schema, withDefaults);
    const errorKeys = errors.map((e) => e.key);
    expect(errorKeys).toContain('PORT');
  });

  it('handles empty string env values replaced by defaults before validation', () => {
    const raw: Record<string, string | undefined> = {
      HOST: '',
      PORT: '3000',
      DEBUG: 'true',
    };
    const withDefaults = applyDefaults(raw, { HOST: 'fallback.host' });
    const { result, errors } = validateEnv(schema, withDefaults);
    expect(errors).toHaveLength(0);
    expect(result?.HOST).toBe('fallback.host');
  });
});
