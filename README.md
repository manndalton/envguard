# envguard

Lightweight library to validate and type-check environment variables at app startup with schema definitions.

## Installation

```bash
npm install envguard
```

## Usage

Define a schema for your environment variables and let **envguard** validate them at startup. If any variable is missing or invalid, it throws an error before your app runs.

```typescript
import { createEnv } from 'envguard';

const env = createEnv({
  PORT: {
    type: 'number',
    required: true,
  },
  DATABASE_URL: {
    type: 'string',
    required: true,
  },
  NODE_ENV: {
    type: 'string',
    default: 'development',
    allowedValues: ['development', 'production', 'test'],
  },
  ENABLE_CACHE: {
    type: 'boolean',
    required: false,
    default: false,
  },
});

// Fully typed — env.PORT is `number`, env.DATABASE_URL is `string`, etc.
console.log(`Server starting on port ${env.PORT}`);
```

If a required variable is missing, **envguard** will throw a descriptive error:

```
EnvGuardError: Missing required environment variable: DATABASE_URL
```

## Why envguard?

- ✅ Zero runtime surprises — validate early, fail fast
- ✅ Full TypeScript inference on your env object
- ✅ Supports defaults, allowed values, and custom validators
- ✅ No heavy dependencies

## License

[MIT](./LICENSE)