"use client";
import { useMemo, useState } from "react";
import { ImageOff, Search, SlidersHorizontal } from "lucide-react";
import type { MediaAsset, Phase, ResourceType } from "@/types";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/layout/PageHeader";
import { MediaCard } from "./MediaCard";
import { MediaDetailSheet } from "./MediaDetailSheet";
import { cn, formatMonth, uniq } from "@/lib/utils";

const PHASES: { value: Phase | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "before", label: "Before" },
  { value: "during", label: "During" },
  { value: "after", label: "After" },
];

interface Props {
  assets: MediaAsset[];
  totalCount?: number;
  projectNames?: Record<string, string>;
  onAssetUpdated?: (a: MediaAsset) => void;
}

export function MediaGallery({ assets, totalCount, projectNames, onAssetUpdated }: Props) {
  const [phase, setPhase] = useState<Phase | "all">("all");
  const [type, setType] = useState<ResourceType | "all">("all");
  const [tag, setTag] = useState("all");
  const [location, setLocation] = useState("all");
  const [month, setMonth] = useState("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<MediaAsset | null>(null);

  const options = useMemo(
    () => ({
      tags: uniq(assets.flatMap((a) => a.tags)).sort(),
      locations: uniq(assets.map((a) => a.site ?? a.location)).sort(),
      months: uniq(assets.map((a) => a.capturedAt.slice(0, 7))).sort(),
    }),
    [assets],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: assets.length, before: 0, during: 0, after: 0 };
    for (const a of assets) c[a.phase]++;
    return c;
  }, [assets]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return assets.filter((a) => {
      if (phase !== "all" && a.phase !== phase) return false;
      if (type !== "all" && a.resourceType !== type) return false;
      if (tag !== "all" && !a.tags.includes(tag)) return false;
      if (location !== "all" && (a.site ?? a.location) !== location) return false;
      if (month !== "all" && !a.capturedAt.startsWith(month)) return false;
      if (needle) {
        const hay = [a.filename, a.description, a.cloudinaryPublicId, a.site ?? "", ...a.tags, ...a.objects, ...a.activities].join(" ").toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [assets, phase, type, tag, location, month, q]);

  const filtersActive = phase !== "all" || type !== "all" || tag !== "all" || location !== "all" || month !== "all" || q !== "";
  function clear() {
    setPhase("all");
    setType("all");
    setTag("all");
    setLocation("all");
    setMonth("all");
    setQ("");
  }

  return (
    <div>
      <div className="mb-6 space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div role="radiogroup" aria-label="Project phase" className="inline-flex w-fit rounded-full border bg-surface p-1">
            {PHASES.map((p) => (
              <button
                key={p.value}
                role="radio"
                aria-checked={phase === p.value}
                onClick={() => setPhase(p.value)}
                className={cn("rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground", phase === p.value && "bg-surface-raised text-foreground")}
              >
                {p.label} <span className="ml-0.5 text-xs tabular-nums text-muted-foreground">{counts[p.value]}</span>
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by filename, tag, object or public ID" className="h-10 rounded-full pl-10" aria-label="Filter media" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Select value={type} onChange={(e) => setType(e.target.value as ResourceType | "all")} className="h-9 w-auto rounded-full pr-8 text-[13px]" aria-label="Media type">
            <option value="all">Images and videos</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
          </Select>
          <Select value={tag} onChange={(e) => setTag(e.target.value)} className="h-9 w-auto rounded-full pr-8 text-[13px]" aria-label="AI tag">
            <option value="all">All AI tags</option>
            {options.tags.map((t) => <option key={t} value={t}>#{t}</option>)}
          </Select>
          <Select value={location} onChange={(e) => setLocation(e.target.value)} className="h-9 w-auto rounded-full pr-8 text-[13px]" aria-label="Location">
            <option value="all">All locations</option>
            {options.locations.map((l) => <option key={l} value={l}>{l}</option>)}
          </Select>
          <Select value={month} onChange={(e) => setMonth(e.target.value)} className="h-9 w-auto rounded-full pr-8 text-[13px]" aria-label="Date">
            <option value="all">Any date</option>
            {options.months.map((m) => <option key={m} value={m}>{formatMonth(`${m}-15T00:00:00Z`)}</option>)}
          </Select>
          {filtersActive && <Button variant="ghost" size="sm" onClick={clear}>Clear filters</Button>}
          <p className="ml-auto text-xs text-muted-foreground" aria-live="polite">
            Showing {filtered.length} of {assets.length} featured assets{totalCount && totalCount > assets.length ? ` from ${totalCount} project assets` : ""}
          </p>
        </div>
      </div>

      {filtered.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((a) => (
            <MediaCard key={a.id} asset={a} onOpen={setSelected} projectName={projectNames?.[a.projectId]} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<ImageOff className="h-5 w-5" />}
          title={assets.length ? "No media matches these filters" : "No media yet"}
          description={assets.length ? "Try a different phase, tag or date, or clear the filters." : "Upload field photos and videos to start building AI-analyzed evidence."}
          action={assets.length ? <Button variant="secondary" onClick={clear}>Clear filters</Button> : undefined}
        />
      )}

      <MediaDetailSheet
        asset={selected}
        onOpenChange={(o) => !o && setSelected(null)}
        onUpdated={(a) => onAssetUpdated?.(a)}
      />
    </div>
  );
}
