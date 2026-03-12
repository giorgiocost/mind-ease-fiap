/**
 * Preferences UI Service
 *
 * Applies cognitive accessibility preferences from PreferencesStore to the DOM.
 * Features:
 * - Reactive DOM updates via Angular effect()
 * - Data attributes on <body> element
 * - CSS custom properties (--font-scale, --spacing-scale)
 * - Body classes for CSS targeting
 * - Auto-initialization via APP_INITIALIZER
 *
 * Based on ADR-002 (MVVM + Signals) and ADR-003 (Cognitive Tokens)
 */

import { DOCUMENT, Injectable, effect, inject } from '@angular/core';
import type { CognitivePreferences } from '@shared/state';
import { PreferencesStore } from '@shared/state';

@Injectable({ providedIn: 'root' })
export class PreferencesUiService {
  private document = inject(DOCUMENT);
  private prefsStore = inject(PreferencesStore);
  private body: HTMLElement | null = null;
  private htmlEl: HTMLElement | null = null;

  constructor() {
    this.body = this.document.body;
    this.htmlEl = this.document.documentElement;

    // Effect: Apply preferences to DOM when they change
    effect(() => {
      const prefs = this.prefsStore.preferences();
      this.applyPreferences(prefs);
    });
  }

  /**
   * Apply cognitive preferences to DOM
   * - Sets data attributes on <body>
   * - Updates CSS custom properties
   * - Applies CSS classes for easier targeting
   */
  private applyPreferences(prefs: CognitivePreferences): void {
    if (!this.body) return;

    // Apply data attributes
    this.body.setAttribute('data-ui-density', prefs.uiDensity);
    this.body.setAttribute('data-focus-mode', String(prefs.focusMode));
    this.body.setAttribute('data-content-mode', prefs.contentMode);
    this.body.setAttribute('data-contrast', prefs.contrast);
    this.body.setAttribute('data-motion', prefs.motion);

    // font-scale is applied to <html> so all rem values scale globally.
    // We use TWO mechanisms for maximum reliability:
    //  1. data-font-scale attribute → CSS rule [data-font-scale='N'] { font-size: N% }
    //  2. Inline style → font-size set directly via JS (highest possible specificity,
    //     bypasses cascade/loading-order issues between host and remote MFE bundles).
    // NOT on <body> — that would compound (html 120% × body 120% = 144%).
    if (this.htmlEl) {
      this.htmlEl.setAttribute('data-font-scale', String(prefs.fontScale));
      this.htmlEl.setAttribute('data-spacing-scale', String(prefs.spacingScale));
      // Direct DOM: always wins over any CSS rule, guarantees immediate effect.
      this.htmlEl.style.setProperty('font-size', `${Math.round(prefs.fontScale * 100)}%`);
    }

    this.body.setAttribute('data-font-scale', String(prefs.fontScale));
    this.body.setAttribute('data-spacing-scale', String(prefs.spacingScale));

    // Apply CSS custom properties
    this.body.style.setProperty('--font-scale', String(prefs.fontScale));
    this.body.style.setProperty('--spacing-scale', String(prefs.spacingScale));

    // Apply body classes (for easier CSS targeting)
    // UI Density
    this.body.classList.remove('density-simple', 'density-medium', 'density-full');
    this.body.classList.add(`density-${prefs.uiDensity}`);

    // Focus Mode
    if (prefs.focusMode) {
      this.body.classList.add('focus-mode');
    } else {
      this.body.classList.remove('focus-mode');
    }

    // Content Mode
    this.body.classList.remove('content-summary', 'content-detailed');
    this.body.classList.add(`content-${prefs.contentMode}`);

    // Contrast
    this.body.classList.remove('contrast-low', 'contrast-normal', 'contrast-high');
    this.body.classList.add(`contrast-${prefs.contrast}`);

    // Motion
    this.body.classList.remove('motion-full', 'motion-reduced', 'motion-off');
    this.body.classList.add(`motion-${prefs.motion}`);
  }
}
