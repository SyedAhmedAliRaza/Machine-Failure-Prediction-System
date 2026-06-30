import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Lightweight middleware that only checks for the session cookie.
// This avoids importing better-sqlite3 into the Edge Runtime.
const protectedPaths = ["/dashboard", "/predict", "/history"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // NextAuth v5 stores the session in a cookie named
  // "authjs.session-token" (or "__Secure-authjs.session-token" on HTTPS).
  const token =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/predict/:path*", "/history/:path*"],
};
