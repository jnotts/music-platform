import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function main() {
  console.log("Fetching last 5 tracks...");
  const { data: tracks, error } = await supabase
    .from("tracks")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching tracks:", error);
    return;
  }

  if (!tracks || tracks.length === 0) {
    console.log("No tracks found.");
    return;
  }

  for (const track of tracks) {
    console.log(`\nChecking Track: ${track.id}`);
    console.log(`Storage Path: ${track.storage_path}`);

    console.log("Attempting to sign URL...");
    const { data: signedData, error: signError } = await supabase.storage
      .from("tracks")
      .createSignedUrl(track.storage_path, 60);

    if (signError) {
      console.error("Sign Error:", signError.message);
    } else {
      console.log("Success! Signed URL:", signedData?.signedUrl);
    }
  }
}
main();
