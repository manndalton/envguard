/**
 * mask.ts — Utilities to mask sensitive environment variable values
 * before logging, reporting, or serializing.
 */

export type MaskOptions = {
  /** Characters to show at start of value */
  revealStart?: number;
  /** Characters to show at end of value */
  revealEnd?: number;
  /** Character to use for masking */
  maskChar?: string;
  /** Minimum masked segment length */
  minMaskLength?: number;
};

const DEFAULT_OPTIONS: Required<MaskOptions> = {
  revealStart: 0,
  revealEnd: 0,
  maskChar: '*',
  minMaskLength: 4,
};

/**
 * Masks a single string value according to options.
 */
export function maskValue(value: string, options: MaskOptions = {}): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const len = value.length;

  if (len === 0) return value;

  const start = Math.min(opts.revealStart, len);
  const end = Math.min(opts.revealEnd, len - start);
  const maskLen = Math.max(len - start - end, opts.minMaskLength);

  const prefix = value.slice(0, start);
  const suffix = end > 0 ? value.slice(len - end) : '';
  const masked = opts.maskChar.repeat(maskLen);

  return `${prefix}${masked}${suffix}`;
}

/**
 * Masks all values in a record whose keys match the sensitive pattern.
 */
export function maskEnv(
  env: Record<string, string>,
  sensitiveKeys: (string | RegExp)[],
  options: MaskOptions = {}
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(env)) {
    const isSensitive = sensitiveKeys.some((pattern) =>
      typeof pattern === 'string'
        ? key === pattern
        : pattern.test(key)
    );
    result[key] = isSensitive ? maskValue(value, options) : value;
  }

  return result;
}

/**
 * Default sensitive key patterns covering common secret variable names.
 */
export const DEFAULT_SENSITIVE_PATTERNS: RegExp[] = [
  /password/i,
  /secret/i,
  /token/i,
  /api[_-]?key/i,
  /private[_-]?key/i,
  /auth/i,
  /credential/i,
];
