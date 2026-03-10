/**
 * Flow 4: Pomodoro Timer
 *
 * Covers:
 * - Timer displays 25:00 on load
 * - Start button changes timer display
 * - Pause freezes the countdown
 * - Reset returns to 25:00
 * - Mode selector (work / short-break / long-break)
 * - Sessions stats visible
 */
import { test, expect } from '../fixtures/test.fixture';

test.describe('Flow 4: Pomodoro Timer', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/tasks/pomodoro');
    await authenticatedPage.waitForLoadState('domcontentloaded');
  });

  // ── Initial state ──────────────────────────────────────────────────────────

  test('should display 25:00 on initial load @critical', async ({
    authenticatedPage,
  }) => {
    const timerText = authenticatedPage.locator('.timer-text');
    await expect(timerText).toBeVisible();
    await expect(timerText).toHaveText('25:00');
  });

  test('should show the 3 mode buttons', async ({ authenticatedPage }) => {
    const modeButtons = authenticatedPage.locator('.mode-button');
    await expect(modeButtons).toHaveCount(3);
    await expect(modeButtons.nth(0)).toContainText('Trabalho');
    await expect(modeButtons.nth(1)).toContainText('Pausa Curta');
    await expect(modeButtons.nth(2)).toContainText('Pausa Longa');
  });

  test('should show the stats area', async ({ authenticatedPage }) => {
    const statValues = authenticatedPage.locator('.stat-value');
    await expect(statValues).toHaveCount(3);
  });

  // ── Start ──────────────────────────────────────────────────────────────────

  test('should start timer and update display @critical', async ({
    authenticatedPage,
  }) => {
    const timerText = authenticatedPage.locator('.timer-text');
    const startBtn = authenticatedPage.locator('.btn-start');

    await expect(startBtn).toBeVisible();
    await startBtn.click();

    // Wait 1.5s for Angular setInterval to tick at least once
    await authenticatedPage.waitForTimeout(1500);

    // Timer should no longer read 25:00
    const currentTime = await timerText.textContent();
    expect(currentTime).not.toBe('25:00');

    // Pause to avoid interfering with subsequent tests
    await authenticatedPage.click('.btn-pause');
  });

  test('should show Pausar button while running', async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.click('.btn-start');

    const pauseBtn = authenticatedPage.locator('.btn-pause');
    await expect(pauseBtn).toBeVisible();

    await pauseBtn.click(); // clean up
  });

  // ── Pause ──────────────────────────────────────────────────────────────────

  test('should freeze timer when paused @critical', async ({
    authenticatedPage,
  }) => {
    const timerText = authenticatedPage.locator('.timer-text');

    // Start then pause
    await authenticatedPage.click('.btn-start');
    await authenticatedPage.waitForTimeout(1100);
    await authenticatedPage.click('.btn-pause');

    const timeAfterPause = await timerText.textContent();

    // Wait another 1.5s — timer must not advance while paused
    await authenticatedPage.waitForTimeout(1500);
    const timeStillFrozen = await timerText.textContent();

    expect(timeAfterPause).toBe(timeStillFrozen);
  });

  // ── Reset ──────────────────────────────────────────────────────────────────

  test('should reset timer to 25:00 @critical', async ({
    authenticatedPage,
  }) => {
    const timerText = authenticatedPage.locator('.timer-text');

    // Start → advance → reset
    await authenticatedPage.click('.btn-start');
    await authenticatedPage.waitForTimeout(1100);
    await authenticatedPage.click('.btn-reset');

    await expect(timerText).toHaveText('25:00');

    // After reset, start button must be visible again
    await expect(authenticatedPage.locator('.btn-start')).toBeVisible();
  });

  // ── Mode selector ──────────────────────────────────────────────────────────

  test('should switch to short-break mode (5:00)', async ({
    authenticatedPage,
  }) => {
    const timerText = authenticatedPage.locator('.timer-text');
    const modeButtons = authenticatedPage.locator('.mode-button');

    await modeButtons.nth(1).click(); // Pausa Curta

    await expect(timerText).toHaveText('05:00');
    await expect(modeButtons.nth(1)).toHaveClass(/active/);
  });

  test('should switch to long-break mode (15:00)', async ({
    authenticatedPage,
  }) => {
    const timerText = authenticatedPage.locator('.timer-text');
    await authenticatedPage.locator('.mode-button').nth(2).click(); // Pausa Longa

    await expect(timerText).toHaveText('15:00');
  });
});
