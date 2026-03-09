import { CommonModule } from '@angular/common';
import { Component, computed, inject, output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthStore } from '@shared/state';
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
