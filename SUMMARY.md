# Music Demo Submission Platform - Technical Documentation

## Architectural Decisions

The platform is built with **`Next.js` (App Router)** as a unified full-stack solution, eliminating the need for separate frontend/backend deployments. The App Router's file-system routing provides an intuitive developer experience, though all pages use client-side rendering for interactive features (file uploads, real-time subscriptions, form state).

**Query Management**: TanStack Query handles all server response states (submissions, templates, reviews), providing automatic caching and real-time refetching. This eliminated the need for Redux/Zustand while `React Hook Form` with `Zod` manages client-side form validation with full type safety.

**Backend**: All API routes live in `Next.js` route handlers with a consistent response schema (`{ ok: true, data }` or `{ ok: false, error }`).

**Supabase** was chosen as the backend provider as it was able to cover a range of the required features, including Postgres database, authentication, file storage, and real-time WebSocket subscriptions. Rather than implementing Row Level Security policies, the architecture uses Supabase's service role key server-side only, making all data access API-gated. The `requireAdmin()` middleware validates sessions against an `admins` allowlist table.

**Database**: Five normalized tables (`artists`, `submissions`, `tracks`, `reviews`, `email_templates`) support one-to-many relationships while keeping reviews and templates flexible for future expansion. PostgreSQL was chosen for the highly relational data between artists, tracks, submissions, as well as it's robust capabilities and ease of use, especially in Supabase.

**Real-Time Updates**: Supabase Realtime Broadcast pushes updates to the admin dashboard. When submissions are created or track metadata is extracted, the API broadcasts events that trigger React Query cache invalidation, refreshing the UI instantly without polling.

**Other Tech Stack Choices**:

- `Zod` for schema validation
- `React` Hook Form for form validation
- `TipTap` for WYSIWYG editor
- `Resend` for email service
- `Tailwind CSS` for styling
- `WaveSurfer.js` for audio visualization

## File Upload & Email Systems

### Upload Approach

The upload system handles asynchronous background uploads (up to 5 files) with real-time progress and ETA calculation. Files are validated client-side (MP3/WAV/FLAC/M4A, 50MB max), then the API returns pre-signed Supabase Storage URLs for direct-to-storage uploads.

Using XMLHttpRequest instead of `fetch()` enables fine-grained progress tracking. Upload speed is calculated using a rolling 5-sample average, providing smooth ETA estimates (`remainingBytes / averageSpeed`). All uploads run in parallel, allowing artists to fill out metadata while files upload in the background.

**Metadata Extraction**: After submission, the API triggers a Supabase Edge Function (`extract-audio-duration`) that uses `EdgeRuntime.waitUntil()` for non-blocking background processing. The function streams audio files via signed URLs and extracts duration using `music-metadata`'s `parseWebStream()`, then broadcasts a real-time event to update the admin UI.

### Email Approach

Email templates are stored in the database with three types: `confirmation`, `approved`, `rejected`. Each has a `subject` and `html` body supporting variable interpolation (`{{artist_name}}`, `{{track_titles}}`, etc.).

Admins edit templates using **TipTap** with a toolbar for formatting and variable insertion. The email service fetches templates from the database, replaces variables via regex, and sends via **Resend**'s transactional API. Confirmation emails are sent automatically on submission; approval/rejection emails trigger when admins update status and save reviews. Resend was used as it was a free tier provider and easy to use.

## Trade-offs & Limitations

**Simplicity Over Scalability**: Given the time constraint, I prioritized metadata extraction over full audio compression (which would require ffmpeg in Edge Functions or a job queue). The API uses Supabase's service role key instead of Row Level Security, requiring all data access to go through API routes—simpler and more appropriate for admin-only access.

**Performance Optimizations**: Direct-to-storage uploads avoid routing files through serverless functions, preventing timeouts. Streaming metadata extraction reads only file headers rather than downloading entire files. React Query's caching provides instant page transitions with background refetching.

**Known Limitations**:

- Email uses Resend's development sender (production needs custom domain).
- Realtime subscriptions/broadcast lack reconnection or retry logic (network interruptions require page refresh) - current using fire-and-forget, so errors are lost.
- No upload resume - if connection drops mid-upload, must start over. Resumable uploads (like tus.io protocol) would be better for large files.
- No rate limiting on API routes.
- No virus scanning on uploaded files.
- No pagination in submission list, could cause performance issues on API and client for large datasets.
- No draft saving for both draft submissions and draft reviews.
- No email retry queue, failed emails are lost

## AI-Assisted Development Workflow

I used Claude Code and Gemini throughout this project with an incremental prompt-driven approach (main prompts documented in `docs/prompts.md`). I created some core documents in `docs/` to maintain consistent context and patterns. Rather than requesting the entire application at once, I broke work into logical chunks for rapid scaffolding. This allowed validation of each feature before building on top of it.

Examples can be seen in the `prompts.md` file as mentioned, but to expand, features like TipTap, WaveSurfer, and realtime subscriptions that would take hours of documentation reading were implemented in minutes. Claude maintained consistent patterns (error handling, naming conventions) and proactively suggested edge case coverage (upload cancellation, network errors). Most features required 2-3 iterations—the key was clear, specific feedback in follow-up prompts.

## Conclusion

This platform achieves all assignment requirements through modern web technologies, managed backend services, and AI-assisted development. The architecture balances developer experience (type safety, consistent patterns) with user experience (real-time updates, background uploads) while making pragmatic trade-offs to ship quickly.
