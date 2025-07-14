import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    reporters: ['default', ['junit', { outputFile: 'reports/test-results.xml' }]],
    coverage: {
      provider: 'istanbul',
    },
  }
});
