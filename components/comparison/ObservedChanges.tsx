import { CheckCircle2, Info, Sparkles } from "lucide-react";
import type { Comparison } from "@/types";
import { ConfidenceRing } from "@/components/ai/ConfidenceMeter";

export function ObservedChanges({ comparison }: { comparison: Comparison }) {
  return (
    <section aria-labelledby="observed-heading" className="rounded-2xl border bg-surface p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-primary"><Sparkles className="h-4 w-4" /> AI Observed Changes</p>
          <h3 id="observed-heading" className="mt-1 text-lg font-semibold">{comparison.title}</h3>
        </div>
        <ConfidenceRing value={comparison.confidence} size={60} />
      </div>
      <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
        {comparison.observations.map((o) => (
          <li key={o} className="flex items-start gap-2.5 rounded-xl border bg-background/40 px-3.5 py-3 text-sm">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {o}
          </li>
        ))}
      </ul>
      <p className="mt-5 text-[15px] leading-relaxed">{comparison.summary}</p>
      <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="mt-px h-3.5 w-3.5 shrink-0" />
        AI-observed visual changes between matched viewpoints. These observations describe what is visible in the media and are not environmental measurements.
      </p>
    </section>
  );
}
