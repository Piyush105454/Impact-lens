import "server-only";
import type { AIProviderName } from "@/types";

/** Server-only secrets. Importing this from a client component fails the build. */
export const serverEnv = {
  aiProvider: (process.env.AI_PROVIDER ?? "demo").toLowerCase() as AIProviderName | string,
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  geminiModel: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  openaiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  openaiBaseUrl: process.env.OPENAI_BASE_URL ?? "",
  openrouterApiKey: process.env.OPENROUTER_API_KEY ?? process.env.OPENAI_API_KEY ?? "",
  openrouterModel: process.env.OPENROUTER_MODEL ?? process.env.OPENAI_MODEL ?? "google/gemini-2.5-flash-lite",
  openrouterBaseUrl: process.env.OPENROUTER_BASE_URL ?? process.env.OPENAI_BASE_URL ?? "https://openrouter.ai/api/v1",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY ?? "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
};
