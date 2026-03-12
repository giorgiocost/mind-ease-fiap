import { expect, test, Page } from '@playwright/test';

const MOCK_JWT = () => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({ sub: '1', exp: Math.floor(Date.now() / 1000) + 86400 })
  );
  return `${header}.${payload}.mocksignature`;
};

const AUTH_STATE = {
  user: {
    id: '1',
    name: 'Test User',
    email: 'test@mindease.com',
    createdAt: '2025-01-01',
  },
  accessToken: MOCK_JWT(),
  refreshToken: MOCK_JWT(),
};

async function seedAuth(page: Page) {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate((authState) => {
    localStorage.setItem('mindease_auth', JSON.stringify(authState));
  }, AUTH_STATE);
}

test.beforeEach(async ({ page, context }) => {
  // Mock API to prevent 401 errors triggering auto-logout
  await context.route('**/api/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [], message: 'mocked' }),
    })
  );

  // Seed auth before the application bootstraps to avoid CI-only redirect races.
  await context.addInitScript((token) => {
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

  await seedAuth(page);
});

async function expectRouteToRender(
  page: Page,
  path: string,
  stableSelector: string
) {
  await page.goto(path, { waitUntil: 'domcontentloaded' });

  if (page.url().includes('/login')) {
    await seedAuth(page);
    await page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  await expect(page).toHaveURL(new RegExp(path.replace('/', '\\/')));
  await page.waitForLoadState('networkidle').catch(() => undefined);
  await expect(page.locator(stableSelector)).toBeVisible({ timeout: 20000 });
}

test('mfe-dashboard renders dashboard page', async ({ page }) => {
  await expectRouteToRender(page, '/dashboard', '.dashboard');
});

test('mfe-dashboard renders preferences page', async ({ page }) => {
  await expectRouteToRender(page, '/dashboard/preferences', '.preferences-page');
});

test('mfe-tasks renders tasks page', async ({ page }) => {
  await expectRouteToRender(page, '/tasks', '.tasks-container');
});

test('mfe-tasks renders pomodoro page', async ({ page }) => {
  await expectRouteToRender(page, '/tasks/pomodoro', '.pomodoro-container');
});

test('mfe-profile renders profile settings page', async ({ page }) => {
  await expectRouteToRender(page, '/profile', '.profile-settings');
});

test('mfe-profile renders onboarding page', async ({ page }) => {
  await expectRouteToRender(page, '/profile/onboarding', '.onboarding-container');
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

  await expectRouteToRender(page, '/dashboard', '.dashboard');

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

  await expectRouteToRender(page, '/profile', '.profile-settings');

  expect(errors).toHaveLength(0);
});
