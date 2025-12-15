import { NextRequest } from "next/server";
import { ok, errors } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/server";
import { signUploadSchema } from "@/lib/schemas";
import { UPLOAD_CONFIG } from "@/lib/validation/upload";

/**
 * POST /api/uploads/sign
 * Generate a signed URL for direct-to-storage uploads.
 * This is a public endpoint - no auth required (artists upload before having an account).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const parseResult = signUploadSchema.safeParse(body);
    if (!parseResult.success) {
      return errors.validation(parseResult.error.format());
    }

    const { filename, contentType, sizeBytes } = parseResult.data;

    // Validate content type
    if (!UPLOAD_CONFIG.allowedMimeTypes.includes(contentType)) {
      return errors.badRequest(
        `Invalid file type. Allowed: ${UPLOAD_CONFIG.allowedExtensions.join(
          ", "
        )}`
      );
    }

    // Validate file extension
    const ext = filename.split(".").pop()?.toLowerCase();
    if (!ext || !UPLOAD_CONFIG.allowedExtensions.includes(`.${ext}`)) {
      return errors.badRequest(
        `Invalid file extension. Allowed: ${UPLOAD_CONFIG.allowedExtensions.join(
          ", "
        )}`
      );
    }

    // Generate unique storage path
    const uniqueId = crypto.randomUUID();
    const storagePath = `submissions/${uniqueId}.${ext}`;

    const adminClient = createAdminClient();

    // Create signed upload URL
    const { data, error } = await adminClient.storage
      .from("tracks")
      .createSignedUploadUrl(storagePath);

    if (error) {
      console.error("Error creating signed URL:", error);
      return errors.internal("Failed to create upload URL");
    }

    return ok({
      signedUrl: data.signedUrl,
      storagePath: storagePath,
      token: data.token,
    });
  } catch (err) {
    console.error("Error in POST /api/uploads/sign:", err);
    return errors.internal("An unexpected error occurred");
  }
}
