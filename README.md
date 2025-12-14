# Music Demo Submission Platform

A polished web app where artists submit multiple demo tracks and admins review/manage submissions efficiently, with realtime updates, streaming playback, and automated emails.

## Tech Stack

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS
- **Backend:** Next.js Route Handlers (REST API)
- **Database:** Supabase Postgres
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **Realtime:** Supabase Realtime
- **Email:** Resend

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Supabase project with tables created (see Database Schema below)

### Installation

```bash
# Install dependencies
bun install
# or
npm install

# Run development server
bun dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key

# Server-only - NEVER expose to client
SUPABASE_SECRET_KEY=your-secret-key

# Email (Resend) - optional for now
# RESEND_API_KEY=your-resend-api-key
```

> ⚠️ **Security Note:** The `SUPABASE_SERVICE_ROLE_KEY` must never be exposed to the client. It is only used server-side in API routes.

## Database Schema

The platform uses the following tables in Supabase:

### artists

| Column         | Type        | Description                       |
| -------------- | ----------- | --------------------------------- |
| id             | uuid        | Primary key                       |
| name           | text        | Artist name                       |
| email          | text        | Contact email                     |
| phone          | text        | Phone number (optional)           |
| bio            | text        | Artist biography (optional)       |
| instagram_url  | text        | Instagram profile URL (optional)  |
| soundcloud_url | text        | SoundCloud profile URL (optional) |
| spotify_url    | text        | Spotify profile URL (optional)    |
| created_at     | timestamptz | Record creation time              |

### submissions

| Column     | Type        | Description                            |
| ---------- | ----------- | -------------------------------------- |
| id         | uuid        | Primary key                            |
| artist_id  | uuid        | Foreign key to artists                 |
| status     | text        | pending, in_review, approved, rejected |
| created_at | timestamptz | Record creation time                   |
| updated_at | timestamptz | Last update time                       |

### tracks

| Column           | Type        | Description                  |
| ---------------- | ----------- | ---------------------------- |
| id               | uuid        | Primary key                  |
| submission_id    | uuid        | Foreign key to submissions   |
| storage_path     | text        | Path to file in storage      |
| filename         | text        | Original filename            |
| mime_type        | text        | File MIME type               |
| size_bytes       | integer     | File size in bytes           |
| title            | text        | Track title                  |
| genre            | text        | Genre (optional)             |
| bpm              | integer     | Beats per minute (optional)  |
| key              | text        | Musical key (optional)       |
| description      | text        | Track description (optional) |
| duration_seconds | integer     | Track duration (optional)    |
| created_at       | timestamptz | Record creation time         |

### reviews

| Column              | Type        | Description                         |
| ------------------- | ----------- | ----------------------------------- |
| id                  | uuid        | Primary key                         |
| submission_id       | uuid        | Foreign key to submissions (unique) |
| grade               | integer     | Grade 1-10 (optional)               |
| internal_notes      | text        | Internal notes (optional)           |
| feedback_for_artist | text        | Feedback for artist (optional)      |
| updated_at          | timestamptz | Last update time                    |

### email_templates

| Column     | Type        | Description                                    |
| ---------- | ----------- | ---------------------------------------------- |
| key        | text        | Primary key (confirmation, approved, rejected) |
| subject    | text        | Email subject line                             |
| html       | text        | HTML email content                             |
| updated_at | timestamptz | Last update time                               |

### admins

| Column     | Type        | Description                            |
| ---------- | ----------- | -------------------------------------- |
| user_id    | uuid        | Primary key, references auth.users(id) |
| created_at | timestamptz | Record creation time                   |

## API Endpoints

### Public

- `POST /api/submissions` - Create a new submission (artist + tracks)

### Admin (requires authentication)

- `GET /api/admin/submissions` - List submissions (filters: status, search)
- `GET /api/admin/submissions/[id]` - Get submission details
- `PATCH /api/admin/submissions/[id]` - Update submission status
- `PUT /api/admin/reviews/[submissionId]` - Upsert review
- `GET /api/admin/templates` - List email templates
- `GET /api/admin/templates/[key]` - Get template by key
- `PUT /api/admin/templates/[key]` - Update template

## Test Credentials

- **Admin Email:** admin@yourlabel.com
- **Password:** admin123

## Smoke Test

Visit `/admin/api-test` to test the API wiring. This page calls the admin submissions endpoint and displays the response.

## API Example Requests

### `POST /api/submissions` — Create submission (public)

```bash
curl -X POST http://localhost:3000/api/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "artist": {
      "name": "Alex Chen",
      "email": "alex.chen@email.com",
      "phone": "+1234567890",
      "bio": "Electronic music producer from LA",
      "instagram_url": "https://instagram.com/alexchen",
      "soundcloud_url": "https://soundcloud.com/alexchen",
      "spotify_url": ""
    },
    "tracks": [
      {
        "storage_path": "submissions/abc123/track1.mp3",
        "filename": "midnight_pulse.mp3",
        "mime_type": "audio/mpeg",
        "size_bytes": 5242880,
        "title": "Midnight Pulse",
        "genre": "Electronic",
        "bpm": 128,
        "key": "C minor",
        "description": "Dark techno vibes"
      }
    ]
  }'
```

### `GET /api/admin/submissions` — List with filters

```bash
# Basic list
curl http://localhost:3000/api/admin/submissions

# With filters
curl "http://localhost:3000/api/admin/submissions?status=pending&search=alex&limit=10&offset=0"
```

### `GET /api/admin/submissions/[id]` — Get detail

```bash
curl http://localhost:3000/api/admin/submissions/UUID_HERE
```

### `PATCH /api/admin/submissions/[id]` — Update status

```bash
curl -X PATCH http://localhost:3000/api/admin/submissions/UUID_HERE \
  -H "Content-Type: application/json" \
  -d '{"status": "in_review"}'
```

### `PUT /api/admin/reviews/[submissionId]` — Upsert review

```bash
curl -X PUT http://localhost:3000/api/admin/reviews/UUID_HERE \
  -H "Content-Type: application/json" \
  -d '{
    "grade": 8,
    "internal_notes": "Strong production quality",
    "feedback_for_artist": "Great work on the production!"
  }'
```

### `GET /api/admin/templates` — List all templates

```bash
curl http://localhost:3000/api/admin/templates
```

### `PUT /api/admin/templates/[key]` — Update template

```bash
curl -X PUT http://localhost:3000/api/admin/templates/confirmation \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Thanks for your submission, {{artist_name}}!",
    "html": "<h1>Thank you!</h1><p>Hi {{artist_name}}, we received your demo.</p>"
  }'
```

> **Note:** Admin endpoints require auth. They will return `401 UNAUTHORIZED` without a valid session cookie.
