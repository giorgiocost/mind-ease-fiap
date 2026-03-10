import { Component, inject, signal, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
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

  protected title = 'MindEase - Cognitive Accessibility Platform';

  @ViewChild(LayoutComponent) layout!: LayoutComponent;

  // Sidebar state
  readonly sidebarCollapsed = signal<boolean>(false);

  /**
   * Handle sidebar toggle event from header
   */
  handleToggleSidebar(): void {
    if (this.layout?.isMobile()) {
      this.layout.toggleMobileMenu();
    } else {
      this.sidebarCollapsed.update((collapsed) => !collapsed);
    }
  }
}
