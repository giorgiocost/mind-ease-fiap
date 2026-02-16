// apps/mfe-dashboard/src/app/components/preferences-panel/preferences-panel.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { PreferencesPanelComponent } from './preferences-panel.component';
import { PreferencesStore, DEFAULT_PREFERENCES } from '@shared/state';

// Manual mock for PreferencesStore
class MockPreferencesStore {
  preferences = signal(DEFAULT_PREFERENCES);
  uiDensity = signal(DEFAULT_PREFERENCES.uiDensity);
  focusMode = signal(DEFAULT_PREFERENCES.focusMode);
  contentMode = signal(DEFAULT_PREFERENCES.contentMode);
  contrast = signal(DEFAULT_PREFERENCES.contrast);
  fontScale = signal(DEFAULT_PREFERENCES.fontScale);
  spacingScale = signal(DEFAULT_PREFERENCES.spacingScale);
  motion = signal(DEFAULT_PREFERENCES.motion);

  updatePreferences = jest.fn().mockResolvedValue(undefined);
  resetToDefaults = jest.fn().mockResolvedValue(undefined);
}

describe('PreferencesPanelComponent', () => {
  let component: PreferencesPanelComponent;
  let fixture: ComponentFixture<PreferencesPanelComponent>;
  let mockPreferencesStore: MockPreferencesStore;

  beforeEach(async () => {
    mockPreferencesStore = new MockPreferencesStore();

    await TestBed.configureTestingModule({
      imports: [PreferencesPanelComponent],
      providers: [
        { provide: PreferencesStore, useValue: mockPreferencesStore }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PreferencesPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all preset buttons', () => {
    const presetButtons = fixture.nativeElement.querySelectorAll('.preset-button');
    expect(presetButtons.length).toBe(3);

    const presetNames = Array.from(presetButtons).map(btn => btn.textContent?.trim());
    expect(presetNames).toEqual(['Foco Máximo', 'Leitura Confortável', 'Padrão']);
  });

  it('should display UI density control with correct active state', () => {
    const densityButtons = fixture.nativeElement.querySelectorAll(
      '.control-group:has([aria-labelledby="ui-density"]) .button-group button'
    );
    expect(densityButtons.length).toBe(3);

    // Check default state (medium should be active)
    const activeButton = fixture.nativeElement.querySelector(
      '.control-group:has([aria-labelledby="ui-density"]) .button-group button.active'
    );
    expect(activeButton?.textContent?.trim()).toBe('Médio');
  });

  it('should display focus mode toggle with correct state', () => {
    const focusToggle = fixture.nativeElement.querySelector('#focus-mode');
    expect(focusToggle).toBeTruthy();
    expect(focusToggle.checked).toBe(DEFAULT_PREFERENCES.focusMode);

    const description = fixture.nativeElement.querySelector('.toggle-description');
    expect(description?.textContent?.trim()).toBe('Inativo');
  });

  it('should display content mode control', () => {
    const contentButtons = fixture.nativeElement.querySelectorAll(
      '.control-group:has([aria-labelledby="content-mode"]) .button-group button'
    );
    expect(contentButtons.length).toBe(2);

    const buttonTexts = Array.from(contentButtons).map(btn => btn.textContent?.trim());
    expect(buttonTexts).toEqual(['Resumo', 'Detalhado']);
  });

  it('should display contrast control', () => {
    const contrastButtons = fixture.nativeElement.querySelectorAll(
      '.control-group:has([aria-labelledby="contrast"]) .button-group button'
    );
    expect(contrastButtons.length).toBe(3);

    const buttonTexts = Array.from(contrastButtons).map(btn => btn.textContent?.trim());
    expect(buttonTexts).toEqual(['Baixo', 'Normal', 'Alto']);
  });

  it('should display font scale slider with current value', () => {
    const fontSlider = fixture.nativeElement.querySelector('#font-scale');
    expect(fontSlider).toBeTruthy();
    expect(fontSlider.value).toBe(DEFAULT_PREFERENCES.fontScale.toFixed(1));

    const valueDisplay = fixture.nativeElement.querySelector(
      '.control-group:has(#font-scale) .slider-value'
    );
    expect(valueDisplay?.textContent?.trim()).toBe(`${DEFAULT_PREFERENCES.fontScale}x`);
  });

  it('should display spacing scale slider with current value', () => {
    const spacingSlider = fixture.nativeElement.querySelector('#spacing-scale');
    expect(spacingSlider).toBeTruthy();
    expect(spacingSlider.value).toBe(DEFAULT_PREFERENCES.spacingScale.toFixed(1));

    const valueDisplay = fixture.nativeElement.querySelector(
      '.control-group:has(#spacing-scale) .slider-value'
    );
    expect(valueDisplay?.textContent?.trim()).toBe(`${DEFAULT_PREFERENCES.spacingScale}x`);
  });

  it('should display motion control', () => {
    const motionButtons = fixture.nativeElement.querySelectorAll(
      '.control-group:has([aria-labelledby="motion"]) .button-group button'
    );
    expect(motionButtons.length).toBe(3);

    const buttonTexts = Array.from(motionButtons).map(btn => btn.textContent?.trim());
    expect(buttonTexts).toEqual(['Completas', 'Reduzidas', 'Desligadas']);
  });

  it('should call updateUiDensity when density button is clicked', async () => {
    const simpleButton = fixture.nativeElement.querySelector(
      '.control-group:has([aria-labelledby="ui-density"]) .button-group button'
    );

    simpleButton.click();
    await fixture.whenStable();

    expect(mockPreferencesStore.updatePreferences).toHaveBeenCalledWith({
      uiDensity: 'simple'
    });
  });

  it('should call toggleFocusMode when toggle is clicked', async () => {
    const focusToggle = fixture.nativeElement.querySelector('#focus-mode');

    focusToggle.click();
    await fixture.whenStable();

    expect(mockPreferencesStore.updatePreferences).toHaveBeenCalledWith({
      focusMode: !DEFAULT_PREFERENCES.focusMode
    });
  });

  it('should call updateFontScale when slider changes', async () => {
    const fontSlider = fixture.nativeElement.querySelector('#font-scale');

    fontSlider.value = '1.2';
    fontSlider.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(mockPreferencesStore.updatePreferences).toHaveBeenCalledWith({
      fontScale: 1.2
    });
  });

  it('should apply preset when preset button is clicked', async () => {
    const focusPresetButton = fixture.nativeElement.querySelector('.preset-button');

    focusPresetButton.click();
    await fixture.whenStable();

    expect(mockPreferencesStore.updatePreferences).toHaveBeenCalledWith({
      uiDensity: 'simple',
      focusMode: true,
      contentMode: 'summary',
      contrast: 'high',
      fontScale: 1.0,
      spacingScale: 1.0,
      motion: 'off'
    });
  });

  it('should show loading state when applying preset', async () => {
    const presetButton = fixture.nativeElement.querySelector('.preset-button');

    // Make the update promise pending
    let resolvePromise: () => void;
    const updatePromise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });
    mockPreferencesStore.updatePreferences.mockReturnValue(updatePromise);

    // Click the button to start loading
    presetButton.click();
    fixture.detectChanges();

    // Should be in loading state
    expect(component.saving()).toBe(true);
    expect(presetButton.classList.contains('loading')).toBe(true);

    // Resolve the promise
    resolvePromise!();
    await updatePromise;
    fixture.detectChanges();

    // Should no longer be loading
    expect(component.saving()).toBe(false);
  });

  it('should call resetToDefaults when reset button is clicked', async () => {
    const resetButton = fixture.nativeElement.querySelector('ui-button');

    resetButton.click();
    await fixture.whenStable();

    expect(mockPreferencesStore.resetToDefaults).toHaveBeenCalled();
  });

  it('should have proper ARIA attributes', () => {
    // Check radiogroups have proper ARIA attributes
    const radioGroups = fixture.nativeElement.querySelectorAll('[role="radiogroup"]');
    radioGroups.forEach((group: Element) => {
      expect(group.getAttribute('aria-labelledby')).toBeTruthy();
    });

    // Check radio buttons have proper ARIA attributes
    const radioButtons = fixture.nativeElement.querySelectorAll('[role="radio"]');
    radioButtons.forEach((button: Element) => {
      expect(button.getAttribute('aria-checked')).toMatch(/true|false/);
    });

    // Check toggle has proper labeling
    const focusToggle = fixture.nativeElement.querySelector('#focus-mode');
    expect(focusToggle?.getAttribute('aria-describedby')).toBe('focus-mode-desc');
  });

  it('should display current preference values correctly', () => {
    // Update store values
    mockPreferencesStore.fontScale.set(1.3);
    mockPreferencesStore.spacingScale.set(1.1);
    mockPreferencesStore.focusMode.set(true);
    fixture.detectChanges();

    const fontValue = fixture.nativeElement.querySelector(
      '.control-group:has(#font-scale) .slider-value'
    );
    expect(fontValue?.textContent?.trim()).toBe('1.3x');

    const spacingValue = fixture.nativeElement.querySelector(
      '.control-group:has(#spacing-scale) .slider-value'
    );
    expect(spacingValue?.textContent?.trim()).toBe('1.1x');

    const focusDesc = fixture.nativeElement.querySelector('.toggle-description');
    expect(focusDesc?.textContent?.trim()).toBe('Ativo');
  });
});
