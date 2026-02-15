# Module Federation — MindEase

**Last Updated:** 2026-02-14

---

## Overview

MindEase uses **Webpack 5 Module Federation** to split the application into independently deployable micro-frontends (MFEs). The **Host Shell** orchestrates routing and authentication, while **Remotes** provide isolated feature modules.

---

## Architecture Diagram

```
┌─────────────────────────────────────────┐
│         Host Shell (Port 4200)          │
│  - Routing principal                    │
│  - Auth flow                            │
│  - Layout base (header/nav)             │
│  - Carrega remotes dinamicamente        │
└──────────┬──────────────────────────────┘
           │  loadRemoteModule()
           ├──────────────┬─────────────┬─────────────┐
           ▼              ▼             ▼             ▼
┌──────────────────┐ ┌─────────┐ ┌──────────┐ ┌───────────┐
│  mfe-dashboard   │ │mfe-tasks│ │mfe-profile│ │(future)   │
│  (Port 4201)     │ │(4202)   │ │(4203)     │ │           │
│  exposes:        │ │exposes: │ │exposes:   │ │           │
│  ./Component     │ │./Module │ │./Routes   │ │           │
└──────────────────┘ └─────────┘ └──────────┘ └───────────┘
```

---

## Host and Remotes

### Host Shell (`apps/host-shell`)
**Port:** 4200
**Responsibilities:**
- Authentication (guards, interceptors)
- Global layout (header, sidebar)
- Routing to remotes via `loadRemoteModule()`
- Shared state providers (AuthStore, PreferencesStore)

**Exposes:** Nothing (host does not expose modules)

**Consumes:**
- `mfe-dashboard/Component`
- `mfe-tasks/Module`
- `mfe-profile/Routes`

---

### Remote: Dashboard (`apps/mfe-dashboard`)
**Port:** 4201
**Responsibilities:**
- Cognitive control panel (complexity, focus mode, reading mode)
- User preferences UI (contrast, font, animations)
- Stats cards (tasks completed, focus time)

**Exposes:**
- `./Component` → `DashboardComponent`

---

### Remote: Tasks (`apps/mfe-tasks`)
**Port:** 4202
**Responsibilities:**
- Kanban board (3 columns: To Do, Doing, Done)
- Task CRUD (create, edit, move, delete)
- Checklist items with smooth transitions
- Pomodoro-style focus timer

**Exposes:**
- `./Module` → `TasksModule` (or standalone routes)

---

### Remote: Profile (`apps/mfe-profile`)
**Port:** 4203
**Responsibilities:**
- Onboarding wizard for first-time users
- Profile settings and recommendations
- Persona-based customization (TDAH, TEA, Dislexia, Burnout)

**Exposes:**
- `./Routes` → Profile routes array

---

## Routing Strategy

### Dynamic Loading with `loadRemoteModule()`

```typescript
// apps/host-shell/src/app/app.routes.ts
import { loadRemoteModule } from '@nx/angular/mf';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () =>
      loadRemoteModule('mfe-dashboard', './Component').then(
        (m) => m.DashboardComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'tasks',
    loadChildren: () =>
      loadRemoteModule('mfe-tasks', './Module').then(
        (m) => m.TasksModule
      ),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadChildren: () =>
      loadRemoteModule('mfe-profile', './Routes').then(
        (m) => m.profileRoutes
      ),
    canActivate: [authGuard],
  },
];
```

### Route Guards
- All remote routes protected by `authGuard`
- Unauthenticated users redirected to `/login`

---

## Shared Dependencies Strategy

### Singleton Packages (Critical)

These packages **must** be singletons to avoid duplicate instances:

```javascript
// module-federation.config.ts (shared by all apps)
shared: {
  '@angular/core': { singleton: true, strictVersion: true },
  '@angular/common': { singleton: true, strictVersion: true },
  '@angular/router': { singleton: true, strictVersion: true },
  'rxjs': { singleton: true, strictVersion: false },
}
```

### Shared Libraries

**DO share:**
- `@shared/ui` (design tokens, components)
- `@shared/a11y` (accessibility utilities)
- `@shared/state` (stores, signals)
- `@shared/utils` (formatters, validators)

**DO NOT share:**
- Remote-specific business logic
- Remote-specific components (keep isolated)

