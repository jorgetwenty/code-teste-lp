import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import {
  generateMetadata,
  generateViewport,
} from "@/utils/seo/generate-page-metadata";
import { getSiteStructuredData } from "@/utils/seo/structured-data";

import { LazyCookie } from "@/components/common/Cookie";
import { ReducedMotion } from "@/components/common/reduced-motion";
import { ScrollLayout } from "@/layouts/scroll-layout";

import "@/app/globals.css";

const mulish = localFont({
  variable: "--font-mulish",
  display: "swap",
  src: [
    { path: "./fonts/Mulish-Light.ttf", weight: "300", style: "normal" },
    { path: "./fonts/Mulish-Regular.ttf", weight: "400", style: "normal" },
  ],
});

export const metadata: Metadata = generateMetadata();
export const viewport: Viewport = generateViewport();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/assets/hands.glb" as="fetch" crossOrigin="anonymous" />
        <link rel="preload" href="/assets/eagle-logo.png" as="image" />
        <link rel="preload" href="/draco/draco_decoder.wasm" as="fetch" crossOrigin="anonymous" />
        <link rel="preload" href="/draco/draco_wasm_wrapper.js" as="script" />
      </head>
      {/* suppressHydrationWarning: browser extensions (ColorZilla, Grammarly,
          dark-reader, …) inject attributes like `cz-shortcut-listen` onto <body>
          before React hydrates, which trips a false hydration-mismatch warning.
          This suppresses that one spurious diff on <body> only. */}
      <body className={`${mulish.variable}`} suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getSiteStructuredData()),
          }}
        />
        <ScrollLayout>
          <ReducedMotion />
          <LazyCookie />
          {children}
        </ScrollLayout>
      </body>
    </html>
  );
}
