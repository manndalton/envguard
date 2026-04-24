export type EnvType = 'string' | 'number' | 'boolean' | 'url' | 'email';

export interface FieldSchema {
  type: EnvType;
  required?: boolean;
  default?: string | number | boolean;
  description?: string;
}

export type EnvSchema = Record<string, FieldSchema>;

export type InferEnvType<T extends EnvType> =
  T extends 'string' ? string :
  T extends 'number' ? number :
  T extends 'boolean' ? boolean :
  T extends 'url' ? string :
  T extends 'email' ? string :
  never;

export type InferSchema<S extends EnvSchema> = {
  [K in keyof S]: S[K]['required'] extends false
    ? S[K]['default'] extends undefined
      ? InferEnvType<S[K]['type']> | undefined
      : InferEnvType<S[K]['type']>
    : InferEnvType<S[K]['type']>;
};
