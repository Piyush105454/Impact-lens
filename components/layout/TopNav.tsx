"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Bell, FileText, Images, LayoutDashboard, LogOut, Menu, Search, Settings, Sparkles, FolderKanban, X, GitCompareArrows } from "lucide-react";
import type { AIActivityItem } from "@/types";
import { cn, formatDateTime } from "@/lib/utils";
import { Logo } from "./Logo";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/media", label: "Media", icon: Images },
  { href: "/search", label: "AI Search", icon: Search },
  { href: "/reports", label: "Reports", icon: FileText },
];

const KIND_ICON = { analysis: Sparkles, report: FileText, comparison: GitCompareArrows, search: Search } as const;

function isActive(pathname: string, href: string) {
  if (href === "/search") return pathname === "/search" || /^\/projects\/[^/]+\/search/.test(pathname);
  if (href === "/reports") return pathname === "/reports" || /^\/projects\/[^/]+\/report/.test(pathname);
  if (href === "/media") return pathname === "/media";
  if (href === "/projects") return pathname.startsWith("/projects") && !/\/(search|report)$/.test(pathname);
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function TopNav({ activity, user }: { activity: AIActivityItem[]; user: { name: string; email: string; role: string; org: string } }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const initials = user.name.split(" ").map((p) => p[0]).slice(0, 2).join("");

  async function signOut() {
    await fetch("/api/auth/demo", { method: "DELETE" }).catch(() => undefined);
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md">
      <div className="container flex h-16 items-center">

        {/* Logo — fixed left column */}
        <div className="flex w-44 shrink-0 items-center">
          <Logo href="/dashboard" />
        </div>

        {/* Nav links — centred */}
        <nav aria-label="Main" className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {NAV.map((n) => {
            const active = isActive(pathname, n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                  active && "bg-surface-raised text-foreground",
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        {/* Right actions — fixed right column */}
        <div className="flex w-44 shrink-0 items-center justify-end gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Notifications">
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Recent AI activity</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {activity.slice(0, 5).map((a) => {
                const Icon = KIND_ICON[a.kind];
                return (
                  <DropdownMenuItem key={a.id} asChild>
                    <Link href={a.kind === "report" ? `/projects/${a.projectId}/report` : a.kind === "comparison" ? `/projects/${a.projectId}/comparison` : a.kind === "search" ? `/projects/${a.projectId}/search` : `/projects/${a.projectId}/media`} className="flex items-start gap-3">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{a.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">{a.detail}</span>
                        <span className="block text-[11px] text-muted-foreground/70">{formatDateTime(a.at)}</span>
                      </span>
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-1 hover:bg-accent sm:pr-3" aria-label="Account menu">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">{initials}</span>
              <span className="hidden text-left leading-tight sm:block">
                <span className="block text-sm font-medium">{user.name}</span>
                <span className="block text-[11px] text-muted-foreground">{user.org}</span>
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel>
                <span className="block text-sm font-medium">{user.name}</span>
                <span className="block text-xs text-muted-foreground">{user.email}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings"><Settings className="h-4 w-4" /> Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={signOut}>
                <LogOut className="h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent lg:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav aria-label="Mobile" className="border-t bg-background lg:hidden">
          <div className="container grid gap-1 py-3">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium", isActive(pathname, n.href) ? "bg-surface-raised" : "text-muted-foreground")}>
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
