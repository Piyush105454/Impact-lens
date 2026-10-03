"use client";
import { useState } from "react";
import { Images, Sparkles } from "lucide-react";
import type { MediaAsset, TimelineEvent } from "@/types";
import { MediaThumb } from "@/components/media/MediaThumb";
import { MediaDetailSheet } from "@/components/media/MediaDetailSheet";
import { PhaseBadge } from "@/components/media/PhaseBadge";
import { TimelineGraph } from "./TimelineGraph";
import { cn, formatMonth } from "@/lib/utils";

const RAIL = { before: "bg-phase-before", during: "bg-phase-during", after: "bg-phase-after" } as const;

export function ProjectTimeline({ events, assets, compact }: { events: TimelineEvent[]; assets: MediaAsset[]; compact?: boolean }) {
  const [selected, setSelected] = useState<MediaAsset | null>(null);
  const byId = new Map(assets.map((a) => [a.id, a]));

  return (
    <>
      {!compact && <TimelineGraph events={events} assets={assets} />}
      <ol className="relative">
        {events.map((e, i) => {
          const media = e.assetIds.map((id) => byId.get(id)).filter((a): a is MediaAsset => Boolean(a));
          const last = i === events.length - 1;
          return (
            <li key={e.id} className="relative grid grid-cols-[28px,1fr] gap-4 pb-8 sm:grid-cols-[140px,28px,1fr] sm:gap-6">
              <div className="hidden pt-1 text-right sm:block">
                <p className="font-display text-lg font-semibold leading-tight">{formatMonth(e.date).split(" ")[0]}</p>
                <p className="text-sm text-muted-foreground">{formatMonth(e.date).split(" ")[1]}</p>
              </div>
              <div className="relative flex justify-center">
                <span className={cn("relative z-10 mt-1.5 h-3.5 w-3.5 rounded-full ring-4 ring-background", RAIL[e.phase])} aria-hidden="true" />
                {!last && <span className="absolute bottom-[-4px] top-6 w-px bg-border" aria-hidden="true" />}
              </div>
              <article className={cn("rounded-2xl border bg-surface", compact ? "p-4" : "p-5")}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground sm:hidden">{formatMonth(e.date)}</span>
                  <PhaseBadge phase={e.phase} />
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Images className="h-3.5 w-3.5" /> {e.mediaCount} media assets</span>
                </div>
                <h3 className="mt-2.5 text-xl font-semibold">{e.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{e.description}</p>
                <div className="mt-4 flex gap-3 rounded-xl border border-primary/20 bg-primary/[0.06] p-3.5">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs font-semibold text-primary">AI summary</p>
                    <p className="mt-0.5 text-sm leading-relaxed">{e.aiSummary}</p>
                  </div>
                </div>
                {!compact && media.length > 0 && (
                  <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {media.slice(0, 5).map((a) => (
                      <li key={a.id}>
                        <button type="button" onClick={() => setSelected(a)} className="block w-full overflow-hidden rounded-lg" aria-label={`Open ${a.filename}`}>
                          <MediaThumb asset={a} width={320} sizes="160px" rounded={false} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </li>
          );
        })}
      </ol>
      <MediaDetailSheet asset={selected} onOpenChange={(o) => !o && setSelected(null)} />
    </>
  );
}
