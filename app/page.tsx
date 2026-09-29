import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUp,
  Boxes,
  CalendarRange,
  CheckCircle2,
  FileCheck2,
  FileText,
  Fingerprint,
  GitCompareArrows,
  Images,
  Layers,
  Link2,
  Play,
  ScanSearch,
  Search,
  UploadCloud,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { HeroVisual } from "@/components/landing/HeroVisual";
import { ComparisonSlider } from "@/components/comparison/ComparisonSlider";
import { PhaseBadge } from "@/components/media/PhaseBadge";
import { demoMedia } from "@/lib/demo/demoMedia";
import { demoComparisons } from "@/lib/demo/demoComparisons";
import { assetSrc } from "@/lib/media-url";
import type { MediaAsset } from "@/types";

const byId = new Map(demoMedia.map((m) => [m.id, m]));
const get = (id: string) => byId.get(id)!;

// ── Custom real photos for the landing page ─────────────────────────────────
// Save these files to public/demo/ before deploying:
//   custom-before.jpg  — boats on calm lake (before)
//   custom-after.jpg   — sunset lake with bridge (after)
//   custom-during.jpg  — excavator dredging (during)
const BASE: Omit<MediaAsset, "id"|"filename"|"phase"|"description"|"cloudinaryPublicId"|"cloudinaryUrl"> = {
  projectId: "bhopal-lake-restoration", resourceType: "image", format: "jpg",
  width: 1024, height: 683, duration: null, capturedAt: "2026-03-18T07:42:00+05:30",
  location: "Bhopal, Madhya Pradesh", site: "Shoreline Sector A",
  tags: [], objects: [], activities: [], confidence: 94, analyzed: true, source: "demo",
};
const customBefore: MediaAsset = { ...BASE, id: "custom_before", filename: "before.jpg",   phase: "before", description: "Calm lake with boats moored at the shoreline before restoration work began.", cloudinaryPublicId: "custom-before", cloudinaryUrl: "/demo/before.jpg"   };
const customAfter:  MediaAsset = { ...BASE, id: "custom_after",  filename: "after.jpg",    phase: "after",  description: "Restored lake at sunset with clear water and a suspension bridge in the background.", cloudinaryPublicId: "custom-after",  cloudinaryUrl: "/demo/after.jpg"    };
const customDuring: MediaAsset = { ...BASE, id: "custom_during", filename: "during.webp",  phase: "during", format: "webp", description: "Floating excavator dredging sediment from the lake bed during the restoration phase.", cloudinaryPublicId: "custom-during", cloudinaryUrl: "/demo/during.webp"  };

const FEATURES = [
  { icon: ScanSearch,      title: "AI Media Analysis",          body: "Descriptions, detected objects, activities, tags and a confidence score for every photo and video." },
  { icon: GitCompareArrows, title: "Before & After Comparison", body: "Slider and side-by-side views with AI-observed visual changes between matched viewpoints." },
  { icon: CalendarRange,   title: "Automatic Timeline",         body: "Month-by-month project stages with media counts and an AI summary of what each stage shows." },
  { icon: Search,          title: "Natural-Language Search",    body: "Ask for \u201cwaste removal in April\u201d and AI turns it into activities, tags, phases and dates." },
  { icon: FileCheck2,      title: "Impact Reports & PDF",       body: "Structured reports with visual evidence, observed changes and a full source asset table." },
  { icon: Fingerprint,     title: "Traceable Evidence",         body: "Public ID, filename, date, location, phase and confidence travel with every insight." },
];

const STEPS = [
  { icon: UploadCloud, title: "Upload field media",       body: "Teams upload photos and video from the field. Files go straight to Cloudinary with project, phase and site attached." },
  { icon: ScanSearch,  title: "AI reads every frame",     body: "Each asset is described and tagged with the objects, activities, phase, location and date it shows." },
  { icon: Layers,      title: "Evidence organizes itself", body: "Media is grouped into a timeline, matched into before/after pairs, and made searchable in plain language." },
  { icon: FileText,    title: "Reports write themselves", body: "Generate an impact report where every observation links back to the original media asset." },
];


