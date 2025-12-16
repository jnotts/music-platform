import { Search, Filter } from "lucide-react";
import { AdminSubmission } from "@/types/admin-submission";

interface SubmissionListProps {
  submissions: AdminSubmission[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  isCollapsed?: boolean;
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";

  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";

  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";

  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";

  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";

  return Math.floor(seconds) + " seconds ago";
}

export function SubmissionList({
  submissions,
  selectedId,
  setSelectedId,
  isCollapsed = false,
}: SubmissionListProps) {
  if (isCollapsed) return null;

  return (
    <div
      className={`flex h-full flex-col transition-all duration-300 ${
        selectedId ? "w-full xl:w-80" : "w-full"
      } overflow-hidden rounded-l-2xl`}
    >
      {/* Header / Search */}
      <div className="space-y-3 border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h2 className="px-1 text-lg font-semibold">Submissions</h2>
          {selectedId && (
            <button
              onClick={() => setSelectedId(null)}
              className="cursor-pointer text-xs text-muted/60 underline"
            >
              Overview
            </button>
          )}
        </div>

        <div className="relative">
          <Search
            className="absolute top-1/2 left-3 -translate-y-1/2 text-muted"
            size={16}
          />
          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded-lg border border-border bg-surface-muted py-2 pr-3 pl-9 text-sm transition-colors outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-surface-muted py-1.5 text-xs font-medium transition-colors hover:bg-white/10">
            <Filter size={12} />
            Filter
          </button>
          <select className="flex-1 cursor-pointer appearance-none rounded-lg border border-border bg-surface-muted px-2 py-1.5 text-center text-xs font-medium outline-none hover:bg-white/10">
            <option>Newest</option>
            <option>Oldest</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 space-y-1 overflow-y-auto p-2">
        {submissions.map((sub) => (
          <button
            key={sub.id}
            onClick={() => setSelectedId(sub.id)}
            className={`w-full cursor-pointer rounded-xl p-3 text-left transition-all ${
              selectedId === sub.id
                ? "border-primary/30 bg-primary/20"
                : "border-transparent hover:bg-white/40"
            } group border`}
          >
            <div className="mb-1 flex items-start justify-between">
              <span className="truncate pr-2 font-medium">
                {sub.artist.name}
              </span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium tracking-wider uppercase ${
                  sub.status === "pending"
                    ? "bg-yellow-500/20 text-yellow-200"
                    : sub.status === "in_review"
                      ? "bg-blue-500/20 text-blue-200"
                      : sub.status === "approved"
                        ? "bg-green-500/20 text-green-200"
                        : "bg-red-500/20 text-red-200"
                }`}
              >
                {sub.status.replace("_", " ")}
              </span>
            </div>
            <div className="mb-2 truncate text-xs text-muted">
              {sub.tracks.length} track{sub.tracks.length !== 1 && "s"} •{" "}
              {sub.tracks.map((t) => t.title).join(", ")}
            </div>
            <div className="text-[10px] text-muted/60">
              {formatTimeAgo(sub.submittedAt)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
