import { EnvType, FieldSchema } from './schema';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^https?:\/\/.+/;

export class ParseError extends Error {
  constructor(
    public readonly key: string,
    message: string
  ) {
    super(`[envguard] "${key}": ${message}`);
    this.name = 'ParseError';
  }
}

export function parseValue(
  key: string,
  raw: string,
  schema: FieldSchema
): string | number | boolean {
  const { type } = schema;

  switch (type) {
    case 'string':
      return raw;

    case 'number': {
      const num = Number(raw);
      if (isNaN(num)) {
        throw new ParseError(key, `expected a number, got "${raw}"`);
      }
      return num;
    }

    case 'boolean': {
      const lower = raw.toLowerCase();
      if (lower === 'true' || lower === '1') return true;
      if (lower === 'false' || lower === '0') return false;
      throw new ParseError(key, `expected a boolean (true/false/1/0), got "${raw}"`);
    }

    case 'url':
      if (!URL_REGEX.test(raw)) {
        throw new ParseError(key, `expected a valid URL, got "${raw}"`);
      }
      return raw;

    case 'email':
      if (!EMAIL_REGEX.test(raw)) {
        throw new ParseError(key, `expected a valid email address, got "${raw}"`);
      }
      return raw;

    default:
      throw new ParseError(key, `unknown type "${type as string}"`);
  }
}
