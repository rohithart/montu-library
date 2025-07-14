import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest/presets/js-with-ts-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }]
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  testMatch: ['**/*.spec.ts'],
  coverageThreshold: {
    global: {
      statements: 100,
      branches: 75,
      functions: 100,
      lines: 100,
    },
  },
  reporters: [
  'default',
  ['jest-junit', { outputDirectory: 'reports', outputName: 'test-results.xml' }]
],

};

export default config;
