import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { KanbanBoardComponent } from './kanban-board.component';
import { TasksStore } from '../../store/tasks.store';
import { Task } from '../../models/task.model';

// Helper to create mock tasks
function createTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Test Task',
    description: null,
    status: 'TODO',
    position: 0,
    createdAt: '2026-02-20T00:00:00.000Z',
    updatedAt: '2026-02-20T00:00:00.000Z',
    ...overrides,
  };
}

// Helper to create a mock CdkDragDrop event
function createDropEvent<T>(
  previousContainerId: string,
  containerId: string,
  previousData: T[],
  containerData: T[],
  previousIndex: number,
  currentIndex: number,
  itemData: T
): CdkDragDrop<T[]> {
  const isSameContainer = previousContainerId === containerId;
  const container = { id: containerId, data: containerData } as any;
  const previousContainer = isSameContainer
    ? container
    : ({ id: previousContainerId, data: previousData } as any);

  return {
    previousContainer,
    container,
    previousIndex,
    currentIndex,
    item: { data: itemData } as any,
    isPointerOverContainer: true,
    distance: { x: 0, y: 0 },
    dropPoint: { x: 0, y: 0 },
    event: new MouseEvent('drop'),
  } as CdkDragDrop<T[]>;
}

describe('KanbanBoardComponent — Drag & Drop', () => {
  let component: KanbanBoardComponent;
  let fixture: ComponentFixture<KanbanBoardComponent>;
  let tasksStore: TasksStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KanbanBoardComponent, HttpClientTestingModule],
      providers: [TasksStore],
    }).compileComponents();

    fixture = TestBed.createComponent(KanbanBoardComponent);
    component = fixture.componentInstance;
    tasksStore = TestBed.inject(TasksStore);
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve definir connectedTo para cada coluna excluindo a própria', () => {
    expect(component.todoConnected).toEqual(['DOING', 'DONE']);
    expect(component.doingConnected).toEqual(['TODO', 'DONE']);
    expect(component.doneConnected).toEqual(['TODO', 'DOING']);
  });

  describe('onTaskDropped — mesma coluna (reorder)', () => {
    it('deve reordenar tasks dentro da mesma coluna sem chamar updateTaskStatus', async () => {
      const tasks = [
        createTask({ id: '1', title: 'Task 1', status: 'TODO', position: 0 }),
        createTask({ id: '2', title: 'Task 2', status: 'TODO', position: 1 }),
        createTask({ id: '3', title: 'Task 3', status: 'TODO', position: 2 }),
      ];

      const updateSpy = jest.spyOn(tasksStore, 'updateTaskStatus');

      const event = createDropEvent(
        'TODO',
        'TODO',
        tasks,
        tasks,
        0,
        2,
        tasks[0]
      );

      await component.onTaskDropped(event);

      // updateTaskStatus should NOT be called for same-column reorder
      expect(updateSpy).not.toHaveBeenCalled();

      // Array should be reordered: Task 2, Task 3, Task 1
      expect(tasks[0].id).toBe('2');
      expect(tasks[1].id).toBe('3');
      expect(tasks[2].id).toBe('1');
    });
  });

  describe('onTaskDropped — coluna diferente (transfer)', () => {
    it('deve transferir task de TODO para DOING e chamar updateTaskStatus', async () => {
      const todoTasks = [
        createTask({ id: '1', title: 'Task 1', status: 'TODO' }),
      ];
      const doingTasks: Task[] = [];

      const updateSpy = jest
        .spyOn(tasksStore, 'updateTaskStatus')
        .mockResolvedValue();

      const event = createDropEvent(
        'TODO',
        'DOING',
        todoTasks,
        doingTasks,
        0,
        0,
        todoTasks[0]
      );

      await component.onTaskDropped(event);

      expect(updateSpy).toHaveBeenCalledWith('1', 'DOING');
      // Task was transferred
      expect(todoTasks.length).toBe(0);
      expect(doingTasks.length).toBe(1);
      expect(doingTasks[0].id).toBe('1');
    });

    it('deve transferir task de DOING para DONE', async () => {
      const doingTasks = [
        createTask({ id: '5', title: 'In Progress', status: 'DOING' }),
      ];
      const doneTasks: Task[] = [];

      const updateSpy = jest
        .spyOn(tasksStore, 'updateTaskStatus')
        .mockResolvedValue();

      const event = createDropEvent(
        'DOING',
        'DONE',
        doingTasks,
        doneTasks,
        0,
        0,
        doingTasks[0]
      );

      await component.onTaskDropped(event);

      expect(updateSpy).toHaveBeenCalledWith('5', 'DONE');
      expect(doingTasks.length).toBe(0);
      expect(doneTasks.length).toBe(1);
    });

    it('deve transferir task de DONE de volta para TODO', async () => {
      const doneTasks = [
        createTask({ id: '7', title: 'Reopen', status: 'DONE' }),
      ];
      const todoTasks: Task[] = [];

      const updateSpy = jest
        .spyOn(tasksStore, 'updateTaskStatus')
        .mockResolvedValue();

      const event = createDropEvent(
        'DONE',
        'TODO',
        doneTasks,
        todoTasks,
        0,
        0,
        doneTasks[0]
      );

      await component.onTaskDropped(event);

      expect(updateSpy).toHaveBeenCalledWith('7', 'TODO');
      expect(doneTasks.length).toBe(0);
      expect(todoTasks.length).toBe(1);
    });

    it('deve converter id numérico para string ao chamar updateTaskStatus', async () => {
      const todoTasks = [
        createTask({ id: 42 as any, title: 'Numeric ID', status: 'TODO' }),
      ];
      const doingTasks: Task[] = [];

      const updateSpy = jest
        .spyOn(tasksStore, 'updateTaskStatus')
        .mockResolvedValue();

      const event = createDropEvent(
        'TODO',
        'DOING',
        todoTasks,
        doingTasks,
        0,
        0,
        todoTasks[0]
      );

      await component.onTaskDropped(event);

      // Must convert to string
      expect(updateSpy).toHaveBeenCalledWith('42', 'DOING');
    });

    it('deve chamar loadTasks se updateTaskStatus falhar', async () => {
      const todoTasks = [
        createTask({ id: '1', title: 'Fail', status: 'TODO' }),
      ];
      const doingTasks: Task[] = [];

      jest
        .spyOn(tasksStore, 'updateTaskStatus')
        .mockRejectedValue(new Error('API Error'));
      const loadSpy = jest
        .spyOn(tasksStore, 'loadTasks')
        .mockResolvedValue();

      const event = createDropEvent(
        'TODO',
        'DOING',
        todoTasks,
        doingTasks,
        0,
        0,
        todoTasks[0]
      );

      await component.onTaskDropped(event);

      expect(loadSpy).toHaveBeenCalled();
    });
  });

  describe('filters e search', () => {
    it('deve definir filtro', () => {
      component.setFilter('active');
      expect(component.filter()).toBe('active');
    });

    it('deve atualizar termo de busca', () => {
      const mockEvent = {
        target: { value: 'hello' },
      } as unknown as Event;
      component.updateSearch(mockEvent);
      expect(component.searchQuery()).toBe('hello');
    });
  });
});
