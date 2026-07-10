/**
 * Shared entrance-reveal presets for the hero, passed to the spring
 * `<Spring>` components (soft, no-overshoot fade-up). See [[animation-system]].
 */

/** Soft, over-damped spring — smooth, no bounce. */
export const SOFT_SPRING = { tension: 80, friction: 24 };

/** Hidden resting state: faded + nudged down. */
export const RISE_FROM = { opacity: 0, transform: "translateY(1.25rem)" };

/** Visible destination. */
export const RISE_TO = { opacity: 1, transform: "translateY(0rem)" };
