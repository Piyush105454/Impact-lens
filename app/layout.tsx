import type { Metadata, Viewport } from "next";
import "@fontsource/dm-serif-display";
import "@fontsource-variable/dm-sans";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: { default: "ImpactLens | Turn Field Media Into Measurable Impact", template: "%s | ImpactLens" },
  description:
    "ImpactLens uses AI-powered media intelligence to transform field photos and videos into searchable evidence, visual insights and professional impact reports.",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = { themeColor: "#07110D", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen font-sans">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">
          Skip to content
        </a>
        {children}
        <Toaster theme="dark" position="bottom-right" toastOptions={{ classNames: { toast: "!bg-surface-raised !border-border !text-foreground !rounded-xl" } }} />
      </body>
    </html>
  );
}
