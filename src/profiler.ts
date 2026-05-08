/**
 * profiler.ts — Tracks timing and access patterns for env validation runs.
 */

export interface ProfileEntry {
  key: string;
  durationMs: number;
  success: boolean;
}

export interface ProfileReport {
  totalMs: number;
  entries: ProfileEntry[];
  slowestKey: string | null;
  failureCount: number;
}

const entries: ProfileEntry[] = [];
let runStart: number | null = null;

export function startRun(): void {
  runStart = performance.now();
  entries.length = 0;
}

export function recordEntry(key: string, durationMs: number, success: boolean): void {
  entries.push({ key, durationMs, success });
}

export function endRun(): ProfileReport {
  const totalMs = runStart !== null ? performance.now() - runStart : 0;
  runStart = null;

  const failureCount = entries.filter((e) => !e.success).length;

  let slowestKey: string | null = null;
  let maxDuration = -1;
  for (const entry of entries) {
    if (entry.durationMs > maxDuration) {
      maxDuration = entry.durationMs;
      slowestKey = entry.key;
    }
  }

  return {
    totalMs,
    entries: [...entries],
    slowestKey,
    failureCount,
  };
}

export function resetProfiler(): void {
  entries.length = 0;
  runStart = null;
}

export function formatProfileReport(report: ProfileReport): string {
  const lines: string[] = [
    `Profile Report`,
    `  Total time : ${report.totalMs.toFixed(3)}ms`,
    `  Keys       : ${report.entries.length}`,
    `  Failures   : ${report.failureCount}`,
    `  Slowest    : ${report.slowestKey ?? '(none)'}`,
    ``,
    `  Key breakdown:`,
  ];
  for (const e of report.entries) {
    const status = e.success ? '✓' : '✗';
    lines.push(`    ${status} ${e.key.padEnd(30)} ${e.durationMs.toFixed(3)}ms`);
  }
  return lines.join('\n');
}
