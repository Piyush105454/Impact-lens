import type { Metadata } from "next";
import { Building2, CheckCircle2, Cloud, Cpu, Database, KeyRound, Server, XCircle } from "lucide-react";
import { getProviderInfo, getProviderStatus } from "@/services/ai";
import { isCloudinaryServerConfigured } from "@/services/cloudinary";
import { dataSourceLabel } from "@/services/repository";
import { isCloudinaryUploadConfigured, isSupabaseConfigured, publicConfig, DEMO_USER } from "@/lib/config";
import { DEMO_ORG_NAME } from "@/lib/demo/demoProjects";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Settings" };

function Status({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", ok ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
      {ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />} {label}
    </span>
  );
}

function Panel({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-surface p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</span>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function SettingsPage() {
  const providers = getProviderStatus();
  const info = getProviderInfo();
  const active = providers.find((p) => p.active);
  const integrations = [
    { icon: Cloud, name: "Cloudinary uploads", detail: "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET", ok: isCloudinaryUploadConfigured },
    { icon: KeyRound, name: "Cloudinary server API", detail: "CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET (server only)", ok: isCloudinaryServerConfigured },
    { icon: Database, name: "Supabase", detail: "NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY", ok: isSupabaseConfigured },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Settings" description="Workspace, AI provider and integration configuration." />

      <Panel icon={<Building2 className="h-5 w-5" />} title="Workspace" description="Organization and account">
        <dl className="grid gap-4 sm:grid-cols-3">
          <div><dt className="text-xs text-muted-foreground">Organization</dt><dd className="mt-1 font-medium">{DEMO_ORG_NAME}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Signed in as</dt><dd className="mt-1 font-medium">{DEMO_USER.name}</dd><dd className="text-xs text-muted-foreground">{DEMO_USER.email}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Role</dt><dd className="mt-1 font-medium">{DEMO_USER.role}</dd></div>
        </dl>
      </Panel>

      <Panel icon={<Cpu className="h-5 w-5" />} title="AI provider" description="All AI features run through one provider interface. The frontend never calls a model vendor directly.">
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border bg-background/40 px-4 py-3 text-sm">
          <span className="text-muted-foreground">AI Provider:</span>
          <span className="font-semibold">{active?.label.replace(" AI", "") ?? "Demo"}</span>
          <span className="text-muted-foreground">AI_PROVIDER={info.requested || "demo"}</span>
          {info.reason && <span className="text-xs text-phase-before">Using Demo AI: {info.reason}</span>}
        </div>
        <ul className="divide-y rounded-xl border">
          {providers.map((p) => (
            <li key={p.name} className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{p.label}{p.model ? <span className="ml-2 text-xs font-normal text-muted-foreground">{p.model}</span> : null}</p>
                <p className="text-xs text-muted-foreground">{p.note}</p>
              </div>
              {p.active ? <Status ok label="Active" /> : <Status ok={p.configured} label={p.configured ? "Configured" : "Not configured"} />}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">If a configured provider is unavailable at runtime, requests fall back to local analysis automatically.</p>
      </Panel>

      <Panel icon={<Server className="h-5 w-5" />} title="Integrations" description="Media storage and database. Secret values are never sent to the browser.">
        <ul className="divide-y rounded-xl border">
          {integrations.map((i) => (
            <li key={i.name} className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center">
              <i.icon className="hidden h-4 w-4 text-muted-foreground sm:block" />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{i.name}</p>
                <p className="truncate text-xs text-muted-foreground">{i.detail}</p>
              </div>
              <Status ok={i.ok} label={i.ok ? "Connected" : "Not configured"} />
            </li>
          ))}
        </ul>
        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
          <div className="rounded-xl border bg-background/40 px-4 py-3"><dt className="text-xs text-muted-foreground">Environment</dt><dd className="mt-1 font-medium">{publicConfig.demoMode ? "Demo" : "Production"}</dd></div>
          <div className="rounded-xl border bg-background/40 px-4 py-3"><dt className="text-xs text-muted-foreground">Data source</dt><dd className="mt-1 font-medium">{dataSourceLabel()}</dd></div>
        </dl>
      </Panel>
    </div>
  );
}
