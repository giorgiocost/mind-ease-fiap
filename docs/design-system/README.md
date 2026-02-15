# MindEase Design System

**Last Updated:** 2026-02-15  
**Status:** ✅ Foundation Complete (Task 03)  
**Version:** 1.0.0

---

## Overview

The MindEase Design System is a **token-based, accessibility-first** design system built with SCSS variables that compile to CSS Custom Properties. It enables runtime customization of the entire UI through **7 cognitive accessibility tokens** that adapt to neurodivergent user needs.

**Core principles:**
- **Consistency** — Single source of truth for all visual primitives
- **Accessibility** — WCAG 2.1 AAA compliance, cognitive load reduction
- **Flexibility** — Runtime customization via CSS custom properties
- **Developer Experience** — SCSS mixins, utility classes, clear documentation

---

## 📚 Documentation

- **[Design Tokens Reference](tokens-documentation.md)** — Complete reference of all tokens (colors, spacing, typography, shadows, breakpoints) with usage examples
- **[ADR-003: Cognitive Tokens](../decisions/adr-003-tokens-cognitivos.md)** — Architectural decision for the 7 runtime accessibility tokens

---

## 🎨 Token Categories

### 1. Core Design Tokens (`_tokens.scss`)
- **Colors** — Primary (blue), Secondary (green), Semantic (success/warning/error/info), Neutral (gray scale), Kanban status
- **Spacing** — 8pt grid (4px to 96px), `$spacing-xs` through `$spacing-5xl`
- **Typography** — Inter (sans-serif) + JetBrains Mono, major-third scale (12px-48px), weights, line-heights
- **Border Radius** — `$radius-sm` (4px) through `$radius-full` (9999px)
- **Shadows** — Elevation system from `$shadow-xs` to `$shadow-2xl` + focus ring
- **Z-index** — Layering system (1000-1070)
- **Breakpoints** — Mobile-first (640px, 768px, 1024px, 1280px, 1536px)
- **Transitions** — Duration + easing curves (`fast`, `base`, `slow`, `slower`)

### 2. Cognitive Accessibility Tokens (`_cognitive-tokens.scss`)
Runtime tokens controlled via `data-*` attributes on `<html>`:

| Token | Attribute | Values | Purpose |
|-------|-----------|--------|---------|
| **UI Density** | `data-ui-density` | `simple` \| `medium` \| `full` | Controls visual complexity |
| **Focus Mode** | `data-focus-mode` | `true` \| `false` | Hides distractions |
| **Content Mode** | `data-content-mode` | `summary` \| `detailed` | Shows/hides detailed text |
| **Contrast** | `data-contrast` | `low` \| `normal` \| `high` | WCAG AAA in high mode |
| **Font Scale** | `data-font-scale` | `0.9` - `1.4` | Adjusts all font sizes |
| **Spacing Scale** | `data-spacing-scale` | `0.9` - `1.4` | Adjusts all spacing |
| **Motion** | `data-motion` | `full` \| `reduced` \| `off` | Respects `prefers-reduced-motion` |

**Learn more:** [Cognitive Accessibility Personas](../product/accessibility-cognitive.md)

### 3. Mixins (`_mixins.scss`)
Reusable SCSS patterns for component authors:
- **Responsive** — `@include mobile`, `@include tablet`, `@include desktop`, `@include breakpoint($name)`
- **Focus** — `@include focus-visible`, `@include focus-within`, `@include sr-only`
- **Text** — `@include truncate($lines)`, `@include font-sans`, `@include font-mono`
- **Layout** — `@include flex-center`, `@include absolute-center`, `@include container($max)`, `@include grid-auto-fill`
- **Visual** — `@include card-elevated`, `@include hover-lift`, `@include glass($opacity)`
- **Cognitive** — `@include cognitive-spacing`, `@include hide-in-simple`, `@include motion-safe`
- **Animations** — `@include fade-in`, `@include slide-in-from-top`, `@include scale-in`

### 4. Utility Classes (`_utilities.scss`)
Atomic classes for rapid prototyping:
- **Spacing** — `.p-md`, `.px-lg`, `.m-sm`, `.gap-md`, `.mx-auto`
- **Display** — `.flex`, `.grid`, `.block`, `.hidden`
- **Flexbox** — `.flex-col`, `.items-center`, `.justify-between`, `.flex-1`
- **Text** — `.text-sm`, `.text-center`, `.font-bold`, `.truncate`, `.uppercase`
- **Colors** — `.text-primary`, `.bg-secondary`, `.bg-error`
- **Borders** — `.border`, `.border-light`, `.rounded-lg`, `.rounded-full`
- **Shadows** — `.shadow-sm`, `.shadow-lg`, `.shadow-inner`

---

## 💻 Usage

### For TypeScript Components
```typescript
// Component imports styles via Angular styleUrls
@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
```

