/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/e2e/'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  moduleNameMapper: {
    '^@types$': '<rootDir>/src/@types/index.ts',
    '^@types/(.*)$': '<rootDir>/src/@types/$1',
    '^@core/(.*)$': '<rootDir>/src/app/core/$1',
    '^@shared/(.*)$': '<rootDir>/src/app/shared/$1',
    '^app/(.*)$': '<rootDir>/src/app/$1',
    '^environments/(.*)$': '<rootDir>/src/environments/$1',
  },
};
