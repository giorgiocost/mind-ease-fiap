# MVP Scope — MindEase (Hackathon)

**Last Updated:** 2026-02-14
**Target Delivery:** FIAP Inclusive Hackathon

---

## MVP Goal

Build a **minimal but delightful** cognitive accessibility platform that demonstrates:
1. Focus mode reduces distractions for ADHD users
2. Complexity levels adapt UI for different needs
3. Reading mode provides summary/detailed options
4. Task management with smooth, predictable flow
5. Focus timer with cognitive-friendly alerts
6. Preferences persist across sessions

---

## Core Features (Must Have)

### 1. Cognitive Control Panel (Dashboard MFE)

**Location:** `/dashboard`

**Features:**
- ✅ **Complexity Selector**: `simple` | `medium` | `full`
  - Simple: Show only essential fields and controls
  - Medium: Add secondary actions (edit, filters)
  - Full: Show all features, advanced options

- ✅ **Focus Mode Toggle**: `on` | `off`
  - On: Hide sidebar, reduce visual density, mute non-critical elements
  - Off: Full UI with all navigation and features

- ✅ **Reading Mode Selector**: `summary` | `detailed`
  - Summary: Show first 2 sentences + "See more" link
  - Detailed: Full text expanded

- ✅ **Visual Adjustments:**
  - Contrast: `default` | `high`
  - Font size: Slider 14-22px
  - Line spacing: Slider 1.2-2.0

- ✅ **Animation Control:** `off` | `reduced` | `normal`
  - Off: No transitions or animations
  - Reduced: Minimal fade/slide (< 200ms)
  - Normal: Full transitions

- ✅ **Cognitive Alerts:** Configure time thresholds (25, 45, 60 min)

---

### 2. Task Management (Tasks MFE)

**Location:** `/tasks`

**Features:**
- ✅ **Kanban Board**: 3 columns (To Do, Doing, Done)
  - Create task with title + optional description
  - Drag & drop between columns
  - Visual feedback on drop target

- ✅ **Task Checklist:**
  - Add checklist items to task
  - Check off items with smooth animation
  - Show progress indicator (e.g., "3 of 5 done")

- ✅ **Task Transitions:**
  - Gentle fade-in when creating task
  - Smooth slide when moving columns
  - Respect animation preferences

- ✅ **Filters:**
  - All tasks
  - Active (to do + doing)
  - Completed

- ✅ **Persistence:**
  - Save tasks to backend API
  - Restore on page reload/login

---

### 3. Focus Timer (Tasks MFE)

**Location:** `/tasks` (embedded component)

**Features:**
- ✅ **Presets:**
  - Pomodoro: 25 min work, 5 min break
  - Short: 15 min work, 3 min break
  - Deep Work: 45 min work, 10 min break

- ✅ **Custom Timer:** User can set custom work/break duration

- ✅ **Controls:**
  - Start → pause → resume → reset
  - Cancel at any time

- ✅ **Auto Focus Mode:**
  - Option to enable focus mode when timer starts
  - Disable when break starts or timer completes

- ✅ **Cognitive Alerts:**
  - Show gentle notification when phase completes
  - "Time to rest" or "Ready to focus again"
  - Sound (optional, user-controlled)

- ✅ **Stats (Simple):**
  - Count completed cycles today
  - Show on dashboard stats card

---

### 4. User Profile & Onboarding (Profile MFE)

**Location:** `/profile`

**Features:**
- ✅ **Onboarding Wizard (First-Time):**
  - Welcome screen
  - Select persona: TDAH, TEA, Dislexia, Burnout (or skip)
  - Quick preferences setup:
    - Complexity level
    - Focus mode default
    - Reading mode preference
    - Animation preference
  - Redirect to dashboard

- ✅ **Profile Settings:**
  - View/edit user info (name, email)
  - Change password (if auth system supports)
  - View saved preferences
  - Logout

- ✅ **Recommendations (Placeholder):**
  - "Based on your profile, we suggest..."
  - Static suggestions (no AI in MVP)
  - Examples:
    - "Try Focus Mode during morning hours"
    - "Use Pomodoro timer for deep work sessions"

---

### 5. Authentication & Persistence

**Features:**
- ✅ **Login/Signup:**
  - Email + password (or social auth if time permits)
  - JWT token stored in memory (not localStorage for security)
  - Refresh token in httpOnly cookie (backend responsibility)

- ✅ **Auth Guards:**
  - Protect all routes except `/login`, `/signup`
  - Redirect to `/login` if unauthenticated

- ✅ **Preferences Sync:**
  - Save preferences to backend API on change
  - Cache in localStorage for offline access
  - Restore on login

- ✅ **Tasks Sync:**
  - CRUD operations via backend API
  - Optimistic updates in UI
  - Handle conflicts (last-write-wins for MVP)

---

## Cognitive Accessibility Requirements

**Mandatory for ALL features:**

