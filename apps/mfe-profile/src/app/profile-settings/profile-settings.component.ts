import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile-settings">
      <h1>Configurações de Perfil</h1>
      <p>Placeholder — será implementado na task_29</p>
    </div>
  `,
  styles: [`
    .profile-settings {
      padding: var(--spacing-xl, 2rem);
    }
  `]
})
export class ProfileSettingsComponent {}
