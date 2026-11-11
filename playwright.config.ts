import { defineConfig } from "@playwright/test";

// Run against a production build: `npm run build && npm run test:e2e`
export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  workers: 4,
  outputDir: "test-results",
  reporter: [["list"]],
  use: { baseURL: "http://localhost:3100" },
  // The flip runs first and alone: a browser skips a view transition when the machine is busy
  projects: [
    { name: "landing", testMatch: "landing.spec.ts" },
    { name: "panel", testMatch: /(panel-mobile|seller-flows|product-changes)\.spec\.ts/, dependencies: ["landing"] },
    // Same build with the UAE open for sign-ups. No test here reaches a real backend's write routes
    { name: "signup", testMatch: "signup.spec.ts", dependencies: ["landing"], use: { baseURL: "http://localhost:3101" } },
  ],
  webServer: [
    { command: "npx next start -p 3100", url: "http://localhost:3100", reuseExistingServer: true, env: { SELLER_SIGNUP_COUNTRIES: "IN" } },
    { command: "npx next start -p 3101", url: "http://localhost:3101", reuseExistingServer: true, env: { SELLER_SIGNUP_COUNTRIES: "IN,AE" } },
  ],
});
