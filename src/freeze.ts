/**
 * freeze.ts
 * Provides deep-freeze utilities for validated env objects to prevent
 * accidental mutation at runtime.
 */

export type Frozen<T> = { readonly [K in keyof T]: T[K] extends object ? Frozen<T[K]> : T[K] };

/**
 * Recursively freezes an object so all properties become read-only.
 * Primitives are returned as-is.
 */
export function deepFreeze<T extends object>(obj: T): Frozen<T> {
  Object.getOwnPropertyNames(obj).forEach((name) => {
    const value = (obj as Record<string, unknown>)[name];
    if (value !== null && typeof value === "object") {
      deepFreeze(value as object);
    }
  });
  return Object.freeze(obj) as Frozen<T>;
}

/**
 * Returns true if the given object is fully frozen (shallow check).
 */
export function isFrozen(obj: object): boolean {
  return Object.isFrozen(obj);
}

/**
 * Wraps deepFreeze with a runtime guard: throws if the input is not a
 * plain object, making it safe to call directly on validated env output.
 */
export function freezeEnv<T extends Record<string, unknown>>(env: T): Frozen<T> {
  if (env === null || typeof env !== "object" || Array.isArray(env)) {
    throw new TypeError("freezeEnv: expected a plain object");
  }
  return deepFreeze(env);
}
