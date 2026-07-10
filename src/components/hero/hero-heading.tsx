// 📖 Docs: obsidian/frontend/components/hero.md
"use client";

import TextEngine from "spring-text-engine";

import { hero } from "@/data/mocks/home";
import { HERO_REVEAL_DELAY } from "@/lib/intro-timing";

/**
 * The hero `<h1>` with a **per-letter** entrance (`spring-text-engine`): each
 * letter eases in left-to-right from blurred + transparent to sharp + opaque,
 * with a soft over-damped spring. Client leaf so the TextEngine client boundary
 * stays out of the (Server Component) hero. See [[text-engine]].
 *
 * Note: a `bg-clip-text` gradient can't coexist with per-letter opacity/blur
 * (the colour comes from the container's background, not the letter spans), so
 * the heading uses a solid colour while animating per letter.
 */
export const HeroHeading = () => (
  <TextEngine
    tag="h1"
    mode="once"
    className="mt-24 max-w-[35rem] text-hero font-light leading-none tracking-normal text-white"
    letterOut={{ opacity: 0, filter: "blur(12px)" }}
    letterIn={{ opacity: 1, filter: "blur(0px)" }}
    letterStagger={45}
    letterConfig={{ tension: 85, friction: 26 }}
    delayIn={HERO_REVEAL_DELAY + 120}
  >
    {hero.title}
  </TextEngine>
);
