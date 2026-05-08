import {
  startRun,
  recordEntry,
  endRun,
  resetProfiler,
  formatProfileReport,
  type ProfileReport,
} from './profiler';

beforeEach(() => {
  resetProfiler();
});

describe('startRun / endRun', () => {
  it('returns a report with totalMs >= 0', () => {
    startRun();
    const report = endRun();
    expect(report.totalMs).toBeGreaterThanOrEqual(0);
  });

  it('resets entries on each startRun', () => {
    startRun();
    recordEntry('FOO', 1, true);
    endRun();

    startRun();
    const report = endRun();
    expect(report.entries).toHaveLength(0);
  });
});

describe('recordEntry', () => {
  it('captures entry details', () => {
    startRun();
    recordEntry('PORT', 2.5, true);
    recordEntry('SECRET', 0.8, false);
    const report = endRun();

    expect(report.entries).toHaveLength(2);
    expect(report.entries[0]).toEqual({ key: 'PORT', durationMs: 2.5, success: true });
    expect(report.entries[1]).toEqual({ key: 'SECRET', durationMs: 0.8, success: false });
  });
});

describe('failureCount', () => {
  it('counts failed entries', () => {
    startRun();
    recordEntry('A', 1, true);
    recordEntry('B', 1, false);
    recordEntry('C', 1, false);
    const report = endRun();
    expect(report.failureCount).toBe(2);
  });
});

describe('slowestKey', () => {
  it('identifies the key with the longest duration', () => {
    startRun();
    recordEntry('FAST', 0.5, true);
    recordEntry('SLOW', 10.2, true);
    recordEntry('MED', 3.1, true);
    const report = endRun();
    expect(report.slowestKey).toBe('SLOW');
  });

  it('returns null when no entries', () => {
    startRun();
    const report = endRun();
    expect(report.slowestKey).toBeNull();
  });
});

describe('formatProfileReport', () => {
  it('includes key stats in output', () => {
    startRun();
    recordEntry('PORT', 1.2, true);
    recordEntry('DB_URL', 3.4, false);
    const report = endRun();
    const output = formatProfileReport(report);

    expect(output).toContain('Profile Report');
    expect(output).toContain('Failures   : 1');
    expect(output).toContain('Slowest    : DB_URL');
    expect(output).toContain('✓ PORT');
    expect(output).toContain('✗ DB_URL');
  });
});
