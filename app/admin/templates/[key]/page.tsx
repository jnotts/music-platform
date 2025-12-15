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
            className="text-[#A8A29E] hover:text-[#F5F3EE] transition-colors"
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
              <label className="block text-sm font-medium text-[#A8A29E] mb-1">
                Subject
              </label>
              <input
                type="text"
                placeholder="Email subject..."
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-[#F5F3EE] placeholder-[#A8A29E]/50 focus:border-[#2D7DFF] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#A8A29E] mb-1">
                HTML Content
              </label>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 min-h-[300px]">
                <p className="text-[#A8A29E]">
                  Rich text editor coming soon...
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="rounded-xl bg-[#2D7DFF] px-4 py-2 font-medium text-white hover:bg-[#2D7DFF]/90 transition-colors">
                Save Template
              </button>
            </div>
          </div>

          {/* Preview */}
          <div>
            <h2 className="text-sm font-medium text-[#A8A29E] mb-2">Preview</h2>
            <div className="rounded-xl border border-white/10 bg-white p-6 min-h-[400px]">
              <p className="text-gray-400 text-sm">
                Preview will appear here...
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
