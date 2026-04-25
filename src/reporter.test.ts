import {
  buildReport,
  formatError,
  formatReport,
  assertReport,
  ValidationError,
} from "./reporter";

describe("buildReport", () => {
  it("returns valid report when no errors", () => {
    const report = buildReport([]);
    expect(report.valid).toBe(true);
    expect(report.errors).toHaveLength(0);
  });

  it("returns invalid report when errors exist", () => {
    const errors: ValidationError[] = [
      { key: "PORT", message: "must be a number" },
    ];
    const report = buildReport(errors);
    expect(report.valid).toBe(false);
    expect(report.errors).toHaveLength(1);
  });
});

describe("formatError", () => {
  it("formats error without received value", () => {
    const error: ValidationError = { key: "API_KEY", message: "is required" };
    expect(formatError(error)).toBe("  [API_KEY] is required");
  });

  it("formats error with received value", () => {
    const error: ValidationError = {
      key: "PORT",
      message: "must be a number",
      received: "abc",
    };
    expect(formatError(error)).toBe(
      '  [PORT] must be a number (received: "abc")'
    );
  });

  it("formats error with empty string as received value", () => {
    const error: ValidationError = {
      key: "API_KEY",
      message: "must not be empty",
      received: "",
    };
    expect(formatError(error)).toBe(
      '  [API_KEY] must not be empty (received: "")'
    );
  });
});

describe("formatReport", () => {
  it("returns success message for valid report", () => {
    const report = buildReport([]);
    expect(formatReport(report)).toBe("✔ Environment validation passed.");
  });

  it("returns failure message with all errors", () => {
    const errors: ValidationError[] = [
      { key: "PORT", message: "must be a number", received: "abc" },
      { key: "HOST", message: "is required" },
    ];
    const report = buildReport(errors);
    const result = formatReport(report);
    expect(result).toContain("✖ Environment validation failed with 2 error(s):");
    expect(result).toContain("[PORT]");
    expect(result).toContain("[HOST]");
  });
});

describe("assertReport", () => {
  it("does not throw for a valid report", () => {
    const report = buildReport([]);
    expect(() => assertReport(report, { silent: true })).not.toThrow();
  });

  it("throws with formatted message for invalid report", () => {
    const errors: ValidationError[] = [
      { key: "DATABASE_URL", message: "is required" },
    ];
    const report = buildReport(errors);
    expect(() => assertReport(report, { silent: true })).toThrow(
      /DATABASE_URL/
    );
  });

  it("logs success when not silent", () => {
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    const report = buildReport([]);
    assertReport(report);
    expect(spy).toHaveBeenCalledWith("✔ Environment validation passed.");
    spy.mockRestore();
  });

  it("logs error when not silent and report is invalid", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    const errors: ValidationError[] = [
      { key: "PORT", message: "must be a number" },
    ];
    const report = buildReport(errors);
    expect(() => assertReport(report)).toThrow(/PORT/);
    spy.mockRestore();
  });
});
