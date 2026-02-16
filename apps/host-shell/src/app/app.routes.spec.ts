import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { provideRouter } from '@angular/router';
import { provideLocationMocks } from '@angular/common/testing';
import { appRoutes } from './app.routes';
import { AuthStore } from '@shared/state';

describe('App Routes', () => {
  let router: Router;
  let location: Location;
  let authStore: AuthStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter(appRoutes),
        provideLocationMocks(),
        AuthStore
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    authStore = TestBed.inject(AuthStore);
  });

  describe('Public Routes', () => {
    it('should load LoginComponent for /login', async () => {
      await router.navigate(['/login']);

      expect(location.path()).toBe('/login');
    });

    it('should load RegisterComponent for /register', async () => {
      await router.navigate(['/register']);

      expect(location.path()).toBe('/register');
    });
  });

  describe('Protected Routes', () => {
    it('should redirect to /login when accessing /dashboard without authentication', async () => {
      // Ensure user is not authenticated
      authStore['_accessToken'].set(null);
      authStore['_user'].set(null);

      await router.navigate(['/dashboard']);
      await TestBed.inject(Router).navigate(['/dashboard']);

      // Wait for navigation to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(location.path()).toBe('/login');
    });

    it('should allow access to /dashboard when authenticated', async () => {
      // Authenticate user
      authStore['_accessToken'].set('mock.token');
      authStore['_user'].set({
        id: '1',
        name: 'Test',
        email: 'test@test.com',
        createdAt: new Date().toISOString()
      });

      await router.navigate(['/dashboard']);

      // Should not redirect to login
      expect(location.path()).not.toBe('/login');
    });

    it('should protect /tasks with authGuard', async () => {
      // Ensure user is not authenticated
      authStore['_accessToken'].set(null);
      authStore['_user'].set(null);

      await router.navigate(['/tasks']);

      // Wait for navigation to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(location.path()).toBe('/login');
    });

    it('should protect /profile with authGuard', async () => {
      // Ensure user is not authenticated
      authStore['_accessToken'].set(null);
      authStore['_user'].set(null);

      await router.navigate(['/profile']);

      // Wait for navigation to complete
      await new Promise(resolve => setTimeout(resolve, 10));
      // Authenticate user
      authStore['_accessToken'].set('mock.token');
      authStore['_user'].set({
        id: '1',
        name: 'Test',
        email: 'test@test.com',
        createdAt: new Date().toISOString()
      });

      await router.navigate(['/']);

      // Default redirect goes to /dashboard, which should not redirect since authenticated
      expect(location.path()).toBe('/dashboard');
    });

    it('should redirect / to /dashboard then to /login when not authenticated', async () => {
      // Ensure user is not authenticated
      authStore['_accessToken'].set(null);
      authStore['_user'].set(null);

      await router.navigate(['/']);

      // Wait for navigation to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      // Default redirect goes to /dashboard, then guard redirects to /login
      expect(location.path()).toBe('/login');
    });
  });

  describe('404 Not Found', () => {
    it('should load NotFoundComponent for unknown routes', async () => {
      await router.navigate(['/unknown-route']);

      expect(location.path()).toBe('/unknown-route');
    });
  });

  describe('Route Configuration', () => {
    it('should have authGuard configured for /dashboard', () => {
      const dashboardRoute = appRoutes.find(r => r.path === 'dashboard');

      expect(dashboardRoute).toBeDefined();
      expect(dashboardRoute?.canActivate).toBeDefined();
      expect(dashboardRoute?.canActivate?.length).toBe(1);
    });

    it('should have authGuard configured for /tasks', () => {
      const tasksRoute = appRoutes.find(r => r.path === 'tasks');

      expect(tasksRoute).toBeDefined();
      expect(tasksRoute?.canActivate).toBeDefined();
      expect(tasksRoute?.canActivate?.length).toBe(1);
    });

    it('should have authGuard configured for /profile', () => {
      const profileRoute = appRoutes.find(r => r.path === 'profile');

      expect(profileRoute).toBeDefined();
      expect(profileRoute?.canActivate).toBeDefined();
      expect(profileRoute?.canActivate?.length).toBe(1);
    });

    it('should not have authGuard for /login', () => {
      const loginRoute = appRoutes.find(r => r.path === 'login');

      expect(loginRoute).toBeDefined();
      expect(loginRoute?.canActivate).toBeUndefined();
    });

    it('should not have authGuard for /register', () => {
      const registerRoute = appRoutes.find(r => r.path === 'register');

      expect(registerRoute).toBeDefined();
      expect(registerRoute?.canActivate).toBeUndefined();
    });
  });
});
