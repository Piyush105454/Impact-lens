"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { MediaAnalysis, MediaAsset } from "@/types";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AnalysisPanel } from "@/components/ai/AnalysisPanel";
import { SourceAssetCard } from "@/components/ai/SourceAssetCard";
import { ANALYSIS_STEPS, StepList } from "@/components/ai/StepList";
import { useStepSequence } from "@/hooks/useStepSequence";
import { api } from "@/lib/client-api";
import { assetSrc } from "@/lib/media-url";
import { PhaseBadge } from "./PhaseBadge";

interface Props {
  asset: MediaAsset | null;
  onOpenChange: (open: boolean) => void;
  onUpdated?: (asset: MediaAsset) => void;
}

export function MediaDetailSheet({ asset, onOpenChange, onUpdated }: Props) {
  const [current, setCurrent] = useState<MediaAsset | null>(asset);
  const steps = useStepSequence(ANALYSIS_STEPS.length);
  const { reset } = steps;

  useEffect(() => {
    setCurrent(asset);
    reset();
  }, [asset, reset]);

  async function analyze() {
    if (!current) return;
    try {
      const r = await steps.run(() => api<{ asset: MediaAsset; analysis: MediaAnalysis }>("/api/ai/analyze", { json: { assetId: current.id } }));
      setCurrent(r.asset);
      onUpdated?.(r.asset);
      toast.success("AI analysis complete", { description: `${r.asset.filename}, ${r.analysis.confidence}% confidence` });
    } catch (e) {
      toast.error("AI analysis failed", { description: e instanceof Error ? e.message : "Try again in a moment." });
    }
  }

  return (
    <Sheet open={Boolean(asset)} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto scrollbar-thin">
        {current && (
          <div className="grid min-h-full lg:grid-cols-[1.35fr,1fr]">
            <div className="flex flex-col gap-4 border-b bg-black/30 p-4 sm:p-6 lg:border-b-0 lg:border-r">
              <div className="flex items-center gap-2 pr-10">
                <PhaseBadge phase={current.phase} />
                <SheetTitle className="truncate font-sans text-base font-semibold">{current.filename}</SheetTitle>
              </div>
              <SheetDescription className="sr-only">AI analysis and source asset details for {current.filename}</SheetDescription>
              <div className="relative overflow-hidden rounded-xl border bg-black" style={{ aspectRatio: `${current.width || 16}/${current.height || 10}` }}>
                {current.resourceType === "video" ? (
                  <video src={assetSrc(current)} poster={assetSrc(current, { poster: true })} controls playsInline className="h-full w-full object-contain" aria-label={current.description} />
                ) : (
                  <Image src={assetSrc(current, { width: 1600 })} alt={current.description} fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-contain" priority />
                )}
                {steps.running && (
                  <div className="pointer-events-none absolute inset-0 bg-primary/5">
                    <div className="absolute inset-x-0 h-0.5 animate-scan bg-primary shadow-[0_0_24px_4px_hsl(var(--primary)/0.6)]" />
                  </div>
                )}
              </div>
              <SourceAssetCard asset={current} className="hidden lg:block" />
            </div>
            <div className="space-y-6 p-4 sm:p-6">
              {steps.running ? (
                <div className="rounded-xl border bg-surface p-5">
                  <p className="mb-4 flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4 text-primary" /> Running AI analysis</p>
                  <StepList steps={ANALYSIS_STEPS} active={steps.active} />
                </div>
              ) : (
                <AnalysisPanel asset={current} />
              )}
              <Button variant="secondary" onClick={analyze} disabled={steps.running} className="w-full">
                {current.analyzed ? <RefreshCw /> : <Sparkles />}
                {steps.running ? "Analyzing…" : current.analyzed ? "Re-run AI analysis" : "Analyze with AI"}
              </Button>
              <SourceAssetCard asset={current} className="lg:hidden" />
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
