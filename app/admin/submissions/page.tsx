"use client";

import { useState } from "react";
import Link from "next/link";
import { SubmissionList } from "@/components/admin/SubmissionList";
import { SubmissionDetail } from "@/components/admin/SubmissionDetail";
import { ActionPanel } from "@/components/admin/ActionPanel";
import { ArrowLeft, Layout, Loader2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  useAdminSubmissions,
  useSubmissionReview,
} from "@/hooks/useAdminSubmissions";

/**
 * Admin submissions main interactive prototype.
 */
export default function AdminSubmissionsPage() {
  const { data: submissions, isLoading } = useAdminSubmissions();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedSubmission = submissions?.find((s) => s.id === selectedId);
  const { data: reviewData } = useSubmissionReview(selectedId);

  return (
    <div className="relative flex h-screen min-h-screen flex-col overflow-hidden transition-colors duration-300">
      {/* Header */}
      <header className="z-10 flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface/50 px-6 backdrop-blur-md">
        <div className="flex items-center gap-4">
          {/* <Link
            href="/"
            className="p-2 -ml-2 hover:bg-surface-muted rounded-lg transition-colors text-muted hover:text-foreground"
          >
            <ArrowLeft size={20} />
          </Link> */}
          <div className="mx-2 h-6 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Layout size={18} className="text-primary" />
            <h1 className="font-semibold tracking-tight">Submission Manager</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="rounded border border-border bg-surface-muted px-2 py-1 font-mono text-xs text-muted">
            PROTOTYPE MODE
          </div>
          <Link
            href="/admin/templates"
            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Email Templates
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Layout Area */}
      <main className="relative z-10 flex flex-1 flex-col gap-6 overflow-y-auto p-4 xl:flex-row xl:overflow-hidden xl:p-6">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : (
          <>
            {/* Left Panel: Submission List */}
            <div
              className={`flex shrink-0 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                selectedId ? "w-full xl:w-80" : "mx-auto w-full max-w-2xl"
              }`}
            >
              <div
                className={`glass flex h-[400px] w-full flex-col overflow-hidden rounded-2xl shadow-2xl xl:h-full`}
              >
                <SubmissionList
                  submissions={submissions || []}
                  selectedId={selectedId}
                  setSelectedId={setSelectedId}
                />
              </div>
            </div>

            {/* Center & Right Panels: Detail View - Only visible when selected */}
            {selectedId && selectedSubmission && (
              <>
                {/* Center: Details */}
                <div className="glass animate-in fade-in zoom-in-95 slide-in-from-right-10 min-h-[500px] w-full min-w-0 flex-1 rounded-2xl shadow-2xl duration-300 xl:h-auto">
                  <SubmissionDetail submission={selectedSubmission} />
                </div>

                {/* Right: Actions */}
                <div className="animate-in fade-in slide-in-from-right-20 w-full shrink-0 delay-100 duration-500 xl:w-96">
                  <div className="glass h-auto w-full overflow-hidden rounded-2xl shadow-2xl xl:h-full">
                    <ActionPanel
                      key={selectedSubmission.id}
                      submission={selectedSubmission}
                      initialReviewData={reviewData}
                    />
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
