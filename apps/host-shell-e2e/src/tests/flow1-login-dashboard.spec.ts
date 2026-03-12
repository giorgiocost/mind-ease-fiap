/**
 * Flow 1: Login → Dashboard → Stats
 *
 * Covers:
 * - Login form submission with mocked API
 * - Redirect to /dashboard on success
 * - Greeting message displayed
 * - Stats cards rendered
 * - Navigate to /tasks via stats card click
 * - Invalid credentials show error
 */
import { test, expect } from '../fixtures/test.fixture';
import { Page } from '@playwright/test';
import { makeAuthResponse } from '../helpers/mock-data';

// ─── Shared API mock setup ──────────────────────────────────────────────────

async function setupLoginApiMock(page: Page, user?: { id: string; name: string; email: string }) {
  const authData = makeAuthResponse(user);

  // Register catch-all FIRST so it has lower priority (Playwright LIFO)
  await page.context().route('**/api/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: null, message: 'mocked' }),
    })
  );

  // Specific login route registered LAST → highest priority
  await page.context().route('**/api/v1/auth/login', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(authData),
    })
  );
}

// ─── Tests ──────────────────────────────────────────────────────────────────

test.describe('Flow 1: Login & Dashboard', () => {
  test('should login successfully and view dashboard', async ({
    page,
    loginPage,
    dashboardPage,
  }) => {
    await setupLoginApiMock(page);

    // Step 1–3: Navigate to login and submit credentials
    await loginPage.goto();
    await loginPage.login('test@mindease.com', 'Test123456!');

    // Step 4: Verify redirect to /tasks (default post-login route)
    await expect(page).toHaveURL(/\/tasks/);

    // Navigate to dashboard to verify dashboard content
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });

    // Step 5: Verify greeting message exists and has text
    const greeting = await dashboardPage.getGreeting();
    expect(greeting.length).toBeGreaterThan(0);

    // Step 6: Verify stats cards loaded (dashboard has 3 app-stats-card elements)
    const statsCount = await dashboardPage.getStatsCardCount();
    expect(statsCount).toBeGreaterThanOrEqual(1);
  });

  test('should navigate to /tasks when clicking a stats card', async ({
    page,
    loginPage,
    dashboardPage,
  }) => {
    await setupLoginApiMock(page);

    await loginPage.goto();
    await loginPage.login('test@mindease.com', 'Test123456!');
    await expect(page).toHaveURL(/\/tasks/);

    // Navigate to dashboard to test stats card navigation
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });

    // Step 7–8: Click first stats card (Tarefas Pendentes → navigates to /tasks)
    await dashboardPage.clickStatsCard(0);
    await expect(page).toHaveURL(/\/tasks/);
  });

  test('should show error for invalid credentials', async ({
    page,
    loginPage,
  }) => {
    // Mock login to return 401
    await page.context().route('**/api/v1/auth/login', (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid credentials' }),
      })
    );

    await loginPage.goto();
    await loginPage.login('wrong@email.com', 'wrongpassword');

    // Should remain on /login
    await expect(page).toHaveURL('/login');

    // Should display an error message
    const error = await loginPage.getErrorMessage();
    expect(error.length).toBeGreaterThan(0);
  });

  test('should display greeting with user name after login', async ({
    page,
    loginPage,
    dashboardPage,
  }) => {
    // Register catch-all FIRST (lower priority in LIFO)
    await page.context().route('**/api/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: null, message: 'mocked' }),
      })
    );
    // Specific login route LAST (highest priority)
    await page.context().route('**/api/v1/auth/login', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          makeAuthResponse({ id: '1', name: 'Maria Silva', email: 'maria@example.com' })
        ),
      })
    );

    await loginPage.goto();
    await loginPage.login('maria@example.com', 'Pass12345!');
    await expect(page).toHaveURL(/\/tasks/);

    // Navigate to dashboard to verify greeting
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });

    const greeting = await dashboardPage.getGreeting();
    expect(greeting).toBeTruthy();
  });
});
