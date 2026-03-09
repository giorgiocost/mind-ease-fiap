import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  Task,
  Subtask,
  TasksResponse,
  CreateTaskDto,
  UpdateTaskDto
} from '../models/task.model';
import { getErrorMessage } from '../utils/error-handler';

// Environment configuration
const environment = {
  apiUrl: 'http://localhost:3333/api/v1/tasks'
};

/**
 * Store reativo para gerenciamento de estado das Tasks.
 * Usa Angular Signals para reatividade e sincronização com backend.
 *
 * @example
 * ```typescript
 * export class TasksComponent {
 *   private tasksStore = inject(TasksStore);
 *
 *   tasks = this.tasksStore.tasks;
 *   loading = this.tasksStore.loading;
 *
 *   async ngOnInit() {
 *     await this.tasksStore.loadTasks();
 *   }
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class TasksStore {
  private http = inject(HttpClient);

  // API can return numeric ids while UI methods often pass string ids.
  private sameTaskId(a: string | number, b: string | number): boolean {
    return String(a) === String(b);
  }

  // ============================================
  // STATE (Private Writable Signals)
  // ============================================

  /** Lista completa de tasks */
  private _tasks = signal<Task[]>([]);

  /** Indicador de loading para operações assíncronas */
  private _loading = signal<boolean>(false);

  /** Mensagem de erro (se houver) */
  private _error = signal<string | null>(null);

  /** Filtro de status atual (null = todos) */
  private _statusFilter = signal<'TODO' | 'DOING' | 'DONE' | null>(null);

  /** Termo de busca */
  private _searchTerm = signal<string>('');

  // ============================================
  // SELECTORS (Public Readonly Signals)
  // ============================================

  /** Tasks (readonly) */
  tasks = this._tasks.asReadonly();

  /** Loading state (readonly) */
  loading = this._loading.asReadonly();

  /** Error message (readonly) */
  error = this._error.asReadonly();

  // ============================================
  // COMPUTED SIGNALS (Derived State)
  // ============================================

  /** Tasks filtradas por status */
  filteredTasks = computed(() => {
    const tasks = this._tasks();
    const filter = this._statusFilter();
    const search = this._searchTerm().toLowerCase();

    let result = tasks;

    // Aplicar filtro de status
    if (filter) {
      result = result.filter(t => t.status === filter);
    }

    // Aplicar busca
    if (search) {
      result = result.filter(t =>
        t.title.toLowerCase().includes(search) ||
        t.description?.toLowerCase().includes(search)
      );
    }

    return result;
  });

  /** Tasks TODO */
  todoTasks = computed(() =>
    this._tasks().filter(t => t.status === 'TODO').sort((a, b) => a.position - b.position)
  );

  /** Tasks DOING */
  doingTasks = computed(() =>
    this._tasks().filter(t => t.status === 'DOING').sort((a, b) => a.position - b.position)
  );

  /** Tasks DONE */
  doneTasks = computed(() =>
    this._tasks().filter(t => t.status === 'DONE').sort((a, b) => a.position - b.position)
  );

  /** Total de tasks */
  totalTasks = computed(() => this._tasks().length);

  /** Estatísticas */
  stats = computed(() => {
    const tasks = this._tasks();
    return {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'TODO').length,
      doing: tasks.filter(t => t.status === 'DOING').length,
      done: tasks.filter(t => t.status === 'DONE').length,
      completionRate: tasks.length > 0
        ? Math.round((tasks.filter(t => t.status === 'DONE').length / tasks.length) * 100)
        : 0
    };
  });

  // ============================================
  // ACTIONS (Async Methods)
  // ============================================

  /**
   * Carrega todas as tasks do backend.
   *
   * @param filters - Filtros opcionais (status, page, limit, etc)
   */
  async loadTasks(filters?: {
    status?: 'TODO' | 'DOING' | 'DONE';
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
    search?: string;
  }): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      // Construir query params
      let params = new HttpParams();
      if (filters?.status) params = params.set('status', filters.status);
      if (filters?.page) params = params.set('page', filters.page.toString());
      if (filters?.limit) params = params.set('limit', filters.limit.toString());
      if (filters?.sortBy) params = params.set('sortBy', filters.sortBy);
      if (filters?.order) params = params.set('order', filters.order);
      if (filters?.search) params = params.set('search', filters.search);

      // Request - handle both direct array and wrapped response
      const response = await firstValueFrom(
        this.http.get<Task[] | TasksResponse>(`${environment.apiUrl}`, { params })
      );

      // Handle direct array response or wrapped response
      let tasks: Task[];
      if (Array.isArray(response)) {
        // Direct array response (current API format)
        tasks = response;
      } else {
        // Wrapped response with data property
        tasks = Array.isArray(response.data) ? response.data : [];
      }

      this._tasks.set(tasks);
    } catch (error: unknown) {
      this._error.set(getErrorMessage(error) || 'Erro ao carregar tarefas');
      console.error('TasksStore.loadTasks error:', error);
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Cria nova task.
   *
   * @param dto - Dados da task
   * @returns Task criada
   */
  async createTask(dto: CreateTaskDto): Promise<Task | null> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const newTask = await firstValueFrom(
        this.http.post<Task>(`${environment.apiUrl}`, dto)
      );

      // Adicionar task ao estado (optimistic update)
      // Defensive guard: ensure tasks is always an array
      this._tasks.update(tasks => [...(tasks || []), newTask]);

      return newTask;
    } catch (error: unknown) {
      this._error.set(getErrorMessage(error) || 'Erro ao criar tarefa');
      console.error('TasksStore.createTask error:', error);
      return null;
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Atualiza task existente (partial update).
   *
   * @param id - ID da task
   * @param dto - Dados a atualizar
   */
  async updateTask(id: string, dto: UpdateTaskDto): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const updated = await firstValueFrom(
        this.http.patch<Task>(`${environment.apiUrl}/${id}`, dto)
      );

      // Atualizar task no estado
      // Defensive guard: ensure tasks is always an array
      this._tasks.update(tasks =>
        (tasks || []).map(t => this.sameTaskId(t.id, id) ? updated : t)
      );
    } catch (error: unknown) {
      this._error.set(getErrorMessage(error) || 'Erro ao atualizar tarefa');
      console.error('TasksStore.updateTask error:', error);
      throw error; // Re-throw para component handling
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Atualiza apenas o status da task.
   *
   * @param id - ID da task
   * @param status - Novo status
   */
  async updateTaskStatus(
    id: string,
    status: 'TODO' | 'DOING' | 'DONE'
  ): Promise<void> {
    await this.updateTask(id, { status });
  }

  /**
   * Move task entre colunas do Kanban (drag & drop).
   *
   * @param id - ID da task
   * @param toStatus - Status de destino
   * @param position - Posição na nova coluna (opcional)
   */
  async moveTask(
    id: string,
    toStatus: 'TODO' | 'DOING' | 'DONE',
    position?: number
  ): Promise<void> {
    try {
      // 1. POST /move para fazer a mudança no backend
      await firstValueFrom(
        this.http.post<{ task: Task }>(`${environment.apiUrl}/${id}/move`, {
          toStatus,
          position
        })
      );

      // 2. PATCH /tasks/{id} para atualizar status
      await this.updateTask(id, { status: toStatus });

      // 3. GET /tasks para recarregar todas as tasks (positions atualizadas)
      await this.loadTasks();
    } catch (error: unknown) {
      this._error.set(getErrorMessage(error) || 'Erro ao mover tarefa');
      console.error('TasksStore.moveTask error:', error);
      throw error;
    }
  }

  /**
   * Deleta task.
   *
   * @param id - ID da task
   */
  async deleteTask(id: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    // Optimistic update
    const previousTasks = this._tasks();
    // Defensive guard: ensure tasks is always an array
    this._tasks.update(tasks => (tasks || []).filter(t => !this.sameTaskId(t.id, id)));

    try {
      await firstValueFrom(
        this.http.delete(`${environment.apiUrl}/${id}`)
      );
    } catch (error: unknown) {
      // Revert optimistic update
      // Defensive guard: ensure we always set an array
      this._tasks.set(Array.isArray(previousTasks) ? previousTasks : []);
      this._error.set(getErrorMessage(error) || 'Erro ao deletar tarefa');
      console.error('TasksStore.deleteTask error:', error);
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Busca task por ID (se não estiver no cache, faz request).
   *
   * @param id - ID da task
   * @returns Task encontrada ou null
   */
  async getTaskById(id: string): Promise<Task | null> {
    // Verificar cache primeiro
    const cached = this._tasks().find(t => this.sameTaskId(t.id, id));
    if (cached) return cached;

    // Se não encontrou, buscar no backend
    this._loading.set(true);
    this._error.set(null);

    try {
      const task = await firstValueFrom(
        this.http.get<Task>(`${environment.apiUrl}/${id}`, {
          params: new HttpParams()
            .set('includeChecklist', 'true')
            .set('includeNotes', 'true')
        })
      );

      // Adicionar ao cache
      // Defensive guard: ensure tasks is always an array
      this._tasks.update(tasks => {
        const safeTasks = tasks || [];
        const exists = safeTasks.some(t => this.sameTaskId(t.id, id));
        return exists ? safeTasks : [...safeTasks, task];
      });

      return task;
    } catch (error: unknown) {
      this._error.set(getErrorMessage(error) || 'Erro ao buscar tarefa');
      console.error('TasksStore.getTaskById error:', error);
      return null;
    } finally {
      this._loading.set(false);
    }
  }

  // ============================================
  // FILTER ACTIONS
  // ============================================

  /**
   * Define filtro de status.
   */
  setStatusFilter(status: 'TODO' | 'DOING' | 'DONE' | null): void {
    this._statusFilter.set(status);
  }

  /**
   * Define termo de busca.
   */
  setSearchTerm(term: string): void {
    this._searchTerm.set(term);
  }

  /**
   * Limpa todos os filtros.
   */
  clearFilters(): void {
    this._statusFilter.set(null);
    this._searchTerm.set('');
  }

  /**
   * Limpa erro.
   */
  clearError(): void {
    this._error.set(null);
  }

  // ============================================
  // SUBTASK ACTIONS
  // ============================================

  /**
   * Toggle (completa/desfaz) uma subtarefa.
   * Optimistic update + sync com API.
   *
   * @param taskId - ID da task pai
   * @param subtaskId - ID da subtarefa
   */
  async toggleSubtask(taskId: string, subtaskId: string): Promise<void> {
    // Optimistic update local
    const previousTasks = this._tasks();
    let newCompleted = false;

    this._tasks.update(tasks =>
      tasks.map(t => {
        if (!this.sameTaskId(t.id, taskId)) return t;
        const updatedSubtasks = (t.subtasks || []).map(st => {
          if (st.id !== subtaskId) return st;
          newCompleted = !st.completed;
          return { ...st, completed: newCompleted };
        });
        const completedCount = updatedSubtasks.filter(st => st.completed).length;
        return {
          ...t,
          subtasks: updatedSubtasks,
          checklistCompletedCount: completedCount
        };
      })
    );

    try {
      await firstValueFrom(
        this.http.patch<void>(
          `${environment.apiUrl}/${taskId}/subtasks/${subtaskId}`,
          { completed: newCompleted }
        )
      );
    } catch (error: unknown) {
      // Revert on error
      this._tasks.set(previousTasks);
      this._error.set(getErrorMessage(error) || 'Erro ao atualizar subtarefa');
      console.error('TasksStore.toggleSubtask error:', error);
      throw error;
    }
  }

  /**
   * Adiciona nova subtarefa a uma task.
   * Optimistic update + sync com API.
   *
   * @param taskId - ID da task pai
   * @param title - Título da subtarefa
   */
  async addSubtask(taskId: string, title: string): Promise<Subtask | null> {
    const tempSubtask: Subtask = {
      id: crypto.randomUUID(),
      title,
      completed: false
    };

    // Optimistic update local
    const previousTasks = this._tasks();
    this._tasks.update(tasks =>
      tasks.map(t => {
        if (!this.sameTaskId(t.id, taskId)) return t;
        const updatedSubtasks = [...(t.subtasks || []), tempSubtask];
        return {
          ...t,
          subtasks: updatedSubtasks,
          checklistItemsCount: updatedSubtasks.length
        };
      })
    );

    try {
      const created = await firstValueFrom(
        this.http.post<Subtask>(
          `${environment.apiUrl}/${taskId}/subtasks`,
          { title }
        )
      );

      // Replace temp ID with the real one from API
      this._tasks.update(tasks =>
        tasks.map(t => {
          if (!this.sameTaskId(t.id, taskId)) return t;
          return {
            ...t,
            subtasks: (t.subtasks || []).map(st =>
              st.id === tempSubtask.id ? created : st
            )
          };
        })
      );

      return created;
    } catch (error: unknown) {
      this._tasks.set(previousTasks);
      this._error.set(getErrorMessage(error) || 'Erro ao adicionar subtarefa');
      console.error('TasksStore.addSubtask error:', error);
      throw error;
    }
  }

  /**
   * Atualiza subtarefa existente (título e/ou status concluído).
   * Optimistic update + sync com API.
   */
  async updateSubtask(
    taskId: string,
    subtaskId: string,
    updates: { title?: string; completed?: boolean }
  ): Promise<void> {
    if (updates.title === undefined && updates.completed === undefined) {
      return;
    }

    const previousTasks = this._tasks();

    // Optimistic update local
    this._tasks.update(tasks =>
      tasks.map(t => {
        if (!this.sameTaskId(t.id, taskId)) return t;

        const updatedSubtasks = (t.subtasks || []).map(st => {
          if (st.id !== subtaskId) return st;
          return {
            ...st,
            ...(updates.title !== undefined ? { title: updates.title } : {}),
            ...(updates.completed !== undefined ? { completed: updates.completed } : {})
          };
        });

        return {
          ...t,
          subtasks: updatedSubtasks,
          checklistCompletedCount: updatedSubtasks.filter(st => st.completed).length
        };
      })
    );

    try {
      await firstValueFrom(
        this.http.patch<void>(
          `${environment.apiUrl}/${taskId}/subtasks/${subtaskId}`,
          updates
        )
      );
    } catch (error: unknown) {
      this._tasks.set(previousTasks);
      this._error.set(getErrorMessage(error) || 'Erro ao atualizar subtarefa');
      console.error('TasksStore.updateSubtask error:', error);
      throw error;
    }
  }

  /**
   * Remove uma subtarefa.
   * Optimistic update + sync com API.
   *
   * @param taskId - ID da task pai
   * @param subtaskId - ID da subtarefa
   */
  async removeSubtask(taskId: string, subtaskId: string): Promise<void> {
    const previousTasks = this._tasks();

    // Optimistic update local
    this._tasks.update(tasks =>
      tasks.map(t => {
        if (!this.sameTaskId(t.id, taskId)) return t;
        const updatedSubtasks = (t.subtasks || []).filter(st => st.id !== subtaskId);
        return {
          ...t,
          subtasks: updatedSubtasks,
          checklistItemsCount: updatedSubtasks.length,
          checklistCompletedCount: updatedSubtasks.filter(st => st.completed).length
        };
      })
    );

    try {
      await firstValueFrom(
        this.http.delete<void>(
          `${environment.apiUrl}/${taskId}/subtasks/${subtaskId}`
        )
      );
    } catch (error: unknown) {
      this._tasks.set(previousTasks);
      this._error.set(getErrorMessage(error) || 'Erro ao remover subtarefa');
      console.error('TasksStore.removeSubtask error:', error);
      throw error;
    }
  }
}
