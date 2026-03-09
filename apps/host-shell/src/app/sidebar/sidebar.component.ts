import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PreferencesStore } from '@shared/state';

/**
 * 📋 MenuItem Interface
 *
 * Defines the structure of a sidebar menu item with routing and optional badge.
 */
export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

/**
 * 📁 SidebarComponent
 *
 * Navigation sidebar with menu items, collapsed/expanded states, and active route highlighting.
 *
 * States:
 * - Expanded: 240px width with labels visible
 * - Collapsed: 64px width with icons only
 *
 * Features:
 * - Router integration with active link highlighting
 * - UI density variants (simple/medium/full)
 * - Badges for notifications
 * - Motion preferences support
 * - Responsive design for mobile
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  private prefsStore = inject(PreferencesStore);

  // Inputs
  collapsed = input(false);

  // Menu items
  menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '🏠',
      route: '/dashboard'
    },
    {
      id: 'tasks',
      label: 'Tarefas',
      icon: '✅',
      route: '/tasks'
    },
    {
      id: 'pomodoro',
      label: 'Pomodoro',
      icon: '⏱️',
      route: '/tasks/pomodoro'
    },
    {
      id: 'preferences',
      label: 'Configurações',
      icon: '⚙️',
      route: '/dashboard/preferences'
    },
    {
      id: 'profile',
      label: 'Perfil',
      icon: '👤',
      route: '/profile'
    }
  ];

  // Computed
  uiDensity = computed(() => this.prefsStore.uiDensity());
}
