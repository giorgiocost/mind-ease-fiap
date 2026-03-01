import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthStore } from '@shared/state';

@Component({
  selector: 'app-mfe-profile-entry',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [AuthStore],
  template: `
    <div class="profile-remote">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .profile-remote {
      min-height: 100vh;
      padding: var(--spacing-lg, 1.5rem);
    }
  `]
})
export class RemoteEntryComponent implements OnInit {
  private readonly authStore = inject(AuthStore);

  ngOnInit(): void {
    console.log('[MFE Profile] Loaded', {
      user: this.authStore.user(),
      isAuthenticated: this.authStore.isAuthenticated()
    });
  }
}
