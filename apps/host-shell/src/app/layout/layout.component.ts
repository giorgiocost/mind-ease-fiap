import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  PLATFORM_ID,
  effect,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { PreferencesStore } from '@shared/state';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

/**
 * 📐 LayoutComponent
 *
 * Grid-based layout system with responsive behavior and focus mode integration.
 *
 * Layout structure:
 * ┌─────────────────────────────────────────┐
 * │            Header (64px)                │
 * ├──────────┬──────────────────────────────┤
 * │          │                              │
 * │ Sidebar  │      Main Content            │
 * │ 240px/   │      (flexible)              │
 * │ 64px     │                              │
 * │          │                              │
 * └──────────┴──────────────────────────────┘
 *
 * States:
 * - Desktop: sidebar expanded (240px) or collapsed (64px)
 * - Focus mode: sidebar hidden completely
 * - Mobile (< 768px): sidebar as overlay with backdrop
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent implements OnInit {
  // Services
  readonly #preferencesStore = inject(PreferencesStore);
  readonly #platformId = inject(PLATFORM_ID);

  // State signals
  readonly sidebarCollapsed = signal<boolean>(false);
  readonly mobileMenuOpen = signal<boolean>(false);
  readonly isMobile = signal<boolean>(false);

  // Computed signals from PreferencesStore
  readonly focusMode = computed(() => this.#preferencesStore.focusMode());

  // Computed sidebar visibility
  // Sidebar is visible when:
  // - NOT in focus mode
  // - AND (NOT mobile OR mobile menu is open)
  readonly sidebarVisible = computed(() => {
    const inFocusMode = this.focusMode();
    const mobile = this.isMobile();
    const mobileOpen = this.mobileMenuOpen();

    if (inFocusMode) {
      return false; // Never show in focus mode
    }

    if (mobile) {
      return mobileOpen; // Show only if mobile menu is open
    }

    return true; // Show on desktop
  });

  constructor() {
    // Check for mobile on initialization
    if (isPlatformBrowser(this.#platformId)) {
      this.checkMobile();
    }

    // Effect to close mobile menu when switching to desktop
    effect(() => {
      if (!this.isMobile() && this.mobileMenuOpen()) {
        this.mobileMenuOpen.set(false);
      }
    });

    // Effect to close mobile menu when entering focus mode
    effect(() => {
      if (this.focusMode() && this.mobileMenuOpen()) {
        this.mobileMenuOpen.set(false);
      }
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.#platformId)) {
      // Listen for window resize with debounce
      fromEvent(window, 'resize')
        .pipe(debounceTime(150))
        .subscribe(() => {
          this.checkMobile();
        });
    }
  }

  /**
   * Check if current viewport is mobile (< 768px)
   */
  checkMobile(): void {
    if (isPlatformBrowser(this.#platformId)) {
      const mobile = window.innerWidth < 768;
      this.isMobile.set(mobile);
    }
  }

  /**
   * Toggle sidebar collapsed state (desktop only)
   */
  toggleSidebar(): void {
    if (!this.isMobile()) {
      this.sidebarCollapsed.update((collapsed) => !collapsed);
    }
  }

  /**
   * Toggle mobile menu (mobile only)
   */
  toggleMobileMenu(): void {
    if (this.isMobile()) {
      this.mobileMenuOpen.update((open) => !open);
    }
  }

  /**
   * Close mobile menu
   */
  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  /**
   * Get CSS classes for layout container
   */
  getLayoutClasses(): { [key: string]: boolean } {
    return {
      'layout': true,
      'sidebar-collapsed': this.sidebarCollapsed() && !this.isMobile(),
      'focus-mode': this.focusMode(),
      'mobile': this.isMobile(),
      'mobile-menu-open': this.mobileMenuOpen(),
    };
  }
}
