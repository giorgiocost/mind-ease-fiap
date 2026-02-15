# Task Model

- id: string
- title: string
- description?: string
- status: todo | doing | done
- checklist: ChecklistItem[]
- notes?: string
- updatedAt: ISO string

ChecklistItem:
- id: string
- label: string
- done: boolean
- suggested?: boolean
