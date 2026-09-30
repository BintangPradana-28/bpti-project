import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/inventory",
  "/assets",
  "/assignments",
  "/locations",
  "/maintenance",
  "/reports",
  "/audit",
  "/users",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for Better Auth session cookie
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const isLoginPage = pathname === "/login";

  // If user is accessing login page while already authenticated, redirect to dashboard
  // (unless redirected here with a callback or error, preventing stale-cookie loops)
  const hasCallbackOrError =
    request.nextUrl.searchParams.has("callbackUrl") ||
    request.nextUrl.searchParams.has("error");

  if (isLoginPage && sessionToken && !hasCallbackOrError) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If user is accessing protected page without session, redirect to login
  if (isProtected && !sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/inventory/:path*",
    "/assets/:path*",
    "/assignments/:path*",
    "/locations/:path*",
    "/maintenance/:path*",
    "/reports/:path*",
    "/audit/:path*",
    "/users/:path*",
    "/login",
  ],
};
