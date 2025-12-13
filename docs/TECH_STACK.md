# Tech Stack

## Frontend

- Next.js (React) + TypeScript
- Tailwind CSS
- TanStack Query (API data fetching/cache)
- React Hook Form + Zod (forms + validation)

## Backend (REST)

- Next.js Route Handlers (`/api/*`) as a RESTful API layer
- Zod (request validation)
- Consistent JSON response + error format

## Data / Auth / Realtime

- Supabase Postgres (database)
- Supabase Auth (admin authentication)
- Supabase Realtime (WebSocket subscriptions for admin updates)

## File Uploads + Storage

- Supabase Storage
- tus resumable uploads (progress + retry)

## Audio

- Streaming via signed Storage URLs
- WaveSurfer.js for waveform visualization + playback

## Email

- Resend (transactional email)
- HTML templates stored in DB, editable in admin (TipTap editor)
- Template variables like `{{artist_name}}`

## Background Processing

- Supabase Edge Functions (metadata extraction after upload, e.g. duration)

## Deployment

- Vercel (single code deployment for Next.js)
- Supabase project (managed backend services)
