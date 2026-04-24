/**
 * Schema definitions for envguard.
 */

import { TransformFn } from "./transformer";

export type EnvVarType = "string" | "number" | "boolean";

export interface EnvVarDefinition<T = unknown> {
  type: EnvVarType;
  required?: boolean;
  default?: T;
  description?: string;
  /** Optional list of allowed values */
  allowedValues?: T[];
  /** Optional transform applied after parsing */
  transform?: TransformFn<T>;
}

export type EnvSchema = Record<string, EnvVarDefinition>;

/**
 * Helper to define a typed string variable.
 */
export function str(options: Omit<EnvVarDefinition<string>, "type"> = {}): EnvVarDefinition<string> {
  return { type: "string", ...options };
}

/**
 * Helper to define a typed number variable.
 */
export function num(options: Omit<EnvVarDefinition<number>, "type"> = {}): EnvVarDefinition<number> {
  return { type: "number", ...options };
}

/**
 * Helper to define a typed boolean variable.
 */
export function bool(options: Omit<EnvVarDefinition<boolean>, "type"> = {}): EnvVarDefinition<boolean> {
  return { type: "boolean", ...options };
}
