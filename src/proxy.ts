import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const CANONICAL_HOST = "theologik.org";

const intlMiddleware = createMiddleware(routing);

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";

  // Redirect Vercel preview/deployment URLs → canonical domain (301)
  if (host.endsWith(".vercel.app")) {
    const url = request.nextUrl.clone();
    url.host = CANONICAL_HOST;
    url.port = "";
    url.protocol = "https";
    return NextResponse.redirect(url, 301);
  }

  const { pathname } = request.nextUrl;

  // Admin auth: skip login page and auth API
  if (pathname.startsWith("/admin")) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-pathname", pathname);

    if (pathname === "/admin/login" || pathname.startsWith("/api/admin/auth")) {
      return NextResponse.next({ request: { headers: requestHeaders } });
    }
    const auth = request.cookies.get("admin_auth");
    if (!auth || auth.value !== process.env.ADMIN_SECRET) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // i18n middleware for all other routes
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/admin/:path*", "/((?!_next|studio|api|.*\\..*).*)"],
};
