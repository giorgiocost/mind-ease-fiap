# ADR-003 — Cognitive Accessibility Tokens

**Status:** ✅ Accepted  
**Date:** 2026-02-15  
**Updated:** 2026-02-16  
**Deciders:** Architecture Team, UX Team  
**Related:** [ADR-002: MVVM + Signals](adr-002-mvvm-signals-architecture.md), Task 03, Task 09, Task 10, [Cognitive Accessibility Personas](../product/accessibility-cognitive.md)

---

## Context

MindEase targets users with neurodivergent conditions (ADHD, autism, dyslexia, burnout) who experience cognitive overload from traditional UIs. We need a **runtime-configurable** system that adapts the entire interface to each user's cognitive profile without requiring:
- Page reloads
- Re-compilation of SCSS
- Per-component configuration
- Manual overrides scattered across the codebase

**User Needs (from personas):**
- **Bruno (ADHD)** — Needs to reduce visual clutter, hide distractions during focus time
- **Clara (autism)** — Requires high contrast mode, simplified UI, predictable layout
- **Diana (dyslexia)** — Needs adjustable font size, increased line spacing, simpler content
- **Elena (burnout)** — Needs to disable animations, reduce cognitive load, show only essential info

**Technical Requirements:**
- All changes must be **client-side only** (no server round-trip)
- Must persist across page navigation (stored in preferences)
- Must cascade globally (no per-component configuration)
- Must be performant (no layout recalculation on every render)

---

## Decision

We will implement **7 cognitive accessibility tokens** that control the UI at runtime via **CSS custom properties** set through **`data-*` attributes on the `<body>` element**.

> **Note:** Initially planned for `<html>`, but implemented on `<body>` for better DOM manipulation compatibility with Angular services (DOCUMENT.body).

### The 7 Tokens

| Token | Attribute | Values | Default |
|-------|-----------|--------|---------|
| **UI Density** | `data-ui-density` | `simple` \| `medium` \| `full` | `medium` |
| **Focus Mode** | `data-focus-mode` | `true` \| `false` | `false` |
| **Content Mode** | `data-content-mode` | `summary` \| `detailed` | `detailed` |
| **Contrast** | `data-contrast` | `low` \| `normal` \| `high` | `normal` |
| **Font Scale** | `data-font-scale` | `0.9` - `1.4` | `1.0` |
| **Spacing Scale** | `data-spacing-scale` | `0.9` - `1.4` | `1.0` |
| **Motion** | `data-motion` | `full` \| `reduced` \| `off` | `full` |

### Implementation Strategy

**1. Data Attributes (not CSS classes)**
```html
<!-- Semantic, easier to read, explicit state -->
<body data-ui-density="simple" data-focus-mode="true">
```

**Why not classes?**
- Classes (`class="density-simple focus-mode-on"`) are less semantic
- Data attributes are self-documenting (attribute name = what it controls)
- Clearer separation between style classes and state attributes

**2. CSS Custom Properties for Cascading**
```scss
// _cognitive-tokens.scss
[data-ui-density='simple'] {
  --density-padding: var(--spacing-xs);
  --density-gap: var(--spacing-sm);
  --density-font-size: var(--font-size-sm);
}

[data-ui-density='full'] {
  --density-padding: var(--spacing-lg);
  --density-gap: var(--spacing-md);
  --density-font-size: var(--font-size-base);
}
```

**3. Helper Classes for Visibility Control**
```scss
// Hide elements in simple density
.hide-in-simple {
  display: block;
}

[data-ui-density='simple'] .hide-in-simple {
  display: none;
}
```

**4. Component Integration via Mixins**
```scss
@mixin cognitive-spacing {
  padding: var(--density-padding, var(--spacing-md));
  gap: var(--density-gap, var(--spacing-sm));
}

.task-card {
  @include cognitive-spacing;
}
```

### Runtime Application

**In Angular Service (`PreferencesUiService`):**
```typescript
// libs/shared/ui/src/lib/services/preferences-ui.service.ts
@Injectable({ providedIn: 'root' })
export class PreferencesUiService {
  private document = inject(DOCUMENT);
  private prefsStore = inject(PreferencesStore);
  private body: HTMLElement | null = null;
  
  constructor() {
    this.body = this.document.body;
    
    // React to preference changes automatically
    effect(() => {
      const prefs = this.prefsStore.preferences();
      this.applyPreferences(prefs);
    });
  }
  
  private applyPreferences(prefs: CognitivePreferences): void {
    if (!this.body) return;
    
    // Apply data attributes
    this.body.setAttribute('data-ui-density', prefs.uiDensity);
    this.body.setAttribute('data-focus-mode', String(prefs.focusMode));
    this.body.setAttribute('data-content-mode', prefs.contentMode);
    this.body.setAttribute('data-contrast', prefs.contrast);
    this.body.setAttribute('data-font-scale', String(prefs.fontScale));
    this.body.setAttribute('data-spacing-scale', String(prefs.spacingScale));
    this.body.setAttribute('data-motion', prefs.motion);
    
    // Apply CSS custom properties
    this.body.style.setProperty('--font-scale', String(prefs.fontScale));
    this.body.style.setProperty('--spacing-scale', String(prefs.spacingScale));
    
    // Apply body classes for easier CSS targeting
    this.body.classList.remove('density-simple', 'density-medium', 'density-full');
    this.body.classList.add(`density-${prefs.uiDensity}`);
    // ... (see Task 10 for full implementation)
  }
}
```

**On App Initialization:**
1. Load user preferences from `PreferencesStore` (Angular Signals, ADR-002)
2. `PreferencesUiService` automatically applies via `effect()` (reactive)
3. Browser re-renders with new CSS custom property values
4. No component code changes needed — **automatic cascade**
5. Preferences sync to backend API (optimistic updates, Task 09)
6. LocalStorage cache for offline support

