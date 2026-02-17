import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TasksViewModel } from './tasks.viewmodel';

/**
 * TasksComponent - Smart Container (MVVM Pattern)
 *
 * Responsibilities:
 * - Render UI based on ViewModel state
 * - Handle user events and delegate to ViewModel
 * - No business logic (all in ViewModel)
 *
 * Features:
 * - Kanban board with 3 columns (TODO, DOING, DONE)
 * - Search/filter functionality
 * - Create task modal
 * - Loading, error, and empty states
 * - Cognitive accessibility tokens (uiDensity, focusMode, contentMode)
 *
 * @see {@link TasksViewModel} for presentation logic
 * @see {@link ../../docs/ADR-002-mvvm-signals.md ADR-002: MVVM Pattern}
 */
@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    // TODO task_24: import KanbanColumnComponent
    // TODO task_25: import TaskCardComponent
  ],
  providers: [TasksViewModel], // Scoped ViewModel instance
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit {
  /** Inject scoped ViewModel */
  readonly vm = inject(TasksViewModel);

  // ==========================================
  // LIFECYCLE HOOKS
  // ==========================================

  ngOnInit(): void {
    // Component initialization - tasks are automatically loaded via effect in ViewModel
  }

  // ==========================================
  // EVENT HANDLERS
  // ==========================================

  /**
   * Handle task creation
   *
   * @param title - Task title (required)
   * @param description - Task description (optional)
   */
  async onCreateTask(title: string, description?: string): Promise<void> {
    try {
      await this.vm.createTask(title, description);
    } catch (error: unknown) {
      // TODO task_30: Integrate toast/snackbar for user feedback
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to create task: ${errorMessage}`);
    }
  }

  /**
   * Handle task update
   *
   * @param id - Task ID
   * @param updates - Partial updates to apply
   */
  async onUpdateTask(id: string, updates: { title?: string; description?: string }): Promise<void> {
    try {
      await this.vm.updateTask(id, updates);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to update task: ${errorMessage}`);
    }
  }

  /**
   * Handle task deletion with confirmation
   *
   * @param id - Task ID
   */
  async onDeleteTask(id: string): Promise<void> {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await this.vm.deleteTask(id);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to delete task: ${errorMessage}`);
    }
  }

  /**

   *
   * @param taskId - Task ID to select
   */
  onSelectTask(taskId: string): void {
    this.vm.selectTask(taskId);
  }

  /**
   * Handle search/filter change
   *
   * @param text - Filter text
   */
  onFilterChange(text: string): void {
    this.vm.setFilterText(text);
  }

  /**
   * Open task creation modal
   */
  onOpenCreateModal(): void {
    this.vm.openCreateTaskModal();
  }

  /**
   * Close task creation modal
   */
  onCloseCreateModal(): void {
    this.vm.closeCreateTaskModal();
  }

  /**
   * Clear error state
   */
  onClearError(): void {
    this.vm.clearError();
  }

  /**
   * Manually reload tasks
   */
  async onRefresh(): Promise<void> {
    await this.vm.loadTasks();
  }
}
