import { Page } from '@playwright/test';

/** localStorage key used by MindEase AuthStore */
const AUTH_STORAGE_KEY = 'mindease_auth';

/** Creates a mock JWT valid for 24h */
function mockJwt(): string {
  const header = Buffer.from(
    JSON.stringify({ alg: 'HS256', typ: 'JWT' })
  ).toString('base64');
  const payload = Buffer.from(
    JSON.stringify({ sub: '1', exp: Math.floor(Date.now() / 1000) + 86400 })
  ).toString('base64');
  return `${header}.${payload}.mocksignature`;
}

export class AuthHelper {
  constructor(private readonly page: Page) {}

  /**
   * Injects auth state directly into localStorage — avoids depending on a
   * real backend or the login form during E2E setup.
   */
  async injectAuth(
    user = { id: '1', name: 'Test User', email: 'test@mindease.com' }
  ) {
    const token = mockJwt();
    await this.page.evaluate(
      ({ key, state }) => localStorage.setItem(key, JSON.stringify(state)),
      {
        key: AUTH_STORAGE_KEY,
        state: { user, accessToken: token, refreshToken: token },
      }
    );
  }

  /**
   * Navigates to /login, fills the form and waits for /dashboard.
   * Use only when testing the login flow itself — prefer injectAuth elsewhere.
   */
  async login(email: string, password: string) {
    await this.page.goto('/login');
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button:has-text("Entrar")');
    await this.page.waitForURL('/dashboard');
  }

  async loginAsTestUser() {
    await this.login('test@mindease.com', 'Test123456!');
  }

  async logout() {
    // .user-button is the avatar/name button in HeaderComponent
    await this.page.click('button.user-button');
    // The danger dropdown item is the "Sair" button
    await this.page.click('button.dropdown-item.danger');
    await this.page.waitForURL('/login');
  }

  async isAuthenticated(): Promise<boolean> {
    const value = await this.page.evaluate(
      (key) => localStorage.getItem(key),
      AUTH_STORAGE_KEY
    );
    if (!value) return false;
    try {
      const state = JSON.parse(value);
      return !!state?.accessToken;
    } catch {
      return false;
    }
  }

  async clearAuth() {
    await this.page.evaluate(
      (key) => localStorage.removeItem(key),
      AUTH_STORAGE_KEY
    );
  }
}
