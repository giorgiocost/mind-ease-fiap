# FocusTimer Model

Config:
- workMinutes: number
- breakMinutes: number
- autoFocusMode: boolean
- cycleLabel?: string

State:
- phase: idle | working | break | paused
- remainingSeconds: number
- startedAt?: ISO string
- completedCyclesToday: number
