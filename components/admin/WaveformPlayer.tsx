import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Play, Pause, Loader2 } from "lucide-react";

interface WaveformPlayerProps {
  url: string;
  height?: number;
  waveColor?: string;
  progressColor?: string;
}

export function WaveformPlayer({
  url,
  height = 40,
  waveColor = "rgba(255, 255, 255, 0.2)",
  progressColor = "#3b82f6", // tailwind blue-500
}: WaveformPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize WaveSurfer
  useEffect(() => {
    if (!containerRef.current) return;

    wavesurfer.current = WaveSurfer.create({
      container: containerRef.current,
      waveColor,
      progressColor,
      height,
      cursorWidth: 0,
      barWidth: 2,
      barGap: 3,
      barRadius: 3,
      normalize: true,
      url: url, // Load directly from URL
    });

    wavesurfer.current.on("ready", () => {
      setIsLoading(false);
    });

    wavesurfer.current.on("play", () => setIsPlaying(true));
    wavesurfer.current.on("pause", () => setIsPlaying(false));
    wavesurfer.current.on("finish", () => setIsPlaying(false));

    return () => {
      wavesurfer.current?.destroy();
    };
  }, [url, height, waveColor, progressColor]);

  const togglePlay = () => {
    wavesurfer.current?.playPause();
  };

  return (
    <div className="flex w-full items-center gap-4">
      <button
        onClick={togglePlay}
        disabled={isLoading}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary transition-all hover:bg-primary hover:text-white disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : isPlaying ? (
          <Pause size={18} fill="currentColor" />
        ) : (
          <Play size={18} fill="currentColor" className="ml-0.5" />
        )}
      </button>

      <div ref={containerRef} className="w-full flex-1" />
    </div>
  );
}
