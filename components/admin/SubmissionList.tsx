import { useState, useMemo, useEffect, useRef } from "react";
import { Search, Filter } from "lucide-react";
import { AdminSubmission } from "@/lib/types/admin-submission";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterMenuRef.current &&
        !filterMenuRef.current.contains(event.target as Node)
      ) {
        setShowFilterMenu(false);
      }
    }

    if (showFilterMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showFilterMenu]);

  const filteredAndSortedSubmissions = useMemo(() => {
    let filtered = [...submissions];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (sub) =>
          sub.artist.name.toLowerCase().includes(query) ||
          sub.tracks.some((track) => track.title.toLowerCase().includes(query)),
      );
    }

    // Apply status filter
    if (statusFilter.length > 0) {
      filtered = filtered.filter((sub) => statusFilter.includes(sub.status));
    }

    // Apply sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.submittedAt).getTime();
      const dateB = new Date(b.submittedAt).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [submissions, searchQuery, statusFilter, sortOrder]);

  if (isCollapsed) return null;

  const allStatuses = ["pending", "in_review", "approved", "rejected"];
  const toggleStatusFilter = (status: string) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-l-2xl transition-all duration-300">
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
            placeholder="Search artist or track..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-muted py-2 pr-3 pl-9 text-sm transition-colors outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-2">
          <div ref={filterMenuRef} className="relative flex-1">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border py-1.5 text-xs font-medium transition-colors ${
                statusFilter.length > 0
                  ? "border-primary bg-primary/20 text-primary"
                  : "border-border bg-surface-muted hover:bg-white/10"
              }`}
            >
              <Filter size={12} />
              Filter
              {statusFilter.length > 0 && (
                <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px]">
                  {statusFilter.length}
                </span>
              )}
            </button>
            {showFilterMenu && (
              <div className="absolute top-full left-0 z-10 mt-1 w-48 rounded-lg border border-border bg-background shadow-lg">
                <div className="p-2">
                  <div className="mb-2 flex items-center justify-between px-2">
                    <span className="text-xs font-medium">Status</span>
                    {statusFilter.length > 0 && (
                      <button
                        onClick={() => setStatusFilter([])}
                        className="text-[10px] text-primary hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {allStatuses.map((status) => (
                    <label
                      key={status}
                      className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-black/10"
                    >
                      <input
                        type="checkbox"
                        checked={statusFilter.includes(status)}
                        onChange={() => toggleStatusFilter(status)}
                        className="cursor-pointer"
                      />
                      <span className="capitalize">
                        {status.replace("_", " ")}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          <select
            value={sortOrder}
            onChange={(e) =>
              setSortOrder(e.target.value as "newest" | "oldest")
            }
            className="flex-1 cursor-pointer appearance-none rounded-lg border border-border bg-surface-muted px-2 py-1.5 text-center text-xs font-medium outline-none hover:bg-white/10"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 space-y-1 overflow-y-auto p-2">
        {filteredAndSortedSubmissions.length === 0 ? (
          <div className="flex h-full items-center justify-center p-8 text-center">
            <p className="text-sm text-muted">
              {searchQuery || statusFilter.length > 0
                ? "No submissions match your filters"
                : "No submissions yet"}
            </p>
          </div>
        ) : (
          filteredAndSortedSubmissions.map((sub) => (
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
                      ? "bg-yellow-500/20 text-yellow-600"
                      : sub.status === "in_review"
                        ? "bg-blue-500/20 text-blue-600"
                        : sub.status === "approved"
                          ? "bg-green-500/20 text-green-600"
                          : "bg-red-500/20 text-red-600"
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
          ))
        )}
      </div>
    </div>
  );
}
