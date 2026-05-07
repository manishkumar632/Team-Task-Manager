import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "lumen_session";
const PUBLIC_PATHS = ["/login", "/signup"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = !!req.cookies.get(AUTH_COOKIE)?.value;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  // Authenticated user hitting login/signup → send home
  if (hasSession && isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Unauthenticated user hitting any protected app page → send to login
  if (!hasSession && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Run on every page request, but skip Next internals, the BFF /api proxy
  // (which handles its own auth), and static assets.
  matcher: ["/((?!_next/|api/|favicon.ico|.*\\..*).*)"],
};
