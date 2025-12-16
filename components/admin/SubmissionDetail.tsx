import { AdminSubmission } from "@/types/admin-submission";
import { AdminTrackCard } from "./AdminTrackCard";
import { Mail, Instagram, Globe, Music2 } from "lucide-react";

interface SubmissionDetailProps {
  submission: AdminSubmission;
}

export function SubmissionDetail({ submission }: SubmissionDetailProps) {
  return (
    <div className="flex-1 overflow-y-auto p-8 h-full">
      {/* Artist Profile Header */}
      <div className="flex items-start gap-6 mb-8">
        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/80 to-primary/10 shadow-lg flex items-center justify-center text-3xl font-bold text-white shrink-0">
          {submission.artist.name.charAt(0)}
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-1">{submission.artist.name}</h1>
          <div className="flex items-center gap-4 text-muted text-sm mb-4">
            <a
              href={`mailto:${submission.artist.email}`}
              className="flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <Mail size={14} />
              {submission.artist.email}
            </a>
            {submission.artist.socials.instagram && (
              <a
                href="#"
                className="flex items-center gap-1.5 hover:text-primary transition-colors"
              >
                <Instagram size={14} />
                Instagram
              </a>
            )}
            {submission.artist.socials.soundcloud && (
              <a
                href="#"
                className="flex items-center gap-1.5 hover:text-primary transition-colors"
              >
                <Music2 size={14} />
                SoundCloud
              </a>
            )}
          </div>
          {submission.artist.bio && (
            <p className="text-sm text-muted leading-relaxed max-w-2xl bg-white/30 p-4 rounded-xl border border-white/50">
              {submission.artist.bio}
            </p>
          )}
        </div>
      </div>

      {/* Tracks Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          Tracks
          <span className="text-xs font-normal text-muted bg-white/10 px-2 py-0.5 rounded-full">
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
