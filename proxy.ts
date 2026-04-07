import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "rs_session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get(SESSION_COOKIE)?.value;

  // Allow unauthenticated access to login page and auth API
  if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
    // If already logged in, redirect away from login page to dashboard
    if (pathname === "/login" && role) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // No session → redirect to login
  if (!role) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Volunteer trying to access admin page → redirect to matches
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/matches", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon\\.ico).*)"],
};
