import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";

/**
 * Create a Supabase client for browser/client-side usage.
 * Uses the public publishable key - safe to expose to the browser.
 */
export function createBrowserClient() {
  return createSupabaseBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
