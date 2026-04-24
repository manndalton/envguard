import * as fs from 'fs';
import * as path from 'path';

export interface LoadOptions {
  envPath?: string;
  override?: boolean;
}

/**
 * Parses a .env file content into a key-value record.
 */
export function parseDotEnv(content: string): Record<string, string> {
  const result: Record<string, string> = {};

  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    // Strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key) {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Loads environment variables from a .env file into process.env.
 */
export function loadEnvFile(options: LoadOptions = {}): Record<string, string> {
  const envPath = options.envPath ?? path.resolve(process.cwd(), '.env');

  if (!fs.existsSync(envPath)) {
    return {};
  }

  const content = fs.readFileSync(envPath, 'utf-8');
  const parsed = parseDotEnv(content);

  for (const [key, value] of Object.entries(parsed)) {
    if (options.override || process.env[key] === undefined) {
      process.env[key] = value;
    }
  }

  return parsed;
}
