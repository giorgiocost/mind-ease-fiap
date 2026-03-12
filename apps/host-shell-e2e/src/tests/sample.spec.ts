import { test, expect } from '../fixtures/test.fixture';

// ─── Login Page ──────────────────────────────────────────────────────────────

test.describe('Login page', () => {
  test('should load with title containing MindEase', async ({
    page,
    loginPage,
  }) => {
    await loginPage.goto();

    await expect(page).toHaveTitle(/MindEase/i);
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('should show email and password inputs', async ({ loginPage }) => {
    await loginPage.goto();

    await expect(loginPage.emailInput).toBeEnabled();
    await expect(loginPage.passwordInput).toBeEnabled();
  });
});

// ─── Authenticated Dashboard ─────────────────────────────────────────────────

test.describe('Dashboard (authenticated)', () => {
  test('should render dashboard component', async ({
    authenticatedPage,
    dashboardPage,
  }) => {
    await dashboardPage.goto();

    await expect(
      authenticatedPage.locator('app-dashboard')
    ).toBeVisible();
  });

  test('should not have Angular critical errors on dashboard', async ({
    authenticatedPage,
  }) => {
    const errors: string[] = [];
    authenticatedPage.on('console', (msg) => {
      if (
        msg.type() === 'error' &&
        (msg.text().includes('NG0') || msg.text().includes('ERROR'))
      ) {
        errors.push(msg.text());
      }
    });

    await authenticatedPage.goto('/dashboard', { waitUntil: 'domcontentloaded' });

    expect(errors).toHaveLength(0);
  });
});

// ─── Authenticated Tasks ─────────────────────────────────────────────────────

test.describe('Tasks page (authenticated)', () => {
  test('should render tasks component', async ({
    authenticatedPage,
    tasksPage,
  }) => {
    await tasksPage.goto();

    await expect(authenticatedPage.locator('app-tasks')).toBeVisible();
  });

  test('should not have Angular critical errors on tasks', async ({
    authenticatedPage,
  }) => {
    const errors: string[] = [];
    authenticatedPage.on('console', (msg) => {
      if (
        msg.type() === 'error' &&
        (msg.text().includes('NG0') || msg.text().includes('ERROR'))
      ) {
        errors.push(msg.text());
      }
    });

    await authenticatedPage.goto('/tasks');
    await authenticatedPage.waitForLoadState('domcontentloaded');

    expect(errors).toHaveLength(0);
  });
});

// ─── Authenticated Profile ────────────────────────────────────────────────────

test.describe('Profile page (authenticated)', () => {
  test('should render profile settings component', async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto('/profile');

    await expect(
      authenticatedPage.locator('app-profile-settings')
    ).toBeVisible();
  });
});
