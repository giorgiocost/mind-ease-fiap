/**
 * Auth Guard Tests
 */

import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { authGuard, getReturnUrl, clearReturnUrl } from './auth.guard';
import { AuthStore } from '@shared/state';

describe('authGuard', () => {
  let authStore: AuthStore;
  let routerSpy: Partial<Router>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    routerSpy = {
      navigate: jest.fn()
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthStore, { provide: Router, useValue: routerSpy }]
    });

    authStore = TestBed.inject(AuthStore);
    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = { url: '/dashboard' } as RouterStateSnapshot;
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe('Authentication checks', () => {
    it('should allow access when user is authenticated', () => {
      // Simulate authenticated state
      authStore['_accessToken'].set('mock.jwt.token');
      authStore['_user'].set({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: '2026-02-16T00:00:00Z'
      });

      const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      expect(result).toBe(true);
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should block access when user is not authenticated', () => {
      // Ensure not authenticated
      authStore['_accessToken'].set(null);
      authStore['_user'].set(null);

      const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      expect(result).toBe(false);
    });

    it('should redirect to /login when not authenticated', () => {
      authStore['_accessToken'].set(null);
      authStore['_user'].set(null);

      TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('Return URL management', () => {
    it('should save intended URL when redirecting to login', () => {
      authStore['_accessToken'].set(null);
      authStore['_user'].set(null);
      mockState.url = '/dashboard/tasks/123';

      TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      expect(getReturnUrl()).toBe('/dashboard/tasks/123');
    });

    it('should save different URLs correctly', () => {
      authStore['_accessToken'].set(null);
      authStore['_user'].set(null);

      // First attempt
      mockState.url = '/profile/settings';
      TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));
      expect(getReturnUrl()).toBe('/profile/settings');

      // Second attempt (should override)
      mockState.url = '/tasks';
      TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));
      expect(getReturnUrl()).toBe('/tasks');
    });

    it('should return null when no return URL is saved', () => {
      expect(getReturnUrl()).toBeNull();
    });

    it('should retrieve saved return URL', () => {
      sessionStorage.setItem('mindease_return_url', '/dashboard/tasks');
      expect(getReturnUrl()).toBe('/dashboard/tasks');
    });

    it('should clear return URL from sessionStorage', () => {
      sessionStorage.setItem('mindease_return_url', '/dashboard');
      expect(getReturnUrl()).toBe('/dashboard');

      clearReturnUrl();

      expect(getReturnUrl()).toBeNull();
      expect(sessionStorage.getItem('mindease_return_url')).toBeNull();
    });

    it('should handle clearing non-existent return URL', () => {
      expect(getReturnUrl()).toBeNull();
      clearReturnUrl(); // Should not throw
      expect(getReturnUrl()).toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('should save root URL correctly', () => {
      authStore['_accessToken'].set(null);
      authStore['_user'].set(null);
      mockState.url = '/';

      TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      expect(getReturnUrl()).toBe('/');
    });

    it('should save URL with query params', () => {
      authStore['_accessToken'].set(null);
      authStore['_user'].set(null);
      mockState.url = '/dashboard?tab=overview&filter=active';

      TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      expect(getReturnUrl()).toBe('/dashboard?tab=overview&filter=active');
    });

    it('should save URL with fragment', () => {
      authStore['_accessToken'].set(null);
      authStore['_user'].set(null);
      mockState.url = '/profile#settings';

      TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      expect(getReturnUrl()).toBe('/profile#settings');
    });

    it('should allow navigation immediately when already authenticated', () => {
      authStore['_accessToken'].set('valid.token');
      authStore['_user'].set({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: '2026-02-16T00:00:00Z'
      });

      const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      expect(result).toBe(true);
      expect(sessionStorage.getItem('mindease_return_url')).toBeNull();
    });
  });

  describe('Multiple guard executions', () => {
    it('should handle multiple guard checks correctly', () => {
      // Not authenticated - should block
      authStore['_accessToken'].set(null);
      authStore['_user'].set(null);
      mockState.url = '/dashboard';

      let result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));
      expect(result).toBe(false);
      expect(getReturnUrl()).toBe('/dashboard');

      // Now authenticate
      authStore['_accessToken'].set('new.token');
      authStore['_user'].set({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: '2026-02-16T00:00:00Z'
      });

      // Should allow now
      result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));
      expect(result).toBe(true);
    });
  });
});
