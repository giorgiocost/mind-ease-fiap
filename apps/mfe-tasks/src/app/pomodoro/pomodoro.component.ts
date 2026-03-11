import { CommonModule } from '@angular/common';
import {
    Component,
    OnDestroy,
    OnInit,
    computed,
    effect,
    inject,
    signal
} from '@angular/core';
import { PomodoroNotificationService, PreferencesStore } from '@shared/state';

export type TimerMode = 'work' | 'short-break' | 'long-break';

interface PomodoroSession {
  completedAt: string; // ISO string for localStorage serialization
  duration: number;
  mode: TimerMode;
}

const STORAGE_KEY = 'pomodoro-sessions';
const TIMER_STATE_KEY = 'pomodoro-timer-state';
const CIRCUMFERENCE = 2 * Math.PI * 120; // r=120 → 753.982...

/** Estado persistido entre navegações e reloads */
interface TimerState {
  mode: TimerMode;
  timeRemaining: number;
  isRunning: boolean;
  /** timestamp ISO quando o timer foi iniciado (ou retomado) */
  startedAt: string | null;
}

@Component({
  selector: 'app-pomodoro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pomodoro.component.html',
  styleUrls: ['./pomodoro.component.scss']
})
export class PomodoroComponent implements OnInit, OnDestroy {
  private readonly preferencesStore = inject(PreferencesStore);
  private readonly pomodoroNotif = inject(PomodoroNotificationService);

  // ── Timer State ──────────────────────────────────────────────────
  readonly mode = signal<TimerMode>('work');
  readonly isRunning = signal(false);
  readonly timeRemaining = signal(25 * 60);

  private intervalId: ReturnType<typeof setInterval> | null = null;
  /** Whether the 30-min warning has already been shown this session */
  private longTaskWarningShown = false;

  // ── Session Tracking ─────────────────────────────────────────────
  readonly sessionsCompleted = signal(0);
  private readonly sessions = signal<PomodoroSession[]>([]);

  // ── Selectable work duration ────────────────────────────────────
  readonly workDurationOptions = [15, 25, 40] as const;
  readonly selectedWorkMinutes = signal(25);

  // ── Durations (seconds) ──────────────────────────────────────
  private readonly WORK_DURATION = 25 * 60;
  private readonly SHORT_BREAK_DURATION = 5 * 60;
  private readonly LONG_BREAK_DURATION = 15 * 60;
  private readonly SESSIONS_BEFORE_LONG_BREAK = 4;

  /** Work duration derived from the user-selected minutes */
  private get workDuration(): number {
    return this.selectedWorkMinutes() * 60;
  }

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
  private audioCtx: AudioContext | null = null;

  // ── Effects ──────────────────────────────────────────────────
  constructor() {
    // Update browser tab title while running
    effect(() => {
      if (typeof document !== 'undefined') {
        document.title = this.isRunning()
          ? `MindEase | ${this.formattedTime()} — ${this.modeLabel()}`
          : 'MindEase';
      }
    });

    // Auto-start timer when focus mode is activated
    let prevFocus = this.preferencesStore.focusMode();
    effect(() => {
      const focus = this.preferencesStore.focusMode();
      if (focus && !prevFocus && !this.isRunning()) {
        this.mode.set('work');
        this.timeRemaining.set(this.workDuration);
        this.start();
      }
      prevFocus = focus;
    });
  }

  // ── Lifecycle ────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadSessions();
    this.restoreTimerState();
    this.loadAudio();
    this.requestNotificationPermission();

