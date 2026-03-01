import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreferencesStore } from '@shared/state';

export type TimerMode = 'work' | 'short-break' | 'long-break';

interface PomodoroSession {
  completedAt: string; // ISO string for localStorage serialization
  duration: number;
  mode: TimerMode;
}

const STORAGE_KEY = 'pomodoro-sessions';
const CIRCUMFERENCE = 2 * Math.PI * 120; // r=120 → 753.982...

@Component({
  selector: 'app-pomodoro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pomodoro.component.html',
  styleUrls: ['./pomodoro.component.scss']
})
export class PomodoroComponent implements OnInit, OnDestroy {
  private readonly preferencesStore = inject(PreferencesStore);

  // ── Timer State ──────────────────────────────────────────────
  readonly mode = signal<TimerMode>('work');
  readonly isRunning = signal(false);
  readonly timeRemaining = signal(25 * 60);

  private intervalId: ReturnType<typeof setInterval> | null = null;

  // ── Session Tracking ─────────────────────────────────────────
  readonly sessionsCompleted = signal(0);
  private readonly sessions = signal<PomodoroSession[]>([]);

  // ── Durations (seconds) ──────────────────────────────────────
  private readonly WORK_DURATION = 25 * 60;
  private readonly SHORT_BREAK_DURATION = 5 * 60;
  private readonly LONG_BREAK_DURATION = 15 * 60;
  private readonly SESSIONS_BEFORE_LONG_BREAK = 4;

  readonly dailyGoal = 8;
  readonly circumference = CIRCUMFERENCE;

  // ── Computed ─────────────────────────────────────────────────
  readonly progress = computed(() => {
    const duration = this.getCurrentDuration();
    return ((duration - this.timeRemaining()) / duration) * 100;
  });

  readonly strokeDashoffset = computed(() =>
    CIRCUMFERENCE - (CIRCUMFERENCE * this.progress() / 100)
  );

  readonly formattedTime = computed(() => {
    const minutes = Math.floor(this.timeRemaining() / 60);
    const seconds = this.timeRemaining() % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });

  readonly modeLabel = computed(() => {
    const map: Record<TimerMode, string> = {
      'work': 'Trabalho',
      'short-break': 'Pausa Curta',
      'long-break': 'Pausa Longa'
    };
    return map[this.mode()];
  });

  readonly modeIcon = computed(() => {
    const map: Record<TimerMode, string> = {
      'work': '🍅',
      'short-break': '☕',
      'long-break': '🌴'
    };
    return map[this.mode()];
  });

  readonly sessionsToday = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.sessions().filter(s => {
      const d = new Date(s.completedAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime() && s.mode === 'work';
    }).length;
  });

  readonly focusedMinutes = computed(() => this.sessionsCompleted() * 25);

  readonly notificationPermission = computed(() =>
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  // ── Audio ────────────────────────────────────────────────────
  private audio: HTMLAudioElement | null = null;

  // ── Effects ──────────────────────────────────────────────────
  constructor() {
    // Update browser tab title while running
    effect(() => {
      if (typeof document !== 'undefined') {
        document.title = this.isRunning()
          ? `${this.formattedTime()} — ${this.modeLabel()} | MindEase`
          : 'Pomodoro Timer | MindEase';
      }
    });
  }

  // ── Lifecycle ────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadSessions();
    this.loadAudio();
    this.requestNotificationPermission();
  }

  ngOnDestroy(): void {
    this.stop();
    if (typeof document !== 'undefined') {
      document.title = 'MindEase';
    }
  }

  // ── Timer Controls ───────────────────────────────────────────
  start(): void {
    if (this.isRunning()) return;
    this.isRunning.set(true);

    this.intervalId = setInterval(() => {
      const remaining = this.timeRemaining();
      if (remaining > 0) {
        this.timeRemaining.set(remaining - 1);
      } else {
        this.complete();
      }
    }, 1000);
  }

  pause(): void {
    this.isRunning.set(false);
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  reset(): void {
    this.pause();
    this.timeRemaining.set(this.getCurrentDuration());
  }

  stop(): void {
    this.pause();
  }

  changeMode(mode: TimerMode): void {
    this.pause();
    this.mode.set(mode);
    this.timeRemaining.set(this.getCurrentDuration());
  }

  // ── Internal Logic ───────────────────────────────────────────
  private complete(): void {
    this.pause();

    const session: PomodoroSession = {
      completedAt: new Date().toISOString(),
      duration: this.getCurrentDuration(),
      mode: this.mode()
    };

    this.sessions.update(s => [...s, session]);

    if (this.mode() === 'work') {
      this.sessionsCompleted.update(c => c + 1);
    }

    this.saveSessions();
    this.playNotification();
    this.switchMode();
  }

  private switchMode(): void {
    if (this.mode() === 'work') {
      const workCount = this.sessionsCompleted();
      this.mode.set(
        workCount % this.SESSIONS_BEFORE_LONG_BREAK === 0
          ? 'long-break'
          : 'short-break'
      );
    } else {
      this.mode.set('work');
    }
    this.timeRemaining.set(this.getCurrentDuration());
  }

  getCurrentDuration(): number {
    const map: Record<TimerMode, number> = {
      'work': this.WORK_DURATION,
      'short-break': this.SHORT_BREAK_DURATION,
      'long-break': this.LONG_BREAK_DURATION
    };
    return map[this.mode()];
  }

  // ── Audio & Notifications ────────────────────────────────────
  private loadAudio(): void {
    try {
      this.audio = new Audio('assets/sounds/pomodoro-complete.mp3');
      this.audio.load();
    } catch {
      this.audio = null;
    }
  }

  private playNotification(): void {
    const focusMode = this.preferencesStore.focusMode();
    const motion = this.preferencesStore.motion();

    if (!focusMode && motion !== 'off' && this.audio) {
      this.audio.play()?.catch(() => { /* autoplay blocked */ });
    }

    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification('Sessão completa! ' + this.modeIcon(), {
        body: `${this.modeLabel()} finalizado. Hora da próxima etapa!`,
        icon: '/assets/icons/icon-192x192.png'
      });
    }
  }

  requestNotificationPermission(): void {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  // ── Persistence ──────────────────────────────────────────────
  private loadSessions(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: PomodoroSession[] = JSON.parse(stored);
        this.sessions.set(parsed);
        this.sessionsCompleted.set(parsed.filter(s => s.mode === 'work').length);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  private saveSessions(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.sessions()));
    } catch { /* storage full */ }
  }

  clearHistory(): void {
    this.sessions.set([]);
    this.sessionsCompleted.set(0);
    localStorage.removeItem(STORAGE_KEY);
  }
}
