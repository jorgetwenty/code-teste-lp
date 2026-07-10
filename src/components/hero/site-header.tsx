// 📖 Docs: obsidian/frontend/components/hero.md
import Image from "next/image";
import Link from "next/link";

import { Spring } from "@/components/animation/springs/spring";
import { brand, contactCta, navLinks } from "@/data/mocks/home";
import { HERO_REVEAL_DELAY } from "@/lib/intro-timing";

import { MobileNav } from "./mobile-nav";
import { SOFT_SPRING } from "./reveal";
import { StatusDot } from "./status-dot";

// frosted-glass pill: subtle tint + backdrop blur over the scene behind
const pill =
  "flex items-center rounded-xl border border-border bg-white/5 backdrop-blur-md";

/**
 * The GringX site header — a segmented navbar of three pills (logo, primary
 * nav, Contact Us), 8px inset from the top. Server Component. Ported from the
 * Figma hero (node 551:451). Below `md` the nav pill is replaced by a burger
 * (`MobileNav`, a client leaf) that opens a frosted-glass dropdown.
 */
export const SiteHeader = () => (
  <header className="absolute inset-x-0 top-0 z-40 p-2 text-sm">
    <Spring
      tag="div"
      mode="once"
      className="flex items-stretch gap-2"
      from={{ opacity: 0, transform: "translateY(-0.75rem)" }}
      to={{ opacity: 1, transform: "translateY(0rem)" }}
      config={SOFT_SPRING}
      delayIn={HERO_REVEAL_DELAY}
    >
      <Link
        href={brand.href}
        aria-label={`${brand.name} — home`}
        className={`${pill} justify-center px-6 py-4 md:px-10`}
      >
        <Image
          src="/assets/logo.svg"
          alt={brand.name}
          width={77}
          height={18}
          className="h-[1.125rem] w-auto"
          priority
        />
      </Link>

      {/* desktop nav pill — replaced by the MobileNav burger below md */}
      <nav
        aria-label="Primary"
        className={`${pill} hidden flex-1 justify-center gap-16 px-8 md:flex`}
      >
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} className="text-foreground">
            {link.label}
          </Link>
        ))}
      </nav>

      <Link
        href={contactCta.href}
        className="ml-auto flex items-center gap-2 rounded-xl border border-white/30 bg-black px-6 py-4 md:ml-0 md:px-8"
      >
        {contactCta.label}
        <StatusDot />
      </Link>

      <MobileNav />
    </Spring>
  </header>
);
