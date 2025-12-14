/**
 * Realtime channel constants for Supabase Realtime subscriptions.
 * These will be used for broadcasting updates to the admin dashboard.
 */

/** Channel for broadcasting new submission events to admin dashboard */
export const SUBMISSIONS_CHANNEL = "submissions";

/** Event types for submissions channel */
export const SUBMISSION_EVENTS = {
  /** Fired when a new submission is created */
  NEW_SUBMISSION: "new_submission",
  /** Fired when submission status is updated */
  STATUS_UPDATED: "status_updated",
} as const;
