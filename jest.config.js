module.exports = {
  clearMocks: true,
  coveragePathIgnorePatterns: ['/node_modules/', '/sit/'],
  globalSetup: '<rootDir>/sit/globalSetup.js',
  globalTeardown: '<rootDir>/sit/globalTeardown.js',
  testEnvironment: 'node',
  testTimeout: 120 * 1000
}
