import { validate, validateOrThrow } from './validate';
import { EnvSchema } from './schema';

const schema = {
  PORT: { type: 'number' as const, required: true },
  APP_NAME: { type: 'string' as const, required: true },
  DEBUG: { type: 'boolean' as const, default: false },
  API_URL: { type: 'url' as const, required: true },
  CONTACT_EMAIL: { type: 'email' as const, required: false },
} satisfies EnvSchema;

describe('validate()', () => {
  it('returns success with correctly parsed values', () => {
    const env = {
      PORT: '3000',
      APP_NAME: 'my-app',
      API_URL: 'https://api.example.com',
    };
    const result = validate(schema, env);
    expect(result.success).toBe(true);
    expect(result.data?.PORT).toBe(3000);
    expect(result.data?.APP_NAME).toBe('my-app');
    expect(result.data?.DEBUG).toBe(false);
    expect(result.data?.API_URL).toBe('https://api.example.com');
    expect(result.data?.CONTACT_EMAIL).toBeUndefined();
  });

  it('returns errors for missing required fields', () => {
    const result = validate(schema, {});
    expect(result.success).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('PORT'),
        expect.stringContaining('APP_NAME'),
        expect.stringContaining('API_URL'),
      ])
    );
  });

  it('returns an error for an invalid number', () => {
    const env = { PORT: 'abc', APP_NAME: 'x', API_URL: 'https://x.com' };
    const result = validate(schema, env);
    expect(result.success).toBe(false);
    expect(result.errors![0]).toMatch(/PORT.*number/);
  });

  it('returns an error for an invalid URL', () => {
    const env = { PORT: '80', APP_NAME: 'x', API_URL: 'not-a-url' };
    const result = validate(schema, env);
    expect(result.success).toBe(false);
    expect(result.errors![0]).toMatch(/API_URL.*URL/);
  });

  it('parses boolean env vars correctly', () => {
    const env = { PORT: '8080', APP_NAME: 'x', API_URL: 'https://x.com', DEBUG: '1' };
    const result = validate(schema, env);
    expect(result.success).toBe(true);
    expect(result.data?.DEBUG).toBe(true);
  });
});

describe('validateOrThrow()', () => {
  it('throws when validation fails', () => {
    expect(() => validateOrThrow(schema, {})).toThrow();
  });

  it('returns data when validation passes', () => {
    const env = { PORT: '9000', APP_NAME: 'envguard', API_URL: 'https://env.io' };
    const data = validateOrThrow(schema, env);
    expect(data.PORT).toBe(9000);
  });
});
