import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Step {
  label: string;
  done?: string;
}

/** Vertical progress list for AI processing. active = index of running step; >= length means complete. */
export function StepList({ steps, active, className }: { steps: Step[]; active: number; className?: string }) {
  return (
    <ol className={cn("space-y-3", className)} aria-live="polite">
      {steps.map((s, i) => {
        const state = i < active ? "done" : i === active ? "running" : "pending";
        return (
          <li key={s.label} className={cn("flex items-center gap-3 text-sm transition-opacity", state === "pending" && "opacity-40")}>
            <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full border", state === "done" && "border-primary/40 bg-primary/15 text-primary", state === "running" && "border-primary/40 text-primary")}>
              {state === "done" ? <Check className="h-3.5 w-3.5" /> : state === "running" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />}
            </span>
            <span className={cn(state === "done" ? "text-foreground" : "text-muted-foreground", state === "running" && "text-foreground")}>
              {state === "done" && s.done ? s.done : s.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export const ANALYSIS_STEPS: Step[] = [
  { label: "Uploading media…", done: "Media uploaded" },
  { label: "Analyzing visual content…", done: "Objects detected" },
  { label: "Understanding activity…", done: "Activity identified" },
  { label: "Generating metadata…", done: "Analysis complete" },
];

export const REPORT_STEPS: Step[] = [
  { label: "Analyzing project evidence…", done: "Project evidence analyzed" },
  { label: "Reviewing timeline…", done: "Timeline reviewed" },
  { label: "Selecting visual evidence…", done: "Visual evidence selected" },
  { label: "Generating impact summary…", done: "Impact summary generated" },
  { label: "Preparing report…", done: "Report ready" },
];

export const SEARCH_STEPS: Step[] = [
  { label: "Interpreting your question…", done: "Query interpreted" },
  { label: "Matching visual content…", done: "Visual content matched" },
  { label: "Ranking evidence…", done: "Evidence ranked" },
];

export const COMPARE_STEPS: Step[] = [
  { label: "Aligning viewpoints…", done: "Viewpoints aligned" },
  { label: "Comparing visual content…", done: "Visual differences found" },
  { label: "Summarizing observed changes…", done: "Comparison complete" },
];
