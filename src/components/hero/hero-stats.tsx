// 📖 Docs: obsidian/frontend/components/hero.md
import { Spring } from "@/components/animation/springs/spring";
import type { Stat } from "@/data/mocks/home";
import { HERO_REVEAL_DELAY } from "@/lib/intro-timing";

import { RISE_FROM, RISE_TO, SOFT_SPRING } from "./reveal";

export interface HeroStatsProps {
  items: Stat[];
}

/**
 * The 2×2 metrics grid in the hero — each stat is a big value over a label,
 * preceded by a white rule (all text white). Each cell eases in on load with a
 * soft staggered spring reveal. Ported from the Figma hero (node 551:451).
 */
export const HeroStats = ({ items }: HeroStatsProps) => (
  <dl className="grid grid-cols-2 gap-x-8 gap-y-8 md:gap-x-12 md:gap-y-12">
    {items.map((stat, i) => (
      <Spring
        key={stat.label}
        tag="div"
        mode="once"
        className="border-l border-foreground pl-4"
        from={RISE_FROM}
        to={RISE_TO}
        config={SOFT_SPRING}
        delayIn={HERO_REVEAL_DELAY + 320 + i * 90}
      >
        <dd className="text-stat leading-none text-foreground">{stat.value}</dd>
        <dt className="mt-3 text-sm text-foreground">{stat.label}</dt>
      </Spring>
    ))}
  </dl>
);
