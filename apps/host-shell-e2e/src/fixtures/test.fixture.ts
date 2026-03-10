import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { TasksPage } from '../pages/tasks.page';
import { AuthHelper } from '../helpers/auth.helper';
import { WaitHelper } from '../helpers/wait.helper';

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

    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    await use(page);

    await authHelper.clearAuth();
  },
});

export { expect } from '@playwright/test';
