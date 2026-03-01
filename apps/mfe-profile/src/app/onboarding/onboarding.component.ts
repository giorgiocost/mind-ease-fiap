import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="onboarding">
      <h1>Onboarding</h1>
      <p>Placeholder — será implementado na task_28</p>
    </div>
  `,
  styles: [`
    .onboarding {
      padding: var(--spacing-xl, 2rem);
    }
  `]
})
export class OnboardingComponent {}
