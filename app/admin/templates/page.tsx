"use client";

import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";

/**
 * Admin email templates page.
 * Manage confirmation, approval, and rejection email templates.
 */
export default function AdminTemplatesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminNav
        title="Email Templates"
        backLink={{ href: "/admin/submissions", label: "Submissions" }}
      />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-4 md:grid-cols-3">
          {/* Template cards */}
          {["confirmation", "approved", "rejected"].map((key) => (
            <Link
              key={key}
              href={`/admin/templates/${key}`}
              className="rounded-2xl border border-border bg-surface-muted p-6 transition-colors hover:border-primary/50"
            >
              <h2 className="text-lg font-semibold capitalize">{key}</h2>
              <p className="mt-2 text-sm text-muted">
                {key === "confirmation" && "Sent when artist submits demo"}
                {key === "approved" && "Sent when submission is approved"}
                {key === "rejected" && "Sent when submission is rejected"}
              </p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
