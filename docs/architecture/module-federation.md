# Module Federation — MindEase

**Last Updated:** 2026-02-15  
**Status:** ✅ Implemented (Task 02)

---

## Overview

MindEase uses **Webpack 5 Module Federation** (via Nx) to implement a Micro-Frontend (MFE) architecture. The system consists of a **host shell** that orchestrates multiple independent **remote applications**, each responsible for a specific domain.

**Benefits:**
- **Independent deployment**: Each MFE can be deployed separately
- **Team autonomy**: Different teams can work on different remotes
- **Optimized loading**: Lazy-load MFEs only when needed
- **Shared dependencies**: Angular and RxJS loaded once (singleton)

---

## Architecture Diagram

```
┌───────────────────────────────────────────────────────────┐
│              HOST SHELL (Port 4200)                       │
│  - Main routing and navigation                            │
│  - Layout (header, navigation bar)                        │
│  - Authentication flow                                    │
│  - Global state management (AuthStore, PreferencesStore)  │
│  - Dynamically loads remotes at runtime                   │
└─────────────────────┬─────────────────────────────────────┘
                      │
       ┌──────────────┼──────────────┬─────────────────┐
       │              │              │                 │
       ▼              ▼              ▼                 ▼
┌─────────────┐ ┌──────────┐ ┌───────────┐ ┌──────────────┐
│mfe-dashboard│ │mfe-tasks │ │mfe-profile│ │mfe-library   │
│(Port 4201)  │ │(Port 4202│ │(Port 4203)│ │(Port 4204)   │
│             │ │          │ │           │ │              │
│Dashboard    │ │Kanban    │ │User       │ │Content       │
│Stats Cards  │ │Drag&Drop │ │Onboarding │ │Library       │
│Preferences  │ │Pomodoro  │ │Settings   │ │(Optional)    │
│             │ │          │ │           │ │              │
│exposes:     │ │exposes:  │ │exposes:   │ │exposes:      │
│./Routes     │ │./Routes  │ │./Routes   │ │./Routes      │
└─────────────┘ └──────────┘ └───────────┘ └──────────────┘
```

---

## Applications

| Application | Port | Route | Responsibility | Status |
|-------------|------|-------|----------------|--------|
| **host-shell** | 4200 | `/` | Host orchestrator, auth, layout, routing | ✅ Implemented |
| **mfe-dashboard** | 4201 | `/dashboard` | Cognitive dashboard, stats, preferences panel | ✅ Implemented |
| **mfe-tasks** | 4202 | `/tasks` | Kanban board, drag & drop, Pomodoro timer | ✅ Implemented |
| **mfe-profile** | 4203 | `/profile` | User profile, onboarding flow, settings | ✅ Implemented |
| **mfe-library** | 4204 | `/library` | Content library (optional, future) | ⏳ Planned |

---

## Host and Remotes Configuration

### Host Shell (`apps/host-shell`)
**Port:** 4200  
**File:** `apps/host-shell/module-federation.config.ts`

```typescript
{
  name: 'host-shell',
  remotes: ['mfe-dashboard', 'mfe-tasks', 'mfe-profile']
}
```

**Responsibilities:**
- Authentication (guards, interceptors)
- Global layout (header with MindEase navigation)
- Routing to remotes via `import('remoteName/Routes')`
- Shared state providers (AuthStore, PreferencesStore)

**Exposes:** Nothing (host only consumes)

**Navigation Bar:**
- Dashboard 📊
- Tasks ✅
- Profile 👤

---

### Remote: Dashboard (`mfe-dashboard`)
**Port:** 4201  
**File:** `apps/mfe-dashboard/module-federation.config.ts`

```typescript
{
  name: 'mfe-dashboard',
  exposes: {
    './Routes': 'apps/mfe-dashboard/src/app/remote-entry/entry.routes.ts'
  }
}
```

**Responsibilities:**
- Cognitive control panel (complexity, focus mode, reading mode)
- User preferences UI (contrast, font, animations)
- Stats cards (tasks completed, focus time)

---

### Remote: Tasks (`mfe-tasks`)
**Port:** 4202  
**File:** `apps/mfe-tasks/module-federation.config.ts`

