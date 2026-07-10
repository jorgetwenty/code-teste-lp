---
tags: [meta, changelog]
updated: 2026-07-08
---

# Changelog

Chronological log of notable changes to the project. Newest first.
This is a human-curated log — not a mirror of `git log`.

## 2026-07-08

- **Real GringX metadata wired up** — `siteConfig` (`src/lib/site.ts`) replaced
  its "New Project" placeholders: name **GringX**, a new `tagline` field
  ("Turn data into decisions"), the hero description as the site description,
  `@gringx` Twitter handle. The home route (`app/page.tsx`) now exports its own
  `metadata` (`generateMetadata({ title: "GringX — Turn data into decisions" })`).
  `public/manifest.json` gained real `name`/`short_name`/`theme_color`/
  `background_color`/`start_url`; `browserconfig.xml` TileColor is now black.
  JSON-LD, robots, and the sitemap pick the values up automatically via
  `siteConfig`. See [[seo-metadata]].
- **Hero is responsive (tablet + mobile)** — the type/spacing tokens are now
  responsive at the token level: `--text-hero` / `--text-stat` / `--spacing-edge`
  bind to `:root` vars (`--fs-hero`, `--fs-stat`, `--inset-edge`) that step down
  in the existing ≤1024 / ≤640 media queries, so `text-hero` etc. adapt with no
  responsive prefixes in markup. The hero bottom band stacks into one column
  below `md` (description + CTAs above eyebrow + metrics), CTA row wraps, stat
  grid tightens its gaps, and the decorative horizontal rule in `HomeView` is
  desktop-only (`hidden md:block`) since it only aligns with the side-by-side
  band. See [[components/hero]] and [[design-system]].
- **Mobile burger navigation with a frosted-glass dropdown** — below `md` the
  header's nav pill is replaced by a burger pill (new client leaf
  `hero/mobile-nav.tsx`). The two burger bars spring-rotate into an ×, and the
  dropdown (glass: `bg-white/5 backdrop-blur-xl border-border`, matching the
  header pills) spring-fades/slides under the navbar. All `@react-spring/web`
  (`<Spring enabled={open}>` — no CSS transitions); the panel stays mounted for
  the exit animation and is `inert` while closed; links close the menu on tap.
  Contact Us stays visible as its own pill on mobile. See [[components/hero]].

## 2026-07-07

