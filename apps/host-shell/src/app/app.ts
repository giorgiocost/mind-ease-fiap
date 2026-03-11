import { Component, effect, inject, signal, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { PomodoroNotificationService, PreferencesStore } from '@shared/state';
import { PreferencesUiService } from '@shared/ui';
import { HeaderComponent } from './header/header.component';
import { LayoutComponent } from './layout/layout.component';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  imports: [RouterModule, LayoutComponent, HeaderComponent, SidebarComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  // Instantiates PreferencesUiService so its effect() runs and applies
  // data-ui-density / data-contrast etc. to <body> from the start
  private readonly _prefsUi = inject(PreferencesUiService);
  private readonly _prefsStore = inject(PreferencesStore);
  private readonly _pomodoroNotif = inject(PomodoroNotificationService);
  private readonly _router = inject(Router);

  protected title = 'MindEase - Cognitive Accessibility Platform';

  @ViewChild(LayoutComponent) layout!: LayoutComponent;

  // Sidebar state
  readonly sidebarCollapsed = signal<boolean>(false);

  constructor() {
    // Auto-navigate to pomodoro + request auto-start when focus mode is activated
    let prevFocus = this._prefsStore.focusMode();
    effect(() => {
      const focus = this._prefsStore.focusMode();
      if (focus && !prevFocus) {
        this._pomodoroNotif.requestAutoStart();
        this._router.navigate(['/tasks/pomodoro']);
      }
      prevFocus = focus;
    });
  }

  /**
   * Handle sidebar toggle event from header.
   * On mobile: always allowed (even in focus/summary mode).
   * On desktop: locked when focus mode or summary mode is active.
   */
  handleToggleSidebar(): void {
    if (this.layout?.isMobile()) {
      this.layout.toggleMobileMenu();
    } else {
      if (
        this._prefsStore.focusMode() ||
        this._prefsStore.contentMode() === 'summary'
      ) return;
      this.sidebarCollapsed.update((collapsed) => !collapsed);
      // Sync layout grid width with the new collapsed state
      this.layout?.sidebarCollapsed.set(this.sidebarCollapsed());
    }
  }
}
