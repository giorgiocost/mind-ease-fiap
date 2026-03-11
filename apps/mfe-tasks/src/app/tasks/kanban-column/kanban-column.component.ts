import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { Task } from '../../models/task.model';
import { TaskCardComponent } from '../task-card/task-card.component';

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
