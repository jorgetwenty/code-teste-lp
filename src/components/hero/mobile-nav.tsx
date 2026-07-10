// 📖 Docs: obsidian/frontend/components/hero.md
"use client";

import Link from "next/link";
import { useState } from "react";

import { Spring } from "@/components/animation/springs/spring";
import { navLinks } from "@/data/mocks/home";

import { SOFT_SPRING } from "./reveal";

/** Snappier than the reveal preset — the menu answers a tap, not a page load. */
const MENU_SPRING = { tension: 260, friction: 26 };

const LINE = "absolute inset-x-0 top-1/2 h-px bg-foreground";

/**
 * Mobile-only (`md:hidden`) navigation: a burger pill in the header that toggles
 * a frosted-glass dropdown with the primary links. Client leaf — the rest of the
 * header stays a Server Component. The two burger bars spring-rotate into an ×;
 * the panel spring-fades/slides and is `inert` while closed (it stays mounted so
 * the exit animation can play). Glass matches the header pills, with a stronger
 * blur so the panel reads over the nebula scene.
 */
export const MobileNav = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-menu"
        aria-label={open ? "Close navigation" : "Open navigation"}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center rounded-xl border border-border bg-white/5 px-5 backdrop-blur-md md:hidden"
      >
        <span aria-hidden className="relative block h-4 w-5">
          <Spring
            tag="span"
            mode="always"
            enabled={open}
            className={LINE}
            from={{ transform: "translateY(-0.1875rem) rotate(0deg)" }}
            to={{ transform: "translateY(0rem) rotate(45deg)" }}
            config={MENU_SPRING}
          />
          <Spring
            tag="span"
            mode="always"
            enabled={open}
            className={LINE}
            from={{ transform: "translateY(0.1875rem) rotate(0deg)" }}
            to={{ transform: "translateY(0rem) rotate(-45deg)" }}
            config={MENU_SPRING}
          />
        </span>
      </button>

      <Spring
        tag="div"
        id="mobile-nav-menu"
        mode="always"
        enabled={open}
        inert={!open}
        className="absolute inset-x-0 top-full mt-2 rounded-xl border border-border bg-white/5 p-3 backdrop-blur-xl md:hidden"
        from={{ opacity: 0, transform: "translateY(-0.5rem)" }}
        to={{ opacity: 1, transform: "translateY(0rem)" }}
        config={open ? MENU_SPRING : SOFT_SPRING}
      >
        <nav aria-label="Primary">
          <ul className="flex flex-col divide-y divide-border">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-4 text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Spring>
    </>
  );
};
