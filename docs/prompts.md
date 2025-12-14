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


