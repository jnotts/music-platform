import Link from "next/link";

/**
 * Admin submissions list page.
 * Shows all submissions with filters and search.
 */
export default function AdminSubmissionsPage() {
  return (
    <div className="min-h-screen bg-[#0B0D0F] text-[#F5F3EE]">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-xl font-semibold">Submissions</h1>
          <Link
            href="/admin/templates"
            className="text-sm text-[#A8A29E] hover:text-[#F5F3EE] transition-colors"
          >
            Email Templates
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* TODO: Filters and search bar */}
        <div className="mb-6 flex gap-4">
          <input
            type="text"
            placeholder="Search artists..."
            className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-[#F5F3EE] placeholder-[#A8A29E]/50 focus:border-[#2D7DFF] focus:outline-none"
          />
          <select className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-[#F5F3EE] focus:border-[#2D7DFF] focus:outline-none">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_review">In Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* TODO: Submissions list */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <p className="text-[#A8A29E]">Submissions list coming soon...</p>
        </div>
      </main>
    </div>
  );
}