- **Silenced a false hydration-mismatch warning** — the Next dev overlay flagged
  "1 Issue": browser extensions (ColorZilla's `cz-shortcut-listen`, Grammarly, etc.)
  inject attributes onto `<body>` before React hydrates, tripping a spurious
  mismatch. Added `suppressHydrationWarning` to `<body>` in `app/layout.tsx` (scoped
  to that one element, so real mismatches elsewhere still surface). Not an app bug —
  the markup is unchanged; only the extension-caused warning is suppressed.
- **Preloader polish + smoother hand fly-in** — three tweaks to the intro:
  (1) the progress-bar fill now uses an explicit inline
  `linear-gradient(90deg, var(--color-preloader-fill-a) 0%, var(--color-preloader-fill-b) 100%)`
  (`#05F → #000E39`) instead of the `bg-gradient-to-r` utilities, so it renders in
  sRGB rather than Tailwind v4's default oklab interpolation; (2) the white exit
  layer now **clips** the bar — `overflow-hidden` on the white layer plus a
  **counter-translate** on the bar so the bar stays fixed in the viewport and the
  rising white edge crops it from the bottom up (previously the bar rode up with
  the layer, uncropped); (3) the WebGL hand fly-in was
  reworked from a time-eased curve to a **critically-damped spring** — solved
  analytically per frame (`off = A·(1+ω·t)·e^(−ω·t)`, frame-rate independent) over
  **`HANDS_FLY_MS` = 1700** (was 1100). An ease-out started at max velocity and read
  as an abrupt, near-linear slide; the spring starts from **zero velocity**, so it
  accelerates in gently and decays on a long, soft tail — much smoother and more
  organic. Verified via Preview MCP (gradient stops, crop geometry with the bar
  staying centred as the white edge rises, and the spring curve: zero start
  velocity, ~2 % travel remaining at 1700 ms). See [[components/hero]] and
  [[components/three]].
- **Intro preloader + sequenced reveal** — a new `Preloader` splash: state 1 is a
  centred rounded progress bar (dark backing + gradient fill growing 0→100%, an
  animated counter, and a decorative outline equidistant around it, on a white
  layer); state 2 slides the white layer up (carrying/clipping the bar) while a
  dark-blue layer behind it slides up at a different speed, then unmounts. All
  `@react-spring/web`. The **hero DOM reveals and the WebGL hand fly-in are timed
  off it** via shared `src/lib/intro-timing.ts` constants — the hero entrances now
  start ~as the curtains lift (`HERO_REVEAL_DELAY`), and the two hands fly in (top
  from above, bottom from below, easing into place) when the preloader is ~90%
  gone (`HANDS_REVEAL_DELAY`; the glb splits into two meshes, top/bottom told
  apart by world-Y). New tokenised preloader colours in `globals.css`. ⚠️ **Not
  visually verified** (Preview MCP disconnected) — bar size/colours, curtain
  speeds, and the hand fly-in distance/timing want a look; all live in
  `intro-timing.ts` + the `Preloader` constants. See [[components/hero]] and
  [[components/three]].
- **Hero entrance animations** — added soft, spring-driven reveals on load
  (all `@react-spring/web` — no CSS keyframes, and they respect the global
  reduced-motion `skipAnimation`): the headline animates **per-letter**
  left-to-right (blur + opacity, `spring-text-engine`, new `HeroHeading` client
  leaf) — this **drops the headline gradient** (a `bg-clip-text` gradient puts
  the colour on the container, so per-letter opacity/blur have nothing to fade;
  the heading is now solid white); the description, CTAs, eyebrow, each metric
  cell, and the header ease in with a staggered soft fade-up (`<Spring
  mode="once">`, shared presets in `hero/reveal.ts`). The eyebrow tag is now
  **pure white**, and the Contact Us **`StatusDot`** blink is smoothed
  (ease-in-out-sine loop instead of a snappy spring). ⚠️ **Not visually
  verified** (Preview MCP disconnected). See [[components/hero]] and
  [[text-engine]].
- **Hero fidelity pass 2** — moved the eyebrow tag **above the metrics**,
  left-aligned to them (bottom band is now `desc+CTAs | [eyebrow-over-metrics]`,
  `items-end`, the behind-scene rule passing through the gap); the Contact Us pill
  is now **solid black with a semi-transparent white border** (`bg-black
  border-white/30`, no glass) while the logo/nav pills keep the frosted glass; the
  headline gradient is **horizontal** white → light-blue (`bg-gradient-to-r … to-[#79c0ff]`);
  and the dev tuning panel is **hidden by default** — it now mounts only with
  `?tune` in the URL (was: also in development). See [[components/hero]] and
  [[components/three]].
- **Hero fidelity pass (8 fixes)** — (1) bottom-left description → pure white;
  (2) the horizontal rule now sits **behind the 3D scene** — the WebGL canvas was
  made **transparent** (`alpha` renderer, `setClearColor(…,0)`, no `scene.background`,
  container `z-10` no `bg-black`) and the rule is a `z-0` DOM layer in `HomeView`
  (the orb/hands render over it); (3) the "Get started" button radius → `rounded-xl`
  to match the header pills; (4) headline letter-spacing removed + a white →
  blue-grey **text gradient** (`bg-clip-text`); (5) header pills got a **frosted-glass**
  look (`bg-white/5 backdrop-blur-md`); (6) the Contact Us dot is now a **green,
  gently blinking** `StatusDot` (spring-loop, no CSS keyframes; respects
  reduced-motion); (7) stats separators + all stats text → pure white; (8) the
  eyebrow tag is left-aligned to the content edge. ⚠️ **Not visually verified**
  (Preview MCP disconnected) — the divider-behind-scene (transparent-canvas/bloom
  interaction) and the exact heading gradient stops need a look. See
  [[components/hero]] and [[components/three]].
- **Scene defaults tuned (author preset)** — applied the author's tuned config to
  `DEFAULT_SCENE_CONFIG`: `cameraFov` 32, `parallaxAmplitude` 0.79, a lighter
  centre window (`centerDarken` 0.37 / `centerSize` 0.44), and a white,
  fully-rough, softly-glowing logo pushed behind centre (`logo` = scale 0.49,
  depth −0.37, roughness 1, color/emissive `#ffffff`, glow 0.55). See
  [[components/three]].
- **Glowing logo material + centred deeper; centre controls grouped** — the
  embedded logo mesh gained an **emissive (glow)** material (`emissive` colour +
  `emissiveIntensity`, blooms via the bloom pass), exposed in the panel's **Logo**
  section (glow colour + `glow` slider). Its default `depth` moved to `0` (dead
  centre of the orb, not out front). The orb centre-window controls (`centerDarken`
  / `centerSize`) were pulled into their own **Centre (orb window)** panel section
  for clarity. See [[components/three]].
- **3D logo embedded in the orb centre** — the centre mark is no longer a flat
  DOM `<img>`; it's a **3D model** (`public/assets/icon.glb`, DRACO — author's own,
  loaded via the existing `GLTFLoader` + `DRACOLoader`) given a **metallic**
  `MeshStandardMaterial` that reflects the live env map, embedded in the orb's
  centre. The shader **darkens + opens** a see-through window there so the mark
  reads like the mock — via `uCenterDark` (darkness) + `uCenterSize` (radius). The
  mark billboards to the camera, follows the orb's bob, and is hidden during the
  reflection capture. Config: `centerDarken` (now `0.92`) + `centerSize` (`0.7`,
  bigger window) + a `logo` group (`scale`, `depth`, `metalness`, `roughness`,
  `color`), all live-tunable in the panel (**Logo** section + **centre dark /
  size** sliders). Removed the DOM icon from the hero. *(An interim SVG-extrusion
  version — `SVGLoader` + `ExtrudeGeometry` on `icon.svg` — was replaced by the
  author's glb.)* ⚠️ **Not visually verified** — the Preview MCP was disconnected
  this session; check the mark's orientation/scale/embedding via the panel. See
  [[components/three]] and [[components/hero]].
- **Proportional scaling re-anchored to the 1440 design** — the layout now scales
  so every element keeps the same share of the viewport as in the Figma frame,
  both **up** on large monitors and down. Re-anchored the adaptive grid to a
  **single 1440 base** (`grid.config.ts` — dropped the 1920 breakpoint), and made
  the root font-size a plain uncapped `html { font-size: 1.111111vw }` in
  `globals.css` (= 16px at 1440, scaling up above it) — pure CSS, so it's
  flash-free / SSR-correct. **Unmounted `<AdaptiveGrid>`** from the root layout:
  its JS scale-up is now redundant (and its default damping would have *capped*
  the scale-up); the component stays available as an opt-in for *damped*
  ultrawide scaling. See [[decisions-log]] ADR-0016, [[design-system]], and
  [[components/common]].
- **Font → local Mulish; hero weight fixes** — replaced the Google `Onest`
  (`next/font/google`) with **local Mulish** (`next/font/local`) — the design's
  typeface, dropped into `src/app/fonts/` (Light 300 + Regular 400).
  `--font-sans` now points at `--font-mulish`. Since only 300/400 ship, removed
  `font-medium` (500) usages that were faux-bolding (buttons → Regular) and set
  the headline to `font-light`. See [[design-system]] and [[components/hero]].
- **GringX hero UI ported from Figma** — built the marketing hero (Figma node
  551:451) as a DOM overlay on the fixed WebGL nebula: a segmented navbar
  (`SiteHeader` — logo pill, primary nav, Contact Us), the `Hero` (headline,
  brand mark centred over the orb, description + CTAs, right-aligned eyebrow +
  rule, and the `HeroStats` 2×2 metrics), and a reusable `Button` primitive
  (`components/ui/`, primary/outline/link). Content lives in
  `src/data/mocks/home.ts` (no hardcoded content in components). The theme moved
  to a **single dark theme** with new tokens (`--muted`, `--border`, `--accent`,
  `--text-hero`, `--text-stat`, `--spacing-edge`) — see [[design-system]]. Enabled
  `dangerouslyAllowSVG` (locked CSP) in `next.config.ts` to serve the first-party
  `public/assets/logo.svg` / `icon.svg` through `next/image`. `HomeView` now
  layers `NebulaScene` (fixed bg) under the header + hero. See
  [[components/hero]] and [[decisions-log]] ADR-0015.
  - **Flagged for review:** the font files mentioned weren't in the project, so
    the hero uses the project's **Onest** (which also failed to load in the
    offline dev env → system fallback); confirm the intended font. Exact
    colours/type couldn't be pulled from Figma (Dev Mode "allowed directories"
    blocked `get_design_context`) — token values are **estimated from the
    screenshot**; confirm against the spec.
