import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ChecklistComponent } from './checklist.component';
import { TasksStore } from '../../store/tasks.store';
import { Subtask } from '../../models/task.model';

const MOCK_SUBTASKS: Subtask[] = [
  { id: '1', title: 'Pesquisar requisitos', completed: true },
  { id: '2', title: 'Criar protótipo', completed: true },
  { id: '3', title: 'Implementar feature', completed: false },
  { id: '4', title: 'Escrever testes', completed: false }
];

describe('ChecklistComponent', () => {
  let component: ChecklistComponent;
  let fixture: ComponentFixture<ChecklistComponent>;
  let tasksStore: TasksStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChecklistComponent],
      providers: [
        TasksStore,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChecklistComponent);
    component = fixture.componentInstance;
    tasksStore = TestBed.inject(TasksStore);

    fixture.componentRef.setInput('taskId', 'task-1');
    fixture.componentRef.setInput('subtasks', MOCK_SUBTASKS);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate progress correctly (2/4 = 50%)', () => {
    expect(component.completedCount()).toBe(2);
    expect(component.totalCount()).toBe(4);
    expect(component.progress()).toBe(50);
  });

  it('should return 0% progress when no subtasks', () => {
    fixture.componentRef.setInput('subtasks', []);
    fixture.detectChanges();
    expect(component.progress()).toBe(0);
  });

  it('should return 100% when all completed', () => {
    const allDone: Subtask[] = MOCK_SUBTASKS.map(s => ({ ...s, completed: true }));
    fixture.componentRef.setInput('subtasks', allDone);
    fixture.detectChanges();
    expect(component.progress()).toBe(100);
  });

  it('should call tasksStore.toggleSubtask with correct ids', async () => {
    jest.spyOn(tasksStore, 'toggleSubtask').mockResolvedValue();
    await component.toggleSubtask('1');
    expect(tasksStore.toggleSubtask).toHaveBeenCalledWith('task-1', '1');
  });

  it('should call tasksStore.addSubtask and reset state', async () => {
    jest.spyOn(tasksStore, 'addSubtask').mockResolvedValue();
    component.newSubtaskTitle.set('Nova tarefa');
    await component.addSubtask();
    expect(tasksStore.addSubtask).toHaveBeenCalledWith('task-1', 'Nova tarefa');
    expect(component.newSubtaskTitle()).toBe('');
    expect(component.isAddingSubtask()).toBe(false);
  });

  it('should not call addSubtask if title is empty', async () => {
    jest.spyOn(tasksStore, 'addSubtask').mockResolvedValue();
    component.newSubtaskTitle.set('  ');
    await component.addSubtask();
    expect(tasksStore.addSubtask).not.toHaveBeenCalled();
  });

  it('should call tasksStore.removeSubtask when confirmed', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    jest.spyOn(tasksStore, 'removeSubtask').mockResolvedValue();
    await component.removeSubtask('2');
    expect(tasksStore.removeSubtask).toHaveBeenCalledWith('task-1', '2');
  });

  it('should NOT call removeSubtask when user cancels confirm', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(false);
    jest.spyOn(tasksStore, 'removeSubtask').mockResolvedValue();
    await component.removeSubtask('2');
    expect(tasksStore.removeSubtask).not.toHaveBeenCalled();
  });

  it('should toggle isAddingSubtask on startAddingSubtask/cancel', () => {
    expect(component.isAddingSubtask()).toBe(false);
    component.startAddingSubtask();
    expect(component.isAddingSubtask()).toBe(true);
    component.cancelAddingSubtask();
    expect(component.isAddingSubtask()).toBe(false);
    expect(component.newSubtaskTitle()).toBe('');
  });
});