✅ **1. Text Guidelines**
- Headlines: < 8 words
- Descriptions: < 20 words (summary mode)
- Error messages: < 15 words, actionable
- Button labels: < 3 words, verb-first

✅ **2. Visual Hierarchy**
- Clear headings (H1 → H2 → H3)
- Consistent spacing (design tokens)
- Sections clearly separated

✅ **3. Focus Indicators**
- Visible focus outline (2px solid, high contrast)
- Keyboard navigation works everywhere
- Skip links for navigation

✅ **4. Predictability**
- Navigation always in same place
- Actions have consistent outcomes
- No surprise navigations or pop-ups

✅ **5. Feedback**
- Loading states visible (skeleton, spinner)
- Success/error messages clear and brief
- Progress indicators for multi-step flows

✅ **6. Customization**
- All preferences persist
- Changes apply immediately (no page reload)
- "Reset to defaults" option available

---

## Out of Scope (Future Enhancements)

❌ **Not in MVP:**
- Multi-language support (only Portuguese + English)
- Dark mode (use high contrast for now)
- Mobile app (PWA only)
- Notifications (push, email)
- Collaboration features (share tasks, comments)
- AI-powered recommendations (placeholder only)
- Advanced analytics (time tracking, productivity reports)
- Calendar integration
- Habit tracking
- Gamification (badges, streaks)
- Social features (friends, groups)
- Advanced task features (subtasks, dependencies, recurring)
- Offline mode (beyond basic localStorage cache)
- Export/import tasks (CSV, JSON)
- Themes beyond presets

---

## Acceptance Criteria (MVP Completion)

### Demo-Ready Features

✅ **User Journey 1: First-Time User**
1. Sign up with email/password
2. Complete onboarding wizard (select persona, set preferences)
3. Land on dashboard with cognitive panel visible
4. See "Getting Started" guidance

✅ **User Journey 2: Task Management**
1. Navigate to `/tasks`
2. Create task "Prepare presentation"
3. Add checklist: "Research topic", "Create slides", "Practice"
4. Move task from "To Do" → "Doing"
5. Check off first checklist item (smooth animation)
6. Complete task → moves to "Done"
7. Refresh page → task persists

✅ **User Journey 3: Focus Session**
1. On `/tasks` page, open Focus Timer
2. Select Pomodoro preset (25 min work, 5 min break)
3. Enable "Auto Focus Mode"
4. Start timer → UI enters focus mode (sidebar hidden)
5. Timer counts down (can fast-forward in demo)
6. Timer completes → cognitive alert shown
7. Break starts → auto exit focus mode
8. Stats updated: "1 cycle completed today"

✅ **User Journey 4: Accessibility Changes**
1. Go to dashboard
2. Change complexity: `full` → `simple`
   - Verify advanced options hidden
3. Enable focus mode
   - Verify sidebar hidden, density reduced
4. Change animations to `off`
   - Verify no transitions when moving tasks
5. Increase font size to 20px
   - Verify all text scales
6. Logout → login → all preferences restored

---

## Technical Acceptance Criteria

✅ **Code Quality:**
- All PRs pass quality gates (lint, test, build)
- Unit tests for use cases and business logic
- E2E tests for critical flows (5 scenarios)

✅ **Performance:**
- Initial load < 3 seconds (3G connection)
- Task move (drag & drop) feels instant (< 100ms)
- Preference changes apply immediately

✅ **Accessibility:**
- WCAG 2.1 Level AA (minimum)
- Keyboard navigation works
- Screen reader compatible (aria-labels, roles)

✅ **Documentation:**
- README.md with setup instructions
- Architecture docs updated
- Contracts documented
- ADRs created for key decisions

---

## Success Metrics (Post-Hackathon)

**Qualitative:**
- Demo receives positive feedback from judges
- Users understand focus mode within 30 seconds
- No confusion about task drag & drop

**Quantitative (if analytics available):**
- 80%+ users complete onboarding wizard
- 60%+ users try focus mode at least once
- 40%+ users complete at least 1 Pomodoro cycle

---

## Timeline (Hackathon)

**Phase 1 (Infrastructure) — Day 1:**
- Nx workspace setup
- Module federation config
- Design tokens + core components

**Phase 2 (Core Features) — Day 2-3:**
- Auth flow + guards
- Preferences store + UI
- Layout (header, sidebar)

**Phase 3 (MFEs) — Day 4-5:**
- Dashboard with cognitive panel
- Tasks MFE (Kanban + timer)
- Profile MFE (onboarding)

**Phase 4 (Polish) — Day 6:**
- E2E tests
- Bug fixes
- Documentation
- Demo prep

---

## References

- **[Task Orchestrator](../../tasks/TASK_ORCHESTRATOR.md)** — Detailed task breakdown
- **[Cognitive Accessibility Guide](accessibility-cognitive.md)** — UI rules and personas
- **[System Overview](../architecture/system-overview.md)** — Architecture context
- **[Quality Gates](../quality/quality-gates.md)** — Definition of Done
