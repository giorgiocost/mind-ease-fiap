import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CognitivePreferences, DEFAULT_PREFERENCES, PreferencesStore } from '@shared/state';

interface PreferencesPreset {
  name: string;
  preferences: CognitivePreferences;
}

/**
 * 🎛️ PreferencesComponent
 *
 * Full-page preferences settings for cognitive accessibility and UI customization.
 */
@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './preferences.component.html',
  styleUrl: './preferences.component.scss'
})
export class PreferencesComponent {
  private prefsStore = inject(PreferencesStore);

  // State
  saving = signal(false);

  // Computed (two-way binding with store)
  uiDensity = computed(() => this.prefsStore.uiDensity());
  focusMode = computed(() => this.prefsStore.focusMode());
  wipLimitEnabled = computed(() => this.prefsStore.wipLimitEnabled());
  contentMode = computed(() => this.prefsStore.contentMode());
  contrast = computed(() => this.prefsStore.contrast());
  fontScale = computed(() => this.prefsStore.fontScale());
  spacingScale = computed(() => this.prefsStore.spacingScale());
  motion = computed(() => this.prefsStore.motion());

  // Compute selected preset based on current preferences
  selectedPreset = computed(() => {
    const current = {
      uiDensity: this.uiDensity(),
      focusMode: this.focusMode(),
      wipLimitEnabled: this.wipLimitEnabled(),
      contentMode: this.contentMode(),
      contrast: this.contrast(),
      fontScale: this.fontScale(),
      spacingScale: this.spacingScale(),
      motion: this.motion()
    };

    // Check which preset matches the current state
    for (const preset of this.presets) {
      if (this.preferencesMatch(current, preset.preferences)) {
        return preset.name;
      }
    }

    return null; // No preset matches (custom settings)
  });

  // Helper method to compare preferences
  private preferencesMatch(current: CognitivePreferences, target: CognitivePreferences): boolean {
    // Normalize numeric values to handle string/number comparison issues from localStorage
    const normalizeNumber = (val: string | number): number => typeof val === 'string' ? parseFloat(val) : val;

    return (
      current.uiDensity === target.uiDensity &&
      current.focusMode === target.focusMode &&
      current.wipLimitEnabled === target.wipLimitEnabled &&
      current.contentMode === target.contentMode &&
      current.contrast === target.contrast &&
      normalizeNumber(current.fontScale) === normalizeNumber(target.fontScale) &&
      normalizeNumber(current.spacingScale) === normalizeNumber(target.spacingScale) &&
      current.motion === target.motion
    );
  }

  // Presets
  presets: PreferencesPreset[] = [
    {
      name: 'Foco Máximo',
      preferences: {
        uiDensity: 'simple',
        focusMode: true,
        wipLimitEnabled: true,
        contentMode: 'summary',
        contrast: 'high',
        fontScale: 1.0,
        spacingScale: 1.0,
        motion: 'off'
      }
    },
    {
      name: 'Leitura Confortável',
      preferences: {
        uiDensity: 'medium',
        focusMode: false,
        wipLimitEnabled: true,
        contentMode: 'detailed',
        contrast: 'normal',
        fontScale: 1.2,
        spacingScale: 1.1,
        motion: 'reduced'
      }
    },
    {
      name: 'Padrão',
      preferences: DEFAULT_PREFERENCES
    }
  ];

  // Actions
  async updateUiDensity(value: 'simple' | 'medium' | 'full') {
    await this.prefsStore.updatePreferences({ uiDensity: value });
  }

  async toggleFocusMode() {
    await this.prefsStore.updatePreferences({ focusMode: !this.focusMode() });
  }

  async toggleWipLimit() {
    await this.prefsStore.updatePreferences({ wipLimitEnabled: !this.wipLimitEnabled() });
  }

  async updateContentMode(value: 'summary' | 'detailed') {
    await this.prefsStore.updatePreferences({ contentMode: value });
  }

  async updateContrast(value: 'low' | 'normal' | 'high') {
    await this.prefsStore.updatePreferences({ contrast: value });
  }

  async updateFontScale(event: Event) {
    const value = parseFloat((event.target as HTMLInputElement).value) as 0.9 | 1.0 | 1.1 | 1.2 | 1.3 | 1.4;
    await this.prefsStore.updatePreferences({ fontScale: value });
  }

  async updateSpacingScale(event: Event) {
    const value = parseFloat((event.target as HTMLInputElement).value) as 0.9 | 1.0 | 1.1 | 1.2 | 1.3 | 1.4;
    await this.prefsStore.updatePreferences({ spacingScale: value });
  }

  async updateMotion(value: 'full' | 'reduced' | 'off') {
    await this.prefsStore.updatePreferences({ motion: value });
  }

  async applyPreset(preset: PreferencesPreset) {
    this.saving.set(true);
    try {
      await this.prefsStore.updatePreferences(preset.preferences);
    } finally {
      this.saving.set(false);
    }
  }

  async resetToDefaults() {
    this.saving.set(true);
    try {
      await this.prefsStore.updatePreferences(DEFAULT_PREFERENCES);
    } finally {
      this.saving.set(false);
    }
  }

  handleRadioKeydown(event: KeyboardEvent): void {
    const group = (event.currentTarget as HTMLElement);
    const buttons = Array.from(group.querySelectorAll<HTMLElement>('button[role="radio"]'));
    const currentIndex = buttons.indexOf(event.target as HTMLElement);
    if (currentIndex === -1) return;

    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      nextIndex = (currentIndex + 1) % buttons.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
    }

    if (nextIndex !== null) {
      buttons[nextIndex].focus();
      buttons[nextIndex].click();
    }
  }
}
