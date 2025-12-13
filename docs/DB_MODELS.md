# DB Models (MVP)

## Relationships

- artists 1 → many submissions
- submissions 1 → many tracks
- submissions 1 → 1 review (upsert)
- email_templates standalone (keyed)
- admins maps auth.users → admin access

---

## artists

- id (uuid, pk)
- name (text, required)
- email (text, required, indexed)
- phone (text, optional)
- bio (text, optional)
- instagram_url (text, optional)
- soundcloud_url (text, optional)
- spotify_url (text, optional)
- created_at (timestamptz, default now)

---

## submissions

- id (uuid, pk)
- artist_id (uuid, fk → artists.id, required, indexed)
- status (text, required; enum-like: `pending|in_review|approved|rejected`, indexed)
- created_at (timestamptz, default now, indexed)
- updated_at (timestamptz, default now)

---

## tracks

- id (uuid, pk)
- submission_id (uuid, fk → submissions.id, required, indexed)
- storage_path (text, required) # Supabase Storage key/path
- filename (text, optional)
- mime_type (text, optional)
- size_bytes (bigint, optional)
- title (text, optional)
- genre (text, optional)
- bpm (int, optional)
- key (text, optional)
- description (text, optional)
- duration_seconds (int, optional) # filled by bg processing
- created_at (timestamptz, default now)

---

## reviews

- id (uuid, pk)
- submission_id (uuid, fk → submissions.id, required, unique)
- grade (int, optional; 1–10)
- internal_notes (text, optional)
- feedback_for_artist (text, optional)
- updated_at (timestamptz, default now)

---

## email_templates

- key (text, pk) # `confirmation|approved|rejected`
- subject (text, required)
- html (text, required)
- updated_at (timestamptz, default now)

---

## admins

- user_id (uuid, pk, fk → auth.users.id) # admin allowlist
- created_at (timestamptz, default now)

---

## Minimal indexes

- artists(email)
- submissions(status), submissions(created_at), submissions(artist_id)
- tracks(submission_id)
- reviews(submission_id)
