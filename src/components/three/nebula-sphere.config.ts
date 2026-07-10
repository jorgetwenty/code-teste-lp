// 📖 Docs: obsidian/frontend/components/three.md
import { Vector3 } from "three";

/**
 * Tunables for the {@link NebulaSphere}. Colours are `#rrggbb` strings; the
 * numeric fields map 1:1 onto the fragment-shader uniforms. Defaults reproduce
 * the amethyst/magenta "Nebula" spec — override per-instance via props.
 */
export interface NebulaConfig {
  /** void — deepest shadow of the cloud ramp */
  colDeep: string;
  /** amethyst — mid-density nebula body */
  colNebula: string;
  /** lavender — bright cloud highlights */
  colBright: string;
  /** magenta — hottest core + atmosphere rim */
  colHot: string;
  /** star / sparkle colour */
  colStar: string;
  /** fractal domain scale across the surface */
  nebulaScale: number;
  /** cloud flow speed (time multiplier) */
  flowSpeed: number;
  /** star field brightness */
  starDensity: number;
  /** twinkle frequency */
  twinkleSpeed: number;
  /** cursor swirl strength */
  swirlStrength: number;
  /** cursor glow strength */
  glowStrength: number;
  /** global output brightness */
  brightness: number;
  /** per-frame cursor smoothing factor (read in JS, not a uniform) */
  cursorLerp: number;
}

export const DEFAULT_NEBULA_CONFIG: NebulaConfig = {
  colDeep: "#000000",
  colNebula: "#ff1f8f",
  colBright: "#ff9ccc",
  colHot: "#ff4fa3",
  colStar: "#ffd6ea",
  nebulaScale: 2.4,
  flowSpeed: 0.295,
  starDensity: 0.85,
  twinkleSpeed: 2,
  swirlStrength: 0.35,
  glowStrength: 0.34,
  brightness: 1.73,
  cursorLerp: 0.25,
};

/** `#rrggbb` → linear-ish `Vector3` in 0..1, for a shader colour uniform. */
export const hexToVec3 = (hex: string): Vector3 => {
  const n = parseInt(hex.slice(1), 16);
  return new Vector3(
    ((n >> 16) & 255) / 255,
    ((n >> 8) & 255) / 255,
    (n & 255) / 255,
  );
};

/** The extruded 3D logo embedded in the orb's centre (a `MeshStandardMaterial`). */
export interface LogoConfig {
  /** Max size in world units (the mark is fit to this). */
  scale: number;
  /** Z offset toward the camera — how far the mark sits out of the orb centre. */
  depth: number;
  /** 0 = dielectric, 1 = metal. */
  metalness: number;
  /** 0 = mirror, 1 = matte. */
  roughness: number;
  /** Base colour (`#rrggbb`). */
  color: string;
  /** Emissive (glow) colour (`#rrggbb`) — blooms via the bloom pass. */
  emissive: string;
  /** Emissive strength — how much the mark glows. */
  emissiveIntensity: number;
}

/** Appearance of the hands (a `MeshStandardMaterial`). */
export interface HandsMaterialConfig {
  /** Base clay colour (`#rrggbb`). */
  color: string;
  /** 0 = mirror, 1 = fully matte. */
  roughness: number;
  /** 0 = dielectric, 1 = metal. */
  metalness: number;
  /** Strength of the orb's reflection / IBL on the hands. */
  envMapIntensity: number;
}

/**
 * Everything tunable about the scene, in one place. `nebula` holds the sphere
 * **shader** (colours + motion tunables); the rest is the 3D framing.
 */
export interface SceneConfig {
  /** Camera field of view, in degrees. */
  cameraFov: number;
  /** Uniform scale of the nebula orb. */
  sphereScale: number;
  /** `UnrealBloomPass` strength (glow). */
  bloomStrength: number;
  /** Cursor parallax amplitude — camera orbit offset (world units) at the screen edge. */
  parallaxAmplitude: number;
  /** Levitation amplitude — how far the orb bobs up/down (world units). */
  levitationAmplitude: number;
  /** Colour of the point light spilling from the orb onto the hands (`#rrggbb`). */
  glowColor: string;
  /** How dark + see-through the orb's centre gets, so the logo reads (0..1). */
  centerDarken: number;
  /** Radius of the dark centre window as a share of the visible disc (0..1). */
  centerSize: number;
  /** Hands material. */
  hands: HandsMaterialConfig;
  /** The extruded 3D logo embedded in the orb centre. */
  logo: LogoConfig;
  /** Sphere shader — colours + motion. */
  nebula: NebulaConfig;
}

export const DEFAULT_SCENE_CONFIG: SceneConfig = {
  cameraFov: 32,
  sphereScale: 0.62,
  bloomStrength: 0.19,
  parallaxAmplitude: 0.79,
  levitationAmplitude: 0.08,
  glowColor: "#ff4fa3",
  centerDarken: 0.37,
  centerSize: 0.44,
  hands: {
    color: "#ffb3d3",
    roughness: 0.31,
    metalness: 0.83,
    envMapIntensity: 2.25,
  },
  logo: {
    scale: 0.49,
    depth: -0.37, // pushed behind the orb's centre
    metalness: 1,
    roughness: 1,
    color: "#ffffff",
    emissive: "#ffffff",
    emissiveIntensity: 0.55,
  },
  nebula: DEFAULT_NEBULA_CONFIG,
};

/** A deep-partial of {@link SceneConfig} for per-instance overrides. */
export type SceneConfigInput = Partial<
  Omit<SceneConfig, "hands" | "logo" | "nebula">
> & {
  hands?: Partial<HandsMaterialConfig>;
  logo?: Partial<LogoConfig>;
  nebula?: Partial<NebulaConfig>;
};

/** Merge a partial override onto the defaults (one level deep for the groups). */
export const resolveSceneConfig = (input?: SceneConfigInput): SceneConfig => ({
  ...DEFAULT_SCENE_CONFIG,
  ...input,
  hands: { ...DEFAULT_SCENE_CONFIG.hands, ...input?.hands },
  logo: { ...DEFAULT_SCENE_CONFIG.logo, ...input?.logo },
  nebula: { ...DEFAULT_SCENE_CONFIG.nebula, ...input?.nebula },
});
