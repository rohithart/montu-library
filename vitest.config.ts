import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    reporters: ['json', 'default'],
      outputFile: './test-output.json',
    coverage: {
      provider: 'istanbul',
    },
  }
});
