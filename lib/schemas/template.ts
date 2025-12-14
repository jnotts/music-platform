import { z } from "zod/v4";

/**
 * Schema for updating an email template (PUT /api/admin/templates/[key]).
 */
export const templateSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  html: z.string().min(1, "HTML content is required"),
});

export type TemplateInput = z.infer<typeof templateSchema>;
