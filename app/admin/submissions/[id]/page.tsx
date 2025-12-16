import Link from "next/link";

type PageProps = {
  params: Promise<{ id: string }>;
};

/**
 * Admin submission detail page.
 * Shows submission with artist info, tracks player, and review controls.
 */
export default async function AdminSubmissionDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-[#0B0D0F] text-[#F5F3EE]">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <Link
            href="/admin/submissions"
            className="text-[#A8A29E] transition-colors hover:text-[#F5F3EE]"
          >
            ← Back
          </Link>
          <h1 className="text-xl font-semibold">Submission Detail</h1>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content - tracks */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-lg font-semibold">Tracks</h2>
              <p className="text-[#A8A29E]">Track player coming soon...</p>
              <p className="mt-2 text-xs text-[#A8A29E]/50">
                Submission ID: {id}
              </p>
            </div>
          </div>

          {/* Sidebar - artist info & review */}
          <div className="space-y-6">
            {/* Artist info */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-lg font-semibold">Artist</h2>
              <p className="text-[#A8A29E]">Artist info coming soon...</p>
            </div>

            {/* Review panel */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-lg font-semibold">Review</h2>
              <p className="text-[#A8A29E]">Review controls coming soon...</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
