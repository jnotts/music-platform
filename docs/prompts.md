# prompts.md

### Prompt 001 - initial setup:

You are working in an existing Next.js (App Router) + Tailwind + TypeScript repo. Docs to follow: @ASSIGNMENT.md @PRD.md , @TECH_STACK.md , @DESIGN.md , and rules in @AGENTS.md

Goal for this task: finish configuration + scaffold the Supabase-backed REST API foundation (no UI features yet).

Current state: Supabase project exists with tables created in Supabase dashboard and RLS enabled, no policies. We will keep DB API-only via service role key. We already have basic createClient (browser anon) and createServerClient (server service-role) initializers @lib/supabase from boilerplate, but no real usage or tailored yet. Realtime will use Supabase Realtime Broadcast later. You can see the DB types in the docs and the @db.ts

Do the following, in small chunks and no invented APIs: 1. Create/verify env var wiring and update/verify lib/supabase structure: browser.ts/client.ts, server.ts, auth.ts (session helpers), realtime.ts (channel constants). Ensure service role key is never exposed (SUPABASE_SERVICE_ROLE_KEY server-only). 2. Implement server-side admin check helper: requireAdmin(request) that verifies the Supabase auth session and then checks public.admins allowlist (query via service role). Return a clear { ok:false, error:{code,message} } on failure. 3. Scaffold REST endpoints in Next api, (return stub data where needed but wire DB queries where straightforward):
• POST /api/submissions (accept artist + submission + tracks payload, validate with Zod, insert into DB)
• GET /api/admin/submissions (admin-only, list with basic filters: status, search by artist name/email)
• GET /api/admin/submissions/[id] (admin-only, return submission + artist + tracks + review)
• PATCH /api/admin/submissions/[id] (admin-only, update status)
• PUT /api/admin/reviews/[submissionId] (admin-only, upsert review)
• GET/PUT /api/admin/templates + /api/admin/templates/[key] (admin-only) 4. Add types/db.ts matching our DB schema (Artist, Submission, Track, Review, EmailTemplate, Admin; SubmissionStatus union). 5. Add a tiny “smoke test” page or script that hits GET /api/admin/submissions and prints the JSON (behind login) just to confirm wiring.

Constraints:
• Use Zod schemas for each endpoint input.
• Keep API response shape consistent: { ok:true, data } and { ok:false, error:{ code, message, details? } }.
• Do NOT add RLS policies.
• Keep dependencies minimal (only add what you must).
• Do not build the uploader, waveform, or template editor yet.
• Update README.md with required env vars.
• Follow instructions in the docs

Output: implement the code changes only. If you decide the tasks should be broken into smaller steps, then complete steps and let me review before moving onto next steps. If you want to do big logical chunks that is ok tooo.

If at any moment the instructions are unclear or contradict a requirement in the @ASSIGNMENT.md then make note of it so I can remedy immediately.

### Prompt 002 - create initial page routes and scafold the submission form page

1.  Follow the routes outlined in @PRD.md and create barebone pages for now. Then add simple login functionality for admins to login, no UI Design required yet.

