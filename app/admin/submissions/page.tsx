"use client";

import { useState } from "react";
import Link from "next/link";
import { SubmissionList } from "@/components/admin/SubmissionList";
import { SubmissionDetail } from "@/components/admin/SubmissionDetail";
import { ActionPanel } from "@/components/admin/ActionPanel";
import { MOCK_SUBMISSIONS } from "@/types/admin-submission";
import { ArrowLeft, Layout } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

/**
 * Admin submissions main interactive prototype.
 */
export default function AdminSubmissionsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedSubmission = MOCK_SUBMISSIONS.find((s) => s.id === selectedId);

  return (
    <div className="min-h-screen h-screen flex flex-col overflow-hidden relative transition-colors duration-300">
      {/* Header */}
      <header className="shrink-0 h-16 border-b border-border bg-surface/50 backdrop-blur-md flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedId(null)}
            className="p-2 -ml-2 hover:bg-surface-muted rounded-lg transition-colors text-muted hover:text-foreground"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="h-6 w-px bg-border mx-2" />
          <div className="flex items-center gap-2">
            <Layout size={18} className="text-primary" />
            <h1 className="font-semibold tracking-tight">Submission Manager</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs font-mono text-muted bg-surface-muted px-2 py-1 rounded border border-border">
            PROTOTYPE MODE
          </div>
          <Link
            href="/admin/templates"
            className="text-sm font-medium text-muted hover:text-foreground transition-colors"
          >
            Email Templates
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Layout Area */}
      <main className="flex-1 flex overflow-hidden p-6 gap-6 relative z-10">
        {/* Left Panel: Submission List */}
        <div
          className={`transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex shrink-0 ${
            selectedId ? "w-80" : "w-full max-w-2xl mx-auto"
          }`}
        >
          <div
            className={`flex flex-col w-full h-full rounded-2xl glass shadow-2xl overflow-hidden`}
          >
            <SubmissionList
              submissions={MOCK_SUBMISSIONS}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
        </div>

        {/* Center & Right Panels: Detail View - Only visible when selected */}
        {selectedId && selectedSubmission && (
          <>
            {/* Center: Details */}
            <div className="flex-1 min-w-0 glass rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-300 slide-in-from-right-10">
              <SubmissionDetail submission={selectedSubmission} />
            </div>

            {/* Right: Actions */}
            <div className="shrink-0 animate-in fade-in slide-in-from-right-20 duration-500 delay-100">
              <div className="h-full rounded-2xl overflow-hidden glass shadow-2xl">
                <ActionPanel submission={selectedSubmission} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
