import { describe, it, expect } from "vitest";
import { interpolate, interpolateAll } from "./interpolator";

describe("interpolate", () => {
  it("returns the value unchanged when no references are present", () => {
    expect(interpolate("hello world", {})).toBe("hello world");
  });

  it("replaces ${VAR} syntax with the resolved value", () => {
    const source = { HOST: "localhost", PORT: "5432" };
    expect(interpolate("postgresql://${HOST}:${PORT}/db", source)).toBe(
      "postgresql://localhost:5432/db"
    );
  });

  it("replaces $VAR syntax with the resolved value", () => {
    const source = { NAME: "world" };
    expect(interpolate("hello $NAME", source)).toBe("hello world");
  });

  it("replaces an undefined variable reference with an empty string", () => {
    expect(interpolate("prefix_${MISSING}_suffix", {})).toBe("prefix__suffix");
  });

  it("resolves nested interpolation", () => {
    const source = { BASE: "http://localhost", URL: "${BASE}/api" };
    expect(interpolate("${URL}/v1", source)).toBe("http://localhost/api/v1");
  });

  it("throws on circular references", () => {
    const source = { A: "${B}", B: "${A}" };
    expect(() => interpolate("${A}", source)).toThrow(
      /Circular interpolation detected/
    );
  });

  it("handles multiple references in a single value", () => {
    const source = { FIRST: "John", LAST: "Doe" };
    expect(interpolate("${FIRST} ${LAST}", source)).toBe("John Doe");
  });
});

describe("interpolateAll", () => {
  it("interpolates all values in the source map", () => {
    const source = {
      PROTOCOL: "https",
      HOST: "example.com",
      BASE_URL: "${PROTOCOL}://${HOST}",
      API_URL: "${BASE_URL}/api",
    };
    const result = interpolateAll(source);
    expect(result.BASE_URL).toBe("https://example.com");
    expect(result.API_URL).toBe("https://example.com/api");
  });

  it("leaves values without references unchanged", () => {
    const source = { FOO: "bar", BAZ: "qux" };
    const result = interpolateAll(source);
    expect(result).toEqual({ FOO: "bar", BAZ: "qux" });
  });

  it("handles undefined values gracefully", () => {
    const source: Record<string, string | undefined> = {
      DEFINED: "yes",
      UNDEF: undefined,
    };
    const result = interpolateAll(source);
    expect(result.DEFINED).toBe("yes");
    expect(result.UNDEF).toBeUndefined();
  });
});
