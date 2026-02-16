import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  imports: [RouterModule, LayoutComponent, HeaderComponent, SidebarComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'MindEase - Cognitive Accessibility Platform';

  // Sidebar state
  readonly sidebarCollapsed = signal<boolean>(false);

  /**
   * Handle sidebar toggle event from header
   */
  handleToggleSidebar(): void {
    this.sidebarCollapsed.update((collapsed) => !collapsed);
  }
}