---

## Local Development Ports

| Application       | Port | URL                      |
|------------------|------|--------------------------|
| host-shell       | 4200 | http://localhost:4200    |
| mfe-dashboard    | 4201 | http://localhost:4201    |
| mfe-tasks        | 4202 | http://localhost:4202    |
| mfe-profile      | 4203 | http://localhost:4203    |

### Serve All MFEs (Recommended)

```bash
pnpm run start:all
```

This script runs all apps concurrently for local development.

---

## Deployment Model

### Production Build

```bash
# Build all apps
pnpm run build:all

# Output:
# dist/apps/host-shell
# dist/apps/mfe-dashboard
# dist/apps/mfe-tasks
# dist/apps/mfe-profile
```

### Deployment Strategy

1. **Host Shell**: Deployed to `https://mindease.app`
2. **Remotes**: Deployed to separate paths or subdomains:
   - `https://mindease.app/mfe-dashboard/`
   - `https://mindease.app/mfe-tasks/`
   - `https://mindease.app/mfe-profile/`

3. **Update `remotes` URLs** in module-federation.config.ts for production:

```typescript
remotes: [
  ['mfe-dashboard', 'https://mindease.app/mfe-dashboard/remoteEntry.js'],
  ['mfe-tasks', 'https://mindease.app/mfe-tasks/remoteEntry.js'],
  ['mfe-profile', 'https://mindease.app/mfe-profile/remoteEntry.js'],
]
```

### Independent Deploys

- Each remote can be deployed independently
- Host shell fetches latest `remoteEntry.js` dynamically
- **Risk:** Version mismatches (mitigate with semantic versioning + integration tests)

---

## Troubleshooting (Top 5 Issues)

### 1. **Error: "Cannot find module 'mfe-dashboard'"**

**Cause:** Remote is not running or not accessible
**Fix:**
- Ensure remote is running on correct port
- Check `module-federation.config.ts` for correct `remotes` array
- Verify network/firewall not blocking localhost ports

---

### 2. **Duplicate Angular Instances**

**Symptom:** Strange behavior, double change detection, dependency injection errors
**Cause:** `@angular/core` not set as singleton
**Fix:**
- Ensure `singleton: true` in `module-federation.config.ts` shared config
- Clear Nx cache: `pnpm nx reset`
- Rebuild: `pnpm run build:all`

---

### 3. **"Cannot read properties of undefined (reading 'ɵɵdefineComponent')"**

**Cause:** Version mismatch between host and remote Angular versions
**Fix:**
- Ensure all apps use **exact same** Angular version
- Check `package.json` for mismatched versions
- Run `pnpm install` to sync dependencies

---

### 4. **Remote Loads Blank or "Loading..." Forever**

**Cause:** Remote failed to expose module correctly
**Fix:**
- Check remote's `module-federation.config.ts` → `exposes` section
- Verify remote's main component/module is exported correctly
- Check browser console for errors
- Ensure remote is built: `pnpm nx build mfe-dashboard`

---

### 5. **"Shared module is not available for eager consumption"**

**Cause:** Shared dependency not properly configured
**Fix:**
- Add `eager: true` to problematic shared dependency (use sparingly)
- Or ensure all apps import shared libs correctly
- Rebuild and clear cache: `pnpm nx reset && pnpm run build:all`

---

## Communication Between MFEs

### ✅ Recommended: Shared State (Signals)

```typescript
// libs/shared/state/src/lib/auth.store.ts
import { signalStore } from '@ngrx/signals';

export const AuthStore = signalStore(
  { providedIn: 'root' },
  // implementation
);
```

**Usage in remotes:**
```typescript
import { inject } from '@angular/core';
import { AuthStore } from '@shared/state';

export class DashboardComponent {
  authStore = inject(AuthStore);
  user = this.authStore.user; // signal
}
```

### ⚠️ Avoid: Direct Remote-to-Remote Calls

Do not import modules directly from one remote to another. Use host shell as mediator or shared libs.

---

## References

- **[ADR-001: Nx Module Federation](../decisions/adr-001-nx-module-federation.md)**
- **[Nx Module Federation Docs](https://nx.dev/recipes/module-federation)**
- **[Webpack Module Federation](https://webpack.js.org/concepts/module-federation/)**
