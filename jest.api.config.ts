import config from "./jest.config";
export default {
  ...config,
  testMatch: ["<rootDir>/tests/routes/**/*.test.ts"],
};
