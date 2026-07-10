// 📖 Docs: obsidian/frontend/components/hero.md
import { Spring } from "@/components/animation/springs/spring";
import { Button } from "@/components/ui/button";
import { hero, stats } from "@/data/mocks/home";
import { HERO_REVEAL_DELAY } from "@/lib/intro-timing";

import { HeroHeading } from "./hero-heading";
import { HeroStats } from "./hero-stats";
import { RISE_FROM, RISE_TO, SOFT_SPRING } from "./reveal";

/**
 * GringX hero — a full-viewport overlay on top of the WebGL nebula scene:
 * headline (top-left, per-letter animated) and a bottom band with the
 * description + CTAs on the left and the eyebrow-over-metrics on the right. Each
 * element eases in softly on load (spring reveals, staggered). Ported from the
 * Figma hero (node 551:451).
 */
export const Hero = () => (
  <section
    aria-label={hero.title}
    className="relative z-20 flex min-h-lvh flex-col px-edge pb-edge"
  >
    <HeroHeading />

    {/* bottom band — description + CTAs on the left, eyebrow-over-metrics on
        the right; stacks into a single column below md. The horizontal rule is
        a desktop-only layer behind the 3D canvas (see home.tsx) and passes
        through the gap above the metrics. */}
    <div className="mt-auto flex flex-col gap-12 pt-16 md:flex-row md:items-end md:justify-between md:gap-8">
      <div className="max-w-[24rem]">
        <Spring
          tag="p"
          mode="once"
          className="text-sm leading-relaxed text-foreground"
          from={RISE_FROM}
          to={RISE_TO}
          config={SOFT_SPRING}
          delayIn={HERO_REVEAL_DELAY + 220}
        >
          {hero.description}
        </Spring>
        <Spring
          tag="div"
          mode="once"
          className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 md:mt-12"
          from={RISE_FROM}
          to={RISE_TO}
          config={SOFT_SPRING}
          delayIn={HERO_REVEAL_DELAY + 420}
        >
          <Button href={hero.primaryCta.href} variant="primary">
            {hero.primaryCta.label}
          </Button>
          <Button href={hero.secondaryCta.href} variant="link">
            {hero.secondaryCta.label}
          </Button>
        </Spring>
      </div>

      <div className="flex flex-col">
        <Spring
          tag="p"
          mode="once"
          className="mb-8 text-left text-xs uppercase tracking-[0.15em] text-foreground md:mb-16"
          from={RISE_FROM}
          to={RISE_TO}
          config={SOFT_SPRING}
          delayIn={HERO_REVEAL_DELAY + 300}
        >
          {hero.eyebrow}
        </Spring>
        <HeroStats items={stats} />
      </div>
    </div>
  </section>
);
