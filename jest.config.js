const { createDefaultPreset } = require("ts-jest");
const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  globalSetup: "./src/test/jest.globalSetup.ts",
  globalTeardown: "./src/test/jest.globalTeardown.ts",
};
