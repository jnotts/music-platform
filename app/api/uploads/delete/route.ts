import { NextRequest } from "next/server";
import { ok, errors } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * DELETE /api/uploads/delete
 * Delete a file from storage (for cleanup when user removes uploads)
 * This is a public endpoint - called when user removes files before submission
 *
 * SECURITY: Only allows deletion of files NOT in the database
 * (i.e., unsubmitted/abandoned uploads). Submitted tracks are protected.
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { storagePath } = body;

    if (!storagePath || typeof storagePath !== "string") {
      return errors.badRequest("storagePath is required");
    }

    const adminClient = createAdminClient();

    // SECURITY CHECK: Prevent deletion of submitted tracks
    // Check if this storage path exists in the database
    const { data: existingTrack } = await adminClient
      .from("tracks")
      .select("storage_path")
      .eq("storage_path", storagePath)
      .maybeSingle();

    if (existingTrack) {
      console.warn(`🚫 Attempted to delete submitted track: ${storagePath}`);
      return errors.forbidden();
    }

    // Delete from storage (only unsubmitted files)
    const { error } = await adminClient.storage
      .from("tracks")
      .remove([storagePath]);

    if (error) {
      console.error("Error deleting file from storage:", error);
      // Don't fail the request if file doesn't exist (might have already been deleted)
      if (error.message?.includes("not found")) {
        return ok({
          deleted: false,
          message: "File not found (may have already been deleted)",
        });
      }
      return errors.internal("Failed to delete file from storage");
    }

    console.log(`🗑️  Deleted file from storage: ${storagePath}`);
    return ok({ deleted: true, storagePath });
  } catch (err) {
    console.error("Error in DELETE /api/uploads/delete:", err);
    return errors.internal("An unexpected error occurred");
  }
}
