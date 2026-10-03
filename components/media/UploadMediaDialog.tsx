"use client";
import { useRef, useState } from "react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  async function uploadFileToCloudinary(file: File) {
    const key = `${Date.now()}_${file.name}`;
    setQueue((q) => [{ key, name: file.name, status: "analyzing" }, ...q]);
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const folder = `impactlens/${projectId}/${phase}`;

      const sigRes = await fetch("/api/media/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paramsToSign: {
            timestamp,
            folder,
            upload_preset: publicConfig.cloudinaryUploadPreset,
          },
        }),
      });
      const sigData = await sigRes.json();
      if (!sigData?.signature) {
        throw new Error(sigData?.error || "Signature generation failed");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", publicConfig.cloudinaryUploadPreset);
      formData.append("api_key", publicConfig.cloudinaryApiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("folder", folder);
      formData.append("signature", sigData.signature);

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${publicConfig.cloudinaryCloudName}/auto/upload`,
        { method: "POST", body: formData },
      );
      const cldInfo = await cloudRes.json();
      if (cldInfo.error) {
        throw new Error(cldInfo.error.message || "Cloudinary upload failed");
      }

      const r = await steps.run(() =>
        api<{ asset: MediaAsset; analysis: MediaAnalysis | null }>("/api/media/upload", {
          json: {
            projectId,
            phase,
            site: site || undefined,
            upload: {
              public_id: cldInfo.public_id,
              secure_url: cldInfo.secure_url,
              resource_type: cldInfo.resource_type,
              format: cldInfo.format,
              width: cldInfo.width,
              height: cldInfo.height,
              duration: cldInfo.duration,
              original_filename: cldInfo.original_filename || file.name,
              bytes: cldInfo.bytes,
              created_at: cldInfo.created_at,
            },
          },
        }),
      );

      setQueue((q) => q.map((i) => (i.key === key ? { ...i, status: "done", asset: r.asset } : i)));
      setResult(r.asset);
      onUploaded([r.asset]);
      toast.success("Media uploaded and analyzed", { description: r.asset.filename });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      setQueue((q) => q.map((i) => (i.key === key ? { ...i, status: "error", error: msg } : i)));
      toast.error("Upload failed", { description: msg });
    }
  }

  async function handleDirectFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    for (const file of files) {
      await uploadFileToCloudinary(file);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files ?? []);
    if (!files.length) return;
    for (const file of files) {
      void uploadFileToCloudinary(file);
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
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleDirectFileSelect}
                />
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed bg-surface/60 px-6 py-10 text-center transition-colors hover:border-primary/60 hover:bg-surface"
                >
                  <UploadCloud className="h-9 w-9 text-primary" />
                  <div>
                    <span className="text-base font-semibold">Choose field photos or videos</span>
                    <p className="mt-1 text-xs text-muted-foreground">Click to browse your device or drag & drop files here</p>
                  </div>
                  <span className="text-xs text-muted-foreground/80">
                    Stored in <code className="text-foreground/80">impactlens/{projectId}/{phase}</code>
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted-foreground">Prefer Cloudinary Modal widget?</span>
                  <CldUploadWidget
                    signatureEndpoint="/api/media/sign"
                    uploadPreset={publicConfig.cloudinaryUploadPreset}
                    config={{ cloud: { cloudName: publicConfig.cloudinaryCloudName, apiKey: publicConfig.cloudinaryApiKey } }}
                    options={{ multiple: true, maxFiles: 20, resourceType: "auto", folder: `impactlens/${projectId}/${phase}`, sources: ["local", "camera", "url"], tags: ["impactlens", projectId, phase] }}
                    onSuccess={(res: CloudinaryUploadWidgetResults) => {
                      if (res.info && typeof res.info !== "string") void register(res.info);
                    }}
                    onUpload={(res: CloudinaryUploadWidgetResults) => {
                      if (res.event === "success" && res.info && typeof res.info !== "string") void register(res.info);
                    }}
                  >
                    {({ open: openWidget }) => (
                      <Button variant="outline" size="sm" type="button" onClick={() => openWidget()}>
                        Open Widget Modal
                      </Button>
                    )}
                  </CldUploadWidget>
                </div>
              </div>
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
