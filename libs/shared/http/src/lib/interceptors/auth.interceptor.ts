/**
 * Auth Interceptor
 *
 * HTTP interceptor that:
 * - Adds JWT token to Authorization header automatically
 * - Adds X-Correlation-Id header for request tracing
 * - Handles 401 errors with automatic token refresh
 * - Redirects to login if refresh fails
 *
 * Based on ADR-002 (MVVM + Signals) and Task 08 (AuthStore)
 */

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, from } from 'rxjs';
import { AuthStore } from '@shared/state';

/**
 * Functional HTTP interceptor for authentication
 *
 * Automatically adds:
 * - Authorization: Bearer <token> header (if authenticated)
 * - X-Correlation-Id: <uuid> header (for tracing)
 *
 * Handles 401 errors:
 * - Attempts automatic token refresh
 * - Retries original request with new token
 * - Logs out and redirects to /login if refresh fails
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  // Skip auth header for public endpoints
  const isPublicEndpoint =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/refresh');

  // Clone request and add correlation ID
  let modifiedReq = req.clone({
    setHeaders: {
      'X-Correlation-Id': generateCorrelationId()
    }
  });

  // Add Authorization header if authenticated
  const accessToken = authStore.accessToken();
  if (accessToken && !isPublicEndpoint) {
    modifiedReq = modifiedReq.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }

  // Send request and handle errors
  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized
      if (error.status === 401 && !isPublicEndpoint) {
        // Try to refresh token
        return from(authStore.refreshAccessToken()).pipe(
          switchMap(newToken => {
            // Retry original request with new token
            const retryReq = modifiedReq.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });
            return next(retryReq);
          }),
          catchError(refreshError => {
            // Refresh failed, logout and redirect
            authStore.logout();
            router.navigate(['/login']);
            return throwError(() => refreshError);
          })
        );
      }

      // Handle other errors (pass through)
      return throwError(() => error);
    })
  );
};

/**
 * Generate a correlation ID for request tracing
 * Uses crypto.randomUUID() for better randomness than Math.random()
 */
function generateCorrelationId(): string {
  return crypto.randomUUID();
}
