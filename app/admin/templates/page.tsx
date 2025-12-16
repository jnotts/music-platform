import Link from "next/link";

/**
 * Admin email templates page.
 * Manage confirmation, approval, and rejection email templates.
 */
export default function AdminTemplatesPage() {
  return (
    <div className="min-h-screen bg-[#0B0D0F] text-[#F5F3EE]">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <Link
            href="/admin/submissions"
            className="text-[#A8A29E] transition-colors hover:text-[#F5F3EE]"
          >
            ← Submissions
          </Link>
          <h1 className="text-xl font-semibold">Email Templates</h1>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-4 md:grid-cols-3">
          {/* Template cards */}
          {["confirmation", "approved", "rejected"].map((key) => (
            <Link
              key={key}
              href={`/admin/templates/${key}`}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:border-white/20"
            >
              <h2 className="text-lg font-semibold capitalize">{key}</h2>
              <p className="mt-2 text-sm text-[#A8A29E]">
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
