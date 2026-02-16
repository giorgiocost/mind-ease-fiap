import { Injectable, computed, signal, effect, inject } from '@angular/core';
import { TasksStore } from '../store/tasks.store';
import { PreferencesStore, AuthStore } from '@shared/state';
import { Task } from '../models/task.model';

/**
 * Tasks grouped by status (for Kanban columns)
 */
export interface TasksByStatus {
  TODO: Task[];
  DOING: Task[];
  DONE: Task[];
}

/**
 * UI-specific state (not domain state)
 */
export interface UIState {
  selectedTaskId: string | null;
  isCreatingTask: boolean;
  filterText: string;
  viewMode: 'kanban' | 'list'; // Future: support list view
}

/**
 * TasksViewModel - Presentation Logic Layer (MVVM Pattern)
 *
 * Responsibilities:
 * - Transform domain state into view-specific state
 * - Compute derived values (filtering, grouping, counts)
 * - Handle UI interactions and delegate to store
 * - Manage UI-specific state (selected task, modals, filters)
 *
 * @see {@link https://angular.io/guide/signals Angular Signals}
 * @see {@link ../../docs/ADR-002-mvvm-signals.md ADR-002: MVVM Pattern}
 */
@Injectable()
export class TasksViewModel {
  private readonly tasksStore = inject(TasksStore);
  private readonly preferencesStore = inject(PreferencesStore);
  private readonly authStore = inject(AuthStore);

  // ==========================================
  // UI STATE (writable signals - internal only)
  // ==========================================
  private readonly _uiState = signal<UIState>({
    selectedTaskId: null,
    isCreatingTask: false,
    filterText: '',
    viewMode: 'kanban'
  });

  // ==========================================
  // STORE DATA (readonly signals from stores)
  // ==========================================

  /** All tasks from TasksStore */
  readonly tasks = this.tasksStore.tasks;

  /** Loading state from TasksStore */
  readonly isLoading = this.tasksStore.loading;

  /** Error state from TasksStore */
  readonly error = this.tasksStore.error;

  // Cognitive accessibility preferences
  readonly preferences = this.preferencesStore.preferences;
  readonly uiDensity = computed(() => this.preferences()?.uiDensity || 'medium');
  readonly focusMode = computed(() => this.preferences()?.focusMode || false);
  readonly contentMode = computed(() => this.preferences()?.contentMode || 'detailed');

  // ==========================================
  // COMPUTED SIGNALS (derived state)
  // ==========================================

  /**
   * Tasks filtered by search text
   */
  readonly filteredTasks = computed(() => {
    const tasks = this.tasks();
    const filter = this._uiState().filterText.toLowerCase().trim();

    if (!filter) return tasks;

    return tasks.filter(task =>
      task.title.toLowerCase().includes(filter) ||
      task.description?.toLowerCase().includes(filter)
    );
  });

  /**
   * Tasks grouped by status (for Kanban columns)
   * Sorted by position within each column
   */
  readonly tasksByStatus = computed<TasksByStatus>(() => {
    const tasks = this.filteredTasks();

    return {
      TODO: tasks.filter(t => t.status === 'TODO').sort((a, b) => a.position - b.position),
      DOING: tasks.filter(t => t.status === 'DOING').sort((a, b) => a.position - b.position),
      DONE: tasks.filter(t => t.status === 'DONE').sort((a, b) => a.position - b.position)
    };
  });

  /**
   * Counters for each column
   */
  readonly taskCounts = computed(() => {
    const byStatus = this.tasksByStatus();
    return {
      TODO: byStatus.TODO.length,
      DOING: byStatus.DOING.length,
      DONE: byStatus.DONE.length
    };
  });

  /**
   * WIP limit validation (max 2 tasks in DOING)
   * Business rule for cognitive load management
   */
  readonly canAddToDoing = computed(() => {
    return this.taskCounts().DOING < 2; // WIP limit = 2
  });

  /**
   * Currently selected task (for details view)
   */
  readonly selectedTask = computed(() => {
    const id = this._uiState().selectedTaskId;
    if (!id) return null;
    return this.tasks().find(t => t.id === id) || null;
  });

  /**
   * UI State (readonly for component)
   */
  readonly uiState = this._uiState.asReadonly();

  // ==========================================
  // EFFECTS (reactive side effects)
  // ==========================================

