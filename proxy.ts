import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * Next.js Middleware for Supabase Auth.
 *
 * Runs on every matched request to refresh auth tokens automatically.
 * This keeps user sessions fresh and prevents expired JWT issues.
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match request paths that need auth validation:
     * - All pages (/)
     * - API routes (/api)
     *
     * Explicitly exclude:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - Static assets (images, fonts, etc.)
     * - Webpack HMR and development files
     */
    "/((?!_next/static|_next/image|_next/webpack-hmr|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|eot|ico)$).*)",
  ],
};