2.  Build a UI prototype for the artist submission page at @page.tsx . Layout (top to bottom): minimal header with label logo/name, H1 "Submit Your Demo" with a brief tagline beneath. Below that, a compact dropzone area (~80px height) with dashed border and "Drop your tracks here" text that collapses to a slim "Add more" bar state. Next, a concise artist info section in a 2-3 column grid (Name, Email, Phone on one row; optional Bio textarea below, collapsible "Add social links" for Instagram/SoundCloud/Spotify). Below the form, display mock track cards in a 3-column responsive grid (2 on tablet, 1 on mobile). Each track card shows: filename, a progress bar (mock at various states: uploading, complete), and inline fields for title/genre/BPM/key. A sticky footer contains the Submit button and subtle "Admin" link. Style: dark premium glass aesthetic per the reference-deep charcoal background (#0B0D0F), off-white text (#F5F3EE), muted (#A8A29E), accent blue (#2D7DFF). Create a matching light mode and allow toggle between both light/dark. Cards use glass morphism: semi-transparent backgrounds (rgba(255,255,255,0.04-0.08)), subtle white/10 borders, soft shadows, generous padding (16-24px), rounded corners (16px). Typography: Inter font, clean hierarchy. Use mock data for 3-4 example track cards at different upload states. No actual functionality needed-this is a visual prototype only.

See the image for design and style inspiration, but note that the concept and layout is slightly different.

### Prompt 003 - Global Theme & Glassmorphism Design

Refactor the application's theming to use globals.css for resuable tailwind classes semantic design tokens (primary, surface, muted) instead of hardcoded hex values. Implement a robust dark/light mode system that uses next-themes and applies a premium glassmorphism aesthetic (backdrop-blur, semi-transparent backgrounds) across the app. Ensure the design feels distinct and not generic."

### Prompt 004 - Upload Component

implement logic for this artist submission @app/page.tsx to hook it up. See all info in @docs/PRD.md @docs/ASSIGNMENT.md @docs/TECH_STACK.md -> ensure the main requirements are met (batch uploads (max 5 per submission) which can happen in the background). Uploads need time estimates etc. Cover all requirements for this part. REST API already exists in the app @lib/api/ @app/api/ . If certain config/envs are needed, write the code anyway and make note of any steps needed to config after (e.g. setting up storage in supabase). plan.

### Prompt 005 - Scaffold submissions dashboard

create the UI/design protype for /admin/submissions page with core featuers;
Submission Management:
Display all submissions in a clean, filterable, and searchable interface.
Allow admins to stream audio directly without needing to download the full file. A waveform visualization would be a great touch.
Manage submission statuses: Pending, In-Review, Approved, Rejected.
Review & Grading System:
Enable admins to grade submissions on a 1-10 scale.
Provide fields for internal notes and constructive feedback for the artist.
UI should consist of 3 main sections. 1. Left glass floating side panel which contains a searchable and filterable list of submissions. Takes up slightly more width on left when no submission selected. When one is selected, width is smaller but can still see list. Can also toggle to collapse to the side completely 2. Only when submission is clicked, the main section in the middle contains all the submission info: metadata, with some sort of scrollable card section representing each track in the submission. This can either be a horizontal scroll of track cards, or an admin just sees a list of each track and clicking on one shows that track info + waveform. 3. the right-side glass floating panel (also only viewable when submission selected). This is the admin actions panel where they can grade the submission and leave notes as outlined above, and submit the review.
The left and right floating side panels should have the glass morhpism aesthetic.
Finally add a link (maybe just to footer for now) to Email templates. Where they can edit html email templates

### Prompt 006 - setup resend for email

- Set up transactional email integration - use resend
- Create email_templates table in database
- Build template variable replacement system ({{artist_name}}, {{track_titles}}, etc.)
- API endpoints: GET/PUT /api/admin/templates/:key, POST /api/emails/send
- Implement automatic confirmation email on submission

### Prompt 007 - add media player and streaming

Implement streaming playback for submissions using wavesurfer.js and Supabase Storage signed URLs to stream the audio (no local downloads).

### Prompt 008 - implement email templates with TipTap editor

implement the editable html email templates. See the docs first @docs/TECH_STACK.md @docs/PRD.md
@docs/ASSIGNMENT.md .
We need the templates to be editable and saved to the db. for now, consider only one template per email type/key, so admins only edit the current template for the key.
here are relevant files: @lib/schemas/template.ts @app/admin/templates/page.tsx @app/admin/templates/[key]/page.tsx @app/api/admin/templates/[key]/route.ts @app/api/admin/templates/route.ts
Make sure to create functinos that call the rest endpoints in @lib/api/client.ts and make use of these functions in custom hooks @hooks/ - then make use of the hooks in the relevant admin pages referenced above.
Template use {{variables}} and integrate tiptap as the editor. Use bun for installs.

### Prompt 009 - background jobs for metadata extraction

I need to add background jobs for metadata extraction (audio compression excluded for now). This should happen when users upload their audio. The main metadata to extract is duration (track length in seconds), which is currently missing from track records - see duration_seconds field in @lib/types/db.ts Track type.

Entry point: @app/page.tsx contains upload hooks that call @lib/api/client.ts. Track records are created in @app/api/submissions/route.ts.

Use supabase edge functions with:

- EdgeRuntime.waitUntil()` for true background processing
- music-metadata library for parsing
- Fire-and-forget trigger from API route after track creation
- Returns `202 Accepted` immediately while processing continues
- Sets `duration_seconds: -1` on extraction failure, `null` during processing, `>0` on success
- Admin UI displays formatted duration using `formatDuration()` helper in @lib/validation/upload.ts

_More back and forth used to reach working impl_

### Prompt 010 - realtime updates for admin submissions dashboard and track updates

Implement realtime updates for the admin submissions dashboard by integrating Supabase Broadcast. Configure
app/admin/submissions/page.tsx to automatically listen for new-submission events from the server and track-updated events from the metadata extraction Edge Function, ensuring the UI reflects new data instantly without manual refreshes. Additionally, broadcast updates to track records from the edge function supabase/functions/extract-audio-duration/index.ts to also invalidate and refetch data.
