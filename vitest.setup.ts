// vitest.setup.ts
import '@testing-library/jest-dom';

// Set up environment variables for testing (only in test environment)
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
  process.env.NEXT_PUBLIC_APP_NAME = 'AWFR';
  process.env.NEXT_PUBLIC_APP_VERSION = '1.0.0';
}

// Mock window.matchMedia for testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
