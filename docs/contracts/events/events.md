# Events (opcional)

Preferences:
- preferences_changed { fieldsChanged: string[] }

Tasks:
- task_moved { taskId, from, to }
- subtask_toggled { taskId, subtaskId, completed: boolean }
- subtask_added { taskId, subtask: Subtask }
- subtask_removed { taskId, subtaskId }

Timer:
- timer_started { preset?: string }
- timer_completed { phase }
- cognitive_alert_shown { thresholdMinutes }
