import { NextRequest } from "next/server";
import { ok, errors, requireAdmin } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/server";
import { reviewSchema } from "@/lib/schemas";
import { sendApprovalEmail, sendRejectionEmail } from "@/lib/email/service";

type RouteParams = {
  params: Promise<{ submissionId: string }>;
};

/**
 * GET /api/admin/reviews/[submissionId]
 * Fetch the review for a submission.
 * Admin-only endpoint.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { submissionId } = await params;

  // Check admin auth
  const authResult = await requireAdmin();
  if (!authResult.ok) {
    return authResult.error.code === "UNAUTHORIZED"
      ? errors.unauthorized()
      : errors.forbidden();
  }

  try {
    const adminClient = createAdminClient();

    const { data: review, error } = await adminClient
      .from("reviews")
      .select("*")
      .eq("submission_id", submissionId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Not found is okay, return null to indicate no review yet
        return ok(null);
      }
      console.error("Error fetching review:", error);
      return errors.internal("Failed to fetch review");
    }

    return ok(review);
  } catch (err) {
    console.error("Error in GET /api/admin/reviews/[submissionId]:", err);
    return errors.internal("An unexpected error occurred");
  }
}

/**
 * PUT /api/admin/reviews/[submissionId]
 * Create or update a review for a submission.
 * Optionally update submission status and send email.
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

    // Extract status separately (not part of review schema)
    const { status, ...reviewData } = body;

    // Validate review data
    const parseResult = reviewSchema.safeParse(reviewData);
    if (!parseResult.success) {
      return errors.validation(parseResult.error);
    }

    if (!status || !["approved", "rejected"].includes(status)) {
      return errors.validation("Review must approve or reject the submission");
    }

    const { grade, internal_notes, feedback_for_artist } = parseResult.data;
    const adminClient = createAdminClient();

    // 1. Upsert review (will fail naturally if submission doesn't exist due to FK constraint)
    const { data: review, error: reviewError } = await adminClient
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

    if (reviewError) {
      console.error("Error upserting review:", reviewError);
      // Foreign key violation means submission doesn't exist
      if (reviewError.code === "23503") {
        return errors.notFound("Submission");
      }
      return errors.internal("Failed to save review");
    }

    // 2. Update submission status AND get artist data in one call
    const { data: submissionWithArtist, error: statusError } = await adminClient
      .from("submissions")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", submissionId)
      .select("artist:artists(name, email)")
      .single();

    if (statusError) {
      console.error("Error updating status:", statusError);
      return errors.internal("Failed to update submission status");
    }

    // 3. Send email based on approved/rejected status

    if (submissionWithArtist?.artist) {
      const artist = Array.isArray(submissionWithArtist.artist)
        ? submissionWithArtist.artist[0]
        : submissionWithArtist.artist;

      if (artist?.name && artist?.email) {
        const emailFn =
          status === "approved" ? sendApprovalEmail : sendRejectionEmail;

        const emailResult = await emailFn({
          artistName: artist.name,
          artistEmail: artist.email,
          submissionId,
          feedback: feedback_for_artist || undefined,
          grade: grade ?? undefined,
        });

        if (!emailResult.success) {
          console.error("Failed to send email:", emailResult.error);
          // Don't fail the entire request if email fails
        }
      }
    }

    return ok(review);
  } catch (err) {
    console.error("Error in PUT /api/admin/reviews/[submissionId]:", err);
    return errors.internal("An unexpected error occurred");
  }
}
