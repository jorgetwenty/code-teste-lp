// 📖 Docs: obsidian/frontend/components/three.md
"use client";

import { useEffect, useState } from "react";

import { DEFAULT_SCENE_CONFIG, type SceneConfig } from "./nebula-sphere.config";
import { NebulaControls } from "./nebula-controls";
import { NebulaSphere } from "./nebula-sphere";

export interface NebulaSceneProps {
  /** Starting config. Defaults to {@link DEFAULT_SCENE_CONFIG}. */
  initialConfig?: SceneConfig;
}

/**
 * Client wrapper that owns the live scene config and renders the WebGL
 * {@link NebulaSphere}. In development (or with `?tune` in the URL) it also
 * mounts the {@link NebulaControls} dev panel for live tuning + JSON export.
 * The panel never ships to production without the explicit `?tune` opt-in.
 */
export const NebulaScene = ({ initialConfig }: NebulaSceneProps) => {
  const [config, setConfig] = useState<SceneConfig>(
    initialConfig ?? DEFAULT_SCENE_CONFIG,
  );
  const [tuning, setTuning] = useState(false);

  useEffect(() => {
    // hidden by default; add `?tune` to the URL to bring the dev panel back
    const params = new URLSearchParams(window.location.search);
    setTuning(params.has("tune"));
  }, []);

  return (
    <>
      <NebulaSphere config={config} />
      {tuning && (
        <NebulaControls
          config={config}
          onChange={setConfig}
          onReset={() => setConfig(initialConfig ?? DEFAULT_SCENE_CONFIG)}
        />
      )}
    </>
  );
};