  constructor() {
    // Auto-load tasks when authenticated
    effect(() => {
      if (this.authStore.isAuthenticated()) {
        this.loadTasks();
      }
    }, { allowSignalWrites: true });

    // Log errors for observability
    effect(() => {
      const error = this.error();
      if (error) {
        console.error('[TasksViewModel] Error:', error);
        // TODO: Integrate with telemetry service
      }
    });
  }

  // ==========================================
  // ACTIONS (public methods for component)
  // ==========================================

  /**
   * Load all tasks from server
   */
  async loadTasks(): Promise<void> {
    try {
      await this.tasksStore.loadTasks();
    } catch (error) {
      console.error('[TasksViewModel] Failed to load tasks:', error);
    }
  }

  /**
   * Create a new task
   *
   * @param title - Task title (required, max 200 chars)
   * @param description - Task description (optional, max 2000 chars)
   * @throws {Error} If title is empty
   */
  async createTask(title: string, description?: string): Promise<void> {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      throw new Error('Task title is required');
    }

    if (trimmedTitle.length > 200) {
      throw new Error('Task title must be less than 200 characters');
    }

    this._uiState.update(state => ({ ...state, isCreatingTask: true }));

    try {
      await this.tasksStore.createTask({
        title: trimmedTitle,
        description: description?.trim(),
        status: 'TODO',
        position: this.taskCounts().TODO // Add to end of TODO column
      });

      // Close creation modal on success
      this._uiState.update(state => ({ ...state, isCreatingTask: false }));
    } catch (error) {
      console.error('[TasksViewModel] Failed to create task:', error);
      this._uiState.update(state => ({ ...state, isCreatingTask: false }));
      throw error;
    }
  }

  /**
   * Update an existing task
   *
   * @param id - Task ID
   * @param updates - Partial updates to apply
   */
  async updateTask(id: string, updates: { title?: string; description?: string }): Promise<void> {
    try {
      await this.tasksStore.updateTask(id, updates);
    } catch (error) {
      console.error('[TasksViewModel] Failed to update task:', error);
      throw error;
    }
  }

  /**
   * Delete a task
   *
   * @param id - Task ID
   */
  async deleteTask(id: string): Promise<void> {
    try {
      await this.tasksStore.deleteTask(id);

      // Clear selection if deleted task was selected
      if (this._uiState().selectedTaskId === id) {
        this._uiState.update(state => ({ ...state, selectedTaskId: null }));
      }
    } catch (error) {
      console.error('[TasksViewModel] Failed to delete task:', error);
      throw error;
    }
  }

  /**
   * Move task between columns (drag & drop)
   *
   * @param taskId - Task ID to move
   * @param toStatus - Target status (column)
   * @param toPosition - Target position in column
   * @throws {Error} If WIP limit is exceeded
   */
  async moveTask(taskId: string, toStatus: 'TODO' | 'DOING' | 'DONE', toPosition: number): Promise<void> {
    const task = this.tasks().find(t => t.id === taskId);

    // Validate WIP limit (max 2 in DOING)
    if (toStatus === 'DOING' && !this.canAddToDoing()) {
      // Allow reordering within DOING
      if (task?.status !== 'DOING') {
        throw new Error('WIP limit reached! Maximum 2 tasks in DOING column.');
      }
    }

    try {
      await this.tasksStore.moveTask(taskId, toStatus, toPosition);
    } catch (error) {
      console.error('[TasksViewModel] Failed to move task:', error);
      throw error;
    }
  }

  /**
   * Select a task (for details view)
   *
   * @param taskId - Task ID to select (null to deselect)
   */
  selectTask(taskId: string | null): void {
    this._uiState.update(state => ({ ...state, selectedTaskId: taskId }));
  }

  /**
   * Update search filter text
   *
   * @param text - Filter text (case-insensitive)
   */
  setFilterText(text: string): void {
    this._uiState.update(state => ({ ...state, filterText: text }));
  }

  /**
   * Open creation modal
   */
  openCreateTaskModal(): void {
    this._uiState.update(state => ({ ...state, isCreatingTask: true }));
  }

  /**
   * Close creation modal
   */
  closeCreateTaskModal(): void {
    this._uiState.update(state => ({ ...state, isCreatingTask: false }));
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.tasksStore.clearError();
  }
}
