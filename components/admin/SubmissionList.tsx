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
      className={`flex flex-col h-full transition-all duration-300 ${
        selectedId ? "w-80" : "w-full"
      } rounded-l-2xl overflow-hidden`}
    >
      {/* Header / Search */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg px-1">Submissions</h2>
          {selectedId && (
            <button
              onClick={() => setSelectedId(null)}
              className="underline text-muted/60 text-xs cursor-pointer"
            >
              Overview
            </button>
          )}
        </div>

        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            size={16}
          />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-surface-muted border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:border-primary outline-none transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex-1 flex cursor-pointer items-center justify-center gap-2 text-xs font-medium bg-surface-muted hover:bg-white/10 border border-border rounded-lg py-1.5 transition-colors">
            <Filter size={12} />
            Filter
          </button>
          <select className="flex-1 bg-surface-muted hover:bg-white/10 border border-border rounded-lg py-1.5 text-xs font-medium outline-none px-2 appearance-none text-center cursor-pointer">
            <option>Newest</option>
            <option>Oldest</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {submissions.map((sub) => (
          <button
            key={sub.id}
            onClick={() => setSelectedId(sub.id)}
            className={`w-full text-left p-3 cursor-pointer rounded-xl transition-all ${
              selectedId === sub.id
                ? "bg-primary/20 border-primary/30"
                : "hover:bg-white/40 border-transparent"
            } border group`}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="font-medium truncate pr-2">
                {sub.artist.name}
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wider ${
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
            <div className="text-xs text-muted truncate mb-2">
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
