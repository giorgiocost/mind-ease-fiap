# ADR-002 — MVVM + Signals Architecture

**Status:** ✅ Accepted  
**Date:** 2026-02-16  
**Deciders:** Architecture Team  
**Related:** ADR-001 (Nx + Module Federation), ADR-003 (Cognitive Tokens), Task 08, Task 09, Task 10

---

## Context

MindEase requires a **reactive state management** solution that:

1. **Scales across micro-frontends** — State must be shareable between host-shell and remotes without tight coupling
2. **Maximizes performance** — Fine-grained reactivity to avoid unnecessary re-renders
3. **Simplifies cognitive load** — API must be intuitive for developers with ADHD-friendly DX
4. **Integrates with Angular 17+** — Leverage modern Angular features (Signals, standalone components)
5. **Supports real-time updates** — UI must react instantly to user preference changes (ADR-003)

**Previous Considerations:**
- **NgRx Store (Redux pattern)** — Too much boilerplate (actions, reducers, effects, selectors)
- **RxJS BehaviorSubject** — Manual subscription management, memory leaks if not unsubscribed
- **Services with Signals** — ✅ Lightweight, reactive, automatic cleanup

**User Experience Requirements:**
- Changing a preference (e.g., font scale) must update the **entire UI instantly** without page reload
- Authentication state must be available across all micro-frontends
- State persistence (LocalStorage + API sync) must be transparent to consumers

---

## Decision

We adopt **MVVM (Model-View-ViewModel) architecture with Angular Signals** for state management.

### Architecture Layers

```
┌─────────────────────────────────────────┐
│         View (Components)               │
│  - Standalone components                │
│  - Read signals via computed()          │
│  - Call ViewModel methods               │
└────────────────┬────────────────────────┘
                 │ (consumes)
┌────────────────▼────────────────────────┐
│      ViewModel (Stores/Services)        │
│  - Injectable services (providedIn root)│
│  - Exposes readonly signals             │
│  - Exposes action methods               │
│  - React via effect()                   │
└────────────────┬────────────────────────┘
                 │ (orchestrates)
┌────────────────▼────────────────────────┐
│           Model (Domain)                │
│  - TypeScript interfaces/types          │
│  - Business logic (validation, rules)   │
│  - API contracts                        │
└─────────────────────────────────────────┘
```

### Core Principles

#### 1. **Injectable Stores with Signals**

```typescript
@Injectable({ providedIn: 'root' })
export class AuthStore {
  // Private writable signals
  private readonly _user = signal<User | null>(null);
  private readonly _loading = signal<boolean>(false);
  
  // Public readonly signals
  readonly user = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();
  
  // Computed signals (derived state)
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly userName = computed(() => this._user()?.name ?? 'Guest');
  
  // Actions (methods that mutate state)
  async login(credentials: LoginRequest): Promise<void> {
    this._loading.set(true);
    try {
      const response = await this.http.post<AuthResponse>('/auth/login', credentials);
      this._user.set(response.user);
      this._error.set(null);
    } catch (error) {
      this._error.set('Login failed');
    } finally {
      this._loading.set(false);
    }
  }
}
```

**Key Design Patterns:**
- **Private writable signals** (`_user`, `_loading`) — Only store can mutate
- **Public readonly signals** (`user`, `loading`) — Components can only read
- **Computed signals** (`isAuthenticated`) — Automatically recalculate when dependencies change
- **Action methods** (`login()`) — Encapsulate state mutations + side effects

#### 2. **Effects for Side Effects**

```typescript
@Injectable({ providedIn: 'root' })
export class PreferencesUiService {
  private prefsStore = inject(PreferencesStore);
  
  constructor() {
    // React to preference changes and update DOM
    effect(() => {
      const prefs = this.prefsStore.preferences();
      this.applyToDOM(prefs);
    });
  }
}
```

**When to use `effect()`:**
- Sync state to external systems (LocalStorage, DOM, API)
- Logging/analytics
- Trigger side effects (navigation, notifications)

**When NOT to use `effect()`:**
- Deriving state → Use `computed()` instead
- Handling user events → Use methods instead

