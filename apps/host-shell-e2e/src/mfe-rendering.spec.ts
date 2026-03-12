import { expect, test } from '@playwright/test';

const MOCK_JWT = () => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({ sub: '1', exp: Math.floor(Date.now() / 1000) + 86400 })
  );
  return `${header}.${payload}.mocksignature`;
};

test.beforeEach(async ({ page, context }) => {
  // Mock API to prevent 401 errors triggering auto-logout
  await context.route('**/api/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [], message: 'mocked' }),
    })
  );

  // Inject auth before navigating
  await page.goto('/login');
  await page.evaluate((token) => {
    localStorage.setItem(
      'mindease_auth',
      JSON.stringify({
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@mindease.com',
          createdAt: '2025-01-01',
        },
        accessToken: token,
        refreshToken: token,
      })
    );
  }, MOCK_JWT());
});

test('mfe-dashboard renders dashboard page', async ({ page }) => {
  await page.goto('/dashboard', { waitUntil: 'networkidle' });
  await expect(page.locator('app-dashboard')).toBeVisible();
});

test('mfe-dashboard renders preferences page', async ({ page }) => {
  await page.goto('/dashboard/preferences', { waitUntil: 'networkidle' });
  await expect(page.locator('app-preferences')).toBeVisible();
});

test('mfe-tasks renders tasks page', async ({ page }) => {
  await page.goto('/tasks', { waitUntil: 'networkidle' });
  await expect(page.locator('app-tasks')).toBeVisible();
});

test('mfe-tasks renders pomodoro page', async ({ page }) => {
  await page.goto('/tasks/pomodoro', { waitUntil: 'networkidle' });
  await expect(page.locator('app-pomodoro')).toBeVisible();
});

test('mfe-profile renders profile settings page', async ({ page }) => {
  await page.goto('/profile', { waitUntil: 'networkidle' });
  await expect(page.locator('app-profile-settings')).toBeVisible();
});

test('mfe-profile renders onboarding page', async ({ page }) => {
  await page.goto('/profile/onboarding', { waitUntil: 'networkidle' });
  await expect(page.locator('app-onboarding')).toBeVisible();
});

test('no critical Angular errors on dashboard', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (
      msg.type() === 'error' &&
      (msg.text().includes('NG0') || msg.text().includes('ERROR'))
    ) {
      errors.push(msg.text());
    }
  });

  await page.goto('/dashboard');
  await page.waitForTimeout(2000);

  expect(errors).toHaveLength(0);
});

test('no critical Angular errors on profile', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (
      msg.type() === 'error' &&
      (msg.text().includes('NG0') || msg.text().includes('ERROR'))
    ) {
      errors.push(msg.text());
    }
  });

  await page.goto('/profile');
  await page.waitForTimeout(2000);

  expect(errors).toHaveLength(0);
});
