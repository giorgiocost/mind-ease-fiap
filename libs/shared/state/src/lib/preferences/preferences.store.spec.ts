/**
 * Preferences Store Tests
 *
 * Comprehensive unit tests for PreferencesStore.
 * Coverage: Initial state, API load, optimistic updates, persistence,
 * hydration, sync logic, computed values, error handling.
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { PreferencesStore } from './preferences.store';
import { AuthStore } from '../auth/auth.store';
import { CognitivePreferences, DEFAULT_PREFERENCES } from './preferences.models';

describe('PreferencesStore', () => {
  let store: PreferencesStore;
  let httpMock: HttpTestingController;
  let authStore: AuthStore;
  let routerSpy: Partial<Router>;

  const mockPreferences: CognitivePreferences = {
    uiDensity: 'simple',
    focusMode: true,
    contentMode: 'summary',
    contrast: 'high',
    fontScale: 1.2,
    spacingScale: 1.1,
    motion: 'reduced',
    wipLimitEnabled: false
  };

  beforeEach(() => {
    routerSpy = {
      navigate: jest.fn()
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PreferencesStore,
        AuthStore,
        { provide: Router, useValue: routerSpy }
      ]
    });

    store = TestBed.inject(PreferencesStore);
    httpMock = TestBed.inject(HttpTestingController);
    authStore = TestBed.inject(AuthStore);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('Store creation', () => {
    it('should create the store', () => {
      expect(store).toBeTruthy();
    });
  });

  describe('Initial state', () => {
    it('should have default preferences', () => {
      expect(store.preferences()).toEqual(DEFAULT_PREFERENCES);
    });

    it('should not be loading initially', () => {
      expect(store.loading()).toBe(false);
    });

    it('should have no error initially', () => {
      expect(store.error()).toBeNull();
    });

    it('should not be synced initially', () => {
      expect(store.synced()).toBe(false);
    });

    it('should have default uiDensity', () => {
      expect(store.uiDensity()).toBe('medium');
    });

    it('should have focusMode disabled by default', () => {
      expect(store.focusMode()).toBe(false);
    });
  });

  describe('Load from API', () => {
    it('should load preferences from API', async () => {
      const loadPromise = store.loadFromApi();

      const req = httpMock.expectOne('/api/v1/preferences');
      expect(req.request.method).toBe('GET');
      req.flush({ data: mockPreferences });

      await loadPromise;

      expect(store.preferences()).toEqual(mockPreferences);
      expect(store.synced()).toBe(true);
      expect(store.loading()).toBe(false);
    });

    it('should handle API load error gracefully', async () => {
      const loadPromise = store.loadFromApi();

      const req = httpMock.expectOne('/api/v1/preferences');
      req.flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });

      await loadPromise;

      expect(store.error()).toBeTruthy();
      expect(store.preferences()).toEqual(DEFAULT_PREFERENCES); // Keep defaults
      expect(store.loading()).toBe(false);
    });

    it('should set loading state during API call', async () => {
      const loadPromise = store.loadFromApi();

      // Check loading state before response
      expect(store.loading()).toBe(true);

      const req = httpMock.expectOne('/api/v1/preferences');
      req.flush({ data: mockPreferences });

      await loadPromise;

      expect(store.loading()).toBe(false);
    });
  });

  describe('Update preferences', () => {
    it('should update preferences optimistically', async () => {
      // Setup authenticated state
      authStore['_accessToken'].set('mock.token.here');
      authStore['_user'].set({
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date().toISOString()
      });

      const updatePromise = store.updatePreferences({ uiDensity: 'simple' });

      // Immediate update (optimistic)
      expect(store.uiDensity()).toBe('simple');

      // API call
      const req = httpMock.expectOne('/api/v1/preferences');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body.uiDensity).toBe('simple');
      req.flush({ data: { ...DEFAULT_PREFERENCES, uiDensity: 'simple' } });

      await updatePromise;

      expect(store.synced()).toBe(true);
    });

    it('should update multiple preferences at once', async () => {
      authStore['_accessToken'].set('mock.token.here');
      authStore['_user'].set({
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date().toISOString()
      });

      const updatePromise = store.updatePreferences({
        uiDensity: 'simple',
        focusMode: true,
        contrast: 'high'
      });

      // Check optimistic updates
      expect(store.uiDensity()).toBe('simple');
      expect(store.focusMode()).toBe(true);
      expect(store.contrast()).toBe('high');

      const req = httpMock.expectOne('/api/v1/preferences');
      req.flush({ data: mockPreferences });

      await updatePromise;
    });

    it('should keep local changes if API sync fails', async () => {
      authStore['_accessToken'].set('mock.token.here');
      authStore['_user'].set({
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date().toISOString()
      });

      const updatePromise = store.updatePreferences({ uiDensity: 'simple' });

      expect(store.uiDensity()).toBe('simple'); // Optimistic update

      const req = httpMock.expectOne('/api/v1/preferences');
      req.flush({ message: 'Server error' }, { status: 500, statusText: 'Internal Server Error' });

      await updatePromise;

      // Local change should persist even after API error
      expect(store.uiDensity()).toBe('simple');
      expect(store.error()).toBeTruthy();
      expect(store.synced()).toBe(false);
    });

    it('should not call API when not authenticated', async () => {
      // No authentication setup
      await store.updatePreferences({ uiDensity: 'simple' });

      // No HTTP request should be made
      httpMock.expectNone('/api/v1/preferences');

      // But local update should work
      expect(store.uiDensity()).toBe('simple');
    });
  });

  describe('Reset to defaults', () => {
    it('should reset all preferences to default values', () => {
      // First update some preferences
      store['_preferences'].set(mockPreferences);
      expect(store.uiDensity()).toBe('simple');

      // Reset
      store.resetToDefaults();

      expect(store.preferences()).toEqual(DEFAULT_PREFERENCES);
      expect(store.uiDensity()).toBe('medium');
    });

    it('should mark as not synced after reset', () => {
      store['_synced'].set(true);

      store.resetToDefaults();

      expect(store.synced()).toBe(false);
    });
  });

  describe('LocalStorage persistence', () => {
    it('should persist preferences to localStorage', async () => {
      // Wait for effect to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      store['_preferences'].set({ ...DEFAULT_PREFERENCES, uiDensity: 'simple' });

      // Wait for effect to run
      await new Promise(resolve => setTimeout(resolve, 10));

      const stored = localStorage.getItem('mindease_preferences');
      expect(stored).toBeTruthy();

      const preferences = JSON.parse(stored as string);
      expect(preferences.uiDensity).toBe('simple');
    });

    it('should hydrate from localStorage on init', () => {
      TestBed.resetTestingModule();

      const prefs = { ...DEFAULT_PREFERENCES, uiDensity: 'simple' as const };
      localStorage.setItem('mindease_preferences', JSON.stringify(prefs));

      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          PreferencesStore,
          AuthStore,
          { provide: Router, useValue: routerSpy }
        ]
      });

      const newStore = TestBed.inject(PreferencesStore);

      expect(newStore.uiDensity()).toBe('simple');
    });

    it('should handle corrupted localStorage data gracefully', () => {
      TestBed.resetTestingModule();

      localStorage.setItem('mindease_preferences', 'invalid-json{');

      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          PreferencesStore,
          AuthStore,
          { provide: Router, useValue: routerSpy }
        ]
      });

      const newStore = TestBed.inject(PreferencesStore);

      // Should fall back to defaults
      expect(newStore.preferences()).toEqual(DEFAULT_PREFERENCES);
    });
  });

  describe('Computed values', () => {
    it('should compute uiDensity', () => {
      expect(store.uiDensity()).toBe(DEFAULT_PREFERENCES.uiDensity);

      store['_preferences'].set({ ...DEFAULT_PREFERENCES, uiDensity: 'simple' });

      expect(store.uiDensity()).toBe('simple');
    });

    it('should compute focusMode', () => {
      expect(store.focusMode()).toBe(false);

      store['_preferences'].set({ ...DEFAULT_PREFERENCES, focusMode: true });

      expect(store.focusMode()).toBe(true);
    });

    it('should compute contentMode', () => {
      expect(store.contentMode()).toBe('detailed');

      store['_preferences'].set({ ...DEFAULT_PREFERENCES, contentMode: 'summary' });

      expect(store.contentMode()).toBe('summary');
    });

    it('should compute contrast', () => {
      expect(store.contrast()).toBe('normal');

      store['_preferences'].set({ ...DEFAULT_PREFERENCES, contrast: 'high' });

      expect(store.contrast()).toBe('high');
    });

    it('should compute fontScale', () => {
      expect(store.fontScale()).toBe(1.0);

      store['_preferences'].set({ ...DEFAULT_PREFERENCES, fontScale: 1.2 });

      expect(store.fontScale()).toBe(1.2);
    });

    it('should compute spacingScale', () => {
      expect(store.spacingScale()).toBe(1.0);

      store['_preferences'].set({ ...DEFAULT_PREFERENCES, spacingScale: 1.1 });

      expect(store.spacingScale()).toBe(1.1);
    });

    it('should compute motion', () => {
      expect(store.motion()).toBe('full');

      store['_preferences'].set({ ...DEFAULT_PREFERENCES, motion: 'reduced' });

      expect(store.motion()).toBe('reduced');
    });
  });

  describe('Auto-load when authenticated', () => {
    it('should automatically load preferences when user authenticates', async () => {
      // Mock authentication
      authStore['_accessToken'].set('mock.token.here');
      authStore['_user'].set({
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date().toISOString()
      });

      // Wait for effect to trigger
      await new Promise(resolve => setTimeout(resolve, 10));

      const req = httpMock.expectOne('/api/v1/preferences');
      req.flush({ data: mockPreferences });

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(store.preferences()).toEqual(mockPreferences);
    });
  });

  describe('Error handling', () => {
    it('should handle network errors', async () => {
      const loadPromise = store.loadFromApi();

      const req = httpMock.expectOne('/api/v1/preferences');
      req.error(new ProgressEvent('error'));

      await loadPromise;

      expect(store.error()).toBeTruthy();
      expect(store.loading()).toBe(false);
    });

    it('should clear previous errors on new operation', async () => {
      // First set an error
      store['_error'].set('Previous error');

      const loadPromise = store.loadFromApi();

      // Error should be cleared
      expect(store.error()).toBeNull();

      const req = httpMock.expectOne('/api/v1/preferences');
      req.flush({ data: mockPreferences });

      await loadPromise;
    });
  });
});
