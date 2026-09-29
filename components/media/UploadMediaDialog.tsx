"use client";
import { useState } from "react";
import { CldUploadWidget, type CloudinaryUploadWidgetInfo, type CloudinaryUploadWidgetResults } from "next-cloudinary";
import { AlertCircle, CheckCircle2, CloudUpload, Images, Loader2, Sparkles, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import type { MediaAnalysis, MediaAsset, Phase } from "@/types";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ANALYSIS_STEPS, StepList } from "@/components/ai/StepList";
import { AnalysisPanel } from "@/components/ai/AnalysisPanel";
import { useStepSequence } from "@/hooks/useStepSequence";
import { api } from "@/lib/client-api";
import { isCloudinaryUploadConfigured, publicConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import { MediaThumb } from "./MediaThumb";

interface QueueItem {
  key: string;
  name: string;
  status: "analyzing" | "done" | "error";
  asset?: MediaAsset;
  error?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  projectId: string;
  projectName: string;
  sampleAssets: MediaAsset[];
  onUploaded: (assets: MediaAsset[]) => void;
}

const PHASE_OPTIONS: { value: Phase; label: string }[] = [
  { value: "before", label: "Before" },
  { value: "during", label: "During" },
  { value: "after", label: "After" },
];

export function UploadMediaDialog({ open, onOpenChange, projectId, projectName, sampleAssets, onUploaded }: Props) {
  const [phase, setPhase] = useState<Phase>("during");
  const [site, setSite] = useState("");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [sampleId, setSampleId] = useState<string | null>(sampleAssets[0]?.id ?? null);
  const [result, setResult] = useState<MediaAsset | null>(null);
  const steps = useStepSequence(ANALYSIS_STEPS.length);

  async function register(info: CloudinaryUploadWidgetInfo) {
    const key = info.public_id;
    const name = `${info.original_filename ?? info.public_id.split("/").pop()}.${info.format ?? ""}`.replace(/\.$/, "");
    setQueue((q) => [{ key, name, status: "analyzing" }, ...q]);
    try {
      const r = await steps.run(() =>
        api<{ asset: MediaAsset; analysis: MediaAnalysis | null }>("/api/media/upload", {
          json: {
            projectId,
            phase,
            site: site || undefined,
            upload: {
              public_id: info.public_id,
              secure_url: info.secure_url,
              resource_type: info.resource_type,
              format: info.format,
              width: info.width,
              height: info.height,
              duration: (info as unknown as { duration?: number }).duration,
              original_filename: info.original_filename,
              bytes: info.bytes,
              created_at: info.created_at,
            },
          },
        }),
      );
      setQueue((q) => q.map((i) => (i.key === key ? { ...i, status: "done", asset: r.asset } : i)));
      setResult(r.asset);
      onUploaded([r.asset]);
      toast.success("Media uploaded and analyzed", { description: r.asset.filename });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload could not be registered";
      setQueue((q) => q.map((i) => (i.key === key ? { ...i, status: "error", error: msg } : i)));
      toast.error("Upload failed", { description: msg });
    }
  }

  async function analyzeSample() {
    if (!sampleId) return;
    setResult(null);
    try {
      const r = await steps.run(() => api<{ asset: MediaAsset; analysis: MediaAnalysis }>("/api/ai/analyze", { json: { assetId: sampleId } }));
      setResult(r.asset);
      onUploaded([r.asset]);
    } catch (e) {
      toast.error("AI analysis failed", { description: e instanceof Error ? e.message : "Try again in a moment." });
    }
  }

  function handleOpenChange(o: boolean) {
    if (!o) {
      steps.reset();
      setResult(null);
      setQueue([]);
    }
    onOpenChange(o);
  }

  const busy = steps.running;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="center" className="max-w-2xl overflow-y-auto scrollbar-thin">
        <SheetTitle className="text-xl font-semibold">Upload field media</SheetTitle>
        <SheetDescription className="mt-1 text-sm text-muted-foreground">Add photos or videos to {projectName}. Each asset is analyzed by AI as soon as it arrives.</SheetDescription>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Project phase</Label>
            <div role="radiogroup" aria-label="Project phase" className="grid grid-cols-3 rounded-full border bg-surface p-1">
              {PHASE_OPTIONS.map((p) => (
                <button key={p.value} type="button" role="radio" aria-checked={phase === p.value} onClick={() => setPhase(p.value)} className={cn("rounded-full py-1.5 text-sm font-medium text-muted-foreground", phase === p.value && "bg-surface-raised text-foreground")}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="upload-site" className="mb-1.5 block text-xs text-muted-foreground">Site (optional)</Label>
            <Input id="upload-site" value={site} onChange={(e) => setSite(e.target.value)} placeholder="e.g. Shoreline Sector A" className="h-10" />
          </div>
        </div>

        <Tabs defaultValue={isCloudinaryUploadConfigured ? "cloudinary" : "sample"} className="mt-5">
          <TabsList>
            <TabsTrigger value="cloudinary"><CloudUpload /> Upload to Cloudinary</TabsTrigger>
            <TabsTrigger value="sample"><Images /> Demo library</TabsTrigger>
          </TabsList>

          <TabsContent value="cloudinary" className="mt-4 focus-visible:outline-none">
            {isCloudinaryUploadConfigured ? (
              <CldUploadWidget
                uploadPreset={publicConfig.cloudinaryUploadPreset}
                config={{ cloud: { cloudName: publicConfig.cloudinaryCloudName } }}
                signatureEndpoint="/api/media/sign"
                options={{ multiple: true, maxFiles: 20, resourceType: "auto", folder: `impactlens/${projectId}/${phase}`, sources: ["local", "camera", "url"], tags: ["impactlens", projectId, phase] }}
                onSuccess={(res: CloudinaryUploadWidgetResults) => {
                  if (res.info && typeof res.info !== "string") void register(res.info);
                }}
                onError={(err) => {
                    const detail = typeof err === "object" && err !== null && "statusText" in err ? String((err as {statusText:string}).statusText) : "Check your upload preset is set to Unsigned in the Cloudinary console.";
                    toast.error("Upload failed", { description: detail });
                  }}
              >
                {({ open: openWidget }) => (
                  <button type="button" onClick={() => openWidget()} className="flex w-full flex-col items-center gap-3 rounded-2xl border border-dashed bg-surface/60 px-6 py-10 text-center transition-colors hover:border-primary/50">
                    <UploadCloud className="h-8 w-8 text-primary" />
                    <span className="font-semibold">Choose photos or videos</span>
                    <span className="text-sm text-muted-foreground">Multiple files, images and video. Stored in <code className="text-foreground/80">impactlens/{projectId}/{phase}</code></span>
                  </button>
                )}
              </CldUploadWidget>
            ) : (
              <div className="flex gap-3 rounded-2xl border bg-surface/60 p-5 text-sm">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-phase-before" />
                <div>
                  <p className="font-semibold">Cloudinary isn&apos;t connected in this workspace</p>
                  <p className="mt-1 text-muted-foreground">
                    Add <code className="text-foreground/80">NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code> and <code className="text-foreground/80">NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</code> to enable direct uploads. Until then, use the demo library to run AI analysis on project media.
                  </p>
                </div>
              </div>
            )}
            {queue.length > 0 && (
              <ul className="mt-4 space-y-2">
                {queue.map((i) => (
                  <li key={i.key} className="flex items-center gap-3 rounded-xl border bg-surface px-3 py-2 text-sm">
                    {i.status === "analyzing" ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : i.status === "done" ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <AlertCircle className="h-4 w-4 text-destructive" />}
                    <span className="min-w-0 flex-1 truncate">{i.name}</span>
                    <span className="text-xs text-muted-foreground">{i.status === "analyzing" ? "Analyzing" : i.status === "done" ? `${i.asset?.confidence ?? ""}% confidence` : i.error}</span>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="sample" className="mt-4 focus-visible:outline-none">
            {!busy && !result && (
              <>
                <p className="mb-3 text-sm text-muted-foreground">{sampleAssets.length ? "Select a field asset from the project library to run AI analysis." : "This project has no media in the demo library yet. Connect Cloudinary to upload new field media."}</p>
                <div role="radiogroup" aria-label="Sample media" className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {sampleAssets.slice(0, 8).map((a) => (
                    <button key={a.id} type="button" role="radio" aria-checked={sampleId === a.id} aria-label={a.filename} onClick={() => setSampleId(a.id)} className={cn("overflow-hidden rounded-xl border-2 border-transparent transition-colors", sampleId === a.id && "border-primary")}>
                      <MediaThumb asset={a} width={320} sizes="160px" rounded={false} />
                    </button>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        {(busy || result) && (
          <div className="mt-5 rounded-2xl border bg-surface p-5">
            {busy ? (
              <>
                <p className="mb-4 flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4 text-primary" /> Processing media</p>
                <StepList steps={ANALYSIS_STEPS} active={steps.active} />
              </>
            ) : result ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MediaThumb asset={result} width={320} sizes="120px" className="w-28 shrink-0" />
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-primary"><CheckCircle2 className="h-4 w-4" /> Analysis complete</p>
                    <p className="truncate text-sm">{result.filename}</p>
                    <code className="block truncate text-xs text-muted-foreground">{result.cloudinaryPublicId}</code>
                  </div>
                </div>
                <AnalysisPanel asset={result} />
              </div>
            ) : null}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          {result ? (
            <>
              <Button variant="secondary" onClick={() => { setResult(null); steps.reset(); }}>Analyze another</Button>
              <Button onClick={() => handleOpenChange(false)}>Done</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => handleOpenChange(false)}>Cancel</Button>
              <Button onClick={analyzeSample} disabled={busy || !sampleId}><Sparkles /> Analyze with AI</Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
