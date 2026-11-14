import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

const envFile = fileURLToPath(new URL("../../.env", import.meta.url));
if (fs.existsSync(envFile)) process.loadEnvFile(envFile);

const ci = !!process.env.CI;

export default defineConfig({
  testDir: ".",
  outputDir: "test-results",
  fullyParallel: true,
  forbidOnly: ci,
  retries: ci ? 1 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    screenshot: "on",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
