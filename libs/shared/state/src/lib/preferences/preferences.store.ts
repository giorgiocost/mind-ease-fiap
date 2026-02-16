/**
 * Preferences Store
 *
 * Reactive state management for cognitive accessibility preferences using Angular Signals.
 * Features:
 * - LocalStorage persistence
 * - API synchronization when authenticated
 * - Optimistic updates
 * - Automatic hydration from storage
 * - Auto-load from API when user authenticates
 *
 * Based on ADR-002 (MVVM + Signals) and ADR-003 (Cognitive Tokens)
 */

import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, catchError, throwError } from 'rxjs';
import { AuthStore } from '../auth/auth.store';
import {
  CognitivePreferences,
  PreferencesResponse,
  UpdatePreferencesRequest,
  DEFAULT_PREFERENCES
} from './preferences.models';

const STORAGE_KEY = 'mindease_preferences';
const API_URL = '/api/v1';

@Injectable({ providedIn: 'root' })
export class PreferencesStore {
  private http = inject(HttpClient);
  private authStore = inject(AuthStore);

  // Private writable signals
  private readonly _preferences = signal<CognitivePreferences>(DEFAULT_PREFERENCES);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _synced = signal<boolean>(false); // Synced with backend

  // Public readonly signals
  readonly preferences = this._preferences.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly synced = this._synced.asReadonly();

  // Individual preference signals (for convenience)
  readonly uiDensity = computed(() => this._preferences().uiDensity);
  readonly focusMode = computed(() => this._preferences().focusMode);
  readonly contentMode = computed(() => this._preferences().contentMode);
  readonly contrast = computed(() => this._preferences().contrast);
  readonly fontScale = computed(() => this._preferences().fontScale);
  readonly spacingScale = computed(() => this._preferences().spacingScale);
  readonly motion = computed(() => this._preferences().motion);

  constructor() {
    // Effect: Persist to LocalStorage on change
    effect(() => {
      const prefs = this._preferences();
      this.persistToStorage(prefs);
    });

    // Hydrate from LocalStorage on init
    this.hydrateFromStorage();

    // Effect: Load from API when authenticated
    effect(() => {
      if (this.authStore.isAuthenticated() && !this._synced()) {
        this.loadFromApi();
      }
    });
  }

  /**
   * Load preferences from API
   * Priority: API → LocalStorage → Defaults
   */
  async loadFromApi(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const response = await firstValueFrom(
        this.http.get<PreferencesResponse>(`${API_URL}/preferences`).pipe(
          catchError(this.handleError.bind(this))
        )
      );

      this._preferences.set(response.data);
      this._synced.set(true);
    } catch (error: unknown) {
      this._error.set(error instanceof Error ? error.message : 'Failed to load preferences');
      // Keep local preferences on error
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Update preferences (optimistic update + API sync)
   * Local changes are kept even if API sync fails (resilience)
   */
  async updatePreferences(updates: UpdatePreferencesRequest): Promise<void> {
    const current = this._preferences();
    const updated = { ...current, ...updates };

    // Optimistic update
    this._preferences.set(updated);

    // Sync with API if authenticated
    if (this.authStore.isAuthenticated()) {
      this._loading.set(true);
      this._error.set(null);

      try {
        await firstValueFrom(
          this.http.put<PreferencesResponse>(`${API_URL}/preferences`, updated).pipe(
            catchError(this.handleError.bind(this))
          )
        );

        this._synced.set(true);
      } catch (error: unknown) {
        this._error.set(error instanceof Error ? error.message : 'Failed to sync preferences');
        // Keep local changes even if sync fails
      } finally {
        this._loading.set(false);
      }
    }
  }

  /**
   * Reset all preferences to defaults
   * Syncs with API if authenticated
   */
  resetToDefaults(): void {
    this._preferences.set(DEFAULT_PREFERENCES);
    this._synced.set(false);

    if (this.authStore.isAuthenticated()) {
      this.updatePreferences(DEFAULT_PREFERENCES);
    }
  }

  /**
   * Persist preferences to LocalStorage
   */
  private persistToStorage(preferences: CognitivePreferences): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to persist preferences:', error);
    }
  }

  /**
   * Hydrate preferences from LocalStorage on init
   * Merges with defaults to handle schema evolution
   */
  private hydrateFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const preferences = JSON.parse(stored);
      this._preferences.set({ ...DEFAULT_PREFERENCES, ...preferences });
    } catch (error) {
      console.error('Failed to hydrate preferences:', error);
    }
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = error.error?.message || error.message;
    }

    return throwError(() => new Error(errorMessage));
  }
}
