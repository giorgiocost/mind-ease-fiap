# Events (opcional)

Preferences:
- preferences_changed { fieldsChanged: string[] }

Tasks:
- task_moved { taskId, from, to }
- checklist_step_completed { taskId, itemId }

Timer:
- timer_started { preset?: string }
- timer_completed { phase }
- cognitive_alert_shown { thresholdMinutes }
