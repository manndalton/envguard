import { describe, it, expect } from "vitest";
import {
  shouldRedact,
  redactValue,
  redactEnv,
  RedactorOptions,
} from "./redactor";

describe("shouldRedact", () => {
  it("returns true for keys matching default sensitive patterns", () => {
    expect(shouldRedact("DB_PASSWORD")).toBe(true);
    expect(shouldRedact("API_KEY")).toBe(true);
    expect(shouldRedact("AUTH_TOKEN")).toBe(true);
    expect(shouldRedact("SECRET_VALUE")).toBe(true);
    expect(shouldRedact("PRIVATE_KEY")).toBe(true);
  });

  it("returns false for non-sensitive keys", () => {
    expect(shouldRedact("APP_PORT")).toBe(false);
    expect(shouldRedact("NODE_ENV")).toBe(false);
    expect(shouldRedact("LOG_LEVEL")).toBe(false);
  });

  it("returns true for explicitly listed keys", () => {
    const options: RedactorOptions = { keys: ["MY_CUSTOM_KEY"] };
    expect(shouldRedact("MY_CUSTOM_KEY", options)).toBe(true);
    expect(shouldRedact("OTHER_KEY", options)).toBe(false);
  });

  it("respects custom patterns", () => {
    const options: RedactorOptions = { patterns: [/ssn/i] };
    expect(shouldRedact("USER_SSN", options)).toBe(true);
    expect(shouldRedact("DB_PASSWORD", options)).toBe(false);
  });
});

describe("redactValue", () => {
  it("replaces sensitive values with default placeholder", () => {
    expect(redactValue("DB_PASSWORD", "supersecret")).toBe("[REDACTED]");
  });

  it("leaves non-sensitive values unchanged", () => {
    expect(redactValue("APP_PORT", "3000")).toBe("3000");
  });

  it("uses custom placeholder when provided", () => {
    const options: RedactorOptions = { placeholder: "***" };
    expect(redactValue("API_KEY", "abc123", options)).toBe("***");
  });
});

describe("redactEnv", () => {
  it("redacts sensitive keys and preserves others", () => {
    const env = {
      APP_PORT: "8080",
      DB_PASSWORD: "hunter2",
      API_KEY: "xyz789",
      NODE_ENV: "production",
    };
    const result = redactEnv(env);
    expect(result.APP_PORT).toBe("8080");
    expect(result.NODE_ENV).toBe("production");
    expect(result.DB_PASSWORD).toBe("[REDACTED]");
    expect(result.API_KEY).toBe("[REDACTED]");
  });

  it("returns an empty object for empty input", () => {
    expect(redactEnv({})).toEqual({});
  });

  it("applies custom keys option", () => {
    const env = { CUSTOM_FIELD: "sensitive", SAFE_FIELD: "visible" };
    const result = redactEnv(env, { keys: ["CUSTOM_FIELD"], patterns: [] });
    expect(result.CUSTOM_FIELD).toBe("[REDACTED]");
    expect(result.SAFE_FIELD).toBe("visible");
  });
});
