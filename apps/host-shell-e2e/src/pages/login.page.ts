import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly registerLink: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.loginButton = page.locator('button:has-text("Entrar")');
    this.registerLink = page.locator('a:has-text("Criar conta")');
    // Login component shows errors in .error div
    this.errorMessage = page.locator('.auth-card .error').first();
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async isLoginSuccessful(): Promise<boolean> {
    try {
      await this.page.waitForURL('/dashboard', { timeout: 5000 });
      return this.page.url().includes('/dashboard');
    } catch {
      return false;
    }
  }

  async getErrorMessage(): Promise<string> {
    return (await this.errorMessage.textContent()) ?? '';
  }

  async goToRegister() {
    await this.registerLink.click();
  }
}
