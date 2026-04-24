/**
 * reporter.ts
 * Formats and reports validation errors in a human-readable way.
 */

export interface ValidationError {
  key: string;
  message: string;
  received?: string;
}

export interface ValidationReport {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Build a validation report from a list of errors.
 */
export function buildReport(errors: ValidationError[]): ValidationReport {
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format a single validation error into a readable string.
 */
export function formatError(error: ValidationError): string {
  const received =
    error.received !== undefined ? ` (received: "${error.received}")` : "";
  return `  [${error.key}] ${error.message}${received}`;
}

/**
 * Format the full validation report as a multi-line string.
 */
export function formatReport(report: ValidationReport): string {
  if (report.valid) {
    return "✔ Environment validation passed.";
  }

  const lines = [
    `✖ Environment validation failed with ${report.errors.length} error(s):`,
    ...report.errors.map(formatError),
  ];

  return lines.join("\n");
}

/**
 * Throw an error with a formatted report if validation failed.
 * Otherwise, optionally log success.
 */
export function assertReport(
  report: ValidationReport,
  options: { silent?: boolean } = {}
): void {
  if (!report.valid) {
    throw new Error(formatReport(report));
  }
  if (!options.silent) {
    console.log(formatReport(report));
  }
}
