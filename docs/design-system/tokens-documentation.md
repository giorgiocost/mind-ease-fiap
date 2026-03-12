# Design Tokens — MindEase

**Last Updated:** 2026-02-15  
**Status:** ✅ Implemented (Task 03)

---

## Overview

MindEase uses a **token-based design system** built with SCSS variables that compile to CSS Custom Properties.  All visual primitives — colors, spacing, typography, shadows — are defined once and consumed across every component and micro-frontend.

The system also includes **7 cognitive accessibility tokens** that adapt the entire UI to each user's neurodivergent profile at runtime via `data-*` HTML attributes.

---

## File Structure

```
libs/shared/ui/src/lib/styles/
  ├── _tokens.scss            Core design tokens (colors, spacing, type, shadows)
  ├── _cognitive-tokens.scss  Cognitive accessibility tokens (7 runtime tokens)
  ├── _mixins.scss            Reusable SCSS mixins (responsive, focus, layout)
  ├── _utilities.scss         Atomic utility classes (.p-md, .flex, .text-center)
  └── index.scss              Entry point — @forward all partials
```

**Import in components:**
```scss
// Import everything
@use '@shared/styles' as *;

// Import only tokens (no CSS output — just variables)
@use '@shared/styles/tokens' as *;

// Import only mixins
@use '@shared/styles/mixins' as *;
```

---

## 1. Color Palette

### Primary (Blue — trust, calm, focus)

| Token | Hex | CSS Variable | Usage |
|-------|-----|-------------|-------|
| `$color-primary-50` | `#EBF5FF` | `--color-primary-50` | Subtle backgrounds |
| `$color-primary-100` | `#D6EBFF` | `--color-primary-100` | Hover states |
| `$color-primary-200` | `#ADD6FF` | `--color-primary-200` | Light accents |
| `$color-primary-300` | `#85C2FF` | `--color-primary-300` | Borders |
| `$color-primary-400` | `#5CADFF` | `--color-primary-400` | Active states |
| `$color-primary-500` | `#3399FF` | `--color-primary-500` | **Main primary** |
| `$color-primary-600` | `#297ACC` | `--color-primary-600` | Hover on primary |
| `$color-primary-700` | `#1F5C99` | `--color-primary-700` | Dark accents |
| `$color-primary-800` | `#143D66` | `--color-primary-800` | Text on light bg |
| `$color-primary-900` | `#0A1F33` | `--color-primary-900` | Darkest accent |

### Secondary (Green — growth, success)

| Token | Hex | CSS Variable |
|-------|-----|-------------|
| `$color-secondary-50` | `#E8F8F0` | `--color-secondary-50` |
| `$color-secondary-500` | `#2EAD6E` | `--color-secondary` |
| `$color-secondary-900` | `#092316` | `--color-secondary-900` |

### Semantic Colors

| Token | Hex | CSS Variable | Usage |
|-------|-----|-------------|-------|
| `$color-success` | `#10B981` | `--color-success` | Positive actions, done |
| `$color-warning` | `#F59E0B` | `--color-warning` | Caution, pending |
| `$color-error` | `#EF4444` | `--color-error` | Errors, destructive |
| `$color-info` | `#3B82F6` | `--color-info` | Informational |

### Kanban Status

| Token | Hex | CSS Variable | Column |
|-------|-----|-------------|--------|
| `$color-status-todo` | `#94A3B8` | `--color-status-todo` | To Do |
| `$color-status-doing` | `#3399FF` | `--color-status-doing` | Doing |
| `$color-status-done` | `#2EAD6E` | `--color-status-done` | Done |

### Surface & Text

| CSS Variable | Usage |
|-------------|-------|
| `--color-bg-primary` | Main background (white) |
| `--color-bg-secondary` | Cards, sections (light gray) |
| `--color-bg-tertiary` | Nested surfaces |
| `--color-text-primary` | Headings, body text |
| `--color-text-secondary` | Labels, descriptions |
| `--color-text-tertiary` | Placeholders, hints |

---

## 2. Spacing Scale (8pt Grid)

All spacing values are multiples of 4 px (sub-grid) or 8 px (main grid).

