// 📖 Docs: obsidian/frontend/components/hero.md
"use client";

import { animated, easings, useSpring } from "@react-spring/web";

export interface StatusDotProps {
  className?: string;
}

/**
 * A small green status dot that gently **blinks**. `@react-spring/web` loop with
 * an ease-in-out-sine curve so the pulse is smooth (no snap at the endpoints) —
 * no CSS keyframes (hard rule #1); respects the global reduced-motion
 * `skipAnimation`. Used in the header's Contact Us pill.
 */
export const StatusDot = ({ className = "" }: StatusDotProps) => {
  const style = useSpring({
    from: { opacity: 0.3 },
    to: { opacity: 1 },
    loop: { reverse: true },
    config: { duration: 1200, easing: easings.easeInOutSine },
  });

  return (
    <animated.span
      aria-hidden
      style={style}
      className={`size-1.5 rounded-full bg-green-400 ${className}`}
    />
  );
};