- **Blue preset as default + vertical spin** — replaced `DEFAULT_SCENE_CONFIG` /
  `DEFAULT_NEBULA_CONFIG` values with a tuned blue preset (deep-blue nebula on
  black, glossy blue-white metallic hands, `#7c9cfe` glow, fov 35, softer bloom).
  Added a slow **spin of the orb around its vertical axis** (`SPIN_SPEED`,
  0.15 rad/s) — composed as a local `rotateY` *after* the camera-facing
  counter-rotation, so it lives in camera space: the orb spins over time but the
  cursor still doesn't turn it. See [[components/three]].
- **Orb levitation** — the sphere now gently bobs up/down in the cradle
  (`sphere.position.y` on a sine, `LEVITATION_SPEED`). The travel is a config
  field `levitationAmplitude` (default `0.08` world units), applied live with a
  **levitation** slider in the panel's Scene section. See [[components/three]].
- **Cursor orbit parallax (hands swing, orb stays fixed) + configurable glow
  colour** — moving the cursor **orbits the camera** around the orb so the hands
  swing beautifully around it (`parallaxAmplitude`, default `0.35`), and the orb
  **counter-rotates to face the camera** (`sphere.lookAt(camera)`) so it stays
  visually fixed — same nebula face, no apparent spin. (This supersedes an
  interim attempt that literally spun the hands, then one that translated them;
  both were wrong — the wanted effect is a camera orbit with the orb held steady.)
  Separately, the point light spilling onto the hands was hardcoded amethyst, so
  recolouring the orb left a stray purple tint — its colour is now a config field
  (`glowColor`, default `#b884f2`), applied live and independent of the shader
  colour, with a picker in the **Light** section of the panel. See
  [[components/three]].
