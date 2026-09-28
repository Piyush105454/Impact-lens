import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { publicConfig } from "@/lib/config";
import { serverEnv } from "@/lib/env.server";

/** Request-scoped client that acts as the signed-in user (RLS enforced). */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(publicConfig.supabaseUrl, publicConfig.supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component: cookies are read-only there. Middleware refreshes sessions.
        }
      },
    },
  });
}

/** Service-role client for trusted server jobs only. Bypasses RLS. */
export function createSupabaseAdminClient() {
  if (!serverEnv.supabaseServiceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  return createClient(publicConfig.supabaseUrl, serverEnv.supabaseServiceRoleKey, { auth: { persistSession: false } });
}
