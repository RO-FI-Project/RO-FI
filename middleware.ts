import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const host = req.headers.get("host") ?? "";
  const url = req.nextUrl.clone();

  const isAuthPath = url.pathname.startsWith("/sign-in") || url.pathname.startsWith("/sign-up");

  if (host.startsWith("admin.") && !url.pathname.startsWith("/admin") && !isAuthPath) {
    url.pathname = url.pathname === "/" ? "/admin" : `/admin${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  if (isAdminRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
