import "server-only";

/** Fetches an image and returns base64 + mime type for inline model input. */
export async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string }> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Could not load media for analysis (${res.status})`);
  const mimeType = res.headers.get("content-type")?.split(";")[0] ?? "image/jpeg";
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.byteLength > 18 * 1024 * 1024) throw new Error("Media too large for inline analysis");
  return { data: buf.toString("base64"), mimeType };
}

export async function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  let t: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, rej) => {
    t = setTimeout(() => rej(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([p, timeout]);
  } finally {
    if (t) clearTimeout(t);
  }
}
