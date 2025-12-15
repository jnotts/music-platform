import Link from "next/link";

/**
 * Home page - Artist Submission Portal
 * Artists submit their demo tracks here.
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0B0D0F] text-[#F5F3EE]">
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">
          Submit Your Demo
        </h1>
        <p className="mt-4 text-lg text-[#A8A29E]">
          Share your music with our A&R team. Upload your tracks and tell us
          about yourself.
        </p>

        {/* TODO: Artist submission form */}
        <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-8">
          <p className="text-[#A8A29E]">Submission form coming soon...</p>
        </div>

        {/* Subtle admin link */}
        <div className="mt-16 text-center">
          <Link
            href="/admin/login"
            className="text-sm text-[#A8A29E]/50 hover:text-[#A8A29E] transition-colors"
          >
            Admin
          </Link>
        </div>
      </main>
    </div>
  );
}
