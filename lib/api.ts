import { NextResponse } from "next/server";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export function fail(error: string, status = 400, code?: string) {
  return NextResponse.json({ error, code }, { status });
}

export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await req.json();
    return typeof body === "object" && body !== null && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function originOf(req: Request) {
  const h = req.headers;
  const proto = h.get("x-forwarded-proto") ?? new URL(req.url).protocol.replace(":", "");
  const host = h.get("x-forwarded-host") ?? h.get("host");
  return host ? `${proto}://${host}` : new URL(req.url).origin;
}

export function strField(b: Record<string, unknown>, k: string) {
  const v = b[k];
  return typeof v === "string" ? v.trim() : "";
}

export function handleError(err: unknown, fallback = "Something went wrong") {
  console.error(err);
  return fail(err instanceof Error ? err.message : fallback, 500, "internal_error");
}
