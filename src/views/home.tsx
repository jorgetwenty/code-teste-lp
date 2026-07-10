import { Hero } from "@/components/hero/hero";
import { SiteHeader } from "@/components/hero/site-header";
import { Preloader } from "@/components/preloader/preloader";
import { NebulaScene } from "@/components/three/nebula-scene";

/**
 * Home view — a Server Component. The WebGL nebula scene is a fixed background
 * client leaf (hard rule #6); the GringX header + hero overlay it.
 */
export const HomeView = () => {
  return (
    <main className="relative min-h-lvh">
      {/* the hero's horizontal rule — a layer behind the transparent 3D canvas,
          so the orb + hands render in front of it. Desktop-only: it aligns with
          the side-by-side bottom band, which stacks below md. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-edge bottom-[15.75rem] z-0 hidden h-px bg-border md:block"
      />
      <NebulaScene />
      <SiteHeader />
      <Hero />
      <Preloader />
    </main>
  );
};
