// 📖 Docs: obsidian/frontend/components/three.md
"use client";

import { useState } from "react";

import type {
  HandsMaterialConfig,
  LogoConfig,
  NebulaConfig,
  SceneConfig,
} from "./nebula-sphere.config";

export interface NebulaControlsProps {
  config: SceneConfig;
  onChange: (next: SceneConfig) => void;
  onReset: () => void;
}

interface Range {
  min: number;
  max: number;
  step: number;
}

// numeric keys of each group, with their slider ranges
const SCENE_SLIDERS: { key: "cameraFov" | "sphereScale" | "bloomStrength" | "parallaxAmplitude" | "levitationAmplitude"; label: string; range: Range }[] = [
  { key: "cameraFov", label: "camera fov", range: { min: 20, max: 90, step: 1 } },
  { key: "sphereScale", label: "sphere scale", range: { min: 0.2, max: 1.5, step: 0.01 } },
  { key: "bloomStrength", label: "bloom", range: { min: 0, max: 1.5, step: 0.01 } },
  { key: "parallaxAmplitude", label: "parallax", range: { min: 0, max: 1.2, step: 0.01 } },
  { key: "levitationAmplitude", label: "levitation", range: { min: 0, max: 0.3, step: 0.005 } },
];

// the orb's dark centre window (where the logo sits)
const CENTER_SLIDERS: { key: "centerDarken" | "centerSize"; label: string; range: Range }[] = [
  { key: "centerDarken", label: "darken", range: { min: 0, max: 1, step: 0.01 } },
  { key: "centerSize", label: "size", range: { min: 0, max: 1, step: 0.01 } },
];

const LOGO_SLIDERS: { key: keyof Omit<LogoConfig, "color" | "emissive">; label: string; range: Range }[] = [
  { key: "scale", label: "scale", range: { min: 0.1, max: 1.2, step: 0.01 } },
  { key: "depth", label: "depth (z)", range: { min: -0.6, max: 0.6, step: 0.01 } },
  { key: "metalness", label: "metalness", range: { min: 0, max: 1, step: 0.01 } },
  { key: "roughness", label: "roughness", range: { min: 0, max: 1, step: 0.01 } },
  { key: "emissiveIntensity", label: "glow", range: { min: 0, max: 5, step: 0.05 } },
];

const HANDS_SLIDERS: { key: keyof Omit<HandsMaterialConfig, "color">; label: string; range: Range }[] = [
  { key: "roughness", label: "roughness", range: { min: 0, max: 1, step: 0.01 } },
  { key: "metalness", label: "metalness", range: { min: 0, max: 1, step: 0.01 } },
  { key: "envMapIntensity", label: "reflection", range: { min: 0, max: 5, step: 0.05 } },
];

const NEBULA_COLORS: { key: keyof NebulaConfig; label: string }[] = [
  { key: "colDeep", label: "deep" },
  { key: "colNebula", label: "nebula" },
  { key: "colBright", label: "bright" },
  { key: "colHot", label: "hot" },
  { key: "colStar", label: "star" },
];

const NEBULA_SLIDERS: { key: keyof NebulaConfig; label: string; range: Range }[] = [
  { key: "nebulaScale", label: "scale", range: { min: 1, max: 10, step: 0.1 } },
  { key: "flowSpeed", label: "flow", range: { min: 0, max: 1, step: 0.005 } },
  { key: "starDensity", label: "stars", range: { min: 0, max: 2, step: 0.01 } },
  { key: "twinkleSpeed", label: "twinkle", range: { min: 0, max: 6, step: 0.1 } },
  { key: "swirlStrength", label: "swirl", range: { min: 0, max: 1.5, step: 0.01 } },
  { key: "glowStrength", label: "glow", range: { min: 0, max: 1, step: 0.01 } },
  { key: "brightness", label: "brightness", range: { min: 0.2, max: 3, step: 0.01 } },
  { key: "cursorLerp", label: "cursor ease", range: { min: 0.02, max: 1, step: 0.01 } },
];

const Slider = ({
  label,
  value,
  range,
  onChange,
}: {
  label: string;
  value: number;
  range: Range;
  onChange: (v: number) => void;
}) => (
  <label className="flex items-center gap-2">
    <span className="w-24 shrink-0 truncate text-white/60">{label}</span>
    <input
      type="range"
      min={range.min}
      max={range.max}
      step={range.step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="h-1 flex-1 accent-fuchsia-400"
    />
    <span className="w-9 text-right tabular-nums text-white/80">{value}</span>
  </label>
);

const ColorField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <label className="flex items-center gap-2">
    <span className="w-24 shrink-0 truncate text-white/60">{label}</span>
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-5 w-8 cursor-pointer rounded border border-white/20 bg-transparent"
    />
    <span className="flex-1 text-right tabular-nums text-white/50">{value}</span>
  </label>
);

/**
 * Floating dev panel to tune every {@link SceneConfig} value live and copy the
 * resulting JSON. Controlled — the parent owns the config. Shown only when
 * tuning is enabled (see `NebulaScene`); never part of the shipped scene.
 */
