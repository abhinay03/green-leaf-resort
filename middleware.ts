import { updateSession } from "@/lib/supabase/middleware"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match only admin routes that need authentication
     * This prevents middleware from running during static page generation
     */
    "/admin/:path*",
  ],
}
