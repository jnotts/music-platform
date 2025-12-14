import { NextRequest } from "next/server";
import { ok, errors, requireAdmin } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/server";
import { templateSchema } from "@/lib/schemas";
import type { EmailTemplateKey } from "@/lib/types/db";

type RouteParams = {
  params: Promise<{ key: string }>;
};

const VALID_KEYS: EmailTemplateKey[] = ["confirmation", "approved", "rejected"];

/**
 * GET /api/admin/templates/[key]
 * Get a single email template by key.
 * Admin-only endpoint.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { key } = await params;

  // Check admin auth
  const authResult = await requireAdmin();
  if (!authResult.ok) {
    return authResult.error.code === "UNAUTHORIZED"
      ? errors.unauthorized()
      : errors.forbidden();
  }

  // Validate key
  if (!VALID_KEYS.includes(key as EmailTemplateKey)) {
    return errors.badRequest(
      `Invalid template key. Must be one of: ${VALID_KEYS.join(", ")}`
    );
  }

  try {
    const adminClient = createAdminClient();

    const { data: template, error } = await adminClient
      .from("email_templates")
      .select("*")
      .eq("key", key)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return errors.notFound("Template");
      }
      console.error("Error fetching template:", error);
      return errors.internal("Failed to fetch template");
    }

    return ok(template);
  } catch (err) {
    console.error("Error in GET /api/admin/templates/[key]:", err);
    return errors.internal("An unexpected error occurred");
  }
}

/**
 * PUT /api/admin/templates/[key]
 * Update an email template.
 * Admin-only endpoint.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { key } = await params;

  // Check admin auth
  const authResult = await requireAdmin();
  if (!authResult.ok) {
    return authResult.error.code === "UNAUTHORIZED"
      ? errors.unauthorized()
      : errors.forbidden();
  }

  // Validate key
  if (!VALID_KEYS.includes(key as EmailTemplateKey)) {
    return errors.badRequest(
      `Invalid template key. Must be one of: ${VALID_KEYS.join(", ")}`
    );
  }

  try {
    const body = await request.json();

    // Validate request body
    const parseResult = templateSchema.safeParse(body);
    if (!parseResult.success) {
      return errors.validation(parseResult.error.format());
    }

    const { subject, html } = parseResult.data;
    const adminClient = createAdminClient();

    // Upsert template
    const { data: template, error } = await adminClient
      .from("email_templates")
      .upsert(
        {
          key,
          subject,
          html,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "key",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Error updating template:", error);
      return errors.internal("Failed to update template");
    }

    return ok(template);
  } catch (err) {
    console.error("Error in PUT /api/admin/templates/[key]:", err);
    return errors.internal("An unexpected error occurred");
  }
}
