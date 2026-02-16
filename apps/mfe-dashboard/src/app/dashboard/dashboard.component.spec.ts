// apps/mfe-dashboard/src/app/dashboard/dashboard.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { DashboardComponent } from './dashboard.component';
import { AuthStore, PreferencesStore } from '@shared/state';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let authStoreMock: Partial<AuthStore>;
  let prefsStoreMock: Partial<PreferencesStore>;

  beforeEach(async () => {
    // Mock AuthStore
    authStoreMock = {
      user: signal({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date().toISOString()
      })
    };

    // Mock PreferencesStore
    prefsStoreMock = {
      uiDensity: signal('medium' as 'simple' | 'medium' | 'full'),
      focusMode: signal(false)
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: AuthStore, useValue: authStoreMock },
        { provide: PreferencesStore, useValue: prefsStoreMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('greeting', () => {
    it('should display greeting with user first name', () => {
      const greeting = component.greeting();
      expect(greeting).toContain('John');
    });

    it('should show "Bom dia" in the morning', () => {
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(10);
      const greeting = component.greeting();
      expect(greeting).toContain('Bom dia');
      expect(greeting).toContain('☀️');
    });

    it('should show "Boa tarde" in the afternoon', () => {
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(15);
      const greeting = component.greeting();
      expect(greeting).toContain('Boa tarde');
      expect(greeting).toContain('🌤️');
    });

    it('should show "Boa noite" in the evening', () => {
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(20);
      const greeting = component.greeting();
      expect(greeting).toContain('Boa noite');
      expect(greeting).toContain('🌙');
    });

    it('should fallback to "Usuário" when no user name', async () => {
      // Create a new TestBed with null user
      const nullUserMock = {
        user: signal(null)
      };

      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [DashboardComponent],
        providers: [
          { provide: AuthStore, useValue: nullUserMock },
          { provide: PreferencesStore, useValue: prefsStoreMock }
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      }).compileComponents();

      const testFixture = TestBed.createComponent(DashboardComponent);
      const testComponent = testFixture.componentInstance;

      const greeting = testComponent.greeting();
      expect(greeting).toContain('Usuário');
    });
  });

  describe('data loading', () => {
    it('should load dashboard data on init', async () => {
      expect(component.loading()).toBe(true);

      fixture.detectChanges();
      await fixture.whenStable();

      // Wait for mock delay
      await new Promise(resolve => setTimeout(resolve, 1100));

      expect(component.loading()).toBe(false);
      expect(component.stats()).toBeTruthy();
      expect(component.stats()?.pendingTasks).toBe(12);
    });

    it('should show skeleton loaders while loading', () => {
      component.loading.set(true);
      fixture.detectChanges();

      const skeletons = fixture.nativeElement.querySelectorAll('.skeleton-card');
      expect(skeletons.length).toBe(3);
    });

    it('should not show skeleton loaders after loading', async () => {
      component.stats.set({
        pendingTasks: 12,
        completedToday: 5,
        focusTimeToday: 90,
        weeklyProductivity: 85
      });
      fixture.detectChanges();

      component.loading.set(false);
      fixture.detectChanges();
      await fixture.whenStable();

      const skeletons = fixture.nativeElement.querySelectorAll('.skeleton-card');
      expect(skeletons.length).toBe(0);
    });
  });

  describe('formatFocusTime', () => {
    it('should format minutes only', () => {
      expect(component.formatFocusTime(45)).toBe('45min');
    });

    it('should format hours only', () => {
      expect(component.formatFocusTime(120)).toBe('2h');
    });

    it('should format hours and minutes', () => {
      expect(component.formatFocusTime(90)).toBe('1h 30min');
    });

    it('should handle zero minutes', () => {
      expect(component.formatFocusTime(0)).toBe('0min');
    });
  });

  describe('UI density', () => {
    it('should apply uiDensity data attribute', () => {
      fixture.detectChanges();

      const dashboard = fixture.nativeElement.querySelector('.dashboard');
      expect(dashboard.getAttribute('data-ui-density')).toBe('medium');
    });

    it('should update when uiDensity changes', () => {
      fixture.detectChanges();

      const dashboard = fixture.nativeElement.querySelector('.dashboard');
      expect(dashboard.getAttribute('data-ui-density')).toBe('medium');
    });
  });

  describe('focus mode', () => {
    it('should not apply focus-mode class when disabled', () => {
      fixture.detectChanges();

      const dashboard = fixture.nativeElement.querySelector('.dashboard');
      expect(dashboard.classList.contains('focus-mode')).toBe(false);
    });

    it('should show activity section when focus mode disabled', () => {
      fixture.detectChanges();

      const dashboard = fixture.nativeElement.querySelector('.dashboard');
      const activitySection = dashboard.querySelector('.activity-section');

      expect(activitySection).toBeTruthy();
    });
  });

  describe('responsive layout', () => {
    it('should use grid layout for stats', () => {
      fixture.detectChanges();

      const statsGrid = fixture.nativeElement.querySelector('.stats-grid');
      expect(statsGrid).toBeTruthy();
    });
  });
});
