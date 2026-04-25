import { deepFreeze, freezeEnv, isFrozen } from "./freeze";

describe("deepFreeze", () => {
  it("freezes a flat object", () => {
    const obj = { PORT: 3000, HOST: "localhost" };
    const frozen = deepFreeze(obj);
    expect(Object.isFrozen(frozen)).toBe(true);
  });

  it("prevents mutation of a flat object", () => {
    const obj = deepFreeze({ PORT: 3000 });
    expect(() => {
      (obj as Record<string, unknown>).PORT = 9999;
    }).toThrow();
  });

  it("freezes nested objects recursively", () => {
    const obj = deepFreeze({ db: { host: "localhost", port: 5432 } });
    expect(Object.isFrozen(obj.db)).toBe(true);
  });

  it("leaves primitives unchanged", () => {
    const obj = deepFreeze({ name: "envguard", version: 1, active: true });
    expect(obj.name).toBe("envguard");
    expect(obj.version).toBe(1);
    expect(obj.active).toBe(true);
  });
});

describe("isFrozen", () => {
  it("returns true for a frozen object", () => {
    const obj = Object.freeze({ x: 1 });
    expect(isFrozen(obj)).toBe(true);
  });

  it("returns false for a mutable object", () => {
    const obj = { x: 1 };
    expect(isFrozen(obj)).toBe(false);
  });
});

describe("freezeEnv", () => {
  it("freezes a valid env record", () => {
    const env = { PORT: "3000", NODE_ENV: "production" };
    const frozen = freezeEnv(env);
    expect(Object.isFrozen(frozen)).toBe(true);
  });

  it("throws for non-object input", () => {
    expect(() => freezeEnv(null as unknown as Record<string, unknown>)).toThrow(TypeError);
    expect(() => freezeEnv([] as unknown as Record<string, unknown>)).toThrow(TypeError);
  });

  it("returns the same reference after freezing", () => {
    const env = { KEY: "value" };
    const frozen = freezeEnv(env);
    expect(frozen).toBe(env);
  });
});
