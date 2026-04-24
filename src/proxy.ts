import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { defaultLocale, isLocale } from "@/i18n/config";

function pathnameHasLocale(pathname: string): boolean {
  const segment = pathname.split("/")[1];
  return segment !== undefined && isLocale(segment);
}

/**
 * Locale: every page lives under `/ru/...` or `/en/...` (default redirect to `ru`).
 * Supabase: refresh auth cookies on navigations (except static assets / API handled first).
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    return updateSession(request);
  }

  if (!pathnameHasLocale(pathname)) {
    const url = request.nextUrl.clone();
    const suffix = pathname === "/" ? "" : pathname;
    url.pathname = `/${defaultLocale}${suffix}`;
    return NextResponse.redirect(url);
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
