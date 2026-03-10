import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '@shared/ui';
import { Task } from '../../models/task.model';
import { TasksStore } from '../../store/tasks.store';
import { KanbanColumnComponent } from '../kanban-column/kanban-column.component';

export type TaskFilter = 'all' | 'active' | 'completed';

/** IDs das colunas para conectar drag entre elas */
const COLUMN_IDS = ['TODO', 'DOING', 'DONE'] as const;

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, ButtonComponent, KanbanColumnComponent],
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.scss']
})
export class KanbanBoardComponent {
  private tasksStore = inject(TasksStore);

  // State
  filter = signal<TaskFilter>('all');
  searchQuery = signal('');

  /** Listas conectadas para cada coluna (exclui a própria) */
  todoConnected = COLUMN_IDS.filter(id => id !== 'TODO');
  doingConnected = COLUMN_IDS.filter(id => id !== 'DOING');
  doneConnected = COLUMN_IDS.filter(id => id !== 'DONE');

  // Computed
  loading = computed(() => this.tasksStore.loading());

  todoTasks = computed(() => {
    const tasks = this.tasksStore.todoTasks();
    return this.filterAndSearch(tasks);
  });

  doingTasks = computed(() => {
    const tasks = this.tasksStore.doingTasks();
    return this.filterAndSearch(tasks);
  });

  doneTasks = computed(() => {
    const tasks = this.tasksStore.doneTasks();
    return this.filterAndSearch(tasks);
  });

  private filterAndSearch(tasks: Task[]) {
    let filtered = tasks;

    // Apply search filter
    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  // Actions
  handleCreateTask() {
    // TODO: Open create task modal (will implement in this component)
    console.log('Create task');
  }

  setFilter(filter: TaskFilter) {
    this.filter.set(filter);
  }

  onFilterChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value as TaskFilter;
    this.setFilter(value);
  }

  updateSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  /**
   * Drag & Drop handler.
   *
   * - Same column: reorder via moveItemInArray
   * - Different column: transfer + optimistic status update via store
   */
  async onTaskDropped(event: CdkDragDrop<Task[]>) {
    const task = event.item.data as Task;
    const newStatus = event.container.id as 'TODO' | 'DOING' | 'DONE';

    if (event.previousContainer === event.container) {
      // Reorder within same column
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      // Transfer to new column
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Persist status change via store (optimistic)
      try {
        await this.tasksStore.updateTaskStatus(String(task.id), newStatus);
      } catch {
        // On error the store already reverts; reload to ensure consistency
        await this.tasksStore.loadTasks();
      }
    }
  }
}
