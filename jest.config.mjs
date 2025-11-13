import nextJest from 'next/jest.js'
 
const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})
 
// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const config = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testPathIgnorePatterns: ['<rootDir>/tests/e2e'],

  moduleNameMapper: {
    '^@/src/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },

  collectCoverage: true,
  collectCoverageFrom: [
    // Incluye solo archivos de lógica
    'src/lib/**/*.{ts,tsx,js,jsx}',
    'src/services/**/*.{ts,tsx,js,jsx}',
    'src/stores/**/*.{ts,tsx,js,jsx}',

    // Ignora definiciones, mocks y tests
    '!**/*.d.ts',
    '!**/__tests__/**',
    '!**/__mocks__/**',
    '!**/*.stories.{ts,tsx,js,jsx}',
    '!**/*.config.{js,ts,mjs,cjs}',

    // Ignora todo el árbol de UI y Next.js
    '!src/app/**',
    '!src/components/**',
    '!src/hooks/**',

    // Ignora archivos irrelevantes
    '!src/stores/STORE_TEMPLATE.ts',
    '!src/stores/useAuthStore.ts',
    '!src/lib/getPostLoginRedirect.ts',
    '!src/lib/jwtUtils.ts',
    '!src/lib/toast.ts',
    '!src/lib/roleUtils.ts',
  ],

  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/coverage/',
    '<rootDir>/public/',
    '<rootDir>/tests/',
    '<rootDir>/src/app/',
    '<rootDir>/src/components/',
    '<rootDir>/src/hooks/',
  ],

  coverageReporters: ['text', 'lcov', 'html'],
  // TODO: Uncomment when real tests are written
  // coverageThreshold: {
  //   global: {
  //     branches: 70,
  //     functions: 70,
  //     lines: 70,
  //     statements: 70,
  //   },
  // },
}
 
// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config)
