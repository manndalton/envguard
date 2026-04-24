/**
 * coercer.ts
 * Provides type coercion utilities for environment variable values.
 * Works alongside parser.ts to handle edge cases and custom coercions.
 */

export type CoercerFn<T> = (raw: string) => T;

export interface CoercerMap {
  string: CoercerFn<string>;
  number: CoercerFn<number>;
  boolean: CoercerFn<boolean>;
  [key: string]: CoercerFn<unknown>;
}

/** Coerce a raw string to a trimmed string */
export const coerceString: CoercerFn<string> = (raw) => raw.trim();

/** Coerce a raw string to a number, throwing if invalid */
export const coerceNumber: CoercerFn<number> = (raw) => {
  const trimmed = raw.trim();
  const value = Number(trimmed);
  if (trimmed === '' || isNaN(value)) {
    throw new TypeError(`Cannot coerce "${raw}" to number`);
  }
  return value;
};

/** Coerce a raw string to a boolean */
export const coerceBoolean: CoercerFn<boolean> = (raw) => {
  const lower = raw.trim().toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(lower)) return true;
  if (['false', '0', 'no', 'off'].includes(lower)) return false;
  throw new TypeError(`Cannot coerce "${raw}" to boolean`);
};

/** Default coercer map covering the three built-in types */
export const defaultCoercers: CoercerMap = {
  string: coerceString,
  number: coerceNumber,
  boolean: coerceBoolean,
};

/**
 * Coerce a raw string value using the coercer registered for the given type.
 * Falls back to the string coercer if the type is not found.
 */
export function coerce<T = unknown>(
  raw: string,
  type: string,
  coercers: CoercerMap = defaultCoercers
): T {
  const fn = coercers[type] ?? coercers['string'];
  return fn(raw) as T;
}
