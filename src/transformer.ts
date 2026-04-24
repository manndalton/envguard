/**
 * Transformer module: apply post-parse transformations to env values.
 */

export type TransformFn<T> = (value: T) => T;

export interface TransformerMap {
  string?: TransformFn<string>;
  number?: TransformFn<number>;
  boolean?: TransformFn<boolean>;
}

/**
 * Built-in string transformers
 */
export const stringTransformers = {
  trim: (value: string): string => value.trim(),
  lowercase: (value: string): string => value.toLowerCase(),
  uppercase: (value: string): string => value.toUpperCase(),
} as const;

/**
 * Built-in number transformers
 */
export const numberTransformers = {
  abs: (value: number): number => Math.abs(value),
  floor: (value: number): number => Math.floor(value),
  ceil: (value: number): number => Math.ceil(value),
} as const;

/**
 * Apply a list of transform functions to a value in sequence.
 */
export function applyTransforms<T>(value: T, transforms: TransformFn<T>[]): T {
  return transforms.reduce((acc, fn) => fn(acc), value);
}

/**
 * Compose multiple transform functions into one.
 */
export function composeTransforms<T>(...fns: TransformFn<T>[]): TransformFn<T> {
  return (value: T) => applyTransforms(value, fns);
}
