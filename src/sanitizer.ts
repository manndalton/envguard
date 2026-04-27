/**
 * sanitizer.ts
 * Strips, trims, and normalises raw environment variable values
 * before they are parsed or validated.
 */

export interface SanitizerOptions {
  /** Trim leading/trailing whitespace (default: true) */
  trim?: boolean;
  /** Remove surrounding quotes – single or double (default: true) */
  stripQuotes?: boolean;
  /** Collapse internal runs of whitespace to a single space (default: false) */
  collapseWhitespace?: boolean;
  /** Convert the value to lower-case (default: false) */
  lowercase?: boolean;
  /** Convert the value to upper-case (default: false) */
  uppercase?: boolean;
}

const DEFAULT_OPTIONS: Required<SanitizerOptions> = {
  trim: true,
  stripQuotes: true,
  collapseWhitespace: false,
  lowercase: false,
  uppercase: false,
};

/**
 * Sanitize a single raw string value according to the supplied options.
 */
export function sanitizeValue(
  value: string,
  options: SanitizerOptions = {}
): string {
  const opts: Required<SanitizerOptions> = { ...DEFAULT_OPTIONS, ...options };

  let result = value;

  if (opts.trim) {
    result = result.trim();
  }

  if (opts.stripQuotes) {
    result = result.replace(/^(['"])(.*?)\1$/, '$2');
  }

  if (opts.collapseWhitespace) {
    result = result.replace(/\s+/g, ' ');
  }

  if (opts.lowercase) {
    result = result.toLowerCase();
  } else if (opts.uppercase) {
    result = result.toUpperCase();
  }

  return result;
}

/**
 * Sanitize every value in a raw env record, returning a new object.
 */
export function sanitizeEnv(
  env: Record<string, string>,
  options: SanitizerOptions = {}
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(env).map(([key, value]) => [
      key,
      sanitizeValue(value, options),
    ])
  );
}
