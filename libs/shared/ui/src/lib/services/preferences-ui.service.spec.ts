/**
 * Preferences UI Service Tests
 */

import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PreferencesUiService } from './preferences-ui.service';
import { PreferencesStore, DEFAULT_PREFERENCES } from '@shared/state';

describe('PreferencesUiService', () => {
  let service: PreferencesUiService;
  let prefsStore: PreferencesStore;
  let document: Document;
  let body: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PreferencesUiService, PreferencesStore]
    });

    service = TestBed.inject(PreferencesUiService);
    prefsStore = TestBed.inject(PreferencesStore);
    document = TestBed.inject(DOCUMENT);
    body = document.body;
  });

  afterEach(() => {
    // Clean up body attributes and classes
    const attributes = [
      'data-ui-density',
      'data-focus-mode',
      'data-content-mode',
      'data-contrast',
      'data-font-scale',
      'data-spacing-scale',
      'data-motion'
    ];
    attributes.forEach(attr => body.removeAttribute(attr));
    
    body.classList.remove(
      'density-simple', 'density-medium', 'density-full',
      'focus-mode',
      'content-summary', 'content-detailed',
      'contrast-low', 'contrast-normal', 'contrast-high',
      'motion-full', 'motion-reduced', 'motion-off'
    );
    
    body.style.removeProperty('--font-scale');
    body.style.removeProperty('--spacing-scale');
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('Data attributes', () => {
    it('should apply default preferences on initialization', (done) => {
      setTimeout(() => {
        expect(body.getAttribute('data-ui-density')).toBe(DEFAULT_PREFERENCES.uiDensity);
        expect(body.getAttribute('data-focus-mode')).toBe(String(DEFAULT_PREFERENCES.focusMode));
        expect(body.getAttribute('data-content-mode')).toBe(DEFAULT_PREFERENCES.contentMode);
        expect(body.getAttribute('data-contrast')).toBe(DEFAULT_PREFERENCES.contrast);
        expect(body.getAttribute('data-motion')).toBe(DEFAULT_PREFERENCES.motion);
        done();
      }, 10);
    });

    it('should apply ui-density attribute', async () => {
      await prefsStore.updatePreferences({ uiDensity: 'simple' });
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(body.getAttribute('data-ui-density')).toBe('simple');
    });

    it('should apply focus-mode attribute', async () => {
      await prefsStore.updatePreferences({ focusMode: true });
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(body.getAttribute('data-focus-mode')).toBe('true');
      
      await prefsStore.updatePreferences({ focusMode: false });
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(body.getAttribute('data-focus-mode')).toBe('false');
    });

    it('should apply content-mode attribute', async () => {
      await prefsStore.updatePreferences({ contentMode: 'summary' });
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(body.getAttribute('data-content-mode')).toBe('summary');
    });

    it('should apply contrast attribute', async () => {
      await prefsStore.updatePreferences({ contrast: 'high' });
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(body.getAttribute('data-contrast')).toBe('high');
    });

    it('should apply motion attribute', async () => {
      await prefsStore.updatePreferences({ motion: 'reduced' });
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(body.getAttribute('data-motion')).toBe('reduced');
    });

    it('should apply font-scale attribute', async () => {
      await prefsStore.updatePreferences({ fontScale: 1.2 });
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(body.getAttribute('data-font-scale')).toBe('1.2');
    });

    it('should apply spacing-scale attribute', async () => {
      await prefsStore.updatePreferences({ spacingScale: 1.3 });
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(body.getAttribute('data-spacing-scale')).toBe('1.3');
    });
  });

  describe('CSS custom properties', () => {
    it('should apply font-scale CSS var', async () => {
      await prefsStore.updatePreferences({ fontScale: 1.2 });
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(body.style.getPropertyValue('--font-scale')).toBe('1.2');
    });

    it('should apply spacing-scale CSS var', async () => {
      await prefsStore.updatePreferences({ spacingScale: 1.3 });
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(body.style.getPropertyValue('--spacing-scale')).toBe('1.3');
    });

    it('should update CSS vars when preferences change', async () => {
      await prefsStore.updatePreferences({ fontScale: 1.0, spacingScale: 1.0 });
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(body.style.getPropertyValue('--font-scale')).toBe('1');
      expect(body.style.getPropertyValue('--spacing-scale')).toBe('1');
      
      await prefsStore.updatePreferences({ fontScale: 1.5, spacingScale: 1.4 });
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(body.style.getPropertyValue('--font-scale')).toBe('1.5');
      expect(body.style.getPropertyValue('--spacing-scale')).toBe('1.4');
    });
  });

  describe('Body classes', () => {
    it('should apply density class', async () => {
      await prefsStore.updatePreferences({ uiDensity: 'simple' });
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(body.classList.contains('density-simple')).toBe(true);
      expect(body.classList.contains('density-medium')).toBe(false);
      expect(body.classList.contains('density-full')).toBe(false);
    });

    it('should switch density classes', async () => {
      await prefsStore.updatePreferences({ uiDensity: 'medium' });
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(body.classList.contains('density-medium')).toBe(true);
      expect(body.classList.contains('density-simple')).toBe(false);
      
      await prefsStore.updatePreferences({ uiDensity: 'full' });
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(body.classList.contains('density-full')).toBe(true);
      expect(body.classList.contains('density-medium')).toBe(false);
    });

    it('should apply focus-mode class when enabled', async () => {
      await prefsStore.updatePreferences({ focusMode: true });
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(body.classList.contains('focus-mode')).toBe(true);
      
      await prefsStore.updatePreferences({ focusMode: false });
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(body.classList.contains('focus-mode')).toBe(false);
    });

    it('should apply content-mode class', async () => {
      await prefsStore.updatePreferences({ contentMode: 'summary' });
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(body.classList.contains('content-summary')).toBe(true);
      expect(body.classList.contains('content-detailed')).toBe(false);
      
      await prefsStore.updatePreferences({ contentMode: 'detailed' });
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(body.classList.contains('content-detailed')).toBe(true);
      expect(body.classList.contains('content-summary')).toBe(false);
    });

    it('should apply contrast class', async () => {
      await prefsStore.updatePreferences({ contrast: 'high' });
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(body.classList.contains('contrast-high')).toBe(true);
      expect(body.classList.contains('contrast-normal')).toBe(false);
    });

    it('should apply motion class', async () => {
      await prefsStore.updatePreferences({ motion: 'off' });
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(body.classList.contains('motion-off')).toBe(true);
      expect(body.classList.contains('motion-full')).toBe(false);
    });
  });

  describe('Reactive updates', () => {
    it('should update DOM when preferences change', async () => {
      await prefsStore.updatePreferences({ uiDensity: 'simple' });
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(body.getAttribute('data-ui-density')).toBe('simple');
      expect(body.classList.contains('density-simple')).toBe(true);
      
      await prefsStore.updatePreferences({ uiDensity: 'full' });
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(body.getAttribute('data-ui-density')).toBe('full');
      expect(body.classList.contains('density-full')).toBe(true);
      expect(body.classList.contains('density-simple')).toBe(false);
    });

    it('should update multiple preferences atomically', async () => {
      await prefsStore.updatePreferences({
        uiDensity: 'simple',
        focusMode: true,
        contrast: 'high',
        motion: 'reduced',
        fontScale: 1.3,
        spacingScale: 1.2
      });
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(body.getAttribute('data-ui-density')).toBe('simple');
      expect(body.getAttribute('data-focus-mode')).toBe('true');
      expect(body.getAttribute('data-contrast')).toBe('high');
      expect(body.getAttribute('data-motion')).toBe('reduced');
      expect(body.style.getPropertyValue('--font-scale')).toBe('1.3');
      expect(body.style.getPropertyValue('--spacing-scale')).toBe('1.2');
    });
  });
});
