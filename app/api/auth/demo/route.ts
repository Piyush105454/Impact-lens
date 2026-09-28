import { NextResponse } from "next/server";
import { fail, readJson, strField } from "@/lib/api";
import { DEMO_USER, SESSION_COOKIE, publicConfig } from "@/lib/config";

/** Demo sign-in. Accepts the demo credentials, or { demo: true } for one-click access. */
export async function POST(req: Request) {
  if (!publicConfig.demoMode) return fail("Demo access is disabled", 403, "demo_disabled");
  const body = (await readJson(req)) ?? {};
  const oneClick = body.demo === true;
  const email = strField(body, "email").toLowerCase();
  const password = strField(body, "password");
  if (!oneClick && (email !== DEMO_USER.email || password !== DEMO_USER.password)) {
    return fail("Email or password is incorrect. Use the demo credentials shown below.", 401, "invalid_credentials");
  }
  const res = NextResponse.json({ data: { user: { email: DEMO_USER.email, name: DEMO_USER.name } } });
  res.cookies.set(SESSION_COOKIE, "demo", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 12 });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ data: { signedOut: true } });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
