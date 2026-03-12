import { CommonModule } from '@angular/common';
import { Component, computed, ElementRef, HostListener, inject, output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthStore, PomodoroNotificationService } from '@shared/state';
import { ClickOutsideDirective } from '@shared/ui';

/**
 * 📰 HeaderComponent
 *
 * Global header with logo, sidebar toggle, notifications, and user dropdown.
 *
 * Layout:
 * ┌───────────────────────────────────────────────────────┐
 * │ [☰] MindEase      [🔔]  [Avatar ▼ John Doe]           │
 * └───────────────────────────────────────────────────────┘
 *
 * Features:
 * - Sidebar toggle button (emits event to parent)
 * - Logo with navigation to /dashboard
 * - Notifications badge
 * - User dropdown menu (Profile, Logout)
 * - User initials avatar
 * - Responsive (hides text on mobile)
 * - Click outside to close dropdown
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ClickOutsideDirective],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private authStore = inject(AuthStore);
  private router = inject(Router);
  private elementRef = inject(ElementRef);
  readonly pomodoroNotif = inject(PomodoroNotificationService);

  // Outputs
  toggleSidebar = output<void>();

  // State
  dropdownOpen = false;
  notificationsCount = 3; // TODO: Get from NotificationsStore (future task)

  // Computed
  user = computed(() => this.authStore.user());
  userInitials = computed(() => {
    const user = this.user();
    if (!user) return '?';

    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return user.name[0].toUpperCase();
  });

  // Keyboard navigation for dropdown (Escape closes, Arrow keys navigate items)
  @HostListener('keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (!this.dropdownOpen) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeDropdown();
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const items = this.elementRef.nativeElement.querySelectorAll('[role="menuitem"]') as NodeListOf<HTMLElement>;
      if (items.length === 0) return;

      const currentIndex = Array.from(items).findIndex(item => item === document.activeElement);
      let nextIndex: number;

      if (event.key === 'ArrowDown') {
        nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      } else {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      }

      items[nextIndex].focus();
    }
  }

  // Actions
  handleToggleSidebar() {
    this.toggleSidebar.emit();
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown() {
    this.dropdownOpen = false;
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
    this.closeDropdown();
  }

  async handleLogout() {
    this.authStore.logout();
    this.router.navigate(['/login']);
    this.closeDropdown();
  }
}
