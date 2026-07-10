/**
 * Content for the GringX hero (home view). Ported from the Figma hero
 * (node 551:451). Kept out of components per the no-hardcoded-content rule.
 */

export interface NavLink {
  label: string;
  href: string;
}

export interface Stat {
  value: string;
  label: string;
}

export const brand = { name: "GringX", href: "/" };

export const contactCta: NavLink = { label: "Contact Us", href: "#contact" };

export const navLinks: NavLink[] = [
  { label: "Services", href: "#services" },
  { label: "How it works", href: "#how-it-works" },
  { label: "About us", href: "#about" },
  { label: "Testimonials", href: "#testimonials" },
];

export const hero = {
  eyebrow: "AI INTELLIGENCE, DECISION LAYER",
  title: "Turn data into decisions",
  description:
    "GringX connects every tool your team already uses and turns scattered data into clear next steps — less guessing, faster calls, and one source of truth that actually holds.",
  primaryCta: { label: "Get started", href: "#get-started" },
  secondaryCta: { label: "See how it works", href: "#how-it-works" },
} as const;

export const stats: Stat[] = [
  { value: "4.9", label: "Product Rating" },
  { value: "15k", label: "Decisions shipped" },
  { value: "30k", label: "Active teams" },
  { value: "98%", label: "Would recommend" },
];
