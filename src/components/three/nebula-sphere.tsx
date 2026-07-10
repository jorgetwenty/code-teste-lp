// 📖 Docs: obsidian/frontend/components/three.md
"use client";

import { useEffect, useRef } from "react";
import {
  AmbientLight,
  Box3,
  Color,
  CubeCamera,
  DirectionalLight,
  Group,
  LinearMipmapLinearFilter,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  PointLight,
  Raycaster,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Vector2,
  Vector3,
  WebGLCubeRenderTarget,
  WebGLRenderer,
} from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

import { HANDS_FLY_MS, HANDS_REVEAL_DELAY } from "@/lib/intro-timing";

import {
  hexToVec3,
  resolveSceneConfig,
  type SceneConfigInput,
} from "./nebula-sphere.config";
import { fragmentShader, vertexShader } from "./nebula-sphere.shaders";

// --- hands placement (composition; the material/tunables live in the config) ---
const HANDS_URL = "/assets/hands.glb";
const HANDS_SCALE = 1.72;
const HANDS_POSITION = new Vector3(0, 0, 0);
const HANDS_FLY_DISTANCE = 4; // hands-local units each hand starts off-screen
const LOGO_URL = "/assets/icon.glb";
// --- camera / parallax ---
const CAMERA_Z = 3;
const PARALLAX_LERP = 0.06; // how fast the camera eases toward the pointer
const LEVITATION_SPEED = 0.6; // rad/s — the orb's gentle bob frequency
const SPIN_SPEED = 0.15; // rad/s — the orb's slow spin around its vertical axis
// front of the sphere in object space (default cursor direction, facing camera)
const FRONT_DIR = new Vector3(0, 0, 1);
const MAX_RENDER_DPR = 1.25;
const SPHERE_SEGMENTS = 128;
const REFLECTION_SIZE = 128;
const REFLECTION_FRAME_INTERVAL = 4;

const getRenderPixelRatio = () =>
  Math.min(window.devicePixelRatio || 1, MAX_RENDER_DPR);

export interface NebulaSphereProps {
  /**
   * Override any subset of the scene settings — camera FOV, sphere shader
   * (colours + motion), hands material, bloom, parallax amplitude. Applied
   * **live** (no scene rebuild). Defaults are {@link DEFAULT_SCENE_CONFIG}.
   */
  config?: SceneConfigInput;
  /** Extra classes for the full-screen container. */
  className?: string;
}

/**
 * A full-screen WebGL scene: a 3D sphere cradled in a pair of hands on a black
 * void. The sphere's surface is a domain-warped amethyst/magenta nebula shader
 * (in-shader colour ramp + fresnel rim + bloom); the hands are lit by the orb's
 * glow and **reflect it** via a live cube-camera environment map. The cursor
 * stirs the clouds, drags a glow across the surface, and gently parallaxes the
 * camera. Fades in once on load. The scene is built **once**; `config` is read
 * every frame from a ref, so live edits apply without a rebuild. See ADR-0014.
 */
