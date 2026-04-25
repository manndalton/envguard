/**
 * auditor.ts
 * Tracks which environment variables were accessed at runtime,
 * enabling detection of unused or undeclared variable reads.
 */

export interface AuditEntry {
  key: string;
  accessedAt: Date;
  value: string | undefined;
}

export interface AuditReport {
  accessed: AuditEntry[];
  undeclared: string[];
  unused: string[];
}

const accessLog: Map<string, AuditEntry> = new Map();
let declaredKeys: Set<string> = new Set();

/**
 * Register the set of declared environment variable keys from a schema.
 */
export function registerDeclaredKeys(keys: string[]): void {
  declaredKeys = new Set(keys);
}

/**
 * Record an access to an environment variable.
 */
export function recordAccess(key: string, value: string | undefined): void {
  if (!accessLog.has(key)) {
    accessLog.set(key, { key, accessedAt: new Date(), value });
  }
}

/**
 * Build an audit report comparing accessed keys against declared keys.
 */
export function buildAuditReport(): AuditReport {
  const accessed = Array.from(accessLog.values());
  const accessedKeys = new Set(accessLog.keys());

  const undeclared = accessed
    .filter((e) => !declaredKeys.has(e.key))
    .map((e) => e.key);

  const unused = Array.from(declaredKeys).filter(
    (k) => !accessedKeys.has(k)
  );

  return { accessed, undeclared, unused };
}

/**
 * Reset the audit log (useful between tests or app restarts).
 */
export function resetAudit(): void {
  accessLog.clear();
  declaredKeys = new Set();
}

/**
 * Create a proxied env object that automatically records accesses.
 */
export function createAuditedEnv<T extends Record<string, unknown>>(
  env: T
): T {
  return new Proxy(env, {
    get(target, prop: string) {
      const value = target[prop] as string | undefined;
      recordAccess(prop, value);
      return value;
    },
  });
}
