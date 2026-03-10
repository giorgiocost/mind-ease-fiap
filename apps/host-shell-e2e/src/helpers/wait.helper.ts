import { Page } from '@playwright/test';

export class WaitHelper {
  constructor(private readonly page: Page) {}

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async waitForApiCall(urlPattern: string | RegExp): Promise<void> {
    await this.page.waitForResponse((response) => {
      const matches =
        typeof urlPattern === 'string'
          ? response.url().includes(urlPattern)
          : urlPattern.test(response.url());
      return matches && response.status() === 200;
    });
  }

  async waitForElement(selector: string, timeout = 5000): Promise<void> {
    await this.page.waitForSelector(selector, { timeout });
  }

  async waitForElementToDisappear(
    selector: string,
    timeout = 5000
  ): Promise<void> {
    await this.page.waitForSelector(selector, {
      state: 'detached',
      timeout,
    });
  }

  async waitForText(text: string, timeout = 5000): Promise<void> {
    await this.page.waitForSelector(`text=${text}`, { timeout });
  }

  /** Routes all API calls to a 200 stub to avoid backend dependency. */
  async mockAllApiCalls(
    body: unknown = { data: [], message: 'mocked' }
  ): Promise<void> {
    await this.page.context().route('**/api/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      })
    );
  }
}
