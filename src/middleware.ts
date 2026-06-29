import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Clone request headers and add x-pathname
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  // For all admin routes except login: require auth cookie
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const authCookie = request.cookies.get("admin_auth");
    if (!authCookie) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
