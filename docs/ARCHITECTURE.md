# Architecture Documentation

## Overview

MindEase utiliza **Module Federation** para criar uma arquitetura de micro-frontends onde cada feature domain pode ser desenvolvida, testada e deployada de forma independente.

**Stack principal:**
- Angular 21+ (Standalone Components + Signals)
- Nx 22 Monorepo
- @module-federation/enhanced
- Signal-based stores (sem NgRx)
- SCSS + CSS Custom Properties

---

## C4 Model

### Nível 1 — Context Diagram

```
┌──────────────────────────────────────────┐
│                                          │
│           Usuário (Browser)              │
│  (pessoa com TDAH / necessidade cognitiva)│
│                                          │
└────────────────┬─────────────────────────┘
                 │ HTTPS
                 ▼
┌──────────────────────────────────────────┐
│                                          │
│         MindEase Frontend                │
│    Angular 21 + Module Federation        │
│         (Vercel CDN)                     │
│                                          │
└────────────────┬─────────────────────────┘
                 │ REST API (JSON)
                 ▼
┌──────────────────────────────────────────┐
│                                          │
│         MindEase Backend                 │
│       (Node.js + PostgreSQL)             │
│                                          │
└──────────────────────────────────────────┘
```

### Nível 2 — Container Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        MindEase Frontend                         │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                      host-shell :4200                       │ │
│  │  Routing / Layout / Auth Guard / Header / Sidebar           │ │
│  │                                                             │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │ │
│  │  │mfe-dashboard │  │  mfe-tasks   │  │   mfe-profile    │  │ │
│  │  │    :4201     │  │    :4202     │  │      :4203       │  │ │
│  │  │              │  │              │  │                  │  │ │
│  │  │ Stats cards  │  │ Kanban board │  │ Onboarding flow  │  │ │
│  │  │ Preferences  │  │ Pomodoro     │  │ Profile settings │  │ │
│  │  │ panel        │  │ timer        │  │                  │  │ │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                         libs/                               │ │
│  │   shared/ui  shared/services  domain  application  infra    │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### Nível 3 — Component Diagram (host-shell)

```
host-shell
├── AppComponent           ← root, providers, router-outlet
├── LayoutComponent        ← header + sidebar + content shell
├── HeaderComponent        ← logo, user menu, logout
├── SidebarComponent       ← navigation links
└── app.routes.ts          ← lazy-loads MFE remotes
    ├── /dashboard  → mfe-dashboard/Routes
    ├── /tasks      → mfe-tasks/Routes
    └── /profile    → mfe-profile/Routes
```

---

## Module Federation

### Configuração do host

```typescript
// apps/host-shell/module-federation.config.ts
export const config: ModuleFederationConfig = {
  name: 'host-shell',
  remotes: ['mfe-dashboard', 'mfe-tasks', 'mfe-profile'],
};
```

### Configuração de um remote

```typescript
// apps/mfe-tasks/module-federation.config.ts
export const config: ModuleFederationConfig = {
  name: 'mfe-tasks',
  exposes: {
    './Routes': 'apps/mfe-tasks/src/app/remote-entry/entry.routes.ts',
  },
};
```

### Roteamento lazy

```typescript
// apps/host-shell/src/app/app.routes.ts
{
  path: 'tasks',
  loadChildren: () => loadRemoteModule('mfe-tasks', './Routes'),
},
```

---

## State Management

### Signal-based Store pattern

```typescript
@Injectable({ providedIn: 'root' })
export class TasksStore {
  private _tasks = signal<Task[]>([]);
  private _loading = signal(false);

  readonly allTasks   = this._tasks.asReadonly();
  readonly isLoading  = this._loading.asReadonly();
  readonly todoTasks  = computed(() =>
    this._tasks().filter(t => t.status === 'TODO'));
  readonly doingTasks = computed(() =>
    this._tasks().filter(t => t.status === 'DOING'));
  readonly doneTasks  = computed(() =>
    this._tasks().filter(t => t.status === 'DONE'));

  async loadTasks(): Promise<void> {
    this._loading.set(true);
    const tasks = await firstValueFrom(this.http.get<Task[]>('/api/v1/tasks'));
    this._tasks.set(tasks);
    this._loading.set(false);
  }
}
```

### Auth Store

