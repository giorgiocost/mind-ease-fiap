import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { KanbanColumnComponent } from './kanban-column.component';
import { Task } from '../../models/task.model';

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

describe('KanbanColumnComponent', () => {
  let component: KanbanColumnComponent;
  let fixture: ComponentFixture<KanbanColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KanbanColumnComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(KanbanColumnComponent);
    component = fixture.componentInstance;

    // Set required inputs
    fixture.componentRef.setInput('title', 'To Do');
    fixture.componentRef.setInput('status', 'TODO');
    fixture.componentRef.setInput('tasks', []);
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve exibir o título da coluna', () => {
    expect(component.title()).toBe('To Do');
  });

  it('deve exibir o status correto', () => {
    expect(component.status()).toBe('TODO');
  });

  it('deve exibir lista vazia quando não há tasks', () => {
    expect(component.tasks().length).toBe(0);
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.empty-state')).toBeTruthy();
  });

  it('deve exibir tasks quando fornecidas', () => {
    const tasks = [
      createTask({ id: '1', title: 'Task 1' }),
      createTask({ id: '2', title: 'Task 2' }),
    ];
    fixture.componentRef.setInput('tasks', tasks);
    fixture.detectChanges();

    expect(component.tasks().length).toBe(2);
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.empty-state')).toBeFalsy();
  });

  it('deve exibir skeleton cards quando loading é true', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const skeletons = el.querySelectorAll('.skeleton-card');
    expect(skeletons.length).toBe(3);
  });

  it('deve emitir taskDropped quando onDrop é chamado', () => {
    const spy = jest.fn();
    component.taskDropped.subscribe(spy);

    const mockEvent = {
      previousContainer: { id: 'TODO', data: [] },
      container: { id: 'DOING', data: [] },
      previousIndex: 0,
      currentIndex: 0,
      item: { data: createTask() },
    } as unknown as CdkDragDrop<Task[]>;

    component.onDrop(mockEvent);

    expect(spy).toHaveBeenCalledWith(mockEvent);
  });

  it('deve exibir contagem de tasks no badge', () => {
    const tasks = [
      createTask({ id: '1' }),
      createTask({ id: '2' }),
      createTask({ id: '3' }),
    ];
    fixture.componentRef.setInput('tasks', tasks);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const badge = el.querySelector('.column-badge');
    expect(badge?.textContent?.trim()).toBe('3');
  });

  it('deve aceitar connectedTo como input', () => {
    fixture.componentRef.setInput('connectedTo', ['DOING', 'DONE']);
    fixture.detectChanges();
    expect(component.connectedTo()).toEqual(['DOING', 'DONE']);
  });
});
