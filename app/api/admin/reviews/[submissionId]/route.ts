import { NextRequest } from "next/server";
import { ok, errors, requireAdmin } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/server";
import { reviewSchema } from "@/lib/schemas";

type RouteParams = {
  params: Promise<{ submissionId: string }>;
};

/**
 * PUT /api/admin/reviews/[submissionId]
 * Create or update a review for a submission.
 * Admin-only endpoint.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { submissionId } = await params;

  // Check admin auth
  const authResult = await requireAdmin();
  if (!authResult.ok) {
    return authResult.error.code === "UNAUTHORIZED"
      ? errors.unauthorized()
      : errors.forbidden();
  }

  try {
    const body = await request.json();

    // Validate request body
    const parseResult = reviewSchema.safeParse(body);
    if (!parseResult.success) {
      return errors.validation(parseResult.error.format());
    }

    const { grade, internal_notes, feedback_for_artist } = parseResult.data;
    const adminClient = createAdminClient();

    // Check if submission exists
    const { data: submission, error: subError } = await adminClient
      .from("submissions")
      .select("id")
      .eq("id", submissionId)
      .single();

    if (subError || !submission) {
      return errors.notFound("Submission");
    }

    // Upsert review (insert or update based on submission_id)
    const { data: review, error } = await adminClient
      .from("reviews")
      .upsert(
        {
          submission_id: submissionId,
          grade: grade ?? null,
          internal_notes: internal_notes ?? null,
          feedback_for_artist: feedback_for_artist ?? null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "submission_id",
        },
      )
      .select()
      .single();

    if (error) {
      console.error("Error upserting review:", error);
      return errors.internal("Failed to save review");
    }

    return ok(review);
  } catch (err) {
    console.error("Error in PUT /api/admin/reviews/[submissionId]:", err);
    return errors.internal("An unexpected error occurred");
  }
}
