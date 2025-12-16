import { Play, Pause, Music } from "lucide-react";
import { AdminTrack } from "@/types/admin-submission";
import { useState } from "react";

interface AdminTrackCardProps {
  track: AdminTrack;
}

export function AdminTrackCard({ track }: AdminTrackCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Generate random waveform bars for visual effect
  const waveformBars = Array.from({ length: 40 }, (_, i) => ({
    // eslint-disable-next-line react-hooks/purity
    height: Math.max(20, Math.random() * 100),
    delay: i * 0.05,
  }));

  return (
    <div className="glass group flex items-center gap-4 rounded-xl border border-white/5 bg-surface p-4 transition-colors hover:bg-white/10">
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="flex h-12 w-12 shrink-0 transform items-center justify-center rounded-full bg-primary/20 text-primary transition-all hover:scale-105 hover:bg-primary hover:text-white"
      >
        {isPlaying ? (
          <Pause size={20} fill="currentColor" />
        ) : (
          <Play size={20} fill="currentColor" className="ml-0.5" />
        )}
      </button>

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
          <div className="font-mono text-xs text-muted/50">03:45</div>
        </div>

        {/* Waveform Visualization */}
        <div className="flex h-8 items-end gap-[2px] opacity-50 transition-opacity group-hover:opacity-100">
          {waveformBars.map((bar, i) => (
            <div
              key={i}
              className={`nav-bar w-full rounded-full transition-all duration-300 ${
                isPlaying ? "animate-pulse bg-primary" : "bg-white/20"
              }`}
              style={{
                height: `${bar.height}%`,
                animationDelay: `${bar.delay}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
