import Link from "next/link";
import type { ReactNode } from "react";

export type ButtonVariant = "primary" | "outline" | "link";

export interface ButtonProps {
  /** Destination — a Button always navigates, so it renders an `<a>`. */
  href: string;
  variant?: ButtonVariant;
  children: ReactNode;
  className?: string;
}

const base =
  "inline-flex items-center justify-center gap-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-muted focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const variants: Record<ButtonVariant, string> = {
  // filled button, dark label — corner radius matches the header pills
  primary: "rounded-xl bg-foreground px-8 py-3 text-background",
  // outlined pill on the dark scene
  outline: "rounded-xl border border-border px-8 py-3 text-foreground",
  // plain underlined text link
  link: "text-foreground underline underline-offset-4",
};

/**
 * Navigational button. Renders a semantic `<a>` (via `next/link`) styled as a
 * button — `primary` (filled), `outline` (bordered pill), or `link` (text).
 * See the GringX hero in [[components/hero]].
 */
export const Button = ({
  href,
  variant = "primary",
  children,
  className = "",
}: ButtonProps) => (
  <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
    {children}
  </Link>
);
