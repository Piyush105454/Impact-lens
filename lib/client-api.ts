/** Browser-side JSON client for the ImpactLens API ({ data } | { error }). */
export class ApiRequestError extends Error {
  constructor(message: string, readonly status: number, readonly code?: string) {
    super(message);
  }
}

export async function api<T>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const { json, ...rest } = init ?? {};
  const res = await fetch(url, {
    ...rest,
    method: rest.method ?? (json !== undefined ? "POST" : "GET"),
    headers: { ...(json !== undefined ? { "Content-Type": "application/json" } : {}), ...rest.headers },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  let payload: { data?: T; error?: string; code?: string } = {};
  try {
    payload = await res.json();
  } catch {
    /* non-JSON */
  }
  if (!res.ok || payload.data === undefined) {
    throw new ApiRequestError(payload.error ?? `Request failed (${res.status})`, res.status, payload.code);
  }
  return payload.data;
}