| Token | Value | px | CSS Variable |
|-------|-------|-----|-------------|
| `$spacing-0` | `0` | 0 | `--spacing-0` |
| `$spacing-xxs` | `0.25rem` | 4 | `--spacing-xxs` |
| `$spacing-xs` | `0.5rem` | 8 | `--spacing-xs` |
| `$spacing-sm` | `0.75rem` | 12 | `--spacing-sm` |
| `$spacing-md` | `1rem` | 16 | `--spacing-md` |
| `$spacing-lg` | `1.5rem` | 24 | `--spacing-lg` |
| `$spacing-xl` | `2rem` | 32 | `--spacing-xl` |
| `$spacing-2xl` | `2.5rem` | 40 | `--spacing-2xl` |
| `$spacing-3xl` | `3rem` | 48 | `--spacing-3xl` |
| `$spacing-4xl` | `4rem` | 64 | `--spacing-4xl` |
| `$spacing-5xl` | `6rem` | 96 | `--spacing-5xl` |

---

## 3. Typography

### Font Families

| Token | Stack | CSS Variable |
|-------|-------|-------------|
| `$font-family-sans` | Inter, -apple-system, ... | `--font-family-sans` |
| `$font-family-mono` | JetBrains Mono, Fira Code, ... | `--font-family-mono` |

### Font Sizes (Major-Third Scale ≈ 1.25)

| Token | Value | px | CSS Variable |
|-------|-------|-----|-------------|
| `$font-size-xs` | `0.75rem` | 12 | `--font-size-xs` |
| `$font-size-sm` | `0.875rem` | 14 | `--font-size-sm` |
| `$font-size-base` | `1rem` | 16 | `--font-size-base` |
| `$font-size-md` | `1.125rem` | 18 | `--font-size-md` |
| `$font-size-lg` | `1.25rem` | 20 | `--font-size-lg` |
| `$font-size-xl` | `1.5rem` | 24 | `--font-size-xl` |
| `$font-size-2xl` | `1.875rem` | 30 | `--font-size-2xl` |
| `$font-size-3xl` | `2.25rem` | 36 | `--font-size-3xl` |
| `$font-size-4xl` | `3rem` | 48 | `--font-size-4xl` |

### Font Weights

| Token | Value | CSS Variable |
|-------|-------|-------------|
| `$font-weight-light` | 300 | `--font-weight-light` |
| `$font-weight-normal` | 400 | `--font-weight-normal` |
| `$font-weight-medium` | 500 | `--font-weight-medium` |
| `$font-weight-semibold` | 600 | `--font-weight-semibold` |
| `$font-weight-bold` | 700 | `--font-weight-bold` |

### Line Heights

| Token | Value | CSS Variable |
|-------|-------|-------------|
| `$line-height-tight` | 1.25 | `--line-height-tight` |
| `$line-height-snug` | 1.375 | `--line-height-snug` |
| `$line-height-normal` | 1.5 | `--line-height-normal` |
| `$line-height-relaxed` | 1.625 | `--line-height-relaxed` |
| `$line-height-loose` | 2.0 | `--line-height-loose` |

---

## 4. Border Radius

| Token | Value | px | CSS Variable |
|-------|-------|-----|-------------|
| `$radius-sm` | `0.25rem` | 4 | `--radius-sm` |
| `$radius-md` | `0.375rem` | 6 | `--radius-md` |
| `$radius-lg` | `0.5rem` | 8 | `--radius-lg` |
| `$radius-xl` | `0.75rem` | 12 | `--radius-xl` |
| `$radius-2xl` | `1rem` | 16 | `--radius-2xl` |
| `$radius-full` | `9999px` | — | `--radius-full` |

---

## 5. Shadows (Elevation)

| Token | CSS Variable | Usage |
|-------|-------------|-------|
| `$shadow-xs` | `--shadow-xs` | Subtle depth |
| `$shadow-sm` | `--shadow-sm` | Cards (default) |
| `$shadow-md` | `--shadow-md` | Dropdowns |
| `$shadow-lg` | `--shadow-lg` | Modals |
| `$shadow-xl` | `--shadow-xl` | Floating panels |
| `$shadow-2xl` | `--shadow-2xl` | Maximum elevation |
| `$shadow-focus` | `--shadow-focus` | Focus ring (a11y) |

---

## 6. Breakpoints (Mobile-First)

| Token | Value | CSS |
|-------|-------|-----|
| `$breakpoint-sm` | 640px | `@media (min-width: 640px)` |
| `$breakpoint-md` | 768px | `@media (min-width: 768px)` |
| `$breakpoint-lg` | 1024px | `@media (min-width: 1024px)` |
| `$breakpoint-xl` | 1280px | `@media (min-width: 1280px)` |
| `$breakpoint-2xl` | 1536px | `@media (min-width: 1536px)` |

