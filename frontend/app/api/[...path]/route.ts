// Same-origin BFF proxy. The browser only ever talks to /api/* on this Next.js
// server. This file forwards each request to the real backend, attaching the
// JWT pulled from an HttpOnly cookie. The token never touches client JS.

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKEND_URL =
  process.env.BACKEND_API_URL

const AUTH_COOKIE = "lumen_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function buildCookie(value: string, maxAge: number) {
  const parts = [
    `${AUTH_COOKIE}=${value}`,
    "Path=/",
    `Max-Age=${maxAge}`,
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

async function forward(req: NextRequest, pathParts: string[]) {
  const path = "/" + pathParts.join("/");
  const search = req.nextUrl.search || "";
  const target = `${BACKEND_URL}/api${path}${search}`;

  // Logout is handled entirely by the BFF: clear cookie, no backend call.
  if (path === "/auth/logout") {
    const h = new Headers({ "content-type": "application/json" });
    h.append("set-cookie", buildCookie("", 0));
    return new NextResponse(JSON.stringify({ ok: true }), { status: 200, headers: h });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  const headers: Record<string, string> = {};
  const ct = req.headers.get("content-type");
  if (ct) headers["content-type"] = ct;
  if (token) headers["authorization"] = `Bearer ${token}`;

  const hasBody = !["GET", "HEAD"].includes(req.method);
  const body = hasBody ? await req.arrayBuffer() : undefined;

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: req.method,
      headers,
      body,
      cache: "no-store",
      redirect: "manual",
    });
  } catch {
    return NextResponse.json(
      { error: "Upstream service unavailable" },
      { status: 502 }
    );
  }

  const text = await upstream.text();
  const resHeaders = new Headers();
  const upstreamCt = upstream.headers.get("content-type");
  if (upstreamCt) resHeaders.set("content-type", upstreamCt);

  const isLogin = path === "/auth/login" || path === "/auth/signup";

  let responseBody: string = text;

  if (isLogin && upstream.ok) {
    try {
      const json = JSON.parse(text);
      if (json?.token) {
        resHeaders.append("set-cookie", buildCookie(json.token, COOKIE_MAX_AGE));
        const { token: _t, ...rest } = json;
        responseBody = JSON.stringify(rest);
      }
    } catch {}
  }

  return new NextResponse(responseBody, {
    status: upstream.status,
    headers: resHeaders,
  });
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params; return forward(req, path);
}
export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params; return forward(req, path);
}
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params; return forward(req, path);
}
export async function PUT(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params; return forward(req, path);
}
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params; return forward(req, path);
}
