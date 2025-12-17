import { NextRequest } from "next/server";
import { ok, errors } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/server";
import { createSubmissionSchema } from "@/lib/schemas";
import { sendConfirmationEmail } from "@/lib/email/service";

/**
 * Trigger metadata extraction for a track (fire-and-forget)
 * Calls the Edge Function without blocking the response
 */
async function triggerMetadataExtraction(track: {
  id: string;
  storage_path: string;
  duration_seconds: number | null;
}) {
  // Skip if duration already exists
  if (track.duration_seconds !== null) {
    return;
  }

  const edgeFunctionUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/extract-audio-duration`
    : null;

  if (!edgeFunctionUrl) {
    console.warn(
      "Edge Function URL not configured, skipping metadata extraction",
    );
    return;
  }

  // Fire-and-forget: don't await this
  fetch(edgeFunctionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY}`,
    },
    body: JSON.stringify({
      type: "INSERT",
      table: "tracks",
      record: {
        id: track.id,
        storage_path: track.storage_path,
        duration_seconds: track.duration_seconds,
      },
      old_record: null,
    }),
  }).catch((error) => {
    console.error(`Edge Function call failed for track ${track.id}:`, error);
  });
}

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

    // Trigger background metadata extraction (fire-and-forget)
    tracksData.forEach((track) => {
      triggerMetadataExtraction(track).catch((err) => {
        console.error(
          `Failed to trigger metadata extraction for track ${track.id}:`,
          err,
        );
        // Don't fail the submission
      });
    });

    // Send confirmation email
    const emailResult = await sendConfirmationEmail({
      artistName: artistData.name,
      artistEmail: artistData.email,
      submissionId: submissionData.id,
      trackTitles: tracksData.map((t) => t.title || t.filename || "Untitled"),
    });

    if (!emailResult.success) {
      console.error("Failed to send confirmation email:", emailResult.error);
      // Continue anyway - don't fail the submission
    }

    // Broadcast realtime event for new submission
    const channel = adminClient.channel("admin-submissions");
    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.send({
          type: "broadcast",
          event: "new-submission",
          payload: { id: submissionData.id },
        });
        adminClient.removeChannel(channel);
      }
    });

    return ok(
      {
        submission_id: submissionData.id,
        artist_id: artistData.id,
        tracks_count: tracksData.length,
      },
      201,
    );
  } catch (err) {
    console.error("Error in POST /api/submissions:", err);
    return errors.internal("An unexpected error occurred");
  }
}
