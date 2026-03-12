import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Task } from '../models/task.model';
import { TaskCardComponent } from './task-card/task-card.component';
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
    DragDropModule,
    TaskCardComponent,
  ],
  providers: [TasksViewModel], // Scoped ViewModel instance
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent {
  /** Inject scoped ViewModel */
  readonly vm = inject(TasksViewModel);

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
   * @param event - Input event
   */
  onFilterChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.vm.setFilterText(value);
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

  onCreateModalOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCloseCreateModal();
    }
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

  // ==========================================
  // DRAG & DROP
  // ==========================================

  /** Connected drop-list IDs for each column */
  readonly todoConnected = ['DOING', 'DONE'];
  readonly doingConnected = ['TODO', 'DONE'];
  readonly doneConnected = ['TODO', 'DOING'];

  /** Checks if the active task is in a given column (used for column-dimmed class) */
  hasActiveInColumn(tasks: Task[]): boolean {
    const activeId = this.vm.activeTaskId();
    if (activeId === null) return false;
    return tasks.some(t => t.id === activeId);
  }

  /**
   * Handle drag & drop between columns.
   * Same column → reorder locally.
   * Different column → transfer + persist via ViewModel.moveTask().
   */
  async onTaskDropped(event: CdkDragDrop<Task[]>): Promise<void> {
    const task = event.item.data as Task;
    const newStatus = event.container.id as 'TODO' | 'DOING' | 'DONE';

    if (event.previousContainer === event.container) {
      // Reorder within same column
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Transfer to new column
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Persist status change
      try {
        await this.vm.moveTask(String(task.id), newStatus, event.currentIndex);
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Failed to move task';
        alert(msg);
        // Reload to restore consistent state
        await this.vm.loadTasks();
      }
    }
  }
}
