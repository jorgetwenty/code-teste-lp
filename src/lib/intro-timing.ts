/**
 * Timing for the intro sequence: preloader, hero DOM reveals, then the WebGL
 * hand fly-in. Keep these together so local and deployed builds feel equally
 * responsive.
 */

// --- preloader ---
export const PRELOADER_LOAD_MS = 650; // progress bar 0 to 100
export const PRELOADER_WHITE_EXIT_MS = 360; // white curtain lifts
export const PRELOADER_DARK_EXIT_MS = 520; // black-pink curtain lifts (trails)

// --- hero DOM entrances: start as the curtains lift ---
export const HERO_REVEAL_DELAY = PRELOADER_LOAD_MS + 180; // ~830

// --- WebGL hands: start soon after the app is visible ---
export const HANDS_REVEAL_DELAY = PRELOADER_LOAD_MS + 220; // ~870
export const HANDS_FLY_MS = 1200;
