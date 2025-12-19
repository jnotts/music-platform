/**
 * Client-side API functions for data fetching
 */

import type { CreateSubmissionInput } from "@/lib/schemas/submission";
import type { SignUploadResponse } from "@/lib/schemas/upload";

export interface SubmitDemoResponse {
  submission_id: string;
  artist_id: string;
  tracks_count: number;
}

/**
 * Submit a new demo with artist info and tracks
 */
export async function submitDemo(
  payload: CreateSubmissionInput,
): Promise<SubmitDemoResponse> {
  const response = await fetch("/api/submissions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!result.ok) {
    throw new Error(result.error?.message || "Failed to submit demo");
  }

  return result.data;
}
import type {
  AdminSubmission,
  SubmissionStatus,
} from "@/lib/types/admin-submission";

/**
 * Fetch all submissions for admin dashboard
 */
export async function getAdminSubmissions(): Promise<AdminSubmission[]> {
  const response = await fetch("/api/admin/submissions");
  const result = await response.json();

  if (!result.ok) {
    throw new Error(result.error?.message || "Failed to fetch submissions");
  }

  return result.data;
}

/**
 * Update submission review details (status, rating, notes)
 */
import { ReviewInput } from "@/lib/schemas/review";

/**
 * Update submission status only
 */
export async function updateSubmissionStatus(
  id: string,
  status: SubmissionStatus,
): Promise<void> {
  const response = await fetch(`/api/admin/submissions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  const result = await response.json();

  if (!result.ok) {
    throw new Error(result.error?.message || "Failed to update status");
  }
}

/**
 * Save (upsert) review details
 * Optionally update submission status and send email
 */
export async function saveReview(
  submissionId: string,
  data: ReviewInput & { status: SubmissionStatus },
): Promise<void> {
  const response = await fetch(`/api/admin/reviews/${submissionId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!result.ok) {
    throw new Error(result.error?.message || "Failed to save review");
  }
}

/**
 * Fetch a specific review by submission ID
 */
export async function getReview(
  submissionId: string,
): Promise<ReviewInput | null> {
  const response = await fetch(`/api/admin/reviews/${submissionId}`);
  const result = await response.json();

  if (!result.ok) {
    throw new Error(result.error?.message || "Failed to fetch review");
  }

  return result.data;
}

interface PlaybackResponse {
  url: string;
}

/**
 * Get a signed URL for a track
 */
export async function getTrackUrl(trackId: string): Promise<string> {
  const response = await fetch(`/api/admin/tracks/${trackId}/play`);
  if (!response.ok) {
    throw new Error("Failed to get track URL");
  }
  const data = (await response.json()) as { data: PlaybackResponse };
  return data.data.url;
}

/**
 * Get a signed URL for file upload
 */
export async function getSignedUploadUrl(
  filename: string,
  contentType: string,
  sizeBytes: number,
  signal?: AbortSignal,
): Promise<SignUploadResponse> {
  const response = await fetch("/api/uploads/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename,
      contentType,
      sizeBytes,
    }),
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || "Failed to get upload URL");
  }

  const result = await response.json();

  if (!result.ok) {
    throw new Error(result.error?.message || "Failed to get upload URL");
  }

  return result.data;
}

/**
 * Delete an uploaded file
 */
export async function deleteUploadedFile(storagePath: string): Promise<void> {
  await fetch("/api/uploads/delete", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ storagePath }),
  });
}

import type { EmailTemplate } from "@/lib/types/db";
import type { TemplateInput } from "@/lib/schemas/template";

/**
 * Fetch all email templates
 */
export async function getTemplates(): Promise<EmailTemplate[]> {
  const response = await fetch("/api/admin/templates");
  const result = await response.json();

  if (!result.ok) {
    throw new Error(result.error?.message || "Failed to fetch templates");
  }

  return result.data;
}

/**
 * Fetch a single template by key
 */
export async function getTemplate(key: string): Promise<EmailTemplate> {
  const response = await fetch(`/api/admin/templates/${key}`);
  const result = await response.json();

  if (!result.ok) {
    throw new Error(result.error?.message || "Failed to fetch template");
  }

  return result.data;
}

/**
 * Update a template
 */
export async function updateTemplate(
  key: string,
  data: TemplateInput,
): Promise<EmailTemplate> {
  const response = await fetch(`/api/admin/templates/${key}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!result.ok) {
    throw new Error(result.error?.message || "Failed to update template");
  }

  return result.data;
}
