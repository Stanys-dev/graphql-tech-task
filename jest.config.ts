// jest.config.ts
import type { Config } from 'jest';

const common: Partial<Config> = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: { '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: 'tsconfig.json' }] },
  modulePaths: ['src/utils'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/*.ts',
    '!src/**/*.d.ts',
    '!src/infrastructure/persistence/migration/*.ts',
    '!src/infrastructure/persistence/entities/*.ts',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/node_modules/',
    '<rootDir>/src/infrastructure/persistence/migration/',
    '<rootDir>/src/infrastructure/persistence/entities/',
  ],
  coverageDirectory: 'coverage',
};

const config: Config = {
  // Two projects: unit and e2e
  projects: [
    {
      ...common,
      displayName: 'unit',
      testMatch: ['<rootDir>/test/unit/**/*.spec.ts'],
    },
    {
      ...common,
      displayName: 'e2e',
      testMatch: ['<rootDir>/test/e2e/**/*.e2e-spec.ts'],
      testPathIgnorePatterns: ['<rootDir>/test/unit/'],
    },
  ],
};

export default config;
