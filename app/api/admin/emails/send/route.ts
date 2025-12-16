import { NextRequest } from "next/server";
import { z } from "zod";
import { ok, errors } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/requireAdmin";
import { createAdminClient } from "@/lib/supabase/server";
import {
  EmailVariables,
  previewEmail,
  sendApprovalEmail,
  sendRejectionEmail,
} from "@/lib/email/service";

const sendEmailSchema = z.object({
  submissionId: z.string().uuid(),
  type: z.enum(["approval", "rejection"]),
});

const previewEmailSchema = z.object({
  submissionId: z.string().uuid(),
  type: z.enum(["confirmation", "approval", "rejection"]),
});

type SubmissionWithRelations = {
  id: string;
  status: string;
  artist: {
    name: string;
    email: string;
  };
  review: {
    feedback_for_artist: string | null;
  } | null;
  tracks?: {
    title: string | null;
    filename: string | null;
  }[];
};

export async function POST(req: NextRequest) {
  // Check admin auth
  const authResult = await requireAdmin();
  if (!authResult.ok) {
    return authResult.error.code === "UNAUTHORIZED"
      ? errors.unauthorized()
      : errors.forbidden();
  }

  // Parse request body
  const body = await req.json();
  const parsed = sendEmailSchema.safeParse(body);

  if (!parsed.success) {
    return errors.validation(parsed.error);
  }

  const { submissionId, type } = parsed.data;

  try {
    const supabase = createAdminClient();

    // Fetch submission with artist and review
    const { data: submission, error } = await supabase
      .from("submissions")
      .select(
        `
        id,
        status,
        artist:artists(name, email),
        review:reviews(feedback_for_artist)
      `,
      )
      .eq("id", submissionId)
      .single();

    if (error || !submission) {
      return errors.notFound("Submission not found");
    }

    const typedSubmission = submission as unknown as SubmissionWithRelations;

    // Validate artist data
    if (!typedSubmission.artist?.email || !typedSubmission.artist?.name) {
      return errors.badRequest("Artist email or name missing");
    }

    // Send appropriate email
    let result;
    if (type === "approval") {
      result = await sendApprovalEmail({
        artistName: typedSubmission.artist.name,
        artistEmail: typedSubmission.artist.email,
        submissionId,
        feedback: typedSubmission.review?.feedback_for_artist ?? undefined,
      });
    } else {
      result = await sendRejectionEmail({
        artistName: typedSubmission.artist.name,
        artistEmail: typedSubmission.artist.email,
        submissionId,
        feedback: typedSubmission.review?.feedback_for_artist ?? undefined,
      });
    }

    if (!result.success) {
      return errors.internal("Failed to send email: " + result.error);
    }

    return ok({
      sent: true,
      messageId: result.messageId,
      recipient: typedSubmission.artist.email,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return errors.internal("Failed to send email");
  }
}

/**
 * GET /api/admin/emails/send?submissionId=xxx&type=confirmation|approval|rejection
 * Preview an email without sending it
 */
export async function GET(req: NextRequest) {
  // Check admin auth
  const authResult = await requireAdmin();
  if (!authResult.ok) {
    return authResult.error.code === "UNAUTHORIZED"
      ? errors.unauthorized()
      : errors.forbidden();
  }

  // Parse query params
  const { searchParams } = new URL(req.url);
  const submissionId = searchParams.get("submissionId");
  const type = searchParams.get("type");

  const parsed = previewEmailSchema.safeParse({ submissionId, type });

  if (!parsed.success) {
    return errors.validation(parsed.error);
  }

  const { submissionId: validatedId, type: emailType } = parsed.data;

  try {
    const supabase = createAdminClient();

    // Fetch submission with artist, tracks, and review
    const { data: submission, error } = await supabase
      .from("submissions")
      .select(
        `
        id,
        status,
        artist:artists(name, email),
        tracks(title, filename),
        review:reviews(feedback_for_artist)
      `,
      )
      .eq("id", validatedId)
      .single();

    if (error || !submission) {
      return errors.notFound("Submission not found");
    }

    const typedSubmission = submission as unknown as SubmissionWithRelations;

    // Validate artist data
    if (!typedSubmission.artist?.email || !typedSubmission.artist?.name) {
      return errors.badRequest("Artist email or name missing");
    }

    // Build email variables based on type
    const variables: EmailVariables = {
      artist_name: typedSubmission.artist.name,
      artist_email: typedSubmission.artist.email,
      submission_id: validatedId.slice(0, 8),
    };

    if (emailType === "confirmation") {
      if (!typedSubmission.tracks || typedSubmission.tracks.length === 0) {
        return errors.badRequest("Submission has no tracks");
      }
      variables.track_titles = typedSubmission.tracks
        .map((t) => t.title || t.filename || "Untitled")
        .join(", ");
      variables.tracks_count = typedSubmission.tracks.length;
    } else {
      // approval or rejection
      variables.status = emailType === "approval" ? "Approved" : "Rejected";
      variables.feedback =
        typedSubmission.review?.feedback_for_artist || "No feedback provided";
    }

    // Preview the email
    const preview = await previewEmail(
      emailType === "confirmation"
        ? "confirmation"
        : emailType === "approval"
          ? "approved"
          : "rejected",
      variables,
    );

    return ok({
      submissionId: validatedId,
      type: emailType,
      recipient: typedSubmission.artist.email,
      preview: {
        subject: preview.subject,
        html: preview.html,
      },
    });
  } catch (error) {
    console.error("Error previewing email:", error);
    return errors.internal("Failed to preview email");
  }
}
