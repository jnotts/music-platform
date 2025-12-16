import { AdminSubmission, SubmissionStatus } from "@/types/admin-submission";
import { Star, MessageSquare, Check, X, Send } from "lucide-react";
import { useState } from "react";

interface ActionPanelProps {
  submission: AdminSubmission;
}

export function ActionPanel({ submission }: ActionPanelProps) {
  const [rating, setRating] = useState<number>(submission.rating || 0);
  const [status, setStatus] = useState<SubmissionStatus>(submission.status);

  return (
    <div className="w-full h-full border-l border-border flex flex-col overflow-y-auto">
      <div className="p-6 border-b border-border">
        <h3 className="font-semibold text-lg mb-4">Review</h3>

        {/* Status Selection */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {[
            {
              val: "approved",
              label: "Approve",
              icon: Check,
              color: "bg-green-500",
              text: "text-green-500",
            },
            {
              val: "rejected",
              label: "Reject",
              icon: X,
              color: "bg-red-500",
              text: "text-red-500",
            },
          ].map((opt) => (
            <button
              key={opt.val}
              onClick={() => setStatus(opt.val as SubmissionStatus)}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                status === opt.val
                  ? `${opt.color} text-white border-transparent shadow-lg shadow-${opt.color}/20`
                  : `bg-surface-muted hover:bg-white/5 border-transparent text-muted`
              }`}
            >
              <opt.icon size={16} />
              <span className="font-medium text-sm">{opt.label}</span>
            </button>
          ))}
        </div>

        {/* Grading */}
        <div className="mb-6">
          <label className="label mb-2 block">Rating (1-10)</label>
          <div className="flex items-center justify-between gap-1 p-3 bg-surface-muted rounded-xl border border-white/5">
            <button
              onClick={() => setRating(Math.max(1, rating - 1))}
              className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            >
              -
            </button>
            <div className="font-mono text-xl font-bold text-primary">
              {rating}
              <span className="text-sm text-muted font-normal">/10</span>
            </div>
            <button
              onClick={() => setRating(Math.min(10, rating + 1))}
              className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            >
              +
            </button>
          </div>
          {/* Visual Stars (just 5 for space, mapped to 10) */}
          <div className="flex justify-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={12}
                className={`${
                  rating >= star * 2
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-600"
                } transition-colors`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Feedback Forms */}
      <div className="p-6 space-y-4 flex-1">
        <div className="space-y-2">
          <label className="label flex items-center gap-2">
            <MessageSquare size={12} />
            Internal Notes
          </label>
          <textarea
            className="input min-h-[100px] resize-none text-sm"
            placeholder="Private notes for the team..."
            defaultValue={submission.internalNotes}
          ></textarea>
        </div>

        <div className="space-y-2">
          <label className="label flex items-center gap-2">
            <Send size={12} />
            Artist Feedback
          </label>
          <textarea
            className="input min-h-[100px] resize-none text-sm"
            placeholder="Message to the artist..."
            defaultValue={submission.feedback}
          ></textarea>
        </div>
      </div>

      {/* Submit Action */}
      <div className="p-4 border-t border-border bg-surface/50 backdrop-blur-md sticky bottom-0">
        <button className="btn-primary w-full shadow-lg shadow-primary/20">
          Save Review
        </button>
      </div>
    </div>
  );
}
