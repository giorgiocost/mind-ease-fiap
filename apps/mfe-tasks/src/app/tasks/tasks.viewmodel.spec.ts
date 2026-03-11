import { HttpClientTestingModule } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { AuthStore, PreferencesStore } from '@shared/state';
import { Task } from '../models/task.model';
import { TasksStore } from '../store/tasks.store';
import { TasksViewModel } from './tasks.viewmodel';

// -----------------------------------------------
// Helpers
// -----------------------------------------------

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: overrides.id ?? '1',
    title: overrides.title ?? 'Task',
    status: overrides.status ?? 'TODO',
    position: overrides.position ?? 0,
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    updatedAt: overrides.updatedAt ?? new Date().toISOString(),
    ...overrides,
  };
}

// -----------------------------------------------
// Fake stores (minimal signal-based stubs)
// -----------------------------------------------

function makeFakeTasksStore(initialTasks: Task[] = []) {
  const _tasks = signal<Task[]>(initialTasks);
  return {
    tasks: _tasks.asReadonly(),
    loading: signal(false).asReadonly(),
    error: signal<string | null>(null).asReadonly(),
    loadTasks: jest.fn().mockResolvedValue(undefined),
    /** Test helper — update internal signal */
    _set: (tasks: Task[]) => _tasks.set(tasks),
  };
}

function makeFakePreferencesStore() {
  const _focusMode = signal(false);
  const _wipLimitEnabled = signal(true);
  return {
    preferences: signal({ uiDensity: 'medium', focusMode: false, contentMode: 'detailed', contrast: 'normal', fontScale: 1, spacingScale: 1, motion: 'full', wipLimitEnabled: true }).asReadonly(),
    uiDensity: signal<'simple' | 'medium' | 'detailed'>('medium').asReadonly(),
    focusMode: _focusMode.asReadonly(),
    contentMode: signal<'summary' | 'detailed'>('detailed').asReadonly(),
    contrast: signal<'normal' | 'high'>('normal').asReadonly(),
    fontScale: signal(1).asReadonly(),
    spacingScale: signal(1).asReadonly(),
    motion: signal<'full' | 'reduced'>('full').asReadonly(),
    wipLimitEnabled: _wipLimitEnabled.asReadonly(),
    _setFocusMode: (v: boolean) => _focusMode.set(v),
    _setWipLimitEnabled: (v: boolean) => _wipLimitEnabled.set(v),
  };
}

function makeFakeAuthStore() {
  const _isAuthenticated = signal(false);
  return {
    isAuthenticated: _isAuthenticated.asReadonly(),
    user: signal(null).asReadonly(),
    _setAuthenticated: (v: boolean) => _isAuthenticated.set(v),
  };
}

// -----------------------------------------------
// Tests
// -----------------------------------------------

