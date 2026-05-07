import { EnvSchema, validateEnv } from './validate';
import { coerceEnv } from './coercer';
import { applyTransforms } from './transformer';
import { interpolateAll } from './interpolator';
import { applyDefaults } from './defaults';
import { mergeSources, buildMergedEnv } from './merger';
import { sanitizeEnv } from './sanitizer';
import { applyChains, SchemaChains } from './validator-chain';

export interface PipelineOptions<S extends EnvSchema> {
  schema: S;
  sources?: Record<string, string | undefined>[];
  defaults?: Partial<Record<keyof S, string>>;
  transforms?: Parameters<typeof applyTransforms<S>>[1];
  chains?: SchemaChains<S>;
  sanitize?: boolean;
  interpolate?: boolean;
}

export type PipelineResult<S extends EnvSchema> = {
  env: { [K in keyof S]: unknown };
  errors: string[];
  chainErrors: Record<string, string[]>;
};

export function runPipeline<S extends EnvSchema>(
  options: PipelineOptions<S>
): PipelineResult<S> {
  const {
    schema,
    sources = [process.env as Record<string, string | undefined>],
    defaults: defaultValues,
    transforms,
    chains,
    sanitize = true,
    interpolate: doInterpolate = true,
  } = options;

  // 1. Merge sources
  let raw: Record<string, string | undefined> = buildMergedEnv(
    mergeSources(sources)
  );

  // 2. Apply defaults
  if (defaultValues) {
    raw = applyDefaults(schema, raw, defaultValues) as Record<string, string | undefined>;
  }

  // 3. Interpolate variable references
  if (doInterpolate) {
    raw = interpolateAll(raw) as Record<string, string | undefined>;
  }

  // 4. Sanitize string values
  if (sanitize) {
    raw = sanitizeEnv(raw) as Record<string, string | undefined>;
  }

  // 5. Validate against schema
  const { env: validated, errors } = validateEnv(schema, raw);

  // 6. Coerce types
  const coerced = coerceEnv(schema, validated as Record<string, string>);

  // 7. Apply transforms
  const transformed = transforms
    ? applyTransforms(schema, transforms, coerced as never)
    : coerced;

  // 8. Apply chain validators
  const chainErrors = chains
    ? applyChains(transformed as Record<string, unknown>, chains)
    : {};

  return {
    env: transformed as { [K in keyof S]: unknown },
    errors,
    chainErrors,
  };
}

export function assertPipeline<S extends EnvSchema>(
  options: PipelineOptions<S>
): { [K in keyof S]: unknown } {
  const { env, errors, chainErrors } = runPipeline(options);

  const allErrors: string[] = [
    ...errors,
    ...Object.entries(chainErrors).flatMap(([key, msgs]) =>
      msgs.map((m) => `[chain] ${key}: ${m}`)
    ),
  ];

  if (allErrors.length > 0) {
    throw new Error(
      `EnvGuard pipeline validation failed:\n${allErrors.map((e) => `  - ${e}`).join('\n')}`
    );
  }

  return env;
}
