import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border bg-surface text-primary"><Compass className="h-6 w-6" /></span>
      <h1 className="text-3xl font-semibold">This page isn&apos;t part of the workspace</h1>
      <p className="max-w-md text-muted-foreground">The project or page you tried to open may have been moved or deleted.</p>
      <div className="flex gap-3">
        <Button asChild><Link href="/dashboard">Go to dashboard</Link></Button>
        <Button asChild variant="secondary"><Link href="/projects">View projects</Link></Button>
      </div>
    </main>
  );
}
