---
tags: [frontend, three, webgl, stable]
updated: 2026-07-07
---

# Catalog — 3D / WebGL Components

Files in `src/components/three/` — GPU-rendered scenes built on **`three`**
(raw, no `@react-three/fiber`). This is a **separate rendering layer** from the
spring animation system: the spring-only rule (hard rule #1) governs DOM/CSS
motion, shader animation does not fall under it. See [[tech-stack]],
[[animation-system]], and [[decisions-log]] ADR-0014.

Conventions still apply: `"use client"` only at the leaf, Server Components
above it, typed props, no `any`, and full lifecycle teardown on unmount.

## NebulaSphere — `nebula-sphere.tsx`

A full-screen WebGL scene: a 3D **nebula sphere cradled in a pair of hands** on a
black void. The orb's surface is a domain-warped amethyst → magenta **nebula**
shader (star field + hero cross-flare sparkle + fresnel limb + `UnrealBloomPass`
glow); the **hands reflect and are lit by the orb**. The cursor **stirs the
clouds** and **drags a soft glow** across the surface; it fades in once on load.
The orb **gently levitates** (bobs up/down in the cradle) and **slowly spins
around its vertical axis** (`SPIN_SPEED`). Moving the cursor **orbits the camera**
around the orb, so the **hands swing around it**; the orb **counter-rotates to
face the camera** (the spin is composed *after* via a local `rotateY`, so it
lives in camera space) — the cursor never turns the orb, only time does.
`HomeView` on `/`
renders **`NebulaScene`** (the entry component), which owns the config state and
mounts the WebGL leaf plus — while tuning — a dev controls panel. Every tunable
is centralised — see *Settings* below.

| File | Role |
|------|------|
| `nebula-scene.tsx` | Entry client wrapper — owns config state, mounts the sphere + (when tuning) the panel |
| `nebula-controls.tsx` | Dev tuning panel — live sliders / colour pickers + JSON export |
| `nebula-sphere.tsx` | WebGL leaf — `three` scene (built once), model load, live-config render loop, cursor raycast, teardown |
| `nebula-sphere.shaders.ts` | Vertex + fragment GLSL (the nebula field, stars, sparkle, rim) |
| `nebula-sphere.config.ts` | `SceneConfig` / `NebulaConfig` types, defaults, `resolveSceneConfig`, `hexToVec3` |

**Assets.** `public/assets/hands.glb` (DRACO-compressed hands model) and
`public/draco/` (three's DRACO decoder — `draco_wasm_wrapper.js` +
`draco_decoder.wasm`, served same-origin). The hands are loaded with
`GLTFLoader` + `DRACOLoader` (`setDecoderPath("/draco/")`) — three `examples/jsm`
addons, no extra npm dependency. `public/**` is ESLint-ignored (the decoder is
third-party minified JS). Purely-compositional constants stay at the top of
`nebula-sphere.tsx` (`HANDS_SCALE`, `HANDS_POSITION`, `CAMERA_Z`,
`PARALLAX_LERP`) — tuned against the reference.

**Reflection & lighting.** The orb is emissive (its shader needs no lights); the
**hands** do. A `CubeCamera` at the centre renders the sphere into a
`WebGLCubeRenderTarget` every frame (hands hidden during capture) — used as the
hands' `MeshStandardMaterial.envMap` (visible reflection of the nebula) **and**
as `scene.environment` for image-based lighting. Plus a `PointLight` at the orb
(glow spill onto the cradling palms — its colour is `glowColor`, **independent**
of the shader colour, so recolouring the orb doesn't leave a stray tint) and a
faint cool
`DirectionalLight` fill so the shadowed backs still read as form.

**Props** — `NebulaSphereProps`:

| Prop | Type | Meaning |
|------|------|---------|
| `config` | `SceneConfigInput` | Deep-partial override of the scene settings (default = `DEFAULT_SCENE_CONFIG`) |
| `className` | `string` | Extra classes on the full-screen container |

**Settings** — one place, `nebula-sphere.config.ts`. `SceneConfig` groups every
tunable; `resolveSceneConfig(input)` deep-merges an override onto
`DEFAULT_SCENE_CONFIG` (one level deep for the `hands` / `nebula` groups):

| Field | Meaning |
|-------|---------|
| `cameraFov` | Camera field of view (deg) |
| `sphereScale` | Uniform scale of the orb |
| `bloomStrength` | `UnrealBloomPass` glow strength |
| `parallaxAmplitude` | Camera orbit offset (world units) as the cursor reaches the edge — hands swing around the orb |
| `levitationAmplitude` | How far the orb bobs up/down (world units) — gentle levitation |
| `glowColor` | Colour of the point light spilling from the orb onto the hands (independent of the shader colour) |
| `centerDarken` | How dark + see-through the orb's centre is (0..1) — the window the logo sits in |
| `centerSize` | Radius of that dark centre window as a share of the visible disc (0..1) |
| `hands` | `HandsMaterialConfig` — `color`, `roughness`, `metalness`, `envMapIntensity` |
| `logo` | `LogoConfig` — the mark: `scale`, `depth` (z; `0` = orb centre), `metalness`, `roughness`, `color`, `emissive` (glow colour) + `emissiveIntensity` |
| `nebula` | `NebulaConfig` — the **sphere shader**: colours (`colDeep`/`colNebula`/`colBright`/`colHot`/`colStar`) + motion tunables |

```tsx
import { NebulaSphere } from "@/components/three/nebula-sphere";
// defaults reproduce the amethyst/magenta "Nebula" spec
<NebulaSphere />
// or tune any group
<NebulaSphere config={{
  cameraFov: 50,
  parallaxAmplitude: 0.6,
  hands: { roughness: 0.2, envMapIntensity: 3 },
  nebula: { colHot: "#ff88aa", flowSpeed: 0.3 },
}} />
```

Purely-compositional constants (`HANDS_SCALE`, `HANDS_POSITION`, `CAMERA_Z`,
`PARALLAX_LERP`) stay at the top of `nebula-sphere.tsx`.

**How the shader maps to the sphere.** The source was a *screen-space*
full-screen nebula (`gl_FragCoord`). The field is now evaluated in **3D** —
sampled along the sphere's object-space normal with 3D value-noise fbm. An
earlier **2D stereographic** projection was tried and rejected: it put the 2D
warp's fixed-point (`uv = 0`) on the front of the sphere, producing a visible
"flower" singularity in the centre and poor cursor response. 3D noise on the
direction has no seam, no pole, and no fixed centre, so the clouds/stars/sparkle
read cleanly everywhere and flow naturally as the sphere rotates. The cursor is
raycast onto the sphere to an **object-space direction** (`uMouseDir`); the
shader swirls the sample direction *around that axis* (Rodrigues) with angular
falloff, so the stir + glow track the hovered point without any singularity.

**Rendering.** One `EffectComposer`: `RenderPass` → `UnrealBloomPass` →
`OutputPass` (collapsed from the source's three-composer selective-bloom rig —
a single glowing orb needs nothing more). The canvas is **transparent** (`alpha`
renderer, `setClearColor(…, 0)`, no `scene.background`; container `fixed inset-0
z-10`, `aria-hidden`) so a DOM layer (the hero's horizontal rule) can sit *behind*
the orb — see [[components/hero]] *Layering*. The bloom pass adds bloom
additively, so empty areas stay transparent.

**Embedded 3D logo.** The centre mark is a real 3D mesh (not DOM): the author's
`public/assets/icon.glb` (DRACO) loaded via the same `GLTFLoader` + `DRACOLoader`
as the hands, re-materialled with a **metallic + emissive (glowing)**
`MeshStandardMaterial` (`emissive` / `emissiveIntensity` bloom via the bloom pass)
reflecting the cube env map. It's centred (`Box3`) and normalised to `logo.scale`
(default `depth` `0` = the orb's centre), wrapped in
a group that billboards to the camera (`lookAt`) and follows the orb's bob each
frame. To make it read like the mock, the shader **darkens + opens** the
view-centre of the orb (a soft circle where `ndv → 1`) — the orb is transparent
there, so the mark shows through the dark window while the nebula fades in around
it. `uCenterDark` sets the darkness, `uCenterSize` the radius. The mark is hidden
during the reflection capture (like the hands). Tunables: `centerDarken` /
`centerSize` + the `logo` config group (**Logo** panel section).

**Hand fly-in.** After the preloader, the two hands settle into place — the top
one from above, the bottom one from below — with a **critically-damped spring**,
not a time-eased curve. It's solved analytically each frame
(`off(t) = A·(1 + ω·t)·e^(−ω·t)`), so there's no per-frame velocity state and it
stays frame-rate independent. Unlike an ease-out (which starts at *max* velocity
and reads as an abrupt, near-linear slide), the spring starts from **zero
velocity** — it accelerates in gently and decays on a long, soft asymptotic tail,
reading as smooth and organic. `ω` is derived from `HANDS_FLY_MS` (~2 % of the
travel remaining at that mark). The glb has two meshes; they're told apart by
world-Y, and each gets the animated Y offset (`HANDS_FLY_DISTANCE` local units →
rest) driven off `HANDS_REVEAL_DELAY` / `HANDS_FLY_MS` (1700 ms) in
`src/lib/intro-timing.ts` (shared with the [[components/hero]] intro sequence). Off-screen until their delay, so they're hidden behind the
splash until they enter.

**Dev panel (`NebulaControls`).** A floating, collapsible tuning panel (grouped
sliders + colour pickers for every `SceneConfig` field) with a live **Config
JSON** box and a copy button — edit the scene in-browser, copy the JSON, paste it
into `DEFAULT_SCENE_CONFIG` (or a `config` prop). It is controlled: `NebulaScene`
owns the state, and the panel is **hidden by default** — it mounts only when the
URL has **`?tune`** (in any environment). Purely a dev tool; the shipped scene is
just `<NebulaSphere config={...} />`.

**Live config (no rebuild).** The WebGL scene is built **once** (empty-dep
`useEffect`); the current config lives in a ref refreshed on prop change, and the
render loop reads it every frame — so panel edits (colours, material, bloom, FOV,
parallax, sphere scale) apply instantly without reloading the model or
recreating the renderer.

**Lifecycle.** The build `useEffect` creates renderer / scene / camera / mesh /
composer, runs a `requestAnimationFrame` loop driven by `performance.now()`, and
on cleanup cancels the rAF, removes the `pointermove` / `resize` listeners, and
disposes the composer, orb geometry/material, loaded hand geometries, the hands
material, the cube render target, the DRACO loader, and the renderer. Pixel
ratio is capped at 2. (Note: browsers pause `requestAnimationFrame` on
hidden/backgrounded tabs, so the entrance fade only advances once the tab is
visible — expected.)

## Related

[[tech-stack]] · [[animation-system]] · [[component-conventions]] · [[decisions-log]]
