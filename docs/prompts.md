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

2.  Build a UI prototype for the artist submission page at @page.tsx . Layout (top to bottom): minimal header with label logo/name, H1 "Submit Your Demo" with a brief tagline beneath. Below that, a compact dropzone area (~80px height) with dashed border and "Drop your tracks here" text that collapses to a slim "Add more" bar state. Next, a concise artist info section in a 2-3 column grid (Name, Email, Phone on one row; optional Bio textarea below, collapsible "Add social links" for Instagram/SoundCloud/Spotify). Below the form, display mock track cards in a 3-column responsive grid (2 on tablet, 1 on mobile). Each track card shows: filename, a progress bar (mock at various states: uploading, complete), and inline fields for title/genre/BPM/key. A sticky footer contains the Submit button and subtle "Admin" link. Style: dark premium glass aesthetic per the reference—deep charcoal background (#0B0D0F), off-white text (#F5F3EE), muted (#A8A29E), accent blue (#2D7DFF). Create a matching light mode and allow toggle between both light/dark. Cards use glass morphism: semi-transparent backgrounds (rgba(255,255,255,0.04-0.08)), subtle white/10 borders, soft shadows, generous padding (16-24px), rounded corners (16px). Typography: Inter font, clean hierarchy. Use mock data for 3-4 example track cards at different upload states. No actual functionality needed—this is a visual prototype only.

See the image for design and style inspiration, but note that the concept and layout is slightly different.

### Prompt 003 — Global Theme & Glassmorphism Design

Refactor the application's theming to use globals.css for resuable tailwind classes semantic design tokens (primary, surface, muted) instead of hardcoded hex values. Implement a robust dark/light mode system that uses next-themes and applies a premium glassmorphism aesthetic (backdrop-blur, semi-transparent backgrounds) across the app. Ensure the design feels distinct and not generic."

### Prompt 004 — Upload Component

implement logic for this artist submission @app/page.tsx to hook it up. See all info in @docs/PRD.md @docs/ASSIGNMENT.md @docs/TECH_STACK.md -> ensure the main requirements are met (batch uploads (max 5 per submission) which can happen in the background). Uploads need time estimates etc. Cover all requirements for this part. REST API already exists in the app @lib/api/ @app/api/ . If certain config/envs are needed, write the code anyway and make note of any steps needed to config after (e.g. setting up storage in supabase). plan.
