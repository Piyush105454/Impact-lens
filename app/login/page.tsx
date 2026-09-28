import Image from "next/image";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Logo } from "@/components/layout/Logo";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main id="main" className="grid min-h-screen lg:grid-cols-[1.1fr,1fr]">
      <div className="relative hidden overflow-hidden border-r lg:block">
        <Image src="/demo/lake-after-03.jpg" alt="Restored lake shoreline in Bhopal" fill priority sizes="55vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/10" />
        <div className="absolute inset-x-0 top-0 p-10"><Logo /></div>
        <div className="absolute inset-x-0 bottom-0 p-10">
          <p className="max-w-md font-display text-3xl font-semibold leading-snug">128 field photos and videos from Bhopal, turned into one verifiable impact report.</p>
          <p className="mt-3 text-sm text-muted-foreground">Bhopal Lake Restoration, March to June 2026</p>
        </div>
      </div>
      <div className="flex flex-col px-6 py-10 sm:px-10">
        <div className="lg:hidden"><Logo /></div>
        <div className="flex flex-1 items-center justify-center py-10">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
