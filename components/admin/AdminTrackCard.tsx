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
    <div className="bg-surface glass border border-white/5 rounded-xl p-4 flex items-center gap-4 group hover:bg-white/10 transition-colors">
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="h-12 w-12 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 hover:bg-primary hover:text-white transition-all transform hover:scale-105"
      >
        {isPlaying ? (
          <Pause size={20} fill="currentColor" />
        ) : (
          <Play size={20} fill="currentColor" className="ml-0.5" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h4 className="font-medium text-sm truncate">{track.title}</h4>
            <div className="text-xs text-muted flex gap-2">
              {track.genre && <span>{track.genre}</span>}
              {track.bpm && <span>• {track.bpm} BPM</span>}
              {track.key && <span>• {track.key}</span>}
            </div>
          </div>
          <div className="text-xs font-mono text-muted/50">03:45</div>
        </div>

        {/* Waveform Visualization */}
        <div className="h-8 flex items-end gap-[2px] opacity-50 group-hover:opacity-100 transition-opacity">
          {waveformBars.map((bar, i) => (
            <div
              key={i}
              className={`nav-bar w-full rounded-full transition-all duration-300 ${
                isPlaying ? "bg-primary animate-pulse" : "bg-white/20"
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
