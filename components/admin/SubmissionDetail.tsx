import { AdminSubmission } from "@/types/admin-submission";
import { AdminTrackCard } from "./AdminTrackCard";
import { Mail } from "lucide-react";
import { InstagramIcon, SpotifyIcon, SoundCloudIcon } from "../icons";

interface SubmissionDetailProps {
  submission: AdminSubmission;
}

export function SubmissionDetail({ submission }: SubmissionDetailProps) {
  return (
    <div className="h-full flex-1 overflow-y-auto p-8">
      {/* Artist Profile Header */}
      <div className="mb-8 flex items-start gap-6">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-primary/10 text-3xl font-bold text-white shadow-lg">
          {submission.artist.name.charAt(0)}
        </div>
        <div className="flex-1">
          <h1 className="mb-1 text-3xl font-bold">{submission.artist.name}</h1>
          <div className="mb-4 flex items-center gap-4 text-sm text-muted">
            <a
              href={`mailto:${submission.artist.email}`}
              className="flex items-center gap-1.5 transition-colors hover:text-primary"
            >
              <Mail size={14} />
              {submission.artist.email}
            </a>
            {submission.artist.socials.instagram && (
              <a
                href="#"
                className="flex items-center gap-1.5 transition-colors hover:text-primary"
              >
                <InstagramIcon />
                Instagram
              </a>
            )}
            {submission.artist.socials.spotify && (
              <a
                href="#"
                className="flex items-center gap-1.5 transition-colors hover:text-primary"
              >
                <SpotifyIcon />
                Spotify
              </a>
            )}
            {submission.artist.socials.soundcloud && (
              <a
                href="#"
                className="flex items-center gap-1.5 transition-colors hover:text-primary"
              >
                <SoundCloudIcon />
                SoundCloud
              </a>
            )}
          </div>
          {submission.artist.bio && (
            <p className="max-w-2xl rounded-xl border border-white/50 bg-white/30 p-4 text-sm leading-relaxed text-muted">
              {submission.artist.bio}
            </p>
          )}
        </div>
      </div>

      {/* Tracks Section */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          Tracks
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-normal text-muted">
            {submission.tracks.length}
          </span>
        </h3>
        <div className="grid gap-3">
          {submission.tracks.map((track) => (
            <AdminTrackCard key={track.id} track={track} />
          ))}
        </div>
      </div>
    </div>
  );
}
