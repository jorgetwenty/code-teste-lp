// 📖 Docs: obsidian/frontend/components/three.md
//
// The "Nebula" is a domain-warped amethyst/magenta fractal cloud field. It is
// evaluated in **3D**, sampled along the sphere's object-space normal — NOT via
// a 2D projection. An earlier stereographic mapping put a coordinate fixed-point
// (the origin of the 2D warp) on the front of the sphere, producing a visible
// "flower" singularity in the centre and poor cursor response. 3D value noise on
// the direction has no seam, no pole, and no fixed centre, so the field reads
// cleanly everywhere and flows naturally. The cursor stir rotates the sample
// direction around the hovered axis (Rodrigues), with angular falloff. A fresnel
// term adds limb darkening + an atmosphere rim so it reads as a lit orb. ADR-0014.

export const vertexShader = /* glsl */ `
  varying vec3 vObjNormal;   // object space — the nebula is sampled along this
  varying vec3 vViewNormal;  // view space   — for fresnel
  varying vec3 vViewPos;

  void main() {
    vObjNormal = normalize(normal);
    vViewNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewPos = mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

export const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float iTime, iAlpha, iPointer;
  uniform vec3  uMouseDir;   // object-space unit direction of the hovered point
  uniform vec3  uDeep, uNebula, uBright, uHot, uStar;
  uniform float uScale, uFlow, uStarDensity, uTwinkle, uSwirl, uGlow, uBrightness;
  uniform float uCenterDark; // darken + open the view-centre for the embedded logo
  uniform float uCenterSize; // radius of that dark window (0..1)

  varying vec3 vObjNormal;
  varying vec3 vViewNormal;
  varying vec3 vViewPos;

  // --- 3D value noise ---
  float hash13(vec3 p){
    p = fract(p * 0.1031);
    p += dot(p, p.zyx + 31.32);
    return fract((p.x + p.y) * p.z);
  }
  float vnoise(vec3 p){
    vec3 i = floor(p), f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash13(i + vec3(0,0,0)), hash13(i + vec3(1,0,0)), u.x),
          mix(hash13(i + vec3(0,1,0)), hash13(i + vec3(1,1,0)), u.x), u.y),
      mix(mix(hash13(i + vec3(0,0,1)), hash13(i + vec3(1,0,1)), u.x),
          mix(hash13(i + vec3(0,1,1)), hash13(i + vec3(1,1,1)), u.x), u.y),
      u.z);
  }

  // per-octave 3D rotation (breaks lattice alignment — no axis streaks)
  const mat3 M3 = mat3( 0.00,  0.80,  0.60,
                       -0.80,  0.36, -0.48,
                       -0.60, -0.48,  0.64 );

  // 5-octave fbm — main cloud field where detail shows
  float fbm(vec3 p){
    float v = 0., a = 0.5;
    for (int i = 0; i < 5; i++){ v += a * vnoise(p); p = M3 * p * 2.0 + 7.0; a *= 0.5; }
    return v;
  }
  // 3-octave fbm — cheap, for the low-frequency domain warps
  float fbmw(vec3 p){
    float v = 0., a = 0.5;
    for (int i = 0; i < 3; i++){ v += a * vnoise(p); p = M3 * p * 2.0 + 7.0; a *= 0.5; }
    return v;
  }

  // rotate v around unit axis k by angle a (Rodrigues)
  vec3 rotAxis(vec3 v, vec3 k, float a){
    float c = cos(a), s = sin(a);
    return v * c + cross(k, v) * s + k * dot(k, v) * (1.0 - c);
  }

  // one cell-hashed layer of twinkling stars, on the 3D direction lattice
  float starLayer(vec3 x, float thr, float tw){
    vec3 i = floor(x), f = fract(x) - 0.5;
    float h = hash13(i);
    if (h < thr) return 0.0;
    float b = (h - thr) / (1.0 - thr);
    vec3 off = 0.7 * (vec3(hash13(i + 7.3), hash13(i + 13.1), hash13(i + 23.7)) - 0.5);
    float d = length(f - off);
    float tw2 = 0.5 + 0.5 * sin(iTime * tw + h * 42.0);
    return smoothstep(0.09, 0.0, d) * b * tw2;
  }

  void main() {
    vec3 dir = normalize(vObjNormal);
    float t = iTime * uFlow;

    // ---- cursor interaction: swirl the field around the hovered axis ----
    float md = distance(dir, uMouseDir);                 // chordal, 0..2
    float stir = uSwirl * iPointer / (1.0 + md * md * 6.0);
    vec3 sdir = rotAxis(dir, normalize(uMouseDir), stir);

    // ---- domain-warped 3D cloud field ----
    vec3 p = sdir * uScale + vec3(0.0, t, 0.0);          // slow drift over time
    vec3 w1 = vec3(fbmw(p + 11.0), fbmw(p + 27.0), fbmw(p + 41.0));
    vec3 w2 = vec3(
      fbmw(p * 1.5 + 4.0 * w1 + vec3(t, 0.0, 0.0)),
      fbmw(p * 1.5 + 4.0 * w1 + vec3(0.0, 0.0, -t)),
      fbmw(p * 1.5 + 4.0 * w1 + vec3(0.0, t, 0.0))
    );
    float n    = fbm(p + 3.0 * w2);          // main cloud field — keep detail
    float fine = fbmw(p * 3.0 + 6.0 * w2);   // micro-detail

    float dens = pow(smoothstep(0.25, 0.95, n), 1.3);

    // colour ramp: void -> amethyst -> lavender -> magenta cores
    vec3 col = uDeep;
    col = mix(col, uNebula, smoothstep(0.20, 0.60, n));
    col = mix(col, uBright, smoothstep(0.55, 0.95, n) * (0.5 + 0.5 * fine));
    col = mix(col, uHot,    smoothstep(0.75, 1.00, n) * smoothstep(0.40, 1.0, fine) * 0.8);
    col *= 0.3 + 1.15 * dens;

    // ---- stars: three scales, on the swirled direction ----
    float st = starLayer(sdir * 8.0  + 20.0, 0.86, uTwinkle)
             + starLayer(sdir * 16.0 + 50.0, 0.90, uTwinkle * 1.3) * 0.8
             + starLayer(sdir * 32.0 + 80.0, 0.93, uTwinkle * 0.7) * 0.6;
    col += uStar * st * uStarDensity;

    // ---- hero sparkle (a bright twinkling spot fixed on the surface) ----
    vec3 hero = normalize(vec3(0.45, 0.55, 0.7));
    float hd = distance(dir, hero);
    float twH = 0.7 + 0.3 * sin(iTime * 1.5);
    col += uStar * exp(-hd * hd * 500.0) * 1.6 * twH * uStarDensity;

    // ---- cursor glow (soft baseline, blooms while stirring) ----
    float cg = exp(-md * md * 7.0) * uGlow * (0.25 + 0.85 * iPointer);
    col += mix(uBright, uHot, 0.5) * cg;

    // ---- 3D orb shading: fresnel limb darkening + atmosphere rim ----
    vec3 V = normalize(-vViewPos);
    vec3 N = normalize(vViewNormal);
    float ndv = clamp(dot(N, V), 0.0, 1.0);
    float rim = pow(1.0 - ndv, 3.0);
    col *= mix(0.5, 1.0, ndv);                     // darker toward the silhouette
    col += mix(uBright, uHot, 0.5) * rim * 0.6;    // glowing atmospheric limb

    // dark, see-through window at the very centre of the visible disc — the
    // embedded 3D logo sits behind it (ndv ~ 1 at the centre, ~0 at the limb).
    // uCenterSize lowers the inner edge, so a bigger value = a bigger window.
    float inner = mix(0.97, 0.4, clamp(uCenterSize, 0.0, 1.0));
    float centre = smoothstep(inner, min(inner + 0.12, 0.999), ndv);
    float hole = centre * uCenterDark;
    col *= 1.0 - hole;

    col *= uBrightness;
    gl_FragColor = vec4(col, iAlpha * (1.0 - hole));
  }
`;
