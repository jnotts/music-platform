import { NextRequest } from "next/server";
import { ok, errors, requireAdmin } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/server";
import { formatDuration } from "@/lib/validation/upload";
import { SubmissionWithArtistAndTracks, Track } from "@/lib/types/db";

/**
 * GET /api/admin/submissions
 * Get all submissions (Admin Only).
 */
export async function GET(request: NextRequest) {
  // Check admin auth
  const authResult = await requireAdmin();
  if (!authResult.ok) {
    if (process.env.NODE_ENV !== "development") {
      return authResult.error.code === "UNAUTHORIZED"
        ? errors.unauthorized()
        : errors.forbidden();
    }
  }

  try {
    const adminClient = createAdminClient();

    const { data: submissions, error } = await adminClient
      .from("submissions")
      .select(
        `
        *,
        artist:artists(*),
        tracks(*),
        review:reviews(*)
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching submissions:", error);
      return errors.internal("Failed to fetch submissions");
    }

    // Transform to AdminSubmission type
    const formattedSubmissions = submissions.map(
      (sub: SubmissionWithArtistAndTracks) => ({
        id: sub.id,
        artist: {
          name: sub.artist.name,
          email: sub.artist.email,
          bio: sub.artist.bio || "",
          socials: {
            instagram: sub.artist.instagram_url || undefined,
            soundcloud: sub.artist.soundcloud_url || undefined,
            spotify: sub.artist.spotify_url || undefined,
          },
        },
        status: sub.status,
        submittedAt: sub.created_at,
        tracks: sub.tracks.map((t: Track) => ({
          id: t.id,
          title: t.title || "Untitled", // Fallback for strict alignment
          genre: t.genre || undefined,
          bpm: t.bpm?.toString(),
          key: t.key || undefined,
          storagePath: t.storage_path,
          duration: formatDuration(t.duration_seconds),
          description: t.description || undefined,
        })),
        rating: sub.review?.grade || undefined,
        internalNotes: sub.review?.internal_notes || undefined,
        feedback: sub.review?.feedback_for_artist || undefined,
      }),
    );

    return ok(formattedSubmissions);
  } catch (err) {
    console.error("Error in GET /api/admin/submissions:", err);
    return errors.internal("An unexpected error occurred");
  }
}