---

## Consequences

### ✅ Pros
1. **Instant UI Adaptation** — No page reload, no re-compilation
2. **Global Cascade** — Set once, applies everywhere
3. **Component Simplicity** — Components don't need per-token logic
4. **Testable** — Easy to test different cognitive profiles in E2E tests (just set attributes)
5. **Debuggable** — DevTools shows clear `data-*` attributes on `<html>`
6. **Accessible** — Respects OS `prefers-reduced-motion` via media query
7. **Performant** — Browser-native CSS cascade (no JS recalculation)

### ⚠️ Cons
1. **Browser Support** — Requires modern browsers (IE11 not supported, but out of scope)
2. **Learning Curve** — Team must understand data attributes + CSS custom properties pattern
3. **Testing Complexity** — Need to test all 7 token combinations (3 × 2 × 2 × 3 × 5 × 5 × 3 = 2,700 combinations)
   - **Mitigation:** Focus on most common profiles (Bruno, Clara, Diana, Elena)
4. **Initial Setup Cost** — All components must use cognitive-aware tokens/mixins from the start
   - **Mitigation:** Enforced via linting rules (future) and PR checklist

### 🔄 Migration Impact
- **New components:** Use `@include cognitive-spacing`, `.hide-in-simple` classes
- **Existing components:** Refactor to use tokens (none exist yet — greenfield project)
- **Global styles:** Already wired in `apps/host-shell/src/styles.scss`

---

## Alternatives Considered

### Alternative 1: CSS Classes on `<body>`
```html
<body class="density-simple focus-mode-on contrast-high">
```

**Why rejected:**
- Less semantic (classes are for styling, not state)
- Harder to read (`class="..."` vs `data-ui-density="simple"`)
- No self-documenting attribute names

### Alternative 2: Per-Component Configuration
```typescript
@Component({
  selector: 'app-button',
  template: `<button [class.simple]="density === 'simple'">`
})
```

**Why rejected:**
- Every component needs to handle cognitive tokens manually
- No global cascade — brittle and error-prone
- High maintenance burden

### Alternative 3: Separate Stylesheets per Profile
```html
<link rel="stylesheet" href="styles-simple.css" *ngIf="density === 'simple'">
```

**Why rejected:**
- Requires duplicating all styles × 7 tokens = massive file size
- Page flicker on profile change
- Cache invalidation complexity

### Alternative 4: JavaScript-Based Style Injection
```typescript
applyCognitiveStyles() {
  const styles = document.createElement('style');
  styles.innerHTML = `.card { padding: ${this.getPadding()}; }`;
  document.head.appendChild(styles);
}
```

**Why rejected:**
- Performance nightmare (style recalculation on every change)
- Hard to debug (dynamic styles invisible in source)
- CSP violation risk

---

## Decision Rationale

**Data attributes + CSS custom properties** is the **only solution** that achieves:
1. **Runtime customization** without re-compilation
2. **Global cascade** without per-component logic
3. **Browser-native performance** (no JS overhead)
4. **Developer ergonomics** (use mixins, forget about tokens)
5. **Testability** (set attribute, verify UI)

This pattern is **battle-tested** in design systems like:
- GitHub Primer (dark mode via `data-color-mode`)
- Material Design 3 (theme tokens via CSS props)
- Figma Variables (runtime design token overrides)

---

## Validation & Success Metrics

**Definition of Done for Task 03:**
- [x] All 7 tokens implemented in `_cognitive-tokens.scss`
- [x] Helper classes (`.hide-in-simple`, `.show-in-detailed`) work
- [x] Mixins (`@include cognitive-spacing`) available
- [x] Default profile in `:root {}` (medium, detailed, normal, 1.0, full)
- [x] Documentation complete with usage examples
- [x] Build passes (SCSS compiles without errors)

**Implementation Status (as of 2026-02-16):**
- [x] Task 03: Design Tokens (SCSS)
- [x] Task 08: AuthStore with Signals (28 tests)
- [x] Task 09: PreferencesStore with Signals (29 tests)
- [x] Task 10: PreferencesUiService applies tokens to DOM (20 tests)

**Future Success Metrics (Phase 3):**
- User testing with personas (Bruno, Clara, Diana, Elena)
- A/B test: cognitive tokens vs. no tokens → task completion time reduction
- Accessibility audit: WCAG 2.1 AAA compliance in high contrast mode

---

## References

**ADRs:**
- **[ADR-002: MVVM + Signals Architecture](adr-002-mvvm-signals-architecture.md)** — State management pattern

**Documentation:**
- **[Cognitive Accessibility Personas](../product/accessibility-cognitive.md)** — User research and personas
- **[Design Tokens Documentation](../design-system/tokens-documentation.md)** — Full token reference

**Tasks:**
- **[Task 03: Create Design Tokens](../../tasks/task_03_create_design_tokens.md)** — SCSS implementation
- **[Task 09: Setup Preferences Store](../../tasks/task_09_setup_preferences_store.md)** — State management
- **[Task 10: Setup Preferences UI Service](../../tasks/task_10_setup_preferences_ui_service.md)** — DOM integration

**Standards:**
- **[WCAG 2.1 Understanding SC 1.4.8: Visual Presentation](https://www.w3.org/WAI/WCAG21/Understanding/visual-presentation.html)** — Text spacing requirements
- **[MDN: Using data attributes](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes)**
- **[MDN: Using CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)**

---

## Changelog

- **2026-02-15** — ADR accepted, SCSS tokens implemented (Task 03)
- **2026-02-16** — Updated with PreferencesStore (Task 09) and PreferencesUiService (Task 10) implementation details, added ADR-002 reference, changed target from `<html>` to `<body>`
