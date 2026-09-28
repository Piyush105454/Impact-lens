import { Boxes, CalendarDays, MapPin, Sparkles, Activity } from "lucide-react";
import type { MediaAsset } from "@/types";
import { ConfidenceRing } from "./ConfidenceMeter";
import { TagList } from "./TagList";
import { PhaseBadge } from "@/components/media/PhaseBadge";
import { formatDate, formatDateTime, titleCase } from "@/lib/utils";

/** AI analysis output for a single asset. */
export function AnalysisPanel({ asset }: { asset: MediaAsset }) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <p className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-primary">
            <Sparkles className="h-4 w-4" /> AI Analysis
          </p>
          <p className="text-[15px] leading-relaxed">{asset.description}</p>
          {asset.analyzedAt && <p className="mt-1.5 text-xs text-muted-foreground">Analyzed {formatDateTime(asset.analyzedAt)}</p>}
        </div>
        <ConfidenceRing value={asset.confidence} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h4 className="mb-2 flex items-center gap-1.5 font-sans text-xs font-semibold text-muted-foreground"><Boxes className="h-3.5 w-3.5" /> Detected objects</h4>
          <TagList tags={asset.objects.map(titleCase)} tone="chip" />
        </div>
        <div>
          <h4 className="mb-2 flex items-center gap-1.5 font-sans text-xs font-semibold text-muted-foreground"><Activity className="h-3.5 w-3.5" /> Activities</h4>
          <TagList tags={asset.activities.map(titleCase)} tone="chip" />
        </div>
      </div>
      <div>
        <h4 className="mb-2 font-sans text-xs font-semibold text-muted-foreground">AI tags</h4>
        <TagList tags={asset.tags} />
      </div>
      <dl className="grid grid-cols-3 gap-3 rounded-xl border bg-background/40 p-3 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Project phase</dt>
          <dd className="mt-1"><PhaseBadge phase={asset.phase} /></dd>
        </div>
        <div>
          <dt className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> Location</dt>
          <dd className="mt-1 leading-snug">{asset.location}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1 text-xs text-muted-foreground"><CalendarDays className="h-3 w-3" /> Date</dt>
          <dd className="mt-1">{formatDate(asset.capturedAt)}</dd>
        </div>
      </dl>
    </div>
  );
}
