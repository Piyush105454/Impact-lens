"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { MoveHorizontal } from "lucide-react";
import type { MediaAsset } from "@/types";
import { assetSrc } from "@/lib/media-url";
import { cn, formatShortDate } from "@/lib/utils";

interface Props {
  before: MediaAsset;
  after: MediaAsset;
  className?: string;
  /** Plays one sweep on mount to reveal the comparison. */
  intro?: boolean;
  priority?: boolean;
  showMeta?: boolean;
}

export function ComparisonSlider({ before, after, className, intro, priority, showMeta = true }: Props) {
  const [pos, setPos] = useState(intro ? 88 : 50);
  const [animating, setAnimating] = useState(Boolean(intro));

  useEffect(() => {
    if (!intro) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setPos(50);
      setAnimating(false);
      return;
    }
    const t1 = setTimeout(() => setPos(22), 700);
    const t2 = setTimeout(() => setPos(52), 2300);
    const t3 = setTimeout(() => setAnimating(false), 3500);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [intro]);

  return (
    <div className={cn("relative aspect-[16/10] select-none overflow-hidden rounded-2xl border bg-black has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-primary", className)}>
      <Image src={assetSrc(after, { width: 1600, poster: true })} alt={`After: ${after.description}`} fill sizes="(min-width: 1024px) 70vw, 100vw" priority={priority} className="object-cover" />
      <div className={cn("absolute inset-0", animating && "transition-[clip-path] [transition-duration:1500ms] ease-in-out")} style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <Image src={assetSrc(before, { width: 1600, poster: true })} alt={`Before: ${before.description}`} fill sizes="(min-width: 1024px) 70vw, 100vw" priority={priority} className="object-cover" />
      </div>
      <div className={cn("pointer-events-none absolute inset-y-0 w-0.5 bg-white/90 shadow-[0_0_12px_rgba(0,0,0,0.5)]", animating && "transition-[left] [transition-duration:1500ms] ease-in-out")} style={{ left: `calc(${pos}% - 1px)` }}>
        <span className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-black/50 text-white backdrop-blur">
          <MoveHorizontal className="h-4 w-4" />
        </span>
      </div>
      {showMeta && (
        <>
          <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-phase-before backdrop-blur">Before{`, ${formatShortDate(before.capturedAt)}`}</span>
          <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-phase-after backdrop-blur">After{`, ${formatShortDate(after.capturedAt)}`}</span>
        </>
      )}
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => {
          setAnimating(false);
          setPos(Number(e.target.value));
        }}
        aria-label="Comparison slider: drag to reveal before and after"
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}
