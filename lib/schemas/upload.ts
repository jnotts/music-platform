import { z } from "zod/v4";
import { UPLOAD_CONFIG } from "@/lib/validation/upload";

/**
 * Schema for requesting a signed upload URL
 */
export const signUploadSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  contentType: z.string().min(1, "Content type is required"),
  sizeBytes: z
    .number()
    .int()
    .positive("File size must be positive")
    .max(
      UPLOAD_CONFIG.maxFileSizeBytes,
      `File size must be less than ${UPLOAD_CONFIG.maxFileSizeMB}MB`,
    ),
});

export type SignUploadInput = z.infer<typeof signUploadSchema>;

export interface SignUploadResponse {
  signedUrl: string;
  storagePath: string;
  token: string;
}
