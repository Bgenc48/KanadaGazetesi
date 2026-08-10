import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // scripts/ altındaki foto hattı yardımcıları da birim testlerine dahil.
    include: ['src/**/*.{test,spec}.ts', 'scripts/**/*.{test,spec}.mjs'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['src/utils/**/*.ts'],
    },
  },
});
