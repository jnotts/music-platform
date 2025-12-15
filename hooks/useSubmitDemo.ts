import { useMutation } from "@tanstack/react-query";
import { submitDemo, type SubmitDemoResponse } from "@/lib/api/client";
import type { CreateSubmissionInput } from "@/lib/schemas/submission";

export function useSubmitDemo() {
  return useMutation<SubmitDemoResponse, Error, CreateSubmissionInput>({
    mutationFn: submitDemo,
  });
}
