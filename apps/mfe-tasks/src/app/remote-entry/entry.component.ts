import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TasksStore } from '../store/tasks.store';

@Component({
  selector: 'app-tasks-entry',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="tasks-remote">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .tasks-remote {
      height: 100%;
    }
  `],
  providers: [TasksStore] // Provide TasksStore at MFE level
})
export class RemoteEntryComponent {
  private tasksStore = inject(TasksStore);
}
