import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { ProfileSettingsComponent } from './profile-settings.component';
import { AuthStore, PreferencesStore } from '@shared/state';
import { DEFAULT_PREFERENCES } from '@shared/state';

function mockAuthStore() {
  const _user = signal<{ id: string; name: string; email: string } | null>({
    id: '1',
    name: 'João Silva',
    email: 'joao@example.com'
  });
  return {
    user: _user.asReadonly(),
    isAuthenticated: signal(true),
    loading: signal(false),
    error: signal(null),
    updateUser: jest.fn(),
    logout: jest.fn(),
  };
}

function mockPreferencesStore() {
  return {
    preferences: signal(DEFAULT_PREFERENCES),
    uiDensity: signal(DEFAULT_PREFERENCES.uiDensity),
    focusMode: signal(DEFAULT_PREFERENCES.focusMode),
    contrast: signal(DEFAULT_PREFERENCES.contrast),
    motion: signal(DEFAULT_PREFERENCES.motion),
    loadFromApi: jest.fn().mockResolvedValue(undefined),
    updatePreferences: jest.fn().mockResolvedValue(undefined),
  };
}

describe('ProfileSettingsComponent', () => {
  let component: ProfileSettingsComponent;
  let fixture: ComponentFixture<ProfileSettingsComponent>;
  let router: Router;
  let authStore: ReturnType<typeof mockAuthStore>;
  let prefsStore: ReturnType<typeof mockPreferencesStore>;

  beforeEach(async () => {
    authStore = mockAuthStore();
    prefsStore = mockPreferencesStore();

    await TestBed.configureTestingModule({
      imports: [ProfileSettingsComponent],
      providers: [
        provideRouter([]),
        { provide: AuthStore, useValue: authStore },
        { provide: PreferencesStore, useValue: prefsStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileSettingsComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  // ─────────────────────────────────────────────────────────────
  // Creation
  // ─────────────────────────────────────────────────────────────
  describe('Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize profileForm', () => {
      expect(component.profileForm).toBeDefined();
    });

    it('should initialize passwordForm', () => {
      expect(component.passwordForm).toBeDefined();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Profile form pre-fill
  // ─────────────────────────────────────────────────────────────
  describe('Profile form initialization', () => {
    it('should pre-fill name from user', () => {
      expect(component.profileForm.get('name')?.value).toBe('João Silva');
    });

    it('should pre-fill email from user', () => {
      expect(component.profileForm.get('email')?.value).toBe('joao@example.com');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Profile form validation
  // ─────────────────────────────────────────────────────────────
  describe('Profile form validation', () => {
    it('should be valid with correct data', () => {
      expect(component.profileForm.valid).toBe(true);
    });

    it('should be invalid with name too short', () => {
      component.profileForm.get('name')?.setValue('AB');
      expect(component.profileForm.get('name')?.invalid).toBe(true);
    });

    it('should be invalid with empty name', () => {
      component.profileForm.get('name')?.setValue('');
      expect(component.profileForm.get('name')?.invalid).toBe(true);
    });

    it('should be invalid with malformed email', () => {
      component.profileForm.get('email')?.setValue('not-an-email');
      expect(component.profileForm.get('email')?.invalid).toBe(true);
    });

    it('should be valid with correct email', () => {
      component.profileForm.get('email')?.setValue('test@domain.com');
      expect(component.profileForm.get('email')?.valid).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Password form validation
  // ─────────────────────────────────────────────────────────────
  describe('Password form validation', () => {
    it('should be invalid with short password', () => {
      component.passwordForm.patchValue({
        currentPassword: 'abc',
        newPassword: 'short',
        confirmPassword: 'short'
      });
      expect(component.passwordForm.get('newPassword')?.invalid).toBe(true);
    });

    it('should have passwordMismatch error when passwords differ', () => {
      component.passwordForm.patchValue({
        currentPassword: 'current123',
        newPassword: 'newpassword1',
        confirmPassword: 'different123'
      });
      expect(component.passwordForm.hasError('passwordMismatch')).toBe(true);
    });

    it('should not have passwordMismatch when passwords match', () => {
      component.passwordForm.patchValue({
        currentPassword: 'current123',
        newPassword: 'newpassword1',
        confirmPassword: 'newpassword1'
      });
      expect(component.passwordForm.hasError('passwordMismatch')).toBe(false);
    });

    it('should be valid with matching passwords ≥8 chars', () => {
      component.passwordForm.patchValue({
        currentPassword: 'current123',
        newPassword: 'newpassword1',
        confirmPassword: 'newpassword1'
      });
      expect(component.passwordForm.valid).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // saveProfile
  // ─────────────────────────────────────────────────────────────
  describe('saveProfile()', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('should not call updateUser when form is invalid', async () => {
      component.profileForm.get('name')?.setValue('');
      await component.saveProfile();
      expect(authStore.updateUser).not.toHaveBeenCalled();
    });

    it('should call authStore.updateUser with form values', async () => {
      component.profileForm.patchValue({ name: 'Maria Costa', email: 'maria@example.com' });

      const savePromise = component.saveProfile();
      jest.runAllTimers();
      await savePromise;

      expect(authStore.updateUser).toHaveBeenCalledWith({
        name: 'Maria Costa',
        email: 'maria@example.com'
      });
    });

    it('should set profileSaved to true after success', async () => {
      const savePromise = component.saveProfile();
      jest.runAllTimers();
      await savePromise;

      expect(component.profileSaved()).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // changePassword
  // ─────────────────────────────────────────────────────────────
  describe('changePassword()', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('should not change password when form is invalid', async () => {
      const spy = jest.spyOn(component, 'changePassword');
      component.passwordForm.reset();
      await component.changePassword();
      expect(component.passwordChanged()).toBe(false);
    });

    it('should set passwordChanged to true after success', async () => {
      component.passwordForm.patchValue({
        currentPassword: 'oldpass123',
        newPassword: 'newpass123',
        confirmPassword: 'newpass123'
      });

      const changePromise = component.changePassword();
      jest.runAllTimers();
      await changePromise;

      expect(component.passwordChanged()).toBe(true);
    });

    it('should reset password form after success', async () => {
      component.passwordForm.patchValue({
        currentPassword: 'oldpass123',
        newPassword: 'newpass123',
        confirmPassword: 'newpass123'
      });

      const changePromise = component.changePassword();
      jest.runAllTimers();
      await changePromise;

      expect(component.passwordForm.get('currentPassword')?.value).toBeFalsy();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Preferences
  // ─────────────────────────────────────────────────────────────
  describe('Preferences', () => {
    it('should call preferencesStore.loadPreferences on resyncPreferences', async () => {
      await component.resyncPreferences();
      expect(prefsStore.loadFromApi).toHaveBeenCalled();
    });

    it('should navigate to /dashboard on navigateToPreferences', () => {
      const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
      component.navigateToPreferences();
      expect(navigateSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'preferences' });
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Logout
  // ─────────────────────────────────────────────────────────────
  describe('logout()', () => {
    it('should call authStore.logout and navigate to /login', () => {
      const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
      component.logout();
      expect(authStore.logout).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    });
  });
});
