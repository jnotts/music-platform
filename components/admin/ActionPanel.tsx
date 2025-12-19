import { AdminSubmission } from "@/lib/types/admin-submission";
import {
  Star,
  MessageSquare,
  Check,
  X,
  Send,
  Loader2,
  AlertCircle,
  ArrowRightLeft,
} from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reviewSchema, type ReviewInput } from "@/lib/schemas/review";
import {
  useUpdateSubmissionStatus,
  useSaveReview,
} from "@/hooks/useAdminSubmissions";
import { useEffect, useState } from "react";

interface ActionPanelProps {
  submission: AdminSubmission;
  initialReviewData?: ReviewInput | null;
}

export function ActionPanel({
  submission,
  initialReviewData,
}: ActionPanelProps) {
  const { mutateAsync: updateStatus, isPending: isUpdatingStatus } =
    useUpdateSubmissionStatus();
  const { mutateAsync: saveReview, isPending: isSavingReview } =
    useSaveReview();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema) as Resolver<ReviewInput>,
    defaultValues: {
      grade: submission.rating || 0,
      internal_notes: submission.internalNotes || "",
      feedback_for_artist: submission.feedback || "",
    },
  });

  // Track the intended status change locally
  const [targetStatus, setTargetStatus] = useState<
    "approved" | "rejected" | null
  >(
    submission.status === "approved" || submission.status === "rejected"
      ? submission.status
      : null,
  );

  // Sync with submission prop changes
  useEffect(() => {
    form.reset({
      grade: initialReviewData?.grade ?? submission.rating ?? 0,
      internal_notes:
        initialReviewData?.internal_notes ?? submission.internalNotes ?? "",
      feedback_for_artist:
        initialReviewData?.feedback_for_artist ?? submission.feedback ?? "",
    });
    setError(null);
    setTargetStatus(
      submission.status === "approved" || submission.status === "rejected"
        ? submission.status
        : null,
    );
  }, [submission, form, initialReviewData]);

  const handleStatusToggle = async () => {
    const newStatus =
      submission.status === "in_review" ? "pending" : "in_review";
    await updateStatus({ id: submission.id, status: newStatus });
  };

  const toggleTargetStatus = (status: "approved" | "rejected") => {
    setTargetStatus((prev) => (prev === status ? null : status));
    form.clearErrors(); // Clear previous errors
    if (error) setError(null);
  };

  const handleSubmit = async () => {
    setError(null);
    form.clearErrors(); // Clear previous errors
    const data = form.getValues();

    if (!targetStatus) {
      setError("Submission must be approved or rejected to review.");
      return;
    }

    // Validation only if a status is selected
    if (!data.grade || data.grade < 1) {
      form.setError("grade", { message: "Rating required for approval" });
      return;
    }

    if (targetStatus === "rejected") {
      if (!data.feedback_for_artist || data.feedback_for_artist.length < 5) {
        form.setError("feedback_for_artist", {
          message: "Feedback required for rejection (min 5 chars)",
        });
        return;
      }
    }

    try {
      // Single API call - save review with status
      await saveReview({
        submissionId: submission.id,
        data: {
          grade: data.grade || 0,
          internal_notes: data.internal_notes || undefined,
          feedback_for_artist: data.feedback_for_artist || undefined,
          status: targetStatus,
        },
      });

      // Optional: show toast
    } catch (err) {
      console.error(err);
      setError("Failed to submit review. Please try again.");
    }
  };

  const grade = form.watch("grade");
  const isPending = isUpdatingStatus || isSavingReview;

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto border-l border-border">
      {/* Header */}
      <div className="sticky top-0 z-10 space-y-4 border-b border-border bg-surface/30 p-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wider text-muted uppercase">
            Review
          </h3>
          {/* Status Transition Button - Immediate Action */}
          {(submission.status === "pending" ||
            submission.status === "in_review") && (
            <button
              type="button"
              onClick={handleStatusToggle}
              disabled={isPending}
              className="flex cursor-pointer items-center gap-1.5 rounded-md border border-white/5 bg-white/5 px-2 py-1 text-xs text-muted transition-colors hover:bg-white/10 hover:text-foreground disabled:opacity-50"
            >
              {isUpdatingStatus ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <ArrowRightLeft size={12} />
              )}
              {submission.status === "pending"
                ? "Mark In Review"
                : "Mark Pending"}
            </button>
          )}
        </div>

        {/* Status Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => toggleTargetStatus("approved")}
            disabled={isPending}
            className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg p-2 transition-all active:scale-95 ${
              targetStatus === "approved"
                ? "border-transparent bg-green-500 font-medium text-white shadow-lg shadow-green-500/20 hover:bg-green-600"
                : "border-border bg-surface text-muted hover:border-green-500/50 hover:bg-green-500/10 hover:text-green-500"
            }`}
          >
            <Check size={16} />
            Approve
          </button>
          <button
            onClick={() => toggleTargetStatus("rejected")}
            disabled={isPending}
            className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg p-2 transition-all active:scale-95 ${
              targetStatus === "rejected"
                ? "border-transparent bg-red-500 font-medium text-white shadow-lg shadow-red-500/20 hover:bg-red-600"
                : "border-border bg-surface text-muted hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-500"
            }`}
          >
            <X size={16} />
            Reject
          </button>
        </div>

        {/* Global Errors */}
        {error && (
          <p className="rounded border border-red-500/20 bg-red-500/10 p-2 text-xs text-red-500">
            {error}
          </p>
        )}

        {/* Field Validation Errors */}
        {form.formState.errors.grade && (
          <p className="mt-2 flex items-center gap-1 text-xs text-red-400">
            <AlertCircle size={10} /> {form.formState.errors.grade?.message}
          </p>
        )}
        {form.formState.errors.feedback_for_artist && (
          <p className="mt-2 flex items-center gap-1 text-xs text-red-400">
            <AlertCircle size={10} />{" "}
            {form.formState.errors.feedback_for_artist?.message}
          </p>
        )}
      </div>

      <div className="flex-1 space-y-8 p-6">
        {/* Rating */}
        <div className={`space-y-3 transition-opacity duration-300`}>
          <div className="flex items-center justify-between">
            <label className="label">Rating (1-10)</label>
            <span className="rounded bg-surface-muted px-2 py-0.5 font-mono text-xs text-muted">
              {grade && grade > 0 ? grade : "-"} / 10
            </span>
          </div>

          <div className="flex items-center justify-between gap-1 px-1">
            <button
              type="button"
              onClick={() =>
                form.setValue("grade", Math.max(0, (grade || 0) - 1))
              }
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-surface text-muted transition-colors hover:bg-white/10 hover:text-foreground"
            >
              -
            </button>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={`transition-colors ${
                    (grade || 0) >= star * 2
                      ? "fill-yellow-400 text-yellow-400"
                      : (grade || 0) >= star * 2 - 1
                        ? "fill-yellow-400 text-yellow-400 opacity-50"
                        : "text-muted/30"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                form.setValue("grade", Math.min(10, (grade || 0) + 1), {
                  shouldValidate: true,
                })
              }
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-surface text-muted transition-colors hover:bg-white/10 hover:text-foreground"
            >
              +
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-surface-muted accent-primary"
            {...form.register("grade", { valueAsNumber: true })}
          />
        </div>

        <div className="h-px bg-border/50" />

        {/* Inputs */}
        <div className="space-y-2">
          <label className="label flex items-center gap-2">
            <MessageSquare size={12} />
            Internal Notes
          </label>
          <textarea
            className="input min-h-[100px] resize-none text-sm"
            placeholder="Private notes for the team..."
            {...form.register("internal_notes")}
          ></textarea>
        </div>

        <div className="space-y-2">
          <label className="label flex items-center gap-2">
            <Send size={12} />
            Artist Feedback
            <span className="ml-auto text-xs text-muted/50">
              (Required for rejection)
            </span>
          </label>
          <textarea
            className={`input min-h-[100px] resize-none text-sm ${
              form.formState.errors.feedback_for_artist
                ? "border-red-500 focus:border-red-500"
                : ""
            }`}
            placeholder="Message to the artist..."
            {...form.register("feedback_for_artist")}
          ></textarea>
        </div>
      </div>

      {/* Save Action */}
      <div className="sticky bottom-0 border-t border-border bg-surface/50 p-4 backdrop-blur-md">
        <button
          onClick={() => handleSubmit()}
          disabled={isPending}
          className="text-primary-foreground btn-primary flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-medium shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
        >
          {isSavingReview && <Loader2 className="animate-spin" size={16} />}
          {isSavingReview ? "Saving..." : "Submit Review"}
        </button>
      </div>
    </div>
  );
}
