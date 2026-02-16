/**
 * Auth Guard
 *
 * Route guard that protects authenticated routes.
 * Features:
 * - Checks if user is authenticated via AuthStore
 * - Redirects to /login if not authenticated
 * - Saves intended URL for post-login redirect
 * - Helper functions for return URL management
 *
 * Based on ADR-002 (MVVM + Signals) and Task 08 (AuthStore)
 */

import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { AuthStore } from '@shared/state';

const RETURN_URL_KEY = 'mindease_return_url';

/**
 * Functional route guard for authentication
 *
 * Usage:
 * ```typescript
 * const routes: Routes = [
 *   {
 *     path: 'dashboard',
 *     component: DashboardComponent,
 *     canActivate: [authGuard]
 *   }
 * ];
 * ```
 *
 * Flow:
 * 1. Check if user is authenticated via AuthStore.isAuthenticated()
 * 2. If authenticated → allow navigation (return true)
 * 3. If not authenticated:
 *    - Save intended URL to sessionStorage
 *    - Redirect to /login
 *    - Return false (block navigation)
 *
 * After successful login, use getReturnUrl() to retrieve and redirect
 * to the originally intended URL.
 */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  // Check if user is authenticated
  if (authStore.isAuthenticated()) {
    return true;
  }

  // Save intended URL for post-login redirect
  sessionStorage.setItem(RETURN_URL_KEY, state.url);

  // Redirect to login
  router.navigate(['/login']);
  return false;
};

/**
 * Get the return URL saved before redirecting to login
 *
 * Usage:
 * ```typescript
 * async handleLogin() {
 *   await this.authStore.login(credentials);
 *   const returnUrl = getReturnUrl() || '/dashboard';
 *   clearReturnUrl();
 *   this.router.navigateByUrl(returnUrl);
 * }
 * ```
 *
 * @returns The saved URL or null if not set
 */
export function getReturnUrl(): string | null {
  return sessionStorage.getItem(RETURN_URL_KEY);
}

/**
 * Clear the saved return URL from sessionStorage
 *
 * Should be called after successful redirect to prevent
 * using stale URLs on subsequent logins.
 */
export function clearReturnUrl(): void {
  sessionStorage.removeItem(RETURN_URL_KEY);
}
