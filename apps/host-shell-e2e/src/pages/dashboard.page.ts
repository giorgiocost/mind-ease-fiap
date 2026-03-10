import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly greeting: Locator;
  readonly statsCards: Locator;
  readonly dashboard: Locator;

  constructor(page: Page) {
    this.page = page;
    // The greeting is rendered as <h1 class="greeting"> inside the dashboard component
    this.greeting = page.locator('.greeting');
    // Stats are <app-stats-card> elements inside .stats-grid
    this.statsCards = page.locator('app-stats-card');
    // The root dashboard div that carries data-ui-density
    this.dashboard = page.locator('.dashboard');
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  async getGreeting(): Promise<string> {
    return (await this.greeting.textContent()) ?? '';
  }

  async getStatsCardCount(): Promise<number> {
    return await this.statsCards.count();
  }

  async clickStatsCard(index: number) {
    await this.statsCards.nth(index).click();
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
