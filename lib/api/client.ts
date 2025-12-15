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
