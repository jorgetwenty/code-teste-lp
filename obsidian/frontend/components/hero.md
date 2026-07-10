---
tags: [frontend, hero, stable]
updated: 2026-07-08
---

# Catalog — Hero (GringX landing)

The home page's marketing hero, ported from the Figma hero (node 551:451). It is
a **DOM overlay on top of the fixed WebGL nebula** ([[components/three]]): the
`NebulaScene` canvas is `fixed inset-0`, the header + hero sit above it (later in
DOM order, so they paint on top; the nebula still gets mouse via its `window`
listener). Conventions: [[component-conventions]] · [[html-semantics]] ·
[[design-system]]. ADR: [[decisions-log]] ADR-0015.

## Files

| File | Role |
|------|------|
| `hero/site-header.tsx` | `SiteHeader` — segmented navbar (logo pill · primary `<nav>` · Contact Us), 8px inset. Server Component. Nav pill is desktop-only (`hidden md:flex`) |
| `hero/mobile-nav.tsx` | `MobileNav` — client leaf, `md:hidden`: burger pill (bars spring-rotate into an ×) + frosted-glass dropdown (`bg-white/5 backdrop-blur-xl`) with the primary links; panel is `inert` while closed, links close on tap |
| `hero/hero.tsx` | `Hero` — the `<section>`: `<h1>`, brand mark centred over the orb, description + CTAs, eyebrow + rule, metrics |
| `hero/hero-stats.tsx` | `HeroStats` — the 2×2 metrics as a `<dl>`, each value/label preceded by a white rule (all text white) |
| `hero/status-dot.tsx` | `StatusDot` — green, smoothly blinking dot (spring ease-in-out-sine loop) in the Contact Us pill |
| `hero/hero-heading.tsx` | `HeroHeading` — client leaf; the `<h1>` animated **per-letter** via `spring-text-engine` |
| `hero/reveal.ts` | Shared soft-reveal spring presets (`SOFT_SPRING`, `RISE_FROM`, `RISE_TO`) for the `<Spring>` entrances |
| `preloader/preloader.tsx` | `Preloader` — intro splash (progress bar → two-speed curtain exit); mounted last in `HomeView` |
| `src/lib/intro-timing.ts` | Shared intro timing — sequences the preloader, hero reveals, and hand fly-in |
| `ui/button.tsx` | `Button` — navigational `<a>` (via `next/link`) styled `primary` / `outline` / `link` |
| `src/data/mocks/home.ts` | Content — `brand`, `navLinks`, `contactCta`, `hero`, `stats` (no hardcoded content in components) |

## Layout (from the 1440×800 frame)

- **Insets** — 30px content inset → `--spacing-edge` (`px-edge` / `pb-edge`);
  the navbar is 8px inset (`p-2`) with 8px pill gaps (`gap-2`). The logo + nav
  pills are **frosted glass** (`bg-white/5 backdrop-blur-md`); the **Contact Us**
  pill is solid **black with a semi-transparent white border** (`bg-black
  border-white/30`).
- **Headline** — `--text-hero` (72px, `leading-none`, `tracking-normal`) with a
  **horizontal** white → light-blue **text gradient** (`bg-gradient-to-r … to-[#79c0ff]`,
  `bg-clip-text`), `max-w-[35rem]` so it wraps to two lines (box 565×144).
- **Metrics** — `--text-stat` (32px); values, labels and separators are all
  **white** (`text-foreground` / `border-foreground`). The left description is
  white too. The **eyebrow tag sits above the metrics**, left-aligned to them
  (bottom band = `desc+CTAs | [eyebrow-over-metrics]`, `items-end`).
- **Layering** — the WebGL canvas is transparent (`z-10`); the hero's horizontal
  **rule is a `z-0` layer** (`HomeView`) *behind* it, so the orb/hands render in
  front of it. Header `z-40`, hero content `z-20`.
- **Semantics** — one `<h1>`; `<header>` + named `<nav aria-label="Primary">`;
  metrics as `<dl>`; CTAs and nav are real `<a>`s; focus-visible rings on buttons;
  the blinking dot is `aria-hidden`. (Desktop nav and the mobile dropdown both
  label their `<nav>` "Primary" — only one is ever exposed at a time: the other
  is `display:none` / `inert`.)

## Responsive (tablet ≤1024 · mobile ≤640)

