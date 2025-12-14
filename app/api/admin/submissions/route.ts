import { NextRequest } from "next/server";
import { ok, errors, requireAdmin } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/server";
import type { SubmissionStatus } from "@/lib/types/db";

/**
 * GET /api/admin/submissions
 * List all submissions with optional filters.
 * Admin-only endpoint.
 */
export async function GET(request: NextRequest) {
  // Check admin auth
  const authResult = await requireAdmin();
  if (!authResult.ok) {
    return authResult.error.code === "UNAUTHORIZED"
      ? errors.unauthorized()
      : errors.forbidden();
  }

  try {
    const adminClient = createAdminClient();
    const { searchParams } = new URL(request.url);

    // Parse query params
    const status = searchParams.get("status") as SubmissionStatus | null;
    const search = searchParams.get("search");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query - join with artists
    let query = adminClient
      .from("submissions")
      .select(
        `
        *,
        artist:artists(*)
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply status filter
    if (status) {
      query = query.eq("status", status);
    }

    // Apply search filter (search artist name or email)
    // Note: For search across joined table, we need to filter differently
    // This is a simplified approach - for complex search, consider RPC or views

    const { data: submissions, error, count } = await query;

    if (error) {
      console.error("Error fetching submissions:", error);
      return errors.internal("Failed to fetch submissions");
    }

    // If search is provided, filter results client-side (simplified approach)
    // In production, consider using Postgres full-text search
    let filteredSubmissions = submissions || [];
    if (search) {
      const searchLower = search.toLowerCase();
      filteredSubmissions = filteredSubmissions.filter((sub) => {
        const artist = sub.artist as { name?: string; email?: string } | null;
        return (
          artist?.name?.toLowerCase().includes(searchLower) ||
          artist?.email?.toLowerCase().includes(searchLower)
        );
      });
    }

    return ok({
      submissions: filteredSubmissions,
      total: search ? filteredSubmissions.length : count,
      limit,
      offset,
    });
  } catch (err) {
    console.error("Error in GET /api/admin/submissions:", err);
    return errors.internal("An unexpected error occurred");
  }
}