    // Consume auto-start flag (set by host-shell when focus mode is activated)
    if (this.pomodoroNotif.consumeAutoStart() && !this.isRunning()) {
      this.mode.set('work');
      this.timeRemaining.set(this.workDuration);
      this.start();
    }
  }

  ngOnDestroy(): void {
    this.saveTimerState();
    // Limpa o interval sem alterar isRunning/salvar de novo,
    // para que o estado persistido mantenha isRunning=true
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (typeof document !== 'undefined') {
      document.title = 'MindEase';
    }
  }

  // ── Timer Controls ───────────────────────────────────────────
  start(): void {
    if (this.isRunning()) return;
    this.isRunning.set(true);
    this.longTaskWarningShown = false;
    this.playStartSound();
    this.saveTimerState();

    // Toast feedback
    const isWork = this.mode() === 'work';
    this.pomodoroNotif.show({
      message: isWork ? 'Você iniciou o pomodoro 🍅' : 'Você iniciou a pausa ☕',
      icon: isWork ? '🍅' : '☕',
      type: 'start'
    });

    this.intervalId = setInterval(() => {
      const remaining = this.timeRemaining();
      if (remaining > 0) {
        this.timeRemaining.set(remaining - 1);
        this.saveTimerState();

        // 30-min focus mode warning
        if (
          !this.longTaskWarningShown &&
          this.mode() === 'work' &&
          this.preferencesStore.focusMode()
        ) {
          const elapsed = this.getCurrentDuration() - remaining;
          if (elapsed >= 30 * 60) {
            this.longTaskWarningShown = true;
            this.pomodoroNotif.show({
              message: 'Você está há muito tempo nesta tarefa ⏰',
              icon: '⏰',
              type: 'end'
            });
          }
        }
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
    this.saveTimerState();
  }

  reset(): void {
    this.pause();
    this.timeRemaining.set(this.getCurrentDuration());
    this.saveTimerState();
  }

  stop(): void {
    this.pause();
  }

  changeMode(mode: TimerMode): void {
    this.pause();
    this.mode.set(mode);
    this.timeRemaining.set(this.getCurrentDuration());
    this.saveTimerState();
  }

  /** Change work duration (only when not running in work mode) */
  setWorkDuration(minutes: number): void {
    this.selectedWorkMinutes.set(minutes);
    if (this.mode() === 'work' && !this.isRunning()) {
      this.timeRemaining.set(minutes * 60);
      this.saveTimerState();
    }
  }

  // ── Internal Logic ───────────────────────────────────────────
  private complete(): void {
    // Toast feedback before pausing
    const wasWork = this.mode() === 'work';
    this.pomodoroNotif.show({
      message: wasWork
        ? 'Pomodoro chegou ao fim, inicie a pausa ☕'
        : 'A pausa chegou ao fim 🍅',
      icon: wasWork ? '✅' : '🍅',
      type: 'end'
    });

    this.pause();
    this.playCompletionSound();

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
      'work': this.workDuration,
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
    try {
      this.audioCtx = new (window.AudioContext || (window as unknown as Record<string, typeof AudioContext>)['webkitAudioContext'])();
    } catch {
      this.audioCtx = null;
    }
  }

  /** Som curto de início do timer via Web Audio API */
  private playStartSound(): void {
    if (this.preferencesStore.motion() === 'off') return;
    const ctx = this.audioCtx;
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } catch { /* Web Audio unavailable */ }
  }

  /** Som de conclusão (tom descendente) via Web Audio API */
  private playCompletionSound(): void {
    if (this.preferencesStore.motion() === 'off') return;
    const ctx = this.audioCtx;
    if (!ctx) return;
    try {
      // Toca 3 notas descendentes rápidas
      const notes = [880, 660, 440];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        const t = ctx.currentTime + i * 0.15;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.start(t);
        osc.stop(t + 0.2);
      });
    } catch { /* Web Audio unavailable */ }
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

  // ── Persistência do Timer ─────────────────────────────────────

  private saveTimerState(): void {
    try {
      const state: TimerState = {
        mode: this.mode(),
        timeRemaining: this.timeRemaining(),
        isRunning: this.isRunning(),
        startedAt: this.isRunning() ? new Date().toISOString() : null
      };
      localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(state));
    } catch { /* storage full */ }
  }

  private restoreTimerState(): void {
    try {
      const raw = localStorage.getItem(TIMER_STATE_KEY);
      if (!raw) return;

      const state: TimerState = JSON.parse(raw);
      this.mode.set(state.mode);

      let remaining = state.timeRemaining;

      // Calcula o quanto passou enquanto o componente estava desmontado
      if (state.isRunning && state.startedAt) {
        const elapsed = Math.floor(
          (Date.now() - new Date(state.startedAt).getTime()) / 1000
        );
        remaining = Math.max(0, state.timeRemaining - elapsed);
      }

      this.timeRemaining.set(remaining);

      // Retoma automaticamente se ainda havia tempo restante
      if (state.isRunning && remaining > 0) {
        this.start();
      }
    } catch {
      localStorage.removeItem(TIMER_STATE_KEY);
    }
  }

  // ── Persistence (sessões concluídas) ─────────────────────────
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
