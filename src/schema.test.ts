import { str, num, bool, EnvVarDefinition } from "./schema";
import { stringTransformers, numberTransformers } from "./transformer";

describe("str helper", () => {
  it("creates a string definition with defaults", () => {
    const def = str();
    expect(def.type).toBe("string");
    expect(def.required).toBeUndefined();
  });

  it("accepts required and default options", () => {
    const def = str({ required: true, default: "localhost" });
    expect(def.required).toBe(true);
    expect(def.default).toBe("localhost");
  });

  it("accepts allowedValues", () => {
    const def = str({ allowedValues: ["dev", "prod", "test"] });
    expect(def.allowedValues).toEqual(["dev", "prod", "test"]);
  });

  it("accepts a transform function", () => {
    const def = str({ transform: stringTransformers.trim });
    expect(typeof def.transform).toBe("function");
    expect(def.transform!("  hello  ")).toBe("hello");
  });
});

describe("num helper", () => {
  it("creates a number definition with type 'number'", () => {
    const def = num();
    expect(def.type).toBe("number");
  });

  it("accepts default and description", () => {
    const def = num({ default: 3000, description: "Port number" });
    expect(def.default).toBe(3000);
    expect(def.description).toBe("Port number");
  });

  it("accepts a transform function", () => {
    const def = num({ transform: numberTransformers.abs });
    expect(def.transform!(-42)).toBe(42);
  });
});

describe("bool helper", () => {
  it("creates a boolean definition with type 'boolean'", () => {
    const def = bool();
    expect(def.type).toBe("boolean");
  });

  it("accepts required option", () => {
    const def = bool({ required: true });
    expect(def.required).toBe(true);
  });

  it("accepts a default value", () => {
    const def = bool({ default: false });
    expect(def.default).toBe(false);
  });
});

describe("EnvVarDefinition type structure", () => {
  it("supports full definition object", () => {
    const def: EnvVarDefinition<string> = {
      type: "string",
      required: true,
      default: "default-value",
      description: "A sample variable",
      allowedValues: ["a", "b"],
      transform: (v) => v.trim(),
    };
    expect(def.type).toBe("string");
    expect(def.allowedValues).toHaveLength(2);
  });
});
