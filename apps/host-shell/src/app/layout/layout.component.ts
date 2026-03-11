import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
    Component,
    OnInit,
    PLATFORM_ID,
    computed,
    effect,
    inject,
    signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { PreferencesStore } from '@shared/state';
import { fromEvent } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';

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

  // whether the current route is an auth page (/login or /register)
  readonly isAuthPage = signal<boolean>(false);

  // Computed signals from PreferencesStore
  readonly focusMode    = computed(() => this.#preferencesStore.focusMode());
  readonly contentMode  = computed(() => this.#preferencesStore.contentMode());

  // Computed sidebar visibility
  // Sidebar is visible when:
  // - NOT on mobile OR mobile menu is open
  // (focus mode only reduces menu items via sidebar component — sidebar stays visible,
  //  collapsed to icon-only so the user can still navigate)
  readonly sidebarVisible = computed(() => {
    const mobile = this.isMobile();
    const mobileOpen = this.mobileMenuOpen();

    if (mobile) {
      return mobileOpen; // Show only if mobile menu is open
    }

    return true; // Always show on desktop; focus mode collapses it (see getLayoutClasses)
  });

  // Determine whether header/sidebar should render at all
  readonly showShell = computed(() => !this.isAuthPage());

  constructor() {
    // Check for mobile on initialization
    if (isPlatformBrowser(this.#platformId)) {
      this.checkMobile();
    }

    // Watch router events to determine if we're on an auth page
    const router = inject(Router);
    // set initial value synchronously to avoid flash on reload
    if (isPlatformBrowser(this.#platformId)) {
      const path = window.location.pathname || '';
      this.isAuthPage.set(path.startsWith('/login') || path.startsWith('/register'));
    } else {
      const initialUrl = router.url || '';
      this.isAuthPage.set(initialUrl.startsWith('/login') || initialUrl.startsWith('/register'));
    }

    router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd)
      )
      .subscribe(e => {
        const url = e.urlAfterRedirects || e.url;
        this.isAuthPage.set(url.startsWith('/login') || url.startsWith('/register'));
        this.closeMobileMenu();
      });

    // Effect to close mobile menu when switching to desktop
    effect(() => {
      if (!this.isMobile() && this.mobileMenuOpen()) {
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
      // Collapse sidebar when explicitly collapsed, focus mode, or summary content mode
      'sidebar-collapsed': (this.sidebarCollapsed() && !this.isMobile()) || this.focusMode() || this.contentMode() === 'summary',
      'focus-mode': this.focusMode(),
      'mobile': this.isMobile(),
      'mobile-menu-open': this.mobileMenuOpen(),
      'auth-page': !this.showShell(),
    };
  }
}
