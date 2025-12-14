import { ok, errors, requireAdmin } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * GET /api/admin/templates
 * List all email templates.
 * Admin-only endpoint.
 */
export async function GET() {
  // Check admin auth
  const authResult = await requireAdmin();
  if (!authResult.ok) {
    return authResult.error.code === "UNAUTHORIZED"
      ? errors.unauthorized()
      : errors.forbidden();
  }

  try {
    const adminClient = createAdminClient();

    const { data: templates, error } = await adminClient
      .from("email_templates")
      .select("*")
      .order("key");

    if (error) {
      console.error("Error fetching templates:", error);
      return errors.internal("Failed to fetch templates");
    }

    return ok(templates);
  } catch (err) {
    console.error("Error in GET /api/admin/templates:", err);
    return errors.internal("An unexpected error occurred");
  }
}
