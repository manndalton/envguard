import { EnvSchema } from './validate';

export type ExportFormat = 'dotenv' | 'json' | 'shell';

export interface ExportOptions {
  format?: ExportFormat;
  mask?: boolean;
  keys?: string[];
}

/**
 * Serialise a validated env record to a .env file string.
 */
export function toDotEnv(env: Record<string, unknown>): string {
  return Object.entries(env)
    .map(([k, v]) => `${k}=${formatScalar(v)}`)
    .join('\n');
}

/**
 * Serialise a validated env record to a JSON string.
 */
export function toJson(env: Record<string, unknown>, indent = 2): string {
  return JSON.stringify(env, null, indent);
}

/**
 * Serialise a validated env record to shell export statements.
 */
export function toShell(env: Record<string, unknown>): string {
  return Object.entries(env)
    .map(([k, v]) => `export ${k}=${formatScalar(v)}`)
    .join('\n');
}

/**
 * Generic export entry-point – picks the right serialiser based on `format`.
 */
export function exportEnv<S extends EnvSchema>(
  env: Record<string, unknown>,
  options: ExportOptions = {}
): string {
  const { format = 'dotenv', keys } = options;

  const subset: Record<string, unknown> = keys
    ? Object.fromEntries(Object.entries(env).filter(([k]) => keys.includes(k)))
    : env;

  switch (format) {
    case 'json':
      return toJson(subset);
    case 'shell':
      return toShell(subset);
    case 'dotenv':
    default:
      return toDotEnv(subset);
  }
}

function formatScalar(value: unknown): string {
  if (typeof value === 'string') {
    return value.includes(' ') ? `"${value}"` : value;
  }
  return String(value);
}
