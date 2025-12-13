// types for the supabase models

export type SubmissionStatus =
  | "pending"
  | "in_review"
  | "approved"
  | "rejected";
export type EmailTemplateKey = "confirmation" | "approved" | "rejected";

export type Artist = {
  id: string; // uuid
  name: string;
  email: string;
  phone: string | null;
  bio: string | null;
  instagram_url: string | null;
  soundcloud_url: string | null;
  spotify_url: string | null;
  created_at: string; // timestamptz ISO
};

export type Submission = {
  id: string; // uuid
  artist_id: string; // uuid
  status: SubmissionStatus;
  created_at: string; // timestamptz ISO
  updated_at: string; // timestamptz ISO
};

export type Track = {
  id: string; // uuid
  submission_id: string; // uuid
  storage_path: string;
  filename: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  title: string | null;
  genre: string | null;
  bpm: number | null;
  key: string | null;
  description: string | null;
  duration_seconds: number | null;
  created_at: string; // timestamptz ISO
};

export type Review = {
  id: string; // uuid
  submission_id: string; // uuid (unique)
  grade: number | null; // 1-10
  internal_notes: string | null;
  feedback_for_artist: string | null;
  updated_at: string; // timestamptz ISO
};

export type EmailTemplate = {
  key: EmailTemplateKey;
  subject: string;
  html: string;
  updated_at: string; // timestamptz ISO
};

export type Admin = {
  user_id: string; // uuid (auth.users.id)
  created_at: string; // timestamptz ISO
};

// Useful composite types for API responses
export type SubmissionWithArtistAndTracks = Submission & {
  artist: Artist;
  tracks: Track[];
  review: Review | null;
};
