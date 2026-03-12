/**
 * Auth Interceptor Tests
 */

import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { AuthStore } from '@shared/state';

describe('authInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let authStore: AuthStore;
  let routerSpy: Partial<Router>;

  beforeEach(() => {
    routerSpy = { navigate: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        { provide: Router, useValue: routerSpy },
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    authStore = TestBed.inject(AuthStore);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add X-Correlation-Id header to all requests', (done) => {
    httpClient.get('/api/v1/test').subscribe(() => done());

    const req = httpMock.expectOne('/api/v1/test');
    expect(req.request.headers.has('X-Correlation-Id')).toBe(true);
    expect(req.request.headers.get('X-Correlation-Id')).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
    req.flush({});
  });

  it('should add Authorization header when user is authenticated', (done) => {
    // Simulate authenticated state
    authStore['_accessToken'].set('mock.jwt.token');
    authStore['_user'].set({
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      createdAt: '2026-02-16T00:00:00Z'
    });

    httpClient.get('/api/v1/preferences').subscribe(() => done());

    const req = httpMock.expectOne('/api/v1/preferences');
    expect(req.request.headers.has('Authorization')).toBe(true);
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock.jwt.token');
    req.flush({});
  });

  it('should not add Authorization header when user is not authenticated', (done) => {
    // Ensure not authenticated
    authStore['_accessToken'].set(null);
    authStore['_user'].set(null);

    httpClient.get('/api/v1/preferences').subscribe(() => done());

    const req = httpMock.expectOne('/api/v1/preferences');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should not add Authorization header for /auth/login endpoint', (done) => {
    authStore['_accessToken'].set('mock.jwt.token');

    httpClient.post('/api/v1/auth/login', {}).subscribe(() => done());

    const req = httpMock.expectOne('/api/v1/auth/login');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should not add Authorization header for /auth/register endpoint', (done) => {
    authStore['_accessToken'].set('mock.jwt.token');

    httpClient.post('/api/v1/auth/register', {}).subscribe(() => done());

    const req = httpMock.expectOne('/api/v1/auth/register');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should not add Authorization header for /auth/refresh endpoint', (done) => {
    authStore['_accessToken'].set('mock.jwt.token');

    httpClient.post('/api/v1/auth/refresh', {}).subscribe(() => done());

    const req = httpMock.expectOne('/api/v1/auth/refresh');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should attempt token refresh on 401 error', (done) => {
    authStore['_accessToken'].set('expired.token');
    authStore['_refreshToken'].set('valid.refresh.token');
    authStore['_user'].set({
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      createdAt: '2026-02-16T00:00:00Z'
    });

    let requestCompleted = false;

    httpClient.get('/api/v1/preferences').subscribe({
      next: () => {
        requestCompleted = true;
        // Verify the retry happened
        expect(requestCompleted).toBe(true);
        done();
      },
      error: () => {
        done.fail('Request should have succeeded after token refresh');
      }
    });

    // First request with expired token
    const req1 = httpMock.expectOne('/api/v1/preferences');
    expect(req1.request.headers.get('Authorization')).toBe('Bearer expired.token');
    req1.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    // Wait a bit for the refresh to be triggered
    setTimeout(() => {
      // Refresh token request
      const refreshReq = httpMock.expectOne('/api/v1/auth/refresh');
      expect(refreshReq.request.body).toEqual({ refreshToken: 'valid.refresh.token' });
      refreshReq.flush({ accessToken: 'new.access.token' });

      // Wait a bit more for the retry
      setTimeout(() => {
        // Retry original request with new token
        const req2 = httpMock.expectOne('/api/v1/preferences');
        expect(req2.request.headers.get('Authorization')).toBe('Bearer new.access.token');
        req2.flush({ data: 'success' });
      }, 10);
    }, 10);
  });

  it('should logout and redirect to /login if token refresh fails', (done) => {
    authStore['_accessToken'].set('expired.token');
    authStore['_refreshToken'].set('invalid.refresh.token');
    authStore['_user'].set({
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      createdAt: '2026-02-16T00:00:00Z'
    });

    httpClient.get('/api/v1/preferences').subscribe({
      error: () => {
        // Wait for effects to complete
        setTimeout(() => {
          expect(authStore.isAuthenticated()).toBe(false);
          expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
          done();
        }, 10);
      }
    });

    // First request
    const req1 = httpMock.expectOne('/api/v1/preferences');
    req1.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    // Refresh token request fails
    const refreshReq = httpMock.expectOne('/api/v1/auth/refresh');
    refreshReq.flush(
      { message: 'Invalid refresh token' },
      { status: 401, statusText: 'Unauthorized' }
    );
  });

  it('should pass through non-401 errors without refresh attempt', (done) => {
    authStore['_accessToken'].set('valid.token');
    authStore['_user'].set({
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      createdAt: '2026-02-16T00:00:00Z'
    });

    httpClient.get('/api/v1/preferences').subscribe({
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(500);
        done();
      }
    });

    const req = httpMock.expectOne('/api/v1/preferences');
    req.flush({ message: 'Server error' }, { status: 500, statusText: 'Server Error' });
  });

  it('should not attempt refresh for 401 on public endpoints', (done) => {
    httpClient.post('/api/v1/auth/login', {}).subscribe({
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(401);
        // Should not attempt refresh
        httpMock.verify();
        done();
      }
    });

    const req = httpMock.expectOne('/api/v1/auth/login');
    req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
  });

  it('should add both headers correctly', (done) => {
    authStore['_accessToken'].set('test.token');
    authStore['_user'].set({
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      createdAt: '2026-02-16T00:00:00Z'
    });

    httpClient.get('/api/v1/tasks').subscribe(() => done());

    const req = httpMock.expectOne('/api/v1/tasks');
    expect(req.request.headers.has('Authorization')).toBe(true);
    expect(req.request.headers.has('X-Correlation-Id')).toBe(true);
    expect(req.request.headers.get('Authorization')).toBe('Bearer test.token');
    req.flush([]);
  });
});
