"use client";
import { useEffect, useState } from "react";
import type { MediaAsset } from "@/types";
import { MediaGallery } from "./MediaGallery";

function merge(list: MediaAsset[], incoming: MediaAsset[]) {
  const map = new Map(list.map((a) => [a.id, a]));
  const fresh: MediaAsset[] = [];
  for (const a of incoming) {
    if (map.has(a.id)) map.set(a.id, a);
    else fresh.push(a);
  }
  return [...fresh, ...list.map((a) => map.get(a.id) ?? a)];
}

/** Project gallery. New uploads arrive via server refresh (Upload Media in the project header). */
export function ProjectMediaWorkspace({ initialAssets, totalCount }: { projectId: string; projectName: string; initialAssets: MediaAsset[]; totalCount: number }) {
  const [assets, setAssets] = useState(initialAssets);
  useEffect(() => setAssets((l) => merge(l, initialAssets)), [initialAssets]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Media intelligence</h2>
        <p className="mt-1 text-sm text-muted-foreground">Every photo and video is analyzed for objects, activities, phase and location.</p>
      </div>
      <MediaGallery assets={assets} totalCount={totalCount} onAssetUpdated={(a) => setAssets((l) => merge(l, [a]))} />
    </div>
  );
}
