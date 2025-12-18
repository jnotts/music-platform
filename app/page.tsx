"use client";

import Link from "next/link";
import { useState, useRef, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Upload,
  Plus,
  Check,
  Loader2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

import { InstagramIcon, SpotifyIcon, SoundCloudIcon } from "@/components/icons";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useSubmitDemo } from "@/hooks/useSubmitDemo";
import { artistSchema, type ArtistInput } from "@/lib/schemas/submission";
import { UPLOAD_CONFIG } from "@/lib/validation/upload";
import SocialInput from "@/components/SocialInput";
import { TrackCard, type TrackMetadata } from "@/components/TrackCard";
import { ThemeToggle } from "@/components/ThemeToggle";

interface SubmissionResult {
  submission_id: string;
  artist_id: string;
  tracks_count: number;
}

export default function ArtistSubmissionPage() {
  const [showSocialsManual, setShowSocialsManual] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [submissionResult, setSubmissionResult] =
    useState<SubmissionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File upload hook
  const fileUpload = useFileUpload();

  // Submission mutation
  const submitMutation = useSubmitDemo();

  // Track metadata state (keyed by upload ID)
  const [trackMetadata, setTrackMetadata] = useState<
    Record<string, TrackMetadata>
  >({});

  // Artist form with react-hook-form
  const form = useForm<ArtistInput>({
    resolver: zodResolver(artistSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      bio: "",
      instagram_url: "",
      soundcloud_url: "",
      spotify_url: "",
    },
  });

  // Initialize track metadata when new uploads are added
  useEffect(() => {
    setTrackMetadata((prev) => {
      const uploadIds = new Set(fileUpload.uploads.map((u) => u.id));
      const updated = { ...prev };
      let hasChanges = false;

      // Add metadata for new uploads
      fileUpload.uploads.forEach((upload) => {
        if (!updated[upload.id]) {
          updated[upload.id] = {
            title: upload.file.name.replace(/\.[^/.]+$/, ""), // Remove extension
            genre: "",
            bpm: "",
            key: "",
            description: "",
          };
          hasChanges = true;
        }
      });

      // Remove metadata for uploads that no longer exist
      for (const id of Object.keys(updated)) {
        if (!uploadIds.has(id)) {
          delete updated[id];
          hasChanges = true;
        }
      }

      return hasChanges ? updated : prev;
    });
  }, [fileUpload.uploads]);

  // Update track metadata
  const updateTrackMetadata = (
    uploadId: string,
    field: keyof TrackMetadata,
    value: string,
  ) => {
    setTrackMetadata((prev) => ({
      ...prev,
      [uploadId]: { ...prev[uploadId], [field]: value },
    }));
  };

  // Handle file selection
  const handleFileSelect = useCallback(
    (files: FileList | File[] | null) => {
      if (!files || files.length === 0) return;
      fileUpload.addFiles(files);
    },
    [fileUpload],
  );

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect],
  );

  // Form submission
  const handleSubmit = async (artistData: ArtistInput) => {
    // Validate uploads
    if (fileUpload.uploads.length === 0) {
      return; // Form button is disabled, but extra safety
    }

    if (fileUpload.isUploading) {
      return; // Still uploading
    }

    if (fileUpload.hasErrors) {
      return; // Has upload errors
    }

    // Build tracks array
    const tracks = fileUpload.completedUploads.map((upload) => {
      const meta = trackMetadata[upload.id];
      return {
        storage_path: upload.storagePath!,
        filename: upload.file.name,
        mime_type: upload.file.type || "application/octet-stream",
        size_bytes: upload.file.size,
        title: meta?.title?.trim() || upload.file.name.replace(/\.[^/.]+$/, ""),
        genre: meta?.genre || null,
        bpm: meta?.bpm ? parseInt(meta.bpm, 10) || null : null,
        key: meta?.key || null,
        description: meta?.description || null,
      };
    });

    // Validate track titles
    if (tracks.some((t) => !t.title)) {
      return; // Missing titles
    }

    // Submit using mutation
    submitMutation.mutate(
      { artist: artistData, tracks },
      {
        onSuccess: (data) => {
          setSubmissionResult(data);
        },
      },
    );
  };

  const hasTracks = fileUpload.uploads.length > 0;

  // Auto-expand socials if there are validation errors OR user toggled OR has content
  const hasSocialErrors =
    !!form.formState.errors.instagram_url ||
    !!form.formState.errors.spotify_url ||
    !!form.formState.errors.soundcloud_url;
  const hasSocialContent =
    form.watch("instagram_url") ||
    form.watch("spotify_url") ||
    form.watch("soundcloud_url");
  const showSocials = showSocialsManual || hasSocialErrors || hasSocialContent;

  // SUCCESS STATE
  if (submissionResult) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 font-sans text-foreground dark:text-[#F5F3EE]">
        <div className="max-w-md text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-success/10 text-success">
            <Check size={40} />
          </div>
          <h1 className="mb-4 text-3xl font-bold">Submission Received!</h1>
          <p className="mb-6 text-muted">
            Thank you for submitting your demo. Our A&R team will review your{" "}
            {submissionResult.tracks_count} track
            {submissionResult.tracks_count > 1 ? "s" : ""} and get back to you
            soon.
          </p>
          <p className="mb-8 text-sm text-muted/70">
            Submission ID:{" "}
            <span className="font-mono">
              {submissionResult.submission_id.slice(0, 8)}
            </span>
          </p>
          <button
            onClick={() => {
              setSubmissionResult(null);
              fileUpload.clearAll();
              form.reset();
              setTrackMetadata({});
            }}
            className="btn-primary"
          >
            Submit Another Demo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-foreground transition-colors duration-500 dark:text-[#F5F3EE]">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={UPLOAD_CONFIG.allowedExtensions.join(",")}
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      {/* Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div
        className={`mx-auto px-6 transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
          hasTracks
            ? "max-w-[1400px] pt-12 pb-32"
            : "flex min-h-screen max-w-4xl flex-col justify-center"
        }`}
      >
        {/* Header */}
        <header
          className={`text-center transition-all duration-700 md:text-left ${
            hasTracks ? "mb-10" : "-mt-20 mb-16"
          }`}
        >
          <div
            className={`mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-all md:mx-0 ${
              hasTracks ? "opacity-100" : "scale-110"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/50 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
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
            className={`mx-auto mt-4 max-w-xl text-muted transition-all duration-700 md:mx-0 ${
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
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`group relative flex h-64 cursor-pointer flex-col items-center justify-center gap-6 rounded-3xl border-2 border-dashed transition-all duration-300 ${
              isDragging
                ? "scale-[1.02] border-primary bg-primary/10"
                : "border-border bg-surface-muted backdrop-blur-sm hover:scale-[1.01] hover:border-primary hover:bg-primary/5 dark:border-white/10"
            }`}
          >
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-500 ${
                isDragging
                  ? "scale-110 rotate-3"
                  : "group-hover:scale-110 group-hover:rotate-3"
              }`}
            >
              <Upload size={40} />
            </div>
            <div className="space-y-2 text-center">
              <p className="text-xl font-medium">
                {isDragging
                  ? "Drop your files here"
                  : "Drop your tracks here or click to browse"}
              </p>
              <p className="text-sm text-muted">
                Supported:{" "}
                {UPLOAD_CONFIG.allowedExtensions.join(", ").toUpperCase()} (Max{" "}
                {UPLOAD_CONFIG.maxFileSizeMB}
                MB)
              </p>
            </div>
          </div>
        )}

        {/* STATE B: Active Dashboard */}
        {hasTracks && (
          <form
            id="submission-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="animate-in fade-in slide-in-from-bottom-8 grid gap-8 duration-700 lg:grid-cols-12"
          >
            {/* Left Column: Artist Profile */}
            <div className="space-y-6 lg:sticky lg:top-8 lg:col-span-4 lg:h-fit">
              <div className="glass p-6 backdrop-grayscale-0">
                <h2 className="mb-6 text-lg font-semibold">Artist Profile</h2>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="label">Artist / Band Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Neon Horizon"
                      className={`input ${
                        form.formState.errors.name ? "!border-error" : ""
                      }`}
                      {...form.register("name")}
                    />
                    {form.formState.errors.name && (
                      <p className="text-xs text-error">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="label">Contact Email *</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className={`input ${
                        form.formState.errors.email ? "!border-error" : ""
                      }`}
                      {...form.register("email")}
                    />
                    {form.formState.errors.email && (
                      <p className="text-xs text-error">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="label">Phone (Optional)</label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      className="input"
                      {...form.register("phone")}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="label">Bio / Pitch</label>
                    <textarea
                      rows={4}
                      placeholder="Tell us a bit about your project and these tracks..."
                      className="input resize-none"
                      {...form.register("bio")}
                    />
                  </div>

                  {/* Socials */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowSocialsManual(!showSocialsManual)}
                      className="flex w-full items-center justify-between text-xs font-semibold tracking-wider text-muted uppercase transition-colors hover:text-foreground dark:hover:text-white"
                    >
                      <span>
                        Social Profiles{" "}
                        {hasSocialErrors && (
                          <span className="text-error">*</span>
                        )}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${
                          showSocials ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {showSocials && (
                      <div className="animate-in fade-in slide-in-from-top-2 mt-4 space-y-3">
                        <div className="space-y-1">
                          <SocialInput
                            icon={<InstagramIcon />}
                            placeholder="Instagram URL"
                            className={
                              form.formState.errors.instagram_url
                                ? "!border-error"
                                : ""
                            }
                            {...form.register("instagram_url")}
                          />
                          {form.formState.errors.instagram_url && (
                            <p className="ml-1 text-xs text-error">
                              {form.formState.errors.instagram_url.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <SocialInput
                            icon={<SpotifyIcon />}
                            placeholder="Spotify URL"
                            className={
                              form.formState.errors.spotify_url
                                ? "!border-error"
                                : ""
                            }
                            {...form.register("spotify_url")}
                          />
                          {form.formState.errors.spotify_url && (
                            <p className="ml-1 text-xs text-error">
                              {form.formState.errors.spotify_url.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <SocialInput
                            icon={<SoundCloudIcon />}
                            placeholder="SoundCloud URL"
                            className={
                              form.formState.errors.soundcloud_url
                                ? "!border-error"
                                : ""
                            }
                            {...form.register("soundcloud_url")}
                          />
                          {form.formState.errors.soundcloud_url && (
                            <p className="ml-1 text-xs text-error">
                              {form.formState.errors.soundcloud_url.message}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Error */}
              {submitMutation.error && (
                <div className="animate-in fade-in slide-in-from-top-2 flex items-start gap-3 rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-error">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <span>{submitMutation.error.message}</span>
                </div>
              )}

              {/* Mobile Submit */}
              <div className="lg:hidden">
                <button
                  type="submit"
                  disabled={
                    submitMutation.isPending ||
                    fileUpload.isUploading ||
                    fileUpload.uploads.length === 0 ||
                    fileUpload.hasErrors
                  }
                  className="btn-primary flex w-full items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitMutation.isPending && (
                    <Loader2 className="animate-spin" size={16} />
                  )}
                  {submitMutation.isPending
                    ? "Submitting..."
                    : fileUpload.isUploading
                      ? "Uploading..."
                      : "Submit Demo"}
                </button>
              </div>
            </div>

            {/* Right Column: Tracks Grid */}
            <div className="lg:col-span-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  Uploaded Tracks{" "}
                  <span className="ml-2 text-sm font-normal text-muted">
                    ({fileUpload.uploads.length}/
                    {UPLOAD_CONFIG.maxTracksPerSubmission})
                  </span>
                </h2>
                {fileUpload.isUploading && (
                  <span className="text-xs tracking-wider text-primary uppercase">
                    Uploading... {fileUpload.overallProgress}%
                  </span>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {fileUpload.uploads.map((upload) => (
                  <TrackCard
                    key={upload.id}
                    upload={upload}
                    metadata={trackMetadata[upload.id]}
                    onMetadataChange={(field, value) =>
                      updateTrackMetadata(upload.id, field, value)
                    }
                    onRemove={() => fileUpload.removeUpload(upload.id)}
                    onRetry={() => fileUpload.retryUpload(upload.id)}
                  />
                ))}

                {/* Add More Card */}
                {fileUpload.uploads.length <
                  UPLOAD_CONFIG.maxTracksPerSubmission && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`group flex min-h-[250px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed p-4 text-muted transition-all hover:text-primary ${
                      isDragging
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 hover:bg-primary/5 dark:border-white/10"
                    }`}
                  >
                    <Plus size={28} />
                    <span className="mt-3 text-xs font-semibold tracking-wider uppercase">
                      Add More
                    </span>
                    <span className="mt-1 text-center text-xs opacity-70">
                      Max {UPLOAD_CONFIG.maxTracksPerSubmission} Tracks <br />
                      (50MB limit per file)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Footer */}
      <footer className="glass fixed right-0 bottom-0 left-0 hidden border-0 lg:block">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
          <Link
            href="/login"
            className="text-xs font-medium text-muted transition-colors hover:text-foreground dark:hover:text-white"
          >
            Admin Access
          </Link>
          {hasTracks ? (
            <button
              type="submit"
              form="submission-form"
              disabled={
                submitMutation.isPending ||
                fileUpload.isUploading ||
                fileUpload.uploads.length === 0 ||
                fileUpload.hasErrors
              }
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {submitMutation.isPending && <Loader2 className="animate-spin" />}
              {submitMutation.isPending
                ? "Submitting..."
                : fileUpload.isUploading
                  ? "Uploading..."
                  : "Submit Demo"}
            </button>
          ) : (
            <div />
          )}
        </div>
      </footer>
    </div>
  );
}
