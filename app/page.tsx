"use client";

import Link from "next/link";
import { useState } from "react";
import { useTheme } from "next-themes";
import { InstagramIcon, SpotifyIcon, SoundCloudIcon } from "@/components/icons";

type UploadStatus = "uploading" | "processing" | "complete" | "error";

interface Track {
  id: string;
  filename: string;
  size: string;
  status: UploadStatus;
  progress: number;
  title: string;
  genre: string;
  bpm: string;
  key: string;
}

export default function ArtistSubmissionPrototype() {
  const { theme, setTheme } = useTheme();
  const [showSocials, setShowSocials] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);

  const addDummyTrack = () => {
    if (tracks.length >= 5) return;

    const newTrack: Track = {
      id: Math.random().toString(36).substr(2, 9),
      filename: `Demo_Track_${tracks.length + 1}.wav`,
      size: "32.5 MB",
      status: "uploading",
      progress: 0,
      title: "",
      genre: "",
      bpm: "",
      key: "",
    };

    setTracks((prev) => [...prev, newTrack]);

    // Simulate upload progress
    setTimeout(() => {
      setTracks((prev) =>
        prev.map((t) => (t.id === newTrack.id ? { ...t, progress: 35 } : t))
      );
    }, 500);
    setTimeout(() => {
      setTracks((prev) =>
        prev.map((t) => (t.id === newTrack.id ? { ...t, progress: 70 } : t))
      );
    }, 1500);
    setTimeout(() => {
      setTracks((prev) =>
        prev.map((t) =>
          t.id === newTrack.id ? { ...t, progress: 100, status: "complete" } : t
        )
      );
    }, 2500);
  };

  const hasTracks = tracks.length > 0;

  return (
    <div className="min-h-screen font-sans transition-colors duration-500 text-foreground dark:text-[#F5F3EE]">
      {/* Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium backdrop-blur-md transition-all border border-border bg-surface/60 hover:bg-surface dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/20"
        >
          {theme === "dark" ? (
            <>
              <SunIcon />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <MoonIcon />
              <span>Dark Mode</span>
            </>
          )}
        </button>
      </div>

      <div
        className={`mx-auto px-6 transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
          hasTracks
            ? "max-w-[1400px] pt-12 pb-32"
            : "max-w-4xl flex flex-col justify-center min-h-screen"
        }`}
      >
        {/* Header */}
        <header
          className={`text-center transition-all duration-700 md:text-left ${
            hasTracks ? "mb-10" : "mb-16 -mt-20"
          }`}
        >
          <div
            className={`inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-6 mx-auto md:mx-0 transition-all ${
              hasTracks ? "opacity-100" : "scale-110"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/50 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            MELOTECH RECORDS
          </div>

          <h1
            className={`font-bold tracking-tight transition-all duration-700 ${
              hasTracks ? "text-3xl md:text-4xl" : "text-5xl md:text-7xl"
            }`}
          >
            Submit Your Demos
          </h1>

          <p
            className={`mx-auto md:mx-0 mt-4 max-w-xl text-muted transition-all duration-700 ${
              hasTracks ? "text-lg" : "text-xl md:text-2xl"
            }`}
          >
            {
              "We're looking for the next wave of sound. Upload your best unreleased tracks for A&R review."
            }
          </p>
        </header>

        {/* STATE A: Initial Dropzone */}
        {!hasTracks && (
          <div
            onClick={addDummyTrack}
            className="group relative flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all duration-300 hover:scale-[1.01] hover:border-primary hover:bg-primary/5 h-64 gap-6 bg-surface-muted border-border dark:bg-white/[0.02] dark:border-white/10"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UploadIcon size={40} />
            </div>
            <div className="text-center space-y-2">
              <p className="text-xl font-medium">
                Drop your tracks here or click to browse
              </p>
              <p className="text-sm text-muted">
                Supported: WAV, MP3, AIFF, M4A (Max 50MB)
              </p>
            </div>
          </div>
        )}

        {/* STATE B: Active Dashboard */}
        {hasTracks && (
          <div className="grid gap-8 lg:grid-cols-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Left Column: Artist Profile */}
            <div className="space-y-6 lg:col-span-4 lg:sticky lg:top-8 lg:h-fit">
              <div className="card !p-6">
                <h2 className="mb-6 text-lg font-semibold">Artist Profile</h2>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="label">Artist / Band Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Neon Horizon"
                      className="input"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="label">Contact Email</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="input"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="label">Phone (Optional)</label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      className="input"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="label">Bio / Pitch</label>
                    <textarea
                      rows={4}
                      placeholder="Tell us a bit about your project and these tracks..."
                      className="input resize-none"
                    />
                  </div>

                  {/* Socials */}
                  <div className="pt-2">
                    <button
                      onClick={() => setShowSocials(!showSocials)}
                      className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted hover:text-foreground dark:hover:text-white transition-colors"
                    >
                      <span>Social Profiles</span>
                      <ChevronIcon rotated={showSocials} />
                    </button>

                    {showSocials && (
                      <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                        <SocialInput
                          icon={<InstagramIcon />}
                          placeholder="Instagram URL"
                        />
                        <SocialInput
                          icon={<SpotifyIcon />}
                          placeholder="Spotify URL"
                        />
                        <SocialInput
                          icon={<SoundCloudIcon />}
                          placeholder="SoundCloud URL"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile Submit */}
              <div className="lg:hidden">
                <button className="btn-primary w-full">Submit Demo</button>
              </div>
            </div>

            {/* Right Column: Tracks Grid */}
            <div className="lg:col-span-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  Uploaded Tracks{" "}
                  <span className="text-muted text-sm font-normal ml-2">
                    ({tracks.length}/5)
                  </span>
                </h2>
                <span className="text-xs tracking-wider uppercase text-muted/50">
                  Auto-Detecting BPM/Key
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {tracks.map((track) => (
                  <div
                    key={track.id}
                    className={`card ${
                      track.status === "error" ? "!border-error/50" : ""
                    }`}
                  >
                    {/* Header */}
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-muted dark:bg-white/5">
                          <MusicIcon />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-medium truncate">
                            {track.filename}
                          </div>
                          <div className="text-[10px] text-muted">
                            {track.size}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setTracks((prev) =>
                            prev.filter((t) => t.id !== track.id)
                          )
                        }
                        className="text-muted hover:text-error transition-colors"
                      >
                        <CloseIcon />
                      </button>
                    </div>

                    {/* Progress */}
                    <div className="mb-5 space-y-1">
                      <div className="flex justify-between text-[10px] font-medium">
                        <span
                          className={
                            track.status === "uploading"
                              ? "text-primary"
                              : track.status === "complete"
                              ? "text-success"
                              : "text-muted"
                          }
                        >
                          {track.status === "uploading"
                            ? "Uploading..."
                            : track.status === "processing"
                            ? "Processing..."
                            : track.status === "complete"
                            ? "Ready"
                            : "Error"}
                        </span>
                        <span className="text-muted">{track.progress}%</span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-border dark:bg-white/5">
                        <div
                          className={`h-full transition-all duration-300 ease-out ${
                            track.status === "complete"
                              ? "bg-success"
                              : "bg-primary"
                          }`}
                          style={{ width: `${track.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="label">Title</label>
                        <input
                          type="text"
                          defaultValue={track.title}
                          placeholder="Track Title"
                          className="w-full bg-transparent py-1 text-sm font-medium outline-none border-b border-border focus:border-primary transition-colors placeholder:text-muted/30"
                        />
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        <div className="col-span-3 space-y-1">
                          <label className="label">Genre</label>
                          <input
                            type="text"
                            defaultValue={track.genre}
                            placeholder="Genre"
                            className="w-full bg-transparent py-1 text-sm outline-none border-b border-border focus:border-primary transition-colors placeholder:text-muted/30"
                          />
                        </div>
                        <div className="col-span-1 space-y-1">
                          <label className="label">BPM</label>
                          <input
                            type="text"
                            defaultValue={track.bpm}
                            placeholder="-"
                            className="w-full bg-transparent py-1 text-sm outline-none border-b border-border focus:border-primary transition-colors placeholder:text-muted/30 text-center"
                          />
                        </div>
                        <div className="col-span-1 space-y-1">
                          <label className="label">Key</label>
                          <input
                            type="text"
                            defaultValue={track.key}
                            placeholder="-"
                            className="w-full bg-transparent py-1 text-sm outline-none border-b border-border focus:border-primary transition-colors placeholder:text-muted/30 text-center"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add More Card */}
                {tracks.length < 5 && (
                  <div
                    onClick={addDummyTrack}
                    className="group bg-black/2 min-h-[250px] flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed text-muted hover:text-primary transition-all p-4 border-border hover:border-primary/50 hover:bg-primary/5 dark:border-white/10"
                  >
                    <PlusIcon />
                    <span className="mt-3 text-xs font-semibold uppercase tracking-wider">
                      Add Another
                    </span>
                    <span className="mt-1 text-[10px] opacity-70">
                      Max 5 Tracks
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {hasTracks && (
        <footer className="fixed bottom-0 left-0 right-0 glass border-0 hidden lg:block ">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
            <Link
              href="/admin/login"
              className="text-xs font-medium transition-colors text-muted hover:text-foreground dark:hover:text-white"
            >
              Admin Access
            </Link>
            <button className="btn-primary">Submit Demo</button>
          </div>
        </footer>
      )}
    </div>
  );
}

// ============================================
// ICONS (extracted for cleanliness)
// ============================================
const SunIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
  </svg>
);

const MoonIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const UploadIcon = ({ size = 24 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const MusicIcon = () => (
  <svg
    className="text-muted"
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

const ChevronIcon = ({ rotated }: { rotated: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`transition-transform duration-200 ${
      rotated ? "rotate-180" : ""
    }`}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const SocialInput = ({
  icon,
  placeholder,
}: {
  icon: React.ReactNode;
  placeholder: string;
}) => (
  <div className="flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors border-border bg-surface-muted dark:border-white/5 dark:bg-black/20 dark:focus-within:border-white/20">
    {icon}
    <input
      type="text"
      placeholder={placeholder}
      className="bg-transparent text-sm outline-none w-full placeholder:text-muted/30"
    />
  </div>
);
