import { describe, it, expect } from "vitest";
import {
  groupEnvBy,
  groupEnvBySegment,
  flattenGrouped,
  groupKeys,
} from "./grouper";

const sampleEnv = {
  DB_HOST: "localhost",
  DB_PORT: "5432",
  APP_NAME: "envguard",
  APP_ENV: "test",
  SECRET_KEY: "abc123",
};

describe("groupEnvBy", () => {
  it("groups entries by classifier result", () => {
    const grouped = groupEnvBy(sampleEnv, (key) =>
      key.startsWith("DB") ? "database" : "other"
    );
    expect(grouped["database"]).toEqual({ DB_HOST: "localhost", DB_PORT: "5432" });
    expect(grouped["other"]).toHaveProperty("APP_NAME");
    expect(grouped["other"]).toHaveProperty("SECRET_KEY");
  });

  it("places unclassified entries in __ungrouped__", () => {
    const grouped = groupEnvBy(sampleEnv, (key) =>
      key.startsWith("DB") ? "database" : null
    );
    expect(grouped["__ungrouped__"]).toHaveProperty("APP_NAME");
    expect(grouped["__ungrouped__"]).toHaveProperty("APP_ENV");
    expect(grouped["__ungrouped__"]).toHaveProperty("SECRET_KEY");
  });

  it("returns empty object for empty env", () => {
    expect(groupEnvBy({}, () => "x")).toEqual({});
  });

  it("passes both key and value to classifier", () => {
    const grouped = groupEnvBy(
      { FLAG: "true", PORT: "8080" },
      (_key, value) => (value === "true" ? "flags" : "config")
    );
    expect(grouped["flags"]).toEqual({ FLAG: "true" });
    expect(grouped["config"]).toEqual({ PORT: "8080" });
  });
});

describe("groupEnvBySegment", () => {
  it("groups by first segment with default separator", () => {
    const grouped = groupEnvBySegment(sampleEnv);
    expect(grouped["DB"]).toEqual({ DB_HOST: "localhost", DB_PORT: "5432" });
    expect(grouped["APP"]).toEqual({ APP_NAME: "envguard", APP_ENV: "test" });
    expect(grouped["SECRET"]).toEqual({ SECRET_KEY: "abc123" });
  });

  it("groups by two segments when depth=2", () => {
    const env = { APP_DB_HOST: "h", APP_DB_PORT: "p", APP_CACHE_TTL: "60" };
    const grouped = groupEnvBySegment(env, "_", 2);
    expect(grouped["APP_DB"]).toHaveProperty("APP_DB_HOST");
    expect(grouped["APP_DB"]).toHaveProperty("APP_DB_PORT");
    expect(grouped["APP_CACHE"]).toHaveProperty("APP_CACHE_TTL");
  });

  it("uses key as group when key has fewer parts than depth", () => {
    const grouped = groupEnvBySegment({ SIMPLE: "val" }, "_", 2);
    expect(grouped["SIMPLE"]).toEqual({ SIMPLE: "val" });
  });
});

describe("flattenGrouped", () => {
  it("merges all groups into a single record", () => {
    const grouped = groupEnvBySegment(sampleEnv);
    const flat = flattenGrouped(grouped);
    expect(flat).toEqual(sampleEnv);
  });

  it("later groups overwrite on collision", () => {
    const grouped = { a: { KEY: "first" }, b: { KEY: "second" } };
    expect(flattenGrouped(grouped)).toEqual({ KEY: "second" });
  });
});

describe("groupKeys", () => {
  it("returns all group names", () => {
    const grouped = groupEnvBySegment(sampleEnv);
    const keys = groupKeys(grouped);
    expect(keys).toContain("DB");
    expect(keys).toContain("APP");
    expect(keys).toContain("SECRET");
    expect(keys).toHaveLength(3);
  });
});
