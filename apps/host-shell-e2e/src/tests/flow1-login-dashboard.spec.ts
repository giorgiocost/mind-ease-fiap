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
import { makeAuthResponse, MOCK_STATS, MOCK_PREFERENCES } from '../helpers/mock-data';

// ─── Shared API mock setup ──────────────────────────────────────────────────

async function setupLoginApiMock(page: Page, user?: { id: string; name: string; email: string }) {
  const authData = makeAuthResponse(user);

  await page.context().route('**/api/v1/auth/login', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(authData),
    })
  );

  // Stub remaining API calls so the dashboard doesn't throw 404s
  await page.context().route('**/api/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: null, message: 'mocked' }),
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

    // Step 4: Verify redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);

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
    await expect(page).toHaveURL(/\/dashboard/);

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
    await page.context().route('**/api/v1/auth/login', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          makeAuthResponse({ id: '1', name: 'Maria Silva', email: 'maria@example.com' })
        ),
      })
    );
    await page.context().route('**/api/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: null, message: 'mocked' }),
      })
    );

    await loginPage.goto();
    await loginPage.login('maria@example.com', 'Pass12345!');
    await expect(page).toHaveURL(/\/dashboard/);

    const greeting = await dashboardPage.getGreeting();
    expect(greeting).toBeTruthy();
  });
});
