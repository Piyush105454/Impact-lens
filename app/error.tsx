"use client";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <main id="main" className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border bg-surface text-destructive"><AlertTriangle className="h-5 w-5" /></span>
      <h1 className="text-2xl font-semibold">This view couldn&apos;t load</h1>
      <p className="max-w-md text-sm text-muted-foreground">{error.message || "An unexpected error occurred while loading this page."}</p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
