/**
 * Public (browser-safe) configuration. Only NEXT_PUBLIC_* values belong here.
 * Server secrets live in lib/env.server.ts, which is marked server-only.
 */
export const publicConfig = {
  demoMode: (process.env.NEXT_PUBLIC_DEMO_MODE ?? "true") !== "false",
  cloudinaryCloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "",
  cloudinaryApiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ?? process.env.CLOUDINARY_API_KEY ?? "",
  cloudinaryUploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "",
  demoAssetsFromCloudinary: process.env.NEXT_PUBLIC_DEMO_ASSETS_FROM_CLOUDINARY === "true",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
};

export const isCloudinaryUploadConfigured = Boolean(publicConfig.cloudinaryCloudName && publicConfig.cloudinaryUploadPreset);
export const isSupabaseConfigured = Boolean(publicConfig.supabaseUrl && publicConfig.supabaseAnonKey);

export const DEMO_USER = {
  email: "demo@impactlens.ai",
  password: "demo123",
  name: "Satyapal Singh",
  firstName: "Satyapal",
  role: "Programme Manager",
} as const;

export const SESSION_COOKIE = "il_session";
