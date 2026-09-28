"use client";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Columns2, GitCompareArrows, SlidersHorizontal, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { Comparison, MediaAsset } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SourceAssetCard } from "@/components/ai/SourceAssetCard";
import { COMPARE_STEPS, StepList } from "@/components/ai/StepList";
import { EmptyState } from "@/components/layout/PageHeader";
import { useStepSequence } from "@/hooks/useStepSequence";
import { api } from "@/lib/client-api";
import { assetSrc } from "@/lib/media-url";
import { cn, formatDate, PHASE_LABEL } from "@/lib/utils";
import { ComparisonSlider } from "./ComparisonSlider";
import { ObservedChanges } from "./ObservedChanges";

export function ComparisonExperience({ projectId, comparisons: initial, assets }: { projectId: string; comparisons: Comparison[]; assets: MediaAsset[] }) {
  const [comparisons, setComparisons] = useState(initial);
  const [activeId, setActiveId] = useState(initial[0]?.id ?? "");
  const byId = useMemo(() => new Map(assets.map((a) => [a.id, a])), [assets]);
  const beforeOptions = assets.filter((a) => a.phase !== "after");
  const afterOptions = assets.filter((a) => a.phase !== "before");
  const [beforeId, setBeforeId] = useState(beforeOptions[0]?.id ?? "");
  const [afterId, setAfterId] = useState(afterOptions[afterOptions.length - 1]?.id ?? "");
  const steps = useStepSequence(COMPARE_STEPS.length, 450);

  const active = comparisons.find((c) => c.id === activeId);
  const before = active ? byId.get(active.beforeAssetId) : undefined;
  const after = active ? byId.get(active.afterAssetId) : undefined;

  async function runCompare() {
    if (!beforeId || !afterId || beforeId === afterId) {
      toast.error("Choose two different assets to compare");
      return;
    }
    try {
      const c = await steps.run(() => api<Comparison>("/api/ai/compare", { json: { projectId, beforeAssetId: beforeId, afterAssetId: afterId } }));
      setComparisons((l) => [c, ...l.filter((x) => x.id !== c.id)]);
      setActiveId(c.id);
      toast.success("AI comparison complete", { description: `${c.confidence}% confidence` });
    } catch (e) {
      toast.error("AI comparison failed", { description: e instanceof Error ? e.message : "Try again in a moment." });
    } finally {
      steps.reset();
    }
  }

  if (!assets.length) {
    return <EmptyState icon={<GitCompareArrows className="h-5 w-5" />} title="No media to compare yet" description="Upload before and after media from the same viewpoint to see AI-observed visual changes." />;
  }

  return (
    <div className="space-y-6">
      {comparisons.length > 0 && (
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Matched viewpoints">
          {comparisons.map((c) => (
            <button key={c.id} role="tab" aria-selected={c.id === activeId} onClick={() => setActiveId(c.id)} className={cn("rounded-full border px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground", c.id === activeId && "border-primary/50 bg-primary/10 text-foreground")}>
              {c.title}
            </button>
          ))}
        </div>
      )}

      {active && before && after ? (
        <>
          <Tabs defaultValue="slider">
            <div className="mb-4 flex items-center justify-between gap-3">
              <TabsList>
                <TabsTrigger value="slider"><SlidersHorizontal /> Slider</TabsTrigger>
                <TabsTrigger value="side"><Columns2 /> Side by side</TabsTrigger>
              </TabsList>
              <p className="hidden text-sm text-muted-foreground sm:block">{before.site ?? before.location}</p>
            </div>
            <TabsContent value="slider" className="focus-visible:outline-none">
              <ComparisonSlider key={active.id} before={before} after={after} priority />
            </TabsContent>
            <TabsContent value="side" className="focus-visible:outline-none">
              <div className="grid gap-4 md:grid-cols-2">
                {[before, after].map((a, i) => (
                  <figure key={a.id} className="overflow-hidden rounded-2xl border bg-surface">
                    <div className="relative aspect-[16/10] bg-black">
                      <Image src={assetSrc(a, { width: 1200, poster: true })} alt={a.description} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                    </div>
                    <figcaption className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                      <span className={cn("font-display text-lg font-semibold", i === 0 ? "text-phase-before" : "text-phase-after")}>{i === 0 ? "Before" : "After"}</span>
                      <span className="text-muted-foreground">{formatDate(a.capturedAt)}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
            <ObservedChanges comparison={active} />
            <div className="space-y-4">
              <SourceAssetCard asset={before} compact />
              <SourceAssetCard asset={after} compact />
            </div>
          </div>
        </>
      ) : (
        <EmptyState icon={<GitCompareArrows className="h-5 w-5" />} title="No comparisons yet" description="Choose a before asset and an after asset below to run an AI comparison." />
      )}

      <section aria-labelledby="custom-compare" className="rounded-2xl border bg-surface p-5 sm:p-6">
        <h3 id="custom-compare" className="text-lg font-semibold">Compare any two assets</h3>
        <p className="mt-1 text-sm text-muted-foreground">Pick media from the same viewpoint for the most reliable AI-observed changes.</p>
        {steps.running ? (
          <StepList steps={COMPARE_STEPS} active={steps.active} className="mt-5" />
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-[1fr,1fr,auto] md:items-end">
            <div>
              <Label htmlFor="cmp-before" className="mb-1.5 block text-xs text-muted-foreground">Before asset</Label>
              <Select id="cmp-before" value={beforeId} onChange={(e) => setBeforeId(e.target.value)}>
                {beforeOptions.map((a) => <option key={a.id} value={a.id}>{a.filename} ({PHASE_LABEL[a.phase]}, {a.site ?? a.location})</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="cmp-after" className="mb-1.5 block text-xs text-muted-foreground">After asset</Label>
              <Select id="cmp-after" value={afterId} onChange={(e) => setAfterId(e.target.value)}>
                {afterOptions.map((a) => <option key={a.id} value={a.id}>{a.filename} ({PHASE_LABEL[a.phase]}, {a.site ?? a.location})</option>)}
              </Select>
            </div>
            <Button onClick={runCompare} className="h-11"><Sparkles /> Compare with AI</Button>
          </div>
        )}
      </section>
    </div>
  );
}
