/**
 * Site-wide configuration — the single source of truth for SEO.
 *
 * Consumed by the metadata generator, `robots.ts`, `sitemap.ts`, and the
 * JSON-LD structured-data helper. Update the placeholder values per project.
 */
import { publicEnv } from "@/env";

export const siteConfig = {
  name: "GringX",
  /** Mirrors the hero tagline + description (`src/data/mocks/home.ts`). */
  tagline: "Turn data into decisions",
  description:
    "GringX connects every tool your team already uses and turns scattered data into clear next steps — less guessing, faster calls, and one source of truth that actually holds.",
  /**
   * Public origin, no trailing slash. Drives canonical URLs, OG tags, the
   * sitemap, and JSON-LD. Set `NEXT_PUBLIC_SITE_URL` in production.
   */
  url: publicEnv.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /** Default Open Graph / Twitter share image (path under `public/`). */
  ogImage: "/open-graph.png",
  twitterHandle: "@gringx",
  author: "GringX",
  /** Browser theme-color (address bar / PWA) — matches `--background`. */
  themeColor: "#000000",
} as const;