describe('TasksViewModel', () => {
  let vm: TasksViewModel;
  let fakeTasksStore: ReturnType<typeof makeFakeTasksStore>;
  let fakePrefsStore: ReturnType<typeof makeFakePreferencesStore>;
  let fakeAuthStore: ReturnType<typeof makeFakeAuthStore>;

  beforeEach(() => {
    fakeTasksStore = makeFakeTasksStore();
    fakePrefsStore = makeFakePreferencesStore();
    fakeAuthStore = makeFakeAuthStore();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TasksViewModel,
        { provide: TasksStore, useValue: fakeTasksStore },
        { provide: PreferencesStore, useValue: fakePrefsStore },
        { provide: AuthStore, useValue: fakeAuthStore },
      ],
    });

    vm = TestBed.inject(TasksViewModel);
  });

  // ---- activeTaskId -------------------------------------------------

  describe('activeTaskId()', () => {
    it('returns null when there are no tasks', () => {
      expect(vm.activeTaskId()).toBeNull();
    });

    it('returns null when all tasks are DONE', () => {
      fakeTasksStore._set([
        makeTask({ id: '1', status: 'DONE', createdAt: '2024-01-01T00:00:00Z' }),
      ]);
      expect(vm.activeTaskId()).toBeNull();
    });

    it('returns the oldest TODO task when there are no DOING tasks', () => {
      fakeTasksStore._set([
        makeTask({ id: 'new', status: 'TODO', position: 0, createdAt: '2024-06-01T00:00:00Z' }),
        makeTask({ id: 'old', status: 'TODO', position: 1, createdAt: '2024-01-01T00:00:00Z' }),
        makeTask({ id: 'mid', status: 'TODO', position: 2, createdAt: '2024-03-01T00:00:00Z' }),
      ]);
      expect(vm.activeTaskId()).toBe('old');
    });

    it('returns the oldest DOING task (ignores TODO)', () => {
      fakeTasksStore._set([
        makeTask({ id: 'todo-old',  status: 'TODO',  position: 0, createdAt: '2023-01-01T00:00:00Z' }),
        makeTask({ id: 'doing-new', status: 'DOING', position: 0, createdAt: '2024-06-01T00:00:00Z' }),
        makeTask({ id: 'doing-old', status: 'DOING', position: 1, createdAt: '2024-01-01T00:00:00Z' }),
      ]);
      expect(vm.activeTaskId()).toBe('doing-old');
    });

    it('returns the single DOING task when only one exists', () => {
      fakeTasksStore._set([
        makeTask({ id: 'sole-doing', status: 'DOING', position: 0, createdAt: '2024-01-01T00:00:00Z' }),
      ]);
      expect(vm.activeTaskId()).toBe('sole-doing');
    });
  });

  // ---- tasksByStatus ------------------------------------------------

  describe('tasksByStatus()', () => {
    it('groups tasks correctly by status', () => {
      fakeTasksStore._set([
        makeTask({ id: '1', status: 'TODO',  position: 0 }),
        makeTask({ id: '2', status: 'DOING', position: 0 }),
        makeTask({ id: '3', status: 'DONE',  position: 0 }),
        makeTask({ id: '4', status: 'TODO',  position: 1 }),
      ]);

      const groups = vm.tasksByStatus();
      expect(groups.TODO.length).toBe(2);
      expect(groups.DOING.length).toBe(1);
      expect(groups.DONE.length).toBe(1);
    });

    it('sorts tasks within a column by position', () => {
      fakeTasksStore._set([
        makeTask({ id: 'b', status: 'TODO', position: 2 }),
        makeTask({ id: 'a', status: 'TODO', position: 0 }),
        makeTask({ id: 'c', status: 'TODO', position: 5 }),
      ]);

      const ids = vm.tasksByStatus().TODO.map(t => t.id);
      expect(ids).toEqual(['a', 'b', 'c']);
    });

    it('returns empty arrays when there are no tasks', () => {
      const groups = vm.tasksByStatus();
      expect(groups.TODO).toEqual([]);
      expect(groups.DOING).toEqual([]);
      expect(groups.DONE).toEqual([]);
    });
  });

  // ---- canAddToDoing ------------------------------------------------

  describe('canAddToDoing()', () => {
    it('returns true when DOING has 0 tasks', () => {
      expect(vm.canAddToDoing()).toBe(true);
    });

    it('returns true when DOING has 1 task', () => {
      fakeTasksStore._set([
        makeTask({ id: '1', status: 'DOING', position: 0 }),
      ]);
      expect(vm.canAddToDoing()).toBe(true);
    });

    it('returns false when DOING has 2 tasks (WIP limit reached)', () => {
      fakeTasksStore._set([
        makeTask({ id: '1', status: 'DOING', position: 0 }),
        makeTask({ id: '2', status: 'DOING', position: 1 }),
      ]);
      expect(vm.canAddToDoing()).toBe(false);
    });

    it('returns false when DOING has more than 2 tasks', () => {
      fakeTasksStore._set([
        makeTask({ id: '1', status: 'DOING', position: 0 }),
        makeTask({ id: '2', status: 'DOING', position: 1 }),
        makeTask({ id: '3', status: 'DOING', position: 2 }),
      ]);
      expect(vm.canAddToDoing()).toBe(false);
    });
  });

  // ---- focusMode (delegation) ----------------------------------------

  describe('focusMode()', () => {
    it('reflects the preferences store value', () => {
      expect(vm.focusMode()).toBe(false);
      fakePrefsStore._setFocusMode(true);
      expect(vm.focusMode()).toBe(true);
    });
  });
});
