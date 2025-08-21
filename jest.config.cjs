// Alternative Solution 1: Jest without next/jest
// This avoids the early Next.js loading issue entirely

module.exports = {
  // CRITICAL: Load polyfills BEFORE anything else
  setupFiles: ['<rootDir>/jest.polyfills.ts'],
  // Then load testing utilities
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // Use jsdom for browser-like environment
  testEnvironment: 'jest-environment-jsdom',
  // Module name mapping (corrected property name)
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
  },
  // Transform patterns
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(next|@next)/)',
  ],
  // Extensions to resolve
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  // Test patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
  ],
  // Coverage
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
};
