import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC = new Set(["/login", "/auth/from-admin"]);

function safeInternalPath(next: string | null): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authed = request.cookies.get("is_auth")?.value === "1";

  if (PUBLIC.has(pathname)) {
    if (authed && pathname === "/login") {
      const rawNext = request.nextUrl.searchParams.get("next");
      const dest = safeInternalPath(rawNext) ?? "/";
      return NextResponse.redirect(new URL(dest, request.url));
    }
    return NextResponse.next();
  }

  if (!authed) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