export const NebulaSphere = ({ config, className }: NebulaSphereProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const configRef = useRef(resolveSceneConfig(config));

  // keep the live config current without tearing down the scene
  useEffect(() => {
    configRef.current = resolveSceneConfig(config);
  }, [config]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const init = configRef.current;

    const renderer = new WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(getRenderPixelRatio());
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // transparent — a DOM layer shows behind
    container.appendChild(renderer.domElement);

    const scene = new Scene();

    const camera = new PerspectiveCamera(
      init.cameraFov,
      window.innerWidth / window.innerHeight,
      0.1,
      80,
    );
    camera.position.set(0, 0, CAMERA_Z);
    camera.lookAt(0, 0, 0);

    // ---- the nebula orb ----
    const geometry = new SphereGeometry(1, SPHERE_SEGMENTS, SPHERE_SEGMENTS);
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      uniforms: {
        iTime: { value: 0 },
        iAlpha: { value: 0 },
        uMouseDir: { value: FRONT_DIR.clone() },
        iPointer: { value: 0 },
        uDeep: { value: hexToVec3(init.nebula.colDeep) },
        uNebula: { value: hexToVec3(init.nebula.colNebula) },
        uBright: { value: hexToVec3(init.nebula.colBright) },
        uHot: { value: hexToVec3(init.nebula.colHot) },
        uStar: { value: hexToVec3(init.nebula.colStar) },
        uScale: { value: init.nebula.nebulaScale },
        uFlow: { value: init.nebula.flowSpeed },
        uStarDensity: { value: init.nebula.starDensity },
        uTwinkle: { value: init.nebula.twinkleSpeed },
        uSwirl: { value: init.nebula.swirlStrength },
        uGlow: { value: init.nebula.glowStrength },
        uBrightness: { value: init.nebula.brightness },
        uCenterDark: { value: init.centerDarken },
        uCenterSize: { value: init.centerSize },
      },
    });
    const sphere = new Mesh(geometry, material);
    sphere.scale.setScalar(init.sphereScale);
    scene.add(sphere);

    // ---- reflection: cube camera at the orb captures it into an env map ----
    const cubeRT = new WebGLCubeRenderTarget(REFLECTION_SIZE, {
      generateMipmaps: true,
      minFilter: LinearMipmapLinearFilter,
    });
    const cubeCamera = new CubeCamera(0.1, 100, cubeRT);
    scene.environment = cubeRT.texture; // image-based lighting from the orb

    // ---- lights (only the hands need them; the orb is emissive) ----
    scene.add(new AmbientLight(0x241a33, 0.6));
    const glow = new PointLight(init.glowColor, 6, 12, 2); // orb spill onto the hands
    glow.position.set(0, 0, 0);
    scene.add(glow);
    // faint cool fill so the hands' shadowed backs still read as form
    const fill = new DirectionalLight(0x6a7bbf, 0.45);
    fill.position.set(0.6, 0.8, 2);
    scene.add(fill);

    // ---- hands (DRACO-compressed glb) ----
    const handsMaterial = new MeshStandardMaterial({
      color: init.hands.color,
      roughness: init.hands.roughness,
      metalness: init.hands.metalness,
      envMap: cubeRT.texture,
      envMapIntensity: init.hands.envMapIntensity,
    });
    const draco = new DRACOLoader();
    draco.setDecoderPath("/draco/");
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(draco);

    let hands: Object3D | null = null;
    // the two hands, with their rest Y and fly-in direction (+1 top, −1 bottom)
    let handParts: { obj: Object3D; restY: number; dir: number }[] = [];
    gltfLoader.load(HANDS_URL, (gltf) => {
      hands = gltf.scene;
      hands.traverse((o) => {
        const mesh = o as Mesh;
        if (mesh.isMesh) mesh.material = handsMaterial;
      });
      hands.scale.setScalar(HANDS_SCALE);
      hands.position.copy(HANDS_POSITION);
      scene.add(hands);

      // split into the two hands for the fly-in — prefer the top-level nodes,
      // else the meshes. The higher one (larger world-Y) flies in from the top.
      const parts =
        hands.children.length >= 2 ? [...hands.children] : [];
      if (parts.length < 2) {
        hands.traverse((o) => {
          if ((o as Mesh).isMesh) parts.push(o);
        });
      }
      const centreY = parts.map(
        (p) => new Box3().setFromObject(p).getCenter(new Vector3()).y,
      );
      const mid = centreY.reduce((a, b) => a + b, 0) / (centreY.length || 1);
      handParts = parts.map((p, i) => ({
        obj: p,
        restY: p.position.y,
        dir: centreY[i] >= mid ? 1 : -1,
      }));
    });

    // ---- the logo — a 3D model (DRACO glb) embedded in the orb centre, metallic ----
    const logoMaterial = new MeshStandardMaterial({
      color: init.logo.color,
      metalness: init.logo.metalness,
      roughness: init.logo.roughness,
      emissive: new Color(init.logo.emissive),
      emissiveIntensity: init.logo.emissiveIntensity,
      envMap: cubeRT.texture,
      envMapIntensity: 1.2,
    });
    let logo: Object3D | null = null;
    let logoFit = 1; // 1/maxDim — normalises the mark to 1 unit before logo.scale
    gltfLoader.load(LOGO_URL, (gltf) => {
      const icon = gltf.scene;
      icon.traverse((o) => {
        const mesh = o as Mesh;
        if (mesh.isMesh) mesh.material = logoMaterial;
      });
      const box = new Box3().setFromObject(icon);
      const size = box.getSize(new Vector3());
      icon.position.sub(box.getCenter(new Vector3())); // centre the mark at origin
      logoFit = 1 / Math.max(size.x, size.y, size.z);

      // wrap so we can scale + position + lookAt() the whole thing each frame
      logo = new Group();
      logo.add(icon);
      scene.add(logo);
    });

    // ---- bloom compositor (the orb's glow) ----
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new Vector2(window.innerWidth, window.innerHeight),
      init.bloomStrength,
      0.5,
      0.2,
    );
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    composer.setPixelRatio(getRenderPixelRatio());
    composer.setSize(window.innerWidth, window.innerHeight);

    // ---- cursor state ----
    const raycaster = new Raycaster();
    const ndc = new Vector2(0, 0);
    const lastNdc = new Vector2(0, 0);
    const mouseDir = FRONT_DIR.clone();
    const mouseTargetDir = FRONT_DIR.clone();
    const parallax = new Vector2(0, 0);
    const parallaxTarget = new Vector2(0, 0);
    let pointer = 0;
    let pointerTarget = 0;

    const onPointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -((e.clientY / window.innerHeight) * 2 - 1);
      // stir energy from screen-space pointer velocity (discoverable anywhere)
      pointerTarget = Math.min(
        1,
        pointerTarget + Math.hypot(nx - lastNdc.x, ny - lastNdc.y) * 4,
      );
      lastNdc.set(nx, ny);
      ndc.set(nx, ny);
      parallaxTarget.set(nx, ny);

      // drag the stir/glow to the hovered surface point (object-space direction)
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObject(sphere, false)[0];
      if (!hit) return;
      mouseTargetDir.copy(sphere.worldToLocal(hit.point.clone()).normalize());
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setPixelRatio(getRenderPixelRatio());
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      composer.setPixelRatio(getRenderPixelRatio());
      composer.setSize(w, h);
      bloom.resolution.set(w, h);
    };
    window.addEventListener("resize", onResize);

    const appearStart = performance.now();
    let raf = 0;
    let frame = 0;

    const renderFrame = (now: number) => {
      // ---- apply live config (read from the ref every frame) ----
      const cfg = configRef.current;
      const neb = cfg.nebula;
      const u = material.uniforms;
      u.uDeep.value.copy(hexToVec3(neb.colDeep));
      u.uNebula.value.copy(hexToVec3(neb.colNebula));
      u.uBright.value.copy(hexToVec3(neb.colBright));
      u.uHot.value.copy(hexToVec3(neb.colHot));
      u.uStar.value.copy(hexToVec3(neb.colStar));
      u.uScale.value = neb.nebulaScale;
      u.uFlow.value = neb.flowSpeed;
      u.uStarDensity.value = neb.starDensity;
      u.uTwinkle.value = neb.twinkleSpeed;
      u.uSwirl.value = neb.swirlStrength;
      u.uGlow.value = neb.glowStrength;
      u.uBrightness.value = neb.brightness;
      u.uCenterDark.value = cfg.centerDarken;
      u.uCenterSize.value = cfg.centerSize;
      handsMaterial.color.set(cfg.hands.color);
      handsMaterial.roughness = cfg.hands.roughness;
      handsMaterial.metalness = cfg.hands.metalness;
      handsMaterial.envMapIntensity = cfg.hands.envMapIntensity;
      logoMaterial.color.set(cfg.logo.color);
      logoMaterial.metalness = cfg.logo.metalness;
      logoMaterial.roughness = cfg.logo.roughness;
      logoMaterial.emissive.set(cfg.logo.emissive);
      logoMaterial.emissiveIntensity = cfg.logo.emissiveIntensity;
      glow.color.set(cfg.glowColor);
      bloom.strength = cfg.bloomStrength;
      sphere.scale.setScalar(cfg.sphereScale);
      if (camera.fov !== cfg.cameraFov) {
        camera.fov = cfg.cameraFov;
        camera.updateProjectionMatrix();
      }

      // cursor: smooth the hover direction, decay + ease the stir energy
      mouseDir.lerp(mouseTargetDir, neb.cursorLerp).normalize();
      pointerTarget *= 0.94;
      pointer += (pointerTarget - pointer) * 0.1;

      u.iTime.value = now / 1000;
      u.uMouseDir.value.copy(mouseDir);
      u.iPointer.value = pointer;
      u.iAlpha.value = Math.min(Math.max((now - appearStart - 400) / 1000, 0), 1);

      // gentle levitation — the orb bobs up/down in the cradle
      sphere.position.y =
        Math.sin((now / 1000) * LEVITATION_SPEED) * cfg.levitationAmplitude;

      // cursor parallax — the camera orbits the orb so the hands swing around
      // it, and the orb counter-rotates to face the camera so it stays visually
      // fixed (same nebula face, no apparent spin).
      parallax.lerp(parallaxTarget, PARALLAX_LERP);
      camera.position.set(
        parallax.x * cfg.parallaxAmplitude,
        parallax.y * cfg.parallaxAmplitude,
        CAMERA_Z,
      );
      camera.lookAt(0, 0, 0);
      // face the camera (cancels cursor-induced apparent rotation), then add a
      // slow spin around the orb's (near-vertical) local axis — rotateY
      // right-multiplies, so the spin lives in camera space and the cursor
      // still doesn't turn the orb.
      sphere.lookAt(camera.position);
      sphere.rotateY(((now / 1000) * SPIN_SPEED) % (Math.PI * 2));

      // the embedded logo: centred in the orb (following the bob), poking toward
      // the camera by `depth`, billboarded to face it, sized to fit.
      if (logo) {
        logo.scale.setScalar(cfg.logo.scale * logoFit);
        logo.position.set(0, sphere.position.y, cfg.logo.depth);
        logo.lookAt(camera.position);
      }

      // hands fly-in: top hand from above, bottom from below, settling into rest
      // with a *critically-damped spring* rather than a time-eased curve. Solved
      // analytically — off(t) = A·(1 + ω·t)·e^(−ω·t) — so it needs no per-frame
      // velocity state and stays frame-rate independent. Unlike an ease-out (max
      // velocity at t=0, which reads as an abrupt, near-linear slide), the spring
      // starts from *zero* velocity: it accelerates in gently and then decays on
      // a long, soft asymptotic tail. ω is tuned so it's ~settled by HANDS_FLY_MS.
      if (handParts.length) {
        const tt = (now - appearStart - HANDS_REVEAL_DELAY) / 1000; // s elapsed
        const omega = 5.8 / (HANDS_FLY_MS / 1000); // ~2% remaining at HANDS_FLY_MS
        const off =
          tt <= 0
            ? HANDS_FLY_DISTANCE
            : (1 + omega * tt) * Math.exp(-omega * tt) * HANDS_FLY_DISTANCE;
        for (const h of handParts) h.obj.position.y = h.restY + h.dir * off;
      }

      // Cube-camera captures render the scene six extra times, so refresh the
      // reflection less often than the screen frame.
      if (frame % REFLECTION_FRAME_INTERVAL === 0) {
        if (hands) hands.visible = false;
        if (logo) logo.visible = false;
        cubeCamera.update(renderer, scene);
        if (hands) hands.visible = true;
        if (logo) logo.visible = true;
      }
      frame += 1;

      composer.render();
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      renderFrame(performance.now());
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      if (hands) {
        hands.traverse((o) => {
          const mesh = o as Mesh;
          if (mesh.isMesh) mesh.geometry.dispose();
        });
      }
      handsMaterial.dispose();
      if (logo) {
        logo.traverse((o) => {
          const mesh = o as Mesh;
          if (mesh.isMesh) mesh.geometry.dispose();
        });
      }
      logoMaterial.dispose();
      draco.dispose();
      cubeRT.dispose();
      composer.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
    // built once; live config comes through configRef
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`fixed inset-0 z-10 ${className ?? ""}`}
    />
  );
};
