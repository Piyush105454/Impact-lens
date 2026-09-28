import { ok } from "@/lib/api";
import { getProviderInfo, getProviderStatus } from "@/services/ai";
import { isCloudinaryServerConfigured } from "@/services/cloudinary";
import { dataSourceLabel } from "@/services/repository";
import { isCloudinaryUploadConfigured, isSupabaseConfigured, publicConfig } from "@/lib/config";

/** Non-secret configuration status. Never returns key values. */
export async function GET() {
  return ok({
    environment: publicConfig.demoMode ? "demo" : "production",
    ai: { ...getProviderInfo(), providers: getProviderStatus() },
    cloudinary: { upload: isCloudinaryUploadConfigured, server: isCloudinaryServerConfigured },
    supabase: isSupabaseConfigured,
    dataSource: dataSourceLabel(),
  });
}
