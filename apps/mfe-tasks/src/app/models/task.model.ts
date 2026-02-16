export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: 'TODO' | 'DOING' | 'DONE';
  position: number;
  wipLocked: boolean;
  createdAt: string;
  updatedAt: string;

  // Computed fields (do backend)
  checklistItemsCount?: number;
  checklistCompletedCount?: number;
  notesCount?: number;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: 'TODO' | 'DOING' | 'DONE';
  position?: number;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: 'TODO' | 'DOING' | 'DONE';
  position?: number;
  wipLocked?: boolean;
}

export interface MoveTaskDto {
  toStatus: 'TODO' | 'DOING' | 'DONE';
  position?: number;
}

export interface TasksResponse {
  data: Task[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
