# validator-chain

Provides a fluent, composable rule-chain API for validating individual environment variable values beyond basic type-checking.

## Usage

```ts
import { createChain, applyChains } from 'envguard/validator-chain';

const portChain = createChain<number>()
  .min(1024)
  .max(65535);

const envChain = createChain<string>()
  .oneOf(['development', 'production', 'test']);

const errors = applyChains(parsedEnv, {
  PORT: portChain,
  NODE_ENV: envChain,
});

if (Object.keys(errors).length > 0) {
  console.error('Validation failures:', errors);
  process.exit(1);
}
```

## API

### `createChain<T>(): ChainedValidator<T>`

Creates a new validator chain for type `T`.

### `ChainedValidator<T>`

| Method | Description |
|---|---|
| `.rule(fn)` | Add a custom rule function |
| `.min(n)` | Numeric minimum (inclusive) |
| `.max(n)` | Numeric maximum (inclusive) |
| `.matches(pattern)` | RegExp match against string representation |
| `.oneOf(values)` | Value must be one of the provided options |
| `.validate(value)` | Run all rules; returns array of failures |

### `applyChains(env, chains)`

Applies a map of `ChainedValidator` instances against a parsed env record.
Returns a `Record<string, string[]>` of per-key error messages.
Keys with no chain entry are skipped.

## Integration with pipeline

`applyChains` can be inserted as a custom step inside `pipeline.ts` after the coercion stage, giving you fine-grained post-coercion validation without modifying the core schema definitions.
