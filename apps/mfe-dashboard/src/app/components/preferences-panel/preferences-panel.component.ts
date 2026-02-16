// apps/mfe-dashboard/src/app/components/preferences-panel/preferences-panel.component.ts
import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PreferencesStore, CognitivePreferences, DEFAULT_PREFERENCES } from '@shared/state';
import { ButtonComponent } from '@shared/ui';

interface PreferencesPreset {
  name: string;
  preferences: CognitivePreferences;
}

@Component({
  selector: 'app-preferences-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './preferences-panel.component.html',
  styleUrls: ['./preferences-panel.component.scss']
})
export class PreferencesPanelComponent {
  private prefsStore = inject(PreferencesStore);

  // State
  saving = signal(false);

  // Computed (two-way binding with store)
  preferences = computed(() => this.prefsStore.preferences());
  uiDensity = computed(() => this.prefsStore.uiDensity());
  focusMode = computed(() => this.prefsStore.focusMode());
  contentMode = computed(() => this.prefsStore.contentMode());
  contrast = computed(() => this.prefsStore.contrast());
  fontScale = computed(() => this.prefsStore.fontScale());
  spacingScale = computed(() => this.prefsStore.spacingScale());
  motion = computed(() => this.prefsStore.motion());

  // Presets
  presets: PreferencesPreset[] = [
    {
      name: 'Foco Máximo',
      preferences: {
        uiDensity: 'simple',
        focusMode: true,
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
      await this.prefsStore.resetToDefaults();
    } finally {
      this.saving.set(false);
    }
  }
}
