import { cn } from "@/lib/utils";

export function TagList({ tags, className, max, tone = "tag" }: { tags: string[]; className?: string; max?: number; tone?: "tag" | "chip" }) {
  const shown = max ? tags.slice(0, max) : tags;
  const rest = max ? tags.length - shown.length : 0;
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {shown.map((t) => (
        <li key={t} className={cn("rounded-full px-2.5 py-0.5 text-xs", tone === "tag" ? "bg-muted text-foreground/80" : "border bg-surface-raised text-foreground")}>
          {tone === "tag" ? `#${t}` : t}
        </li>
      ))}
      {rest > 0 && <li className="rounded-full px-1.5 py-0.5 text-xs text-muted-foreground">+{rest}</li>}
    </ul>
  );
}
