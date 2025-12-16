import Link from "next/link";

type PageProps = {
  params: Promise<{ key: string }>;
};

/**
 * Admin template editor page.
 * Edit subject and HTML content for a specific email template.
 */
export default async function AdminTemplateEditorPage({ params }: PageProps) {
  const { key } = await params;

  return (
    <div className="min-h-screen bg-[#0B0D0F] text-[#F5F3EE]">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <Link
            href="/admin/templates"
            className="text-[#A8A29E] transition-colors hover:text-[#F5F3EE]"
          >
            ← Templates
          </Link>
          <h1 className="text-xl font-semibold capitalize">{key} Template</h1>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Editor */}
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#A8A29E]">
                Subject
              </label>
              <input
                type="text"
                placeholder="Email subject..."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[#F5F3EE] placeholder-[#A8A29E]/50 focus:border-[#2D7DFF] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#A8A29E]">
                HTML Content
              </label>
              <div className="min-h-[300px] rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-[#A8A29E]">
                  Rich text editor coming soon...
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="rounded-xl bg-[#2D7DFF] px-4 py-2 font-medium text-white transition-colors hover:bg-[#2D7DFF]/90">
                Save Template
              </button>
            </div>
          </div>

          {/* Preview */}
          <div>
            <h2 className="mb-2 text-sm font-medium text-[#A8A29E]">Preview</h2>
            <div className="min-h-[400px] rounded-xl border border-white/10 bg-white p-6">
              <p className="text-sm text-gray-400">
                Preview will appear here...
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
