import "server-only";
import { isSupabaseConfigured, publicConfig } from "@/lib/config";
import type { Repository } from "./types";
import { DemoRepository } from "./demo";
import { SupabaseRepository } from "./supabase";

export type { Repository } from "./types";

/** Demo workspace unless demo mode is off and Supabase credentials exist. */
export function getRepository(): Repository {
  if (!publicConfig.demoMode && isSupabaseConfigured) return new SupabaseRepository();
  return new DemoRepository();
}

export function dataSourceLabel() {
  return !publicConfig.demoMode && isSupabaseConfigured ? "Supabase" : "Demo Workspace";
}
