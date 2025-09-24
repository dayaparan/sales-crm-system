import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { roleAccess } from "./lib/roleAccess";

const secret = process.env.NEXTAUTH_SECRET;

function isInRoleAccess(pathname) {
  return Object.values(roleAccess).some((rules) =>
    rules.some((rule) =>
      typeof rule === "string" ? pathname === rule : rule.test(pathname)
    )
  );
}

export async function middleware(req) {
  const token = await getToken({ req, secret });
  const { pathname } = req.nextUrl;

  // Always allow auth-related pages
  if (
    pathname.startsWith("/dashboard/login") ||
    pathname.startsWith("/dashboard/reset-password") ||
    pathname.startsWith("/dashboard/unauthorized")
  ) {
    return NextResponse.next();
  }

  // Not logged in → redirect
  if (!token) {
    return NextResponse.redirect(new URL("/dashboard/login", req.url));
  }

  const role = token.role;

  // Unknown role → unauthorized
  if (!role || !roleAccess[role]) {
    return NextResponse.redirect(new URL("/dashboard/unauthorized", req.url));
  }

  // If path is not in roleAccess at all → let Next.js handle (404)
  if (!isInRoleAccess(pathname)) {
    return NextResponse.next();
  }

  // Check if this role is allowed
  const allowedRoutes = roleAccess[role];
  const isAllowed = allowedRoutes.some((rule) =>
    typeof rule === "string" ? pathname === rule : rule.test(pathname)
  );

  if (!isAllowed) {
    return NextResponse.redirect(new URL("/dashboard/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
