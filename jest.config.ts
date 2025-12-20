import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(jose)/)',
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/data/repositories/**/*.ts',
    'src/domain/use-cases/**/*.ts',
    'src/app/components/**/*.tsx',
    'src/presentation/actions/**/*.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
