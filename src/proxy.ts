import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextFetchEvent, NextRequest } from "next/server";

const isPublicRoute = createRouteMatcher(["/login(.*)", "/register(.*)", "/"]);

const clerk = clerkMiddleware(async (auth, request) => {
  // If Clerk key is not configured, bypass authentication check
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey || publishableKey.includes("replace_with")) {
    return;
  }

  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

// Named export for Next.js 16 proxy convention
export function proxy(request: NextRequest, event: NextFetchEvent) {
  return clerk(request, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
