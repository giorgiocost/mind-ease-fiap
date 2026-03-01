import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '@shared/ui';
import { TasksStore } from '../../store/tasks.store';
import { Task } from '../../models/task.model';
import { ChecklistComponent } from '../../components/checklist/checklist.component';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, CardComponent, ChecklistComponent],
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss']
})
export class TaskCardComponent {
  private tasksStore = inject(TasksStore);

  task = input.required<Task>();

  async handleDelete() {
    if (confirm('Deseja realmente excluir esta tarefa?')) {
      await this.tasksStore.deleteTask(String(this.task().id));
    }
  }

  handleEdit() {
    // TODO: Open edit modal
    console.log('Edit task', this.task());
  }
}
