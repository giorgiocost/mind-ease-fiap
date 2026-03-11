/**
 * Flow 2: Register → Onboarding → Dashboard
 *
 * Covers:
 * - Registration form with name / email / password
 * - After register → navigates to /dashboard (actual app behavior)
 * - Onboarding flow: welcome → preferences → tour → finish → /dashboard
 * - Skip onboarding redirects to /dashboard
 */
import { test, expect } from '../fixtures/test.fixture';
import { Page } from '@playwright/test';
import { makeAuthResponse } from '../helpers/mock-data';

async function stubAllApis(page: Page, extraUser?: { id: string; name: string; email: string }) {
  const authData = makeAuthResponse(extraUser);

  // Register catch-all FIRST so it has lower priority (Playwright LIFO)
  await page.context().route('**/api/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: null, message: 'mocked' }),
    })
  );

  // Specific register route registered LAST → highest priority
  await page.context().route('**/api/v1/auth/register', (route) =>
    route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify(authData),
    })
  );
}

// ─── Tests ──────────────────────────────────────────────────────────────────

test.describe('Flow 2: Registration & Onboarding', () => {
  test('should complete registration form and reach dashboard', async ({ page }) => {
    await stubAllApis(page);

    await page.goto('/register');
    await expect(page.locator('h1')).toContainText('Registrar');

    // Fill registration fields
    await page.fill('input#name', 'Novo Usuário');
    await page.fill('input#email', `novo${Date.now()}@test.com`);
    await page.fill('input#password', 'Senha12345!');

    // Submit (button text is "Registrar" in the actual component)
    await page.click('ui-button[type="submit"]');

    // Register component navigates to /dashboard after successful registration
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should show validation errors for short name', async ({ page }) => {
    await stubAllApis(page);
    await page.goto('/register');

    // Enter a name that's too short (< 3 chars) and blur
    await page.fill('input#name', 'AB');
    await page.locator('input#name').press('Tab');

    // Angular ngModel with minlength should show validation error
    const error = page.locator('.form-error[role="alert"]').first();
    await expect(error).toBeVisible();
  });

  test('should complete full onboarding flow after auth injection', async ({
    authenticatedPage,
  }) => {
    // Navigate directly to onboarding (user is already authenticated)
    await authenticatedPage.goto('/profile/onboarding');

    // ── Step 1: Welcome ──────────────────────────────────
    const welcomeTitle = authenticatedPage.locator('h1#welcome-title');
    await expect(welcomeTitle).toContainText('Bem-vindo');

    // Click "Continuar →"
    await authenticatedPage.click('.btn-primary');

    // ── Step 2: Preferences ─────────────────────────────
    const prefsTitle = authenticatedPage.locator('h1#prefs-title');
    await expect(prefsTitle).toBeVisible();

    // Select "Médio" density
    await authenticatedPage
      .locator('.option-button')
      .filter({ hasText: 'Médio' })
      .click();

    // Proceed to next step
    await authenticatedPage.click('.btn-primary');

    // ── Step 3: Tour ─────────────────────────────────────
    const tourTitle = authenticatedPage.locator('h1#tour-title');
    await expect(tourTitle).toContainText('funcionalidades');

    // Verify tour cards exist
    const tourCards = authenticatedPage.locator('.tour-card');
    await expect(tourCards.first()).toBeVisible();

    // Click "Finalizar →" (last step button)
    await authenticatedPage.click('.btn-primary');

    // Onboarding finish navigates to /dashboard
    await expect(authenticatedPage).toHaveURL(/\/dashboard/);
  });

  test('should skip onboarding and redirect to dashboard', async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto('/profile/onboarding');

    // Click "Pular" button
    await authenticatedPage.click('button:has-text("Pular")');

    // Should redirect to dashboard
    await expect(authenticatedPage).toHaveURL(/\/dashboard/);
  });
});
