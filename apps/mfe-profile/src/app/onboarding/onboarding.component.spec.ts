import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { OnboardingComponent } from './onboarding.component';
import { PreferencesStore } from '@shared/state';

function mockPreferencesStore() {
  return {
    uiDensity: signal<'simple' | 'medium' | 'full'>('medium'),
    focusMode: signal(false),
    contrast: signal<'low' | 'normal' | 'high'>('normal'),
    contentMode: signal('detailed'),
    motion: signal('full'),
    fontScale: signal(1.0),
    spacingScale: signal(1.0),
    updatePreferences: jest.fn().mockResolvedValue(undefined),
    loadPreferences: jest.fn().mockResolvedValue(undefined),
  };
}

describe('OnboardingComponent', () => {
  let component: OnboardingComponent;
  let fixture: ComponentFixture<OnboardingComponent>;
  let router: Router;
  let prefsStore: ReturnType<typeof mockPreferencesStore>;

  beforeEach(async () => {
    localStorage.removeItem('onboarding-completed');
    prefsStore = mockPreferencesStore();

    await TestBed.configureTestingModule({
      imports: [OnboardingComponent],
      providers: [
        provideRouter([]),
        { provide: PreferencesStore, useValue: prefsStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OnboardingComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem('onboarding-completed');
  });

  // ─────────────────────────────────────────────────────────────
  // Creation & initial state
  // ─────────────────────────────────────────────────────────────
  describe('Initial State', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should start at welcome step', () => {
      expect(component.currentStep()).toBe('welcome');
    });

    it('should have currentStepIndex 0 on welcome', () => {
      expect(component.currentStepIndex()).toBe(0);
    });

    it('should set isFirstStep true initially', () => {
      expect(component.isFirstStep()).toBe(true);
    });

    it('should set isLastStep false initially', () => {
      expect(component.isLastStep()).toBe(false);
    });

    it('should have 3 steps', () => {
      expect(component.steps.length).toBe(3);
    });

    it('should have 4 tour cards', () => {
      expect(component.tourCards.length).toBe(4);
    });

    it('should default selectedDensity to medium', () => {
      expect(component.selectedDensity()).toBe('medium');
    });

    it('should default selectedFocusMode to false', () => {
      expect(component.selectedFocusMode()).toBe(false);
    });

    it('should default selectedContrast to normal', () => {
      expect(component.selectedContrast()).toBe('normal');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Redirect if already completed
  // ─────────────────────────────────────────────────────────────
  describe('Already completed redirect', () => {
    it('should redirect to dashboard if onboarding already completed', async () => {
      const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
      localStorage.setItem('onboarding-completed', 'true');

      component.ngOnInit();

      expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Navigation
  // ─────────────────────────────────────────────────────────────
  describe('Navigation', () => {
    it('should move to preferences on nextStep from welcome', async () => {
      await component.nextStep();
      expect(component.currentStep()).toBe('preferences');
    });

    it('should move to tour on nextStep from preferences', async () => {
      component.currentStep.set('preferences');
      await component.nextStep();
      expect(component.currentStep()).toBe('tour');
    });

    it('should go back to welcome from preferences on prevStep', () => {
      component.currentStep.set('preferences');
      component.prevStep();
      expect(component.currentStep()).toBe('welcome');
    });

    it('should go back to preferences from tour on prevStep', () => {
      component.currentStep.set('tour');
      component.prevStep();
      expect(component.currentStep()).toBe('preferences');
    });

    it('should not go back from first step', () => {
      component.prevStep();
      expect(component.currentStep()).toBe('welcome');
    });

    it('should set isLastStep true on tour step', () => {
      component.currentStep.set('tour');
      expect(component.isLastStep()).toBe(true);
    });

    it('should set isFirstStep false on preferences step', () => {
      component.currentStep.set('preferences');
      expect(component.isFirstStep()).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Skip & Complete
  // ─────────────────────────────────────────────────────────────
  describe('Skip and Complete', () => {
    it('should mark localStorage and navigate on skip', () => {
      const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

      component.skip();

      expect(localStorage.getItem('onboarding-completed')).toBe('true');
      expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should mark localStorage and navigate on complete', () => {
      const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

      component.complete();

      expect(localStorage.getItem('onboarding-completed')).toBe('true');
      expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should call complete when nextStep on last step', async () => {
      jest.spyOn(router, 'navigate').mockResolvedValue(true);
      component.currentStep.set('tour');

      await component.nextStep();

      expect(localStorage.getItem('onboarding-completed')).toBe('true');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Preferences
  // ─────────────────────────────────────────────────────────────
  describe('Preferences', () => {
    it('should update selectedDensity on selectDensity', () => {
      component.selectDensity('simple');
      expect(component.selectedDensity()).toBe('simple');
    });

    it('should toggle focusMode on toggleFocusMode', () => {
      component.toggleFocusMode();
      expect(component.selectedFocusMode()).toBe(true);
      component.toggleFocusMode();
      expect(component.selectedFocusMode()).toBe(false);
    });

    it('should update selectedContrast on selectContrast', () => {
      component.selectContrast('high');
      expect(component.selectedContrast()).toBe('high');
    });

    it('should call updatePreferences when advancing from step 2', async () => {
      component.currentStep.set('preferences');
      component.selectDensity('simple');
      component.selectContrast('high');

      await component.nextStep();

      expect(prefsStore.updatePreferences).toHaveBeenCalledWith({
        uiDensity: 'simple',
        focusMode: false,
        contrast: 'high',
      });
    });

    it('should NOT call updatePreferences when advancing from step 1', async () => {
      await component.nextStep(); // welcome → preferences
      expect(prefsStore.updatePreferences).not.toHaveBeenCalled();
    });
  });
});
