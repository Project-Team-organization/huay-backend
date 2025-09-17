// Jest setup file
const mongoose = require('mongoose');

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Setup test database
beforeAll(async () => {
  // Mock MongoDB connection for tests
  jest.mock('./config/db', () => ({
    __esModule: true,
    default: jest.fn()
  }));
});

afterAll(async () => {
  // Cleanup after all tests
  jest.clearAllMocks();
});
