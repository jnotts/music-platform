// @deno-types="https://esm.sh/v135/@supabase/supabase-js@2.39.0/dist/module/index.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { parseWebStream } from "npm:music-metadata";

// Handle unhandled rejections in background tasks (Supabase recommendation)
addEventListener("unhandledrejection", (ev) => {
  console.log("unhandledrejection", ev.reason);
  ev.preventDefault();
});

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: {
    id: string;
    storage_path: string;
    duration_seconds: number | null;
  };
  old_record: Record<string, unknown> | null;
}

Deno.serve(async (req) => {
  try {
    // Parse payload
    const payload: WebhookPayload = await req.json();

    console.log(`Processing track ${payload.record.id}`);

    // Guard: Skip if duration already set
    if (payload.record.duration_seconds !== null) {
      console.log(`Track ${payload.record.id} already has duration, skipping`);
      return new Response(
        JSON.stringify({ skipped: true, reason: "duration already set" }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    // Guard: Ensure storage_path exists
    if (!payload.record.storage_path) {
      console.error(`Track ${payload.record.id} has no storage_path`);
      return new Response(
        JSON.stringify({ error: "No storage_path provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Use waitUntil for background processing (Supabase pattern)
    const trackId = payload.record.id;
    const storagePath = payload.record.storage_path;

    const backgroundTask = (async () => {
      // Initialize Supabase client
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

      if (!supabaseUrl || !supabaseServiceRoleKey) {
        console.error("Missing Supabase credentials");
        return;
      }

      const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

      try {
        console.log(`Creating signed URL for: ${storagePath}`);

        // 1. Get Signed URL instead of downloading the whole file
        // We give it a short expiry since we're using it immediately
        const { data: signedUrlData, error: signedUrlError } =
          await supabase.storage
            .from("tracks")
            .createSignedUrl(storagePath, 60); // 60 seconds

        if (signedUrlError || !signedUrlData?.signedUrl) {
          throw new Error(
            `Failed to create signed URL: ${signedUrlError?.message}`,
          );
        }

        console.log(`Streaming file from URL...`);

        // 2. Fetch the stream
        const response = await fetch(signedUrlData.signedUrl);
        if (!response.body) {
          throw new Error("Failed to fetch file stream");
        }

        // 3. Extract metadata from stream
        // We pass file info to help music-metadata (crucial for WAV/FLAC duration)
        const contentType = response.headers.get("content-type") || undefined;
        const contentLength = response.headers.get("content-length");
        const size = contentLength ? parseInt(contentLength, 10) : undefined;

        console.log(`Stream info - Type: ${contentType}, Size: ${size} bytes`);

        // parseWebStream reads only what it needs
        const metadata = await parseWebStream(response.body, {
          mimeType: contentType,
          size: size,
        });

        // Important: Cancel the stream if it's not fully consumed to save resources
        // fast-forward / cancel rest of stream
        try {
          await response.body.cancel();
        } catch {}

        let duration = metadata.format.duration;

        // Fallback calculations if needed (re-using logic but mapped to new metadata object)
        if (!duration || duration <= 0) {
          const format = metadata.format;
          // If we have size (from header), we can try to calculate
          if (
            size &&
            format.sampleRate &&
            format.numberOfChannels &&
            format.bitsPerSample
          ) {
            const bytesPerSample = format.bitsPerSample / 8;
            const bytesPerSecond =
              format.sampleRate * format.numberOfChannels * bytesPerSample;
            duration = size / bytesPerSecond;
            console.log(`Calculated from stream info: ${duration}s`);
          } else if (size && format.bitrate) {
            duration = size / (format.bitrate / 8);
            console.log(`Calculated from bitrate: ${duration}s`);
          }
        }

        if (!duration || duration <= 0) {
          throw new Error("Could not determine duration from stream");
        }

        const durationSeconds = Math.round(duration);
        console.log(`Extracted duration: ${durationSeconds} seconds`);

        // 4. Update track record
        const { error: updateError } = await supabase
          .from("tracks")
          .update({ duration_seconds: durationSeconds })
          .eq("id", trackId);

        if (updateError) {
          throw new Error(`Database update failed: ${updateError.message}`);
        }

        console.log(
          `Successfully updated track ${trackId} with duration ${durationSeconds}s`,
        );
      } catch (error) {
        console.error(
          `Failed to extract duration for track ${trackId} (${storagePath}):`,
          error instanceof Error ? error.message : error,
        );
      }
    })();

    // Run background task without blocking response
    EdgeRuntime.waitUntil(backgroundTask);

    // Return immediately
    return new Response(
      JSON.stringify({
        accepted: true,
        track_id: payload.record.id,
        message: "Processing in background",
      }),
      { status: 202, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Edge Function Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