export const NebulaControls = ({ config, onChange, onReset }: NebulaControlsProps) => {
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const setScene = (
    key:
      | (typeof SCENE_SLIDERS)[number]["key"]
      | (typeof CENTER_SLIDERS)[number]["key"],
    v: number,
  ) => onChange({ ...config, [key]: v });
  const setGlowColor = (v: string) => onChange({ ...config, glowColor: v });
  const setHands = (key: keyof HandsMaterialConfig, v: number | string) =>
    onChange({ ...config, hands: { ...config.hands, [key]: v } });
  const setLogo = (key: keyof LogoConfig, v: number | string) =>
    onChange({ ...config, logo: { ...config.logo, [key]: v } });
  const setNebula = (key: keyof NebulaConfig, v: number | string) =>
    onChange({ ...config, nebula: { ...config.nebula, [key]: v } });

  const json = JSON.stringify(config, null, 2);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-3 top-3 z-50 rounded-md bg-black/70 px-3 py-1.5 text-xs text-white/80 ring-1 ring-white/15 backdrop-blur hover:text-white"
      >
        ⚙ tune
      </button>
    );
  }

  return (
    <aside className="fixed right-3 top-3 z-50 flex max-h-[92vh] w-72 flex-col gap-3 overflow-y-auto rounded-lg bg-black/75 p-3 text-[11px] text-white ring-1 ring-white/15 backdrop-blur">
      <header className="flex items-center justify-between">
        <h2 className="text-xs font-semibold tracking-wide text-white/90">
          Nebula controls
        </h2>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onReset}
            className="rounded bg-white/10 px-2 py-0.5 text-white/70 hover:text-white"
          >
            reset
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded bg-white/10 px-2 py-0.5 text-white/70 hover:text-white"
          >
            ✕
          </button>
        </div>
      </header>

      <section className="flex flex-col gap-1.5">
        <h3 className="text-[10px] uppercase tracking-widest text-white/40">Scene</h3>
        {SCENE_SLIDERS.map((s) => (
          <Slider
            key={s.key}
            label={s.label}
            value={config[s.key]}
            range={s.range}
            onChange={(v) => setScene(s.key, v)}
          />
        ))}
      </section>

      <section className="flex flex-col gap-1.5">
        <h3 className="text-[10px] uppercase tracking-widest text-white/40">
          Centre (orb window)
        </h3>
        {CENTER_SLIDERS.map((s) => (
          <Slider
            key={s.key}
            label={s.label}
            value={config[s.key]}
            range={s.range}
            onChange={(v) => setScene(s.key, v)}
          />
        ))}
      </section>

      <section className="flex flex-col gap-1.5">
        <h3 className="text-[10px] uppercase tracking-widest text-white/40">Light</h3>
        <ColorField label="glow" value={config.glowColor} onChange={setGlowColor} />
      </section>

      <section className="flex flex-col gap-1.5">
        <h3 className="text-[10px] uppercase tracking-widest text-white/40">Hands</h3>
        <ColorField
          label="color"
          value={config.hands.color}
          onChange={(v) => setHands("color", v)}
        />
        {HANDS_SLIDERS.map((s) => (
          <Slider
            key={s.key}
            label={s.label}
            value={config.hands[s.key]}
            range={s.range}
            onChange={(v) => setHands(s.key, v)}
          />
        ))}
      </section>

      <section className="flex flex-col gap-1.5">
        <h3 className="text-[10px] uppercase tracking-widest text-white/40">Logo</h3>
        <ColorField
          label="color"
          value={config.logo.color}
          onChange={(v) => setLogo("color", v)}
        />
        <ColorField
          label="glow color"
          value={config.logo.emissive}
          onChange={(v) => setLogo("emissive", v)}
        />
        {LOGO_SLIDERS.map((s) => (
          <Slider
            key={s.key}
            label={s.label}
            value={config.logo[s.key]}
            range={s.range}
            onChange={(v) => setLogo(s.key, v)}
          />
        ))}
      </section>

      <section className="flex flex-col gap-1.5">
        <h3 className="text-[10px] uppercase tracking-widest text-white/40">
          Shader colours
        </h3>
        {NEBULA_COLORS.map((c) => (
          <ColorField
            key={c.key}
            label={c.label}
            value={config.nebula[c.key] as string}
            onChange={(v) => setNebula(c.key, v)}
          />
        ))}
      </section>

      <section className="flex flex-col gap-1.5">
        <h3 className="text-[10px] uppercase tracking-widest text-white/40">
          Shader motion
        </h3>
        {NEBULA_SLIDERS.map((s) => (
          <Slider
            key={s.key}
            label={s.label}
            value={config.nebula[s.key] as number}
            range={s.range}
            onChange={(v) => setNebula(s.key, v)}
          />
        ))}
      </section>

      <section className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] uppercase tracking-widest text-white/40">
            Config JSON
          </h3>
          <button
            type="button"
            onClick={copy}
            className="rounded bg-fuchsia-500/80 px-2 py-0.5 text-white hover:bg-fuchsia-500"
          >
            {copied ? "copied!" : "copy"}
          </button>
        </div>
        <textarea
          readOnly
          value={json}
          onFocus={(e) => e.currentTarget.select()}
          className="h-40 w-full resize-none rounded bg-black/60 p-2 font-mono text-[10px] leading-tight text-white/80 ring-1 ring-white/10"
        />
      </section>
    </aside>
  );
};
