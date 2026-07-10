// 📖 Docs: obsidian/frontend/components/hero.md
"use client";

import { animated, easings, useSpring } from "@react-spring/web";
import { useEffect, useState } from "react";

import {
  PRELOADER_DARK_EXIT_MS,
  PRELOADER_LOAD_MS,
  PRELOADER_WHITE_EXIT_MS,
} from "@/lib/intro-timing";

/**
 * Intro splash. State 1: a centred rounded progress bar — a dark backing, a
 * gradient fill that grows 0→100% as it "loads", an animated counter, and a
 * decorative outline equidistant around it, all on a white layer. State 2 (exit):
 * the white layer slides up (carrying + clipping the bar) and, behind it, a
 * black-pink layer slides up at a different speed, revealing the app. Unmounts
 * when gone. All motion is `@react-spring/web` (no CSS keyframes); the hero
 * reveals + hand fly-in are timed off the same [[intro-timing]] constants.
 */
export const Preloader = () => {
  const [exiting, setExiting] = useState(false);
  const [gone, setGone] = useState(false);

  // progress 0 → 100 over the load duration; kick off the exit when it settles
  const { p } = useSpring({
    from: { p: 0 },
    to: { p: 100 },
    config: { duration: PRELOADER_LOAD_MS, easing: easings.easeInOutQuad },
    onRest: () => setExiting(true),
  });

  // the two curtains slide up at different speeds (dark trails the white).
  // `wy` is a numeric percentage so the bar can be counter-translated to stay
  // put while the white layer's edge clips it (see the render below).
  const white = useSpring({
    wy: exiting ? -101 : 0,
    config: { duration: PRELOADER_WHITE_EXIT_MS, easing: easings.easeInOutCubic },
  });
  const dark = useSpring({
    transform: exiting ? "translateY(-101%)" : "translateY(0%)",
    config: { duration: PRELOADER_DARK_EXIT_MS, easing: easings.easeInOutCubic },
  });

  useEffect(() => {
    if (!exiting) return;
    const t = window.setTimeout(() => setGone(true), PRELOADER_DARK_EXIT_MS + 80);
    return () => window.clearTimeout(t);
  }, [exiting]);

  if (gone) return null;

  return (
    <div
      role="status"
      aria-label="Loading"
      className="fixed inset-0 z-[60] overflow-hidden"
    >
      {/* black-pink curtain — behind the white, revealed as the white lifts */}
      <animated.div
        className="absolute inset-0 bg-preloader-curtain"
        style={dark}
      />

      {/* white layer; slides up and its edge clips the bar (overflow-hidden).
          The bar itself is counter-translated so it stays fixed in the viewport
          while the rising white edge crops it from the bottom up. */}
      <animated.div
        className="absolute inset-0 overflow-hidden bg-white"
        style={{ transform: white.wy.to((v) => `translateY(${v}%)`) }}
      >
        <animated.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transform: white.wy.to((v) => `translateY(${-v}%)`) }}
        >
          <div className="relative">
            {/* decorative outline, equidistant around the bar */}
            <div className="pointer-events-none absolute -inset-4 rounded-full border border-preloader-outline" />

            <div className="relative h-[14rem] w-[58rem] max-w-[85vw] overflow-hidden rounded-full bg-preloader-bar">
              <animated.div
                className="absolute inset-y-0 left-0"
                style={{
                  width: p.to((v) => `${v}%`),
                  background:
                    "linear-gradient(90deg, var(--color-preloader-fill-a) 0%, var(--color-preloader-fill-b) 100%)",
                }}
              />
              <animated.span
                aria-hidden
                className="absolute inset-0 flex items-center justify-center text-5xl font-light text-white"
              >
                {p.to((v) => `${Math.round(v)}%`)}
              </animated.span>
            </div>
          </div>
        </animated.div>
      </animated.div>
    </div>
  );
};
