# Task Model

**Last Updated:** 2026-03-01

## Task

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| id | string \| number | ✅ | ID único (json-server gera como number) |
| title | string | ✅ | Título da tarefa |
| description | string? | — | Descrição opcional |
| status | `TODO` \| `DOING` \| `DONE` | ✅ | Coluna do Kanban |
| position | number | ✅ | Posição na coluna |
| userId | string | ✅ | ID do usuário dono |
| subtasks | Subtask[] | — | Lista de subtarefas (opcional, default `[]`) |
| createdAt | ISO string | ✅ | Data de criação |
| updatedAt | ISO string | ✅ | Data da última atualização |

## Subtask

| Campo | Tipo | Descrição |
|-------|------|----------|
| id | string | ID único (ex: `sub-17-1` ou UUID) |
| title | string | Título da subtarefa |
| completed | boolean | Se foi concluída |

## TypeScript

```typescript
export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string | number;
  title: string;
  description?: string;
  status: 'TODO' | 'DOING' | 'DONE';
  position: number;
  userId: string;
  subtasks?: Subtask[];
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

## API Endpoints (mock)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/v1/tasks` | Lista tasks do usuário |
| POST | `/api/v1/tasks` | Cria nova task |
| PATCH | `/api/v1/tasks/:id` | Atualiza task |
| DELETE | `/api/v1/tasks/:id` | Remove task |
| POST | `/api/v1/tasks/:id/move` | Move task entre colunas |
| GET | `/api/v1/tasks/:id/subtasks` | Lista subtasks |
| POST | `/api/v1/tasks/:id/subtasks` | Cria subtask |
| PATCH | `/api/v1/tasks/:id/subtasks/:subtaskId` | Atualiza subtask (toggle/edit) |
| DELETE | `/api/v1/tasks/:id/subtasks/:subtaskId` | Remove subtask |

> **Nota:** `subtasks` são armazenadas inline no objeto task (não como collection separada).
