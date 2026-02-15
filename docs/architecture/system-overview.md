# System Overview — MindEase

**Last Updated:** 2026-02-14

---

## What is MindEase?

MindEase is a cognitive accessibility platform designed for users with ADHD, autism (TEA), dyslexia, and burnout. It reduces cognitive friction through adaptive UI, focus mode, customizable complexity levels, and guided task management. Built for the FIAP Inclusive Hackathon.

---

## High-Level Components

### Frontend (Nx + Module Federation)

**Host Shell** (`apps/host-shell` — Port 4200)
- Authentication flow
- Global layout (header, sidebar, navigation)
- Lazy-loads remote micro-frontends
- Routes to `/dashboard`, `/tasks`, `/profile`

**Remote: Dashboard** (`apps/mfe-dashboard` — Port 4201)
- Cognitive panel (complexity, focus mode, reading mode)
- Preferences controls (contrast, font size, animations)
- User stats and activity cards

**Remote: Tasks** (`apps/mfe-tasks` — Port 4202)
- Kanban board (To Do, Doing, Done)
- Task checklist with smooth transitions
- Pomodoro-style focus timer

**Remote: Profile** (`apps/mfe-profile` — Port 4203)
- Onboarding wizard for new users
- Personalized recommendations
- User profile settings

**Shared Libraries** (`libs/shared/*`)
- `@shared/ui` — design tokens, button, input, card, modal components
- `@shared/a11y` — cognitive accessibility utilities
- `@shared/data-access` — HTTP adapters, storage adapters
- `@shared/state` — auth store, preferences store
- `@shared/utils` — formatters, validators

### Backend API (not in scope for this repo)
- User authentication (JWT)
- Preferences sync (GET/PUT `/api/preferences`)
- Tasks CRUD (GET/POST/PATCH `/api/tasks`)
- Focus timer logs (optional: POST `/api/focus-logs`)

### Storage
- **LocalStorage**: offline preferences cache
- **SessionStorage**: temporary auth tokens (if needed)

---

## Main User Flows

### 1. First-Time User
1. Lands on login/signup
2. Completes onboarding wizard in `/profile`
3. Sets initial preferences (complexity, focus mode, reading mode)
4. Redirects to `/dashboard`

### 2. Dashboard View
1. User sees cognitive panel with current settings
2. Quick toggles for focus mode, reading mode
3. Activity stats cards (tasks completed, focus time today)
4. Navigate to `/tasks` or `/profile` via sidebar

### 3. Task Management
1. User navigates to `/tasks` (Kanban view)
2. Creates task with title, description, checklist
3. Drags task between columns (To Do → Doing → Done)
4. Checks off checklist items with smooth transitions
5. Can activate Pomodoro timer for focused work

### 4. Focus Timer
1. User starts timer from `/tasks` (preset: 25min work, 5min break)
2. Timer runs, optionally enables focus mode automatically
3. On phase completion, shows cognitive alert (time to rest)
4. User can pause, resume, or reset

### 5. Preferences Persistence
1. User changes preferences in dashboard panel
2. Changes saved to PreferencesStore (Signals-based)
3. Persisted to backend API (`PUT /api/preferences`)
4. Cached in localStorage for offline access
5. On next login, preferences restored automatically

---

## Non-Goals (Avoid Scope Creep)

❌ **Not in MVP:**
- Multi-language support (only Portuguese/English)
- Mobile native app (Web PWA only)
- Real-time collaboration / multiplayer
- AI-powered recommendations (placeholder only)
- Advanced analytics dashboard
- Social features (sharing, comments)
- Dark mode (future enhancement)
- Custom themes beyond presets

❌ **Not in this repository:**
- Backend API implementation (separate repo)
- DevOps infrastructure (CI/CD documented but not provisioned)
- User acceptance testing scripts (manual QA process)

---

## Key Technical Decisions

- **Nx Integrated Monorepo**: See [ADR-001](../decisions/adr-001-nx-module-federation.md)
- **Angular 17+ Standalone Components**: Modern, simplified API
- **Module Federation (Webpack 5)**: Independent deploy of remotes
- **Signals for State**: Reactive, fine-grained updates
- **PNPM**: Fast, disk-efficient package manager
- **Clean Architecture**: Domain/Application/Presentation/Infrastructure layers

---

## Success Metrics (Hackathon)

✅ **Must Have:**
- User can toggle focus mode and see UI changes
- User can adjust complexity (simple/medium/full)
- Tasks can be created, moved, and marked done
- Focus timer runs with pause/resume
- Preferences persist across sessions

✅ **Nice to Have:**
- Smooth animations respecting user preferences
- Cognitive alerts on timer completion
- Onboarding wizard completion
- E2E tests for critical flows

---

## Next Steps

1. **Read [Module Federation](module-federation.md)** to understand MFE setup
2. **Check [MVP Scope](../product/mvp-scope.md)** for feature checklist
3. **Follow [Task Orchestrator](../../tasks/TASK_ORCHESTRATOR.md)** for execution order
