import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '@shared/ui';
import { ChecklistComponent } from '../../components/checklist/checklist.component';
import { Subtask, Task } from '../../models/task.model';
import { TasksStore } from '../../store/tasks.store';

interface EditableSubtask {
  id: string;
  title: string;
  completed: boolean;
  isNew?: boolean;
}

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ChecklistComponent],
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss']
})
export class TaskCardComponent {
  private tasksStore = inject(TasksStore);
  private elementRef = inject(ElementRef);

  task = input.required<Task>();
  isEditModalOpen = signal(false);
  isSaving = signal(false);
  editTitle = signal('');
  editDescription = signal('');
  editSubtasks = signal<EditableSubtask[]>([]);

  private originalSubtasks: EditableSubtask[] = [];
  private tempSubtaskCounter = 0;
  private previousFocus: HTMLElement | null = null;

  @HostListener('keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (!this.isEditModalOpen()) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeEditModal();
      return;
    }

    if (event.key === 'Tab') {
      this.trapFocus(event);
    }
  }

  private trapFocus(event: KeyboardEvent): void {
    const modal = this.elementRef.nativeElement.querySelector('.modal-card') as HTMLElement;
    if (!modal) return;

    const focusable = modal.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private focusModal(): void {
    setTimeout(() => {
      const firstInput = this.elementRef.nativeElement.querySelector('.modal-card input') as HTMLElement;
      if (firstInput) firstInput.focus();
    });
  }

  private toEditableSubtasks(subtasks?: Subtask[]): EditableSubtask[] {
    return (subtasks || []).map(st => ({
      id: st.id,
      title: st.title,
      completed: st.completed
    }));
  }

  async handleDelete() {
    if (confirm('Deseja realmente excluir esta tarefa?')) {
      await this.tasksStore.deleteTask(String(this.task().id));
    }
  }

  async handleMove(event: Event): Promise<void> {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as 'TODO' | 'DOING' | 'DONE';
    if (newStatus === this.task().status) return;

    try {
      await this.tasksStore.updateTask(String(this.task().id), { status: newStatus });
      await this.tasksStore.loadTasks();
    } catch (error) {
      console.error('Failed to move task:', error);
      select.value = this.task().status;
    }
  }

  async handleEdit(): Promise<void> {
    try {
      const taskId = String(this.task().id);
      const fullTask = await this.tasksStore.getTaskById(taskId);
      const sourceTask = fullTask || this.task();

      this.editTitle.set(sourceTask.title || '');
      this.editDescription.set(sourceTask.description || '');

      const subtasks = this.toEditableSubtasks(sourceTask.subtasks);
      this.originalSubtasks = subtasks.map(st => ({ ...st }));
      this.editSubtasks.set(subtasks);

      this.previousFocus = document.activeElement as HTMLElement;
      this.isEditModalOpen.set(true);
      this.focusModal();
    } catch (error) {
      console.error('Failed to open edit modal:', error);
      alert('Nao foi possivel carregar os dados da tarefa para edicao.');
    }
  }

  closeEditModal(): void {
    if (this.isSaving()) return;
    this.isEditModalOpen.set(false);
    this.previousFocus?.focus();
    this.previousFocus = null;
  }

  addEditableSubtask(): void {
    this.tempSubtaskCounter += 1;
    const tempId = `tmp-${Date.now()}-${this.tempSubtaskCounter}`;
    this.editSubtasks.update(items => [
      ...items,
      { id: tempId, title: '', completed: false, isNew: true }
    ]);
  }

  removeEditableSubtask(subtaskId: string): void {
    this.editSubtasks.update(items => items.filter(st => st.id !== subtaskId));
  }

  async saveEdit(): Promise<void> {
    if (this.isSaving()) return;

    const taskId = String(this.task().id);
    const title = this.editTitle().trim();
    const description = this.editDescription().trim();

    if (!title) {
      alert('O titulo da tarefa e obrigatorio.');
      return;
    }

    const currentSubtasks = this.editSubtasks()
      .map(st => ({ ...st, title: st.title.trim() }))
      .filter(st => st.title.length > 0);

    this.isSaving.set(true);

    try {
      const currentTask = this.task();
      const currentDescription = (currentTask.description || '').trim();

      if (title !== currentTask.title || description !== currentDescription) {
        await this.tasksStore.updateTask(taskId, {
          title,
          description: description || undefined
        });
      }

      const originalMap = new Map(this.originalSubtasks.map(st => [st.id, st]));
      const editedExistingIds = new Set(
        currentSubtasks.filter(st => !st.isNew).map(st => st.id)
      );

      for (const original of this.originalSubtasks) {
        if (!editedExistingIds.has(original.id)) {
          await this.tasksStore.removeSubtask(taskId, original.id);
        }
      }

      for (const subtask of currentSubtasks) {
        if (subtask.isNew) {
          const created = await this.tasksStore.addSubtask(taskId, subtask.title);
          if (created && subtask.completed) {
            await this.tasksStore.updateSubtask(taskId, created.id, { completed: true });
          }
          continue;
        }

        const original = originalMap.get(subtask.id);
        if (!original) continue;

        const updates: { title?: string; completed?: boolean } = {};
        if (subtask.title !== original.title) updates.title = subtask.title;
        if (subtask.completed !== original.completed) updates.completed = subtask.completed;

        if (updates.title !== undefined || updates.completed !== undefined) {
          await this.tasksStore.updateSubtask(taskId, subtask.id, updates);
        }
      }

      await this.tasksStore.loadTasks();
      this.isEditModalOpen.set(false);
    } catch (error) {
      console.error('Failed to save task edit:', error);
      alert('Nao foi possivel salvar as alteracoes da tarefa.');
    } finally {
      this.isSaving.set(false);
    }
  }
}
