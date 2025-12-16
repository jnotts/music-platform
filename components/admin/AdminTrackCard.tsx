import { Music } from "lucide-react";
import { AdminTrack } from "@/types/admin-submission";
import { WaveformPlayer } from "./WaveformPlayer";
import { useTrackUrl } from "@/hooks/useTrackUrl";

interface AdminTrackCardProps {
  track: AdminTrack;
}

export function AdminTrackCard({ track }: AdminTrackCardProps) {
  // We fetch the signed URL immediately so the waveform can render.
  // In a real optimized app with long lists, we might want to lazy load this or use pre-generated peaks.
  const {
    data: audioUrl,
    isLoading: isUrlLoading,
    error,
  } = useTrackUrl(track.id);

  return (
    <div className="glass group flex items-center gap-4 rounded-xl border border-white/5 bg-surface p-4 transition-colors hover:bg-white/10">
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h4 className="truncate text-sm font-medium">{track.title}</h4>
            <div className="flex gap-2 text-xs text-muted">
              {track.genre && <span>{track.genre}</span>}
              {track.bpm && <span>• {track.bpm} BPM</span>}
              {track.key && <span>• {track.key}</span>}
            </div>
          </div>
          <div className="font-mono text-xs text-muted/50">
            {track.duration || "--:--"}
          </div>
        </div>

        {/* Waveform Visualization & Player */}
        <div className="w-full">
          {isUrlLoading ? (
            <div className="flex h-10 items-center justify-center rounded bg-white/5 text-xs text-muted">
              Loading audio...
            </div>
          ) : error || !audioUrl ? (
            <div className="flex h-10 items-center justify-center rounded bg-red-500/10 text-xs text-red-500">
              Audio unavailable
            </div>
          ) : (
            <WaveformPlayer url={audioUrl} height={40} />
          )}
        </div>
      </div>
    </div>
  );
}