- **Shader mapping fixed — 3D noise instead of 2D projection** — the nebula was
  mapped via a 2D stereographic projection of the normal, which put the warp's
  fixed-point on the front of the sphere: a visible "flower" singularity in the
  centre and poor cursor response. Rewrote the shader to evaluate the
  domain-warped field in **3D** (3D value-noise fbm sampled along the object-space
  normal) — no seam, no pole, no fixed centre; clouds/stars/sparkle read cleanly
  everywhere. The cursor now feeds an object-space direction (`uMouseDir`) and the
  stir swirls the sample direction *around that axis* (Rodrigues) with angular
  falloff. `iMouse` (vec2) → `uMouseDir` (vec3); dropped `projectToSurfaceUv`. See
  [[components/three]] and [[decisions-log]] ADR-0014.
- **Live tuning panel + JSON export** — added `NebulaControls`, a floating dev
  panel (grouped sliders + colour pickers for every `SceneConfig` field) with a
  live Config-JSON box + copy button, so the scene can be tuned in-browser and
  the config pasted back into `DEFAULT_SCENE_CONFIG`. New entry wrapper
  `NebulaScene` owns the config state and mounts the panel only in development or
  with `?tune` (never ships to production otherwise). `NebulaSphere` was
  refactored to build the WebGL scene **once** and read the config from a ref
  every frame, so panel edits apply **live** (no model reload / renderer rebuild).
  `HomeView` now renders `NebulaScene`. See [[components/three]].
- **Nebula scene settings centralised + cursor parallax** — every tunable now
  lives in one `SceneConfig` (`nebula-sphere.config.ts`): `cameraFov`,
  `sphereScale`, `bloomStrength`, `parallaxAmplitude`, a `hands`
  `MeshStandardMaterial` group (`color`/`roughness`/`metalness`/`envMapIntensity`),
  and the `nebula` sphere-shader group (colours + motion). `resolveSceneConfig()`
  deep-merges a `SceneConfigInput` override; the `NebulaSphere` `config` prop
  accepts it. Added a **camera parallax** that gently drifts toward the cursor
  (amplitude from config). See [[components/three]].
