"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUp, CalendarRange, Film, Layers, MapPin, SearchX, Sparkles, Tags, Activity } from "lucide-react";
import { toast } from "sonner";
import type { MediaAsset, SearchResponse } from "@/types";
import { MediaCard } from "@/components/media/MediaCard";
import { MediaDetailSheet } from "@/components/media/MediaDetailSheet";
import { SEARCH_STEPS, StepList } from "@/components/ai/StepList";
import { EmptyState } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { useStepSequence } from "@/hooks/useStepSequence";
import { api } from "@/lib/client-api";
import { PHASE_LABEL, titleCase } from "@/lib/utils";

export function SearchExperience({ projectId, projectName, examples }: { projectId: string; projectName: string; examples: string[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const initialQ = params.get("q") ?? "";
  const [query, setQuery] = useState(initialQ);
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [selected, setSelected] = useState<MediaAsset | null>(null);
  const steps = useStepSequence(SEARCH_STEPS.length, 300);
  const ran = useRef(false);

  async function search(q: string) {
    const text = q.trim();
    if (text.length < 2) return;
    setQuery(text);
    setResponse(null);
    router.replace(`?q=${encodeURIComponent(text)}`, { scroll: false });
    try {
      const r = await steps.run(() => api<SearchResponse>("/api/ai/search", { json: { projectId, query: text } }));
      setResponse(r);
    } catch (e) {
      toast.error("AI search failed", { description: e instanceof Error ? e.message : "Try again in a moment." });
    }
  }

  useEffect(() => {
    if (initialQ && !ran.current) {
      ran.current = true;
      void search(initialQ);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const i = response?.interpretation;
  const facets: { icon: React.ElementType; label: string; values: string[] }[] = i
    ? [
        { icon: Activity, label: "Activity", values: i.activities.map(titleCase) },
        { icon: Tags, label: "Tags", values: i.tags },
        { icon: Layers, label: "Phase", values: i.phases.map((p) => PHASE_LABEL[p]) },
        { icon: MapPin, label: "Location", values: i.locations },
        { icon: CalendarRange, label: "Date range", values: i.dateRange ? [i.dateRange.label] : [] },
        { icon: Film, label: "Media type", values: i.mediaType ? [i.mediaType === "video" ? "Videos" : "Images"] : [] },
      ].filter((f) => f.values.length)
    : [];

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void search(query);
        }}
        className="relative mx-auto max-w-3xl"
        role="search"
      >
        <Sparkles className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about your project media..."
          aria-label={`Ask about ${projectName} media`}
          className="h-16 w-full rounded-full border border-input bg-surface pl-14 pr-16 text-base shadow-[0_0_0_6px_hsl(var(--primary)/0.05)] placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button type="submit" disabled={steps.running || query.trim().length < 2} aria-label="Search" className="absolute right-2.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-40">
          <ArrowUp className="h-5 w-5" />
        </button>
      </form>
      <div className="mx-auto mt-4 flex max-w-3xl flex-wrap justify-center gap-2">
        {examples.map((ex) => (
          <button key={ex} type="button" onClick={() => void search(ex)} className="rounded-full border bg-surface px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
            {ex}
          </button>
        ))}
      </div>

      <div className="mt-10">
        {steps.running && (
          <div className="grid gap-6 lg:grid-cols-[300px,1fr]">
            <div className="rounded-2xl border bg-surface p-5">
              <StepList steps={SEARCH_STEPS} active={steps.active} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, k) => <Skeleton key={k} className="h-72 rounded-2xl" />)}
            </div>
          </div>
        )}

        {!steps.running && response && i && (
          <div className="grid gap-6 lg:grid-cols-[300px,1fr]">
            <aside aria-label="Search interpretation" className="h-fit rounded-2xl border bg-surface p-5 lg:sticky lg:top-24">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-primary"><Sparkles className="h-4 w-4" /> Search interpretation</p>
              <p className="mt-2 text-sm leading-relaxed">{i.intent}</p>
              <dl className="mt-5 space-y-4">
                {facets.map((f) => (
                  <div key={f.label}>
                    <dt className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><f.icon className="h-3.5 w-3.5" /> {f.label}</dt>
                    <dd className="flex flex-wrap gap-1.5">
                      {f.values.map((v) => <span key={v} className="rounded-full border bg-surface-raised px-2.5 py-0.5 text-xs">{v}</span>)}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 border-t pt-4 text-xs text-muted-foreground">{response.results.length} matching assets, ranked in {response.tookMs} ms</p>
            </aside>
            <div>
              {response.results.length ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {response.results.map((r) => (
                    <MediaCard
                      key={r.asset.id}
                      asset={r.asset}
                      onOpen={setSelected}
                      footer={
                        <div className="flex items-center justify-between border-t pt-2.5 text-xs">
                          <span className="text-muted-foreground">Relevance</span>
                          <span className="font-semibold tabular-nums text-primary">{Math.round(r.score * 100)}%</span>
                        </div>
                      }
                    />
                  ))}
                </div>
              ) : (
                <EmptyState icon={<SearchX className="h-5 w-5" />} title="No matching evidence" description="Try describing an activity, object, phase or month, for example \u201cwaste removal in April\u201d." />
              )}
            </div>
          </div>
        )}
      </div>
      <MediaDetailSheet asset={selected} onOpenChange={(o) => !o && setSelected(null)} />
    </div>
  );
}
