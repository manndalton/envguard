import { EnvSchema, InferSchema } from './schema';
import { parseValue, ParseError } from './parser';

export interface ValidationResult<S extends EnvSchema> {
  success: boolean;
  data?: InferSchema<S>;
  errors?: string[];
}

export function validate<S extends EnvSchema>(
  schema: S,
  env: NodeJS.ProcessEnv = process.env
): ValidationResult<S> {
  const errors: string[] = [];
  const data: Record<string, unknown> = {};

  for (const [key, field] of Object.entries(schema)) {
    const raw = env[key];

    if (raw === undefined || raw === '') {
      if (field.default !== undefined) {
        data[key] = field.default;
        continue;
      }
      if (field.required === false) {
        data[key] = undefined;
        continue;
      }
      errors.push(`[envguard] "${key}": required variable is missing`);
      continue;
    }

    try {
      data[key] = parseValue(key, raw, field);
    } catch (err) {
      if (err instanceof ParseError) {
        errors.push(err.message);
      } else {
        throw err;
      }
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: data as InferSchema<S> };
}

export function validateOrThrow<S extends EnvSchema>(
  schema: S,
  env: NodeJS.ProcessEnv = process.env
): InferSchema<S> {
  const result = validate(schema, env);
  if (!result.success) {
    throw new Error(result.errors!.join('\n'));
  }
  return result.data!;
}