```typescript
{
  name: 'mfe-tasks',
  exposes: {
    './Routes': 'apps/mfe-tasks/src/app/remote-entry/entry.routes.ts'
  }
}
```

**Responsibilities:**
- Kanban board (3 columns: To Do, Doing, Done)
- Task CRUD (create, edit, move, delete)
- Checklist items with smooth transitions
- Pomodoro-style focus timer

---

### Remote: Profile (`mfe-profile`)
**Port:** 4203  
**File:** `apps/mfe-profile/module-federation.config.ts`

```typescript
{
  name: 'mfe-profile',
  exposes: {
    './Routes': 'apps/mfe-profile/src/app/remote-entry/entry.routes.ts'
  }
}
```

**Responsibilities:**
- Onboarding wizard for first-time users
- Profile settings and recommendations
- Persona-based customization (TDAH, TEA, Dislexia, Burnout)

---

## Routing Strategy

### Dynamic Loading with `import()`

```typescript
// apps/host-shell/src/app/app.routes.ts
export const appRoutes: Route[] = [
  {
    path: 'dashboard',
    loadChildren: () => 
      import('mfe-dashboard/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'tasks',
    loadChildren: () => 
      import('mfe-tasks/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'profile',
    loadChildren: () => 
      import('mfe-profile/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: '',
    component: NxWelcome, // Will be replaced with Dashboard redirect
  },
];
```

**Routing Flow:**
1. User clicks "Dashboard" in nav bar
2. Angular Router matches `/dashboard` route
3. `loadChildren` triggers `import('mfe-dashboard/Routes')`
4. Module Federation fetches `remoteEntry.js` from port 4201
5. Remote bundle is loaded and rendered in `<router-outlet>`

### Route Guards
- All remote routes can be protected by `authGuard` (Task 12)
- Unauthenticated users will be redirected to `/login`

---

## Shared Dependencies Strategy

### Nx Auto-Configuration

**Default Behavior:**
- Nx Module Federation plugin automatically configures shared dependencies
- Angular packages are shared with `singleton: true, strictVersion: true`
- RxJS is shared as singleton
- Custom shared libraries (`@shared/*`) are auto-detected

**Benefits:**
- No manual configuration needed initially
- Optimal defaults for Angular MFE

### Future Custom Configuration (Task 08-09)

When implementing shared state (AuthStore, PreferencesStore), we can explicitly configure:

```typescript
// Example (not yet implemented)
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
npm run start:all
```

This script runs all apps concurrently for local development.

---

## Deployment Model

### Production Build

```bash
# Build all apps
nx run-many --target=build --all

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
- Ensure remote is running on correct port (`nx serve mfe-dashboard`)
- Check `module-federation.config.ts` for correct `remotes` array
- Verify network/firewall not blocking localhost ports

---

### 2. **Duplicate Angular Instances**

**Symptom:** Strange behavior, double change detection, dependency injection errors
**Cause:** `@angular/core` not set as singleton
**Fix:**
- Ensure `singleton: true` in `module-federation.config.ts` shared config
- Clear Nx cache: `nx reset`
- Rebuild: `nx run-many --target=build --all`

---

### 3. **"Cannot read properties of undefined (reading 'ɵɵdefineComponent')"**

**Cause:** Version mismatch between host and remote Angular versions
**Fix:**
- Ensure all apps use **exact same** Angular version
- Check `package.json` for mismatched versions
- Run `npm install` to sync dependencies

---

### 4. **Remote Loads Blank or "Loading..." Forever**

**Cause:** Remote failed to expose module correctly
**Fix:**
- Check remote's `module-federation.config.ts` → `exposes` section
- Verify remote's main component/module is exported correctly
- Check browser console for errors
- Ensure remote is built: `nx build mfe-dashboard`

---

### 5. **"Shared module is not available for eager consumption"**

**Cause:** Shared dependency not properly configured
**Fix:**
- Add `eager: true` to problematic shared dependency (use sparingly)
- Or ensure all apps import shared libs correctly
- Rebuild and clear cache: `nx reset && nx run-many --target=build --all`

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
