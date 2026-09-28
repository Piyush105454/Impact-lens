import Image from "next/image";
import Link from "next/link";
import {
  ArrowUp, Boxes, CalendarRange, CheckCircle2, Cloud, Database, FileCheck2, FileText, Fingerprint, GitCompareArrows, Images, Layers, Link2, ScanSearch, Search, Sparkles, UploadCloud,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { HeroVisual } from "@/components/landing/HeroVisual";
import { ComparisonSlider } from "@/components/comparison/ComparisonSlider";
import { PhaseBadge } from "@/components/media/PhaseBadge";
import { demoMedia } from "@/lib/demo/demoMedia";
import { demoComparisons } from "@/lib/demo/demoComparisons";
import { assetSrc } from "@/lib/media-url";

const byId = new Map(demoMedia.map((m) => [m.id, m]));
const get = (id: string) => byId.get(id)!;

const STEPS = [
  { icon: UploadCloud, title: "Upload field media", body: "Teams upload photos and video from the field. Files go straight to Cloudinary with project, phase and site attached." },
  { icon: ScanSearch, title: "AI reads every frame", body: "Each asset is described and tagged with the objects, activities, phase, location and date it shows." },
  { icon: Layers, title: "Evidence organizes itself", body: "Media is grouped into a timeline, matched into before and after pairs, and made searchable in plain language." },
  { icon: FileText, title: "Reports write themselves", body: "Generate an impact report where every observation links back to the original media asset." },
];

const FEATURES = [
  { icon: Sparkles, title: "AI media analysis", body: "Descriptions, detected objects, activities, tags and a confidence score for every photo and video." },
  { icon: GitCompareArrows, title: "Before and after comparison", body: "Slider and side-by-side views with AI-observed visual changes between matched viewpoints." },
  { icon: CalendarRange, title: "Automatic timeline", body: "Month-by-month project stages with media counts and an AI summary of what each stage shows." },
  { icon: Search, title: "Natural-language search", body: "Ask for \u201cwaste removal in April\u201d and AI turns it into activities, tags, phases and dates." },
  { icon: FileCheck2, title: "Impact reports and PDF", body: "Structured reports with visual evidence, observed changes and a full source asset table." },
  { icon: Fingerprint, title: "Traceable evidence", body: "Public ID, filename, date, location, phase and confidence travel with every insight." },
];

export default function LandingPage() {
  const heroCmp = demoComparisons[0];
  const sectorB = demoComparisons.find((c) => c.id === "cmp_blr_sector_b") ?? demoComparisons[0];
  const searchResults = ["asset_blr_during_01", "asset_blr_during_02", "asset_blr_during_04"].map(get);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="container flex h-20 items-center gap-8">
        <Logo />
        <nav aria-label="Landing" className="hidden flex-1 gap-6 text-sm text-muted-foreground md:flex">
          <a href="#how-it-works" className="hover:text-foreground">How it works</a>
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#reports" className="hover:text-foreground">Impact reports</a>
          <a href="#technology" className="hover:text-foreground">Technology</a>
        </nav>
        <div className="ml-auto flex gap-2">
          <Button variant="ghost" asChild><Link href="/login">Sign in</Link></Button>
          <Button asChild><Link href="/login">View Demo</Link></Button>
        </div>
      </header>

      <main id="main">
        <section className="container grid items-center gap-16 pb-24 pt-10 lg:grid-cols-[1fr,1.05fr] lg:pt-16">
          <div>
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border bg-surface px-3 py-1 text-sm text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Media intelligence for impact and sustainability teams
            </p>
            <h1 className="text-[2.9rem] font-semibold leading-[1.02] sm:text-6xl lg:text-[4.4rem]" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}>
              Turn Field Media Into Measurable Impact
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              ImpactLens uses AI-powered media intelligence to transform field photos and videos into searchable evidence, visual insights and professional impact reports.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button size="lg" asChild><Link href="/login">View Demo</Link></Button>
              <Button size="lg" variant="secondary" asChild><a href="#how-it-works">Explore Platform</a></Button>
            </div>
          </div>
          <HeroVisual before={get(heroCmp.beforeAssetId)} after={get(heroCmp.afterAssetId)} />
        </section>

        <section aria-labelledby="problem" className="border-y bg-surface/50">
          <div className="container grid gap-10 py-20 lg:grid-cols-[1fr,1.3fr]">
            <h2 id="problem" className="text-3xl font-semibold leading-tight sm:text-4xl">Thousands of field photos. Very little usable evidence.</h2>
            <div className="grid gap-8 sm:grid-cols-3">
              {[
                ["Scattered", "Media sits in phones, chat groups and shared drives, disconnected from the project it documents."],
                ["Unsearchable", "Finding the photo that proves a milestone means scrolling through hundreds of unlabeled files."],
                ["Slow to report", "Impact reports are assembled by hand, and funders can\u2019t trace a claim back to its source."],
              ].map(([t, b]) => (
                <div key={t}>
                  <h3 className="font-sans text-base font-semibold">{t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" aria-labelledby="how" className="container py-24">
          <div className="max-w-2xl">
            <h2 id="how" className="text-3xl font-semibold sm:text-4xl">From camera roll to impact report</h2>
            <p className="mt-3 text-muted-foreground">ImpactLens turns every upload into structured, verifiable evidence in four steps.</p>
          </div>
          <ol className="mt-12 grid gap-px overflow-hidden rounded-3xl border bg-border md:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="bg-background p-6">
                <div className="flex items-center justify-between">
                  <s.icon className="h-5 w-5 text-primary" />
                  <span className="font-display text-3xl font-semibold text-muted-foreground/40 tabular-nums">{i + 1}</span>
                </div>
                <h3 className="mt-8 font-sans text-base font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="features" aria-labelledby="features-h" className="container pb-24">
          <h2 id="features-h" className="max-w-2xl text-3xl font-semibold sm:text-4xl">Everything a programme team needs to prove progress</h2>
          <ul className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <li key={f.title} className="border-t pt-6">
                <f.icon className="h-5 w-5 text-primary" />
                <h3 className="mt-4 font-sans text-base font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="ba" className="border-y bg-surface/50">
          <div className="container grid items-center gap-12 py-24 lg:grid-cols-[1.3fr,1fr]">
            <ComparisonSlider before={get(sectorB.beforeAssetId)} after={get(sectorB.afterAssetId)} />
            <div>
              <h2 id="ba" className="text-3xl font-semibold sm:text-4xl">See what changed, and how sure AI is</h2>
              <p className="mt-3 text-muted-foreground">Drag the slider. ImpactLens lists the visual changes it observes between matched viewpoints, with a confidence score and links to both source assets.</p>
              <ul className="mt-6 space-y-2.5">
                {sectorB.observations.map((o) => (
                  <li key={o} className="flex items-start gap-2.5 text-sm"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {o}</li>
                ))}
              </ul>
              <p className="mt-5 text-sm"><span className="font-semibold text-primary">{sectorB.confidence}%</span> <span className="text-muted-foreground">AI confidence, {sectorB.title}</span></p>
            </div>
          </div>
        </section>

        <section aria-labelledby="search-h" className="container grid items-center gap-12 py-24 lg:grid-cols-[1fr,1.3fr]">
          <div>
            <h2 id="search-h" className="text-3xl font-semibold sm:text-4xl">Ask your media a question</h2>
            <p className="mt-3 text-muted-foreground">AI Search understands activities, objects, phases, places and dates, then ranks matching evidence across the whole project.</p>
          </div>
          <div className="rounded-3xl border bg-surface p-5" aria-hidden="true">
            <div className="flex items-center gap-3 rounded-full border bg-background px-5 py-3.5">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="flex-1 text-sm">Show me evidence of waste removal</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground"><ArrowUp className="h-4 w-4" /></span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border bg-surface-raised px-2.5 py-1"><span className="text-muted-foreground">Activity:</span> Waste Removal</span>
              <span className="rounded-full border bg-surface-raised px-2.5 py-1"><span className="text-muted-foreground">Tags:</span> waste, shoreline, cleaning</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {searchResults.map((a) => (
                <div key={a.id}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                    <Image src={assetSrc(a, { width: 480 })} alt="" fill sizes="200px" className="object-cover" />
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-1">
                    <span className="truncate text-xs">{a.filename}</span>
                    <PhaseBadge phase={a.phase} className="px-1.5 text-[10px]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="reports" aria-labelledby="reports-h" className="border-y bg-surface/50">
          <div className="container grid items-center gap-12 py-24 lg:grid-cols-[1.2fr,1fr]">
            <div className="relative rounded-3xl border bg-background p-6 shadow-2xl shadow-black/40 sm:p-8" aria-hidden="true">
              <p className="flex items-center gap-2 text-xs text-muted-foreground"><FileText className="h-3.5 w-3.5 text-primary" /> Impact report</p>
              <p className="mt-6 font-display text-3xl font-semibold">Bhopal Lake Restoration</p>
              <p className="mt-1 text-sm text-muted-foreground">Bhopal, Madhya Pradesh, March 2026 – June 2026</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[get("asset_blr_before_01"), get("asset_blr_after_01")].map((a, i) => (
                  <div key={a.id} className="relative aspect-[16/10] overflow-hidden rounded-lg">
                    <Image src={assetSrc(a, { width: 480 })} alt="" fill sizes="240px" className="object-cover" />
                    <span className={`absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold ${i ? "text-phase-after" : "text-phase-before"}`}>{i ? "After" : "Before"}</span>
                  </div>
                ))}
              </div>
              <p className="mt-5 rounded-xl border border-primary/25 bg-primary/[0.06] p-4 text-sm leading-relaxed">{heroCmp.summary}</p>
              <p className="mt-4 text-[11px] text-muted-foreground">Generated by ImpactLens</p>
            </div>
            <div>
              <h2 id="reports-h" className="text-3xl font-semibold sm:text-4xl">Impact reports funders can verify</h2>
              <p className="mt-3 text-muted-foreground">One click assembles overview, key activities, timeline, visual evidence, before and after, AI-observed changes and a source asset table, then exports to PDF.</p>
              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex gap-2.5"><Link2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Every statement links to a Cloudinary public ID</li>
                <li className="flex gap-2.5"><Boxes className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Observations describe what is visible, never invented measurements</li>
                <li className="flex gap-2.5"><Images className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Visual evidence chosen from the strongest analyzed media</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="technology" aria-labelledby="tech-h" className="container py-24">
          <h2 id="tech-h" className="text-3xl font-semibold sm:text-4xl">Built on dependable infrastructure</h2>
          <ul className="mt-10 grid gap-px overflow-hidden rounded-3xl border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Cloud, t: "Cloudinary", b: "Upload widget, storage and optimized delivery for every image and video." },
              { icon: Sparkles, t: "Pluggable AI", b: "Gemini or OpenAI vision models behind one interface, with local fallback." },
              { icon: Database, t: "Supabase", b: "Postgres and Auth with row-level security per organization." },
              { icon: Layers, t: "Next.js on Vercel", b: "App Router, TypeScript and server-side API routes that keep keys private." },
            ].map((x) => (
              <li key={x.t} className="bg-background p-6">
                <x.icon className="h-5 w-5 text-primary" />
                <h3 className="mt-5 font-sans text-base font-semibold">{x.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{x.b}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="container pb-24">
          <div className="relative overflow-hidden rounded-[32px] border bg-surface px-6 py-16 text-center sm:px-12">
            <div className="absolute inset-0 field-grid opacity-40" aria-hidden="true" />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-3xl font-semibold sm:text-5xl">Show the impact your team already captured</h2>
              <p className="mx-auto mt-4 max-w-lg text-muted-foreground">Open the demo workspace to explore Bhopal Lake Restoration with 128 media assets, AI analysis and a ready-to-export impact report.</p>
              <div className="mt-8 flex justify-center gap-3">
                <Button size="lg" asChild><Link href="/login">View Demo</Link></Button>
                <Button size="lg" variant="secondary" asChild><Link href="/login">Sign in</Link></Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container flex flex-col gap-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <p>Turn Field Media Into Measurable Impact</p>
        </div>
      </footer>
    </div>
  );
}
