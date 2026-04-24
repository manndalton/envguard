# Coercer Module

The `coercer` module provides **type coercion** utilities that convert raw environment-variable strings into the target TypeScript types expected by your schema.

## Why a separate coercer?

`parser.ts` handles generic value parsing (splitting, unquoting, etc.).  
`coercer.ts` focuses on **type-safe conversion** and makes it easy to register custom coercers without touching the core parser.

## Built-in coercers

| Coercer | Input example | Output |
|---|---|---|
| `coerceString` | `" hello "` | `"hello"` |
| `coerceNumber` | `"3.14"` | `3.14` |
| `coerceBoolean` | `"yes"` / `"0"` | `true` / `false` |

### Boolean truthy values
`true`, `1`, `yes`, `on` (case-insensitive)

### Boolean falsy values
`false`, `0`, `no`, `off` (case-insensitive)

## Usage

```ts
import { coerce, defaultCoercers } from './coercer';

const port = coerce<number>(process.env.PORT ?? '', 'number');
```

## Custom coercers

```ts
import { coerce, defaultCoercers, CoercerMap } from './coercer';

const myCoercers: CoercerMap = {
  ...defaultCoercers,
  json: (raw) => JSON.parse(raw),
};

const config = coerce<MyConfig>(process.env.CONFIG ?? '', 'json', myCoercers);
```

## Error handling

All coercers throw a `TypeError` with a descriptive message when the input cannot be converted.  
These errors are caught by `validate.ts` and surfaced through `reporter.ts`.
