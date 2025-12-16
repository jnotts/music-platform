import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminSubmissions,
  updateSubmissionStatus,
  saveReview,
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
      data: ReviewInput;
    }) => saveReview(submissionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_SUBMISSIONS_KEY });
    },
  });
}