### For SCSS Files
```scss
// Import all (tokens + mixins + utilities)
@use '../../../libs/shared/ui/src/lib/styles' as *;

// Or import specific partials
@use '../../../libs/shared/ui/src/lib/styles/tokens' as *;
@use '../../../libs/shared/ui/src/lib/styles/mixins' as *;
```

### For Global Styles
Already wired in [apps/host-shell/src/styles.scss](../../apps/host-shell/src/styles.scss)

### Using CSS Custom Properties
```css
.my-component {
  padding: var(--spacing-md);           /* 16px */
  color: var(--color-primary);          /* #3399FF */
  font-size: var(--font-size-base);     /* 16px */
  border-radius: var(--radius-lg);      /* 8px */
  box-shadow: var(--shadow-md);         /* Card elevation */
}
```

### Using Cognitive Tokens in HTML
```html
<!-- Apply cognitive profile to entire app -->
<html data-ui-density="simple"
      data-focus-mode="false"
      data-contrast="normal"
      data-font-scale="1.0"
      data-spacing-scale="1.0"
      data-motion="full">
```

### Using Helper Classes
```html
<!-- Hide in simple density mode -->
<div class="hide-in-simple">Advanced stats</div>

<!-- Hide in focus mode -->
<aside class="hide-in-focus">Related content</aside>

<!-- Show only in detailed content mode -->
<p class="show-in-detailed">Full description...</p>
```

---

## 🏗️ Architecture

**Location:** `libs/shared/ui/src/lib/styles/`

```
styles/
├── _tokens.scss            # Core design tokens (350 lines)
├── _cognitive-tokens.scss  # 7 cognitive accessibility tokens (300 lines)
├── _mixins.scss            # SCSS mixins (290 lines)
├── _utilities.scss         # Utility classes (250 lines)
└── index.scss              # Entry point (forwards all partials)
```

**TypeScript Path Mapping:**
```json
{
  "@shared/styles/*": ["libs/shared/ui/src/lib/styles/*"]
}
```

**Global Wiring:**
- Host shell imports: [apps/host-shell/src/styles.scss](../../apps/host-shell/src/styles.scss)
- All CSS custom properties exported to `:root {}` in `_tokens.scss`
- Cognitive tokens cascade via `data-*` attributes on `<html>`

---

## ✅ Quality Standards

### Accessibility
- ✅ **WCAG 2.1 Level AAA** in high contrast mode (7:1+ ratio)
- ✅ **Focus indicators** on all interactive elements (`--shadow-focus`)
- ✅ **Respects `prefers-reduced-motion`** OS setting
- ✅ **Screen-reader only** classes (`.sr-only`, `.sr-only-focusable`)

### Consistency
- ✅ **8pt spacing grid** — all spacing values are multiples of 4px/8px
- ✅ **Major-third typography scale** (1.25 ratio)
- ✅ **Single source of truth** — all tokens defined once in `_tokens.scss`

### Performance
- ✅ **CSS Custom Properties** — runtime changes without re-compilation
- ✅ **Tree-shakable** — utilities can be purged via PurgeCSS (future)
- ✅ **No !important abuse** — only used for cognitive token overrides and motion-safe

---

## 🚀 Roadmap

### ✅ Phase 1 — Foundation (DONE)
- [x] Core design tokens (colors, spacing, typography)
- [x] 7 cognitive accessibility tokens
- [x] Responsive mixins and utility classes
- [x] Global styles wired to host-shell
- [x] Full documentation

### 🔄 Phase 2 — Components (Next: Tasks 04-07)
- [ ] Button component with variants
- [ ] Input component with validation
- [ ] Card component for task cards
- [ ] Modal component for dialogs

### ⏳ Phase 3 — Advanced (Future)
- [ ] Component documentation (Storybook)
- [ ] Design token editor UI
- [ ] Dark mode support
- [ ] PurgeCSS integration for production builds

---

## 📖 Related Documentation

- **[Cognitive Accessibility](../product/accessibility-cognitive.md)** — User personas and UI requirements
- **[ADR-003: Cognitive Tokens](../decisions/adr-003-tokens-cognitivos.md)** — Why data-attributes over CSS classes
- **[Module Federation](../architecture/module-federation.md)** — How design system is shared across MFEs
- **[Task 03 Spec](../../tasks/task_03_create_design_tokens.md)** — Original implementation task

---

## 🤝 Contributing

When adding new tokens:
1. Add SCSS variable in appropriate `_tokens.scss` section
2. Export as CSS custom property in `:root {}`
3. Document in [tokens-documentation.md](tokens-documentation.md)
4. Test across all breakpoints and cognitive modes
5. Update this README if adding new categories

When creating new components:
1. Use tokens (never hardcode colors, spacing, etc.)
2. Support all cognitive tokens
3. Include accessibility features (focus, ARIA, keyboard nav)
4. Follow Definition of Done checklist
