import { z } from "zod/v4";
import type { SubmissionStatus } from "@/lib/types/db";

/**
 * Valid submission status values.
 */
export const submissionStatusValues: SubmissionStatus[] = [
  "pending",
  "in_review",
  "approved",
  "rejected",
];

/**
 * Schema for updating submission status (PATCH /api/admin/submissions/[id]).
 */
export const updateStatusSchema = z.object({
  status: z.enum(["pending", "in_review", "approved", "rejected"]),
});

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
