"use client";
import { useState } from "react";
import { Check, Copy, Database, ExternalLink } from "lucide-react";
import type { MediaAsset } from "@/types";
import { PhaseBadge } from "@/components/media/PhaseBadge";
import { cn, formatDate } from "@/lib/utils";

/** Traceability panel: every AI insight links back to its original Cloudinary asset. */
export function SourceAssetCard({ asset, className, compact }: { asset: MediaAsset; className?: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(asset.cloudinaryPublicId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }
  const rows: [string, React.ReactNode][] = [
    ["Filename", asset.filename],
    ["Captured", formatDate(asset.capturedAt)],
    ["Location", asset.site ? `${asset.site}, ${asset.location}` : asset.location],
    ["Project phase", <PhaseBadge key="p" phase={asset.phase} />],
    ["AI confidence", `${asset.confidence}%`],
  ];
  if (!compact) rows.push(["Format", `${asset.format.toUpperCase()} ${asset.width}×${asset.height}${asset.duration ? `, ${Math.round(asset.duration)}s` : ""}`]);

  return (
    <section aria-label="Source asset" className={cn("rounded-xl border bg-background/50 p-4", className)}>
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Database className="h-4 w-4 text-primary" /> Source asset
      </div>
      <div className="mb-3 flex items-center gap-2 rounded-lg border bg-surface px-3 py-2">
        <code className="min-w-0 flex-1 truncate text-xs text-foreground/90" title={asset.cloudinaryPublicId}>{asset.cloudinaryPublicId}</code>
        <button type="button" onClick={copy} className="rounded-md p-1 text-muted-foreground hover:text-foreground" aria-label="Copy Cloudinary public ID">
          {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
        {asset.source === "cloudinary" && (
          <a href={asset.cloudinaryUrl} target="_blank" rel="noreferrer" className="rounded-md p-1 text-muted-foreground hover:text-foreground" aria-label="Open original in Cloudinary">
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
      <dl className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="min-w-0 truncate text-right sm:text-left">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
