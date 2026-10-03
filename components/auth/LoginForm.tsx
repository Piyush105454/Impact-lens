"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, Loader2, Sparkles, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/client-api";
import { DEMO_USER, isSupabaseConfigured, publicConfig } from "@/lib/config";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const dest = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  const [email, setEmail] = useState<string>(DEMO_USER.email);
  const [password, setPassword] = useState<string>(DEMO_USER.password);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<"signin" | "demo" | null>(null);

  function go() {
    router.push(dest);
    router.refresh();
  }

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending("signin");
    try {
      const isDemoCreds = email.trim().toLowerCase() === DEMO_USER.email;
      if (isSupabaseConfigured && !isDemoCreds) {
        const supabase = createSupabaseBrowserClient();
        const { error: err } = await supabase!.auth.signInWithPassword({ email, password });
        if (err) throw new Error(err.message);
      } else {
        await api("/api/auth/demo", { json: { email, password } });
      }
      go();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
      setPending(null);
    }
  }

  async function tryDemo() {
    setError(null);
    setPending("demo");
    try {
      await api("/api/auth/demo", { json: { demo: true } });
      go();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demo access is unavailable");
      setPending(null);
    }
  }

  function fillDemo() {
    setEmail(DEMO_USER.email);
    setPassword(DEMO_USER.password);
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-3xl font-semibold">Sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">Access your organization&apos;s projects, evidence and reports.</p>

      {/* Prominent Demo Credentials Helper */}
      <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-4 transition-all">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
            <KeyRound className="h-3.5 w-3.5" /> Demo Access Enabled
          </span>
          <button
            type="button"
            onClick={fillDemo}
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <UserCheck className="h-3.5 w-3.5" /> Auto-fill
          </button>
        </div>
        <div className="mt-2.5 space-y-1 text-xs text-muted-foreground font-mono">
          <p>Email: <span className="text-foreground font-semibold">{DEMO_USER.email}</span></p>
          <p>Password: <span className="text-foreground font-semibold">{DEMO_USER.password}</span></p>
        </div>
      </div>

      <form onSubmit={signIn} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email" className="mb-1.5 block text-sm">Email</Label>
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@organization.org" />
        </div>
        <div>
          <Label htmlFor="password" className="mb-1.5 block text-sm">Password</Label>
          <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" size="lg" disabled={pending !== null}>
          {pending === "signin" && <Loader2 className="animate-spin" />} Sign In
        </Button>
      </form>
      {publicConfig.demoMode && (
        <>
          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" /></div>
          <Button variant="secondary" size="lg" className="w-full" onClick={tryDemo} disabled={pending !== null}>
            {pending === "demo" ? <Loader2 className="animate-spin" /> : <Sparkles />} Instant One-Click Demo Login
          </Button>
        </>
      )}
    </div>
  );
}
