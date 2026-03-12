import { workspaceRoot } from '@nx/devkit';
import { nxE2EPreset } from '@nx/playwright/preset';
import { defineConfig, devices } from '@playwright/test';

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env['BASE_URL'] || 'http://localhost:4200';
const isCI = !!process.env['CI'];

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),

  timeout: 30000,
  // Give Angular + Module Federation enough time to load remotes before assertions fail
  expect: { timeout: 15000 },
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],
  ],

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Allow slow CI navigation (MFE lazy loading + remote entry fetching)
    navigationTimeout: 60000,
    actionTimeout: 15000,
  },

  /* In CI: serve pre-built artifacts statically; locally: use the dev server */
  webServer: isCI
    ? [
        { command: 'npx http-server dist/apps/host-shell -p 4200 -s --cors -c-1', url: 'http://localhost:4200', reuseExistingServer: false, timeout: 60000, cwd: workspaceRoot },
        { command: 'npx http-server dist/apps/mfe-dashboard -p 4201 -s --cors -c-1', url: 'http://localhost:4201', reuseExistingServer: false, timeout: 60000, cwd: workspaceRoot },
        { command: 'npx http-server dist/apps/mfe-tasks -p 4202 -s --cors -c-1', url: 'http://localhost:4202', reuseExistingServer: false, timeout: 60000, cwd: workspaceRoot },
        { command: 'npx http-server dist/apps/mfe-profile -p 4203 -s --cors -c-1', url: 'http://localhost:4203', reuseExistingServer: false, timeout: 60000, cwd: workspaceRoot },
      ]
    : {
        command: 'npx nx run host-shell:serve',
        url: 'http://localhost:4200',
        reuseExistingServer: true,
        timeout: 120000,
        cwd: workspaceRoot,
      },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
  ],
});
