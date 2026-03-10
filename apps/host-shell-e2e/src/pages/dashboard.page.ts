import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly greeting: Locator;
  readonly statsCards: Locator;
  readonly preferencesPanel: Locator;

  constructor(page: Page) {
    this.page = page;
    this.greeting = page.locator('[data-testid="greeting"]');
    this.statsCards = page.locator('.stats-card');
    this.preferencesPanel = page.locator('.preferences-panel');
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

  async changeUiDensity(density: 'simple' | 'medium' | 'full') {
    await this.page.click(`[data-density="${density}"]`);
    await this.page.waitForResponse(/\/api\/v1\/preferences/);
  }

  async toggleFocusMode() {
    await this.page.click('[data-testid="focus-mode-toggle"]');
    await this.page.waitForResponse(/\/api\/v1\/preferences/);
  }
}
