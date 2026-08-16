import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("telu_token")?.value;
  const userCookie = request.cookies.get("telu_user")?.value;

  const { pathname } = request.nextUrl;

  let user = null;
  if (userCookie) {
    try {
      user = JSON.parse(decodeURIComponent(userCookie));
    } catch (e) {
      // Handle parsing failure or non-URI encoded cookies
      try {
        user = JSON.parse(userCookie);
      } catch (err) {
        // Ignored
      }
    }
  }

  const isAuthRoute = pathname === "/auth" || (pathname.startsWith("/auth/") && pathname !== "/auth/setup-profile" && pathname !== "/auth/verify-email");
  const isCustomerRoute = pathname.startsWith("/customer");
  const isClientRoute = pathname.startsWith("/client");

  // Redirect to login if accessing a protected route without a token
  if ((isCustomerRoute || isClientRoute) && !token) {
    const url = new URL("/auth", request.url);
    return NextResponse.redirect(url);
  }

  // Enforce role-based access control and prevent returning to auth routes if logged in
  if (token && user) {
    if (isCustomerRoute && user.role !== "customer") {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
    if (isClientRoute && !user.role?.startsWith("client")) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
    if (isAuthRoute) {
      if (user.role === "customer") {
        return NextResponse.redirect(new URL("/customer/dashboard", request.url));
      } else {
        return NextResponse.redirect(new URL("/client/dashboard", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/customer/:path*", "/client/:path*", "/auth/:path*", "/auth"],
};
