"use client";
import { CheckCircle2, Images, ScanSearch, Sparkles } from "lucide-react";
import type { MediaAsset } from "@/types";
import { ComparisonSlider } from "@/components/comparison/ComparisonSlider";

function Float({ className, children }: { className: string; children: React.ReactNode }) {
  return <div className={`glass absolute z-10 flex items-center gap-2.5 rounded-2xl border px-3.5 py-2.5 text-sm shadow-2xl shadow-black/50 ${className}`}>{children}</div>;
}

export function HeroVisual({ before, after }: { before: MediaAsset; after: MediaAsset }) {
  return (
    <div className="relative mx-auto w-full max-w-[640px]">
      <div className="rounded-[28px] border bg-surface/80 p-2.5 shadow-2xl shadow-black/60">
        <div className="flex items-center gap-2 px-2 pb-2.5 pt-1 text-xs text-muted-foreground">
          <span className="h-2.5 w-2.5 rounded-full bg-muted" /><span className="h-2.5 w-2.5 rounded-full bg-muted" /><span className="h-2.5 w-2.5 rounded-full bg-muted" />
          <span className="ml-2 truncate">Bhopal Lake Restoration, Shoreline Sector A</span>
        </div>
        <ComparisonSlider before={before} after={after} intro priority showMeta={false} className="rounded-[20px]" />
      </div>
      <Float className="-left-4 top-16 hidden sm:flex">
        <CheckCircle2 className="h-4 w-4 text-primary" /> AI Analysis Complete
      </Float>
      <Float className="-right-5 top-4 hidden sm:flex">
        <Sparkles className="h-4 w-4 text-primary" /> <span className="font-semibold tabular-nums">91%</span> Confidence
      </Float>
      <Float className="-left-6 bottom-10">
        <ScanSearch className="h-4 w-4 text-phase-during" /> Before / After Detected
      </Float>
      <Float className="-right-3 -bottom-5">
        <Images className="h-4 w-4 text-phase-before" /> <span className="font-semibold">12</span> Evidence Assets
      </Float>
    </div>
  );
}
