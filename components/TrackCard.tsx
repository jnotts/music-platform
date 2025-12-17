import { Music, X } from "lucide-react";
import { formatBytes, formatEta } from "@/lib/validation/upload";
import type { FileUploadState } from "@/hooks/useFileUpload";

export interface TrackMetadata {
  title: string;
  genre: string;
  bpm: string;
  key: string;
  description: string;
}

interface TrackCardProps {
  upload: FileUploadState;
  metadata: TrackMetadata | undefined;
  onMetadataChange: (field: keyof TrackMetadata, value: string) => void;
  onRemove: () => void;
  onRetry: () => void;
}

export function TrackCard({
  upload,
  metadata,
  onMetadataChange,
  onRemove,
  onRetry,
}: TrackCardProps) {
  const isError = upload.status === "error";
  const isUploading = upload.status === "uploading";
  const isComplete = upload.status === "complete";

  return (
    <div className={`card glass ${isError ? "border-error/50!" : ""}`}>
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-muted dark:bg-white/5">
            <Music className="text-muted" size={20} />
          </div>
          <div className="min-w-0">
            <div className="truncate text-xs font-medium">
              {upload.file.name}
            </div>
            <div className="text-[10px] text-muted">
              {formatBytes(upload.file.size)}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-muted transition-colors hover:text-error"
        >
          <X size={16} />
        </button>
      </div>

      {/* Progress / Status */}
      <div className="mb-5 space-y-1">
        <div className="flex justify-between text-[10px] font-medium">
          <span
            className={
              isUploading
                ? "text-primary"
                : isComplete
                  ? "text-success"
                  : isError
                    ? "text-error"
                    : "text-muted"
            }
          >
            {isUploading
              ? `Uploading...${
                  upload.eta ? ` (${formatEta(upload.eta)} left)` : ""
                }`
              : isComplete
                ? "Ready"
                : isError
                  ? upload.error || "Error"
                  : "Waiting..."}
          </span>
          {(isUploading || isComplete) && (
            <span className="text-muted">{upload.progress}%</span>
          )}
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-border dark:bg-white/5">
          <div
            className={`h-full transition-all duration-300 ease-out ${
              isComplete ? "bg-success" : isError ? "bg-error" : "bg-primary"
            }`}
            style={{ width: `${upload.progress}%` }}
          />
        </div>
      </div>

      {/* Error retry button */}
      {isError && (
        <button
          type="button"
          onClick={onRetry}
          className="mb-4 text-xs text-primary hover:underline"
        >
          Retry upload
        </button>
      )}

      {/* Metadata Inputs */}
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="label">Title *</label>
          <input
            type="text"
            value={metadata?.title || ""}
            onChange={(e) => onMetadataChange("title", e.target.value)}
            placeholder="Track Title"
            className="w-full border-b border-border bg-transparent py-1 text-sm font-medium transition-colors outline-none placeholder:text-muted/30 focus:border-primary"
          />
        </div>
        <div className="grid grid-cols-5 gap-2">
          <div className="col-span-3 space-y-1">
            <label className="label">Genre</label>
            <input
              type="text"
              value={metadata?.genre || ""}
              onChange={(e) => onMetadataChange("genre", e.target.value)}
              placeholder="Genre"
              className="w-full border-b border-border bg-transparent py-1 text-sm transition-colors outline-none placeholder:text-muted/30 focus:border-primary"
            />
          </div>
          <div className="col-span-1 space-y-1">
            <label className="label">BPM</label>
            <input
              type="text"
              value={metadata?.bpm || ""}
              onChange={(e) => onMetadataChange("bpm", e.target.value)}
              placeholder="-"
              className="w-full border-b border-border bg-transparent py-1 text-center text-sm transition-colors outline-none placeholder:text-muted/30 focus:border-primary"
            />
          </div>
          <div className="col-span-1 space-y-1">
            <label className="label">Key</label>
            <input
              type="text"
              value={metadata?.key || ""}
              onChange={(e) => onMetadataChange("key", e.target.value)}
              placeholder="-"
              className="w-full border-b border-border bg-transparent py-1 text-center text-sm transition-colors outline-none placeholder:text-muted/30 focus:border-primary"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="label">Short Description</label>
          <textarea
            value={metadata?.description || ""}
            onChange={(e) => onMetadataChange("description", e.target.value)}
            placeholder="Key features, mood, or context..."
            rows={2}
            className="w-full resize-none border-b border-border bg-transparent py-1 text-sm transition-colors outline-none placeholder:text-muted/30 focus:border-primary"
          />
        </div>
      </div>
    </div>
  );
}
