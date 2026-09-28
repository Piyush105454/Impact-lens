# ImpactLens

**Turn Field Media Into Measurable Impact.**

ImpactLens is an AI-powered impact and sustainability media intelligence platform. Field teams upload photos and videos; AI describes and tags every asset, builds a project timeline, compares before and after viewpoints, answers natural-language questions, and generates impact reports in which every statement is traceable to its original Cloudinary asset.

The repository runs end to end with **no API keys and no database**: a built-in demo workspace (Bhopal Lake Restoration and 11 other projects) and a local Demo AI provider power every feature out of the box.

## Contents

- [Features](#features)
- [Architecture](#architecture)
- [Quick start](#quick-start)
- [Demo mode](#demo-mode)
- [Environment variables](#environment-variables)
- [Cloudinary setup](#cloudinary-setup)
- [Supabase setup](#supabase-setup)
- [Gemini setup](#gemini-setup)
- [OpenAI setup](#openai-setup)
- [Deploying to Vercel](#deploying-to-vercel)
- [Demo flow](#demo-flow)
- [Project structure](#project-structure)
- [API reference](#api-reference)

## Features

- **AI media analysis**: description, detected objects, activities, tags, confidence, phase, location and date for every photo and video.
- **Media intelligence gallery**: filter by phase, media type, AI tag, location, date and free text; detail drawer with re-runnable analysis.
- **Before / after comparison**: slider and side-by-side views with AI-observed visual changes and confidence, plus ad-hoc comparison of any two assets.
- **Automatic timeline**: month-by-month stages with media counts and AI summaries.
- **AI Search**: plain-language queries interpreted into activities, tags, phases, locations, media type and date ranges, then ranked against AI metadata.
- **Impact reports**: overview, details, key activities, timeline, visual evidence, before and after, observed changes, AI summary, source assets and evidence metadata, with PDF export (jsPDF).
- **Source asset traceability**: Cloudinary public ID, filename, date, location, phase and confidence appear alongside every insight.
- **Guardrails**: AI reports visible changes only. It never fabricates measurements such as tonnes removed or pollution levels.

## Architecture

```
Browser (Next.js App Router, React, Tailwind, shadcn-style UI)
   │  fetch /api/*            CldUploadWidget ──► Cloudinary (direct upload)
   ▼
Next.js API routes  (app/api/**)            middleware.ts: session / auth guard
   │
   ├── services/           domain logic (projects, media, search, comparisons, reports, pdf, cloudinary)
   │     ├── ai/           provider layer
   │     │     index.ts    resolveProvider() + automatic fallback
   │     │     types.ts    AIProvider interface
   │     │     demoAI.ts   local provider (no network)
   │     │     gemini.ts   Gemini REST (vision, JSON mode)
   │     │     openai.ts   OpenAI Chat Completions (vision, JSON mode)
   │     └── repository/   storage layer
   │           demo.ts     in-memory demo workspace
   │           supabase.ts Postgres via Supabase (RLS)
   ▼
Normalized types (types/index.ts) returned to the frontend
```

Every AI provider implements the same interface:

```ts
interface AIProvider {
  analyzeImage(input): Promise<MediaAnalysis>;
  compareImages(input): Promise<Comparison>;
  generateProjectSummary(input): Promise<ProjectSummary>;
  generateReport(input): Promise<Report>;
  interpretSearchQuery(input): Promise<SearchInterpretation>;
}
```

The frontend never calls a model vendor. Provider selection:

| `AI_PROVIDER` | Key present | Active provider |
| --- | --- | --- |
| `demo` (default) | n/a | Demo AI |
| `gemini` | `GEMINI_API_KEY` | Gemini |
| `gemini` | missing | Demo AI |
| `openai` | `OPENAI_API_KEY` | OpenAI |
| `openai` | missing | Demo AI |

If a configured provider fails at runtime (network, quota, malformed output), the request transparently falls back to local analysis and a warning is logged server-side: `AI service unavailable. Falling back to local analysis.`

## Quick start

Requirements: Node.js 18.18+ (20 LTS recommended).

```bash
git clone git@github.com:Piyush105454/Impact-lens.git
cd Impact-lens
npm install
cp .env.example .env.local   # works as-is: demo mode, Demo AI
npm run dev
```

Open http://localhost:3000, choose **View Demo**, then **Try Demo** (or sign in with the demo credentials).

| Demo credentials | |
| --- | --- |
| Email | `demo@impactlens.ai` |
| Password | `demo123` |

Other scripts:

```bash
npm run build               # production build
npm start                   # serve the production build
npm run typecheck           # tsc --noEmit
npm run generate:demo-media # regenerate the demo images/video in public/demo (needs ffmpeg for the video)
npm run seed:cloudinary     # upload demo media to your Cloudinary account
```

## Demo mode

`NEXT_PUBLIC_DEMO_MODE=true` (the default) runs the whole product on the demo workspace:

- Data comes from `lib/demo/` (`demoProjects`, `demoMedia`, `demoAnalysis`, `demoTimeline`, `demoComparisons`, `demoReports`, `demoSearch`, `demoActivity`) through `services/repository/demo.ts`, an in-memory store. Changes (new projects, uploads, reports) last for the life of the server process.
- Demo media is served from `public/demo`, so nothing depends on network access. After `npm run seed:cloudinary`, set `NEXT_PUBLIC_DEMO_ASSETS_FROM_CLOUDINARY=true` to deliver the same assets from Cloudinary with `f_auto,q_auto`.
- Sign-in uses a demo session cookie (`il_session`). The **Try Demo** button signs in with one click.
- Demo AI runs locally and deterministically. It is a real provider implementation, not HTTP stubs: pre-analyzed demo assets return their stored analysis, new uploads are analyzed with local heuristics, search queries are interpreted with a local vocabulary, and reports are assembled from project evidence.

Set `NEXT_PUBLIC_DEMO_MODE=false` together with Supabase credentials to use the database and Supabase Auth instead.

## Environment variables

See `.env.example`.

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_DEMO_MODE` | public | `true` runs on the demo workspace |
| `AI_PROVIDER` | server | `demo`, `gemini` or `openai` |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | server | Gemini provider (default model `gemini-2.0-flash`) |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | server | OpenAI provider (default model `gpt-4o-mini`) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | public | Cloudinary cloud name |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | public | Unsigned upload preset for the upload widget |
| `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | server | Asset verification, signing, seeding |
| `NEXT_PUBLIC_DEMO_ASSETS_FROM_CLOUDINARY` | public | Serve demo media from Cloudinary after seeding |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Supabase client |
| `SUPABASE_SERVICE_ROLE_KEY` | server | Admin tasks only. Never exposed to the browser |

Secrets are read only in `lib/env.server.ts`, which is marked `server-only`. `/api/system/status` reports configuration status without ever returning key values.

## Cloudinary setup

1. Create a free account at cloudinary.com and copy the **cloud name**, **API key** and **API secret** from the dashboard.
2. Settings → Upload → Upload presets → **Add upload preset**. Set **Signing mode: Unsigned** and optionally a default folder of `impactlens`.
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=impactlens_unsigned
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   ```
4. Restart the dev server. **Upload Media** now opens the Cloudinary Upload Widget (`next-cloudinary`'s `CldUploadWidget`) with multiple files, images and video (`resourceType: "auto"`), stored under `impactlens/<projectId>/<phase>`.
5. After each upload the app captures `public_id`, `secure_url`, `resource_type`, `format`, `width`, `height`, `duration` and `original_filename`, posts them to `POST /api/media/upload`, verifies the asset with the Cloudinary Admin API (when the server key is set), stores the media record and runs AI analysis.
6. Optional: `npm run seed:cloudinary`, then `NEXT_PUBLIC_DEMO_ASSETS_FROM_CLOUDINARY=true`.

## Supabase setup

1. Create a project at supabase.com.
2. Run `supabase/migrations/0001_init.sql` in the SQL editor (or `supabase db push` with the CLI). It creates `organizations`, `users`, `organization_members`, `projects`, `media_assets`, `media_analysis`, `project_timeline`, `comparisons`, `reports`, `report_assets` and `search_queries`, with row-level security so members can only access their organization's data.
3. Create a user under Authentication, then add an organization and membership:
   ```sql
   insert into organizations (name) values ('Your Organization') returning id;
   insert into organization_members (organization_id, user_id, role)
     values ('<org id>', '<auth user id>', 'owner');
   ```
4. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_DEMO_MODE=false`. Sign-in then uses Supabase Auth, and all queries run as the signed-in user under RLS.

## Gemini setup

1. Create an API key in Google AI Studio.
2. Set `AI_PROVIDER=gemini` and `GEMINI_API_KEY=...` (optionally `GEMINI_MODEL`).
3. Images (or video poster frames) are sent as inline data with JSON-mode prompts. Output is validated and normalized before it reaches the app.

## OpenAI setup

1. Create an API key at platform.openai.com.
2. Set `AI_PROVIDER=openai` and `OPENAI_API_KEY=...` (optionally `OPENAI_MODEL`).
3. Requests use Chat Completions with image inputs and `response_format: json_object`.

The active provider is shown under **Settings → AI provider**.

## Deploying to Vercel

1. Push the repository to GitHub and import it in Vercel (framework preset: Next.js).
2. Add the environment variables above. For a zero-config demo deployment, `NEXT_PUBLIC_DEMO_MODE=true` and `AI_PROVIDER=demo` are enough.
3. Deploy. The PDF route runs on the Node.js runtime.

On Vercel's serverless functions the in-memory demo store is per instance. Demo data is always available, and demo report links rebuild on any instance, but edits made in demo mode are not durable. Use Supabase for persistence.

## Demo flow

1. Landing page → **View Demo** → **Try Demo**.
2. Dashboard: 12 projects, 438 media assets, 87% AI analyzed, 24 reports; AI activity and charts.
3. Open **Bhopal Lake Restoration**: 128 media assets, 96% analyzed, 31 waste removal assets, 4 phases.
4. **Media**: filter Before / During / After, open an asset to see its AI analysis and source asset, then choose **Re-run AI analysis** to watch the processing steps.
5. **Upload Media** → Demo library (or Cloudinary when configured) → **Analyze with AI**.
6. **Timeline**: March initial site condition → April waste removal → May restoration → June post-project condition.
7. **Before / After**: drag the slider across Shoreline Sector A and review the AI-observed changes (91% confidence).
8. **AI Search**: “Show me evidence of waste removal”.
9. **Report** → **Generate Impact Report** → **Download PDF**.

## Project structure

```
app/                      routes (App Router) and API routes
  api/                    projects, media, ai/{analyze,compare,search,report}, reports, auth, system
  projects/[id]/          overview, media, timeline, comparison, search, report, settings
components/               ui primitives, layout, media, ai, comparison, timeline, search, reports, dashboard, landing
hooks/useStepSequence.ts  AI processing step display
lib/                      config, utils, media URLs, client API, Supabase clients, demo data
services/                 domain services, AI providers, repositories, PDF
supabase/migrations/      database schema and RLS
scripts/                  demo media generator, Cloudinary seeding
public/demo/              demo workspace media
```

## API reference

All responses are `{ data }` on success or `{ error, code }` on failure. Every route except `/api/auth/*` requires a session.

| Method | Route | Body / notes |
| --- | --- | --- |
| GET, POST | `/api/projects` | POST `{ name, location, startDate, endDate, type?, description?, focusActivity? }` |
| GET, PUT, DELETE | `/api/projects/[id]` | PUT partial fields including `status` |
| GET | `/api/projects/[id]/media` | Media with AI analysis |
| POST | `/api/media/upload` | `{ projectId, upload: CloudinaryResult, phase?, site?, capturedAt? }` |
| POST | `/api/media/sign` | Upload signature (requires server Cloudinary key) |
| POST | `/api/ai/analyze` | `{ assetId }` |
| POST | `/api/ai/compare` | `{ projectId, beforeAssetId, afterAssetId }` |
| POST | `/api/ai/search` | `{ projectId, query }` |
| POST | `/api/ai/report` | `{ projectId }` generates and saves a report |
| GET, POST | `/api/reports` | GET `?projectId=` list; POST `{ projectId }` |
| GET | `/api/reports/[id]` | Report JSON |
| GET | `/api/reports/[id]/pdf` | PDF download |
| POST, DELETE | `/api/auth/demo` | Demo sign-in `{ email, password }` or `{ demo: true }`; DELETE signs out |
| GET | `/api/system/status` | Configuration status (no secrets) |

## License

MIT
