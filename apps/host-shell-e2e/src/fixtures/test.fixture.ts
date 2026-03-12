import { test as base, Page } from '@playwright/test';
import { AuthHelper } from '../helpers/auth.helper';
import { WaitHelper } from '../helpers/wait.helper';
import { DashboardPage } from '../pages/dashboard.page';
import { LoginPage } from '../pages/login.page';
import { TasksPage } from '../pages/tasks.page';

type TestFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  tasksPage: TasksPage;
  authHelper: AuthHelper;
  waitHelper: WaitHelper;
  /** Page already authenticated via localStorage injection (no form fill). */
  authenticatedPage: Page;
};

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  tasksPage: async ({ page }, use) => {
    await use(new TasksPage(page));
  },

  authHelper: async ({ page }, use) => {
    await use(new AuthHelper(page));
  },

  waitHelper: async ({ page }, use) => {
    await use(new WaitHelper(page));
  },

  /**
   * Fixture that:
   * 1. Stubs all API calls (avoids 401 auto-logout)
   * 2. Injects auth token into localStorage
   * 3. Navigates to /dashboard and waits for it to be ready
   * 4. After test: clears auth
   */
  authenticatedPage: async ({ page }, use) => {
    const waitHelper = new WaitHelper(page);
    const authHelper = new AuthHelper(page);

    // Stub API before any navigation
    await waitHelper.mockAllApiCalls();

    // Prime localStorage (must navigate first to get the origin)
    await page.goto('/login');
    await authHelper.injectAuth();

    // Navigate to dashboard and wait for MFEs to fully load via Module Federation
    await page.goto('/dashboard');
    // 'networkidle' ensures remoteEntry.js + MFE chunks have been fetched and Angular rendered
    await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {
      // Ignore if networkidle times out (e.g. background polling) — assertions handle the rest
    });

    await use(page);

    await authHelper.clearAuth();
  },
});

export { expect } from '@playwright/test';
