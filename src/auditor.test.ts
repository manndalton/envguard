import {
  registerDeclaredKeys,
  recordAccess,
  buildAuditReport,
  resetAudit,
  createAuditedEnv,
} from "./auditor";

beforeEach(() => {
  resetAudit();
});

describe("registerDeclaredKeys", () => {
  it("tracks declared keys for unused detection", () => {
    registerDeclaredKeys(["PORT", "HOST", "DB_URL"]);
    const report = buildAuditReport();
    expect(report.unused).toEqual(expect.arrayContaining(["PORT", "HOST", "DB_URL"]));
  });
});

describe("recordAccess", () => {
  it("records an access entry", () => {
    recordAccess("PORT", "3000");
    const report = buildAuditReport();
    expect(report.accessed).toHaveLength(1);
    expect(report.accessed[0].key).toBe("PORT");
    expect(report.accessed[0].value).toBe("3000");
  });

  it("only records first access per key", () => {
    recordAccess("PORT", "3000");
    recordAccess("PORT", "4000");
    const report = buildAuditReport();
    expect(report.accessed).toHaveLength(1);
    expect(report.accessed[0].value).toBe("3000");
  });
});

describe("buildAuditReport", () => {
  it("identifies undeclared accessed keys", () => {
    registerDeclaredKeys(["PORT"]);
    recordAccess("PORT", "3000");
    recordAccess("SECRET_TOKEN", "abc123");
    const report = buildAuditReport();
    expect(report.undeclared).toContain("SECRET_TOKEN");
    expect(report.undeclared).not.toContain("PORT");
  });

  it("identifies unused declared keys", () => {
    registerDeclaredKeys(["PORT", "HOST"]);
    recordAccess("PORT", "3000");
    const report = buildAuditReport();
    expect(report.unused).toContain("HOST");
    expect(report.unused).not.toContain("PORT");
  });

  it("returns empty arrays when nothing is accessed", () => {
    registerDeclaredKeys(["PORT"]);
    const report = buildAuditReport();
    expect(report.accessed).toHaveLength(0);
    expect(report.undeclared).toHaveLength(0);
    expect(report.unused).toContain("PORT");
  });
});

describe("createAuditedEnv", () => {
  it("records accesses via proxy", () => {
    registerDeclaredKeys(["PORT", "HOST"]);
    const env = createAuditedEnv({ PORT: "3000", HOST: "localhost" });

    const port = env.PORT;
    expect(port).toBe("3000");

    const report = buildAuditReport();
    expect(report.accessed.map((e) => e.key)).toContain("PORT");
    expect(report.unused).toContain("HOST");
  });

  it("records undefined values for missing keys", () => {
    const env = createAuditedEnv<Record<string, unknown>>({ PORT: "3000" });
    const val = env.MISSING_KEY;
    expect(val).toBeUndefined();
    const report = buildAuditReport();
    expect(report.accessed.find((e) => e.key === "MISSING_KEY")?.value).toBeUndefined();
  });
});
