import { createResendClient } from "@/lib/email/client";
import { createAdminClient } from "@/lib/supabase/server";

export interface EmailVariables {
  artist_name: string;
  artist_email?: string;
  submission_id?: string;
  track_titles?: string;
  tracks_count?: number;
  status?: string;
  feedback?: string;
  grade?: number;
  [key: string]: string | number | undefined;
}

/**
 * Replace template variables like {{artist_name}} with actual values
 */
function replaceVariables(template: string, variables: EmailVariables): string {
  let result = template;

  for (const [key, value] of Object.entries(variables)) {
    if (value !== undefined && value !== null) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      result = result.replace(regex, String(value));
    }
  }

  return result;
}

/**
 * Fetch template from database by key
 */
async function getTemplate(key: "confirmation" | "approved" | "rejected") {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("email_templates")
    .select("subject, html")
    .eq("key", key)
    .single();

  if (error || !data) {
    throw new Error(`Email template "${key}" not found`);
  }

  return data;
}

/**
 * Send an email using a template from the database
 */
export async function sendTemplatedEmail(
  templateKey: "confirmation" | "approved" | "rejected",
  to: string,
  variables: EmailVariables,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const resend = createResendClient();
    const template = await getTemplate(templateKey);

    const subject = replaceVariables(template.subject, variables);
    const html = replaceVariables(template.html, variables);

    const result = await resend.emails.send({
      from: "MeloTech Records <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    if (result.error) {
      console.error("Resend API error:", result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error("Email sending failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send confirmation email after submission
 */
export async function sendConfirmationEmail(payload: {
  artistName: string;
  artistEmail: string;
  submissionId: string;
  trackTitles: string[];
}) {
  return sendTemplatedEmail("confirmation", payload.artistEmail, {
    artist_name: payload.artistName,
    artist_email: payload.artistEmail,
    submission_id: payload.submissionId.slice(0, 8), // Short ID
    track_titles: payload.trackTitles.join(", "),
    tracks_count: payload.trackTitles.length,
  });
}

/**
 * Send approval email
 */
export async function sendApprovalEmail(payload: {
  artistName: string;
  artistEmail: string;
  submissionId: string;
  grade?: number;
  feedback?: string;
}) {
  return sendTemplatedEmail("approved", payload.artistEmail, {
    artist_name: payload.artistName,
    submission_id: payload.submissionId.slice(0, 8),
    status: "Approved",
    grade: payload.grade,
    feedback: payload.feedback || "No feedback provided",
  });
}

/**
 * Send rejection email
 */
export async function sendRejectionEmail(payload: {
  artistName: string;
  artistEmail: string;
  submissionId: string;
  feedback?: string;
}) {
  return sendTemplatedEmail("rejected", payload.artistEmail, {
    artist_name: payload.artistName,
    submission_id: payload.submissionId.slice(0, 8),
    status: "Rejected",
    feedback: payload.feedback || "No feedback provided",
  });
}

/**
 * Preview an email without sending it
 */
export async function previewEmail(
  templateKey: "confirmation" | "approved" | "rejected",
  variables: EmailVariables,
): Promise<{ subject: string; html: string }> {
  const template = await getTemplate(templateKey);

  const subject = replaceVariables(template.subject, variables);
  const html = replaceVariables(template.html, variables);

  return { subject, html };
}