#### 3. **State Persistence Strategy**

```typescript
constructor() {
  // Hydrate from LocalStorage on initialization
  effect(() => {
    const user = this._user();
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  });
  
  // Load from LocalStorage on startup
  const cached = localStorage.getItem(STORAGE_KEY);
  if (cached) {
    this._user.set(JSON.parse(cached));
  }
}
```

**Strategy:**
- **Optimistic updates** — Update local state immediately, sync to API in background
- **LocalStorage as cache** — Persist across page reloads
- **API as source of truth** — Periodically sync to backend

#### 4. **Component Integration**

```typescript
@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <div>
      @if (authStore.isAuthenticated()) {
        <span>Welcome, {{ authStore.userName() }}</span>
        <button (click)="authStore.logout()">Logout</button>
      } @else {
        <a routerLink="/login">Login</a>
      }
    </div>
  `
})
export class HeaderComponent {
  authStore = inject(AuthStore);
}
```

**Component Responsibilities:**
- **Inject stores** via `inject()`
- **Read signals** in template (automatic subscription)
- **Call action methods** on user events
- **No direct state mutation** (only via store methods)

---

## Consequences

### ✅ Benefits

1. **Fine-grained reactivity** — Only components consuming changed signals re-render
2. **No manual subscriptions** — Signals automatically track dependencies and cleanup
3. **Type-safe by default** — TypeScript enforces contracts between layers
4. **Testable** — Stores are plain classes, easy to mock
5. **Shareable across MFEs** — Stores in `@shared/state` available to all remotes
6. **Cognitive simplicity** — Less boilerplate than NgRx, clearer APIs than RxJS

### ⚠️ Tradeoffs

1. **No time-travel debugging** — Unlike Redux DevTools (acceptable trade-off)
2. **Less opinionated** — Requires discipline to follow patterns consistently
3. **Effect timing** — Need to understand async effects for testing (use `setTimeout` in tests)

### 📋 Implementation Checklist

- [x] AuthStore with Signals (Task 08)
- [x] PreferencesStore with Signals (Task 09)
- [x] PreferencesUiService with effect() (Task 10)
- [ ] TasksStore with Signals (Task 22)
- [ ] All stores follow MVVM pattern (private signals, public readonly, action methods)

---

## Examples in Codebase

### AuthStore
Location: `libs/shared/state/src/lib/auth/auth.store.ts`
- 28 unit tests passing
- JWT token management
- LocalStorage persistence
- Automatic token refresh

### PreferencesStore
Location: `libs/shared/state/src/lib/preferences/preferences.store.ts`
- 29 unit tests passing
- 7 cognitive preference tokens (ADR-003)
- Optimistic updates with API sync
- Auto-load when user authenticates

### PreferencesUiService
Location: `libs/shared/ui/src/lib/services/preferences-ui.service.ts`
- 20 unit tests passing
- Applies preferences to DOM via effect()
- Data attributes + CSS custom properties
- Body classes for CSS targeting

---

## References

**Angular Documentation:**
- [Angular Signals Guide](https://angular.dev/guide/signals)
- [Computed Signals](https://angular.dev/guide/signals#computed-signals)
- [Effects](https://angular.dev/guide/signals#effects)

**Related ADRs:**
- [ADR-001: Nx + Module Federation](adr-001-nx-module-federation.md)
- [ADR-003: Cognitive Tokens](adr-003-tokens-cognitivos.md)

**Tasks:**
- Task 08: Setup Auth Store
- Task 09: Setup Preferences Store
- Task 10: Setup Preferences UI Service

---

## Notes

**Why not NgRx Signal Store?**
- Considered `@ngrx/signals` but decided against it to:
  - Reduce dependencies
  - Keep stores lightweight
  - Avoid over-engineering for our use case
- May revisit if complexity grows (TasksStore, NotificationsStore, etc.)

**Migration Path (if needed):**
If we need NgRx Signal Store later:
1. Wrap existing stores with `signalStore()`
2. Keep same public API (signals + methods)
3. Add features (withDevtools, withStorage)
