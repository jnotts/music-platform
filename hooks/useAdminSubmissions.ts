import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import {
  getAdminSubmissions,
  updateSubmissionStatus,
  saveReview,
  getReview,
} from "@/lib/api/client";
import type { SubmissionStatus } from "@/types/admin-submission";
import type { ReviewInput } from "@/lib/schemas/review";

export const ADMIN_SUBMISSIONS_KEY = ["admin-submissions"];

export function useAdminSubmissions() {
  return useQuery({
    queryKey: ADMIN_SUBMISSIONS_KEY,
    queryFn: getAdminSubmissions,
  });
}

/**
 * Hook to subscribe to realtime changes on the submissions table.
 * Invalidates the admin submissions query when changes occur.
 */
export function useSubscribeToSubmissions() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createBrowserClient();
    const channel = supabase
      .channel("admin-submissions")
      .on("broadcast", { event: "new-submission" }, (_payload) => {
        console.log(
          "Broadcast received (new-submission), invalidating admin submissions",
        );
        queryClient.invalidateQueries({ queryKey: ADMIN_SUBMISSIONS_KEY });
      })
      .on("broadcast", { event: "track-updated" }, (_payload) => {
        console.log(
          "Broadcast received (track-updated), invalidating admin submissions",
        );
        queryClient.invalidateQueries({ queryKey: ADMIN_SUBMISSIONS_KEY });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

export function useUpdateSubmissionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: SubmissionStatus }) =>
      updateSubmissionStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_SUBMISSIONS_KEY });
    },
  });
}

export function useSaveReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      submissionId,
      data,
    }: {
      submissionId: string;
      data: ReviewInput & { status: SubmissionStatus };
    }) => saveReview(submissionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_SUBMISSIONS_KEY });
    },
  });
}

export function useSubmissionReview(submissionId: string | null) {
  return useQuery({
    queryKey: ["review", submissionId],
    queryFn: () => (submissionId ? getReview(submissionId) : null),
    enabled: !!submissionId,
  });
}
