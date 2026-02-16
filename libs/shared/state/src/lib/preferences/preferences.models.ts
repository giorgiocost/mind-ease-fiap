/**
 * Preferences Models
 *
 * Type definitions for cognitive accessibility preferences.
 * Based on ADR-003: Cognitive Tokens
 */

export type UiDensity = 'simple' | 'medium' | 'full';
export type ContentMode = 'summary' | 'detailed';
export type Contrast = 'low' | 'normal' | 'high';
export type FontScale = 0.9 | 1.0 | 1.1 | 1.2 | 1.3 | 1.4;
export type SpacingScale = 0.9 | 1.0 | 1.1 | 1.2 | 1.3 | 1.4;
export type Motion = 'full' | 'reduced' | 'off';

/**
 * Cognitive accessibility preferences interface
 */
export interface CognitivePreferences {
  uiDensity: UiDensity;
  focusMode: boolean;
  contentMode: ContentMode;
  contrast: Contrast;
  fontScale: FontScale;
  spacingScale: SpacingScale;
  motion: Motion;
}

/**
 * API response for GET /preferences
 */
export interface PreferencesResponse {
  data: CognitivePreferences;
}

/**
 * Request body for PUT /preferences (partial update)
 */
export interface UpdatePreferencesRequest {
  uiDensity?: UiDensity;
  focusMode?: boolean;
  contentMode?: ContentMode;
  contrast?: Contrast;
  fontScale?: FontScale;
  spacingScale?: SpacingScale;
  motion?: Motion;
}

/**
 * Default preferences configuration
 * Medium density, normal contrast, full motion, 1.0 scales
 */
export const DEFAULT_PREFERENCES: CognitivePreferences = {
  uiDensity: 'medium',
  focusMode: false,
  contentMode: 'detailed',
  contrast: 'normal',
  fontScale: 1.0,
  spacingScale: 1.0,
  motion: 'full'
};
