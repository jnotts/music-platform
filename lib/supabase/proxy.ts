import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Updates the user session by refreshing the auth token if needed.
 * This should be called in middleware to keep sessions fresh.
 *
 * - Validates and refreshes the JWT using getClaims()
 * - Writes refreshed tokens to both request and response cookies
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Set cookies on the request for downstream server code
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          // Create new response with updated request
          supabaseResponse = NextResponse.next({
            request,
          });
          // Set cookies on the response for the browser
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and getClaims()
  // A simple mistake could make your app insecure.

  // getClaims() validates and refreshes the JWT if needed
  // This is preferred over getUser() or getSession() in server code
  const { error } = await supabase.auth.getClaims();

  // If there's an error getting claims (e.g., user not logged in),
  // we still return the response - just without a valid session
  if (error) {
    // Optional: You could redirect to login here for protected routes
    // For now, we just continue and let the API routes handle auth
  }

  return supabaseResponse;
}
