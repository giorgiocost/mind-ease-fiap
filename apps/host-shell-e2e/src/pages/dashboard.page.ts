import { expect, Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly greeting: Locator;
  readonly statsCards: Locator;
  readonly statsCardContent: Locator;
  readonly dashboard: Locator;

  constructor(page: Page) {
    this.page = page;
    // The greeting is rendered as <h1 class="greeting"> inside the dashboard component
    this.greeting = page.locator('.greeting');
    // Stats are <app-stats-card> elements inside .stats-grid
    this.statsCards = page.locator('app-stats-card');
    this.statsCardContent = page.locator('.stats-grid .stats-card');
    // The root dashboard div that carries data-ui-density
    this.dashboard = page.locator('.dashboard');
  }

  async goto() {
    await this.page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await this.waitUntilReady();
  }

  async waitUntilReady() {
    await expect(this.dashboard).toBeVisible({ timeout: 15000 });
    await expect(this.greeting).toBeVisible({ timeout: 15000 });
    await expect(this.statsCardContent.first()).toBeVisible({ timeout: 15000 });
  }

  async getGreeting(): Promise<string> {
    await this.waitUntilReady();
    return (await this.greeting.textContent()) ?? '';
  }

  async getStatsCardCount(): Promise<number> {
    await this.waitUntilReady();
    return await this.statsCards.count();
  }

  async clickStatsCard(index: number) {
    await this.waitUntilReady();
    await this.statsCards.nth(index).locator('ui-card').click();
  }

  /** Returns the value of data-ui-density on the .dashboard root element. */
  async getUiDensity(): Promise<string | null> {
    return this.dashboard.getAttribute('data-ui-density');
  }

  /**
   * Navigate to /dashboard/preferences and click the density button.
   * Waits for the preferences API call to complete.
   */
  async changeUiDensityViaPreferences(density: 'simple' | 'medium' | 'full') {
    await this.page.goto('/dashboard/preferences');
    const labelMap = { simple: 'Simples', medium: 'Médio', full: 'Completo' };
    await this.page.click(`button:has-text("${labelMap[density]}")`);
    await this.page.waitForResponse(/\/api\/v1\/preferences/);
  }

  /**
   * Toggle focus mode via the preferences page .toggle-button.
   */
  async toggleFocusMode() {
    await this.page.goto('/dashboard/preferences');
    await this.page.click('.toggle-button');
    await this.page.waitForResponse(/\/api\/v1\/preferences/);
  }
}
