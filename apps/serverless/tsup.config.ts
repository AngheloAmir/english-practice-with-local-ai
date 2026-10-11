import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/local.ts', 'src/lambda.ts'],
  splitting: false,
  sourcemap: true,
  clean: true,
  format: ['cjs'],
});