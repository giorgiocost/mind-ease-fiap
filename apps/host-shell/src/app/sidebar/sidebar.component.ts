import { CommonModule } from '@angular/common';
import { Component, computed, ElementRef, HostListener, inject, input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
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
  private elementRef = inject(ElementRef);

  // Inputs
  collapsed = input(false);

  // Keyboard navigation for menu items (ArrowUp/ArrowDown, Home/End)
  @HostListener('keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    const links = this.elementRef.nativeElement.querySelectorAll('.menu-link') as NodeListOf<HTMLElement>;
    if (links.length === 0) return;

    const currentIndex = Array.from(links).findIndex(link => link === document.activeElement);
    let nextIndex: number | null = null;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        nextIndex = currentIndex < links.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowUp':
        event.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : links.length - 1;
        break;
      case 'Home':
        event.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        nextIndex = links.length - 1;
        break;
    }

    if (nextIndex !== null) {
      links[nextIndex].focus();
    }
  }

  // Menu items
  menuItems: MenuItem[] = [
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

  private router = inject(Router);

  // Computed
  uiDensity = computed(() => this.prefsStore.uiDensity());

  isActive(route: string): boolean {
    return this.router.url === route;
  }
}
