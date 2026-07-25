import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 15_000,
  retries: 0,
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    launchOptions: {
      executablePath:
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      args: ["--no-first-run", "--disable-gpu"],
    },
  },
  webServer: {
    command: "bun dev",
    port: 3000,
    reuseExistingServer: true,
    timeout: 10_000,
  },
});
