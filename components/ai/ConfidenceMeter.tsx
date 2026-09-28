import { cn } from "@/lib/utils";

/** Ring showing AI confidence (0-100). */
export function ConfidenceRing({ value, size = 56, className, label = "AI confidence" }: { value: number; size?: number; className?: string; label?: string }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }} role="img" aria-label={`${label} ${value}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="5" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
      </svg>
      <span className="absolute text-sm font-semibold tabular-nums">{value}%</span>
    </div>
  );
}

export function ConfidencePill({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-white backdrop-blur", className)} title="AI confidence">
      <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
      {value}%
    </span>
  );
}
