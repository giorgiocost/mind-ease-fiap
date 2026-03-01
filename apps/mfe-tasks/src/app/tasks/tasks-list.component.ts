import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TasksStore } from '../store/tasks.store';
import { KanbanBoardComponent } from './kanban-board/kanban-board.component';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  imports: [CommonModule, KanbanBoardComponent],
  template: `
    <div class="tasks-list">
      @if (loading()) {
        <div class="loading-state">
          <p>⏳ Carregando tarefas...</p>
        </div>
      } @else if (error()) {
        <div class="error-state">
          <p>❌ {{ error() }}</p>
          <button (click)="retry()">Tentar novamente</button>
        </div>
      } @else {
        <app-kanban-board></app-kanban-board>
      }
    </div>
  `,
  styles: [`
    .tasks-list {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .loading-state,
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-md);
      height: 200px;
      color: var(--color-text-secondary);
    }

    .error-state button {
      padding: var(--spacing-sm) var(--spacing-md);
      border: 1px solid var(--color-primary);
      background: transparent;
      color: var(--color-primary);
      border-radius: var(--radius-md);
      cursor: pointer;

      &:hover {
        background: var(--color-primary);
        color: white;
      }
    }
  `]
})
export class TasksListComponent implements OnInit {
  private tasksStore = inject(TasksStore);

  loading = this.tasksStore.loading;
  error = this.tasksStore.error;

  async ngOnInit() {
    // Load tasks when component initializes
    await this.tasksStore.loadTasks();
  }

  async retry() {
    this.tasksStore.clearError();
    await this.tasksStore.loadTasks();
  }
}
