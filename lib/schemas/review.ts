import { z } from "zod/v4";

// Strict Review Table Schema
export const reviewSchema = z.object({
  grade: z.coerce.number().min(0).max(10).optional().nullable(),
  internal_notes: z.string().optional(),
  feedback_for_artist: z.string().optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
