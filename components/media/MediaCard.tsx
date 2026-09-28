import { CalendarDays, MapPin } from "lucide-react";
import type { MediaAsset } from "@/types";
import { MediaThumb } from "./MediaThumb";
import { PhaseBadge } from "./PhaseBadge";
import { ConfidencePill } from "@/components/ai/ConfidenceMeter";
import { TagList } from "@/components/ai/TagList";
import { formatShortDate } from "@/lib/utils";

export function MediaCard({ asset, onOpen, projectName, footer }: { asset: MediaAsset; onOpen: (a: MediaAsset) => void; projectName?: string; footer?: React.ReactNode }) {
  return (
    <article className="group overflow-hidden rounded-2xl border bg-surface transition-colors hover:border-primary/40">
      <button type="button" onClick={() => onOpen(asset)} className="block w-full text-left focus-visible:ring-inset" aria-label={`Open ${asset.filename}`}>
        <div className="relative">
          <MediaThumb asset={asset} rounded={false} />
          <div className="absolute left-2.5 top-2.5"><PhaseBadge phase={asset.phase} className="bg-black/60 backdrop-blur" /></div>
          <div className="absolute right-2.5 top-2.5"><ConfidencePill value={asset.confidence} /></div>
        </div>
        <div className="space-y-2.5 p-4">
          <div>
            <p className="truncate text-sm font-semibold">{asset.filename}</p>
            {projectName && <p className="truncate text-xs text-muted-foreground">{projectName}</p>}
          </div>
          <p className="line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">{asset.description}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" />{formatShortDate(asset.capturedAt)}</span>
            <span className="inline-flex min-w-0 items-center gap-1"><MapPin className="h-3 w-3 shrink-0" /><span className="truncate">{asset.site ?? asset.location}</span></span>
          </div>
          <TagList tags={asset.tags} max={4} />
          {footer}
        </div>
      </button>
    </article>
  );
}