```typescript
// localStorage key: 'mindease_auth'
// Shape: { user: User, accessToken: string, refreshToken: string }

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}
```

---

## Design System

### Tokens Cognitivos

Os tokens são servidos via `PreferencesStore` e injetados como atributos `data-*` no elemento raiz:

```html
<div class="dashboard"
     [attr.data-ui-density]="preferences.uiDensity"
     [attr.data-focus-mode]="preferences.focusMode"
     [attr.data-contrast]="preferences.contrast">
```

```scss
// Exemplo de consumo
[data-ui-density="simple"] {
  --card-padding: 8px;
  --font-size-body: 0.9rem;
}

[data-ui-density="full"] {
  --card-padding: 24px;
  --font-size-body: 1rem;
}
```

### Hierarquia de tokens

```
Base tokens           → $color-primary: #4f46e5
  ↓
Semantic tokens       → $color-interactive: $color-primary
  ↓
Component tokens      → .button { background: var(--color-interactive) }
  ↓
Cognitive overrides   → [data-ui-density="simple"] { .button { padding: 4px } }
```

---

## Segurança

### Fluxo de autenticação

```
1. POST /api/v1/auth/login { email, password }
2. Backend valida credenciais
3. Retorna { user, accessToken (15min), refreshToken (7d) }
4. AuthStore salva em localStorage ('mindease_auth')
5. AuthInterceptor injeta Bearer token em cada request
6. Em 401 → AuthInterceptor faz refresh automático
7. Em falha de refresh → logout + redirect /login
```

### AuthGuard

```typescript
export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router    = inject(Router);
  return authStore.isAuthenticated()
    ? true
    : router.createUrlTree(['/login']);
};
```

---

## Performance

### Estratégias de otimização

1. **Lazy loading** — cada MFE carrega apenas quando a rota é acessada
2. **Code splitting** — Webpack MF cria chunks separados por remote
3. **Angular build AOT + tree-shaking** — remove código não utilizado
4. **CSS Custom Properties** — mudanças de tema sem re-render
5. **OnPush + Signals** — re-renders mínimos

### Tamanhos estimados de bundle (gzipped)

| App | Tamanho |
|-----|---------|
| host-shell | ~250 KB |
| mfe-dashboard | ~80 KB |
| mfe-tasks | ~120 KB |
| mfe-profile | ~60 KB |
| libs (shared) | ~180 KB |

---

## Estratégia de testes

### Pirâmide de testes

```
        /\
       /  \    E2E — Playwright
      /    \   5 critical flows
     /──────\  (smoke + critical tags)
    /        \
   / Jest     \ Integration / Unit
  / 80%+ cov  \ ~unit por store, component, service
 /──────────────\
```

### E2E — Flows cobertos

| Flow | Arquivo |
|------|---------|
| Login + Dashboard | `flow1-login-dashboard.spec.ts` |
| Register + Onboarding | `flow2-register-onboarding.spec.ts` |
| Task Management (Kanban) | `flow3-task-management.spec.ts` |
| Pomodoro Timer | `flow4-pomodoro.spec.ts` |
| Preferences Update | `flow5-preferences-update.spec.ts` |
| Full smoke suite | `all-flows.spec.ts` |

---

## CI/CD Pipeline

```
GitHub Push
    │
    ├─ lint (ESLint)
    │       │
    │       └─ test (Jest + Codecov)
    │               │
    │               └─ build (all MFEs, production)
    │                       │
    │                       └─ e2e (Playwright, Chromium)
    │                               │
    │                         [main only]
    │                               │
    │                               └─ deploy (Vercel)
    │
    └─ [PR] deploy-preview + comment
```

---

## ADRs

| ADR | Decisão |
|-----|---------|
| [ADR-001](decisions/adr-001-nx-module-federation.md) | Nx + Module Federation como base |
| [ADR-002](decisions/adr-002-mvvm-signals-architecture.md) | MVVM com Angular Signals |
| [ADR-003](decisions/adr-003-tokens-cognitivos.md) | Tokens cognitivos de acessibilidade |
| [ADR-005](decisions/adr-005-boundaries-and-tags.md) | Boundaries e tags Nx |

---

## Referências

- [Nx Module Federation](https://nx.dev/recipes/module-federation)
- [Angular Signals](https://angular.dev/guide/signals)
- [C4 Model](https://c4model.com/)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
