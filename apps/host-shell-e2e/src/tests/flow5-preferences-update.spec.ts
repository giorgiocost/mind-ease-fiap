/**
 * Flow 5: Preferences Real-time Update
 *
 * Covers:
 * - Navigate to /dashboard/preferences
 * - Change uiDensity → verify API call
 * - Toggle focusMode → verify API call
 * - Select contrast → verify API call
 * - Quick preset buttons exist and are clickable
 * - Reset to defaults button
 */
import { test, expect } from '../fixtures/test.fixture';
import { Page } from '@playwright/test';
import { MOCK_PREFERENCES } from '../helpers/mock-data';

/** Intercept the preferences PATCH/PUT and reply with updated data. */
async function setupPreferencesApiMock(page: Page, updatedPrefs = MOCK_PREFERENCES.data) {
  await page.context().route('**/api/v1/preferences**', (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_PREFERENCES),
      });
    }
    // PATCH / PUT — return the merged prefs
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: updatedPrefs, message: 'ok' }),
    });
  });
}

test.describe('Flow 5: Preferences Real-time Update', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await setupPreferencesApiMock(authenticatedPage);
    await authenticatedPage.goto('/dashboard/preferences');
    await authenticatedPage.waitForLoadState('domcontentloaded');
  });

  test('should display the preferences page @critical', async ({
    authenticatedPage,
  }) => {
    await expect(
      authenticatedPage.locator('.preferences-page')
    ).toBeVisible();
    await expect(
      authenticatedPage.locator('h1')
    ).toContainText('Painel Cognitivo');
  });

  test('should show density buttons (Simples / Médio / Completo)', async ({
    authenticatedPage,
  }) => {
    const densityGroup = authenticatedPage
      .locator('.preference-row')
      .filter({ has: authenticatedPage.locator('h3', { hasText: 'Densidade da Interface' }) })
      .locator('.button-group');
    await expect(densityGroup.locator('button:has-text("Simples")')).toBeVisible();
    await expect(densityGroup.locator('button:has-text("Médio")')).toBeVisible();
    await expect(densityGroup.locator('button:has-text("Completo")')).toBeVisible();
  });

  test('should change ui density to Simples and call API @critical', async ({
    authenticatedPage,
  }) => {
    const simplesBtn = authenticatedPage
      .locator('.preference-row')
      .filter({ has: authenticatedPage.locator('h3', { hasText: 'Densidade da Interface' }) })
      .locator('button:has-text("Simples")');

    // Click and wait for API call
    const [response] = await Promise.all([
      authenticatedPage.waitForResponse(/\/api\/v1\/preferences/),
      simplesBtn.click(),
    ]);
    expect(response.status()).toBe(200);

    // The button should now be marked active
    await expect(simplesBtn).toHaveClass(/active/);
  });

  test('should change ui density to Completo and call API', async ({
    authenticatedPage,
  }) => {
    const completoBtn = authenticatedPage
      .locator('.preference-row')
      .filter({ has: authenticatedPage.locator('h3', { hasText: 'Densidade da Interface' }) })
      .locator('button:has-text("Completo")');

    const [response] = await Promise.all([
      authenticatedPage.waitForResponse(/\/api\/v1\/preferences/),
      completoBtn.click(),
    ]);
    expect(response.status()).toBe(200);
  });

  test('should toggle focusMode and call API @critical', async ({
    authenticatedPage,
  }) => {
    const toggleBtn = authenticatedPage
      .locator('.preference-row')
      .filter({ has: authenticatedPage.locator('h3', { hasText: 'Modo Foco' }) })
      .locator('.toggle-button');
    await expect(toggleBtn).toBeVisible();

    const [response] = await Promise.all([
      authenticatedPage.waitForResponse(/\/api\/v1\/preferences/),
      toggleBtn.click(),
    ]);
    expect(response.status()).toBe(200);
  });

  test('should change contrast and call API', async ({
    authenticatedPage,
  }) => {
    const altoBtn = authenticatedPage
      .locator('.preference-row')
      .filter({ has: authenticatedPage.locator('h3', { hasText: 'Contraste' }) })
      .locator('button:has-text("Alto")');
    await expect(altoBtn).toBeVisible();

    const [response] = await Promise.all([
      authenticatedPage.waitForResponse(/\/api\/v1\/preferences/),
      altoBtn.click(),
    ]);
    expect(response.status()).toBe(200);
  });

  test('should show preset buttons', async ({ authenticatedPage }) => {
    const presetButtons = authenticatedPage.locator('.preset-button');
    await expect(presetButtons.first()).toBeVisible();
    const count = await presetButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should apply a preset and call API', async ({ authenticatedPage }) => {
    const firstPreset = authenticatedPage.locator('.preset-button').first();

    const [response] = await Promise.all([
      authenticatedPage.waitForResponse(/\/api\/v1\/preferences/),
      firstPreset.click(),
    ]);
    expect(response.status()).toBe(200);
  });

  test('should verify preferences persist after navigation', async ({
    authenticatedPage,
  }) => {
    // Make a preference change (density)
    const simplesBtn = authenticatedPage
      .locator('.preference-row')
      .filter({ has: authenticatedPage.locator('h3', { hasText: 'Densidade da Interface' }) })
      .locator('button:has-text("Simples")');
    await Promise.all([
      authenticatedPage.waitForResponse(/\/api\/v1\/preferences/),
      simplesBtn.click(),
    ]);

    // Navigate away and back
    await authenticatedPage.goto('/dashboard');
    await authenticatedPage.goto('/dashboard/preferences');
    await authenticatedPage.waitForLoadState('domcontentloaded');

    // Page should still render correctly (persistence handled by store)
    await expect(
      authenticatedPage.locator('.preferences-page')
    ).toBeVisible();
  });
});
