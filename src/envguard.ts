import { loadEnvFile, LoadOptions } from './loader';
import { validateEnv } from './validate';
import { EnvSchema } from './schema';

export interface EnvGuardOptions extends LoadOptions {
  /**
   * If true, throws an error when validation fails.
   * Defaults to true.
   */
  strict?: boolean;
}

export interface EnvGuardResult<T> {
  env: T;
  errors: string[];
  valid: boolean;
}

/**
 * Main entry point: loads a .env file and validates environment variables
 * against the provided schema. Returns typed, validated env values.
 *
 * @throws {Error} When strict mode is enabled (default) and validation fails.
 */
export function createEnvGuard<S extends EnvSchema>(
  schema: S,
  options: EnvGuardOptions = {}
): EnvGuardResult<{ [K in keyof S]: unknown }> {
  const { strict = true, ...loadOptions } = options;

  loadEnvFile(loadOptions);

  const result = validateEnv(schema, process.env as Record<string, string>);

  if (!result.valid && strict) {
    const message = [
      '[envguard] Environment validation failed:',
      ...result.errors.map((e) => `  - ${e}`),
    ].join('\n');
    throw new Error(message);
  }

  return result as EnvGuardResult<{ [K in keyof S]: unknown }>;
}
