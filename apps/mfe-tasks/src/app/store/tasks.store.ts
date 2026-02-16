import { Injectable, signal } from '@angular/core';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'doing' | 'done';
  createdAt: string;
}

@Injectable()
export class TasksStore {
  private _tasks = signal<Task[]>([]);
  private _loading = signal(false);

  readonly allTasks = this._tasks.asReadonly();
  readonly loading = this._loading.asReadonly();

  async loadTasks() {
    this._loading.set(true);

    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500));

    this._tasks.set([
      { id: '1', title: 'Task 1', status: 'todo', createdAt: new Date().toISOString() },
      { id: '2', title: 'Task 2', status: 'doing', createdAt: new Date().toISOString() },
      { id: '3', title: 'Task 3', status: 'done', createdAt: new Date().toISOString() }
    ]);

    this._loading.set(false);
  }
}
