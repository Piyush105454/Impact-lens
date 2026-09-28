import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("h-8 w-8", className)}>
      <rect width="32" height="32" rx="9" fill="hsl(var(--surface-raised))" />
      <circle cx="16" cy="16" r="9" fill="none" stroke="#22C55E" strokeWidth="2.4" />
      <path d="M16 7a9 9 0 0 0 0 18z" fill="#22C55E" />
      <circle cx="16" cy="16" r="2.6" fill="hsl(var(--background))" />
    </svg>
  );
}

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5 rounded-lg", className)} aria-label="ImpactLens home">
      <LogoMark />
      <span className="font-display text-[19px] font-semibold tracking-tight">ImpactLens</span>
    </Link>
  );
}
