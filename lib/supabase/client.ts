"use client";
import { createBrowserClient } from "@supabase/ssr";
import { publicConfig, isSupabaseConfigured } from "@/lib/config";

/** Browser client (anon key only). Returns null when Supabase is not configured. */
export function createSupabaseBrowserClient() {
  if (!isSupabaseConfigured) return null;
  return createBrowserClient(publicConfig.supabaseUrl, publicConfig.supabaseAnonKey);
}
