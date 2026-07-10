---
tags: [frontend, design-system, stable]
updated: 2026-07-08
---

# Design System — Tailwind v4

Styling uses **Tailwind CSS v4**, configured entirely in CSS. There is **no
`tailwind.config.js`**. ADR: [[decisions-log]] ADR-0004.

## Where config lives

`src/app/globals.css` is the single config file:

```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-onest);
}
```

Extra CSS layers can be split into `src/style/index.css` and imported.

## Design tokens

All colours, spacing, font sizes, radii, and shadows are **tokens** declared under
`:root` (raw values) and `@theme inline` (Tailwind bindings).

Once a token is in `@theme`, it becomes a utility automatically:

| Token | Generated utilities |
|-------|--------------------|
| `--color-brand` | `bg-brand`, `text-brand`, `border-brand` |
| `--radius-card` | `rounded-card` |
| `--spacing-section` | `pt-section`, `mt-section`, … |

> [!important] The token rule
> **Never** hardcode hex values, pixel spacing, or named colours in `className` or
> inline styles. If a value doesn't exist as a token, **add it to `globals.css`
> first** — with a comment noting where it came from (e.g. a Figma frame).

## CSS layers

Every custom style goes inside a layer — never outside one:

```css
@layer base {        /* element resets & defaults: h1, p, a … */ }
@layer components {  /* pseudo-elements & 3rd-party overrides only — see below */ }
@layer utilities {   /* single-purpose helpers: .scrollbar-none … */ }
```

## Where a style goes (ADR-0012)

`globals.css` is **not** a place to park component styles — it holds tokens and
base resets and stays a few hundred lines forever. Follow this order; the first
match wins:

| Situation | Goes where |
|-----------|-----------|
| One-off styling | Tailwind utilities in `className` — nothing in CSS |
| Repeated pattern with markup / structure / props | a **React component** in `components/ui/` |
| Repeated *pure-utility* combo, no structure | a Tailwind v4 `@utility` |
| Pseudo-elements, 3rd-party DOM overrides, complex selectors | `@layer components` — the genuine exceptions |
| A new colour / spacing / radius value | a **token** in `:root` + `@theme` |

> [!important] The default answer to "this looks repeated" is a **React
> component**, not a CSS class. An eyebrow label with a `::before` dot is an
> `<Eyebrow>` component — not a `.label-eyebrow` global class. `@layer
> components` is for what utilities and components genuinely *cannot* express.

There are **no CSS Modules** in this project — utilities + components cover
every case (motion is spring-based, so there are no keyframes to co-locate).

## Current theme state

The project runs a **single dark theme** (the GringX hero — ADR-0015). Tokens in
`globals.css`:

| Token | Value | Use |
|-------|-------|-----|
| `--background` / `--foreground` | `#000` / `#fff` | page bg / primary text |
| `--muted` (`text-muted`) | `#8b90a0` | body copy, stat labels, eyebrow |
| `--border` (`border-border`) | `#24262f` | navbar pills, divider rule |
| `--accent` (`bg-accent`) | `#7c9cfe` | brand blue — Contact Us dot |
| `--text-hero` (`text-hero`) | `4.5rem` → `3.5rem` (≤1024) → `2.75rem` (≤640) | the hero headline (wraps to 2 lines) |
| `--text-stat` (`text-stat`) | `2rem` → `1.75rem` (≤640) | stat numbers |
| `--spacing-edge` (`px-edge` …) | `1.875rem` → `1.25rem` (≤640) | hero content inset |
| `--color-preloader-*` | (bespoke) | preloader splash — `curtain`, `bar`, `outline`, `fill-a`, `fill-b` |

> [!warning] Colour/type values are **estimated from the Figma screenshot**
> (node 551:451) — Dev Mode blocked exact extraction. Confirm against the spec.

> [!note] Token naming gotcha
> A raw `:root` var and its `@theme` binding must have **different names** (e.g.
> `--muted` → `--color-muted: var(--muted)`) — `@theme inline {
> --text-hero: var(--text-hero) }` is a circular self-reference and silently
> fails. Font-size/spacing tokens follow the same pattern with prefixed raw
> names: `--fs-hero`/`--fs-stat`/`--inset-edge` in `:root` →
> `--text-hero`/`--text-stat`/`--spacing-edge` in `@theme inline`.

> [!tip] Responsive tokens
> Because `@theme inline` emits `var(--fs-hero)` into the utilities, overriding
> the raw `:root` var inside a media query makes the utility itself responsive —
> `text-hero` steps down at ≤1024/≤640 with **no responsive prefixes in markup**.
> Prefer this for values tied to the adaptive rem grid; use `sm:`/`md:` prefixes
> for layout changes (stacking, hiding).

## Typography

Font: **Mulish** (local `.ttf` via `next/font/local`, files in `src/app/fonts/`),
bound to `--font-mulish` → `--font-sans`. Only **Light (300)** + **Regular (400)**
ship — don't use `font-medium`/`font-bold` (they faux-bold).
Loaded in `src/app/layout.tsx` and exposed on `<body>` as `--font-onest`.

## Styling rules

- Use utilities in JSX `className`; keep class strings short and readable.
- Extract a repeated pattern to a **React component** — not a `@layer
  components` class. See *Where a style goes* above (ADR-0012).
- Mobile-first responsive: `sm:` / `md:` / `lg:` / `xl:` prefixes.
- Dark mode: `dark:` prefix or token overrides in a `prefers-color-scheme` block.
- No inline `style` except for dynamic values (e.g. spring-animated values).

## Related

[[component-conventions]] · [[animation-system]] · [[new-page]]
