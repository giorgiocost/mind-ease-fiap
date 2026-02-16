// apps/mfe-dashboard/src/app/dashboard/dashboard.component.ts
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthStore, PreferencesStore } from '@shared/state';
import { CardComponent } from '@shared/ui';
import { StatsCardComponent } from '../components/stats-card/stats-card.component';
import { PreferencesPanelComponent } from '../components/preferences-panel/preferences-panel.component';

interface DashboardStats {
  pendingTasks: number;
  completedToday: number;
  focusTimeToday: number; // em minutos
  weeklyProductivity: number; // percentage
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CardComponent, StatsCardComponent, PreferencesPanelComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  private authStore = inject(AuthStore);
  private prefsStore = inject(PreferencesStore);

  // State
  stats = signal<DashboardStats | null>(null);
  loading = signal(true);

  // Computed
  user = computed(() => this.authStore.user());
  uiDensity = computed(() => this.prefsStore.uiDensity());
  focusMode = computed(() => this.prefsStore.focusMode());

  // Greeting message
  greeting = computed(() => {
    const hour = new Date().getHours();
    const userName = this.user()?.name.split(' ')[0] || 'Usuário';

    if (hour < 12) return `Bom dia, ${userName}! ☀️`;
    if (hour < 18) return `Boa tarde, ${userName}! 🌤️`;
    return `Boa noite, ${userName}! 🌙`;
  });

  ngOnInit() {
    this.loadDashboardData();
  }

  async loadDashboardData() {
    this.loading.set(true);

    try {
      // TODO: Replace with real API call (task_22: TasksStore integration)
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      this.stats.set({
        pendingTasks: 12,
        completedToday: 5,
        focusTimeToday: 90, // 1h30min
        weeklyProductivity: 85
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      this.loading.set(false);
    }
  }

  formatFocusTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) return `${mins}min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  }

  navigateToTasks() {
    this.router.navigate(['/tasks']);
  }

  navigateToPomodoro() {
    this.router.navigate(['/tasks/pomodoro']);
  }
}
