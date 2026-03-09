// =============================================================================
// MindEase — Auth Store (Signals)
// =============================================================================
// Global authentication state management with Angular Signals
// Features: login, register, logout, token refresh, LocalStorage persistence

import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom, catchError, throwError } from 'rxjs';
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  DecodedToken
} from './auth.models';

const STORAGE_KEY = 'mindease_auth';
const API_URL = '/api/v1'; // Update with environment config

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Private writable signals
  private readonly _user = signal<User | null>(null);
  private readonly _accessToken = signal<string | null>(null);
  private readonly _refreshToken = signal<string | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Public readonly signals
  readonly user = this._user.asReadonly();
  readonly accessToken = this._accessToken.asReadonly();
  readonly refreshToken = this._refreshToken.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed signals
  readonly isAuthenticated = computed(() => {
    return !!this._accessToken() && !!this._user();
  });

  readonly userName = computed(() => {
    return this._user()?.name || 'Guest';
  });

  readonly userEmail = computed(() => {
    return this._user()?.email || '';
  });

  // Effect: Persist to LocalStorage on state change
  constructor() {
    effect(() => {
      const user = this._user();
      const accessToken = this._accessToken();
      const refreshToken = this._refreshToken();

      if (user && accessToken && refreshToken) {
        this.persistToStorage({ user, accessToken, refreshToken });
      } else {
        this.clearStorage();
      }
    });

    // Hydrate from LocalStorage on init
    this.hydrateFromStorage();
  }

  // =============================================================================
  // PUBLIC METHODS
  // =============================================================================

  /**
   * Register a new user
   * @param request - RegisterRequest with name, email, password
   * @throws Error if registration fails
   */
  async register(request: RegisterRequest): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(`${API_URL}/auth/register`, request).pipe(
          catchError(this.handleError.bind(this))
        )
      );

      this.setAuthData(response);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      this._error.set(message);
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Login with email and password
   * @param request - LoginRequest with email, password
   * @throws Error if login fails
   */
  async login(request: LoginRequest): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(`${API_URL}/auth/login`, request).pipe(
          catchError(this.handleError.bind(this))
        )
      );

      this.setAuthData(response);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed';
      this._error.set(message);
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Logout current user
   * Clears state and LocalStorage
   */
  logout(): void {
    this._user.set(null);
    this._accessToken.set(null);
    this._refreshToken.set(null);
    this._error.set(null);
    this.clearStorage();
  }

  /**
   * Update current user's profile fields in memory
   */
  updateUser(updates: Partial<Pick<User, 'name' | 'email'>>): void {
    const current = this._user();
    if (current) {
      this._user.set({ ...current, ...updates });
    }
  }

  /**
   * Refresh access token using refresh token
   * @returns New access token
   * @throws Error if refresh fails (triggers logout)
   */
  async refreshAccessToken(): Promise<string> {
    const currentRefreshToken = this._refreshToken();

    if (!currentRefreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await firstValueFrom(
        this.http.post<RefreshTokenResponse>(`${API_URL}/auth/refresh`, {
          refreshToken: currentRefreshToken
        } as RefreshTokenRequest).pipe(
          catchError(this.handleError.bind(this))
        )
      );

      this._accessToken.set(response.accessToken);
      return response.accessToken;
    } catch (error) {
      // Refresh failed, logout user
      this.logout();
      this.router.navigate(['/login']);
      throw error;
    }
  }

  /**
   * Check if access token is expired or will expire soon (< 5 min)
   * @returns true if token is expired or expiring soon
   */
  isTokenExpired(): boolean {
    const token = this._accessToken();
    if (!token) return true;

    try {
      const decoded = this.decodeToken(token);
      const now = Date.now() / 1000;
      // Consider expired if less than 5 minutes remaining
      return decoded.exp < (now + 300);
    } catch {
      return true;
    }
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  /**
   * Set authentication data in state
   * @param response - AuthResponse from API
   */
  private setAuthData(response: AuthResponse): void {
    this._user.set(response.user);
    this._accessToken.set(response.accessToken);
    this._refreshToken.set(response.refreshToken);
  }

  /**
   * Decode JWT token to get payload
   * @param token - JWT token string
   * @returns Decoded token payload
   */
  private decodeToken(token: string): DecodedToken {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  /**
   * Persist auth data to LocalStorage
   * @param data - User, accessToken, refreshToken
   */
  private persistToStorage(data: { user: User; accessToken: string; refreshToken: string }): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('[AuthStore] Failed to persist auth data:', error);
    }
  }

  /**
   * Clear auth data from LocalStorage
   */
  private clearStorage(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('[AuthStore] Failed to clear auth data:', error);
    }
  }

  /**
   * Hydrate state from LocalStorage on app init
   * Validates token expiration before restoring
   */
  private hydrateFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const data = JSON.parse(stored);

      // Validate token is not expired
      if (data.accessToken) {
        const decoded = this.decodeToken(data.accessToken);
        const now = Date.now() / 1000;

        if (decoded.exp > now) {
          // Token is still valid
          this._user.set(data.user);
          this._accessToken.set(data.accessToken);
          this._refreshToken.set(data.refreshToken);
        } else {
          // Token expired, clear storage
          this.clearStorage();
        }
      }
    } catch (error) {
      console.error('[AuthStore] Failed to hydrate auth data:', error);
      this.clearStorage();
    }
  }

  /**
   * Handle HTTP errors
   * @param error - HttpErrorResponse
   * @returns Observable that throws formatted error
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.message || error.message;
    }

    // translate common backend messages to Portuguese
    errorMessage = this.translateError(errorMessage);

    return throwError(() => new Error(errorMessage));
  }

  /**
   * Map known English error texts from API to Portuguese.
   * Leaves unknown messages untouched so they can still be logged.
   */
  private translateError(msg: string): string {
    const map: Record<string, string> = {
      'User not found': 'Usuário não encontrado',
      'email and password are required': 'Email e senha são obrigatórios',
      'Email already exists': 'Email já existe',
      'Invalid credentials': 'Credenciais inválidas',
      // add more mappings as the backend returns other messages
    };

    // try exact match first
    if (map[msg]) {
      return map[msg];
    }

    // some messages may be lower/upper or contain additional context
    const lower = msg.toLowerCase();
    for (const [eng, pt] of Object.entries(map)) {
      if (lower.includes(eng.toLowerCase())) {
        return pt;
      }
    }

    return msg; // fallback
  }
}
