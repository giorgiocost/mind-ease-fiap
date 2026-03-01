import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PreferencesStore, UiDensity, Contrast } from '@shared/state';

export type OnboardingStep = 'welcome' | 'preferences' | 'tour';

interface TourCard {
  icon: string;
  title: string;
  description: string;
}

const ONBOARDING_KEY = 'onboarding-completed';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss']
})
export class OnboardingComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly preferencesStore = inject(PreferencesStore);

  // ── State ─────────────────────────────────────────────────
  readonly currentStep = signal<OnboardingStep>('welcome');

  // ── Temporary preferences ─────────────────────────────────
  readonly selectedDensity = signal<UiDensity>('medium');
  readonly selectedFocusMode = signal(false);
  readonly selectedContrast = signal<Contrast>('normal');

  // ── Steps config ──────────────────────────────────────────
  readonly steps: OnboardingStep[] = ['welcome', 'preferences', 'tour'];

  readonly tourCards: TourCard[] = [
    {
      icon: '📊',
      title: 'Dashboard',
      description: 'Acompanhe suas estatísticas e progresso em tempo real.'
    },
    {
      icon: '✅',
      title: 'Tarefas Kanban',
      description: 'Organize suas tarefas em colunas To Do, Doing e Done com drag & drop.'
    },
    {
      icon: '🍅',
      title: 'Pomodoro Timer',
      description: 'Use a técnica Pomodoro para manter o foco em sessões de 25 minutos.'
    },
    {
      icon: '⚙️',
      title: 'Preferências Cognitivas',
      description: 'Ajuste a interface conforme suas necessidades de acessibilidade.'
    }
  ];

  // ── Computed ──────────────────────────────────────────────
  readonly currentStepIndex = computed(() =>
    this.steps.indexOf(this.currentStep())
  );
  readonly isFirstStep = computed(() => this.currentStepIndex() === 0);
  readonly isLastStep = computed(() => this.currentStepIndex() === this.steps.length - 1);

  // ── Lifecycle ─────────────────────────────────────────────
  ngOnInit(): void {
    if (localStorage.getItem(ONBOARDING_KEY) === 'true') {
      this.router.navigate(['/dashboard']);
    }
  }

  // ── Navigation ────────────────────────────────────────────
  async nextStep(): Promise<void> {
    const idx = this.currentStepIndex();

    if (idx === 1) {
      await this.savePreferences();
    }

    if (idx < this.steps.length - 1) {
      this.currentStep.set(this.steps[idx + 1]);
    } else {
      this.complete();
    }
  }

  prevStep(): void {
    const idx = this.currentStepIndex();
    if (idx > 0) {
      this.currentStep.set(this.steps[idx - 1]);
    }
  }

  skip(): void {
    this.markAsCompleted();
    this.router.navigate(['/dashboard']);
  }

  complete(): void {
    this.markAsCompleted();
    this.router.navigate(['/dashboard']);
  }

  private markAsCompleted(): void {
    localStorage.setItem(ONBOARDING_KEY, 'true');
  }

  // ── Preferences ───────────────────────────────────────────
  selectDensity(density: UiDensity): void {
    this.selectedDensity.set(density);
  }

  toggleFocusMode(): void {
    this.selectedFocusMode.update(v => !v);
  }

  selectContrast(contrast: Contrast): void {
    this.selectedContrast.set(contrast);
  }

  private async savePreferences(): Promise<void> {
    await this.preferencesStore.updatePreferences({
      uiDensity: this.selectedDensity(),
      focusMode: this.selectedFocusMode(),
      contrast: this.selectedContrast()
    });
  }
}
