/**
 * Client-side API functions for data fetching
 */

import type { CreateSubmissionInput } from "@/lib/schemas/submission";

export interface SubmitDemoResponse {
  submission_id: string;
  artist_id: string;
  tracks_count: number;
}

/**
 * Submit a new demo with artist info and tracks
 */
export async function submitDemo(
  payload: CreateSubmissionInput
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
} from "@/types/admin-submission";

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
  status: SubmissionStatus
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
 */
export async function saveReview(
  submissionId: string,
  data: ReviewInput
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
