import { EnvSchema } from './validate';

export type RuleResult = { valid: true } | { valid: false; message: string };
export type Rule<T> = (value: T) => RuleResult;

export interface ChainedValidator<T> {
  rule(fn: Rule<T>): ChainedValidator<T>;
  min(n: number): ChainedValidator<T>;
  max(n: number): ChainedValidator<T>;
  matches(pattern: RegExp): ChainedValidator<T>;
  oneOf(values: T[]): ChainedValidator<T>;
  validate(value: T): RuleResult[];
}

export function createChain<T>(): ChainedValidator<T> {
  const rules: Rule<T>[] = [];

  const chain: ChainedValidator<T> = {
    rule(fn) {
      rules.push(fn);
      return chain;
    },
    min(n) {
      return chain.rule((v) => {
        const num = Number(v);
        return isNaN(num) || num >= n
          ? { valid: true }
          : { valid: false, message: `Value ${num} is less than minimum ${n}` };
      });
    },
    max(n) {
      return chain.rule((v) => {
        const num = Number(v);
        return isNaN(num) || num <= n
          ? { valid: true }
          : { valid: false, message: `Value ${num} exceeds maximum ${n}` };
      });
    },
    matches(pattern) {
      return chain.rule((v) =>
        pattern.test(String(v))
          ? { valid: true }
          : { valid: false, message: `Value "${v}" does not match pattern ${pattern}` }
      );
    },
    oneOf(values) {
      return chain.rule((v) =>
        values.includes(v)
          ? { valid: true }
          : { valid: false, message: `Value "${v}" is not one of [${values.join(', ')}]` }
      );
    },
    validate(value) {
      return rules.map((r) => r(value)).filter((r) => !r.valid);
    },
  };

  return chain;
}

export type SchemaChains<S extends EnvSchema> = {
  [K in keyof S]?: ChainedValidator<unknown>;
};

export function applyChains<S extends EnvSchema>(
  env: Record<string, unknown>,
  chains: SchemaChains<S>
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  for (const key of Object.keys(chains) as (keyof S & string)[]) {
    const chain = chains[key];
    if (!chain) continue;
    const failures = chain.validate(env[key]);
    if (failures.length > 0) {
      errors[key] = failures.map((f) => (f.valid ? '' : f.message));
    }
  }
  return errors;
}
