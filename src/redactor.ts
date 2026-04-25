/**
 * redactor.ts
 * Provides utilities to redact sensitive environment variable values
 * based on key patterns or explicit key lists before logging or reporting.
 */

export interface RedactorOptions {
  /** List of exact keys to redact */
  keys?: string[];
  /** Patterns (regex) to match keys for redaction */
  patterns?: RegExp[];
  /** Replacement string for redacted values */
  placeholder?: string;
}

const DEFAULT_SENSITIVE_PATTERNS: RegExp[] = [
  /secret/i,
  /password/i,
  /passwd/i,
  /token/i,
  /api[_-]?key/i,
  /private[_-]?key/i,
  /auth/i,
  /credential/i,
];

const DEFAULT_PLACEHOLDER = "[REDACTED]";

/**
 * Determines whether a given key should be redacted.
 */
export function shouldRedact(
  key: string,
  options: RedactorOptions = {}
): boolean {
  const { keys = [], patterns = DEFAULT_SENSITIVE_PATTERNS } = options;

  if (keys.includes(key)) return true;
  return patterns.some((pattern) => pattern.test(key));
}

/**
 * Redacts a single value if the key matches redaction criteria.
 */
export function redactValue(
  key: string,
  value: string,
  options: RedactorOptions = {}
): string {
  const placeholder = options.placeholder ?? DEFAULT_PLACEHOLDER;
  return shouldRedact(key, options) ? placeholder : value;
}

/**
 * Redacts all matching keys in an environment record.
 */
export function redactEnv(
  env: Record<string, string>,
  options: RedactorOptions = {}
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    result[key] = redactValue(key, value, options);
  }
  return result;
}
