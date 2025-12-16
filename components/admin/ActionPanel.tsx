import { AdminSubmission } from "@/types/admin-submission";
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
}

export function ActionPanel({ submission }: ActionPanelProps) {
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

  // Reset form when submission changes
  useEffect(() => {
    form.reset({
      grade: submission.rating || 0,
      internal_notes: submission.internalNotes || "",
      feedback_for_artist: submission.feedback || "",
    });
    setError(null);
  }, [submission, form]);

  const handleStatusToggle = async () => {
    const newStatus =
      submission.status === "in_review" ? "pending" : "in_review";
    await updateStatus({ id: submission.id, status: newStatus });
  };

  const handleAction = async (action: "approved" | "rejected") => {
    setError(null);
    form.clearErrors(); // Clear previous errors
    const data = form.getValues();

    // Manual Validation based on action
    if (action === "approved") {
      if (!data.grade || data.grade < 1) {
        form.setError("grade", { message: "Rating required for approval" });
        return;
      }
    }

    if (action === "rejected") {
      if (!data.feedback_for_artist || data.feedback_for_artist.length < 5) {
        form.setError("feedback_for_artist", {
          message: "Feedback required for rejection (min 5 chars)",
        });
        return;
      }
    }

    try {
      // 1. Save Review First
      await saveReview({
        submissionId: submission.id,
        data: {
          grade: data.grade || 0,
          internal_notes: data.internal_notes || undefined,
          feedback_for_artist: data.feedback_for_artist || undefined,
        },
      });

      // 2. Update Status
      await updateStatus({ id: submission.id, status: action });
    } catch (err) {
      console.error(err);
      setError("Failed to update submission. Please try again.");
    }
  };

  // Just save review without changing status
  const handleSaveDraft = async () => {
    setError(null);
    form.clearErrors(); // Clear previous errors
    try {
      const data = form.getValues();
      await saveReview({
        submissionId: submission.id,
        data: {
          grade: data.grade || 0,
          internal_notes: data.internal_notes || undefined,
          feedback_for_artist: data.feedback_for_artist || undefined,
        },
      });
      // Optional: show toast
    } catch (err) {
      console.error(err);
      setError("Failed to save draft. Please try again.");
    }
  };

  const grade = form.watch("grade");
  const isPending = isUpdatingStatus || isSavingReview;

  return (
    <div className="w-full h-full border-l border-border flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-border bg-surface/30 backdrop-blur-md sticky top-0 z-10 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted">
            Review
          </h3>
          {/* Status Transition Button - Immediate Action */}
          {(submission.status === "pending" ||
            submission.status === "in_review") && (
            <button
              type="button"
              onClick={handleStatusToggle}
              disabled={isPending}
              className="text-xs cursor-pointer flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-muted hover:text-foreground transition-colors border border-white/5 disabled:opacity-50"
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
            onClick={() => handleAction("approved")}
            disabled={isPending}
            className={`flex-1 rounded-lg p-2 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 ${
              submission.status === "approved"
                ? "bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20 border-transparent font-medium"
                : "bg-surface hover:bg-green-500/10 hover:border-green-500/50 border-border text-muted hover:text-green-500"
            }`}
          >
            <Check size={16} />
            Approve
          </button>
          <button
            onClick={() => handleAction("rejected")}
            disabled={isPending}
            className={`flex-1 rounded-lg p-2 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 ${
              submission.status === "rejected"
                ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 border-transparent font-medium"
                : "bg-surface hover:bg-red-500/10 hover:border-red-500/50 border-border text-muted hover:text-red-500"
            }`}
          >
            <X size={16} />
            Reject
          </button>
        </div>

        {/* Global Errors */}
        {error && (
          <p className="text-xs text-red-500 bg-red-500/10 p-2 rounded border border-red-500/20">
            {error}
          </p>
        )}

        {/* Field Validation Errors */}
        {form.formState.errors.grade && (
          <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
            <AlertCircle size={10} /> {form.formState.errors.grade?.message}
          </p>
        )}
        {form.formState.errors.feedback_for_artist && (
          <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
            <AlertCircle size={10} />{" "}
            {form.formState.errors.feedback_for_artist?.message}
          </p>
        )}
      </div>

      <div className="p-6 space-y-8 flex-1">
        {/* Rating */}
        <div
          className={`space-y-3 transition-opacity duration-300 ${
            submission.status === "rejected"
              ? "opacity-50 pointer-events-none"
              : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <label className="label">Rating (1-10)</label>
            <span className="text-xs font-mono text-muted bg-surface-muted px-2 py-0.5 rounded">
              {grade && grade > 0 ? grade : "-"} / 10
            </span>
          </div>

          <div className="flex items-center gap-1 justify-between px-1">
            <button
              type="button"
              onClick={() =>
                form.setValue("grade", Math.max(0, (grade || 0) - 1))
              }
              className="w-8 h-8 rounded-full bg-surface hover:bg-white/10 flex items-center justify-center text-muted hover:text-foreground transition-colors"
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
                      ? "text-yellow-400 fill-yellow-400"
                      : (grade || 0) >= star * 2 - 1
                      ? "text-yellow-400 fill-yellow-400 opacity-50"
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
              className="w-8 h-8 rounded-full bg-surface hover:bg-white/10 flex items-center justify-center text-muted hover:text-foreground transition-colors"
            >
              +
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            className="w-full accent-primary h-1 bg-surface-muted rounded-lg appearance-none cursor-pointer"
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
            <span className="text-muted/50 text-xs ml-auto">
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
      <div className="p-4 border-t border-border bg-surface/50 backdrop-blur-md sticky bottom-0">
        <button
          onClick={() => handleSaveDraft()}
          disabled={isPending}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-medium transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
        >
          {isSavingReview && <Loader2 className="animate-spin" size={16} />}
          {isSavingReview ? "Saving..." : "Submit Review"}
        </button>
      </div>
    </div>
  );
}
