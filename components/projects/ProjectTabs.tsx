"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function ProjectTabs({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const base = `/projects/${projectId}`;
  const tabs = [
    { href: base, label: "Overview" },
    { href: `${base}/media`, label: "Media" },
    { href: `${base}/timeline`, label: "Timeline" },
    { href: `${base}/comparison`, label: "Before / After" },
    { href: `${base}/search`, label: "AI Search" },
    { href: `${base}/report`, label: "Report" },
    { href: `${base}/settings`, label: "Settings" },
  ];
  return (
    <nav aria-label="Project sections" className="-mx-5 overflow-x-auto px-5 scrollbar-thin">
      <ul className="flex min-w-max gap-1 border-b">
        {tabs.map((t) => {
          const active = t.href === base ? pathname === base : pathname.startsWith(t.href);
          return (
            <li key={t.href}>
              <Link href={t.href} aria-current={active ? "page" : undefined} className={cn("relative block px-3.5 pb-3 pt-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground", active && "text-foreground")}>
                {t.label}
                {active && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
