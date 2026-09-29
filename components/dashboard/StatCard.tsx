import { cn } from "@/lib/utils";

export function StatCard({ value, label, icon, hint, className }: { value: string; label: string; icon: React.ReactNode; hint?: string; className?: string }) {
  return (
    <div className={cn("rounded-2xl border bg-surface p-5", className)}>
      <div className="flex items-start justify-between">
        <p className="font-sans text-[2.4rem] font-bold leading-none tabular-nums tracking-tight">{value}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary [&_svg]:h-[18px] [&_svg]:w-[18px]">{icon}</span>
      </div>
      <p className="mt-3 text-sm font-medium">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
