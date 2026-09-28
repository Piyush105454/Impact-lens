import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "il_session";
const PROTECTED = ["/dashboard", "/projects", "/settings", "/media", "/reports", "/search"];
const PUBLIC_API = ["/api/auth"];

function isAuthenticated(req: NextRequest) {
  if (req.cookies.get(SESSION_COOKIE)?.value) return true;
  // Supabase Auth session cookie (sb-<project-ref>-auth-token[.0])
  return req.cookies.getAll().some((c) => c.name.startsWith("sb-") && c.name.includes("auth-token"));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api/");
  if (isApi) {
    if (PUBLIC_API.some((p) => pathname.startsWith(p))) return NextResponse.next();
    if (!isAuthenticated(req)) return NextResponse.json({ error: "Sign in to continue", code: "unauthorized" }, { status: 401 });
    return NextResponse.next();
  }
  if (PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`)) && !isAuthenticated(req)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if (pathname === "/login" && isAuthenticated(req)) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon|demo/|.*\\.(?:png|jpg|jpeg|svg|mp4|webp|ico)$).*)"],
};
