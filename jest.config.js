module.exports = {
  testEnvironment: 'node',
  setupFiles: ['dotenv/config'],
  testPathIgnorePatterns: ['node_modules', 'src', 'types'],
  moduleFileExtensions: ['js', 'json'],
  testTimeout: 30000,
};
