// Re-export all Supabase utilities for convenient imports
export { createBrowserClient } from "./client";
export { createServerClient, createAdminClient } from "./server";
export { getSession, getUser } from "./auth";
export { updateSession } from "./proxy";
export { SUBMISSIONS_CHANNEL, SUBMISSION_EVENTS } from "./realtime";
