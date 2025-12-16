import { getTrackUrl } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";

export function useTrackUrl(trackId: string | undefined) {
  return useQuery({
    queryKey: ["track-url", trackId],
    queryFn: () => getTrackUrl(trackId!),
    enabled: !!trackId,
    staleTime: 1000 * 60 * 55, // 55 minutes (signed URLs last 60 mins)
  });
}
