import { Component, input, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TasksStore } from '../../store/tasks.store';
import { Subtask } from '../../models/task.model';

@Component({
  selector: 'app-checklist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checklist.component.html',
  styleUrls: ['./checklist.component.scss']
})
export class ChecklistComponent {
  private tasksStore = inject(TasksStore);

  // Inputs
  taskId = input.required<string>();
  subtasks = input.required<Subtask[]>();

  // State
  newSubtaskTitle = signal('');
  isAddingSubtask = signal(false);

  // Computed
  completedCount = computed(() =>
    this.subtasks().filter(st => st.completed).length
  );

  totalCount = computed(() => this.subtasks().length);

  progress = computed(() => {
    const total = this.totalCount();
    if (total === 0) return 0;
    return Math.round((this.completedCount() / total) * 100);
  });

  // Actions
  async toggleSubtask(subtaskId: string): Promise<void> {
    await this.tasksStore.toggleSubtask(this.taskId(), subtaskId);
  }

  startAddingSubtask(): void {
    this.isAddingSubtask.set(true);
  }

  async addSubtask(): Promise<void> {
    const title = this.newSubtaskTitle().trim();
    if (!title) return;

    await this.tasksStore.addSubtask(this.taskId(), title);
    this.newSubtaskTitle.set('');
    this.isAddingSubtask.set(false);
  }

  cancelAddingSubtask(): void {
    this.newSubtaskTitle.set('');
    this.isAddingSubtask.set(false);
  }

  async removeSubtask(subtaskId: string): Promise<void> {
    if (confirm('Remover subtarefa?')) {
      await this.tasksStore.removeSubtask(this.taskId(), subtaskId);
    }
  }
}
