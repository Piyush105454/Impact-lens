"use client";
import type { MediaAsset } from "@/types";
import { ComparisonSlider } from "@/components/comparison/ComparisonSlider";

export function HeroVisual({ before, after }: { before: MediaAsset; after: MediaAsset }) {
  return (
    <div className="w-full">
      <div className="rounded-2xl border border-white/[0.08] bg-[hsl(var(--surface)/80%)] p-2.5 shadow-2xl shadow-black/50">
        <div className="flex items-center gap-1.5 px-2 pb-2.5 pt-2">
          <span className="h-2 w-2 rounded-full bg-muted" />
          <span className="h-2 w-2 rounded-full bg-muted" />
          <span className="h-2 w-2 rounded-full bg-muted" />
          <span className="ml-3 truncate text-xs text-muted-foreground">
            Bhopal Lake Restoration · Shoreline Sector A
          </span>
        </div>
        <div className="aspect-[16/10] overflow-hidden rounded-xl">
          <ComparisonSlider
            before={before}
            after={after}
            intro
            priority
            showMeta={false}
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}
