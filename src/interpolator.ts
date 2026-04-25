/**
 * interpolator.ts
 * Handles variable interpolation in environment variable values.
 * Supports ${VAR_NAME} and $VAR_NAME syntax.
 */

export type EnvSource = Record<string, string | undefined>;

const INTERPOLATION_REGEX = /\$\{([^}]+)\}|\$([A-Z_][A-Z0-9_]*)/g;

/**
 * Interpolates variable references within a string value.
 * References to undefined variables are replaced with an empty string.
 *
 * @param value - The raw string that may contain variable references
 * @param source - The environment source to resolve variable names from
 * @param visited - Internal set to detect circular references
 */
export function interpolate(
  value: string,
  source: EnvSource,
  visited: Set<string> = new Set()
): string {
  return value.replace(INTERPOLATION_REGEX, (_match, braced: string, bare: string) => {
    const varName = braced ?? bare;

    if (visited.has(varName)) {
      throw new Error(`Circular interpolation detected for variable: "${varName}"`);
    }

    const resolved = source[varName];
    if (resolved === undefined) {
      return "";
    }

    const nextVisited = new Set(visited).add(varName);
    return interpolate(resolved, source, nextVisited);
  });
}

/**
 * Applies interpolation to all values in an env source map.
 */
export function interpolateAll(source: EnvSource): EnvSource {
  const result: EnvSource = {};
  for (const [key, value] of Object.entries(source)) {
    result[key] = value !== undefined ? interpolate(value, source) : undefined;
  }
  return result;
}
