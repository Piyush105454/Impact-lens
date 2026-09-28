"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-3xl font-semibold">Sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">Access your organization&apos;s projects, evidence and reports.</p>
      <form onSubmit={signIn} className="mt-8 space-y-4">
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
          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" /></div>
          <Button variant="secondary" size="lg" className="w-full" onClick={tryDemo} disabled={pending !== null}>
            {pending === "demo" ? <Loader2 className="animate-spin" /> : <Sparkles />} Try Demo
          </Button>
          <div className="mt-6 rounded-xl border bg-surface p-4 text-sm">
            <p className="font-medium">Demo credentials</p>
            <p className="mt-1 text-muted-foreground">Email: <code className="text-foreground">{DEMO_USER.email}</code></p>
            <p className="text-muted-foreground">Password: <code className="text-foreground">{DEMO_USER.password}</code></p>
            <button type="button" onClick={() => { setEmail(DEMO_USER.email); setPassword(DEMO_USER.password); }} className="mt-2 text-sm font-medium text-primary hover:underline">Use demo credentials</button>
          </div>
        </>
      )}
    </div>
  );
}
