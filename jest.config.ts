import type { Config } from 'jest';
import { TS_EXT_TO_TREAT_AS_ESM, ESM_TS_TRANSFORM_PATTERN } from 'ts-jest'

const config: Config = {
  preset: 'ts-jest/presets/js-with-ts-esm',  // ESM bridge
  testEnvironment: 'node',
  // extensionsToTreatAsEsm: ['.ts'],
  // transform: {
  //   '^.+\\.tsx?$': ['ts-jest', { useESM: true }]
  // },

  extensionsToTreatAsEsm: [...TS_EXT_TO_TREAT_AS_ESM],
  transform: {
    [ESM_TS_TRANSFORM_PATTERN]: [
      'ts-jest',
      {
        //...other `ts-jest` options
        useESM: true,
      },
    ],
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
