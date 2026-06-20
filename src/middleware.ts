import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

export function middleware(request: NextRequest) {
  const response = intlMiddleware(request) ?? NextResponse.next();

  const locale = request.nextUrl.pathname.startsWith("/en") ? "en" : "de";
  response.headers.set("x-locale", locale);

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|studio|admin|.*\\..*).*)"],
};
