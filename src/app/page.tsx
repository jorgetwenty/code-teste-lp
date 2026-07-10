import type { Metadata } from "next";

import { siteConfig } from "@/lib/site";
import { generateMetadata } from "@/utils/seo/generate-page-metadata";
import { HomeView } from "@/views/home";

export const metadata: Metadata = generateMetadata({
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  url: "/",
});

export default function Home() {
  return <HomeView />;
}