- **Nebula sphere cradled in hands + reflection** — added a DRACO-compressed
  hands model (`public/assets/hands.glb`) cradling the orb, matching a reference
  composition. Loaded with `GLTFLoader` + `DRACOLoader` (three's decoder vendored
  to `public/draco/`, served same-origin). The orb was shrunk (`SPHERE_SCALE`
  0.62) and bloom softened (strength 0.6 → 0.25). The hands **reflect the orb**:
  a live `CubeCamera` at the centre captures the sphere into a
  `WebGLCubeRenderTarget` used as the hands' `envMap` **and** `scene.environment`
  (image-based lighting), plus an amethyst `PointLight` glow spill and a faint
  cool `DirectionalLight` fill. `public/**` added to the ESLint ignore list (the
  vendored draco decoder is third-party minified JS). `three` addons
  `GLTFLoader` / `DRACOLoader` are used (no new npm dependency). See
  [[components/three]] and [[decisions-log]] ADR-0014.
- **3D nebula sphere added — first WebGL scene** — the home view (`/`) now
  renders a shader-driven amethyst/magenta nebula painted onto a rotating 3D
  sphere on a black void, cursor-interactive (raycast stir + glow), with an
  `UnrealBloomPass` glow and a one-time entrance fade. New dependency **`three`**
  (`^0.185`) + `@types/three` — the first GPU/WebGL layer. New
  `src/components/three/` domain folder: `nebula-sphere.tsx` (client leaf,
  full lifecycle teardown), `nebula-sphere.shaders.ts` (GLSL), and
  `nebula-sphere.config.ts` (typed `NebulaConfig`, spec values as prop
  defaults). The source was a full-screen screen-space nebula; it was adapted
  onto the sphere via a **stereographic projection of the object-space normal**
  (seamless, no pole pinch) plus a fresnel limb/atmosphere rim, and its
  three-composer bloom rig collapsed to a single `EffectComposer`. Hard rule #1
  (spring-only) is clarified to govern **DOM/CSS** motion — WebGL shader
  animation is a separate, allowed layer. `HomeView` stays a Server Component
  rendering the client leaf (hard rule #6). See [[decisions-log]] ADR-0014,
  [[components/three]], [[tech-stack]], and [[animation-system]].

## 2026-06-07

- **Fixed `<Inview>` standalone reveal + spring resize gating** — `<Inview>`
  never animated unless an external `trigger` ref was passed. The JSX `ref`
  callback wrote `inViewRef.current = node`, but that tuple slot is a *callback
  ref* (`setNode`), so the element was never observed and the `node` stayed
  `null`. Now calls `setInViewNode(node)`. This was also a build-breaking type
  error. Additionally, `<Inview>`, `<Spring>`, and `<Hover>` tracked `width` as a
  hook dependency but never passed it to `isMobileDisabled` — fixed by passing the
  tracked `width`, restoring resize re-evaluation and clearing the
  `react-hooks/exhaustive-deps` warnings. `yarn build` and `yarn lint` are now
  clean. See [[decisions-log]] ADR-0013 and [[components/animation-springs]].

## 2026-06-05

- **Home view emptied** — removed the animation showcase (`src/views/home-showcase.tsx`
  deleted) and reduced `HomeView` to an empty `<main>`. The home view is now the
  blank starting point for new work. Documented the convention — *if the project
  is empty and no other instructions are provided, start developing in the home
  view on route `/`* — in [[ai-agent-guide]] and [[new-page]].

## 2026-05-23

- **README — setup + Vercel deploy steps added** — *Getting started* expanded
  into a four-step flow (clone the template → delete bundled `.git` →
  initialise your own GitHub repo → install & run), with a macOS hint for
  revealing the hidden `.git` folder (`⇧ + ⌘ + .`). Added a *🚀 Deploy to
  Vercel* section covering the CLI flow (`vercel` / `vercel --prod`) and the
  dashboard import path, plus an `env pull` pointer to
  [[environment-variables]].
- **README rewritten to lead with the AI workflow** — root `README.md`
  reorganised so the AI usage guide is the first section: how the three
  `.claude/settings.json` hooks (`SessionStart`, `UserPromptSubmit`, `Stop`)
  enforce the vault workflow automatically, how to write a good request
  against this convention layer, and a cost-expectations note recommending
  **Claude Max (5×)** as the minimum plan (the vault-fan-out + hook
  re-injection on every turn is token-intensive by design). Technical
  *Getting started* and the existing AI-agents entry-point pointer stay
  below.

## 2026-05-22

- **Styling-placement convention added** — to stop `globals.css` accumulating
  hundreds of component-specific classes, styling now follows a strict
  placement order: one-offs are Tailwind utilities, repeated patterns become
  **React components** (not `@layer components` classes), and `@layer
  components` is reserved strictly for pseudo-elements and third-party
  overrides. `globals.css` stays bounded — `@import`, tokens, base resets only.
  No CSS Modules. Codified in [[decisions-log]] ADR-0012; [[design-system]]
  (new *Where a style goes* section) and [[component-conventions]] updated.
- **Semantic-HTML / SEO-markup convention added** — new [[html-semantics]]
  rulebook: landmarks, one `<h1>` + heading outline, native elements over
  `div`s, forms/images/ARIA, JSON-LD over microdata, a `data-*` convention, and
  passing a semantic `tag` to animation components. Codified as AGENTS.md hard
  rule #10; cross-linked from [[component-conventions]] and [[new-page]]. Fixed
  the demo (`home-showcase.tsx`) to a single `<h1>` to follow it.
- **API layer added** — a convention for reaching external services.
  `app/api/<resource>/route.ts` Route Handlers own their logic and read secret
  env vars directly (safe — route files never reach the browser). New: `zod`
  dependency; `src/env.ts` (validated env, public/server split); `src/lib/api/`
  (`handle` wrapper + `ApiError` + `{ data }`/`{ error }` envelope);
  `src/lib/api-client.ts` (typed same-origin fetch); example
  `app/api/contact/route.ts`. Codified as AGENTS.md hard rule #9. See
  [[decisions-log]] ADR-0011 and [[api-architecture]].

## 2026-05-21

- **Asset convention added** — site content assets (images, videos) now live
  under `public/assets/<section>/`, one folder per section; meta/PWA/SEO assets
  stay at the `public/` root. Documented in [[folder-structure]],
  [[component-conventions]], and the [[new-page]] playbook; `public/assets/`
  created with a `.gitkeep`.
- **SEO & performance hardening** — a broad pass on the starter. **SEO:** new
  `src/lib/site.ts` config (single source of truth, fed by `NEXT_PUBLIC_SITE_URL`);
  `metadataBase` is now always set (relative OG/canonical URLs resolve);
  `themeColor` moved to a `viewport` export; added `app/robots.ts`,
  `app/sitemap.ts`, and an `Organization`+`WebSite` JSON-LD helper; OG image
  dimensions corrected to match the asset; dead `keywords`/`other` tags dropped.
  **Performance:** populated `next.config.ts` (`removeConsole` in prod,
  AVIF/WebP, `next/image` breakpoints aligned to the grid, `poweredByHeader:
  false`); fixed a `requestAnimationFrame` leak in `ScrollLayout` (Lenis loop
  never cancelled on unmount); `HomeView` is now a Server Component with the
  animation demo split into the `HomeShowcase` client leaf; added
  `<ReducedMotion>` (honours `prefers-reduced-motion` via react-spring's global
  `skipAnimation`); removed a per-frame `console.log` from the demo; added
  `app/loading.tsx` / `error.tsx` / `not-found.tsx`. See [[decisions-log]]
  ADR-0010, [[seo-metadata]], and [[environment-variables]].
- **Animation engine — lint pass** — cleared all 13 pre-existing ESLint problems
  in the engine (2 errors + 11 warnings), an authorized engine edit (ADR-0009).
  `isMobileDisabled` now takes an optional `viewportWidth` argument, so the
  `active` memos in `<Spring>` / `<Hover>` / `<Inview>` / the trigger hooks
  depend on it genuinely. Added missing `disableOnMobile` effect deps; fixed a
  `trigger.current`-in-cleanup hazard in `<Hover>`; ref-stabilised `<Handle>`'s
  transition effects. **API change:** `useProgressTrigger` now returns `progress`
  as a `RefObject<number>` (read `.current`) instead of a render-time ref read —
  no consumer was affected (`<ProgressTrigger>` discards the return).
- **Animation engine — performance refactor** — fixed load issues that scaled
  with the number of animated components. Added `src/lib/animation/ticker.ts`, a
  single reference-counted `requestAnimationFrame` loop; `useLoop` (and all loop
  hooks) now subscribe to it instead of each starting its own rAF. `useWindowWidth`
  / `Height` / `Size` now share one debounced `resize` listener via a
  `useSyncExternalStore` store (the `debounceDelay` param was dropped — unused).
  `useDynamicInView` rewritten without the per-render `Proxy`/observer churn.
  Fixed a stale-closure bug in `useLoop`. `mode="forward"` scroll listeners made
  `passive`. This was an **authorized edit to `#do-not-modify` engine files** —
  hard rule #2 amended. See [[decisions-log]] ADR-0009 and [[animation-system]].
- **`spring-text-engine` updated** — bumped `^0.1.3` → `^0.1.5` (latest). The
  public API, types, and dependencies are unchanged between these versions
  (verified) — an internal-only patch bump, no code changes required.
- **Adaptive scaling grid added** — a root-font-size scaling system landed in
  `src/components/common/grid/` (`<AdaptiveGrid>` + `useAdaptiveGrid` hook +
  `grid.config.ts`), with `vw` media queries in `globals.css` for scale-down.
  It was dropped into `common/` as a `styled-components` system; ported to the
  project stack — config-driven TS + CSS-only Tailwind, no `styled-components`.
  The unused dropped files (`colors.ts`, `fonts.ts`, `utils.ts`, `index.ts`,
  the `styled-components` `grid.tsx`) were removed. Mounted via `<AdaptiveGrid>`
  in the root layout. See [[components/common]] and [[decisions-log]] ADR-0008.
- **Vault created** — `obsidian/` Obsidian vault initialised as the project's
  second brain. Architecture, frontend, and workflow docs populated. See [[decisions-log]] ADR-0001.
- **Root README rewritten** — replaced `create-next-app` boilerplate with a real
  project README that points into this vault.
- **`generic-layout-prompt.md` moved** — relocated from repo root to
  `obsidian/workflows/` as [[generic-layout-prompt]].
- **Navigation convention resolved** — standard `next/link` confirmed; the unbuilt
  `<AnimLink>` / `useAnimRouter()` convention dropped. See [[decisions-log]] ADR-0005.
- **Docs consolidated into the vault** — `project-specs.md` deleted (decomposed into
  vault notes + new [[environment-variables]]); `text-engine-docs.md` moved in as
  [[text-engine-reference]]. `AGENTS.md` rewritten as a thin shim; `.cursorrules`
  repointed to `@AGENTS.md`. The vault is now the single source of truth.
  See [[decisions-log]] ADR-0006.
- **Vault renamed & restructured** — vault folder `getlayers.io/` → `obsidian/`;
  number prefixes dropped from section folders (`00-meta` → `meta`, etc.). Project
  name standardised to **`next16-claude-starter`** across docs and `package.json`.
- **Components linked to docs** — every file in `src/components/` now carries a
  `// 📖 Docs:` pointer comment to its catalog note, so agents can jump from code
  to docs and back.
- **Vault workflow automated** — added `.claude/settings.json` with `SessionStart`,
  `UserPromptSubmit`, and `Stop` hooks that make agents read the vault first,
  follow the relevant guide, and update docs after every change — with no manual
  reminder. See [[decisions-log]] ADR-0007 and [[ai-agent-guide]].
- **Cookie component replaced** — the `react-cookie-consent`-based `cookie.tsx`
  was replaced by an in-house `Cookie/` component (banner + category preferences
  modal + Zustand store). `react-cookie-consent` removed from dependencies. The
  component shipped using `styled-components` + an external design system; it was
  ported to the project stack — Tailwind v4 tokens and `@react-spring/web` motion.
  Mounted via `<LazyCookie>`. See [[components/common]].
- **Fixed TextEngine spring type mismatch** — the `mode="once"` heading in
  `views/home.tsx` mixed `lineIn={{ y: 0 }}` (number) with `lineOut={{ y: "100%" }}`
  (string), throwing *"Cannot animate between _AnimatedString and _AnimatedValue"*.
  Changed to `y: "0%"`. The buggy pattern in [[text-engine]] / [[text-engine-reference]]
  examples was corrected and a type-matching gotcha note added.

## Project baseline (git history)

| Commit | Description |
|--------|-------------|
| `94b0870` | feat: update starter |
| `5280ef2` | fix: linter errors & build |
| `b2b84e6` | initial — `next16-claude-starter` scaffold |

> [!note]
> The starter shipped with: Next.js 16.2, React 19.2, Tailwind v4, `@react-spring/web`,
> `spring-text-engine`, Lenis, and Zustand. See [[tech-stack]] for the current state.
