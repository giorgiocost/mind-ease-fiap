// =============================================================================
// MindEase — Auth Store Unit Tests
// =============================================================================
// Comprehensive tests for AuthStore functionality

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthStore } from './auth.store';
import { AuthResponse, User } from './auth.models';

describe('AuthStore', () => {
  let store: AuthStore;
  let httpMock: HttpTestingController;
  let routerSpy: Partial<Router>;

  const mockUser: User = {
    id: '123',
    name: 'João Silva',
    email: 'joao@example.com',
    createdAt: '2024-01-01T00:00:00Z'
  };

  const mockAuthResponse: AuthResponse = {
    accessToken: 'mock.access.token',
    refreshToken: 'mock.refresh.token',
    user: mockUser
  };

  beforeEach(() => {
    routerSpy = {
      navigate: jest.fn()
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthStore,
        { provide: Router, useValue: routerSpy }
      ]
    });

    store = TestBed.inject(AuthStore);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should create', () => {
    expect(store).toBeTruthy();
  });

  describe('Initial state', () => {
    it('should have null user', () => {
      expect(store.user()).toBeNull();
    });

    it('should not be authenticated', () => {
      expect(store.isAuthenticated()).toBe(false);
    });

    it('should not be loading', () => {
      expect(store.loading()).toBe(false);
    });

    it('should have userName as "Guest"', () => {
      expect(store.userName()).toBe('Guest');
    });

    it('should have empty userEmail', () => {
      expect(store.userEmail()).toBe('');
    });
  });

  describe('Register', () => {
    it('should register user and set auth data', async () => {
      const request = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: '12345678'
      };

      const registerPromise = store.register(request);

      const req = httpMock.expectOne('/api/v1/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockAuthResponse);

      await registerPromise;

      expect(store.user()).toEqual(mockUser);
      expect(store.accessToken()).toBe('mock.access.token');
      expect(store.refreshToken()).toBe('mock.refresh.token');
      expect(store.isAuthenticated()).toBe(true);
    });

    it('should set loading state during registration', async () => {
      const request = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: '12345678'
      };

      const registerPromise = store.register(request);

      // Loading should be true during request
      expect(store.loading()).toBe(true);

      const req = httpMock.expectOne('/api/v1/auth/register');
      req.flush(mockAuthResponse);

      await registerPromise;

      // Loading should be false after completion
      expect(store.loading()).toBe(false);
    });

    it('should handle registration error', async () => {
      const request = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: '12345678'
      };

      const registerPromise = store.register(request);

      const req = httpMock.expectOne('/api/v1/auth/register');
      req.flush({ message: 'Email already exists' }, { status: 400, statusText: 'Bad Request' });

      await expect(registerPromise).rejects.toThrow();
      expect(store.error()).toBeTruthy();
      expect(store.isAuthenticated()).toBe(false);
      expect(store.loading()).toBe(false);
    });
  });

  describe('Login', () => {
    it('should login user and set auth data', async () => {
      const request = {
        email: 'joao@example.com',
        password: '12345678'
      };

      const loginPromise = store.login(request);

      const req = httpMock.expectOne('/api/v1/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockAuthResponse);

      await loginPromise;

      expect(store.user()).toEqual(mockUser);
      expect(store.accessToken()).toBe('mock.access.token');
      expect(store.refreshToken()).toBe('mock.refresh.token');
      expect(store.isAuthenticated()).toBe(true);
    });

    it('should set loading state during login', async () => {
      const request = {
        email: 'joao@example.com',
        password: '12345678'
      };

      const loginPromise = store.login(request);

      expect(store.loading()).toBe(true);

      const req = httpMock.expectOne('/api/v1/auth/login');
      req.flush(mockAuthResponse);

      await loginPromise;

      expect(store.loading()).toBe(false);
    });

    it('should handle login error', async () => {
      const request = {
        email: 'joao@example.com',
        password: 'wrong'
      };

      const loginPromise = store.login(request);

      const req = httpMock.expectOne('/api/v1/auth/login');
      req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });

      await expect(loginPromise).rejects.toThrow();
      expect(store.error()).toBeTruthy();
      expect(store.isAuthenticated()).toBe(false);
    });
  });

  describe('Logout', () => {
    it('should clear auth data', async () => {
      // First login
      const loginPromise = store.login({ email: 'test@test.com', password: '12345678' });
      const req = httpMock.expectOne('/api/v1/auth/login');
      req.flush(mockAuthResponse);
      await loginPromise;

      expect(store.isAuthenticated()).toBe(true);

      // Then logout
      store.logout();

      expect(store.user()).toBeNull();
      expect(store.accessToken()).toBeNull();
      expect(store.refreshToken()).toBeNull();
      expect(store.isAuthenticated()).toBe(false);
    });

    it('should clear localStorage on logout', async () => {
      const loginPromise = store.login({ email: 'test@test.com', password: '12345678' });
      const req = httpMock.expectOne('/api/v1/auth/login');
      req.flush(mockAuthResponse);
      await loginPromise;

      // Wait for effect to run
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(localStorage.getItem('mindease_auth')).toBeTruthy();

      store.logout();

      // Wait for effect to run
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(localStorage.getItem('mindease_auth')).toBeNull();
    });

    it('should clear error on logout', async () => {
      // Force an error
      const loginPromise = store.login({ email: 'test@test.com', password: 'wrong' });
      const req = httpMock.expectOne('/api/v1/auth/login');
      req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });

      await expect(loginPromise).rejects.toThrow();
      expect(store.error()).toBeTruthy();

      // Logout should clear error
      store.logout();
      expect(store.error()).toBeNull();
    });
  });

  describe('LocalStorage persistence', () => {
    it('should persist auth data to localStorage on login', async () => {
      const loginPromise = store.login({ email: 'test@test.com', password: '12345678' });
      const req = httpMock.expectOne('/api/v1/auth/login');
      req.flush(mockAuthResponse);
      await loginPromise;

      // Wait for effect to run
      await new Promise(resolve => setTimeout(resolve, 10));

      const stored = localStorage.getItem('mindease_auth');
      expect(stored).toBeTruthy();

      if (!stored) return;
      const data = JSON.parse(stored);
      expect(data.user).toEqual(mockUser);
      expect(data.accessToken).toBe('mock.access.token');
      expect(data.refreshToken).toBe('mock.refresh.token');
    });

    it('should hydrate from localStorage on init', () => {
      const authData = {
        user: mockUser,
        accessToken: 'stored.access.token',
        refreshToken: 'stored.refresh.token'
      };

      // Create a valid JWT token (not expired)
      const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const payload = { sub: '123', email: 'test@test.com', exp: futureExp, iat: Date.now() / 1000 };
      const encodedPayload = btoa(JSON.stringify(payload));
      const validToken = `header.${encodedPayload}.signature`;

      authData.accessToken = validToken;
      localStorage.setItem('mindease_auth', JSON.stringify(authData));

      // Reset TestBed and create new store instance
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          AuthStore,
          { provide: Router, useValue: routerSpy }
        ]
      });

      const newStore = TestBed.inject(AuthStore);

      expect(newStore.user()).toEqual(mockUser);
      expect(newStore.accessToken()).toBe(validToken);
      expect(newStore.isAuthenticated()).toBe(true);
    });

    it('should not hydrate if token is expired', () => {
      const authData = {
        user: mockUser,
        accessToken: 'stored.access.token',
        refreshToken: 'stored.refresh.token'
      };

      // Create an expired JWT token
      const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const payload = { sub: '123', email: 'test@test.com', exp: pastExp, iat: Date.now() / 1000 };
      const encodedPayload = btoa(JSON.stringify(payload));
      const expiredToken = `header.${encodedPayload}.signature`;

      authData.accessToken = expiredToken;
      localStorage.setItem('mindease_auth', JSON.stringify(authData));

      // Reset TestBed and create new store instance
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          AuthStore,
          { provide: Router, useValue: routerSpy }
        ]
      });

      const newStore = TestBed.inject(AuthStore);

      expect(newStore.user()).toBeNull();
      expect(newStore.isAuthenticated()).toBe(false);
      expect(localStorage.getItem('mindease_auth')).toBeNull();
    });
  });

  describe('Token refresh', () => {
    it('should refresh access token', async () => {
      // Setup authenticated state
      store['_accessToken'].set('old.access.token');
      store['_refreshToken'].set('refresh.token');
      store['_user'].set(mockUser);

      const refreshPromise = store.refreshAccessToken();

      const req = httpMock.expectOne('/api/v1/auth/refresh');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refreshToken: 'refresh.token' });
      req.flush({ accessToken: 'new.access.token' });

      const newToken = await refreshPromise;

      expect(newToken).toBe('new.access.token');
      expect(store.accessToken()).toBe('new.access.token');
    });

    it('should throw error if no refresh token available', async () => {
      await expect(store.refreshAccessToken()).rejects.toThrow('No refresh token available');
    });

    it('should logout and redirect on refresh failure', async () => {
      store['_accessToken'].set('old.access.token');
      store['_refreshToken'].set('refresh.token');
      store['_user'].set(mockUser);

      const refreshPromise = store.refreshAccessToken();

      const req = httpMock.expectOne('/api/v1/auth/refresh');
      req.flush({ message: 'Invalid refresh token' }, { status: 401, statusText: 'Unauthorized' });

      await expect(refreshPromise).rejects.toThrow();
      expect(store.isAuthenticated()).toBe(false);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('Token expiration check', () => {
    it('should return true if no token', () => {
      expect(store.isTokenExpired()).toBe(true);
    });

    it('should return true if token is expired', () => {
      const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const payload = { sub: '123', email: 'test@test.com', exp: pastExp, iat: Date.now() / 1000 };
      const encodedPayload = btoa(JSON.stringify(payload));
      const expiredToken = `header.${encodedPayload}.signature`;

      store['_accessToken'].set(expiredToken);

      expect(store.isTokenExpired()).toBe(true);
    });

    it('should return true if token expires in less than 5 minutes', () => {
      const soonExp = Math.floor(Date.now() / 1000) + 200; // 3 minutes from now
      const payload = { sub: '123', email: 'test@test.com', exp: soonExp, iat: Date.now() / 1000 };
      const encodedPayload = btoa(JSON.stringify(payload));
      const expiringToken = `header.${encodedPayload}.signature`;

      store['_accessToken'].set(expiringToken);

      expect(store.isTokenExpired()).toBe(true);
    });

    it('should return false if token is valid and not expiring soon', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const payload = { sub: '123', email: 'test@test.com', exp: futureExp, iat: Date.now() / 1000 };
      const encodedPayload = btoa(JSON.stringify(payload));
      const validToken = `header.${encodedPayload}.signature`;

      store['_accessToken'].set(validToken);

      expect(store.isTokenExpired()).toBe(false);
    });
  });

  describe('Computed values', () => {
    it('should compute userName', async () => {
      expect(store.userName()).toBe('Guest');

      const loginPromise = store.login({ email: 'test@test.com', password: '12345678' });
      const req = httpMock.expectOne('/api/v1/auth/login');
      req.flush(mockAuthResponse);
      await loginPromise;

      expect(store.userName()).toBe('João Silva');
    });

    it('should compute userEmail', async () => {
      expect(store.userEmail()).toBe('');

      const loginPromise = store.login({ email: 'test@test.com', password: '12345678' });
      const req = httpMock.expectOne('/api/v1/auth/login');
      req.flush(mockAuthResponse);
      await loginPromise;

      expect(store.userEmail()).toBe('joao@example.com');
    });

    it('should compute isAuthenticated based on token and user', () => {
      expect(store.isAuthenticated()).toBe(false);

      store['_user'].set(mockUser);
      expect(store.isAuthenticated()).toBe(false); // Still false, no token

      store['_accessToken'].set('token');
      expect(store.isAuthenticated()).toBe(true); // Now true, both present
    });
  });
});
