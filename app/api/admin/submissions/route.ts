import { NextRequest } from "next/server";
import { ok, errors, requireAdmin } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/server";
import { formatDuration } from "@/lib/validation/upload";

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
    const formattedSubmissions = submissions.map((sub: any) => ({
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
      tracks: sub.tracks.map((t: any) => ({
        id: t.id,
        title: t.title,
        genre: t.genre,
        bpm: t.bpm?.toString(),
        key: t.key,
        storagePath: t.storage_path,
        duration: formatDuration(t.duration_seconds),
      })),
      rating: sub.review?.[0]?.rating,
      internalNotes: sub.review?.[0]?.internal_notes,
      feedback: sub.review?.[0]?.artist_feedback,
    }));

    return ok(formattedSubmissions);
  } catch (err) {
    console.error("Error in GET /api/admin/submissions:", err);
    return errors.internal("An unexpected error occurred");
  }
}
