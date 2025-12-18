import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Updates the user session by refreshing the auth token if needed.
 * This should be called in middleware to keep sessions fresh.
 *
 * - Validates and refreshes the JWT using getClaims()
 * - Writes refreshed tokens to both request and response cookies
 */
/**
 * Retry helper for transient network errors
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  baseDelay = 100,
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;
      const isNetworkError =
        error instanceof Error &&
        (error.message.includes("fetch failed") ||
          error.message.includes("SSL") ||
          error.message.includes("ECONNRESET"));

      if (isLastAttempt || !isNetworkError) {
        throw error;
      }

      // Exponential backoff: 100ms, 200ms
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Retry failed"); // Should never reach here
}

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

  try {
    // getClaims() validates and refreshes the JWT if needed
    // This is preferred over getUser() or getSession() in server code
    // Retry transient network errors to prevent intermittent failures
    await retryWithBackoff(() => supabase.auth.getClaims());
  } catch (error) {
    // Log SSL/network errors for debugging
    if (
      error instanceof Error &&
      (error.message.includes("SSL") || error.message.includes("fetch failed"))
    ) {
      console.error("[Auth Middleware] Network error during auth validation:", {
        message: error.message,
        path: request.nextUrl.pathname,
        // Only log the error type, not sensitive details
        errorType:
          error.cause && typeof error.cause === "object"
            ? (error.cause as { code?: unknown }).code
            : "unknown",
      });
    }
    // Continue anyway - downstream routes will handle auth as needed
    // This prevents the entire site from breaking on transient errors
  }

  return supabaseResponse;
}