**Mixin usage:**
```scss
.card {
  padding: var(--spacing-sm);

  @include tablet {
    padding: var(--spacing-lg);
  }

  @include desktop {
    padding: var(--spacing-xl);
  }
}
```

---

## 7. Transitions

| Token | Duration | CSS Variable |
|-------|----------|-------------|
| `$transition-fast` | 150ms | `--transition-fast` |
| `$transition-base` | 200ms | `--transition-base` |
| `$transition-slow` | 300ms | `--transition-slow` |
| `$transition-slower` | 500ms | `--transition-slower` |

---

## 8. Cognitive Accessibility Tokens

These 7 runtime tokens control the cognitive load of the UI. They are applied as `data-*` attributes on the `<html>` element and cascade through CSS.

### Token Summary

| Token | Attribute | Values | Default |
|-------|-----------|--------|---------|
| UI Density | `data-ui-density` | `simple`, `medium`, `full` | `medium` |
| Focus Mode | `data-focus-mode` | `true`, `false` | `false` |
| Content Mode | `data-content-mode` | `summary`, `detailed` | `detailed` |
| Contrast | `data-contrast` | `low`, `normal`, `high` | `normal` |
| Font Scale | `data-font-scale` | `0.9` — `1.4` | `1.0` |
| Spacing Scale | `data-spacing-scale` | `0.9` — `1.4` | `1.0` |
| Motion | `data-motion` | `full`, `reduced`, `off` | `full` |

### Usage in HTML

```html
<html data-ui-density="simple"
      data-focus-mode="false"
      data-content-mode="summary"
      data-contrast="normal"
      data-font-scale="1.0"
      data-spacing-scale="1.0"
      data-motion="full">
```

### Usage in Components

```html
<!-- Hide in simple mode -->
<div class="hide-in-simple">Advanced stats</div>

<!-- Hide in focus mode -->
<nav class="hide-in-focus">Secondary nav</nav>

<!-- Reduce opacity in focus mode -->
<aside class="reduce-in-focus">Related content</aside>

<!-- Show only in detailed mode -->
<p class="show-in-detailed">Full description text...</p>

<!-- Show only in summary mode -->
<p class="show-in-summary">Short label</p>
```

### SCSS Mixin Usage

```scss
.sidebar {
  @include hide-in-focus;
  @include hide-in-simple;
}

.card {
  @include cognitive-spacing;     // Uses --density-padding / --density-gap
  @include card-elevated;
}
```

---

## 9. Utility Classes

Quick reference for the most common utilities:

### Spacing
- `.p-md` → padding: 1rem
- `.px-lg` → padding-inline: 1.5rem
- `.m-sm` → margin: 0.75rem
- `.gap-md` → gap: 1rem
- `.mx-auto` → margin-inline: auto

### Display
- `.flex`, `.grid`, `.block`, `.hidden`
- `.flex-col`, `.flex-wrap`
- `.items-center`, `.justify-between`

### Text
- `.text-sm`, `.text-lg`, `.text-xl`
- `.font-bold`, `.font-semibold`
- `.text-center`, `.truncate`, `.uppercase`

### Colors
- `.text-primary`, `.text-secondary`, `.text-error`
- `.bg-primary`, `.bg-secondary`, `.bg-tertiary`

### Borders & Shadows
- `.border`, `.border-light`, `.rounded-lg`, `.rounded-full`
- `.shadow-sm`, `.shadow-md`, `.shadow-lg`

---

## 10. Examples

### Button using tokens

```scss
@use '@shared/styles/tokens' as *;
@use '@shared/styles/mixins' as *;

.btn-primary {
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-neutral-0);
  background-color: var(--color-primary);
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;

  @include interactive-transition;
  @include focus-visible;

  &:hover {
    background-color: var(--color-primary-600);
  }

  &:active {
    background-color: var(--color-primary-700);
  }
}
```

### Card using cognitive tokens

```scss
@use '@shared/styles/mixins' as *;

.task-card {
  @include card-elevated;
  @include cognitive-spacing;
  @include hover-lift;

  // Advanced stats hidden in simple density
  .stats {
    @include hide-in-simple;
  }
}
```

---

## References

- [ADR-003: Tokens Cognitivos](../decisions/adr-003-tokens-cognitivos.md)
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [Sass Module System](https://sass-lang.com/documentation/at-rules/use)
