import { describe, it, expect } from "vitest";
import { filterByPrefix, addPrefix, normalisePrefix } from "./prefixer";

const sampleEnv: Record<string, string | undefined> = {
  APP_PORT: "3000",
  APP_HOST: "localhost",
  DB_URL: "postgres://localhost/dev",
  APP_DEBUG: "true",
  UNRELATED: "value",
};

describe("filterByPrefix", () => {
  it("returns only keys starting with the prefix", () => {
    const result = filterByPrefix(sampleEnv, { prefix: "APP_" });
    expect(Object.keys(result)).toEqual(["PORT", "HOST", "DEBUG"]);
  });

  it("strips the prefix by default", () => {
    const result = filterByPrefix(sampleEnv, { prefix: "APP_" });
    expect(result["PORT"]).toBe("3000");
    expect(result["HOST"]).toBe("localhost");
  });

  it("preserves original keys when strip is false", () => {
    const result = filterByPrefix(sampleEnv, { prefix: "APP_", strip: false });
    expect(result["APP_PORT"]).toBe("3000");
    expect(result["APP_HOST"]).toBe("localhost");
  });

  it("returns empty object when no keys match", () => {
    const result = filterByPrefix(sampleEnv, { prefix: "MISSING_" });
    expect(result).toEqual({});
  });

  it("handles undefined values", () => {
    const env = { APP_KEY: undefined };
    const result = filterByPrefix(env, { prefix: "APP_" });
    expect(result["KEY"]).toBeUndefined();
  });
});

describe("addPrefix", () => {
  it("prepends the prefix to every key", () => {
    const result = addPrefix({ PORT: "3000", HOST: "localhost" }, "APP_");
    expect(result).toEqual({ APP_PORT: "3000", APP_HOST: "localhost" });
  });

  it("returns empty object for empty input", () => {
    expect(addPrefix({}, "APP_")).toEqual({});
  });
});

describe("normalisePrefix", () => {
  it("appends underscore when prefix has no separator", () => {
    expect(normalisePrefix("APP")).toBe("APP_");
  });

  it("does not double-append underscore", () => {
    expect(normalisePrefix("APP_")).toBe("APP_");
  });

  it("preserves dot separator", () => {
    expect(normalisePrefix("app.")).toBe("app.");
  });

  it("preserves dash separator", () => {
    expect(normalisePrefix("app-")).toBe("app-");
  });

  it("returns empty string unchanged", () => {
    expect(normalisePrefix("")).toBe("");
  });
});
