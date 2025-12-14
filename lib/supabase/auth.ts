import { createServerClient } from "./server";

/**
 * Get the current session from cookies.
 * Returns null if no valid session exists.
 */
export async function getSession() {
  const supabase = await createServerClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error("Error getting session:", error.message);
    return null;
  }

  return session;
}

/**
 * Get the current authenticated user.
 * Returns null if no valid user session exists.
 */
export async function getUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Error getting user:", error.message);
    return null;
  }

  return user;
}
