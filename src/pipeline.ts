/**
 * pipeline.ts
 *
 * Composes multiple env-processing steps into a single reusable pipeline.
 * Each stage receives the output of the previous stage, allowing you to
 * declaratively build up a full env-loading flow (load → interpolate →
 * coerce → transform → validate → freeze).
 */

import { EnvSchema, validateEnv } from './validate';
import { loadEnvFile } from './loader';
import { interpolateAll } from './interpolator';
import { coerceEnv } from './coercer';
import { applyTransforms } from './transformer';
import { freezeEnv } from './freeze';
import { mergeSources } from './merger';

export interface PipelineOptions<S extends EnvSchema> {
  /** Paths to .env files loaded in order (later files win). */
  files?: string[];
  /** Whether to merge process.env into the pipeline. Defaults to true. */
  processEnv?: boolean;
  /** Schema used for coercion and final validation. */
  schema: S;
  /** When true the returned env object is deeply frozen. Defaults to false. */
  freeze?: boolean;
  /** Optional per-key transform functions applied after coercion. */
  transforms?: Partial<Record<keyof S, (v: unknown) => unknown>>;
}

export type PipelineResult<S extends EnvSchema> = ReturnType<typeof validateEnv<S>>;

/**
 * Runs the standard envguard pipeline:
 *   1. Load .env files (if any)
 *   2. Merge with process.env (optional)
 *   3. Interpolate variable references (${VAR})
 *   4. Coerce raw string values according to the schema
 *   5. Apply user-supplied transforms
 *   6. Validate against the schema
 *   7. Optionally freeze the result
 *
 * @example
 * const env = await runPipeline({
 *   files: ['.env', '.env.local'],
 *   schema: { PORT: num(), HOST: str() },
 *   freeze: true,
 * });
 */
export async function runPipeline<S extends EnvSchema>(
  options: PipelineOptions<S>
): Promise<PipelineResult<S>> {
  const {
    files = [],
    processEnv = true,
    schema,
    freeze = false,
    transforms = {},
  } = options;

  // 1. Load each .env file into its own raw record.
  const fileSources: Record<string, string>[] = [];
  for (const file of files) {
    try {
      const loaded = await loadEnvFile(file);
      fileSources.push(loaded);
    } catch {
      // Missing optional files are silently skipped.
    }
  }

  // 2. Merge sources: file layers first, then process.env on top (if enabled).
  const sources: Record<string, string>[] = [
    ...fileSources,
    ...(processEnv ? [process.env as Record<string, string>] : []),
  ];
  const merged = mergeSources(sources);

  // 3. Interpolate ${VAR} references within the merged record.
  const interpolated = interpolateAll(merged);

  // 4. Coerce raw strings to typed values based on the schema.
  const coerced = coerceEnv(interpolated, schema);

  // 5. Apply optional per-key transforms.
  const transformed =
    Object.keys(transforms).length > 0
      ? applyTransforms(coerced as Record<string, unknown>, transforms as Record<string, (v: unknown) => unknown>)
      : coerced;

  // 6. Validate — throws a descriptive error on failure.
  const validated = validateEnv(transformed as Record<string, string>, schema);

  // 7. Optionally freeze to prevent accidental mutation.
  if (freeze) {
    return freezeEnv(validated as Record<string, object>) as PipelineResult<S>;
  }

  return validated;
}

/**
 * Synchronous variant of runPipeline for environments where async
 * file I/O is not available or desired.  Only process.env is used as
 * the data source (no file loading).
 */
export function runPipelineSync<S extends EnvSchema>(
  options: Omit<PipelineOptions<S>, 'files'>
): PipelineResult<S> {
  const { processEnv = true, schema, freeze = false, transforms = {} } = options;

  const source: Record<string, string> = processEnv
    ? (process.env as Record<string, string>)
    : {};

  const interpolated = interpolateAll(source);
  const coerced = coerceEnv(interpolated, schema);

  const transformed =
    Object.keys(transforms).length > 0
      ? applyTransforms(coerced as Record<string, unknown>, transforms as Record<string, (v: unknown) => unknown>)
      : coerced;

  const validated = validateEnv(transformed as Record<string, string>, schema);

  if (freeze) {
    return freezeEnv(validated as Record<string, object>) as PipelineResult<S>;
  }

  return validated;
}
