import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PreferencesStore } from '@shared/state';
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
  private prefsStore = inject(PreferencesStore);

  // State
  filter = signal<TaskFilter>('all');
  searchQuery = signal('');

  wipLimitEnabled = computed(() => this.prefsStore.wipLimitEnabled());

  /** Listas conectadas para cada coluna (exclui a própria) */
  todoConnected = COLUMN_IDS.filter(id => id !== 'TODO');
  doingConnected = COLUMN_IDS.filter(id => id !== 'DOING');
  doneConnected = COLUMN_IDS.filter(id => id !== 'DONE');

  constructor() {
    // Enforce WIP limit: whenever enabled AND DOING has excess tasks, move them back
    let enforcing = false;
    effect(() => {
      const enabled = this.wipLimitEnabled();
      const doingCount = this.tasksStore.doingTasks().length;
      if (enabled && doingCount > 2 && !enforcing) {
        enforcing = true;
        setTimeout(async () => {
          await this.enforceWipLimit();
          enforcing = false;
        });
      }
    });
  }

  /**
   * Move excess DOING tasks back to TODO when WIP limit is activated.
   * Keeps the 2 oldest tasks (by updatedAt) and moves the newer ones back.
   */
  private async enforceWipLimit(): Promise<void> {
    const doingTasks = [...this.tasksStore.doingTasks()];
    if (doingTasks.length <= 2) return;

    // Sort by updatedAt ascending → oldest first
    doingTasks.sort((a, b) =>
      new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
    );

    // Keep the 2 oldest, move the rest (most recent) back to TODO
    const excess = doingTasks.slice(2);
    for (const task of excess) {
      try {
        await this.tasksStore.updateTaskStatus(String(task.id), 'TODO');
      } catch {
        // error already handled inside store
      }
    }
  }

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

  /**
   * Filtered/searched tasks per column
   */
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
   * - WIP limit: blocks drops into DOING when wipLimitEnabled and count >= 2
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
      // WIP limit: block the move if DOING would exceed 2 tasks
      if (newStatus === 'DOING' && this.wipLimitEnabled()) {
        const currentDoingCount = this.tasksStore.doingTasks().length;
        if (currentDoingCount >= 2) {
          return; // reject the drop silently
        }
      }

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