const PARTNERS = [
  "Narmada Impact Collective",
  "Bhopal Restoration Fund",
  "Green Madhya Pradesh",
  "WaterAid India",
  "SolarSeva",
  "EcoMission Trust",
];

export default function LandingPage() {
  const sectorB = demoComparisons.find((c) => c.id === "cmp_blr_sector_b") ?? demoComparisons[0];

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[hsl(156_42%_4%/0.88)] backdrop-blur-xl">
        <div className="container flex h-16 items-center">
          <div className="flex w-44 shrink-0 items-center">
            <Logo />
          </div>
          <nav aria-label="Landing" className="hidden flex-1 items-center justify-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#how-it-works" className="transition-colors hover:text-foreground">How it works</a>
            <a href="#features"     className="transition-colors hover:text-foreground">Features</a>
            <a href="#reports"      className="transition-colors hover:text-foreground">Impact reports</a>
            <a href="#technology"   className="transition-colors hover:text-foreground">Technology</a>
          </nav>
          <div className="flex w-44 shrink-0 items-center justify-end gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild className="rounded-full px-5 font-semibold">
              <Link href="/login">View Demo</Link>
            </Button>
          </div>
        </div>
      </header>

      <main id="main">

        {/* ── HERO ────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-[hsl(var(--background))]">
          <div className="field-grid pointer-events-none absolute inset-0 opacity-20" aria-hidden="true" />

          <div className="container relative grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-24">

            {/* left — text */}
            <div className="flex flex-col gap-6">
              <h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
                Turn Field Media Into<br />Measurable Impact
              </h1>
              <p className="max-w-md text-base leading-7 text-muted-foreground">
                ImpactLens uses AI-powered media intelligence to transform field
                photos and videos into searchable evidence, visual insights and
                professional impact reports.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button className="rounded-full px-7 font-semibold" asChild>
                  <Link href="/login">
                    <Play className="mr-2 h-4 w-4 fill-current" /> Watch Demo
                  </Link>
                </Button>
                <Button variant="outline" className="rounded-full border-white/20 px-7 hover:border-primary/40 hover:bg-primary/10" asChild>
                  <a href="#how-it-works">Explore Platform</a>
                </Button>
              </div>
            </div>

            {/* right — comparison slider */}
            <div className="flex items-center justify-center">
              <HeroVisual before={customBefore} after={customAfter} />
            </div>

          </div>
        </section>

        {/* ── PARTNER STRIP ───────────────────────────────────────────────── */}
        <div className="border-y border-white/[0.07] bg-[hsl(var(--surface))]">
          <div className="container py-3.5">
            <div className="flex flex-wrap items-center justify-center gap-8 text-[11px] font-medium tracking-widest text-muted-foreground/50 uppercase">
              {PARTNERS.map((p) => <span key={p}>{p}</span>)}
            </div>
          </div>
        </div>


        {/* ── HOW IT WORKS — horizontal timeline ──────────────────────────── */}
        <section id="how-it-works" aria-labelledby="how" className="py-24">
          <div className="container">
            <div className="mb-14 text-center">
              <h2 id="how" className="text-2xl font-semibold text-foreground sm:text-3xl">
                Our Best-In-Class Workflow
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
                From camera roll to impact report — four steps, fully automated.
              </p>
            </div>

            {/* timeline track */}
            <div className="relative">
              {/* connecting line */}
              <div className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent lg:block" aria-hidden="true" />

              <ol className="grid gap-12 lg:grid-cols-4 lg:gap-0">
                {STEPS.map((s, i) => (
                  <li key={s.title} className="relative flex flex-col lg:items-center lg:px-6 lg:text-center">
                    {/* numbered dot */}
                    <div className="relative z-10 mb-5 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-[hsl(var(--background))] text-primary lg:mx-auto">
                      <s.icon className="h-5 w-5" />
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-foreground">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ── SERVICES — alternating rows ──────────────────────────────────── */}
        <section id="features" aria-labelledby="features-h" className="border-t border-white/[0.07] py-24">
          <div className="container">
            <div className="mb-14 text-center">
              <h2 id="features-h" className="text-2xl font-semibold text-foreground sm:text-3xl">
                Services We Provide
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
                Everything a programme team needs to prove progress — from raw uploads to funder-ready reports.
              </p>
            </div>

            <ul className="divide-y divide-white/[0.07]">
              {FEATURES.map((f, i) => (
                <li key={f.title} className="group grid items-center gap-6 py-8 transition-colors hover:bg-[hsl(var(--surface)/30%)] lg:grid-cols-[3rem,1fr,2fr,auto] lg:gap-10 lg:px-4">
                  {/* large index */}
                  <span className="hidden font-display text-4xl font-semibold text-muted-foreground/20 tabular-nums lg:block">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {/* icon + title */}
                  <div className="flex items-center gap-3 lg:flex-col lg:items-start lg:gap-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <f.icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">{f.title}</h3>
                  </div>
                  {/* body */}
                  <p className="text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                  {/* arrow */}
                  <ArrowRight className="hidden h-4 w-4 text-muted-foreground/30 transition-colors group-hover:text-primary lg:block" />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── BEFORE / AFTER COMPARISON ───────────────────────────────────── */}
        <section aria-labelledby="ba" className="container py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.4fr,1fr]">
            <ComparisonSlider before={customBefore} after={customAfter} />
            <div>
              <span className="mb-3 inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Visual Evidence
              </span>
              <h2 id="ba" className="text-2xl font-semibold text-foreground sm:text-3xl">
                See What Changed, and How Sure AI Is
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Drag the slider. ImpactLens lists the visual changes it observes between matched
                viewpoints, with a confidence score and links to both source assets.
              </p>
              <ul className="mt-5 space-y-2">
                {sectorB.observations.map((o) => (
                  <li key={o} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    {o}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{sectorB.confidence}%</span>{" "}
                AI confidence · {sectorB.title}
              </p>
            </div>
          </div>
        </section>

        {/* ── AI SEARCH ───────────────────────────────────────────────────── */}
        <section aria-labelledby="search-h" className="border-y border-white/[0.07] bg-[hsl(var(--surface)/40%)] py-20">
          <div className="container grid items-center gap-12 lg:grid-cols-[1fr,1.3fr]">
            <div>
              <span className="mb-3 inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Smart Search
              </span>
              <h2 id="search-h" className="text-2xl font-semibold text-foreground sm:text-3xl">
                Ask Your Media a Question
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                AI Search understands activities, objects, phases, places and dates, then ranks
                matching evidence across the whole project.
              </p>
            </div>
            <div className="rounded-2xl border border-white/[0.07] bg-[hsl(var(--surface))] p-5" aria-hidden="true">
              <div className="flex items-center gap-3 rounded-full border bg-background px-4 py-3">
                <span className="flex-1 text-xs text-muted-foreground">Show me evidence of waste removal</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <ArrowUp className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-full border bg-[hsl(var(--surface-raised))] px-2.5 py-0.5 text-muted-foreground">Activity: Waste Removal</span>
                <span className="rounded-full border bg-[hsl(var(--surface-raised))] px-2.5 py-0.5 text-muted-foreground">Tags: waste, shoreline, cleaning</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2.5">
                {[customDuring, { ...customDuring, id: "custom_during2", filename: "during2.jpg", cloudinaryUrl: "/demo/during2.jpg" } as MediaAsset, customDuring].map((a, idx) => (
                  <div key={idx}>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                      <Image src={a.cloudinaryUrl} alt="" fill sizes="160px" className="object-cover" />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between gap-1">
                      <span className="truncate text-[10px] text-muted-foreground">{a.filename}</span>
                      <PhaseBadge phase={a.phase} className="px-1.5 text-[9px]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── IMPACT REPORTS ──────────────────────────────────────────────── */}
        <section id="reports" aria-labelledby="reports-h" className="container py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.2fr,1fr]">
            {/* report card mock */}
            <div className="rounded-2xl border border-white/[0.07] bg-[hsl(var(--surface))] p-6 shadow-xl shadow-black/30" aria-hidden="true">
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="h-3.5 w-3.5 text-primary" /> Impact report
              </p>
              <p className="mt-4 text-lg font-semibold text-foreground">Bhopal Lake Restoration</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Bhopal, Madhya Pradesh · March 2026 – June 2026</p>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {([customBefore, customAfter] as const).map((a, i) => (
                  <div key={a.id} className="relative aspect-[16/10] overflow-hidden rounded-lg">
                    <Image src={a.cloudinaryUrl} alt="" fill sizes="240px" className="object-cover" />
                    <span className={`absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-semibold ${i ? "text-phase-after" : "text-phase-before"}`}>
                      {i ? "After" : "Before"}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[10px] text-muted-foreground/50">Generated by ImpactLens</p>
            </div>

            <div>
              <span className="mb-3 inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Reporting
              </span>
              <h2 id="reports-h" className="text-2xl font-semibold text-foreground sm:text-3xl">
                Impact Reports Funders Can Verify
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                One click assembles overview, key activities, timeline, visual evidence, before
                and after, AI-observed changes and a source asset table — then exports to PDF.
              </p>
              <ul className="mt-5 space-y-3 text-xs text-muted-foreground">
                <li className="flex gap-2">
                  <Link2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  Every statement links to a Cloudinary public ID
                </li>
                <li className="flex gap-2">
                  <Boxes className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  Observations describe what is visible, never invented measurements
                </li>
                <li className="flex gap-2">
                  <Images className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  Visual evidence chosen from the strongest analyzed media
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ──────────────────────────────────────────────────── */}
        <section className="container pb-24">
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-[hsl(var(--surface))] px-8 py-16 text-center">
            <div className="field-grid absolute inset-0 opacity-20" aria-hidden="true" />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-2xl font-semibold text-foreground sm:text-3xl">
                Show the Impact Your Team Already Captured
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                Open the demo workspace to explore Bhopal Lake Restoration with 128 media assets,
                AI analysis and a ready-to-export impact report.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Button size="sm" className="rounded-full px-7 font-semibold" asChild>
                  <Link href="/login">
                    <Play className="mr-2 h-3.5 w-3.5 fill-current" /> View Demo
                  </Link>
                </Button>
                <Button size="sm" variant="outline" className="rounded-full border-white/15 px-7 hover:border-primary/40 hover:bg-primary/10" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="mt-2 border-t border-white/[0.07] bg-[hsl(var(--surface)/60%)]">
        <div className="container py-12">

          {/* top row */}
          <div className="grid gap-10 sm:grid-cols-[1.5fr,1fr,1fr,1fr]">
            {/* brand */}
            <div>
              <Logo />
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                AI-powered media intelligence that turns field photos and videos
                into searchable evidence and professional impact reports.
              </p>
            </div>

            {/* platform */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-foreground/50">Platform</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#how-it-works" className="transition-colors hover:text-foreground">How it works</a></li>
                <li><a href="#features"     className="transition-colors hover:text-foreground">Features</a></li>
                <li><a href="#reports"      className="transition-colors hover:text-foreground">Impact reports</a></li>
              </ul>
            </div>

            {/* company */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-foreground/50">Company</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="transition-colors hover:text-foreground">About</a></li>
                <li><a href="#" className="transition-colors hover:text-foreground">Blog</a></li>
                <li><a href="#" className="transition-colors hover:text-foreground">Contact</a></li>
              </ul>
            </div>

            {/* legal */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-foreground/50">Legal</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="transition-colors hover:text-foreground">Privacy</a></li>
                <li><a href="#" className="transition-colors hover:text-foreground">Terms</a></li>
              </ul>
            </div>
          </div>

          {/* divider */}
          <div className="mt-10 border-t border-white/[0.06]" />

          {/* bottom row */}
          <div className="mt-6 flex flex-col items-start gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} ImpactLens. All rights reserved.</p>
            <p className="text-muted-foreground/50">Turn Field Media Into Measurable Impact</p>
          </div>

        </div>
      </footer>

    </div>
  );
}
