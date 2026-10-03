"use client";
import { useState } from "react";
import { CalendarDays, Loader2, MapPin, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { MediaAsset } from "@/types";
import { MediaThumb } from "./MediaThumb";
import { PhaseBadge } from "./PhaseBadge";
import { ConfidencePill } from "@/components/ai/ConfidenceMeter";
import { TagList } from "@/components/ai/TagList";
import { formatShortDate } from "@/lib/utils";
import { api } from "@/lib/client-api";

export function MediaCard({
  asset,
  onOpen,
  onDeleted,
  projectName,
  footer,
}: {
  asset: MediaAsset;
  onOpen: (a: MediaAsset) => void;
  onDeleted?: (id: string) => void;
  projectName?: string;
  footer?: React.ReactNode;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete ${asset.filename}?`)) return;
    setDeleting(true);
    try {
      await api<{ deleted: boolean }>(`/api/media/${asset.id}`, { method: "DELETE" });
      toast.success("Image deleted successfully");
      onDeleted?.(asset.id);
    } catch (err) {
      toast.error("Failed to delete image", { description: err instanceof Error ? err.message : "Try again" });
      setDeleting(false);
    }
  }

  return (
    <article className="group relative overflow-hidden rounded-2xl border bg-surface transition-colors hover:border-primary/40">
      <button type="button" onClick={() => onOpen(asset)} className="block w-full text-left focus-visible:ring-inset" aria-label={`Open ${asset.filename}`}>
        <div className="relative">
          <MediaThumb asset={asset} rounded={false} />
          <div className="absolute left-2.5 top-2.5"><PhaseBadge phase={asset.phase} className="bg-black/60 backdrop-blur" /></div>
          <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5">
            <ConfidencePill value={asset.confidence} />
          </div>
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

      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        title="Delete image"
        aria-label={`Delete ${asset.filename}`}
        className="absolute right-2.5 top-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white/80 opacity-0 transition-opacity hover:bg-destructive hover:text-white group-hover:opacity-100 disabled:opacity-50"
      >
        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>
    </article>
  );
}
