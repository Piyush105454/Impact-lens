"use client";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, Calendar, CheckCircle2, Images, Sparkles, TrendingUp } from "lucide-react";
import type { MediaAsset, TimelineEvent } from "@/types";
import { formatMonth, titleCase } from "@/lib/utils";

interface Props {
  events: TimelineEvent[];
  assets: MediaAsset[];
}

const axis = { stroke: "hsl(148 8% 61%)", fontSize: 12, tickLine: false, axisLine: false } as const;
const tooltipStyle = {
  contentStyle: { background: "hsl(153 33% 11%)", border: "1px solid hsl(150 28% 16%)", borderRadius: 12, fontSize: 12, color: "#F5F7F6" },
  labelStyle: { color: "#F5F7F6", fontWeight: 600 },
  cursor: { fill: "hsl(150 28% 16% / 0.4)" },
};

export function TimelineGraph({ events, assets }: Props) {
  if (!events.length) return null;

  const byId = new Map(assets.map((a) => [a.id, a]));

  const chartData = events.map((e) => {
    const stageAssets = e.assetIds.map((id) => byId.get(id)).filter(Boolean);
    const avgConf = stageAssets.length
      ? Math.round(stageAssets.reduce((s, a) => s + (a?.confidence ?? 0), 0) / stageAssets.length)
      : 85;

    return {
      month: formatMonth(e.date),
      stageTitle: e.title,
      phase: e.phase,
      mediaCount: e.mediaCount,
      confidence: avgConf,
    };
  });

  const phaseCounts = events.reduce(
    (acc, e) => {
      acc[e.phase] = (acc[e.phase] || 0) + e.mediaCount;
      return acc;
    },
    { before: 0, during: 0, after: 0 } as Record<string, number>,
  );

  return (
    <div className="mb-8 space-y-6 rounded-3xl border bg-surface p-5 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-5">
        <div>
          <h3 className="flex items-center gap-2 font-display text-xl font-semibold">
            <TrendingUp className="h-5 w-5 text-primary" /> Timeline Analysis Graph
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Visual timeline progression of field assets, AI confidence, and milestone stages over time.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="flex items-center gap-1.5 rounded-full border bg-phase-before/10 px-3 py-1 text-phase-before border-phase-before/20 font-medium">
            Before: {phaseCounts.before} assets
          </span>
          <span className="flex items-center gap-1.5 rounded-full border bg-phase-during/10 px-3 py-1 text-phase-during border-phase-during/20 font-medium">
            During: {phaseCounts.during} assets
          </span>
          <span className="flex items-center gap-1.5 rounded-full border bg-phase-after/10 px-3 py-1 text-phase-after border-phase-after/20 font-medium">
            After: {phaseCounts.after} assets
          </span>
        </div>
      </div>

      {/* Visual Recharts Timeline Graph */}
      <div className="h-64 w-full" role="img" aria-label="Timeline progress chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="g-timeline" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22C55E" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="g-conf" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5DB7DE" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#5DB7DE" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="hsl(150 28% 16%)" vertical={false} />
            <XAxis dataKey="month" {...axis} />
            <YAxis {...axis} />
            <Tooltip {...tooltipStyle} />
            <Area type="monotone" dataKey="mediaCount" name="Media Assets" stroke="#22C55E" strokeWidth={2.5} fill="url(#g-timeline)" />
            <Area type="monotone" dataKey="confidence" name="AI Confidence %" stroke="#5DB7DE" strokeWidth={2} strokeDasharray="3 3" fill="url(#g-conf)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Key Milestone Point Cards */}
      <div className="pt-2">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Key Point Stage Milestones
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <div key={e.id} className="rounded-2xl border bg-background/50 p-4 transition-colors hover:border-primary/40">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 text-primary" /> {formatMonth(e.date)}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium text-foreground">
                  <Images className="h-3 w-3 text-primary" /> {e.mediaCount} assets
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold truncate">{e.title}</p>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                {e.description}
              </p>
              <div className="mt-2.5 flex items-center gap-1.5 text-xs text-primary font-medium">
                <Sparkles className="h-3.5 w-3.5" /> Stage Phase: {titleCase(e.phase)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
