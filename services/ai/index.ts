import "server-only";
import { serverEnv } from "@/lib/env.server";
import type { AIProviderName } from "@/types";
import type { AIProvider, ProviderStatus } from "./types";
import { DemoAI } from "./demoAI";
import { GeminiAI } from "./gemini";
import { OpenAIAI } from "./openai";

export type { AIProvider } from "./types";

const demo = new DemoAI();

interface Resolution {
  requested: string;
  active: AIProviderName;
  primary: AIProvider;
  reason?: string;
}

/**
 * AI_PROVIDER=gemini + GEMINI_API_KEY  -> Gemini
 * AI_PROVIDER=openai + OPENAI_API_KEY  -> OpenAI
 * anything else                        -> Demo (local)
 */
export function resolveProvider(): Resolution {
  const requested = serverEnv.aiProvider;
  if (requested === "gemini") {
    if (serverEnv.geminiApiKey) return { requested, active: "gemini", primary: new GeminiAI(serverEnv.geminiApiKey, serverEnv.geminiModel) };
    return { requested, active: "demo", primary: demo, reason: "GEMINI_API_KEY is not set" };
  }
  if (requested === "openai") {
    if (serverEnv.openaiApiKey) return { requested, active: "openai", primary: new OpenAIAI(serverEnv.openaiApiKey, serverEnv.openaiModel) };
    return { requested, active: "demo", primary: demo, reason: "OPENAI_API_KEY is not set" };
  }
  return { requested, active: "demo", primary: demo };
}

/**
 * Wraps the configured provider so any runtime failure (network, quota,
 * malformed output) transparently falls back to local analysis.
 */
class ResilientProvider implements AIProvider {
  constructor(private readonly primary: AIProvider, private readonly fallback: AIProvider) {}
  get name() {
    return this.primary.name;
  }
  private async run<T>(op: string, call: (p: AIProvider) => Promise<T>): Promise<T> {
    if (this.primary === this.fallback) return call(this.primary);
    try {
      return await call(this.primary);
    } catch (err) {
      console.warn(`[ai] ${this.primary.name}.${op} unavailable. Falling back to local analysis.`, err instanceof Error ? err.message : err);
      return call(this.fallback);
    }
  }
  analyzeImage: AIProvider["analyzeImage"] = (i) => this.run("analyzeImage", (p) => p.analyzeImage(i));
  compareImages: AIProvider["compareImages"] = (i) => this.run("compareImages", (p) => p.compareImages(i));
  generateProjectSummary: AIProvider["generateProjectSummary"] = (i) => this.run("generateProjectSummary", (p) => p.generateProjectSummary(i));
  generateReport: AIProvider["generateReport"] = (i) => this.run("generateReport", (p) => p.generateReport(i));
  interpretSearchQuery: AIProvider["interpretSearchQuery"] = (i) => this.run("interpretSearchQuery", (p) => p.interpretSearchQuery(i));
}

export function getAIProvider(): AIProvider {
  return new ResilientProvider(resolveProvider().primary, demo);
}

export function getProviderStatus(): ProviderStatus[] {
  const r = resolveProvider();
  return [
    { name: "demo", label: "Demo AI", configured: true, active: r.active === "demo", note: "Local provider. Runs without API keys or network access." },
    {
      name: "gemini",
      label: "Gemini",
      configured: Boolean(serverEnv.geminiApiKey),
      active: r.active === "gemini",
      model: serverEnv.geminiModel,
      note: serverEnv.geminiApiKey ? "API key detected." : "Set GEMINI_API_KEY and AI_PROVIDER=gemini.",
    },
    {
      name: "openai",
      label: "OpenAI",
      configured: Boolean(serverEnv.openaiApiKey),
      active: r.active === "openai",
      model: serverEnv.openaiModel,
      note: serverEnv.openaiApiKey ? "API key detected." : "Set OPENAI_API_KEY and AI_PROVIDER=openai.",
    },
  ];
}

export function getProviderInfo() {
  const r = resolveProvider();
  return { requested: r.requested, active: r.active, reason: r.reason };
}
