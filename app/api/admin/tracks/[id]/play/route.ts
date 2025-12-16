import { NextRequest } from "next/server";
import { ok, errors, requireAdmin } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Check admin auth
  const authResult = await requireAdmin();
  if (!authResult.ok) {
    if (process.env.NODE_ENV !== "development") {
      return authResult.error.code === "UNAUTHORIZED"
        ? errors.unauthorized()
        : errors.forbidden();
    }
  }

  const { id } = await params;

  if (!id) {
    return errors.badRequest("Track ID is required");
  }

  try {
    const adminClient = createAdminClient();

    // 1. Get track to find storage path
    const { data: track, error: trackError } = await adminClient
      .from("tracks")
      .select("storage_path")
      .eq("id", id)
      .single();

    if (trackError || !track) {
      console.error("Error fetching track:", trackError);
      return errors.notFound("Track not found");
    }

    console.log("Signing URL for path:", track.storage_path);

    // 2. Sign URL
    const { data: signedUrlData, error: signError } = await adminClient.storage
      .from("tracks")
      .createSignedUrl(track.storage_path, 60 * 60); // 1 hour expiry

    if (signError || !signedUrlData) {
      console.error(
        "Error signing URL:",
        signError,
        "Path:",
        track.storage_path,
      );

      // Handle missing file specifically
      if (
        // @ts-expect-error - Supabase error types are sometimes incomplete and statusCode is missing
        signError?.statusCode === "404" ||
        signError?.message?.includes("Object not found")
      ) {
        return errors.notFound("Audio file not found in storage");
      }

      return errors.internal("Failed to sign URL");
    }

    return ok({ url: signedUrlData.signedUrl });
  } catch (err) {
    console.error("Error in GET /api/admin/tracks/[id]/play:", err);
    return errors.internal("An unexpected error occurred");
  }
}
