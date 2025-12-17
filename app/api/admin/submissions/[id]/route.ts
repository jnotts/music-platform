import { NextRequest } from "next/server";
import { ok, errors, requireAdmin } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/server";

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/admin/submissions/[id]
 * Get a single submission with artist, tracks, and review.
 * Admin-only endpoint.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // Check admin auth
  const authResult = await requireAdmin();
  if (!authResult.ok) {
    return authResult.error.code === "UNAUTHORIZED"
      ? errors.unauthorized()
      : errors.forbidden();
  }

  try {
    const adminClient = createAdminClient();

    // Get submission with artist, tracks, and review
    const { data: submission, error } = await adminClient
      .from("submissions")
      .select(
        `
        *,
        artist:artists(*),
        tracks(*),
        review:reviews(*)
      `,
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return errors.notFound("Submission");
      }
      console.error("Error fetching submission:", error);
      return errors.internal("Failed to fetch submission");
    }

    // reviews returns an array due to many-to-one, take first
    const formattedSubmission = {
      ...submission,
      review: Array.isArray(submission.review)
        ? submission.review[0] || null
        : submission.review,
    };

    return ok(formattedSubmission);
  } catch (err) {
    console.error("Error in GET /api/admin/submissions/[id]:", err);
    return errors.internal("An unexpected error occurred");
  }
}

/**
 * PATCH /api/admin/submissions/[id]
 * Update submission status (for quick toggles only).
 * For approve/reject with review, use PUT /api/admin/reviews/[submissionId] instead.
 * Admin-only endpoint.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // Check admin auth
  const authResult = await requireAdmin();
  if (!authResult.ok) {
    return authResult.error.code === "UNAUTHORIZED"
      ? errors.unauthorized()
      : errors.forbidden();
  }

  try {
    const body = await request.json();
    const { status } = body;

    const adminClient = createAdminClient();

    // Update submission status
    if (status) {
      const { error: statusError } = await adminClient
        .from("submissions")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (statusError) {
        console.error("Error updating status:", statusError);
        return errors.internal("Failed to update status");
      }
    }

    return ok({ success: true });
  } catch (err) {
    console.error("Error in PATCH /api/admin/submissions/[id]:", err);
    return errors.internal("An unexpected error occurred");
  }
}
