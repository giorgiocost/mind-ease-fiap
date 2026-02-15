# Contracts Overview — MindEase

**Last Updated:** 2026-02-14

---

## What Are Contracts?

Contracts define the **data models** and **event schemas** shared across the MindEase system. They serve as the source of truth for communication between:
- Frontend components
- Micro-frontends (MFEs)
- Backend APIs
- Shared libraries

---

## Why Contracts Matter

✅ **Consistency**: All modules use the same data structure
✅ **Type Safety**: TypeScript interfaces prevent runtime errors
✅ **Decoupling**: MFEs don't need to know implementation details
✅ **Versioning**: Changes are tracked and documented
✅ **Testing**: Mock data matches production shape

---

## Where Contracts Live

**File Structure:**
```
docs/
  contracts/
    models/
      preferences.model.md       ← Cognitive accessibility settings
      task.model.md              ← Kanban task structure
      focus-timer.model.md       ← Pomodoro timer state
      (future: user.model.md, activity.model.md)
    events/
      events.md                  ← System events (optional)
```

**Code Implementation:**
```
libs/
  shared/
    contracts/
      src/
        lib/
          models/
            preferences.model.ts
            task.model.ts
            focus-timer.model.ts
          events/
            preferences.events.ts
            task.events.ts
```

---

## Core Models

### 1. Preferences Model

**File:** [preferences.model.md](models/preferences.model.md)

```typescript
export interface Preferences {
  complexity: 'simple' | 'medium' | 'full';
  focusMode: boolean;
  readingMode: 'summary' | 'detailed';
  contrast: 'default' | 'high';
  fontSize: number; // 14-22
  lineSpacing: number; // 1.2-2.0
  animations: 'off' | 'reduced' | 'normal';
  cognitiveAlerts: {
    thresholdsMinutes: number[]; // [25, 45, 60]
    snoozeMinutesDefault?: number;
  };
}
```

**Used by:**
- PreferencesStore (`@shared/state`)
- Dashboard preferences panel
- All UI components (to respect settings)

---

### 2. Task Model

**File:** [task.model.md](models/task.model.md)

```typescript
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'doing' | 'done';
  checklist: ChecklistItem[];
  notes?: string;
  updatedAt: string; // ISO 8601
}

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  suggested?: boolean; // AI-suggested item
}
```

**Used by:**
- TasksStore (`@shared/state`)
- Kanban board (mfe-tasks)
- Task CRUD operations

---

### 3. Focus Timer Model

**File:** [focus-timer.model.md](models/focus-timer.model.md)

```typescript
export interface FocusTimerConfig {
  workMinutes: number; // Default: 25
  breakMinutes: number; // Default: 5
  autoFocusMode: boolean; // Enable focus mode during work
  cycleLabel?: string; // "Deep Work", "Quick Task"
}

export interface FocusTimerState {
  phase: 'idle' | 'working' | 'break' | 'paused';
  remainingSeconds: number;
  startedAt?: string; // ISO 8601
  completedCyclesToday: number;
}
```

**Used by:**
- FocusTimer component (mfe-tasks)
- Dashboard stats (cycles completed)
- Cognitive alerts (time thresholds)

---

## Events (Optional)

**File:** [events.md](events/events.md)

Events are used for **loose coupling** between MFEs. Implementation is optional for MVP but documented for future expansion.

### Preferences Events
```typescript
export interface PreferencesChangedEvent {
  type: 'preferences_changed';
  fieldsChanged: string[]; // ['focusMode', 'complexity']
}
```

### Task Events
```typescript
export interface TaskMovedEvent {
  type: 'task_moved';
  taskId: string;
  from: 'todo' | 'doing' | 'done';
  to: 'todo' | 'doing' | 'done';
}

export interface ChecklistStepCompletedEvent {
  type: 'checklist_step_completed';
  taskId: string;
  itemId: string;
}
```

### Timer Events
```typescript
export interface TimerStartedEvent {
  type: 'timer_started';
  preset?: string; // "pomodoro", "short", "deep-work"
}

export interface TimerCompletedEvent {
  type: 'timer_completed';
  phase: 'working' | 'break';
}

export interface CognitiveAlertShownEvent {
  type: 'cognitive_alert_shown';
  thresholdMinutes: number;
}
```

**Implementation:** Use RxJS Subject in shared service or EventBus pattern.

---

## How Changes Are Versioned

### Versioning Strategy (Simple)

1. **Non-Breaking Changes** (safe to deploy):
   - Adding optional fields
   - Adding new event types
   - Expanding enum values (if backend supports)

2. **Breaking Changes** (requires coordination):
   - Renaming fields
   - Removing fields
   - Changing field types
   - Changing enum values

### Process for Breaking Changes

1. **Document** in ADR (e.g., `adr-006-preferences-v2.md`)
2. **Create migration path** (e.g., `PreferencesV1` → `PreferencesV2` adapter)
3. **Update contract docs** in `docs/contracts/models/`
4. **Coordinate deploy** (backend → frontend in sync)
5. **Update tests** (unit, integration, E2E)

### Versioning Example

```typescript
// libs/shared/contracts/src/lib/models/preferences.model.ts

/** @deprecated Use PreferencesV2 */
export interface Preferences {
  // old contract
}

/** @since 2026-02-20 */
export interface PreferencesV2 {
  // new contract
}
```

---

## Contract Validation

### Runtime Validation (Optional)

For critical contracts, consider using **Zod** or **class-validator**:

```typescript
import { z } from 'zod';

export const PreferencesSchema = z.object({
  complexity: z.enum(['simple', 'medium', 'full']),
  focusMode: z.boolean(),
  fontSize: z.number().min(14).max(22),
  // ...
});

export type Preferences = z.infer<typeof PreferencesSchema>;
```

**Benefits:**
- Validate API responses before using
- Catch backend/frontend mismatches early
- Generate TypeScript types from schema

---

## Testing with Contracts

### Mock Data Factories

```typescript
// libs/shared/contracts/src/lib/mocks/preferences.mock.ts

export const mockPreferences = (): Preferences => ({
  complexity: 'medium',
  focusMode: false,
  readingMode: 'summary',
  contrast: 'default',
  fontSize: 16,
  lineSpacing: 1.5,
  animations: 'reduced',
  cognitiveAlerts: {
    thresholdsMinutes: [25, 45, 60],
  },
});
```

**Usage in tests:**
```typescript
it('should render preferences panel', () => {
  const prefs = mockPreferences();
  // test implementation
});
```

---

## Best Practices

✅ **DO:**
- Keep contracts simple and flat (avoid deep nesting)
- Document default values in contract docs
- Use ISO 8601 for dates/timestamps
- Prefix boolean fields with `is`/`has`/`can` for clarity
- Use enums for limited sets of values

❌ **DON'T:**
- Put business logic in contract files
- Mix UI state with domain models
- Use `any` type (defeats the purpose of contracts)
- Change contracts without updating docs

---

## References

- **[Preferences Model](models/preferences.model.md)**
- **[Task Model](models/task.model.md)**
- **[Focus Timer Model](models/focus-timer.model.md)**
- **[Events](events/events.md)**
- **[RULES.md](../../RULES.md)** — Governance rules
