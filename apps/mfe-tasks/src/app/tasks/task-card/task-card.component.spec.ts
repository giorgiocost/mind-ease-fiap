import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TasksStore } from '../../store/tasks.store';
import { Task } from '../../models/task.model';
import { TaskCardComponent } from './task-card.component';

describe('TaskCardComponent', () => {
  let component: TaskCardComponent;
  let fixture: ComponentFixture<TaskCardComponent>;

  const mockStore = {
    deleteTask: jest.fn().mockResolvedValue(undefined),
    getTaskById: jest.fn(),
    updateTask: jest.fn().mockResolvedValue(undefined),
    addSubtask: jest.fn(),
    updateSubtask: jest.fn().mockResolvedValue(undefined),
    removeSubtask: jest.fn().mockResolvedValue(undefined),
    loadTasks: jest.fn().mockResolvedValue(undefined)
  };

  const baseTask: Task = {
    id: 'task-1',
    title: 'Task original',
    description: 'Descricao original',
    status: 'TODO',
    position: 0,
    createdAt: '2026-03-09T10:00:00.000Z',
    updatedAt: '2026-03-09T10:00:00.000Z',
    subtasks: [
      { id: 's1', title: 'Sub A', completed: false },
      { id: 's2', title: 'Sub B', completed: false }
    ]
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [TaskCardComponent],
      providers: [{ provide: TasksStore, useValue: mockStore }]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('task', baseTask);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open edit modal and preload task data', async () => {
    mockStore.getTaskById.mockResolvedValue(baseTask);

    await component.handleEdit();

    expect(mockStore.getTaskById).toHaveBeenCalledWith('task-1');
    expect(component.isEditModalOpen()).toBe(true);
    expect(component.editTitle()).toBe('Task original');
    expect(component.editDescription()).toBe('Descricao original');
    expect(component.editSubtasks().length).toBe(2);
  });

  it('should not save when title is empty', async () => {
    jest.spyOn(window, 'alert').mockImplementation(() => undefined);
    component.editTitle.set('   ');

    await component.saveEdit();

    expect(mockStore.updateTask).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalled();
  });

  it('should save task and subtask changes', async () => {
    mockStore.getTaskById.mockResolvedValue(baseTask);
    mockStore.addSubtask.mockResolvedValue({ id: 's3', title: 'Sub C', completed: false });

    await component.handleEdit();

    component.editTitle.set('Task editada');
    component.editDescription.set('Descricao editada');

    component.editSubtasks.set([
      { id: 's1', title: 'Sub A editada', completed: true },
      { id: 'tmp-1', title: 'Sub C', completed: true, isNew: true }
    ]);

    await component.saveEdit();

    expect(mockStore.updateTask).toHaveBeenCalledWith('task-1', {
      title: 'Task editada',
      description: 'Descricao editada'
    });

    expect(mockStore.removeSubtask).toHaveBeenCalledWith('task-1', 's2');
    expect(mockStore.updateSubtask).toHaveBeenCalledWith('task-1', 's1', {
      title: 'Sub A editada',
      completed: true
    });
    expect(mockStore.addSubtask).toHaveBeenCalledWith('task-1', 'Sub C');
    expect(mockStore.updateSubtask).toHaveBeenCalledWith('task-1', 's3', {
      completed: true
    });
    expect(mockStore.loadTasks).toHaveBeenCalled();
    expect(component.isEditModalOpen()).toBe(false);
  });
});
