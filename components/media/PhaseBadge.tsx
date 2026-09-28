import type { Phase } from "@/types";
import { Badge } from "@/components/ui/badge";
import { PHASE_LABEL, cn } from "@/lib/utils";

export function PhaseBadge({ phase, className }: { phase: Phase; className?: string }) {
  return (
    <Badge variant={phase} className={className}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {PHASE_LABEL[phase]}
    </Badge>
  );
}

export function PhaseDot({ phase, className }: { phase: Phase; className?: string }) {
  const color = { before: "bg-phase-before", during: "bg-phase-during", after: "bg-phase-after" }[phase];
  return <span className={cn("inline-block h-2 w-2 rounded-full", color, className)} aria-hidden="true" />;
}
