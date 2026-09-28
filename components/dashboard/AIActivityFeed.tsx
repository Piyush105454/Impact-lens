import Link from "next/link";
import { FileText, GitCompareArrows, Search, Sparkles } from "lucide-react";
import type { AIActivityItem } from "@/types";
import { formatDateTime } from "@/lib/utils";

const META = {
  analysis: { icon: Sparkles, path: "media" },
  report: { icon: FileText, path: "report" },
  comparison: { icon: GitCompareArrows, path: "comparison" },
  search: { icon: Search, path: "search" },
} as const;

export function AIActivityFeed({ items }: { items: AIActivityItem[] }) {
  return (
    <ol className="space-y-1">
      {items.map((a) => {
        const m = META[a.kind];
        return (
          <li key={a.id}>
            <Link href={`/projects/${a.projectId}/${m.path}`} className="flex gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-accent">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><m.icon className="h-4 w-4" /></span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{a.title}</span>
                <span className="block truncate text-xs text-muted-foreground">{a.detail}</span>
                <span className="block text-[11px] text-muted-foreground/70">{formatDateTime(a.at)}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
