import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pomodoro',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pomodoro">
      <h1>Pomodoro Timer</h1>
      <p>Timer será implementado na task_26</p>
    </div>
  `,
  styles: [`
    .pomodoro {
      padding: var(--spacing-lg);
    }
  `]
})
export class PomodoroComponent {}
