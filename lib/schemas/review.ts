import { z } from "zod/v4";

/**
 * Schema for creating/updating a review (PUT /api/admin/reviews/[submissionId]).
 */
export const reviewSchema = z.object({
  grade: z.number().int().min(1).max(10).nullable().optional(),
  internal_notes: z.string().nullable().optional(),
  feedback_for_artist: z.string().nullable().optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
