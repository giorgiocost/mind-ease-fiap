import { Injectable, signal } from '@angular/core';

export interface PomodoroToast {
  message: string;
  icon: string;
  type: 'start' | 'end';
}

/**
 * Global service for pomodoro cross-MFE communication.
 * - Toast messages shown in the header
 * - Auto-start flag for focus mode activation
 */
@Injectable({ providedIn: 'root' })
export class PomodoroNotificationService {
  /** Current toast (null = hidden) */
  readonly toast = signal<PomodoroToast | null>(null);

  /** Flag: pomodoro should auto-start on next init */
  readonly pendingAutoStart = signal(false);

  private hideTimeout: ReturnType<typeof setTimeout> | null = null;

  /** Show a toast that auto-hides after 4s */
  show(toast: PomodoroToast): void {
    if (this.hideTimeout) clearTimeout(this.hideTimeout);
    this.toast.set(toast);
    this.hideTimeout = setTimeout(() => this.toast.set(null), 4000);
  }

  /** Request auto-start (called when focus mode is activated) */
  requestAutoStart(): void {
    this.pendingAutoStart.set(true);
  }

  /** Consume the auto-start flag (called by PomodoroComponent on init) */
  consumeAutoStart(): boolean {
    const pending = this.pendingAutoStart();
    if (pending) this.pendingAutoStart.set(false);
    return pending;
  }
}
