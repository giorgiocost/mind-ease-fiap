import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { TaskCardComponent } from '../task-card/task-card.component';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-kanban-column',
  standalone: true,
  imports: [CommonModule, DragDropModule, TaskCardComponent],
  templateUrl: './kanban-column.component.html',
  styleUrls: ['./kanban-column.component.scss']
})
export class KanbanColumnComponent {
  title = input.required<string>();
  status = input.required<'TODO' | 'DOING' | 'DONE'>();
  tasks = input.required<Task[]>();
  loading = input(false);

  /** IDs das listas conectadas para drag entre colunas */
  connectedTo = input<string[]>([]);

  // Output for drop event
  taskDropped = output<CdkDragDrop<Task[]>>();

  onDrop(event: CdkDragDrop<Task[]>) {
    this.taskDropped.emit(event);
  }
}
