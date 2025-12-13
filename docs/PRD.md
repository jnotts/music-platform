# PRD — Music Demo Submission Platform (5-hour build)

## 1) Goal

Build a polished web app where **artists submit multiple demo tracks** and **admins review/manage submissions** efficiently, with realtime updates, streaming playback, and automated emails.

## 2) Timebox + Success Criteria

**Timebox:** 5 hours total build time.  
**Success =** artist can submit (multi-track + metadata) end-to-end, admin can log in and review/grade/update status, emails send, and new submissions appear in admin in realtime.

## 3) Users

- **Artist (public):** submits demos + info.
- **Admin (internal):** reviews submissions, grades, updates status, manages email templates.

## 4) Scope (MVP for 5 hours)

### Must-have (MVP)

**Artist portal**

- Multi-track upload in one submission (MP3/WAV/FLAC/M4A).
- Async upload: form usable while uploads run.
- Upload progress per file + overall progress + ETA (simple estimate).
- Validation: format + size limit + clear errors.
- Artist form: name, email, phone, socials (IG/SoundCloud/Spotify), bio.
- Per-track fields: title, genre, BPM, key, description.
- Confirmation screen + confirmation email (HTML) after submit.

**Admin dashboard**

- Secure admin login.
- Submissions list with search + filters (status, genre, date).
- Submission detail view: stream audio playback; waveform if feasible.
- Status management: Pending / In-Review / Approved / Rejected.
- Review: grade 1–10, internal notes, feedback (stored).
- Email templates: editor for confirmation/approval/rejection with variables like `{{artist_name}}`.
- Realtime: admin list updates when new submissions arrive.

**Backend**

- REST API with consistent responses/errors.
- Reliable file storage with direct uploads.
- Background processing: minimal metadata extraction (e.g., duration) after upload.

**UX/Design**

- Premium, modern label feel: strong typography, spacing, responsive layout, clear empty/loading/error states.

### Should-have (if time remains)

- Waveform visualization everywhere in admin (list + detail).
- Better ETA (based on moving average upload speed).
- Admin “send decision email” button that uses templates.

### Could-have (nice-to-have)

- Track-level status/notes.
- Soft delete / archive.
- Rate limiting / spam protection (basic).

### Out of scope (explicit)

- Full audio compression pipeline.
- Complex role management beyond “admin”.
- Full WYSIWYG variable chips (tokens kept as `{{var}}` text).

## 5) Key User Journeys

### Artist

1. Lands on submission page → sees multi-upload + form.
2. Selects multiple files → uploads begin immediately with progress/ETA.
3. Fills details + per-track metadata while uploads run.
4. Submit → creates submission + track records.
5. Sees confirmation UI → receives HTML confirmation email.

### Admin

1. Logs in.
2. Sees realtime-updating submissions list.
3. Filters/searches → opens a submission.
4. Streams tracks → grades + notes + feedback.
5. Sets status → optionally sends approval/rejection email.

## 6) Screens (MVP)

- `/` Artist submission page (upload + form + per-track editor, show completion on submit)
- `/admin/login` Admin login
- `/admin/submissions` List + filters + search
- `/admin/submissions/[id]` Detail (tracks player, review controls)
- `/admin/templates` Email template editor + preview

## 7) Data Model (high level)

- **artists**
  - id, name, email, phone, bio, instagram_url, soundcloud_url, spotify_url, created_at
- **submissions**
  - id, artist_id, status, created_at, updated_at
- **tracks**
  - id, submission_id, storage_path, filename, mime_type, size_bytes
  - title, genre, bpm, key, description
  - duration_seconds (filled by bg processing), created_at
- **reviews**
  - id, submission_id, grade_1_10, internal_notes, feedback_for_artist, created_at, updated_at
- **email_templates**
  - key (confirmation/approved/rejected), subject, html, updated_at

## 8) API (REST) — minimal endpoints

- `POST /api/submissions` create submission (artist + tracks metadata references)
- `GET /api/admin/submissions` list (filters/search)
- `GET /api/admin/submissions/:id` detail
- `PATCH /api/admin/submissions/:id` update status
- `PUT /api/admin/reviews/:submissionId` upsert review
- `GET /api/admin/templates` list templates
- `PUT /api/admin/templates/:key` update template
- `POST /api/emails/send` send templated email (admin decisions)
- `POST /api/uploads/sign` return signed upload URL(s) / tokens as needed

## 9) File Upload + Storage

- Direct-to-storage upload (avoid routing large files through serverless).
- Store per-track `storage_path` + metadata in DB once upload completes.
- Enforce:
  - Allowed extensions/mime types (MP3/WAV/FLAC/M4A)
  - Max file size (define in config)
- Progress:
  - show per-file % + overall %.
  - ETA = remaining_bytes / recent_upload_speed (simple smoothing).

## 10) Streaming Playback

- Admin uses signed URLs for playback.
- Playback supports seeking (byte-range requests handled by storage + browser buffering).
- Waveform: use WaveSurfer on the detail page (MVP); precomputed peaks optional.

## 11) Background Processing (MVP)

- Trigger after each upload completes:
  - extract duration (and optionally basic metadata) and update `tracks.duration_seconds`.
- If time: generate waveform peaks and store in `tracks.waveform_peaks` (optional).

## 12) Email System

- Provider: transactional email API.
- Templates stored in DB and editable in admin.
- Template variables (MVP):
  - `{{artist_name}}`, `{{submission_id}}`, `{{track_titles}}`, `{{status}}`
- Confirmation email sent automatically on successful submission.
- Approval/rejection emails sent on admin action (optional “send” button if time).

## 13) Security / Access Control

- Admin-only routes gated by auth session.
- DB policies so artists can only write their own submission data (or public insert-only for submissions).
- Storage access via signed URLs; no public bucket browsing.

## 14) Non-functional Requirements

- Responsive (mobile-first for artist; desktop-strong for admin).
- Accessible form errors and loading states.
- Consistent error format from API.

## 15) Deliverables

- Git repo with clean commits.
  - Include LLM prompts used for generation **in commit messages**.
- README:
  - setup, env vars, schema overview, admin creds, deployment URL.
- Written doc (500–1000 words):
  - architecture + tradeoffs + upload/email approach + AI usage examples.

## 16) Tradeoffs (expected)

- Prefer end-to-end correctness + visual polish over deep audio processing.
- Minimal background processing (duration) instead of full compression pipeline.
- Template editor = simple rich text + preview + variable insertion, not a full marketing-email builder.

## 17) Acceptance Checklist (MVP)

- [ ] Multi-file upload works; progress + ETA visible
- [ ] Validation errors are clear
- [ ] Submission creates artist/submission/tracks
- [ ] Confirmation email sends and renders HTML
- [ ] Admin login works
- [ ] Admin sees list with filters/search
- [ ] Realtime new submissions appear without refresh
- [ ] Admin can play audio (seek works)
- [ ] Admin can set status + grade + notes + feedback
- [ ] Admin can edit email templates and variables render correctly
- [ ] Fully responsive layouts
