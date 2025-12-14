import { getUser } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

type AdminCheckSuccess = {
  ok: true;
  user: User;
};

type AdminCheckError = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

export type AdminCheckResult = AdminCheckSuccess | AdminCheckError;

/**
 * Verify that the current request is from an authenticated admin user.
 *
 * 1. Checks for valid auth session
 * 2. Verifies user_id exists in public.admins table
 *
 * @returns { ok: true, user } on success, { ok: false, error } on failure
 */
export async function requireAdmin(): Promise<AdminCheckResult> {
  // Step 1: Get authenticated user from session
  const user = await getUser();

  if (!user) {
    return {
      ok: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required",
      },
    };
  }

  // Step 2: Check if user is in admins table using service role
  try {
    const adminClient = createAdminClient();

    const { data: admin, error: adminError } = await adminClient
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (adminError || !admin) {
      return {
        ok: false,
        error: {
          code: "FORBIDDEN",
          message: "Admin access required",
        },
      };
    }

    return {
      ok: true,
      user,
    };
  } catch (err) {
    console.error("Error checking admin status:", err);
    return {
      ok: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to verify admin status",
      },
    };
  }
}
