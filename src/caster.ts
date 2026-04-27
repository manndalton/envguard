/**
 * caster.ts — Cast parsed env values to specific target types with optional fallback.
 */

export type CastTarget = 'string' | 'number' | 'boolean' | 'json';

export interface CastOptions {
  fallback?: unknown;
  strict?: boolean;
}

export class CastError extends Error {
  constructor(public readonly key: string, public readonly target: CastTarget, raw: unknown) {
    super(`Cannot cast key "${key}" with value ${JSON.stringify(raw)} to type "${target}"`);
    this.name = 'CastError';
  }
}

export function castValue(key: string, raw: unknown, target: CastTarget, options: CastOptions = {}): unknown {
  const { fallback, strict = false } = options;

  try {
    if (raw === undefined || raw === null || raw === '') {
      if (fallback !== undefined) return fallback;
      if (strict) throw new CastError(key, target, raw);
      return raw;
    }

    const str = String(raw).trim();

    switch (target) {
      case 'string':
        return str;

      case 'number': {
        const n = Number(str);
        if (isNaN(n)) {
          if (fallback !== undefined) return fallback;
          throw new CastError(key, target, raw);
        }
        return n;
      }

      case 'boolean': {
        if (['true', '1', 'yes', 'on'].includes(str.toLowerCase())) return true;
        if (['false', '0', 'no', 'off'].includes(str.toLowerCase())) return false;
        if (fallback !== undefined) return fallback;
        throw new CastError(key, target, raw);
      }

      case 'json': {
        return JSON.parse(str);
      }

      default:
        throw new CastError(key, target, raw);
    }
  } catch (err) {
    if (err instanceof CastError) throw err;
    if (fallback !== undefined) return fallback;
    throw new CastError(key, target, raw);
  }
}

export function castEnv(
  env: Record<string, unknown>,
  targets: Record<string, CastTarget>,
  options: CastOptions = {}
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...env };
  for (const [key, target] of Object.entries(targets)) {
    result[key] = castValue(key, env[key], target, options);
  }
  return result;
}
