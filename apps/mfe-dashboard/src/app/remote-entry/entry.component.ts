import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard-entry',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-remote">
      <h1>Dashboard MFE</h1>
      <p>This is the Dashboard Micro Frontend</p>
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .dashboard-remote {
      padding: var(--spacing-lg);
    }
  `]
})
export class RemoteEntryComponent {}
