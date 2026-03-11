import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Unauthenticated users are redirected to /login
  await expect(page).toHaveURL(/\/login/);
  await expect(page.locator('h1')).toContainText('Login');
});