- **Tokens step down at the token level** — `--text-hero` / `--text-stat` /
  `--spacing-edge` bind to `:root` vars (`--fs-hero` 4.5→3.5→2.75rem, `--fs-stat`
  2→1.75rem, `--inset-edge` 1.875→1.25rem) overridden in the same media queries
  as the rem-grid re-base, so `text-hero` etc. adapt without responsive prefixes.
- **Bottom band stacks below `md`** — one column (description + CTAs, then
  eyebrow + metrics), CTA row wraps, stat-grid gaps tighten (`gap-8` → `gap-12`
  at `md`). The decorative rule in `HomeView` is `hidden md:block` — it only
  aligns with the side-by-side band.
- **Header below `md`** — nav pill hidden; `MobileNav` burger appears; Contact Us
  keeps its own pill (`ml-auto` pushes it + the burger right); logo pill narrows
  (`px-6`). The dropdown hangs `top-full` under the navbar row (the row's spring
  transform makes it the containing block), inset to match the pills.

## Assets & fonts

- Logos: `public/assets/logo.svg` (wordmark lockup) is a hero `next/image` —
  needs `dangerouslyAllowSVG` in `next.config.ts` (ADR-0015). The centre mark is a
  3D model (`icon.glb`) loaded in the WebGL scene ([[components/three]]).
- Font: **Mulish** (local, `next/font/local` → `--font-sans`), files in
  `src/app/fonts/` — only **Light (300)** and **Regular (400)** ship, so avoid
  `font-medium`/`font-bold` (they faux-bold). Headline is `font-light`.

## Not yet done / flagged

- Colours + type sizes are **estimated from the Figma screenshot** — Dev Mode
  "allowed directories" blocked `get_design_context`, so exact hex/values are
  unconfirmed. Tokens carry a comment to that effect.
- **Entrance motion** is spring-driven (`<Spring mode="once">` fade-ups + a
  per-letter `TextEngine` headline; presets in `hero/reveal.ts`) — all
  `@react-spring/web`, no CSS transitions/keyframes. Configs passed from the
  Server Component to the client `<Spring>`/`TextEngine` must be **serializable**
  (tension/friction numbers — no `easing` functions across the boundary; the
  `StatusDot` uses an easing internally since it's a client leaf).
- **Headline gradient tradeoff:** per-letter animation and a `bg-clip-text`
  gradient can't coexist (the gradient colour lives on the container, so
  per-letter opacity/blur fade nothing). The animated headline is **solid white**;
  restore the gradient only if you drop per-letter for a whole-heading reveal.
- The centred brand mark is now a **3D extruded mesh in the WebGL scene** (not
  hero DOM) — see [[components/three]] *Embedded 3D logo*. The mark loads from
  `icon.glb` there; only `logo.svg` remains a hero DOM image.

## Intro sequence

On load: **`Preloader`** (state 1: rounded progress bar — dark backing +
gradient fill 0→100% + animated counter + equidistant outline, on a white layer.
The fill is an explicit `linear-gradient(90deg, var(--color-preloader-fill-a) 0%,
var(--color-preloader-fill-b) 100%)` — inline so it renders in sRGB, not Tailwind
v4's default oklab interpolation; state 2: the white layer slides up with
`overflow-hidden` **clipping** the bar, while the bar itself is **counter-translated**
so it stays fixed in the viewport and the rising white edge crops it from the
bottom up; a dark-blue layer behind it slides up at a different speed, then
unmounts). It's mounted last in `HomeView` at `z-[60]`, above everything.

Everything is time-coordinated via `src/lib/intro-timing.ts` (wall-clock ms, so
the preloader and the reveals pause together when the tab is hidden):

- `PRELOADER_LOAD_MS` / `_WHITE_EXIT_MS` / `_DARK_EXIT_MS` drive the splash.
- `HERO_REVEAL_DELAY` is added to every hero `<Spring>` / `TextEngine` `delayIn`
  (header, heading, eyebrow, description, CTAs, each metric) so they enter **as
  the curtains lift**. Elements sit at their `from` (hidden) state until then —
  no flash — behind the opaque splash.
- `HANDS_REVEAL_DELAY` + `HANDS_FLY_MS` drive the WebGL hand fly-in
  ([[components/three]] *Hand fly-in*), starting ~as the preloader clears.

> [!note] No store needed
> Coordination is purely by shared delays, not a signal — simplest and robust.
> If the preloader ever becomes asset-driven (variable duration), switch to a
> shared "revealed" flag (Zustand) gating each `<Spring enabled>` instead.

## Related

[[design-system]] · [[components/three]] · [[new-page]] · [[html-semantics]]
