import Link from "next/link";

/**
 * Submission confirmation page.
 * Shown after successful demo submission.
 */
export default function SubmittedPage() {
  return (
    <div className="min-h-screen bg-[#0B0D0F] text-[#F5F3EE]">
      <main className="mx-auto max-w-3xl px-6 py-16 text-center">
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
          <svg
            className="h-8 w-8 text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-4xl font-semibold tracking-tight">
          Submission Received
        </h1>
        <p className="mt-4 text-lg text-[#A8A29E]">
          Thank you for submitting your demo! We&apos;ll review your tracks and
          get back to you soon.
        </p>
        <p className="mt-2 text-[#A8A29E]">
          A confirmation email has been sent to your inbox.
        </p>

        <Link
          href="/"
          className="mt-8 inline-block rounded-xl bg-white/10 px-6 py-3 text-sm font-medium hover:bg-white/20 transition-colors"
        >
          Submit Another Demo
        </Link>
      </main>
    </div>
  );
}
