/**
 * All Critical Flows — Smoke Suite
 *
 * Single sequential test that chains all 5 critical user flows to verify that
 * the application works end-to-end in one session.
 * Run with:  npm run e2e:smoke
 */
import { expect, test } from '../fixtures/test.fixture';

test.describe('Critical User Flows — Full Suite @smoke', () => {
  test('should complete all 5 critical flows in one session', async ({
    authenticatedPage,
    dashboardPage,
    tasksPage,
  }) => {
    // ── Flow 1: Dashboard ────────────────────────────────────────────────────
    await dashboardPage.goto();
    await expect(authenticatedPage).toHaveURL(/\/dashboard/);

    const statsCount = await dashboardPage.getStatsCardCount();
    expect(statsCount).toBeGreaterThanOrEqual(1);

    // ── Flow 2: Onboarding (shortcut — verify page loads) ────────────────────
    await authenticatedPage.goto('/profile/onboarding');
    const onboardingTitle = authenticatedPage.locator('h1#welcome-title');
    await expect(onboardingTitle).toBeVisible();

    // Skip back to dashboard
    await authenticatedPage.click('button:has-text("Pular")');
    await expect(authenticatedPage).toHaveURL(/\/dashboard/);

    // ── Flow 3: Tasks — verify kanban loads ──────────────────────────────────
    await tasksPage.goto();
    // Kanban renders either an empty state or the columns
    const kanbanOrEmpty = authenticatedPage.locator(
      '.kanban-board, .empty-state'
    );
    await expect(kanbanOrEmpty.first()).toBeVisible();

    // ── Flow 4: Pomodoro — verify timer ──────────────────────────────────────
    await authenticatedPage.goto('/tasks/pomodoro');
    const timerText = authenticatedPage.locator('.timer-text');
    await expect(timerText).toHaveText('25:00');

    // Quick start + reset check
    await authenticatedPage.click('.btn-start');
    await expect(timerText).not.toHaveText('25:00');
    await authenticatedPage.click('.btn-reset');
    await expect(timerText).toHaveText('25:00');

    // ── Flow 5: Preferences page renders ─────────────────────────────────────
    await authenticatedPage.goto('/dashboard/preferences');
    await expect(
      authenticatedPage.locator('.preferences-page')
    ).toBeVisible();
    await expect(authenticatedPage.locator('h1')).toContainText(
      'Painel Cognitivo'
    );
  });
});
