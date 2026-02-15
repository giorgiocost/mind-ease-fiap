# Quality Gates — MindEase

**Last Updated:** 2026-02-14

---

## Overview

Quality Gates define the **minimum requirements** for merging code into `main`. All PRs must pass these checks before approval.

---

## Automated Checks (CI Pipeline)

### 1. Linting

**Command:** `pnpm run lint:all`

**Requirements:**
- ✅ No ESLint errors (warnings allowed, but discouraged)
- ✅ Nx module boundaries respected (no circular deps)
- ✅ TypeScript strict mode passes (`noImplicitAny`, `strictNullChecks`)

**Common Issues:**
- Unused imports
- Missing types (`any` used instead of proper type)
- Violating layer boundaries (UI importing infrastructure directly)

---

### 2. Type Checking

**Command:** `pnpm nx run-many --target=type-check --all`

**Requirements:**
- ✅ All TypeScript compiles without errors
- ✅ No `@ts-ignore` or `@ts-expect-error` without justification

---

### 3. Unit Tests

**Command:** `pnpm run test:all`

**Requirements:**
- ✅ All tests pass
- ✅ No tests skipped (`.skip()` or `xit()`) without JIRA ticket
- ✅ Coverage thresholds met (see below)

**Coverage Targets (MVP):**
- **Domain logic:** 80% minimum
- **Application use cases:** 70% minimum
- **Presentation components:** 50% minimum (focus on smart components)
- **Infrastructure adapters:** 60% minimum

**What to Test:**
- ✅ Use cases and business rules
- ✅ State management (stores, signals)
- ✅ Data transformations (mappers, formatters)
- ✅ Critical UI logic (validation, error handling)

**What NOT to Test (avoid over-testing):**
- ❌ Trivial getters/setters
- ❌ Angular framework internals
- ❌ Third-party library behavior

---

### 4. Build

**Command:** `pnpm run build:all`

**Requirements:**
- ✅ All apps and libs build successfully
- ✅ No build warnings (bundle size, deprecated APIs)
- ✅ Dist output is valid (no missing files)

**Bundle Size Limits (Soft):**
- Host Shell: < 500 KB (gzipped)
- Each Remote: < 300 KB (gzipped)
- Shared libs: < 100 KB each (gzipped)

---

## Manual Checks (PR Review)

### 1. Architecture Compliance

**Checklist:**
- ✅ Follows Clean Architecture layers (presentation → application → domain ← infrastructure)
- ✅ No business logic in UI components
- ✅ Infrastructure adapters implement domain ports (interfaces)
- ✅ Shared libs have clean, stable APIs

**Red Flags:**
- ❌ UI component importing `HttpClient` directly
- ❌ Domain entities depending on Angular framework
- ❌ Circular dependencies between features

---

### 2. Cognitive Accessibility

**Checklist:**
- ✅ Text is concise and actionable
- ✅ Supports reading mode (summary vs detailed)
- ✅ Respects focus mode (hides non-essential UI)
- ✅ Animation preferences honored (`off` / `reduced` / `normal`)
- ✅ Font size and line spacing adjustable
- ✅ Contrast mode supported (if UI component)

**Red Flags:**
- ❌ Long paragraphs without "See more" option
- ❌ Animations that ignore `prefers-reduced-motion`
- ❌ Small click targets (< 44x44px)
- ❌ Low contrast text (WCAG AA not met)

---

### 3. Contracts & Documentation

**Checklist:**
- ✅ Contracts updated if model/event changed
- ✅ ADR created if architectural decision made
- ✅ Code comments explain **why**, not **what**

**Red Flags:**
- ❌ Breaking contract change without migration plan
- ❌ New shared lib without ADR justification
- ❌ Complex logic without explanatory comments

---

### 4. Testing Coverage

**Checklist:**
- ✅ New use cases have unit tests
- ✅ New components have basic rendering tests
- ✅ Critical flows have E2E tests (if applicable)

**Red Flags:**
- ❌ Tests disabled to "make pipeline green"
- ❌ Tests that only assert `expect(true).toBe(true)`
- ❌ Missing tests for edge cases (empty state, error handling)

---

## E2E Tests (Critical Flows Only)

**Command:** `pnpm run e2e:critical`

**Required E2E Coverage (MVP):**
1. **Focus Mode Toggle**
   - Enable focus mode → sidebar hidden, density reduced
   - Disable focus mode → full UI restored

2. **Complexity Change**
   - Switch from `simple` → `medium` → `full`
   - Verify UI elements appear/disappear

3. **Task Move (Kanban)**
   - Create task in "To Do"
   - Drag to "Doing"
   - Move to "Done"
   - Verify persistence (refresh page)

4. **Focus Timer**
   - Start timer (25 min preset)
   - Pause → resume
   - Complete cycle → cognitive alert shown

5. **Preferences Persistence**
   - Login → set preferences
   - Logout → login again
   - Preferences restored correctly

**Not Required in MVP:**
- Multi-user scenarios
- Performance/load testing
- Edge cases (offline, slow network)

---

## PR Approval Rules

**Minimum Requirements:**
- ✅ 1 approval from tech lead or maintainer
- ✅ All automated checks pass (lint, test, build)
- ✅ No unresolved review comments
- ✅ Definition of Done checklist complete

**Optional (Nice to Have):**
- Code review from domain expert (if touching critical logic)
- UX review (if changing cognitive accessibility features)

---

## Exceptions & Waivers

**When can quality gates be bypassed?**

1. **Hotfix (Production Bug):** Create ADR documenting exception
2. **Prototype/Spike:** Use feature flag or separate branch (do not merge to `main`)
3. **Documentation-Only Change:** Skip tests, but still require lint + build

**Process:**
- Document exception in PR description
- Tag PR with `exception:quality-gate`
- Schedule tech debt ticket to fix properly

---

## Continuous Improvement

**Metrics to Track:**
- PR rejection rate due to quality gates
- Average time to fix quality gate failures
- Test coverage trend (should increase over time)

**Quarterly Review:**
- Are quality gates too strict or too loose?
- Do we need new gates (security, performance)?
- Can we automate more manual checks?

---

## References

- **[Definition of Done](definition-of-done.md)**
- **[PR Checklist](pr-checklist.md)**
- **[Testing Strategy](testing-strategy.md)**
- **[RULES.md](../../RULES.md)** — Architectural rules
