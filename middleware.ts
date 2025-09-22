// middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";




export default clerkMiddleware((auth, req: NextRequest) => {
  // Optional: custom logic before Clerk runs, e.g., logging
  // console.log("Middleware triggered for:", req.nextUrl.pathname);
});

export const config = {
  matcher: [
    // Protect all routes except static assets and Next.js internals
    "/((?!_next|.*\\..*).*)",
  ],
};
