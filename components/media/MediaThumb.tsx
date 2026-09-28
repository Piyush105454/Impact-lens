import Image from "next/image";
import { Play } from "lucide-react";
import type { MediaAsset } from "@/types";
import { assetSrc } from "@/lib/media-url";
import { cn } from "@/lib/utils";

interface Props {
  asset: MediaAsset;
  sizes?: string;
  width?: number;
  className?: string;
  priority?: boolean;
  rounded?: boolean;
}

/** Image (or video poster) with a stable aspect ratio. */
export function MediaThumb({ asset, sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw", width = 800, className, priority, rounded = true }: Props) {
  const src = assetSrc(asset, { poster: true, width });
  return (
    <div className={cn("relative aspect-[16/10] overflow-hidden bg-muted", rounded && "rounded-xl", className)}>
      {src ? (
        <Image src={src} alt={asset.description || asset.filename} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : null}
      {asset.resourceType === "video" && (
        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur">
          <Play className="h-3 w-3 fill-current" /> {asset.duration ? `0:${String(Math.round(asset.duration)).padStart(2, "0")}` : "Video"}
        </span>
      )}
    </div>
  );
}
