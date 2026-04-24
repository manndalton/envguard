import {
  applyTransforms,
  composeTransforms,
  stringTransformers,
  numberTransformers,
} from "./transformer";

describe("applyTransforms", () => {
  it("applies a single string transform", () => {
    const result = applyTransforms("  hello  ", [stringTransformers.trim]);
    expect(result).toBe("hello");
  });

  it("applies multiple transforms in order", () => {
    const result = applyTransforms("  Hello World  ", [
      stringTransformers.trim,
      stringTransformers.lowercase,
    ]);
    expect(result).toBe("hello world");
  });

  it("applies number transforms", () => {
    const result = applyTransforms(-3.7, [numberTransformers.abs, numberTransformers.floor]);
    expect(result).toBe(3);
  });

  it("returns value unchanged when no transforms provided", () => {
    const result = applyTransforms("unchanged", []);
    expect(result).toBe("unchanged");
  });
});

describe("composeTransforms", () => {
  it("composes string transforms into a single function", () => {
    const transform = composeTransforms(
      stringTransformers.trim,
      stringTransformers.uppercase
    );
    expect(transform("  hello  ")).toBe("HELLO");
  });

  it("composes number transforms into a single function", () => {
    const transform = composeTransforms(
      numberTransformers.abs,
      numberTransformers.ceil
    );
    expect(transform(-2.3)).toBe(3);
  });

  it("composed transform with no fns returns original value", () => {
    const transform = composeTransforms<string>();
    expect(transform("test")).toBe("test");
  });
});

describe("stringTransformers", () => {
  it("trim removes surrounding whitespace", () => {
    expect(stringTransformers.trim("  hi  ")).toBe("hi");
  });

  it("lowercase converts to lower case", () => {
    expect(stringTransformers.lowercase("HELLO")).toBe("hello");
  });

  it("uppercase converts to upper case", () => {
    expect(stringTransformers.uppercase("hello")).toBe("HELLO");
  });
});

describe("numberTransformers", () => {
  it("abs returns absolute value", () => {
    expect(numberTransformers.abs(-5)).toBe(5);
  });

  it("floor rounds down", () => {
    expect(numberTransformers.floor(4.9)).toBe(4);
  });

  it("ceil rounds up", () => {
    expect(numberTransformers.ceil(4.1)).toBe(5);
  });
});
