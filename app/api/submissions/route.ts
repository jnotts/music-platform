import { NextRequest } from "next/server";
import { ok, errors } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/server";
import { createSubmissionSchema } from "@/lib/schemas";

/**
 * POST /api/submissions
 * Create a new submission with artist info and tracks.
 * This is a public endpoint - no auth required.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const parseResult = createSubmissionSchema.safeParse(body);
    if (!parseResult.success) {
      return errors.validation(parseResult.error.format());
    }

    const { artist, tracks } = parseResult.data;
    const adminClient = createAdminClient();

    // Create artist record
    const { data: artistData, error: artistError } = await adminClient
      .from("artists")
      .insert({
        name: artist.name,
        email: artist.email,
        phone: artist.phone || null,
        bio: artist.bio || null,
        instagram_url: artist.instagram_url || null,
        soundcloud_url: artist.soundcloud_url || null,
        spotify_url: artist.spotify_url || null,
      })
      .select()
      .single();

    if (artistError) {
      console.error("Error creating artist:", artistError);
      return errors.internal("Failed to create artist record");
    }

    // Create submission record
    const { data: submissionData, error: submissionError } = await adminClient
      .from("submissions")
      .insert({
        artist_id: artistData.id,
        status: "pending",
      })
      .select()
      .single();

    if (submissionError) {
      console.error("Error creating submission:", submissionError);
      return errors.internal("Failed to create submission record");
    }

    // Create track records
    const trackInserts = tracks.map((track) => ({
      submission_id: submissionData.id,
      storage_path: track.storage_path,
      filename: track.filename || null,
      mime_type: track.mime_type || null,
      size_bytes: track.size_bytes || null,
      title: track.title,
      genre: track.genre || null,
      bpm: track.bpm || null,
      key: track.key || null,
      description: track.description || null,
    }));

    const { data: tracksData, error: tracksError } = await adminClient
      .from("tracks")
      .insert(trackInserts)
      .select();

    if (tracksError) {
      console.error("Error creating tracks:", tracksError);
      return errors.internal("Failed to create track records");
    }

    // TODO: Send confirmation email
    // TODO: Broadcast realtime event for new submission

    return ok(
      {
        submission_id: submissionData.id,
        artist_id: artistData.id,
        tracks_count: tracksData.length,
      },
      201
    );
  } catch (err) {
    console.error("Error in POST /api/submissions:", err);
    return errors.internal("An unexpected error occurred");
  }
}
