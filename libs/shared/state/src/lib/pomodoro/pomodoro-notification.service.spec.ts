import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PomodoroNotificationService } from './pomodoro-notification.service';

describe('PomodoroNotificationService', () => {
  let service: PomodoroNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PomodoroNotificationService],
    });
    service = TestBed.inject(PomodoroNotificationService);
  });

  // ---- creation -------------------------------------------------------

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ---- toast ----------------------------------------------------------

  describe('toast signal', () => {
    it('starts as null', () => {
      expect(service.toast()).toBeNull();
    });

    it('show() sets the toast immediately', () => {
      service.show({ message: 'Você iniciou o pomodoro 🍅', icon: '🍅', type: 'start' });
      expect(service.toast()).toEqual({ message: 'Você iniciou o pomodoro 🍅', icon: '🍅', type: 'start' });
    });

    it('show() auto-hides the toast after 4 000 ms', fakeAsync(() => {
      service.show({ message: 'Test', icon: '✅', type: 'start' });
      expect(service.toast()).not.toBeNull();

      tick(3999);
      expect(service.toast()).not.toBeNull(); // still visible

      tick(1);
      expect(service.toast()).toBeNull(); // now hidden
    }));

    it('show() called twice resets the hide timer', fakeAsync(() => {
      service.show({ message: 'First', icon: '1', type: 'start' });
      tick(2000); // halfway through

      service.show({ message: 'Second', icon: '2', type: 'end' });
      expect(service.toast()?.message).toBe('Second');

      tick(3999);
      expect(service.toast()).not.toBeNull(); // timer was reset

      tick(1);
      expect(service.toast()).toBeNull();
    }));

    it('toast is null after 4 000 ms even when shown twice rapidly', fakeAsync(() => {
      service.show({ message: 'A', icon: '', type: 'start' });
      service.show({ message: 'B', icon: '', type: 'end' });

      tick(4000);
      expect(service.toast()).toBeNull();
    }));
  });

  // ---- auto-start flag ------------------------------------------------

  describe('pendingAutoStart signal', () => {
    it('starts as false', () => {
      expect(service.pendingAutoStart()).toBe(false);
    });

    it('requestAutoStart() sets it to true', () => {
      service.requestAutoStart();
      expect(service.pendingAutoStart()).toBe(true);
    });

    it('consumeAutoStart() returns true when pending and clears the flag', () => {
      service.requestAutoStart();
      expect(service.consumeAutoStart()).toBe(true);
      expect(service.pendingAutoStart()).toBe(false);
    });

    it('consumeAutoStart() returns false when no request was made', () => {
      expect(service.consumeAutoStart()).toBe(false);
      expect(service.pendingAutoStart()).toBe(false);
    });

    it('consumeAutoStart() is idempotent — second call returns false', () => {
      service.requestAutoStart();
      service.consumeAutoStart();
      expect(service.consumeAutoStart()).toBe(false);
    });
  });
});
