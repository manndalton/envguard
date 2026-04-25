import * as fs from 'fs';
import { loadEnvFile } from './loader';
import { validateEnv, EnvSchema } from './validate';
import { guardEnv } from './envguard';

export type WatcherOptions = {
  filePath: string;
  debounceMs?: number;
  onReload?: (newEnv: Record<string, string>) => void;
  onError?: (err: Error) => void;
};

export type WatcherHandle = {
  stop: () => void;
};

export function watchEnvFile<T extends EnvSchema>(
  schema: T,
  options: WatcherOptions
): WatcherHandle {
  const { filePath, debounceMs = 300, onReload, onError } = options;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const handleChange = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      try {
        const raw = loadEnvFile(filePath);
        const result = guardEnv(schema, { source: raw, strict: false });
        if (onReload) onReload(result as unknown as Record<string, string>);
      } catch (err) {
        if (onError) onError(err instanceof Error ? err : new Error(String(err)));
      }
    }, debounceMs);
  };

  const watcher = fs.watch(filePath, { persistent: false }, handleChange);

  watcher.on('error', (err) => {
    if (onError) onError(err);
  });

  return {
    stop: () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      watcher.close();
    },
  };
}
