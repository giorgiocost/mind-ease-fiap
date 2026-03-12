import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PreferencesStore } from '@shared/state';
import { PomodoroComponent } from './pomodoro.component';

function mockPreferencesStore() {
  return {
    focusMode: signal(false),
    motion: signal('enabled' as const),
    uiDensity: signal('comfortable' as const),
    contentMode: signal('classic' as const),
  };
}

describe('PomodoroComponent', () => {
  let component: PomodoroComponent;
  let fixture: ComponentFixture<PomodoroComponent>;

  beforeEach(async () => {
    // Clear localStorage before each test
    localStorage.removeItem('pomodoro-sessions');
    localStorage.removeItem('pomodoro-timer-state');

    await TestBed.configureTestingModule({
      imports: [PomodoroComponent],
      providers: [
        { provide: PreferencesStore, useValue: mockPreferencesStore() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PomodoroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    component.ngOnDestroy();
    localStorage.removeItem('pomodoro-sessions');
    localStorage.removeItem('pomodoro-timer-state');
  });

  // ─────────────────────────────────────────────────────────────
  // Initial State
  // ─────────────────────────────────────────────────────────────
  describe('Initial State', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should start in work mode', () => {
      expect(component.mode()).toBe('work');
    });

    it('should display 25:00 initially', () => {
      expect(component.formattedTime()).toBe('25:00');
    });

    it('should not be running initially', () => {
      expect(component.isRunning()).toBe(false);
    });

    it('should have zero completed sessions initially', () => {
      expect(component.sessionsCompleted()).toBe(0);
    });

    it('should have full strokeDashoffset initially (no progress)', () => {
      const expected = component.circumference;
      expect(component.strokeDashoffset()).toBeCloseTo(expected, 0);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Mode labels and icons
  // ─────────────────────────────────────────────────────────────
  describe('Mode Labels & Icons', () => {
    it('should return correct label for work mode', () => {
      component.changeMode('work');
      expect(component.modeLabel()).toBe('Trabalho');
    });

    it('should return correct label for short-break mode', () => {
      component.changeMode('short-break');
      expect(component.modeLabel()).toBe('Pausa Curta');
    });

    it('should return correct label for long-break mode', () => {
      component.changeMode('long-break');
      expect(component.modeLabel()).toBe('Pausa Longa');
    });

    it('should return 🍅 icon for work mode', () => {
      component.changeMode('work');
      expect(component.modeIcon()).toBe('🍅');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Timer Controls
  // ─────────────────────────────────────────────────────────────
  describe('Timer Controls', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('should set isRunning to true when started', () => {
      component.start();
      expect(component.isRunning()).toBe(true);
      component.pause();
    });

    it('should decrement timeRemaining every second', () => {
      component.start();
      jest.advanceTimersByTime(3000);
      expect(component.timeRemaining()).toBe(25 * 60 - 3);
      component.pause();
    });

    it('should stop decrementing when paused', () => {
      component.start();
      jest.advanceTimersByTime(2000);
      component.pause();
      const remaining = component.timeRemaining();
      jest.advanceTimersByTime(2000);
      expect(component.timeRemaining()).toBe(remaining);
    });

    it('should reset to full duration', () => {
      component.start();
      jest.advanceTimersByTime(5000);
      component.reset();
      expect(component.timeRemaining()).toBe(25 * 60);
      expect(component.isRunning()).toBe(false);
    });

    it('should not start a second interval if already running', () => {
      component.start();
      component.start(); // second call should be no-op
      jest.advanceTimersByTime(1000);
      expect(component.timeRemaining()).toBe(25 * 60 - 1);
      component.pause();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Mode Changes
  // ─────────────────────────────────────────────────────────────
  describe('Mode Changes', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('should set 5:00 when switching to short-break', () => {
      component.changeMode('short-break');
      expect(component.timeRemaining()).toBe(5 * 60);
      expect(component.formattedTime()).toBe('05:00');
    });

    it('should set 15:00 when switching to long-break', () => {
      component.changeMode('long-break');
      expect(component.timeRemaining()).toBe(15 * 60);
      expect(component.formattedTime()).toBe('15:00');
    });

    it('should stop running when mode changes', () => {
      component.start();
      jest.advanceTimersByTime(1000);
      component.changeMode('short-break');
      expect(component.isRunning()).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Progress & strokeDashoffset
  // ─────────────────────────────────────────────────────────────
  describe('Progress Calculation', () => {
    it('should calculate 50% progress correctly', () => {
      const halfDuration = 25 * 60 / 2;
      component['timeRemaining'].set(halfDuration);
      expect(component.progress()).toBeCloseTo(50, 0);
    });

    it('should calculate strokeDashoffset at 50% correctly', () => {
      const halfDuration = 25 * 60 / 2;
      component['timeRemaining'].set(halfDuration);
      const expected = component.circumference * 0.5;
      expect(component.strokeDashoffset()).toBeCloseTo(expected, 0);
    });

    it('should show 0% progress when no time has elapsed', () => {
      expect(component.progress()).toBeCloseTo(0, 0);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Session Tracking
  // ─────────────────────────────────────────────────────────────
  describe('Session Tracking', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('should increment sessionsCompleted when work session completes', () => {
      component['timeRemaining'].set(1);
      component.start();
      jest.advanceTimersByTime(2100); // tick1: 1→0, tick2: complete()
      expect(component.sessionsCompleted()).toBe(1);
    });

    it('should switch to short-break after 1st work session', () => {
      component['timeRemaining'].set(1);
      component.start();
      jest.advanceTimersByTime(2100);
      expect(component.mode()).toBe('short-break');
    });

    it('should switch to work after short-break completes', () => {
      component.changeMode('short-break');
      component['timeRemaining'].set(1);
      component.start();
      jest.advanceTimersByTime(2100);
      expect(component.mode()).toBe('work');
    });

    it('should track focusedMinutes as sessionsCompleted * 25', () => {
      jest.useRealTimers();
      component['sessionsCompleted'].set(3);
      expect(component.focusedMinutes()).toBe(75);
    });

    it('should clear history when clearHistory() is called', () => {
      jest.useRealTimers();
      component['sessionsCompleted'].set(5);
      component.clearHistory();
      expect(component.sessionsCompleted()).toBe(0);
      expect(localStorage.getItem('pomodoro-sessions')).toBeNull();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Formatted Time
  // ─────────────────────────────────────────────────────────────
  describe('Formatted Time', () => {
    it('should pad minutes and seconds with leading zeros', () => {
      component['timeRemaining'].set(65); // 1 min 5 sec
      expect(component.formattedTime()).toBe('01:05');
    });

    it('should show 00:00 when time is up', () => {
      component['timeRemaining'].set(0);
      expect(component.formattedTime()).toBe('00:00');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Duration per Mode
  // ─────────────────────────────────────────────────────────────
  describe('getCurrentDuration', () => {
    it('should return 1500 for work mode', () => {
      component['mode'].set('work');
      expect(component.getCurrentDuration()).toBe(1500);
    });

    it('should return 300 for short-break mode', () => {
      component['mode'].set('short-break');
      expect(component.getCurrentDuration()).toBe(300);
    });

    it('should return 900 for long-break mode', () => {
      component['mode'].set('long-break');
      expect(component.getCurrentDuration()).toBe(900);
    });
  });
});
